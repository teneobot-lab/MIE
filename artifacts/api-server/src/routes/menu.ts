import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, menuItems } from "@workspace/db";
import {
  ListMenuQueryParams,
  ListMenuResponse,
  GetMenuItemParams,
  GetMenuItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/menu", async (req, res): Promise<void> => {
  const params = ListMenuQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const rows = params.data.category
    ? await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.category, params.data.category))
        .orderBy(asc(menuItems.id))
    : await db.select().from(menuItems).orderBy(asc(menuItems.id));

  res.json(ListMenuResponse.parse(rows));
});

router.get("/menu/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.id, params.data.id));

  if (!row) {
    res.status(404).json({ message: "Menu item not found" });
    return;
  }

  res.json(GetMenuItemResponse.parse(row));
});

export default router;
