# Chalo

*Working name. Replace before submission.*

**One app to see every Speedo, Metrobus and Orange Line vehicle live, plan the cheapest or fastest trip, and board with a single QR. Verified students ride free.**

## Features
- **Live map and trip planner:** vehicles from all three networks move in real time; plan by fastest or cheapest.
- **Wallet and rotating QR:** top-up (mock JazzCash/RAAST) and a pay-as-you-go QR that refreshes every 30 seconds, with a validator screen.
- **Student zero-fare pass:** ID capture and OCR, liveness prompt, then a device-bound zero-fare QR.
- **Auto Glare Mode:** high-contrast theme switched by the ambient light sensor.

**What is simulated:** the fleet GPS feed, the payment gateway, and the liveness check. NFC card binding is not built yet.

## Tech stack
Expo (React Native) + TypeScript + Expo Router + React Native Paper + Reanimated, Supabase (Auth, Postgres, Realtime, RLS, SQL functions), Gemini vision for ID reading, EAS Build.

## Setup
```
git clone <repo-url>
cd <repo-folder>
npm install
cp .env.example .env     # then fill in your own values
npx expo start
```
Create the database by running `supabase/schema.sql` in the Supabase SQL editor. Set `EXPO_PUBLIC_USE_MOCK=true` in `.env` to run the app without a backend. Never commit `.env`; see `docs/SECURITY.md`.

## Build the APK
```
eas build -p android --profile preview
```
Add the variables from `.env.example` to the EAS `preview` environment first (`eas env:create`), because `.env` is not uploaded to EAS.

## Team
- Dev1: `Asadullah` (lead, auth, navigation, build)
- Dev2: `Rikza` (frontend)
- Dev3: `Isha` (backend, delivery)

## Screenshots
`<add screenshots: map, planner, wallet and QR, student verification, glare mode>`

## Docs
`docs/PROBLEM.md`, `docs/MVP.md`, `docs/ARCHITECTURE.md`, `docs/OWNERSHIP.md`, `docs/TASKS.md`, `docs/SECURITY.md`, `docs/GIT_RULES.md`, `docs/DEMO.md`
