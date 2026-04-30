import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, menuItems } from "@workspace/db";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "/var/www/mie-ayam-berteman/uploads");
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `menu-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// CREATE
router.post("/admin/menu", upload.single("image"), async (req, res): Promise<void> => {
  const { name, description, category, price, spicy, available } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const [row] = await db.insert(menuItems).values({
    name, description, category,
    price: Number(price),
    spicy: spicy === "true",
    available: available !== "false",
    imageUrl,
  }).returning();
  res.json(row);
});

// UPDATE
router.put("/admin/menu/:id", upload.single("image"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { name, description, category, price, spicy, available } = req.body;
  const existing = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!existing[0]) { res.status(404).json({ message: "Not found" }); return; }
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : existing[0].imageUrl;
  const [row] = await db.update(menuItems).set({
    name, description, category,
    price: Number(price),
    spicy: spicy === "true",
    available: available === "true",
    imageUrl,
  }).where(eq(menuItems.id, id)).returning();
  res.json(row);
});

// DELETE
router.delete("/admin/menu/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const existing = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!existing[0]) { res.status(404).json({ message: "Not found" }); return; }
  if (existing[0].imageUrl) {
    const filePath = `/var/www/mie-ayam-berteman${existing[0].imageUrl}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await db.delete(menuItems).where(eq(menuItems.id, id));
  res.json({ message: "Deleted" });
});

// TOGGLE AVAILABLE
router.patch("/admin/menu/:id/toggle", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const existing = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!existing[0]) { res.status(404).json({ message: "Not found" }); return; }
  const [row] = await db.update(menuItems).set({
    available: !existing[0].available,
  }).where(eq(menuItems.id, id)).returning();
  res.json(row);
});

export default router;
