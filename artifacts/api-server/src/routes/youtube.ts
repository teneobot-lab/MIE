import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/youtube/search", async (req, res): Promise<void> => {
  const { q } = req.query;
  if (!q) { res.status(400).json({ message: "q required" }); return; }
  const apiKey = process.env["YOUTUBE_API_KEY"];
  if (!apiKey) { res.status(503).json({ message: "YouTube API not configured" }); return; }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q as string)}&type=video&maxResults=1&key=${apiKey}`;
  const r = await fetch(url);
  const data = await r.json();
  const videoId = data.items?.[0]?.id?.videoId ?? null;
  res.json({ videoId });
});

export default router;
