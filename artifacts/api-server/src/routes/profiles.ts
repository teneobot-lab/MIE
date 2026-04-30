import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, customerProfiles } from "@workspace/db";

const router: IRouter = Router();

// GET profil by handle
router.get("/profiles/:handle", async (req, res): Promise<void> => {
  const { handle } = req.params;
  const [row] = await db.select().from(customerProfiles).where(eq(customerProfiles.handle, handle.toLowerCase()));
  if (!row) { res.status(404).json({ message: "Profile not found" }); return; }
  res.json(row);
});

// POST/PUT — upsert profil
router.post("/profiles", async (req, res): Promise<void> => {
  const { handle, bio, instagram, tiktok, twitter, youtube } = req.body;
  if (!handle) { res.status(400).json({ message: "Handle wajib diisi" }); return; }
  const normalized = handle.toLowerCase().trim();
  const existing = await db.select().from(customerProfiles).where(eq(customerProfiles.handle, normalized));
  if (existing[0]) {
    const [updated] = await db.update(customerProfiles)
      .set({ bio, instagram, tiktok, twitter, youtube, updatedAt: new Date() })
      .where(eq(customerProfiles.handle, normalized))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(customerProfiles)
      .values({ handle: normalized, bio, instagram, tiktok, twitter, youtube })
      .returning();
    res.json(created);
  }
});

// GET semua profil (untuk halaman tongkrongan)
router.get("/profiles", async (_req, res): Promise<void> => {
  const rows = await db.select().from(customerProfiles).orderBy(customerProfiles.createdAt);
  res.json(rows);
});

export default router;
