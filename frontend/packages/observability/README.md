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
  providerOptions: {applicationId: '...', clientToken: '...', site: 'datadoghq.com'},
});

client.init({applicationName: 'studio', environment: 'production'});
```

## Configuration
- TypeScript: `tsconfig.app.json` extends `@code-dot-org/lint-config/typescript/tsconfig.vite.app.json`
- ESLint: `eslint.config.mjs` extends `@code-dot-org/lint-config/eslint/react.mjs`
- Prettier: `@code-dot-org/lint-config/prettier/index.mjs`
