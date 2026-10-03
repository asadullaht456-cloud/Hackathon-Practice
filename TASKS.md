# TASKS: 4-hour board

Times are elapsed (0:00 = start). Each task touches only files its owner owns (`docs/OWNERSHIP.md`). **[MOCK-FIRST]** means the screen is built against `@/services` with `EXPO_PUBLIC_USE_MOCK=true`, so it never waits for the backend. Status: Todo / Doing / Done / Blocked. Dev1 owns this file.

## 0:00-0:40 Foundation
| # | Task | Owner | Branch name | Depends on | Estimate | Blocked / needs from another dev | Status |
|---|---|---|---|---|---|---|---|
| 1 | Scaffold Expo + TS + Router, install packages, stub folders, push to `main` (one-time ownership exception) | Dev1 | feature/dev1-scaffold | - | 15 min | Dev2/Dev3 branch only after this lands (~0:15) | Todo |
| 2 | Root layout: Stack, auth gate, PaperProvider using `useAppTheme` | Dev1 | feature/dev1-root-layout | 1 | 25 min | Needs Dev2 #3 (use a stub theme until it lands) | Todo |
| 3 | `constants/theme.ts` (#3b8132 palette + high-contrast Glare theme), `hooks/ui/useAppTheme.ts` | Dev2 | feature/dev2-theme | 1 | 20 min | Hand to Dev1 by 0:20 | Todo |
| 4 | Shared components: `StateView` (loading/empty/error), `AppCard`, `VehicleMarker` | Dev2 | feature/dev2-components | 3 | 20 min | - | Todo |
| 5 | **[MOCK-FIRST]** `services/types.ts`, `mock.ts`, `index.ts` (same names and shapes as `ARCHITECTURE.md`) | Dev3 | feature/dev3-mock-services | 1 | 25 min | Dev1 and Dev2 are blocked on this by 0:40 | Todo |
| 6 | Supabase project: run `supabase/schema.sql`, seed, Realtime, turn off email confirm, 2 demo users; `lib/supabase.ts` | Dev3 | feature/dev3-supabase-setup | 5 | 15 min | Dev1 #7 needs `lib/supabase.ts` by 0:40 | Todo |

## 0:40-2:30 Build
| # | Task | Owner | Branch name | Depends on | Estimate | Blocked / needs from another dev | Status |
|---|---|---|---|---|---|---|---|
| 7 | `lib/auth.ts` (session, sign in/up/out) + login and signup screens | Dev1 | feature/dev1-auth | 2, 6 | 35 min | Needs Dev3 #6 (`lib/supabase.ts`) | Todo |
| 8 | `app.json` (package id, camera/location permissions, Maps key via env), `eas.json` preview APK profile; start a dry-run EAS build | Dev1 | feature/dev1-eas-config | 7 | 20 min | EAS variables set with `eas env:create` | Todo |
| 9 | **[MOCK-FIRST]** `app/student-verify.tsx`: consent, camera ID capture, OCR confirm, liveness prompt, result | Dev1 | feature/dev1-student-flow | 4, 5 | 35 min | Real `student.ts` from Dev3 #17 (mock until then) | Todo |
| 10 | **[MOCK-FIRST]** `app/validator.tsx`: route picker, QR scan, pass/fail + fare | Dev1 | feature/dev1-validator | 4, 5 | 20 min | Real `qr.ts` from Dev3 #16 | Todo |
| 11 | **[MOCK-FIRST]** `app/(tabs)/_layout.tsx` + Live Map: moving vehicles, latency badge, my location | Dev2 | feature/dev2-live-map | 4, 5 | 35 min | Real `transit.ts` from Dev3 #15 | Todo |
| 12 | **[MOCK-FIRST]** Plan screen: origin/destination, Fastest/Cheapest, result card | Dev2 | feature/dev2-plan | 5 | 25 min | Real `planner.ts` from Dev3 #18 | Todo |
| 13 | **[MOCK-FIRST]** Wallet: balance, top-up sheet (mock JazzCash/RAAST), `QrPass` (30 s refresh), transactions | Dev2 | feature/dev2-wallet | 4, 5 | 35 min | Real `wallet.ts` + `qr.ts` from Dev3 #16 | Todo |
| 14 | **[MOCK-FIRST]** Profile (role badge, links, sign out) + Auto Glare Mode (light sensor, manual switch) | Dev2 | feature/dev2-profile-glare | 3, 5 | 15 min | - | Todo |
| 15 | `services/transit.ts` (stops, routes, vehicles, realtime subscribe); confirm the 1 s simulator runs | Dev3 | feature/dev3-transit | 6 | 30 min | Dev2 #11 swaps to real after this | Todo |
| 16 | `services/wallet.ts`, `services/qr.ts` (RPC wrappers); test top-up, QR, validate in SQL editor | Dev3 | feature/dev3-wallet-qr | 6 | 25 min | Dev2 #13, Dev1 #10 | Todo |
| 17 | `lib/ai.ts` (Gemini ID OCR with mock fallback), `services/student.ts`, `services/profile.ts` | Dev3 | feature/dev3-student-ai | 6 | 20 min | Needs `EXPO_PUBLIC_GEMINI_API_KEY` in own `.env`; Dev1 #9 | Todo |
| 18 | `services/planner.ts`: nearest stop, fastest/cheapest search over routes and transfers | Dev3 | feature/dev3-planner | 6 | 35 min | Dev2 #12 | Todo |
| - | **2:30 FEATURE FREEZE:** no new features. Only fixes and integration from here. Unfinished items follow the cut list below | All | - | - | - | - | - |

## 2:30-2:50 Integrate
| # | Task | Owner | Branch name | Depends on | Estimate | Blocked / needs from another dev | Status |
|---|---|---|---|---|---|---|---|
| 19 | Merge all PRs to `main`, set `EXPO_PUBLIC_USE_MOCK=false`, smoke-test the full MVP flow on a phone | Dev1 | feature/dev1-integration | 7-18 | 20 min | All devs push finished branches by 2:30 | Todo |
| 20 | Fix UI bugs from the smoke test; check Glare Mode and contrast outdoors | Dev2 | feature/dev2-fixes | 19 | 20 min | Bug list from Dev1 | Todo |
| 21 | Slides 1-6 text draft from `docs/DEMO.md`. Service bugs reported by Dev1 take priority | Dev3 | feature/dev3-docs | 19 | 20 min | Bug reports from Dev1 | Todo |

## 2:50-3:20 APK build
| # | Task | Owner | Branch name | Depends on | Estimate | Blocked / needs from another dev | Status |
|---|---|---|---|---|---|---|---|
| 22 | Final `eas build -p android --profile preview`; install on a device; smoke-test. Rebuild only for crashes | Dev1 | main | 19-21 | 30 min | Only blocker fixes merge after 2:50 | Todo |
| 23 | Screenshots for slides from the running app; test the APK on a second device | Dev2 | - | 19 | 30 min | APK link from Dev1 #22 | Todo |
| 24 | Finish slides with screenshots; export PDF | Dev3 | - | 21, 23 | 30 min | Screenshots from Dev2 | Todo |

## 3:20-3:45 Demo video
| # | Task | Owner | Branch name | Depends on | Estimate | Blocked / needs from another dev | Status |
|---|---|---|---|---|---|---|---|
| 25 | Record main-phone screen footage following the 90 s script in `docs/DEMO.md` | Dev2 | - | 22 | 25 min | Working APK | Todo |
| 26 | Run the second phone (validator, student scan) and record its clips | Dev1 | - | 22 | 25 min | Working APK, same demo accounts | Todo |
| 27 | Edit video (cuts, captions, voiceover), export, check length | Dev3 | - | 25, 26 | 25 min | Raw clips from Dev1 and Dev2 | Todo |

## 3:45-4:00 Submit
| # | Task | Owner | Branch name | Depends on | Estimate | Blocked / needs from another dev | Status |
|---|---|---|---|---|---|---|---|
| 28 | Tag `v1.0-submission` on `main`; submit APK, video, slides, repo link | Dev1 | main | 22, 24, 27 | 15 min | Final files from Dev3 | Todo |
| 29 | README screenshots and team names; final repo and secrets check | Dev3 | feature/dev3-readme | 24 | 15 min | - | Todo |
| 30 | Fresh-install check of the submitted APK; demo accounts still work | Dev2 | - | 28 | 15 min | - | Todo |

## Rules
- Slip rule: if a task runs 10 minutes over, tell the team at once.
- Cut list if behind at 2:00, in this order: Auto Glare sensor (keep the manual switch), transactions list, validator route picker (fixed route), planner Cheapest mode, student OCR (manual form).
- Pull `main` before starting each task. Merge only through pull requests (`docs/GIT_RULES.md`).
