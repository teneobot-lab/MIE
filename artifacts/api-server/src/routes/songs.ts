import { Router, type IRouter } from "express";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db, songRequests, songUpvotes } from "@workspace/db";
import {
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  GetNowPlayingResponse,
  UpvoteSongParams,
  UpvoteSongBody,
  UpvoteSongResponse,
  ListArchiveResponse,
  ListRecentRequestsQueryParams,
  ListRecentRequestsResponse,
} from "@workspace/api-zod";
import { getWeekRange, getWeekStart, getWeekEnd } from "../lib/week";

const router: IRouter = Router();

type SongAggRow = {
  id: number;
  title: string;
  artist: string;
  message: string | null;
  requesterHandle: string;
  createdAt: Date;
  upvotes: number;
  requests: number;
};

async function fetchTopForWeek(
  weekStart: Date,
  weekEnd: Date,
  limit: number,
): Promise<SongAggRow[]> {
  // Group by normalized title+artist within the week and sum requests across
  // duplicate song requests; take the earliest matching song_request id as the
  // representative entry so upvotes target a stable id.
  const rows = await db
    .select({
      id: sql<number>`MIN(${songRequests.id})::int`,
      title: songRequests.title,
      artist: songRequests.artist,
      message: sql<string | null>`(ARRAY_AGG(${songRequests.message} ORDER BY ${songRequests.createdAt} DESC))[1]`,
      requesterHandle: sql<string>`(ARRAY_AGG(${songRequests.requesterHandle} ORDER BY ${songRequests.createdAt} ASC))[1]`,
      createdAt: sql<Date>`MIN(${songRequests.createdAt})`,
      requests: sql<number>`COUNT(*)::int`,
      upvotes: sql<number>`COALESCE((
        SELECT SUM(c)::int FROM (
          SELECT COUNT(*)::int AS c
          FROM ${songUpvotes}
          WHERE ${songUpvotes.songRequestId} IN (
            SELECT sr2.id FROM ${songRequests} sr2
            WHERE LOWER(sr2.title) = LOWER(${songRequests.title})
              AND LOWER(sr2.artist) = LOWER(${songRequests.artist})
              AND sr2.week_start = ${weekStart.toISOString()}::timestamptz
          )
        ) AS sub
      ), 0)`,
    })
    .from(songRequests)
    .where(
      and(
        gte(songRequests.weekStart, weekStart),
        lt(songRequests.weekStart, weekEnd),
      ),
    )
    .groupBy(
      sql`LOWER(${songRequests.title})`,
      sql`LOWER(${songRequests.artist})`,
      songRequests.title,
      songRequests.artist,
    )
    .orderBy(
      desc(
        sql`COUNT(*)::int + COALESCE((
          SELECT SUM(c)::int FROM (
            SELECT COUNT(*)::int AS c
            FROM ${songUpvotes}
            WHERE ${songUpvotes.songRequestId} IN (
              SELECT sr2.id FROM ${songRequests} sr2
              WHERE LOWER(sr2.title) = LOWER(${songRequests.title})
                AND LOWER(sr2.artist) = LOWER(${songRequests.artist})
                AND sr2.week_start = ${weekStart.toISOString()}::timestamptz
            )
          ) AS sub
        ), 0)`,
      ),
      desc(sql`COUNT(*)::int`),
    )
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    message: r.message,
    requesterHandle: r.requesterHandle,
    createdAt: new Date(r.createdAt),
    upvotes: r.upvotes ?? 0,
    requests: r.requests ?? 0,
  }));
}

function toEntry(r: SongAggRow) {
  return {
    id: r.id,
    title: r.title,
    artist: r.artist,
    message: r.message,
    requesterHandle: r.requesterHandle,
    upvotes: r.upvotes,
    requests: r.requests,
    score: r.requests + r.upvotes,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/songs/leaderboard", async (req, res): Promise<void> => {
  const params = GetLeaderboardQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const limit = params.data.limit ?? 10;
  const { weekStart, weekEnd } = getWeekRange();
  const rows = await fetchTopForWeek(weekStart, weekEnd, limit);

  res.json(
    GetLeaderboardResponse.parse({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      resetsAt: weekEnd.toISOString(),
      entries: rows.map(toEntry),
    }),
  );
});

router.get("/songs/now-playing", async (_req, res): Promise<void> => {
  const { weekStart, weekEnd } = getWeekRange();
  const rows = await fetchTopForWeek(weekStart, weekEnd, 6);

  res.json(
    GetNowPlayingResponse.parse({
      song: rows[0] ? toEntry(rows[0]) : undefined,
      queue: rows.slice(1).map(toEntry),
    }),
  );
});

router.get("/songs/recent-requests", async (req, res): Promise<void> => {
  const params = ListRecentRequestsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const limit = params.data.limit ?? 12;
  const { weekStart, weekEnd } = getWeekRange();

  const rows = await db
    .select({
      id: songRequests.id,
      title: songRequests.title,
      artist: songRequests.artist,
      message: songRequests.message,
      requesterHandle: songRequests.requesterHandle,
      createdAt: songRequests.createdAt,
      upvotes: sql<number>`(SELECT COUNT(*)::int FROM ${songUpvotes} WHERE ${songUpvotes.songRequestId} = ${songRequests.id})`,
    })
    .from(songRequests)
    .where(
      and(
        gte(songRequests.weekStart, weekStart),
        lt(songRequests.weekStart, weekEnd),
      ),
    )
    .orderBy(desc(songRequests.createdAt))
    .limit(limit);

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    message: r.message,
    requesterHandle: r.requesterHandle,
    upvotes: r.upvotes ?? 0,
    requests: 1,
    score: 1 + (r.upvotes ?? 0),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListRecentRequestsResponse.parse(data));
});

router.post("/songs/:id/upvote", async (req, res): Promise<void> => {
  const params = UpvoteSongParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const body = UpvoteSongBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ message: body.error.message });
    return;
  }

  const [song] = await db
    .select()
    .from(songRequests)
    .where(eq(songRequests.id, params.data.id));
  if (!song) {
    res.status(404).json({ message: "Song not found" });
    return;
  }

  await db
    .insert(songUpvotes)
    .values({ songRequestId: song.id, voterHandle: body.data.handle.trim() })
    .onConflictDoNothing();

  // Recount within the same week's grouping (title+artist)
  const weekStart = song.weekStart;
  const weekEnd = getWeekEnd(weekStart);

  const [agg] = await db
    .select({
      id: sql<number>`MIN(${songRequests.id})::int`,
      title: songRequests.title,
      artist: songRequests.artist,
      requests: sql<number>`COUNT(*)::int`,
      upvotes: sql<number>`COALESCE((
        SELECT COUNT(*)::int FROM ${songUpvotes}
        WHERE ${songUpvotes.songRequestId} IN (
          SELECT id FROM ${songRequests}
          WHERE LOWER(title) = LOWER(${song.title})
            AND LOWER(artist) = LOWER(${song.artist})
            AND week_start = ${weekStart.toISOString()}::timestamptz
        )
      ), 0)`,
    })
    .from(songRequests)
    .where(
      and(
        sql`LOWER(${songRequests.title}) = LOWER(${song.title})`,
        sql`LOWER(${songRequests.artist}) = LOWER(${song.artist})`,
        eq(songRequests.weekStart, weekStart),
      ),
    )
    .groupBy(songRequests.title, songRequests.artist);

  const requests = Number(agg?.requests ?? 1);
  const upvotes = Number(agg?.upvotes ?? 0);

  res.json(
    UpvoteSongResponse.parse({
      id: song.id,
      title: song.title,
      artist: song.artist,
      message: song.message,
      requesterHandle: song.requesterHandle,
      upvotes,
      requests,
      score: requests + upvotes,
      createdAt: song.createdAt.toISOString(),
    }),
  );

  // weekEnd is intentionally consumed for invariant enforcement; reference here
  // so TypeScript doesn't flag it as unused if its only use is variable
  // declaration.
  void weekEnd;
});

router.get("/songs/archive", async (_req, res): Promise<void> => {
  const currentWeekStart = getWeekStart();

  // Distinct past weeks
  const weekRows = await db
    .selectDistinct({ weekStart: songRequests.weekStart })
    .from(songRequests)
    .where(lt(songRequests.weekStart, currentWeekStart))
    .orderBy(desc(songRequests.weekStart))
    .limit(12);

  const archives = await Promise.all(
    weekRows.map(async (w) => {
      const ws = w.weekStart;
      const we = getWeekEnd(ws);
      const top = await fetchTopForWeek(ws, we, 5);
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(songRequests)
        .where(
          and(
            gte(songRequests.weekStart, ws),
            lt(songRequests.weekStart, we),
          ),
        );
      return {
        weekStart: ws.toISOString(),
        weekEnd: we.toISOString(),
        totalRequests: Number(count ?? 0),
        topSongs: top.map(toEntry),
      };
    }),
  );

  res.json(ListArchiveResponse.parse(archives));
});

export default router;
