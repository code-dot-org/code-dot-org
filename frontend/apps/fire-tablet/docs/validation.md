# Launchpad prototype validation

Evidence recorded on **2026-10-07**. This prototype uses the Studio React/TypeScript launchpad and five signed-out hosted activities. No physical Fire Tablet/Amazon Kids profile or iOS runtime has been tested. Automated results do not establish activity usability, child-profile compatibility, Focus Mode behavior, or production readiness.

This record supersedes the unrestricted launcher evidence. The [original wrapper record](https://github.com/code-dot-org/code-dot-org/blob/4d47fd5f5b4281ea4ca41801f656bc2826a4b41c/frontend/apps/fire-tablet/docs/validation.md) remains in Git history.

## Content selection

[Exhibit A](https://docs.google.com/document/d/1m_J9RVHiTadipL2_XcYBrzQcdVa8KCnKV4nxaHMswYE/edit?tab=t.0) supplies the titles and ages. Entries 1, 7, 8, 15 and 22 are Pre-Reader Express, AI for Oceans, Dance Party: AI Edition, Minecraft Adventurer and Music Lab. They sample courses, guided activities and free-play labs. All are listed as untested; selecting them does not change the tracker or certify a launch slate.

Live published Studio routes were inspected: the four `/s/` URLs redirect to `/courses/<selected-course>/units/1`. `/projects/music/new` redirects to a generated Music Lab project path. The catalog permits both course route families and the Music Lab project family. About, Donate, accounts, unrelated courses, external schemes, popups and downloads are excluded. Known YouTube `/embed/` paths are allowed only in media frames. Asset/API requests remain website behavior; this is not a comprehensive network/content filter.

## Automated evidence

| Check                                                        | Result                                                                                                                                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Yarn immutable install                                       | Passed with Node 20.20.2; existing workspace peer warnings remain                                                                                                                                                        |
| Standalone Studio launchpad build                            | Passed; one JavaScript bundle, 318,837 bytes, and 3,123,416 bytes total local assets including existing design-system fonts                                                                                              |
| Launchpad tests                                              | Six passed: curated selections, plugin arguments, browser fallback, duplicate suppression, close/focus restoration, and failure/retry                                                                                    |
| Existing Studio tests                                        | 25 files / 115 tests passed                                                                                                                                                                                              |
| Studio ESLint, Prettier, Stylelint, TypeScript               | Passed                                                                                                                                                                                                                   |
| Wrapper filtered release checks                              | Passed: `yarn release:dryrun --filter @code-dot-org/fire-tablet`                                                                                                                                                         |
| Normal Rails Studio build                                    | Passed; manifest entry remains only `entrypoints/application.tsx`, excluding the prototype entry                                                                                                                         |
| Android build and navigation unit tests                      | Passed; four policy tests cover permitted course redirects/generated project IDs, path boundaries, hostile origins/schemes/encoded paths, and media frame restrictions                                                   |
| iOS sync/project inspection                                  | Passed; Xcode project parses, custom bridge controller/plugin source registered, Swift PM pins Capacitor 8.5.2                                                                                                           |
| Asset inspection                                             | Android and iOS copied assets match the standalone build; APK's packaged assets/config match it too; no remote `server.url`                                                                                              |
| Chromium smoke                                               | Passed with Chromium 147.0.7727.15: five cards, keyboard/focus, 48px targets, 320px portrait/600px portrait/1024px landscape reflow, 200% text at 600px, zero axe WCAG A/AA violations and no launchpad Studio API calls |
| Mocked native browser boundary                               | Selected URL/policy, Home return/focus, and failure/retry passed; this does not execute Android or iOS views                                                                                                             |
| Physical Fire, Amazon Kids, screen reader, iOS build/runtime | Unverified                                                                                                                                                                                                               |

The launchpad imports neither the Rails router/account bootstrap nor lab modules. Its bundle inspection excludes TensorFlow and the current-user endpoint. The native interface is only exposed to the packaged local view; hosted activities use plain WebView/WKWebView instances without a Capacitor bridge.

## Debug APK

Path: `android/app/build/outputs/apk/debug/app-debug.apk`.

- Size: **12,444,893 bytes**.
- SHA-256: `07905855ecb473e8c8a4c60a9ca2f6725bdb579474c5705291b49692c0674c35`.
- Toolchain: Node 22.12.0, Azul Zulu JDK 21.0.12.1, Android SDK 36/build tools 36.0.0, Gradle 8.14.3.
- Debug signature verifies using APK Signature Scheme v2.
- Identity: `org.code.firetablet.debug` / **Studio (internal test)**; minimum/target API 28/36; placeholder icon/splash.
- Manifest inspection: INTERNET plus AndroidX's app-scoped signature receiver permission; cleartext and backup disabled; non-exported activity in `:curatedActivities`; local Capacitor WebView debugging disabled.

This is an internal debug artifact. No signed production candidate or store submission was made.

## Device checklist still required

Record exact build/hash, model/generation, Fire OS/API/WebView version, profile mode, date, steps, result and blocker owner. The user's requested baseline is the oldest currently sold-new model; the earlier Fire 7 (2022) candidate has not been confirmed or tested in this session.

- Cold start, tap each card, native Home, Android Back/iOS Back, repeated taps, background/resume, rotation and screen-reader focus return.
- Each course overview, required levels, next/back/restart and completion redirects; Music Lab create/run/restart. Confirm no required step needs an account or teacher.
- Blocked About/Donate/login/catalog/other-course links, window.open/target-blank, external app schemes and downloads. Check embedded media and document/frame navigation, including POST/redirect behavior.
- Offline startup, slow load, interrupted connectivity, HTTP errors, TLS failure, Retry and always-reachable Home. Do not disable HTTPS checks.
- Required audio/video/animation and touch controls on the actual Fire WebView and iPad WKWebView.
- Amazon Kids discovery/access, parental controls, educational-time/Focus Mode, and supported-device decisions remain production integration work.

The iOS project can be synced on Linux, but UIKit/WebKit compilation and iPad simulator/device validation require a Mac with Xcode. Neither platform has a verified runtime support matrix yet.
