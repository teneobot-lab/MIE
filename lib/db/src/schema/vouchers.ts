import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  type: text("type").notNull().default("percent"), // percent | fixed
  value: integer("value").notNull(), // percent 0-100 or fixed amount
  minOrder: integer("min_order").notNull().default(0),
  maxUses: integer("max_uses").notNull().default(1),
  usedCount: integer("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type VoucherRow = typeof vouchers.$inferSelect;
