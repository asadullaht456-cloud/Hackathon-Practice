# DEMO KIT

App name: **Chalo** (working name; replace everywhere before submission). Rubric tags: **F** Functionality 25%, **P** Platform 20%, **U** UI/UX 20%, **I** Innovation 15%, **D** Presentation & Demo 20%.

## 1. Slide outline (6 slides)  [D, U]
**Slide 1: Problem**
- Title: "Three networks. Three tickets. No idea when the bus comes."
- Speedo, Metrobus and Orange Line each work alone.
- Feeder timings are a guess. Fares are hard to compare.
- Students must prove eligibility by hand, again and again.

**Slide 2: Solution**
- Title: "Chalo: every ride in Lahore, one app."
- See every vehicle live. Plan by time or by fare.
- Top up once, board with one QR.
- Verified students ride free, automatically.

**Slide 3: Features** (one screenshot each)
- Live map and trip planner: "Fastest or cheapest, across all three networks."
- Wallet and rotating QR: "Top up in seconds. A new QR every 30 seconds."
- Student zero-fare pass: "Scan your ID, prove you are you, ride free on your own device."
- Auto Glare Mode: "The app adapts to Lahore sunlight."

**Slide 4: Tech stack**
- Expo + TypeScript + Expo Router + React Native Paper
- Supabase: Auth, Postgres, Realtime, Row Level Security, SQL functions
- Gemini vision for ID reading; Reanimated for animation; EAS Build for the APK
- Honest scope: fleet feed and payments are simulated; wallet, QR and RLS are real.

**Slide 5: Impact and future scope**
- Impact: fewer cash queues, clearer fares, fairer student access.
- Next: real operator GPS feeds, NFC card binding, live RAAST and JazzCash, server-side student verification with institutions.

**Slide 6: Demo**
- Title: "Let's ride."
- Live demo. APK and repo links on screen.

## 2. 90-second video script  [D, F, U, I]
| Time | Screen | Voiceover |
|---|---|---|
| 0:00-0:08 | Title card, then map | "Lahore commuters juggle three networks and no clear answers. Meet Chalo." |
| 0:08-0:22 | Live map, latency badge; Plan screen, toggle Fastest/Cheapest | "Every vehicle moves live, with the update age on screen. Plan a trip across networks by time or by fare." |
| 0:22-0:38 | Wallet: top-up (mock JazzCash), balance animates, QR refreshes | "Top up instantly. Your pass is a QR that refreshes every 30 seconds." |
| 0:38-0:48 | Second phone, Validator scans; fare deducted | "A conductor scans it. Fare deducted, pass used once." |
| 0:48-1:12 | Student flow: consent, ID capture, extracted details, liveness, upgrade; Rs 0 scan | "Students scan their ID and pass a liveness check. The account upgrades, and the pass rides free, locked to this phone." |
| 1:12-1:24 | Cover the light sensor or use a torch; theme switches | "Our Auto Glare Mode reads ambient light and switches to a high-contrast theme for outdoor use." |
| 1:24-1:30 | Logo and links | "One app. Every ride. Chalo." |

## 3. 3-minute pitch (3 speakers)  [D]
**Speaker A: Problem and users (0:00-1:00)**
"Every day, Lahore commuters switch between Speedo, Metrobus and the Orange Line. Each system sells its own ticket. Feeder buses arrive when they arrive. Nobody can compare fares. And students, who should ride free, prove it manually, over and over. We asked: what if one app handled all of it?"

**Speaker B: Solution and demo (1:00-2:10)**
"Chalo shows all three networks on one live map. Vehicle positions stream over Supabase Realtime and the screen shows how old each update is. The planner finds the fastest or cheapest route across networks. You top up your wallet, and your QR changes every 30 seconds, so screenshots are useless. Let us show a student: she scans her ID, passes a liveness check, and her pass becomes zero-fare and locked to her device. And outdoors, Auto Glare Mode switches to a high-contrast theme."

**Speaker C: Tech, honesty and future (2:10-3:00)**
"Under the hood: Expo and TypeScript, Supabase for auth, data and realtime. Money and QR rules run in database functions with row-level security, so the app cannot change a balance. To be clear: the fleet feed and payments are simulated, because no sandbox exists in a hackathon window. Each is one swappable layer. Next: operator GPS feeds, NFC card binding, live RAAST and JazzCash, and server-side student verification. Thank you."

## 4. Likely judge questions  [F, P, I, D]
1. **Is the GPS real?** No. A Postgres function moves simulated vehicles every second and Realtime pushes them. Replacing the writer with an operator feed does not change the app.
2. **Do you really hit sub-3-second latency?** Updates are pushed every second, not polled, and the app shows each update's age. Real networks add telemetry delay we cannot measure yet.
3. **Are payments real?** No. JazzCash and RAAST are mocked. The ledger and balance updates are real, atomic database operations.
4. **How do you stop QR sharing or replay?** Tokens expire in 30 seconds, work once, and are validated server-side. Student tokens are issued only to the device the account is bound to.
5. **Is student verification real?** The ID is read with Gemini vision. Liveness is a scripted prompt (simulated), and in this demo the server trusts the result. Production needs server-side checks against institution records.
6. **Where is NFC?** Not built in 4 hours (it needs a native build). The wallet and ledger already support binding a card ID to an account.
7. **How does routing work?** A graph of stops, routes and walking transfers. Fastest minimizes total minutes; cheapest minimizes the sum of boarding fares. Fares and coordinates are approximate demo data.
8. **What about privacy and keys?** The ID image is sent only after consent and never stored; we keep the extracted name, institution and a liveness flag. RLS limits every user to their own rows. `EXPO_PUBLIC_` keys ship inside the APK, so ours are restricted and revoked after judging.

## 5. Demo accounts and data checklist  [F, D]
Do not commit real passwords; share them in the team chat.
| Account | Email | Password | Use |
|---|---|---|---|
| Citizen demo | `<fill in>` | `<fill in>` | Top-up, QR, plan |
| Student demo (starts as citizen) | `<fill in>` | `<fill in>` | Live upgrade |
| Validator phone | any signed-in account | `<fill in>` | Scan QR |

- [ ] Schema, seed and simulator running; 6 vehicles visibly moving
- [ ] Citizen wallet starts at Rs 0; top-up amount decided (for example Rs 200)
- [ ] Student demo account is still a citizen before the demo
- [ ] A sample student ID card (team member's own or a mock) ready for the camera
- [ ] APK installed on 2 phones; both signed in; camera and location permissions granted
- [ ] Stable Wi-Fi or hotspot; battery above 50%; torch ready for Glare Mode
- [ ] `EXPO_PUBLIC_USE_MOCK=false` in the APK build
- [ ] Backup screen recording of the full flow

## 6. Submission checklist  [D]
- [ ] Android APK installs on a clean phone and opens
- [ ] Demo video (about 90 s), exported and playable
- [ ] Slides (PDF) with screenshots
- [ ] Public or shared repo link; `v1.0-submission` tag pushed
- [ ] README has setup steps and screenshots; `.env.example` has fake values only
- [ ] No keys in the repo (final `git log -p` search for `eyJ`, `AIza`, `secret`)
- [ ] All links tested from a different device
