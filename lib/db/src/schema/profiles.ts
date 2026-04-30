import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const customerProfiles = pgTable("customer_profiles", {
  id: serial("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  bio: text("bio"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  twitter: text("twitter"),
  youtube: text("youtube"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CustomerProfileRow = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = typeof customerProfiles.$inferInsert;
