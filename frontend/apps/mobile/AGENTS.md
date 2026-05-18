# frontend/apps/mobile

Capacitor.js shell. Wraps `@code-dot-org/studio` for iOS and Android.

**Read [`docs/architecture.md`](./docs/architecture.md) before doing any
mobile-app work.** It covers the build modes, the sync flow, the
service-worker gate, lab integration patterns (lazy chunks, asset
emission, TFJS weight routing, container-query responsive sizing), and
the known FIXMEs.

**This workspace is intentionally near-empty.** If you find yourself
adding React or TypeScript here, you almost certainly want
`frontend/apps/studio` instead. See the workspace README for the
boundary rationale.

## When to edit what

| You want to... | Edit here? |
|---|---|
| Add a course or lab | ❌ — edit `frontend/apps/studio/src/modules/catalog/` |
| Change UI, routes, or business logic | ❌ — edit `frontend/apps/studio/` |
| Add a Capacitor plugin | ✅ — workspace dep + `includePlugins` |
| Adjust iOS / Android permissions or entitlements | ✅ — `ios/App/App/Info.plist`, `android/app/src/main/AndroidManifest.xml` |
| Change app id, name, or icon | ✅ — `capacitor.config.ts`, native asset folders |
| Change the `webDir` strategy | ✅ — `capacitor.config.ts`, document in README |

## Adding a Capacitor plugin

1. Add the workspace dependency:
   ```bash
   yarn workspace @code-dot-org/mobile add @capacitor/haptics
   ```
2. List the plugin in `capacitor.config.ts` under `includePlugins`. This is
   required in a Turborepo monorepo — hoisted `node_modules` confuses the
   Capacitor CLI's plugin discovery scan.
3. Sync: `yarn workspace @code-dot-org/mobile sync`
4. Import and use from studio's TypeScript code (not from this workspace).

## webDir strategy

Currently set to `'../studio/dist'` — direct path, no copy or symlink.
This is the cleanest option but a small set of plugins fail to resolve
parent-relative paths. Fallback order if you hit problems:

1. Symlink: `ln -s ../studio/dist www` then change `webDir: 'www'`.
2. Copy script: replace the `sync` script with `rm -rf www && cp -r
   ../studio/dist www && cap sync`.

Document the current state in this folder's README when you change it.

## What lives where

```
frontend/apps/mobile/
  capacitor.config.ts    # app id, name, webDir, plugin allowlist
  package.json           # Capacitor + plugin deps only
  ios/                   # generated; commit to repo
  android/               # generated; commit to repo
  README.md              # boot + sync instructions
  AGENTS.md              # (this file)
```

Notably **not** here: no `src/`, no React, no Vite, no Vitest. Web logic
lives in `frontend/apps/studio`.

## Service worker behavior

Studio registers a PWA service worker gated on
`!Capacitor.isNativePlatform()` (see
`frontend/apps/studio/entrypoints/application.tsx`). The gate is
required:

- WKWebView under `capacitor://localhost` cannot reliably register SWs
  (capacitor#7069, #4122).
- A SW would intercept the Capacitor bridge and break native plugin
  calls.

If you ever need a SW on native, talk to platform engineering first —
the path involves `server.hostname` and App-Bound Domains and is not a
simple flip.

## Native code

We don't have any custom native plugins yet. If you write Swift / Kotlin
plugin code, it lives in `ios/App/App/` and
`android/app/src/main/java/<package>/` — but consider whether a
community plugin already exists before writing custom native code.

## Release / store submission

Deferred. iOS code signing, fastlane, App Store Connect, Google Play
Console — none of this is wired yet. When we ship a real build, add a
`RELEASING.md` here and link from this AGENTS.md.

## Continuous improvement

If you hit a Capacitor / native gotcha that costs you more than 15
minutes, document it here so the next person finds it faster.
