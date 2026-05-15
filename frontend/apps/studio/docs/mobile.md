# Studio mobile build (PWA + Capacitor)

This studio app ships three ways from the same Vite codebase:

1. **Rails-served** (default) — `yarn dev` / `yarn build`. Bundled by
   `vite-plugin-rails`; assumes a Rails origin. No service worker.
2. **PWA** — `yarn build:mobile` then host `dist/` on any static origin.
   `vite-plugin-pwa` generates the service worker and Workbox precache.
3. **Capacitor** — `yarn cap:sync:ios` / `yarn cap:sync:android`. The
   native binary loads the same `dist/` from `file://`.

The build mode is selected by the `VITE_MOBILE=1` env var, consumed in
`vite.config.ts`:

- `base: './'` so asset URLs are relative (works under `file://` and any path).
- `vite-plugin-rails` is dropped.
- `vite-plugin-pwa` is registered. Workbox precaches the built shell plus
  the oceans-lab chunk (≤8 MB cap so TF.js + model weights fit).

## One-time iOS setup

```sh
cd frontend/apps/studio
yarn build:mobile                # produces dist/
npx cap add ios                  # creates ios/ workspace
cd ios/App && pod install        # CocoaPods, requires Xcode
```

Open `ios/App/App.xcworkspace` in Xcode to run on the simulator or a
real device. Commit the generated `ios/` directory once.

## One-time Android setup

```sh
yarn build:mobile
npx cap add android
```

Open `android/` in Android Studio. The default SDK target is whatever
Capacitor's installed version pins; bump in `android/variables.gradle`
if needed.

## Inner dev loop

UI work happens in browser-based PWA mode — `yarn dev` against Vite is
much faster than rebuilding the native shell every change. Sync to
Capacitor only for occasional native verification:

```sh
yarn cap:sync:ios       # rebuild dist/ + cap sync ios
yarn cap:sync:android   # rebuild dist/ + cap sync android
```

## App icons and splash screens

The PWA reads icons from `public/icons/`. Capacitor reads from
`ios/App/App/Assets.xcassets/AppIcon.appiconset/` and
`android/app/src/main/res/`. Use `npx capacitor-assets generate` from
the same `public/icons/icon-source.svg` once the `@capacitor/assets`
dev dependency is installed.

## Sanity checklist before sharing a build

1. `yarn build:mobile` succeeds and `dist/sw.js` exists.
2. `dist/index.html` references assets with `./` (no leading slash).
3. Opening `dist/index.html` via `file://` renders the catalog.
4. `yarn cap:sync:{ios,android}` finishes with no warnings about
   missing `webDir` content.
