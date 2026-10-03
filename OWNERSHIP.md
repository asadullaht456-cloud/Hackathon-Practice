# OWNERSHIP

One owner per file. Never edit a file you do not own; send a change request instead. Everyone may read everything except other people's `.env`.

## 1. Ownership table
| Path pattern | Owner | Who may read | Who must ask the owner before editing |
|---|---|---|---|
| `app/_layout.tsx`, `app/+not-found.tsx` | Dev1 | All | Dev2, Dev3 |
| `app/(auth)/**` (login, signup) | Dev1 | All | Dev2, Dev3 |
| `app/student-verify.tsx`, `app/validator.tsx` (modal flows outside tabs) | Dev1 | All | Dev2, Dev3 |
| `lib/auth.ts` | Dev1 | All | Dev2, Dev3 |
| `app.json` (or `app.config.ts`), `eas.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `babel.config.js`, `.gitignore` | Dev1 | All | Dev2, Dev3 |
| `docs/TASKS.md`, `agents/**` | Dev1 | All | Dev2, Dev3 |
| `app/(tabs)/**` (`_layout`, `index`, `plan`, `wallet`, `profile`) | Dev2 | All | Dev1, Dev3 |
| `components/**` | Dev2 | All | Dev1, Dev3 |
| `constants/**` (including `theme.ts`) | Dev2 | All | Dev1, Dev3 |
| `assets/**` | Dev2 | All | Dev1, Dev3 |
| `hooks/ui/**` (all custom hooks live here) | Dev2 | All | Dev1, Dev3 |
| `lib/supabase.ts`, `lib/ai.ts` | Dev3 | All | Dev1, Dev2 |
| `services/**` (`index`, `types`, `transit`, `planner`, `wallet`, `qr`, `student`, `profile`, `mock`) | Dev3 | All | Dev1, Dev2 |
| `supabase/**` (`schema.sql`, seed, simulator) | Dev3 | All | Dev1, Dev2 |
| `docs/DEMO.md`, `README.md`, `.env.example` | Dev3 | All | Dev1, Dev2 |
| `.env`, `.env.local` | Each dev, own machine only | Owner only; never copy or print | Nobody; never committed |
| `AGENTS.md`, `docs/PROBLEM.md`, `docs/MVP.md`, `docs/ARCHITECTURE.md`, `docs/OWNERSHIP.md`, `docs/SECURITY.md`, `docs/GIT_RULES.md` | Shared, read-only | All | Everyone; changes go through Dev1 and only after the team agrees |

Notes:
- The owner may create new files inside their own folders without asking.
- Dev1 imports Dev2's components and theme read-only. Dev2 and Dev1 import Dev3's `services` (through `@/services`) read-only.
- One-time exception: Dev1's initial scaffold commit may touch every folder. It must land on `main` before Dev2 and Dev3 branch from it.

## 2. Files not listed here
Stop and ask Dev1 (lead) in the team chat. Dev1 either takes the file or assigns it to an owner and updates this table. Do not create new top-level folders or config files without asking.

## 3. Change request format (3 lines, post in team chat)
```
CR to Dev<owner>: <file path>
Need: <the exact change, in one sentence>
Why: <task # from docs/TASKS.md it blocks> - needed by <time>
```
The owner replies "done" with the branch or commit, or says "no" with a reason. Do not work around a refused request by editing the file anyway.

## 4. Shared files (package.json and similar)
Only Dev1 edits `package.json`, `package-lock.json`, `app.json`, `eas.json`, `tsconfig.json`. Need a package or config change? Send a change request to Dev1 with the package name and why. Dev1 installs with `npx expo install` and tells the team to pull. Nobody else runs `npm install <package>`.
