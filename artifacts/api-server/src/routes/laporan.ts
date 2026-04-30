import { Router, type IRouter } from "express";
import { eq, gte, lte, and, sql, desc } from "drizzle-orm";
import { db, orders, orderItems, payments, menuItems } from "@workspace/db";

const router: IRouter = Router();

router.get("/kasir/laporan", async (req, res): Promise<void> => {
  const { from, to } = req.query;
  const fromDate = from ? new Date(from as string) : new Date(new Date().setHours(0,0,0,0));
  const toDate = to ? new Date(to as string) : new Date(new Date().setHours(23,59,59,999));

  // Total pendapatan
  const [revenue] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(payments)
    .where(and(
      eq(payments.status, "paid"),
      gte(payments.paidAt, fromDate),
      lte(payments.paidAt, toDate),
    ));

  // Breakdown metode bayar
  const methodBreakdown = await db
    .select({
      method: payments.method,
      total: sql<number>`SUM(${payments.amount})::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(payments)
    .where(and(
      eq(payments.status, "paid"),
      gte(payments.paidAt, fromDate),
      lte(payments.paidAt, toDate),
    ))
    .groupBy(payments.method);

  // Menu terlaris
  const topMenu = await db
    .select({
      name: orderItems.name,
      qty: sql<number>`SUM(${orderItems.quantity})::int`,
      revenue: sql<number>`SUM(${orderItems.quantity} * ${orderItems.price})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(and(
      eq(payments.status, "paid"),
      gte(payments.paidAt, fromDate),
      lte(payments.paidAt, toDate),
    ))
    .groupBy(orderItems.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(10);

  // Order per jam
  const perJam = await db
    .select({
      jam: sql<number>`EXTRACT(HOUR FROM ${payments.paidAt})::int`,
      count: sql<number>`COUNT(*)::int`,
      total: sql<number>`SUM(${payments.amount})::int`,
    })
    .from(payments)
    .where(and(
      eq(payments.status, "paid"),
      gte(payments.paidAt, fromDate),
      lte(payments.paidAt, toDate),
    ))
    .groupBy(sql`EXTRACT(HOUR FROM ${payments.paidAt})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${payments.paidAt})`);

  // Order dibatalkan
  const [cancelled] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(payments)
    .where(and(
      eq(payments.status, "cancelled"),
      gte(payments.createdAt, fromDate),
      lte(payments.createdAt, toDate),
    ));

  res.json({
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    totalRevenue: Number(revenue?.total ?? 0),
    totalOrders: Number(revenue?.count ?? 0),
    cancelledOrders: Number(cancelled?.count ?? 0),
    methodBreakdown,
    topMenu,
    perJam,
  });
});

export default router;
