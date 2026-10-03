# SECURITY: keys and secrets

For all developers and agents on this Expo + Supabase project.

1. **Never hardcode keys** in source code, docs, comments, README or screenshots.
2. **Keys live only in `.env`** (git-ignored). Only `.env.example` is committed, with fake values.
3. **App variables start with `EXPO_PUBLIC_`** and are read as `process.env.EXPO_PUBLIC_NAME`.
4. **Required variables:**

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Gemini key for ID OCR |
| `EXPO_PUBLIC_USE_MOCK` | `true` or `false`; switches `services/` between mock and real |
| `GOOGLE_MAPS_ANDROID_API_KEY` | Android Maps key, build-time only (read by Dev1 in the app config, not by app code; restrict it to the app's package name) |

5. **Never use or expose the Supabase `service_role` key** in the app or the repo.
6. **EAS cloud builds do not upload `.env`.** Add every variable above with `eas env:create` for the `preview` environment. The `env` block in `eas.json` is committed, so put only non-secret values there (for example `EXPO_PUBLIC_USE_MOCK`), never the Gemini or Maps keys.
7. **Agents must never print, log or echo keys,** and must never copy values from `.env` into any other file.
8. **Agents must never run `git add` on `.env`,** and must stop and warn the developer if a key appears in a diff.
9. **If a key leaks:** revoke it, generate a new one, update `.env` and the EAS variables, then remove it from the repo (and from history if it was pushed).
10. **Pre-commit check:** run `git diff --staged` and search for `key`, `secret`, `token`, `eyJ` and `AIza`. Words like `token` also appear in normal code (QR tokens), so review each hit rather than skipping it.
11. **Ownership:** only Dev3 edits `.env.example`. Each developer keeps their own `.env` locally.

## Known limit
Anything prefixed `EXPO_PUBLIC_` is bundled into the APK and can be extracted by anyone who has the file. The Gemini key is therefore not truly secret: use a restricted, quota-limited key made for this hackathon and revoke it after judging. The safe design (not built in 4 hours) is a Supabase Edge Function that holds the key.
