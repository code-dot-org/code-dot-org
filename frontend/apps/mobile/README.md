# @code-dot-org/mobile

Capacitor.js shell that wraps `@code-dot-org/studio` for iOS and Android.

**This workspace is intentionally near-empty.** Web logic — routes,
components, state, the catalog, the labs — lives in `frontend/apps/studio`.
This workspace only holds `capacitor.config.ts`, the generated `ios/` and
`android/` native projects, and a thin `package.json` listing Capacitor
plugins.

If you find yourself adding React code here, you almost certainly want
`frontend/apps/studio` instead.

## Why a separate workspace?

Two reasons:

1. **Lifecycle separation.** Studio ships continuously on every merge.
   iOS / Android ship through App Store / Play Store review. Putting the
   native trees in studio's workspace pollutes its CI and changesets with
   Xcode / Gradle config that web contributors never touch.
2. **Plugin scan hygiene.** Capacitor's CLI walks `node_modules` to find
   plugins. Hoisted monorepo deps confuse that scan; isolating the shell
   workspace lets `includePlugins` in `capacitor.config.ts` stay short and
   accurate.

## First-time setup

The `ios/` and `android/` directories are generated once via the
Capacitor CLI and then committed. After cloning a fresh repo:

```bash
cd frontend
yarn install
yarn workspace @code-dot-org/studio build
cd apps/mobile
npx cap add ios
npx cap add android
```

Commit the generated `ios/` and `android/` trees. Subsequent contributors
do not re-run `cap add`.

## Build + run loop

```bash
# 1. Build the web app (studio)
yarn workspace @code-dot-org/studio build

# 2. Sync the build into the native shells
yarn workspace @code-dot-org/mobile sync

# 3. Run
yarn workspace @code-dot-org/mobile ios     # opens iOS Simulator
yarn workspace @code-dot-org/mobile android # opens Android Emulator
```

You can also use `open:ios` / `open:android` to open the project in Xcode
/ Android Studio without immediately running.

## webDir strategy

`capacitor.config.ts` sets `webDir: '../studio/dist'` — `cap sync` reads
studio's build output directly. No copy, no symlink.

If your environment rejects the cross-workspace path (some Capacitor
plugins resolve `webDir` in ways that break on parent-relative paths),
fall back in this order:

1. **Symlink.** `ln -s ../studio/dist www` inside this directory, then
   change `webDir: '../studio/dist'` → `webDir: 'www'`. Update this
   README to note the current state.
2. **Copy script.** Last resort. Add `"sync": "rm -rf www && cp -r
   ../studio/dist www && cap sync"`. Slower (cache miss every build) but
   universally compatible.

The direct-path approach is preferred because it has zero filesystem
indirection and zero copy cost.

## Adding a Capacitor plugin

1. Add the workspace dependency to this workspace's `package.json`:
   ```bash
   yarn workspace @code-dot-org/mobile add @capacitor/haptics
   ```
2. List the plugin in `capacitor.config.ts` under `includePlugins`.
3. `yarn workspace @code-dot-org/mobile sync` to install the plugin into
   the native shells.
4. Import and use the plugin from studio's code (not here).

## Service worker behavior on native

The studio web app registers a PWA service worker. **That registration is
gated on `!Capacitor.isNativePlatform()`** — see
`frontend/apps/studio/entrypoints/application.tsx`. The gate is required:
WKWebView under `capacitor://localhost` cannot reliably register service
workers, and a service worker would intercept the Capacitor bridge and
break native plugin calls.

If you ever need the SW on native, you'll have to set `server.hostname`
to an HTTPS origin and configure App-Bound Domains — talk to
@stephen.liang first.

## Release / signing

Not yet wired up. iOS code signing, fastlane, App Store Connect, Google
Play Console — all deferred until we ship a real build.
