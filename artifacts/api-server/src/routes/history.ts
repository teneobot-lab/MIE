import { Router, type IRouter } from "express";
import { desc, gte, sql } from "drizzle-orm";
import { db, playedSongs } from "@workspace/db";

const router: IRouter = Router();

router.get("/songs/history", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = await db
    .select()
    .from(playedSongs)
    .where(gte(playedSongs.playedAt, today))
    .orderBy(desc(playedSongs.playedAt))
    .limit(50);
  res.json(rows);
});

router.post("/songs/history", async (req, res): Promise<void> => {
  const { songRequestId, title, artist, requesterHandle } = req.body;
  if (!title || !artist || !requesterHandle) {
    res.status(400).json({ message: "title, artist, requesterHandle required" });
    return;
  }
  const [row] = await db.insert(playedSongs).values({ songRequestId: songRequestId ?? 0, title, artist, requesterHandle }).returning();
  res.json(row);
});

router.delete("/songs/history", async (_req, res): Promise<void> => {
  await db.delete(playedSongs);
  res.json({ message: "history cleared" });
});

export default router;
