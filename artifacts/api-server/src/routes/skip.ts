import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, songRequests, songSkipVotes } from "@workspace/db";

const router: IRouter = Router();
const SKIP_THRESHOLD = 3;

router.post("/songs/:id/skip-vote", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { handle } = req.body;
  if (!handle) { res.status(400).json({ message: "handle required" }); return; }

  const [song] = await db.select().from(songRequests).where(eq(songRequests.id, id));
  if (!song) { res.status(404).json({ message: "Song not found" }); return; }

  await db.insert(songSkipVotes).values({ songRequestId: id, voterHandle: handle.trim() }).onConflictDoNothing();

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(songSkipVotes)
    .where(eq(songSkipVotes.songRequestId, id));

  res.json({ skipVotes: Number(count), threshold: SKIP_THRESHOLD, shouldSkip: Number(count) >= SKIP_THRESHOLD });
});

router.get("/songs/:id/skip-votes", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(songSkipVotes)
    .where(eq(songSkipVotes.songRequestId, id));
  res.json({ skipVotes: Number(count), threshold: SKIP_THRESHOLD, shouldSkip: Number(count) >= SKIP_THRESHOLD });
});

export default router;
