# PACKAGES.md: Package Installation Guide

Place this file at `docs/PACKAGES.md`. Every dev and every agent must follow it.

---

## 1. Rules

- **Only Dev1 installs or removes packages** and edits `package.json` / `package-lock.json`.
- Dev2 and Dev3 request packages from Dev1 (format in section 8). Agents must never install packages on their own.
- Always use `npx expo install <package>` for any Expo or React Native package. It picks versions compatible with the project's Expo SDK.
- Use plain `npm install <package>` only for pure JavaScript libraries (for example `zustand`, `dayjs`).
- Use **npm only**. Never mix npm, yarn, and pnpm. Do not create `yarn.lock` or `pnpm-lock.yaml`.
- Commit `package.json` and `package-lock.json` together, in the same commit as the install.
- After every package change, Dev1 announces it in the team chat. Everyone then runs the sync commands in section 6.

---

## 2. Check the environment first

```bash
node -v      # v20 or newer
npm -v
git --version
```

---

## 3. Already included in the default Expo template

Do **not** reinstall these. They come with `npx create-expo-app@latest`:

- `expo`, `react`, `react-native`
- `expo-router`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `expo-linking`, `expo-constants`, `expo-status-bar`
- `@expo/vector-icons`

---

## 4. Core install (Dev1, in this order)

### 4.1 UI library

```bash
npx expo install react-native-paper react-native-safe-area-context
```

### 4.2 Supabase (backend, auth, database)

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

### 4.3 State management (optional, lightweight)

```bash
npm install zustand
```

### 4.4 Dev tools

```bash
npm install -D prettier
```

ESLint is already part of the template.

### 4.5 Global tools (once per laptop)

```bash
npm install -g eas-cli
eas --version
```

---

## 5. Optional packages (install only if the MVP needs them)

Install in one command per group. Do not install anything "just in case".

### Native device features

| Need | Command |
|---|---|
| Pick images from gallery | `npx expo install expo-image-picker` |
| Camera | `npx expo install expo-camera` |
| Location / GPS | `npx expo install expo-location` |
| Local push notifications | `npx expo install expo-notifications expo-device` |
| Secure storage for tokens | `npx expo install expo-secure-store` |
| Haptic feedback | `npx expo install expo-haptics` |
| Text to speech | `npx expo install expo-speech` |
| Audio playback / recording | `npx expo install expo-audio` |
| Video playback | `npx expo install expo-video` |
| Pick documents | `npx expo install expo-document-picker` |
| File system access | `npx expo install expo-file-system` |
| Share content | `npx expo install expo-sharing` |
| Copy to clipboard | `npx expo install expo-clipboard` |
| QR / barcode scanning | `npx expo install expo-camera` (use its barcode scanner) |

### UI extras

| Need | Command |
|---|---|
| Gradients | `npx expo install expo-linear-gradient` |
| SVG graphics | `npx expo install react-native-svg` |
| Charts | `npx expo install react-native-svg` then `npm install react-native-chart-kit` |
| Animations (Lottie) | `npx expo install lottie-react-native` |
| Maps | `npx expo install react-native-maps` |
| Bottom sheets | `npm install @gorhom/bottom-sheet` (needs gesture-handler and reanimated, already included) |
| Toast messages | `npm install react-native-toast-message` |

### Utilities

| Need | Command |
|---|---|
| Date formatting | `npm install dayjs` |
| Form handling | `npm install react-hook-form` |
| Validation | `npm install zod` |
| Unique IDs | `npx expo install expo-crypto` |

### AI features

- Gemini or OpenAI: **no SDK needed**. Call the REST API with `fetch` from `lib/ai.ts`. This avoids compatibility problems on React Native.
- Keys: follow `docs/SECURITY.md`.

### Notes on specific packages

- `react-native-maps` works in Expo Go, but a standalone APK on Android needs a Google Maps API key configured in `app.json`. Skip maps unless the problem requires them.
- `expo-notifications` push (remote) notifications need extra setup. For a hackathon, use local notifications only.
- Avoid packages that require custom native code (anything that says "requires development build") unless the team has agreed to build with EAS only. These do not run in Expo Go.

---

## 6. Sync commands (for every dev after Dev1 changes packages)

```bash
git switch main
git pull
npm install
git switch <your-branch>
git rebase main
npx expo start -c
```

---

## 7. Verify and fix

```bash
npx expo-doctor                 # checks the project for problems
npx expo install --check        # lists packages with wrong versions
npx expo install --fix          # fixes version mismatches
npx expo start -c               # restart with a clean cache
```

If things are badly broken (Dev1 only):

```bash
rm -rf node_modules
npm install
npx expo start -c
```

On Windows (PowerShell): `Remove-Item -Recurse -Force node_modules`

---

## 8. Package request format (Dev2 / Dev3 to Dev1)

Send this in the team chat:

```
PACKAGE REQUEST
From: Dev2
Package: expo-image-picker
Why: profile photo upload on the Profile screen
Needed by: 1:00
```

Dev1 installs it, commits `package.json` and `package-lock.json`, and replies "installed, pull and run npm install".

---

## 9. Install commit format (Dev1)

```bash
npx expo install expo-image-picker
git add package.json package-lock.json
git commit -m "chore: add expo-image-picker"
git pull --rebase origin main
git push
```

---

## 10. Final package list (Dev1 keeps this updated)

| Package | Installed by | Used for | Added at |
|---|---|---|---|
| react-native-paper | Dev1 | UI components | 0:20 |
| @supabase/supabase-js | Dev1 | Backend client | 0:20 |
| @react-native-async-storage/async-storage | Dev1 | Session storage | 0:20 |
| react-native-url-polyfill | Dev1 | Supabase support | 0:20 |
| zustand | Dev1 | State (if used) | |
| | | | |

---

## 11. Agent instructions (copy into prompts when needed)

```
Do not install, remove, or upgrade any package. Do not edit package.json or package-lock.json.
If a feature needs a new package, stop and write a PACKAGE REQUEST as defined in docs/PACKAGES.md.
Use only packages listed in section 10 of docs/PACKAGES.md.
```

---

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| "Unable to resolve module X" | Package is missing. Run `npm install`; if still missing, send a package request |
| Version mismatch warnings | `npx expo install --fix` |
| App crashes after installing a package | Remove it (`npm uninstall <pkg>`), restart with `npx expo start -c`, ask for an alternative |
| "Requires a development build" | The package does not work in Expo Go. Choose another package |
| Peer dependency errors | Retry with `npx expo install <pkg>`; avoid `--force` and `--legacy-peer-deps` unless Dev1 agrees |
| Slow or failed install on venue Wi-Fi | Use a mobile hotspot; `npm cache verify` |
| Different behavior across laptops | Everyone must have run `npm install` after the last pull, and use the same Node version |
