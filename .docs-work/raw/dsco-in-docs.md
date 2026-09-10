# DSCO-in-docs feasibility evidence

Repo: /var/home/sliang/git-workspaces/code-dot-org-full
Docs site: docs/site (Astro 7.3.2 + @astrojs/starlight 0.42.0, docs/site/package.json:1-19)

## 1. Component library package

- Name/version: `@code-dot-org/component-library` `0.1.0-alpha.1` — frontend/packages/component-library/package.json:2-3
- `main`: `components/index.ts` (source, not built) — package.json:465
- `files`: `["dist"]` — package.json:466
- No top-level `module`/`types` field; consumers must use `exports` subpaths (per-component, e.g. `./button`, `./fontAwesomeV6Icon`) — package.json:23-31, 76-83, 174-181
- `exports` map has no root `.` entry (no `import '@code-dot-org/component-library'` barrel) — package.json:23-448 (scanned, no `"."` key)
- `sideEffects`: `["**/*.css"]` — package.json:15-17
- Per-component CSS files exposed as import subpaths, e.g. `./button/index.css`, `./divider/index.css`, `./link/index.css`, `./notification-banner/index.css`, `./typography/index.css`, `./video/index.css`, `./carousel/index.css` — package.json:84, 138, 220, 306, 414, 447, 96 (not every component has one; most rely on inline/Emotion styling)
- `peerDependencies`: `react: "^18.0.0 || ^19.0.0"`, `react-dom` same range, `@mui/material: "^7.0.0"`, `@emotion/react`/`@emotion/styled: "^11.0.0"`, `classnames: "^2.5.1"`, `swiper: "^11.0.5"` — package.json:490-497
- `publishConfig.registry`: `https://npm.pkg.github.com` (GitHub Packages, not public npm) — package.json:499-501
- No `"private"` field present in package.json (scanned full file)
- Built `dist/` exists locally and is populated: frontend/packages/component-library/dist/{accordion,alert,button,fontAwesomeV6Icon,...} (per-component subdirs with presumably .mjs/.js/.d.ts/.css, confirmed dir listing only)
- devDependency `@code-dot-org/component-library-styles: workspace:*` — package.json:452
- No npm-publish step found in CI: `.github/workflows/component-library-ci.yml` and `.github/workflows/component-library-deploy.yml` only build/test and deploy Storybook to GitHub Pages (`actions/deploy-pages@v4`, environment `component-library-storybook`) — .github/workflows/component-library-deploy.yml:1-38. Grepped both files plus `clean-package.config.cjs` for "publish|registry|npm.pkg" — no hits beyond the `publishConfig` block in package.json itself.
- `frontend/packages/component-library-styles/README.md:46`: **"This package is currently available only within the Code.org monorepo. You cannot install it from npm or yarn."** — explicit, current, in-repo statement that styles are not published.
- `component-library-styles` package.json: version `0.0.0-alpha.1`, `publishConfig.registry` same GitHub Packages URL, no `"private"` field — frontend/packages/component-library-styles/package.json:2-3,32-34
- No `pnpm-workspace.yaml`; monorepo uses Yarn 4 workspaces with the `catalog:` protocol (frontend/.yarnrc.yml) for shared devDependency/peer versions.
- No branch/worktree matching "npm-publish" found in `git worktree list` or `git branch -a` at time of check — the alpha.3 in-progress publish noted in prior-session memory is not present in this checkout's current branch state; HEAD-of-staging package.json version is `0.1.0-alpha.1`, not alpha.3.

## 2. Icons

- No `src/icon/` directory exists in component-library. The icon component is `frontend/packages/component-library/src/fontAwesomeV6Icon/FontAwesomeV6Icon.tsx`.
- Renders `<i className="fa-{family} fa-{style} fa-{iconName} ..." title={title} />` — a CSS-class-driven FontAwesome icon, not an inline-SVG React tree — FontAwesomeV6Icon.tsx:56-73
- Requires "FontAwesomeV6 to be installed" per component doc comment — FontAwesomeV6Icon.tsx:47-49
- Icon name sets defined in frontend/packages/component-library/src/fontAwesomeV6Icon/constants/index.ts; includes a custom "kit" icon set (`kitIcons`) referencing a hosted FA Kit: comment cites `https://fontawesome.com/kits/ea2d9d4413/customicons` — constants/index.ts:6-10
- Component itself has no `window.`/`document.`/`useEffect` usage (grepped FontAwesomeV6Icon.tsx) — presentational/SSR-safe in isolation, but depends on external FA CSS/font (kit or npm packages) being loaded for glyphs to render.
- `@fortawesome/*` packages exist in `frontend/yarn.lock` in two different major-version sets (`^7.2.0` fontawesome-svg-core/free-solid-svg-icons/react-fontawesome, and an older `^1.2.25`/`^5.11.2`/`^0.1.7` set) — frontend/yarn.lock:1694-1696, 2166-2168, 2197-2199 — these are dependencies of *some* consumer package(s), not of component-library itself (component-library's own package.json has no `@fortawesome/*` dependency).
- No reference to `kit.fontawesome.com` or the kit ID `ea2d9d4413` found anywhere outside that one comment (grepped `apps/`, `dashboard/app`, and repo-wide for html/erb/haml/js/ts/tsx script tags) — the mechanism that actually loads the FA kit font/CSS at runtime was not located in this pass.
- `component-library-styles/README.md` lists "Font Awesome – Provides Code.org Font Awesome kit icons" as one of its style categories (README.md:37), implying the kit CSS/font-face ships from that styles package, but no `@font-face`/kit script was independently confirmed in this pass (see Unknowns).

## 3. Consuming the library in Astro

- docs/site has **no** `@astrojs/react` integration installed: `ls node_modules/@astrojs/` (run from docs/site) lists only `compiler-binding*, mdx, prism, sitemap, starlight, telemetry` — no `react`.
- docs/site has **no** `react`/`react-dom` in node_modules at all (`find node_modules -maxdepth 1 -iname "react*"` → nothing) and `docs/site/package.json` dependencies are only `@astrojs/starlight`, `ajv-cli`, `ajv-formats`, `astro`, `sharp` — docs/site/package.json:9-15.
- `astro.config.mjs` integrations array has only `starlight(...)`, no `react()` — astro.config.mjs:1-30.
- Starlight bundles `@astrojs/mdx@^8.0.0` as its own dependency (`node_modules/@astrojs/starlight/package.json:89`), so MDX authoring is available through Starlight without an explicit top-level `@astrojs/mdx` install in docs/site's own package.json (none present there).
- React-version conflict risk: component-library peer range is `^18.0.0 || ^19.0.0` (package.json:495-496) and the monorepo's shared catalog React is `18.3.1` (frontend/.yarnrc.yml:73, `'react': '^18.3.1'`); since docs/site currently has zero React, adding `@astrojs/react` + a React version would be a new, independent choice for docs/site rather than a version collision — but it would duplicate a React install outside the frontend/ Yarn workspace (docs/site is a separate `package-lock.json` / npm project, not a Yarn workspace member: docs/site has its own `package-lock.json`, not `yarn.lock`).
- Styles loading: component-library ships per-component CSS import subpaths (`./button/index.css`, etc., package.json exports) plus the separate `component-library-styles` package with global CSS files (`colors.css`, `primitiveColors.css`, `fontVariables.css`, `typography.module.scss`, etc. — frontend/packages/component-library-styles/ dir listing) that its own README instructs importing globally in the app root (README.md:61-67) — but that README also states the styles package **cannot be installed from npm/yarn outside the monorepo** (README.md:46), which is the same constraint applying to any Astro consumer unless the packages get published or the docs site becomes a Yarn-workspace member.
- SSR/browser-assumption grep: `frontend/packages/component-library/src/button/Button.tsx`, `GenericButton.tsx`, `buttonPropsToMui.tsx` — no `window.`, `document.`, or `useEffect` matches; `buttonPropsToMui.tsx` imports directly `from '@mui/material'` (line 4). `FontAwesomeV6Icon.tsx` likewise has no `window.`/`document.`/`useEffect`. Neither file set shows an obvious static-render blocker in isolation, but MUI's own SSR behavior and Emotion's runtime style injection were not traced further in this pass (out of the requested grep scope).

## 4. No-React alternatives

- (a) Starlight built-in `Icon` component / icon set:
  - File: `docs/site/node_modules/@astrojs/starlight/dist/components-internals/Icons.js` (compiled from `Icons.ts`) — defines `BuiltInIcons` as a map of icon-name → inline `<path>` SVG string (e.g. `up-caret`, `bars`, `pencil`, `document`, `setting`, `link`, `external`, `download`, `moon`, `sun`, `magnifier`, `rocket`, `star`, `puzzle`, `analytics`, `error`, `warning`, `approve-check-circle`, ~40+ entries total) — Icons.js:2-30 (sampled).
  - Cost: zero new dependency, works in plain `.md`/`.mdx` via Starlight's `<Icon>` component; but the icon set is Starlight's generic UI icon set, not code.org's design-system icon set — cannot render an actual "Settings button" as it looks in product.
  - Maintenance: pinned to whatever Starlight ships; breaks only on a Starlight major upgrade changing/removing icon names.
- (b) Copy DS SVGs as static files into docs site:
  - Component-library's icon system is FontAwesome-class-based (`fa-solid fa-gear` etc.), not a maintained standalone SVG-per-icon export — so "copying the SVGs" means either exporting individual FontAwesome SVGs (from whatever FA package/kit backs `kitIcons`/standard FA names) or screenshotting rendered icons; no ready-made static SVG directory was found under `frontend/packages/component-library/src/fontAwesomeV6Icon/`.
  - Cost: one-time manual export + storage of static assets in `docs/site/public/` or per-page `images/`.
  - Maintenance: silently drifts from the live design system on any icon/style change; no automated sync found.
- (c) Element-crop screenshots via `docsScreenshot`:
  - Helper: `frontend/packages/e2e-tests/docs-journeys/helpers.ts:12-49`. Signature: `docsScreenshot(page: Page, relativeDocsPath: string, name: string, options: {fullPage?: boolean; locator?: Locator})`. Sets 1280x800 viewport, forces light color scheme, hides `#environment_tag`/`#admin-announcement` and any `.alert*` element containing "development" text, waits on `document.fonts.ready`, then screenshots either `options.locator` (element crop) or the full page, writing to `docs/<audience>/images/<slug>-<name>.png` (`REPO_ROOT` resolved from `__dirname` four levels up — helpers.ts:4).
  - Cost: needs a Playwright test/journey per screenshot target that navigates to the real running app and passes a `Locator` for the control.
  - Maintenance: screenshot goes stale whenever the app UI changes; nothing regenerates it automatically — a human/agent must re-run the relevant e2e test and commit the new PNG.

## 5. `.md` vs `.mdx`

- `src/content.config.ts` defines the `docs` collection via `docsLoader()` / `docsSchema()` with an extended `type` enum (`concept|task|reference|troubleshooting|tutorial`) — docs/site/src/content.config.ts:1-13. No file-extension-specific handling.
- `src/content/docs/` is a set of symlinks into `docs/{students,teachers,district-administrators,developers}` plus `docs/index.md` (`ls -la src/content/docs`) — actual content lives outside `docs/site/`.
- Current content is 65 `.md` files under `docs/{students,teachers,district-administrators,developers}` and **0** `.mdx` files (`find ... -iname "*.md" | wc -l` → 65; `-iname "*.mdx"` → 0).
- Starlight 0.42.0 depends on `@astrojs/mdx@^8.0.0` as a bundled dependency (`node_modules/@astrojs/starlight/package.json:89`) — MDX pages are supported out of the box per Starlight's own dependency graph; the docs site does not need to add `@astrojs/mdx` itself to get MDX parsing, but rendering a *React* component inside an `.mdx` file additionally requires `@astrojs/react` (see section 3), which is not installed.
- Converting a page from `.md` to `.mdx` is necessary before it can embed any JSX/React component (Starlight/Astro convention); plain Markdown pages cannot inline components regardless of what's installed.

## Unknowns

- Where/whether the FontAwesome kit CSS or `@font-face` is actually loaded at runtime for dashboard/apps consumers of `FontAwesomeV6Icon` (kit script tag not located in this pass — see section 2).
- Whether `component-library-styles`' Font Awesome CSS files (in its file listing) themselves define the `@font-face`/kit link, since that directory's contents (e.g. any font-awesome-specific `.css`) were listed but not opened.
- Current disposition of the "alpha.3 npm publish in progress" work referenced in prior-session memory — no matching branch/worktree exists in this checkout; may live only in another local worktree or have been abandoned/superseded.
- Whether MUI (`@mui/material`) and Emotion (used by `buttonPropsToMui.tsx`) have their own SSR-incompatible browser-API usage — not traced beyond the two named component files per the bounded grep scope.
- Whether `docs/site`'s separate `package-lock.json` (npm) vs. the rest of the monorepo's Yarn-4-workspace tooling is an intentional isolation boundary or incidental — relevant to whether component-library could be workspace-linked instead of published.
