import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const songRequests = pgTable("song_requests", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  message: text("message"),
  requesterHandle: text("requester_handle").notNull(),
  weekStart: timestamp("week_start", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const songUpvotes = pgTable(
  "song_upvotes",
  {
    id: serial("id").primaryKey(),
    songRequestId: integer("song_request_id")
      .notNull()
      .references(() => songRequests.id, { onDelete: "cascade" }),
    voterHandle: text("voter_handle").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueVote: unique().on(t.songRequestId, t.voterHandle),
  }),
);

export type SongRequestRow = typeof songRequests.$inferSelect;
export type SongUpvoteRow = typeof songUpvotes.$inferSelect;

export const songSkipVotes = pgTable(
  "song_skip_votes",
  {
    id: serial("id").primaryKey(),
    songRequestId: integer("song_request_id")
      .notNull()
      .references(() => songRequests.id, { onDelete: "cascade" }),
    voterHandle: text("voter_handle").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ uniqueSkip: unique().on(t.songRequestId, t.voterHandle) }),
);

export const playedSongs = pgTable("played_songs", {
  id: serial("id").primaryKey(),
  songRequestId: integer("song_request_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  requesterHandle: text("requester_handle").notNull(),
  playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SongSkipVoteRow = typeof songSkipVotes.$inferSelect;
export type PlayedSongRow = typeof playedSongs.$inferSelect;
