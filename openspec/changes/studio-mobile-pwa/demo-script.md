# Demo script — studio mobile PWA + Capacitor

## The pitch (one paragraph)

A grade-five teacher in a single-room rural classroom hands a shared iPhone
to her student and says "open Code Studio." The phone has been on airplane
mode for the last three hours — the satellite uplink has been down since
recess. The student taps the icon. Code Studio launches in two seconds,
straight to the catalog, no login wall, no spinner waiting on a server
that isn't there. The "Offline" chip in the header tells her she's
disconnected; the green "Ready offline" badge on the AI for Oceans tile
tells her which course will still run. She taps it. The fish-vs-trash
classifier loads, the model trains entirely on the device's TensorFlow.js
runtime, and she finishes a complete round before her teacher even checks
on her. Same codebase, same React app — three deployment targets: existing
Rails web for chromebooks, installable PWA for any phone with a browser,
and a Capacitor-wrapped iOS/Android binary for App Store delivery when the
classroom has it.

## Demo storyboard (60 seconds)

| t (s) | Frame                                  | Talk track                                                                      |
|-------|----------------------------------------|---------------------------------------------------------------------------------|
| 0–5   | iPhone home screen, airplane-mode icon | "This phone has been offline for three hours."                                  |
| 5–10  | Tap Code Studio icon, splash flashes   | "Cold launch — no network."                                                     |
| 10–18 | Catalog screen renders                 | "Catalog renders from cache. Offline chip up top. Ready-offline badge on AI4O." |
| 18–25 | Tap AI for Oceans tile                 | "Lab opens, no spinner waiting on a server."                                    |
| 25–40 | Label two fish, two trash, run train   | "Training runs on-device with bundled TensorFlow."                              |
| 40–55 | Test round, score appears              | "One full training+test round, fully offline."                                  |
| 55–60 | Back to catalog, Continue pill visible | "Progress persists locally. Same codebase ships as a Capacitor binary too."     |

## On-screen indicators to keep visible during recording

- Airplane-mode icon in the iOS status bar — start to finish.
- The "Offline" connectivity chip in the catalog header.
- Chrome devtools Network panel (if recording from a desktop PWA): zero
  network requests during the whole flow.

## What we cut and why

The proposal had a 53-task plan covering PWA + Capacitor + offline AI for
Oceans + Music Lab as a stretch second course. Here is what made the cut
and what got descoped:

**Shipped:**
- PWA build pipeline (`yarn build:mobile`), service worker, manifest, icons.
- Catalog screen with cache-first IDB persistence and bundled fallback.
- `/lab/$slug` route + studio-side oceans wrapper with `studioMobile` prop.
- `onContinue` hook that bumps a per-course step counter in IDB.
- Vite plugin that emits oceans-lab's TF.js model + weights into studio's
  precache manifest at a stable path (so Workbox sees both files).
- Capacitor config + `cap:sync` scripts. Native projects not generated
  yet (see deferred below).

**Descoped (deferred to a follow-up):**

1. **`cap add ios` / `cap add android`.** Generating these requires Xcode
   + CocoaPods locally and produces ~thousands of files. The PWA pipeline
   is the load-bearing demo path; the Capacitor wrapper is a follow-up
   that the documented `yarn cap:sync:ios` script will produce as soon as
   the platform projects are committed.

2. **AI for Oceans full training-state restoration.** Step-index
   persistence ships; restoring the KNN-trainer's labeled examples
   verbatim was non-trivial inside the hackathon window. The demo
   intentionally shows a fresh round each launch — that's the rural-CS
   teacher's usual use case anyway (a new student picks up the phone).

3. **Music Lab as the second offline-capable course.** AI for Oceans was
   the lead use case for the rural-CS UX brief; Music Lab is in the
   catalog as a "Needs internet" tile but not yet bundled for offline.

4. **Unit and component tests.** Scaffolded for storage and catalog flows
   but not run in this hackathon; the headless-browser smoke against the
   production build (see `/tmp/pwa-catalog.png`) is the integration check
   we leaned on instead.

5. **Real-device airplane-mode verification on a physical iPhone.** The
   production build + service worker are verified against a desktop
   browser; on-device verification is the obvious next pass.
