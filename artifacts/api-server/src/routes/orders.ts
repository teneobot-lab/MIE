import { Router, type IRouter } from "express";
import { desc, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  menuItems,
  orders,
  orderItems,
  songRequests,
  songUpvotes,
} from "@workspace/db";
import {
  CreateOrderBody,
  ListRecentOrdersQueryParams,
  ListRecentOrdersResponse,
} from "@workspace/api-zod";
import { getWeekRange } from "../lib/week";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const { handle, items, songRequest } = parsed.data;

  const ids = items.map((i) => i.menuItemId);
  const menuRows = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, ids));
  const menuMap = new Map(menuRows.map((m) => [m.id, m]));

  for (const it of items) {
    if (!menuMap.has(it.menuItemId)) {
      res
        .status(400)
        .json({ message: `Menu item ${it.menuItemId} not found` });
      return;
    }
  }

  const total = items.reduce(
    (sum, it) => sum + (menuMap.get(it.menuItemId)!.price ?? 0) * it.quantity,
    0,
  );

  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({ handle, total })
      .returning();

    const insertedItems = await tx
      .insert(orderItems)
      .values(
        items.map((it) => {
          const m = menuMap.get(it.menuItemId)!;
          return {
            orderId: order.id,
            menuItemId: m.id,
            name: m.name,
            quantity: it.quantity,
            price: m.price,
          };
        }),
      )
      .returning();

    const { weekStart } = getWeekRange();
    let reqRow = null;
    if (songRequest && songRequest.title && songRequest.artist) {
      [reqRow] = await tx
        .insert(songRequests)
        .values({
          orderId: order.id,
          title: songRequest.title.trim(),
          artist: songRequest.artist.trim(),
          message: songRequest.message?.trim() || null,
          requesterHandle: handle,
          weekStart,
        })
        .returning();

    }
    return { order, items: insertedItems, songRequest: reqRow };
  });

  res.status(201).json({
    id: result.order.id,
    handle: result.order.handle,
    total: result.order.total,
    createdAt: result.order.createdAt.toISOString(),
    items: result.items.map((i) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    songRequest: result.songRequest ? {
      id: result.songRequest.id,
      title: result.songRequest.title,
      artist: result.songRequest.artist,
      message: result.songRequest.message,
      requesterHandle: result.songRequest.requesterHandle,
      upvotes: 0,
      requests: 1,
      score: 1,
      createdAt: result.songRequest.createdAt.toISOString(),
    } : null,
  });
});

router.get("/orders/recent", async (req, res): Promise<void> => {
  const params = ListRecentOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const limit = params.data.limit ?? 10;

  const rows = await db
    .select({
      id: orders.id,
      handle: orders.handle,
      total: orders.total,
      createdAt: orders.createdAt,
      itemCount: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
      songTitle: songRequests.title,
      songArtist: songRequests.artist,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .leftJoin(songRequests, eq(songRequests.orderId, orders.id))
    .groupBy(orders.id, songRequests.title, songRequests.artist)
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  const data = rows.map((r) => ({
    id: r.id,
    handle: r.handle,
    total: r.total,
    createdAt: r.createdAt.toISOString(),
    itemCount: r.itemCount ?? 0,
    songTitle: r.songTitle ?? "",
    songArtist: r.songArtist ?? "",
  }));

  res.json(ListRecentOrdersResponse.parse(data));
});

// Suppress unused import warnings for imports that are referenced only via
// helper imports above.
void songUpvotes;

export default router;
