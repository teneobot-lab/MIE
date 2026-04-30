import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, payments, orders, orderItems } from "@workspace/db";

const router: IRouter = Router();

// GET semua order dengan status payment (untuk kasir)
router.get("/kasir/orders", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: orders.id,
      handle: orders.handle,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(50);

  const result = await Promise.all(rows.map(async (order) => {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const [payment] = await db.select().from(payments).where(eq(payments.orderId, order.id));
    return { ...order, items, payment: payment ?? null };
  }));

  res.json(result);
});

// GET single order untuk struk
router.get("/kasir/orders/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) { res.status(404).json({ message: "Order not found" }); return; }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const [payment] = await db.select().from(payments).where(eq(payments.orderId, id));
  res.json({ ...order, items, payment: payment ?? null });
});

// POST create payment
router.post("/kasir/orders/:id/pay", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { method } = req.body;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) { res.status(404).json({ message: "Order not found" }); return; }
  const existing = await db.select().from(payments).where(eq(payments.orderId, id));
  if (existing[0]?.status === "paid") { res.status(400).json({ message: "Sudah dibayar" }); return; }
  if (existing[0]) {
    const [updated] = await db.update(payments)
      .set({ method: method ?? "cash", status: "paid", paidAt: new Date() })
      .where(eq(payments.orderId, id))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(payments)
      .values({ orderId: id, method: method ?? "cash", status: "paid", amount: order.total, paidAt: new Date() })
      .returning();
    res.json(created);
  }
});

// POST cancel payment
router.post("/kasir/orders/:id/cancel", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const existing = await db.select().from(payments).where(eq(payments.orderId, id));
  if (existing[0]) {
    await db.update(payments).set({ status: "cancelled" }).where(eq(payments.orderId, id));
  } else {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) { res.status(404).json({ message: "Order not found" }); return; }
    await db.insert(payments).values({ orderId: id, method: "cash", status: "cancelled", amount: order.total });
  }
  res.json({ message: "Cancelled" });
});

export default router;

// UPDATE status order (pending -> cooking -> done)
router.patch("/kasir/orders/:id/status", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!["pending", "cooking", "done"].includes(status)) {
    res.status(400).json({ message: "Status tidak valid" });
    return;
  }
  const [updated] = await db.update(orders)
    .set({ status })
    .where(eq(orders.id, id))
    .returning();
  if (!updated) { res.status(404).json({ message: "Order not found" }); return; }
  res.json(updated);
});
