# AGENTS.md: rules for every coding agent

**Stack:** Expo + TypeScript + Expo Router + React Native Paper + Supabase. App name: Chalo (working name).

## Read first, every session
`docs/PROBLEM.md`, `docs/MVP.md`, `docs/ARCHITECTURE.md`, `docs/OWNERSHIP.md`, and your own file: `agents/dev1-lead.md`, `agents/dev2-frontend.md` or `agents/dev3-backend.md`.

## Folder structure
```
app/        routes only: (auth)/, (tabs)/, _layout.tsx, student-verify.tsx, validator.tsx
components/ small reusable UI        constants/  theme.ts and static values
hooks/ui/   custom hooks             assets/     images, fonts
lib/        auth.ts, supabase.ts, ai.ts
services/   all backend calls + mock.ts + types.ts
supabase/   SQL        docs/  agents/
```
Import with the `@/` alias (for example `@/services`, `@/components/StateView`).

## Naming
- Route files: lowercase kebab-case (`student-verify.tsx`).
- Components: PascalCase file and name (`QrPass.tsx`). Hooks: `useThing.ts`. Services and lib files: camelCase (`wallet.ts`).
- Functions and variables: camelCase, verb first for actions (`getWallet`, `topUp`). Types: PascalCase. Constants: UPPER_SNAKE_CASE.

## Rules
1. **Ownership:** edit only files you own per `docs/OWNERSHIP.md`. If a task needs a file you do not own, stop and write a 3-line change request instead of editing it.
2. **Theme:** all colors, fonts and spacing come from `constants/theme.ts`. No hardcoded colors.
3. **States:** every screen has loading, empty and error states.
4. **Backend:** all backend calls go through `services/` (import from `@/services`) using `lib/supabase.ts`. Screens never call Supabase directly.
5. **Packages:** install only with `npx expo install`, and only Dev1 may change `package.json`. Others request packages from Dev1.
6. **Secrets and Git:** follow `docs/SECURITY.md` and `docs/GIT_RULES.md`. Never commit or push unless the developer explicitly asks.
7. **Code quality:** keep components small, no unused code, no leftover `console.log`.
8. **Compile check:** after every change, make sure the app still compiles with `npx expo start`.
9. **Scope:** build only what `docs/MVP.md` lists. Do not add features, screens or AI calls that are not in `docs/ARCHITECTURE.md`.
