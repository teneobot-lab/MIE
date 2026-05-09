import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settings } from "@workspace/db";

const router: IRouter = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  nama_usaha: "Mie Ayam Berteman",
  alamat: "Jl. Contoh No. 1, Jakarta",
  jam_buka: "08:00 - 22:00",
  instagram: "@mieayamberteman",
  tiktok: "@mieayamberteman",
  logo_url: "",
  tagline: "Warung makan dengan playlist request langsung!",
};

router.get("/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(settings);
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) result[row.key] = row.value;
  res.json(result);
});

router.post("/settings", async (req, res): Promise<void> => {
  const data = req.body as Record<string, string>;
  if (!data || typeof data !== "object") {
    res.status(400).json({ message: "Invalid body" });
    return;
  }
  for (const [key, value] of Object.entries(data)) {
    await db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  }
  const rows = await db.select().from(settings);
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) result[row.key] = row.value;
  res.json(result);
});

export default router;
