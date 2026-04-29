import { Router, type IRouter } from "express";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import {
  db,
  orders,
  songRequests,
  songUpvotes,
} from "@workspace/db";
import {
  GetOverviewStatsResponse,
  GetTopFriendsQueryParams,
  GetTopFriendsResponse,
} from "@workspace/api-zod";
import { getWeekRange } from "../lib/week";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const { weekStart, weekEnd } = getWeekRange();

  const [{ orderCount }] = await db
    .select({ orderCount: sql<number>`COUNT(*)::int` })
    .from(orders);

  const [{ requestCount }] = await db
    .select({ requestCount: sql<number>`COUNT(*)::int` })
    .from(songRequests);

  const [{ friendCount }] = await db
    .select({ friendCount: sql<number>`COUNT(DISTINCT ${orders.handle})::int` })
    .from(orders);

  const [{ weekRequestCount }] = await db
    .select({ weekRequestCount: sql<number>`COUNT(*)::int` })
    .from(songRequests)
    .where(
      and(
        gte(songRequests.weekStart, weekStart),
        lt(songRequests.weekStart, weekEnd),
      ),
    );

  res.json(
    GetOverviewStatsResponse.parse({
      totalOrders: Number(orderCount ?? 0),
      totalRequests: Number(requestCount ?? 0),
      totalFriends: Number(friendCount ?? 0),
      currentWeekRequests: Number(weekRequestCount ?? 0),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    }),
  );
});

router.get("/stats/top-friends", async (req, res): Promise<void> => {
  const params = GetTopFriendsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const limit = params.data.limit ?? 5;
  const { weekStart, weekEnd } = getWeekRange();

  const rows = await db
    .select({
      handle: orders.handle,
      orderCount: sql<number>`COUNT(DISTINCT ${orders.id})::int`,
      requestCount: sql<number>`COUNT(DISTINCT ${songRequests.id})::int`,
      upvotesGiven: sql<number>`COALESCE((SELECT COUNT(*)::int FROM ${songUpvotes} WHERE ${songUpvotes.voterHandle} = ${orders.handle}), 0)`,
    })
    .from(orders)
    .leftJoin(
      songRequests,
      and(
        eq(songRequests.orderId, orders.id),
        gte(songRequests.weekStart, weekStart),
        lt(songRequests.weekStart, weekEnd),
      ),
    )
    .where(and(gte(orders.createdAt, weekStart), lt(orders.createdAt, weekEnd)))
    .groupBy(orders.handle)
    .orderBy(
      desc(sql`COUNT(DISTINCT ${songRequests.id})::int`),
      desc(sql`COUNT(DISTINCT ${orders.id})::int`),
    )
    .limit(limit);

  res.json(
    GetTopFriendsResponse.parse(
      rows.map((r) => ({
        handle: r.handle,
        orderCount: Number(r.orderCount ?? 0),
        requestCount: Number(r.requestCount ?? 0),
        upvotesGiven: Number(r.upvotesGiven ?? 0),
      })),
    ),
  );
});

export default router;
