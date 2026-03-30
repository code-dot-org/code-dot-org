# @code-dot-org/core

Runtime utilities shared by all Code.org frontend applications: environment detection, site configuration, brand detection, dashboard API client, and localization.

## Boot

Call once before rendering to register site config on `window.__CODE_STUDIO__`:

```ts
import {initializeCodeStudioConfig} from '@code-dot-org/core';

initializeCodeStudioConfig();
```

## Site configuration

`CodeStudioConfig` is a singleton with `environment`, `brand`, `dashboardApiUrl`, and `host`, derived from `window.location.hostname` at module load time:

```ts
import {CodeStudioConfig} from '@code-dot-org/core';

const {environment, brand, dashboardApiUrl} = CodeStudioConfig;
```

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

`localization` is a singleton localization engine. Use `useLocalization` in React components to re-render on locale changes:

```ts
import {useLocalization} from '@code-dot-org/core';

const locale = useLocalization();
```
