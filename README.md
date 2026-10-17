# RideOn — Group Riding App (Expo / React Native)

A starter scaffold for the RideOn app: real Android/iOS project built with Expo,
so you can preview it on your own phone in minutes and later build a signed
APK/AAB for the Play Store.

## What's included (working screens)

- **Rides (Home)** — discover/browse rides, "Create Ride" flow
- **Ride Details** — briefing, rider list, "I've read the briefing → Join"
- **Live Tracking** — map with your location, group progress, rider list with
  a mock "Group Split Alert" (⚠️ rider X km behind)
- **Emergency / SOS** — big SOS button + breakdown assistance (puncture,
  fuel, engine, etc.)
- **Chat** — ride-focused quick-tap messages (STOP / FUEL / FOOD / etc.)
- **Profile** — rider stats, badges, bike profile

Everything currently runs on **mock data** (`src/data/mockData.js`) — no
backend yet. That's intentional: navigation + UI first, then wire real data.

## Run it

1. Install [Node.js](https://nodejs.org) (LTS) and the Expo Go app on your
   phone (Play Store / App Store).
2. In this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code with Expo Go (Android) or the Camera app (iOS). The app
   opens live on your phone — no build step needed for development.

## Building a real installable app later

- `npx expo prebuild` generates native `android/` and `ios/` folders.
- `eas build -p android` (via [EAS Build](https://docs.expo.dev/build/introduction/))
  produces a signed APK/AAB for the Play Store — free tier available.

## Roadmap — mapping your feature list to next build steps

| Feature area (from your spec) | Status | Next step |
|---|---|---|
| Group ride creation/join, RSVP, roles | Scaffolded (Create Ride, roles shown) | Add backend (Firebase/Supabase) for real invite links + RSVP |
| Live group tracking, split alert | Scaffolded UI + real device GPS via `expo-location` | Add a backend to broadcast each rider's location (Firestore realtime, or a WebSocket server) so *other* riders' live positions show, not just yours |
| Navigation ("Follow Group Route") | Not built yet | Add a button that opens Google Maps/Mappls via `Linking.openURL()` with waypoints, while this app keeps tracking in background |
| Fuel management | Not built yet | Simple screen: bike tank capacity + mileage → estimated range, using data already in Bike Profile |
| Emergency SOS + crash detection | SOS + breakdown UI done | Wire SOS to actually send location (SMS/push) to group; crash detection needs `expo-sensors` accelerometer + a "are you ok?" timeout prompt |
| Breakdown assistance ("I'll help") | UI done | Add "I'll help" action + mini-route to the rider needing help |
| Rider roles & formation view | Data model in place (Leader/Marshall/Sweep) | Add a visual formation diagram screen |
| Offline mode | Not built yet | Cache last-known rider positions + route locally (AsyncStorage), sync on reconnect |
| Ride chat quick buttons | Done | Wire to real-time messaging backend later |
| Ride memories / stats card | Not built yet | Post-ride summary screen + share-as-image (can use `react-native-view-shot`) |
| Rider stats & badges | UI done with mock numbers | Compute from real ride history once backend exists |
| Ride discovery + filters | Basic list done | Add filters (distance, difficulty, type) |
| Trip planning (multi-day) | Not built yet | Extend Create Ride into a multi-day itinerary builder |
| Bike profile & maintenance reminders | Done (static) | Make editable, add service-due push notification |
| Safety briefing / rules gate | Done | — |

## Suggested next session

Pick ONE feature area above and we build it fully (real backend wiring,
not just UI) rather than spreading thin across all 15 — that's the fastest
way to get to a demo-able app.
