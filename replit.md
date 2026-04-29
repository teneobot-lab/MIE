# Mie Ayam Berteman

## Overview

Indonesian noodle joint website where every order earns one song request that climbs a weekly community leaderboard. Grunge / pop-punk DIY zine aesthetic, Bahasa Indonesia copy.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind v4, wouter, TanStack Query, framer-motion, zustand
- **API framework**: Express 5
- **Database**: Replit PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- `artifacts/mie-ayam-berteman` — main React + Vite website (served at `/`)
- `artifacts/api-server` — shared Express API (served at `/api`)
- `artifacts/mockup-sandbox` — design canvas (internal, not user-facing)

## Domain Model

- `menu_items` — menu cards (mie ayam, bakso, cemilan, minuman). Prices stored as integer rupiah.
- `orders` + `order_items` — customer orders, identified by a free-text `handle` (no auth on first build).
- `song_requests` — every order creates exactly one song request, stamped with `week_start`.
- `song_upvotes` — per-song upvotes, unique per `(songRequestId, voterHandle)`.

The leaderboard groups song_requests by `LOWER(title)` + `LOWER(artist)` within the current ISO week (Monday 00:00 UTC) and ranks by `requests + upvotes`. Past weeks are exposed via `/api/songs/archive` (no destructive reset — old weeks live in the same tables and are filtered by `week_start`).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
