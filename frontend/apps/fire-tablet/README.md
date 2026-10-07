# Studio activity app prototype

This workspace packages **`frontend/apps/studio` as the React/TypeScript home screen** of an installed Android/iOS application. A separate Studio entry builds only the launchpad and design system. Hosted activities provide the existing `apps/` experience. There are no local accounts, progress features, analytics, activity patches, bundled labs, or offline curriculum.

The five demo selections come from the [Exhibit A testing tracker](https://docs.google.com/document/d/1m_J9RVHiTadipL2_XcYBrzQcdVa8KCnKV4nxaHMswYE/edit?tab=t.0), which marks them **untested**:

| Entry | Activity                | Ages  | Variation                 |
| ----- | ----------------------- | ----- | ------------------------- |
| 1     | Pre-Reader Express      | 4–7   | Course for young learners |
| 7     | AI for Oceans           | 7–11  | Guided AI activity        |
| 8     | Dance Party: AI Edition | 11–14 | AI, animation, and audio  |
| 15    | Minecraft Adventurer    | 7–14  | Guided block programming  |
| 22    | Music Lab               | 7–14  | Open-ended music creation |

They sample all three tracker groups; this prototype does not certify Fire Kids compatibility or establish an approved launch slate.

## Web development

From `frontend/`, using the repository Node 20 setup:

```bash
yarn install --immutable
yarn workspace @code-dot-org/fire-tablet build
yarn workspace @code-dot-org/fire-tablet dev
```

Visit `http://127.0.0.1:5173/`. Browser preview renders the same launchpad and opens ordinary website tabs, as its visible notice explains. It does not emulate native containment. Pass `--port 5174` if 5173 is occupied.

`build` runs Studio's dedicated Turbo `build:launchpad` task and its theme/font dependencies. Capacitor's `webDir` points directly to `apps/studio/dist-launchpad/`. Studio is not imported as a library. Its normal Rails entry is unchanged; the launchpad entry does not initialize Rails authentication, CSRF, observability, a router, or curriculum labs. No PWA service worker is registered in the packaged app.

## Native activity boundary

The catalog and UI live in `apps/studio/src/modules/launchpad/`. Its `openActivity` calls the same local plugin interface on Android and iOS:

```ts
CuratedActivities.open({url, title, allowedPaths});
```

The promise resolves when the native view closes; the launchpad restores focus to the selected card. The UI suppresses parallel openings and allows retry after failure. There is no automatic activity launch.

Android registers the plugin in `MainActivity`. A non-exported `CuratedActivity` runs a plain WebView in a separate process/data directory, without a Capacitor bridge. iOS registers the same plugin from `StudioBridgeViewController` and presents a plain WKWebView with a non-persistent data store. Both provide Home, Back, loading feedback, and Retry. HTTPS validation retains platform defaults.

Only the selected course's `/s/<course>` and `/courses/<course>` families are permitted, or `/projects/music` for generated Music Lab projects. Matching checks exact HTTPS/host/port and path-segment boundaries; encoded/ambiguous paths are rejected. About, Donate, account pages, other activities, external schemes, popups, and downloads are blocked rather than opened in another app. Known YouTube embed paths are permitted only in media frames. Asset/API requests remain website behavior. Android also checks main-document requests and page starts because its navigation callback does not cover POSTs or app-initiated loads. This is a prototype navigation boundary, not a complete kiosk or network/content filter; embedded media and course transitions need actual-device testing.

A future local Studio lab can replace a hosted destination without replacing the launchpad. This prototype supplies only the hosted pathway.

## Android

Use Node 22+, JDK 21, and Android SDK platform 36/build tools 36.0.0/platform-tools. Set `JAVA_HOME` and `ANDROID_HOME`. From `frontend/`:

```bash
yarn workspace @code-dot-org/fire-tablet android:build:debug
cd apps/fire-tablet/android
./gradlew testDebugUnitTest
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Build scripts sync current launchpad assets before assembling. The temporary identity remains `org.code.firetablet.debug` / **Studio (internal test)**, API 28 minimum, with placeholder icon/splash. A physical Fire Tablet and Amazon Kids profile are required for compatibility claims.

## iOS portability

On a Mac with the Capacitor 8-supported Xcode version, using Node 22+:

```bash
yarn workspace @code-dot-org/fire-tablet ios:sync
yarn workspace @code-dot-org/fire-tablet ios:open
```

Choose an iPad simulator in Xcode and run the `App` target. The checked-in project uses Swift Package Manager, the same temporary bundle identity, and the same Studio assets/catalog/interface. Native plugin source and storyboard registration are included. Linux can sync and inspect the project but cannot compile or run its UIKit/WebKit application; iOS runtime validation remains pending.

## Validation and release

```bash
yarn workspace @code-dot-org/studio exec vitest run src/modules/launchpad
yarn release:dryrun --filter @code-dot-org/fire-tablet
```

CI rebuilds the APK when the wrapper, Studio, or shared theme/fonts change and runs Android navigation-policy unit tests. Ordinary Rails builds invoke no native tools. See [validation.md](docs/validation.md) for evidence and [release.md](docs/release.md) for the separate release process. No app is published or submitted by these commands.
