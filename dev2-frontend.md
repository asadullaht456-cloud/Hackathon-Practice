# Agent instructions: Dev2 (Frontend)

**Role:** Builds the tab screens, shared components, theme and UI hooks. Delivers the 60 FPS map, glare-friendly #3b8132 design and animations.

Before coding read `AGENTS.md`, `docs/PROBLEM.md`, `docs/MVP.md`, `docs/ARCHITECTURE.md`, `docs/OWNERSHIP.md`, `docs/TASKS.md`.

## OWNS (may edit)
`app/(tabs)/**`, `components/**`, `constants/**`, `assets/**`, `hooks/ui/**`

## FORBIDDEN (never edit)
`app/_layout.tsx`, `app/(auth)/**`, `app/student-verify.tsx`, `app/validator.tsx`, `lib/**`, `services/**`, `supabase/**`, `app.json`, `eas.json`, `package.json`, `README.md`, `.env`, `.env.example`, and everything in `docs/**` and `agents/**` (read-only).

## Tasks (from docs/TASKS.md)
| # | Task | Time |
|---|---|---|
| 3 | `constants/theme.ts` (#3b8132 palette + Glare theme), `hooks/ui/useAppTheme.ts` | 0:00-0:20 |
| 4 | Components: `StateView`, `AppCard`, `VehicleMarker` | 0:20-0:40 |
| 11 | Tabs layout + Live Map (mock first) | 0:40-1:15 |
| 12 | Plan screen (mock first) | 1:15-1:40 |
| 13 | Wallet, top-up sheet, `QrPass` (mock first) | 1:40-2:15 |
| 14 | Profile + Auto Glare Mode (mock first) | 2:15-2:30 |
| 20 | Fix UI bugs from the smoke test | 2:30-2:50 |
| 23 | Screenshots, second-device APK test | 2:50-3:20 |
| 25 | Record main-phone footage for the video | 3:20-3:45 |
| 30 | Fresh-install check of the submitted APK | 3:45-4:00 |

## Rules
- Import data only from `@/services`. It returns the data from `services/mock.ts` while `EXPO_PUBLIC_USE_MOCK=true`. Never write to `services/`.
- Every screen needs loading, empty and error states (`StateView`). Use only `constants/theme.ts` for colors and fonts; no hardcoded colors.
- Animate with Reanimated, keep map markers few and memoized, and keep text large and high-contrast for sunlight.
- Need a new package? Do not install it; write a request to Dev1.
- Branch prefix: `feature/dev2-`.
- Follow `docs/SECURITY.md` and `docs/GIT_RULES.md`. Never commit or push unless explicitly told to. Stage files by explicit path.
- If a task needs a forbidden file, stop and write a 3-line change request for the owner.

## Definition of done
Matches the MVP flow, compiles with `npx expo start`, no hardcoded colors, and only files you own changed.
