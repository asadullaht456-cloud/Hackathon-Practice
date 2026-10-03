# Agent instructions: Dev1 (Lead and Integration)

**Role:** Owns project setup, navigation, auth, the modal flows (student verification, validator), app/EAS config, integration and the final APK. Unblocks the other two devs.

Before coding read `AGENTS.md`, `docs/PROBLEM.md`, `docs/MVP.md`, `docs/ARCHITECTURE.md`, `docs/OWNERSHIP.md`, `docs/TASKS.md`.

## OWNS (may edit)
`app/_layout.tsx`, `app/+not-found.tsx`, `app/(auth)/**`, `app/student-verify.tsx`, `app/validator.tsx`, `lib/auth.ts`, `app.json`, `eas.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `docs/TASKS.md`, `agents/**`

## FORBIDDEN (never edit)
- Dev2: `app/(tabs)/**`, `components/**`, `constants/**`, `assets/**`, `hooks/ui/**`
- Dev3: `lib/supabase.ts`, `lib/ai.ts`, `services/**`, `supabase/**`, `README.md`, `.env.example`, `docs/DEMO.md`
- Shared read-only docs and `AGENTS.md` (changes only after the team agrees)

## Tasks (from docs/TASKS.md)
| # | Task | Time |
|---|---|---|
| 1 | Scaffold Expo + TS + Router, install packages, push to `main` (one-time exception) | 0:00-0:15 |
| 2 | Root layout: Stack, auth gate, PaperProvider with `useAppTheme` | 0:15-0:40 |
| 7 | `lib/auth.ts` + login and signup screens | 0:40-1:15 |
| 8 | `app.json`, `eas.json` preview APK profile, dry-run EAS build | 1:15-1:35 |
| 9 | `app/student-verify.tsx` (mock first) | 1:35-2:10 |
| 10 | `app/validator.tsx` (mock first) | 2:10-2:30 |
| 19 | Merge PRs, set `EXPO_PUBLIC_USE_MOCK=false`, smoke test | 2:30-2:50 |
| 22 | Final EAS build, install and test | 2:50-3:20 |
| 26 | Run the second phone for the video | 3:20-3:45 |
| 28 | Tag `v1.0-submission`, submit APK, video, slides, repo link | 3:45-4:00 |

## Rules
- Branch prefix: `feature/dev1-`.
- If a task needs a forbidden file: stop, do not edit it, and write a 3-line change request for the owner (`CR to Dev<owner>: <file>` / `Need: ...` / `Why: task # and time`).
- Handle package requests from Dev2 and Dev3: install with `npx expo install`, then tell the team to pull.
- Read `docs/SECURITY.md` and `docs/GIT_RULES.md` before every commit.
- Never commit or push unless explicitly told to. Stage files by explicit path.

## Definition of done
Compiles with `npx expo start`, runs in Expo Go, and only files you own changed (check `git status` and `git diff --staged`).
