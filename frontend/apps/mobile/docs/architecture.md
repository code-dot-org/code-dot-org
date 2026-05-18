# Mobile app architecture

`@code-dot-org/mobile` is a Capacitor.js shell that wraps `@code-dot-org/studio`'s
built SPA for iOS and Android. **No web code lives here.** Routes,
components, state, the catalog, the labs — all of that is in
`frontend/apps/studio/`. This workspace owns the native projects, the
Capacitor config, and the build/sync glue.

This doc is for anyone touching the mobile build path: the Capacitor
config, the native projects, the studio build flags that mobile depends
on, asset pipelines, or per-lab mobile fixes.

## Component map

```
┌──────────────────────────────────────────────────────────────────┐
│ frontend/apps/mobile               native shell                  │
│   capacitor.config.ts              app id, web dir, plugins      │
│   ios/, android/                   generated native projects     │
│   resources/                       icon source PNGs              │
└────────────────┬─────────────────────────────────────────────────┘
                 │ cap sync copies webDir into native assets
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│ frontend/apps/studio               web app (SPA)                 │
│   vite.config.ts                   build pipeline                │
│     CAPACITOR_BUILD=1              skip vite-plugin-rails        │
│     --base=./                      relative asset URLs           │
│   src/routes/__root.tsx            layout (hides footer in labs) │
│   src/modules/labs/                lab registry, oceans wrapper  │
└────────────────┬─────────────────────────────────────────────────┘
                 │ lazy(() => import('@code-dot-org/oceans-lab'))
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│ frontend/packages/labs/oceans      lab package                   │
│   vite.config.ts                   library build                 │
│     emitModelAssets                emits TFJS model + .bin       │
│   src/oceans/OceanObject.ts        custom fetchFunc IOHandler    │
│   src/oceans/styles/oceansLab.css  responsive frame              │
└──────────────────────────────────────────────────────────────────┘
```

## Build modes

The studio package builds two ways. Mobile uses the second.

| Script                       | Plugin set                   | `base`              | Output `dist/`                                                |
| ---------------------------- | ---------------------------- | ------------------- | ------------------------------------------------------------- |
| `yarn build`                 | `vite-plugin-rails` enabled  | `/frontend-studio/` | Rails-style manifest + assets under `dist/frontend-studio/`   |
| `yarn build:mobile`          | `vite-plugin-rails` skipped  | `./`                | Standalone SPA with `dist/index.html` + relative asset URLs   |

The mobile build sets two flags:

```
CAPACITOR_BUILD=1 vite build --base=./
```

- `CAPACITOR_BUILD=1` makes `vite.config.ts` drop the Rails plugin. Its
  `config()` hook unconditionally sets `base` from `publicOutputDir`,
  beating both `userConfig` and the `--base` CLI flag.
- `--base=./` makes asset URLs in `index.html` relative, which is what
  Capacitor's WKWebView / Android WebView serves correctly at
  `https://localhost/`. The absolute Rails-style URLs would resolve to
  `https://localhost/frontend-studio/assets/*` and 404 in the native
  bundle.

Router basepath in `src/modules/router/index.ts` is derived from
`import.meta.env.BASE_URL`. When `BASE_URL` is relative (`./`), the
basepath collapses to `/app`. When it's absolute (`/frontend-studio/`),
the basepath becomes `/frontend-studio/app`. This keeps both build modes
addressable.

## Sync flow

```
yarn workspace @code-dot-org/mobile sync
  └─ yarn workspace @code-dot-org/studio build:mobile
       └─ writes frontend/apps/studio/dist/
  └─ cap sync android (and ios when generated)
       └─ copies dist/ → android/app/src/main/assets/public/
       └─ writes android/app/src/main/assets/capacitor.config.json
       └─ updates Android plugin entries
```

`webDir: '../studio/dist'` in `capacitor.config.ts` points at the
mobile-flavored build output. `cap sync` reads from there.

## Service worker gate

`vite-plugin-pwa` emits a generateSW service worker. Registration in
`frontend/apps/studio/entrypoints/application.tsx` is gated:

```ts
function registerServiceWorker(): void {
  if (Capacitor.isNativePlatform()) return;
  if (!('serviceWorker' in navigator)) return;
  import('virtual:pwa-register').then(({registerSW}) => registerSW({immediate: true}));
}
```

Two reasons:

1. WKWebView under `capacitor://localhost` cannot reliably register
   service workers (capacitor#7069, #4122).
2. A SW that did register would intercept the Capacitor plugin bridge.

The PWA web target uses the SW. iOS / Android shells don't.

## Workbox precache

The PWA precache covers the shell only — no `.js`:

```ts
globPatterns: ['**/*.{css,html,svg,png,webp,woff2}'],
```

Lab chunks are large (oceans-lab is ~3.4 MB with bundled tfjs/magenta).
Putting them in the precache would (a) inflate first-visit download,
(b) trip vite-plugin-pwa's hard error on any chunk over
`maximumFileSizeToCacheInBytes`. They cache at runtime on first fetch.

## Lab integration patterns

### Lazy chunk discipline

Labs are registered in
`frontend/apps/studio/src/modules/labs/router/getLabEntrypoint.ts`:

```ts
['oceans']: lazy(() => import('@/modules/labs/oceans'))
```

The `import()` path **must be a literal string**. Templated paths
(`import(\`./${name}\`)`) silently fail at runtime in the signed iOS
bundle because Vite can't analyze the template and never emits the
chunk.

### Asset references in lab packages

Labs are built in Vite library mode. Library mode forcibly inlines
`?url` and `new URL(import.meta.url)` asset references as data URIs
(documented, ignores `assetsInlineLimit`). To keep model files as real
emitted assets — so studio's bundle can re-emit them through its asset
pipeline — labs use an explicit `emitFile` plugin:

```ts
function emitModelAssets(): Plugin {
  return {
    name: 'emit-model-assets',
    generateBundle() {
      this.emitFile({type: 'asset', fileName: 'assets/models/model.json', source: ...});
      this.emitFile({type: 'asset', fileName: 'assets/models/group1-shard1of1.bin', source: ...});
    },
  };
}
```

The lab's source then references each file via `new URL(...)`:

```ts
const modelJsonUrl = new URL('./assets/models/model.json', import.meta.url).href;
const weightShardUrl = new URL('./assets/models/group1-shard1of1.bin', import.meta.url).href;
```

When studio re-bundles the lab's `.mjs`, Vite sees both `new URL`
references and re-emits both files into studio's `dist/assets/` (hashed).
Without the `.bin` reference in JS, studio's bundler would only emit
the JSON; the weight shard would 404 at runtime.

We tried `@laynezh/vite-plugin-lib-assets` as the canonical workaround
for the inline-on-library-build behavior. It rewrites asset references
through `?url` internally, which trips `@rollup/plugin-commonjs` during
the CJS pass of our dual-format build (`Could not resolve "*.json?url"
from "*.json?url?commonjs-external"`). The explicit emit composes
cleanly with both ES and CJS outputs.

### TFJS weight-shard fetch routing

TFJS reads `weightsManifest[].paths` from `model.json` and resolves
each weight file as a sibling URL. Studio's bundler hashes `model.json`
to `assets/model-<hash>.json` and `group1-shard1of1.bin` to
`assets/group1-shard1of1-<hash>.bin` — sibling resolution produces a
404 because the JSON references the unhashed filename.

The lab's `initMobilenet` overrides the fetch function on the TFJS
IOHandler to route the `.bin` request to the bundler-emitted URL:

```ts
const modelIO = tf.io.http(modelJsonUrl, {
  fetchFunc: (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.endsWith('group1-shard1of1.bin')) {
      return fetch(weightShardUrl, init);
    }
    return fetch(input, init);
  },
});
```

`fetchFunc` is the TFJS 1.x option name. Later versions use
`customFetch` or `weightUrlConverter`; update when bumping TFJS.

### Responsive frame sizing

The lab uses CSS container queries to size its 16:9 frame against the
available area. This requires every ancestor in the flex chain to have
a definite block-size — otherwise `100cqb` returns 0 and the frame
collapses or hits its `min-width` floor.

The root layout in
`frontend/apps/studio/src/routes/__root.tsx` uses `height: 100dvh`
(not `minHeight`) to provide that definite chain.

```css
.oceans-lab-shell { container-type: size; }
.oceans-lab-frame {
  width: min(100cqi, calc(100cqb * 16 / 9), 1280px);
}
```

Apply the same pattern in future labs that need to fit an aspect
ratio inside the viewport.

### Footer hidden in lab routes

`__root.tsx` hides `<StudioFooter />` when the active pathname
contains `/projects/`:

```ts
const inLab = useRouterState({
  select: state => state.location.pathname.includes('/projects/'),
});
// ... {!inLab && <StudioFooter />}
```

Labs need every pixel; the marketing-style footer competes with the
small mobile viewport. Match by pathname (not route id) so future
`/projects/*` subroutes are covered uniformly.

## First-time native project setup

The `ios/` and `android/` directories are generated once via the
Capacitor CLI and committed:

```
cd frontend/apps/mobile
yarn install
yarn workspace @code-dot-org/studio build:mobile
npx cap add ios
npx cap add android
```

For Android, the host needs a JDK 17 and the Android SDK (platform
tools, platform-34, build-tools 34, emulator, a system image). The
standard `sdkmanager` / `avdmanager` flow applies — no custom scripts
here.

## App icon

`@capacitor/assets` generates all density buckets from `resources/`:

```
resources/icon.png             1024×1024, full-bleed Code.org mark
resources/icon-foreground.png  1024×1024, transparent, safe-zone padded
resources/icon-background.png  1024×1024, solid brand teal
```

Source is the Code.org SVG logo (`cdo-logo-inverse.svg`) rasterized via
`rsvg-convert` (ImageMagick's SVG renderer chokes on the logo's
`clip-path`).

Re-run: `yarn workspace @code-dot-org/mobile add -D @capacitor/assets`,
then `npx capacitor-assets generate --android --assetPath resources`.

## Known FIXMEs

Tracked in source as `TODO(FIXME)`:

- **Rails pre-compressed assets.** `vite-plugin-rails` emits `.gz` and
  `.br` twin files by default. AAPT2's Android asset merger treats
  `foo.js` and `foo.js.gz` as duplicate resources (it strips the
  `.gz`/`.br` suffix) and fails the build. We pass `{compress: false}`
  to disable the twins. Production-Rails loses the pre-gzip optimization
  served by nginx / Cloudfront. See `frontend/apps/studio/vite.config.ts`
  for the restoration paths.

## Future directions

Not implemented yet, but documented so the seams are findable:

- **iOS Simulator path.** Same `cap add ios` flow; needs macOS or
  remote Mac build. The Capacitor config is platform-agnostic.
- **Capacitor Live Updates** for over-the-air JS chunk delivery. Would
  let large lab chunks ship out-of-band without a new App Store build.
  Apple guideline 4.7 explicitly permits this path.
- **Offline-first lessons.** PWA + Capacitor preferences for persistent
  state. The PRFAQ direction; not in M0 scope.
- **iOS-specific safe-area / keyboard handling.** Currently the root
  layout uses `env(safe-area-inset-*)`. `@capacitor/keyboard` plugin
  is listed in `includePlugins` but not actively used yet.
