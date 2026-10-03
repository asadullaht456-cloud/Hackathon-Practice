# Agent instructions: Dev3 (Backend and Delivery)

**Role:** Owns Supabase (schema, RLS, functions, simulator), all services, the Gemini ID OCR call, and the delivery material (README, demo notes, slides, video edit).

Before coding read `AGENTS.md`, `docs/PROBLEM.md`, `docs/MVP.md`, `docs/ARCHITECTURE.md`, `docs/OWNERSHIP.md`, `docs/TASKS.md`.

## OWNS (may edit)
`lib/supabase.ts`, `lib/ai.ts`, `services/**`, `supabase/**`, `docs/DEMO.md`, `README.md`, `.env.example`

## FORBIDDEN (never edit)
- Dev1/Dev2: `app/**`, `components/**`, `constants/**`, `assets/**`, `hooks/**`
- Dev1: `app.json`, `eas.json`, `package.json`, `lib/auth.ts`, `docs/TASKS.md`, `agents/**`
- `.env` is local only: never read it aloud, print it or copy it anywhere.

## Tasks (from docs/TASKS.md)
| # | Task | Time |
|---|---|---|
| 5 | **First:** `services/types.ts`, `mock.ts`, `index.ts` matching `ARCHITECTURE.md` | 0:00-0:25 |
| 6 | Supabase project, `supabase/schema.sql`, seed, `lib/supabase.ts` | 0:25-0:40 |
| 15 | `services/transit.ts` + 1 s vehicle simulator check | 0:40-1:10 |
| 16 | `services/wallet.ts`, `services/qr.ts` | 1:10-1:35 |
| 17 | `lib/ai.ts`, `services/student.ts`, `services/profile.ts` | 1:35-1:55 |
| 18 | `services/planner.ts` | 1:55-2:30 |
| 21 | Slides draft from `docs/DEMO.md` (bug fixes first) | 2:30-2:50 |
| 24 | Finish slides with screenshots, export PDF | 2:50-3:20 |
| 27 | Edit demo video | 3:20-3:45 |
| 29 | README screenshots, final repo and secrets check | 3:45-4:00 |

## Rules
- `mock.ts` must use the same function names and return shapes as the real services; `index.ts` switches on `EXPO_PUBLIC_USE_MOCK`.
- Never expose the `service_role` key. Follow `docs/SECURITY.md` strictly. `.env.example` contains fake values only.
- Money and QR logic stay in SQL functions; services only call them. Throw readable errors.
- Need a new package? Do not install it; write a request to Dev1.
- Branch prefix: `feature/dev3-`.
- Follow `docs/GIT_RULES.md`. Never commit or push unless explicitly told to. Stage files by explicit path.
- If a task needs a forbidden file, stop and write a 3-line change request for the owner.

## Definition of done
Services return the documented shapes, errors are handled, and only files you own changed.
