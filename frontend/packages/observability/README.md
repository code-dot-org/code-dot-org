# @code-dot-org/observability

Provider-agnostic Real User Monitoring (RUM) abstraction for code.org frontend applications.

## Package Name

`@code-dot-org/observability`

## Installation

This is a private workspace package. Add it as a dependency in your app's package.json:

```json
"@code-dot-org/observability": "workspace:*"
```

## Key Exports

- `createRumClient(provider, config)` — factory that returns a `RumClient` for the given provider
- `RumClient` — interface implemented by all provider adapters
- `RumProvider` — union type: `'newrelic' | 'datadog' | 'sentry' | 'none'`
- `RumClientConfig` — configuration interface

## Usage

```typescript
import {createRumClient} from '@code-dot-org/observability';

const client = createRumClient('datadog', {
  applicationName: 'studio',
  environment: 'production',
  version: '1.0.0',
  providerOptions: {
    applicationId: '...',
    clientToken: '...',
    site: 'datadoghq.com',
  },
});

client.init({applicationName: 'studio', environment: 'production'});
```

## Rails Configuration Injection

In production, the RUM provider and credentials are rendered by Rails into a `<meta name="app-config">` tag in `dashboard/app/views/app/index.html.haml`. Values come from the `CDO` object, which reads from `config/*.yml.erb`:

```haml
%meta{name: "app-config", content: {
  appVersion: CDO.app_version,
  observability: {
    rumProvider: CDO.rum_provider,
    datadog: { applicationId: CDO.datadog_application_id, clientToken: CDO.datadog_client_token },
    newRelic: { licenseKey: CDO.new_relic_license_key, applicationId: CDO.new_relic_application_id },
    sentry: { dsn: CDO.sentry_dsn }
  }
}.to_json}
```

The Vite development `frontend/apps/studio/index.html` does **not** include this tag. `SiteConfig` defaults to `rumProvider: 'none'` when the tag is absent, so local dev runs without any RUM provider.

## Development Commands

Use `yarn` (not `npx`) for all commands in this package:

```bash
# From frontend/ (Turborepo)
yarn turbo build --filter=@code-dot-org/observability
yarn turbo test --filter=@code-dot-org/observability
yarn turbo lint --filter=@code-dot-org/observability

# Auto-fix lint errors first, then check
yarn turbo lint:fix --filter=@code-dot-org/observability
yarn turbo lint --filter=@code-dot-org/observability
```

## Configuration

- TypeScript: `tsconfig.app.json` extends `@code-dot-org/lint-config/typescript/tsconfig.vite.app.json`
- ESLint: `eslint.config.mjs` extends `@code-dot-org/lint-config/eslint/react.mjs`
- Prettier: `@code-dot-org/lint-config/prettier/index.mjs`
