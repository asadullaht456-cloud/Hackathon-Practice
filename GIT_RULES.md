# GIT RULES

For all 3 developers and their coding agents. Replace `<devN>` with your dev number.

1. **Never commit or push directly to `main`.** Work on a branch; merge through a pull request.
2. **Branch names:** `feature/dev1-<task>`, `feature/dev2-<task>`, `feature/dev3-<task>` (for example `feature/dev2-wallet-screen`).
3. **Commit messages:** `feat:`, `fix:`, `style:`, `docs:` or `chore:` plus a short message (for example `feat: add rotating QR card`).
4. **Commit small and often:** every working change, and at least every 20 to 30 minutes.
5. **Never use `git add .` or `git add -A`.** Stage only files you own, by explicit path: `git add path/to/file`.
6. **Before every commit:** run `git status` and `git diff --staged`. Confirm that only files you own are staged and that no secrets are included (see `docs/SECURITY.md`).
7. **Before every push:** run `git pull --rebase origin main`, then `npx expo start` and confirm the app compiles with no red errors. Stop the server, then push.
8. **Merge to `main` only after the app runs.** Post "merging now" in the team chat first, then merge the pull request.
9. **Never run `git push --force` or `git reset --hard` on shared work.**
10. **Never commit** `.env`, `node_modules`, `.expo`, `*.apk`, `*.keystore`.
11. **Conflicts:** `git status` -> open each conflicted file and fix the markers -> `git add <file>` -> `git rebase --continue`. If unsure, run `git rebase --abort` and ask Dev1.
12. **Agents must not commit or push** unless the developer explicitly asks for it in the prompt. By default an agent edits files and stops.
13. **Final tag (Dev1, after the last merge to `main`):** `git tag v1.0-submission`, then `git push origin v1.0-submission`.

## Quick routine
```
git checkout -b feature/dev2-wallet-screen
git status
git add "app/(tabs)/wallet.tsx" components/QrPass.tsx
git diff --staged
git commit -m "feat: add wallet screen"
git pull --rebase origin main
npx expo start
git push origin feature/dev2-wallet-screen
```
