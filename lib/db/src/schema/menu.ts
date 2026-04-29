import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  spicy: boolean("spicy").notNull().default(false),
  available: boolean("available").notNull().default(true),
});

export type MenuItemRow = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;
