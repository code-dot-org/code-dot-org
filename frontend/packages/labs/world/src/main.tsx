// Standalone dev harness for World Lab: `yarn dev` serves this. It is NOT part
// of the library build (the lib entry is src/index.ts). It mounts the App
// through the same host path the studio uses — `LabHost` drives the load against
// the MSW mock API (see ./fixtures), so there is no Rails backend.
//
// The world preview is a placeholder until the Phaser 4 runtime is wired in;
// everything else — instructions, file browser, editor — is real.

// Design-system fonts and CSS variables (colors, primitives).
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

// Lab CSS variables (borders, z-indices) used by base components like PanelContainer.
import '@code-dot-org/lab/styles/variables.scss';

import {GlobalStyles, StyledEngineProvider, ThemeProvider} from '@mui/material';
import {createRoot} from 'react-dom/client';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {
  ApiClientProvider,
  DashboardApiClient,
  QueryClientProvider,
} from '@code-dot-org/core/api';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {
  injectFontAwesome,
  setFontAwesomeStylesheets,
} from '@code-dot-org/fonts';
import {LabHost} from '@code-dot-org/lab/host';

import App from './App';
import {mountBootBadge} from './demoBootBadge';
import {
  DEFAULT_SCENARIO_TAG,
  isScenarioTag,
  WORLD_LAB_KEY,
  WORLD_SCENARIOS,
  WORLD_SCENARIO_TAGS,
  type WorldScenarioTag,
} from './fixtures';
import {freeIconShimCss, reportMissingIcons} from './freeIconShims';
import {
  getSandboxUrl,
  setAssetBaseUrl,
  setBackgroundBaseUrl,
  setSandboxUrl,
} from './runtime/worldConfig';

initializeCore({plugins: [localizationPlugin]});

// Icons: the design system's FontAwesome Pro from `dsco.code.org`, or this
// build's own copy of the Free distribution (`WORLD_DEMO_ICONS=free`).
//
// The CDN is right for a code.org origin and useless anywhere else: it answers
// CORS for code.org hosts only, and a webfont is ALWAYS a CORS request, so a
// deployment elsewhere loads the stylesheets, applies them, and draws every
// icon as an empty box. The Free copy is same-origin, so nothing can refuse it.
//
// Set before rendering, and as the source rather than an argument, because
// `<Lab>` injects on mount too (labs/base) and would otherwise pull the CDN's
// copy alongside this one.
if (import.meta.env.VITE_WORLD_ICONS === 'free') {
  const base = `${import.meta.env.BASE_URL}vendor/fontawesome/css/`;
  setFontAwesomeStylesheets([
    `${base}fontawesome.min.css`,
    `${base}solid.min.css`,
    `${base}regular.min.css`,
    `${base}brands.min.css`,
    `${base}v4-shims.min.css`,
  ]);
  // What Free does not draw, drawn as something (src/freeIconShims.ts). Last in
  // the head, so it wins over the sheets it patches.
  const shims = document.createElement('style');
  shims.textContent = freeIconShimCss();
  document.head.appendChild(shims);
}
injectFontAwesome();

/** A base URL a relative path can be resolved against, which needs the slash. */
const withSlash = (url: string): string =>
  url.endsWith('/') ? url : `${url}/`;

/** Where this build is served from, absolute (`https://host/world/`). */
const here = withSlash(
  new URL(import.meta.env.BASE_URL, window.location.href).href,
);

// The demo's own copies of what the studio host would otherwise supply: the
// sandbox's vendored assets (esbuild-wasm, Phaser, the bundled engine) and the
// stock backdrops, both fetched into `public/` by `yarn setup:world`.
//
// Paths, not absolute URLs, and deliberately: the asset base is handed to the
// sandbox surfaces on their iframe URL and fetched THERE, so it has to resolve
// against whichever origin is serving them. Made absolute against the lab, a
// two-origin deployment sends the sandbox to fetch 14MB of wasm across origins
// and it fails CORS — "Failed to fetch", and a blank preview. The base path is
// still needed: a build at `/world/` has no claim on the origin root.
setAssetBaseUrl(`${import.meta.env.BASE_URL}vendor/`);
setBackgroundBaseUrl(`${import.meta.env.BASE_URL}backgrounds/`);

// Where the sandbox is served from, when the URL does not say — an explicit
// `?world-sandbox=` always wins (getSandboxUrl reads it). This is the BASE the
// surfaces sit under, never a surface itself; the managers resolve
// `sandbox/preview.html` and `sandbox/compile.html` against it.
//
//   VITE_WORLD_SANDBOX=https://world-sandbox.example/   a second origin, which
//                                                       is what the design wants
//   VITE_WORLD_SANDBOX=same-origin                      this deployment serves
//                                                       the sandbox surfaces too
//   (unset)                                             the `dev:sandbox` port,
//                                                       in a dev build only
//
// `same-origin` is the shortcut for a host that gives out one origin per
// account rather than per site (GitHub Pages). It runs learner code on the
// lab's own origin, which specs/SANDBOX.md forbids in production: the origin
// split is the boundary, and this is the build that has none. It is defensible
// only for a demo that holds no session and none of anyone else's work — so
// nothing chooses it silently, a build has to say it.
const SAME_ORIGIN = 'same-origin';
const configured = import.meta.env.VITE_WORLD_SANDBOX?.trim();
if (!getSandboxUrl()) {
  if (configured === SAME_ORIGIN) {
    setSandboxUrl(here);
  } else if (configured) {
    setSandboxUrl(withSlash(new URL(configured, here).href));
  } else if (import.meta.env.DEV) {
    setSandboxUrl('http://localhost:5202/');
  }
}

// WHICH PROJECT the demo opens (src/fixtures/scenarios).
//
// Three ways to say it, in the order they win:
//
//   ?scenario=empty    the switcher below, and the one to reach for in a test
//                      or a shared link — it survives any base path
//   the channel id     `/frontend-studio/projects/world/<tag>/edit`, the studio
//                      route, which is where the tag comes from in production
//   nothing            the starter
//
// The query wins because it is the thing a person just clicked. A tag that
// names no scenario falls through rather than loading an empty mock: a typo in
// a URL should show the starter, not a lab with no project in it.
const scenarioFromPath = window.location.pathname.match(
  /^\/frontend-studio\/projects\/world\/([^/]+)\/edit$/,
)?.[1];
const scenarioFromQuery = new URLSearchParams(window.location.search).get(
  'scenario',
);
const channelId = isScenarioTag(scenarioFromQuery)
  ? scenarioFromQuery
  : isScenarioTag(scenarioFromPath ?? null)
    ? (scenarioFromPath as WorldScenarioTag)
    : DEFAULT_SCENARIO_TAG;

// Start the mock API and register World Lab's fixtures before rendering, so the
// host's level_properties / app_options / channel / sources requests are served.
async function enableMocks() {
  const {
    startMockWorker,
    registerLabFixtures,
    setActiveScenario,
    maybeResetFromUrl,
  } = await import('@code-dot-org/core/api/mocks');
  const {WorldFixtures} = await import('./fixtures');

  maybeResetFromUrl();
  registerLabFixtures(WORLD_LAB_KEY, WorldFixtures);
  setActiveScenario({labKey: WORLD_LAB_KEY, tag: channelId});

  // The worker script is served from this build's base, like everything else it
  // owns; its default is the origin root, which a `/world/` deployment has no
  // claim on. Scope follows the script, and a scope of `/world/` still controls
  // this page — so its API calls to `/api/…` are intercepted all the same.
  await startMockWorker({
    serviceWorker: {url: `${import.meta.env.BASE_URL}mockServiceWorker.js`},
  });
}

await enableMocks();

// Global tweaks for the standalone harness:
// - The base `<Lab>` wraps content in the component-library ThemeProvider's
//   `<div data-theme>`, which has no intrinsic height. The studio host sizes
//   labs via its own layout CSS; here we make that wrapper fill the viewport so
//   the lab's flex layout has a height to divide. Scoped to `#root` so it does
//   NOT match `<div data-theme>` menus/dialogs that portal to `<body>` (those
//   also carry `data-theme`, and a `height: 100%` would stretch them to the
//   whole window).
// - The DSCO tooltip portals to `<body>` with `height: fit-content`, which
//   Chromium resolves against the full-height viewport here (stretching it to
//   the whole window). `max-content` renders it at its content height, as
//   intended. Scoped to the portaled tooltip (`_tooltip_` name prefix), not the
//   `_tooltipOverlay_` wrapper.
const fullHeight = (
  <GlobalStyles
    styles={{
      '#root div[data-theme]': {height: '100%'},
      'body > [class*="_tooltip_"]': {height: 'max-content'},
    }}
  />
);

/**
 * Which project the demo is showing, and a way to change it.
 *
 * Bottom left, above the boot badge, which is the corner this harness already
 * uses for things the lab itself does not have — a lab with a dev control in
 * its own chrome would be a lab that ships one. `?devChrome=off` takes it away
 * for screenshots and visual tests, the same opt-out `packages/users` uses.
 *
 * A full reload rather than a re-render: the scenario decides what the mock API
 * serves, and the API is chosen before the first fetch. Swapping it live would
 * mean tearing down a loaded project mid-edit, which is a bigger promise than a
 * dev switch should make.
 */
function ScenarioSwitcher({value}: {value: WorldScenarioTag}) {
  if (new URLSearchParams(window.location.search).get('devChrome') === 'off') {
    return null;
  }
  return (
    <label
      style={{
        position: 'fixed',
        bottom: 72,
        left: 8,
        zIndex: 99999,
        maxWidth: 260,
        background: 'rgba(0,0,0,0.78)',
        color: '#eaeaea',
        borderRadius: 6,
        padding: '6px 9px',
        font: '12px/1.4 ui-monospace, monospace',
      }}
    >
      project{' '}
      <select
        value={value}
        onChange={event => {
          const params = new URLSearchParams(window.location.search);
          params.set('scenario', event.target.value);
          // The store is written through and survives a reload, so a project
          // edited under one scenario would otherwise follow you to the next.
          params.set('cdoMockReset', '1');
          window.location.search = params.toString();
        }}
      >
        {WORLD_SCENARIO_TAGS.map(tag => (
          <option key={tag} value={tag}>
            {WORLD_SCENARIOS[tag].name}
          </option>
        ))}
      </select>
      <div style={{marginTop: 4, opacity: 0.75}}>
        {WORLD_SCENARIOS[value].description}
      </div>
    </label>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  // No <StrictMode>: it double-invokes effects in dev, which races xterm's
  // async render against the console's dispose/remount (a benign 'dimensions'
  // error). The lab's own tests still run under React's strict behavior.
  createRoot(rootElement).render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={CdoTheme}>
        {fullHeight}
        <RootStateProvider>
          <QueryClientProvider>
            <ApiClientProvider client={DashboardApiClient}>
              <ScenarioSwitcher value={channelId} />
              <div style={{height: '100vh'}}>
                <LabHost
                  LabEntrypoint={App}
                  standaloneProjectType="world"
                  channelId={channelId}
                />
              </div>
            </ApiClientProvider>
          </QueryClientProvider>
        </RootStateProvider>
      </ThemeProvider>
    </StyledEngineProvider>,
  );
  // Demo-only: show the real boot time on-page so it can be read with DevTools
  // closed (see demoBootBadge for why that matters).
  mountBootBadge();

  // Icons Free cannot draw are silent — the element renders, sized and empty —
  // so the build that uses Free says so instead. Watching rather than sampling:
  // most of this lab's icons live in menus and dialogs that do not exist until
  // they are opened, and a single pass at startup would miss every one.
  if (import.meta.env.VITE_WORLD_ICONS === 'free') {
    const look = () => reportMissingIcons();
    setTimeout(look, 2_000);
    new MutationObserver(look).observe(rootElement, {
      childList: true,
      subtree: true,
    });
  }
}
