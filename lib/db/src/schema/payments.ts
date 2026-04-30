import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  method: text("method").notNull().default("cash"), // cash | qris
  status: text("status").notNull().default("pending"), // pending | paid | cancelled
  amount: integer("amount").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PaymentRow = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
