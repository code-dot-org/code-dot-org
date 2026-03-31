# @code-dot-org/core

Runtime utilities shared by all Code.org frontend applications: environment detection, site configuration, brand detection, and dashboard API client.

Optional code.org-specific integrations (localization, observability) are available as sub-path exports and registered via the plugin model — open-source forks can omit them entirely.

## Boot

Call once before rendering to register site config on `window.__CODE_STUDIO__` and initialize plugins:

```ts
import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/localization';
import {observabilityPlugin} from '@code-dot-org/core/observability';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
```

`initializeCore` accepts an optional options object. Use the `plugins` field to pass an array of `CorePlugin` implementations. Pass an empty object (or no argument) to boot without any plugins.

`initializeCodeStudioConfig` is a backward-compatible alias for `initializeCore({})`.

## Site configuration

`CodeStudioConfig` is a singleton with `environment`, `brand`, `dashboardApiUrl`, and `host`, derived from `window.location.hostname` at module load time:

```ts
import {CodeStudioConfig} from '@code-dot-org/core';

const {environment, brand, dashboardApiUrl} = CodeStudioConfig;
```

`CodeStudioConfig.observability` is also typed on `SiteConfig` itself because
core parses that runtime config directly from the Rails `<meta name="app-config">`
tag before plugins run. When the tag omits observability config, core normalizes
the value to `{provider: 'none'}`.

## Dashboard API client

`DashboardApiClient` is a typed HTTP client for the Rails dashboard backend, available via the `/api` sub-path export:

```ts
import {DashboardApiClient} from '@code-dot-org/core/api';
import type {LevelPropertiesResponse} from '@code-dot-org/core/api';

const level: LevelPropertiesResponse =
  await DashboardApiClient.labs.levels.getLevelProperties({levelId: '46446'});

const theme = await DashboardApiClient.users.userPreference.getTheme();
```

## Localization

`localization` and `useLocalization` are available via the `./localization` sub-path export. Register `localizationPlugin` at bootstrap to wire it into the core lifecycle:

```ts
import {initializeCore} from '@code-dot-org/core';
import {
  localizationPlugin,
  localization,
  useLocalization,
} from '@code-dot-org/core/localization';

initializeCore({plugins: [localizationPlugin]});

// In a React component:
const locale = useLocalization();

// Manually translate a string:
const translated = localization.translate('my english string');
```

See [`src/plugins/localization/README.md`](src/plugins/localization/README.md) for full usage details.

## Observability

`observabilityPlugin`, `recordError`, `logger`, and `metrics` are available via the `./observability` sub-path export:

```ts
import {initializeCore} from '@code-dot-org/core';
import {
  logger,
  observabilityPlugin,
  recordError,
} from '@code-dot-org/core/observability';

initializeCore({plugins: [observabilityPlugin]});

recordError(new Error('boom'), {area: 'studio'});
logger.info('Studio booted', {area: 'studio'});
```

The plugin dynamically imports the Sentry adapter, so the provider SDK can stay
out of the initial bundle when observability is disabled. Log and metric
sampling are session-based using a per-tab session ID stored in `sessionStorage`.
Calls made immediately after `initializeCore({plugins: [observabilityPlugin]})`
are buffered and replayed once the async provider client finishes loading.

See [`src/plugins/observability/README.md`](src/plugins/observability/README.md) for full usage details.

## Plugin vs. new package

When adding a new code.org-specific integration, use this table to decide where it belongs:

| Criterion                          | Plugin in `@code-dot-org/core`                                               | New `frontend/packages/*` package                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **npm dependency weight**          | Lightweight or external-script-only (e.g. LocalizeJS loads via `<script>`)   | Heavy npm dep that would contaminate core's `package.json` even as an optional peer       |
| **Bundle isolation**               | Excluded from main bundle via sub-path import discipline                     | Guaranteed by package boundary — bundler never pulls it in unless the package is imported |
| **Code.org specificity**           | Tightly coupled to `SiteConfig` / `window.__CODE_STUDIO__`                   | Independently useful without core's config                                                |
| **Number of similar integrations** | ≤ ~3–4 total plugins expected                                                | Many integrations of the same kind (e.g. one per analytics provider)                      |
| **Cross-cutting concern**          | Needs `onCoreReady` lifecycle (e.g. reads `environment` to configure itself) | Has its own lifecycle independent of core boot                                            |
| **Open-source fork impact**        | Fork omits the sub-path import — code stays in repo but is never bundled     | Fork omits the entire package from `package.json` — code never enters the repo clone      |

**Default rule:** Start as a plugin in core. Graduate to a new package only if the npm dependency weight or architectural independence makes the package boundary genuinely necessary.

## Writing a plugin

Implement `CorePlugin` and pass it to `initializeCore`:

```ts
import type {
  CorePlugin,
  SiteConfig,
  SiteConfigExtensions,
} from '@code-dot-org/core';

const myPlugin: CorePlugin = {
  onCoreReady(config: SiteConfig & SiteConfigExtensions) {
    // config.environment, config.brand, etc. are available here
  },
};

initializeCore({plugins: [myPlugin]});
```

To extend `SiteConfig`'s type with plugin-specific fields, use module augmentation:

```ts
declare module '@code-dot-org/core' {
  interface SiteConfigExtensions {
    myFeature: {enabled: boolean};
  }
}
```
