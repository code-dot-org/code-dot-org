# @code-dot-org/core

Essential configurations and utilities for the Code.org platform. This package provides core functionality for environment detection, API endpoint configuration, brand detection, and global settings management across all Code.org frontend applications.

## 📦 Package Information

- **Package Name**: `@code-dot-org/core`
- **Type**: ESM/CommonJS hybrid module
- **Target**: Browser environments
- **Test Framework**: Vitest
- **Build Tool**: Vite with TypeScript

## 🚀 Installation

```bash
npm install @code-dot-org/core
```

## 📋 Table of Contents

- [Key Features](#key-features)
- [Usage Examples](#usage-examples)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)

## 🌟 Key Features

### Environment Detection

**Source**: [`src/environment/`](./src/environment/)

Automatically detects the current Code.org environment (development, staging, production, etc.) based on hostname analysis. Provides both direct environment detection and boolean helper functions for common environment checks.

- **Main Function**: `getEnvironmentFromHostname()` - See [getEnvironmentFromHostname.ts](./src/environment/getEnvironmentFromHostname.ts)
- **Environment Types**: Six distinct environments - See [environment.ts](./src/environment/environment.ts)
- **Helper Functions**: Boolean checkers like `isProductionEnvironment()` - See individual files in [src/environment/](./src/environment/)

### Configuration Management

**Source**: [`src/config/`](./src/config/)

Global configuration singleton that automatically detects and provides environment-aware settings. Creates a `window.__CODE_STUDIO__` global and exports a `CodeStudioConfig` singleton.

- **Main Class**: `SiteConfig` - See [SiteConfig.ts](./src/config/SiteConfig.ts)
- **Initialization**: `initializeCodeStudioConfig()` - See [initializeCodeStudioConfig.ts](./src/config/initializeCodeStudioConfig.ts)

### Dashboard API Integration

**Source**: [`src/dashboard/`](./src/dashboard/)

Provides environment-specific Dashboard API endpoint URLs for making requests to the Code.org backend services.

- **Main Function**: `getDashboardApiUrl()` - See [getDashboardApiUrl.ts](./src/dashboard/getDashboardApiUrl.ts)

### Brand Detection

**Source**: [`src/brand/`](./src/brand/)

Determines the current brand (code.org, etc.) based on hostname parsing to enable brand-specific features and styling.

- **Brand Types**: `Brand` type definition - See [brand.ts](./src/brand/brand.ts)
- **Detection Function**: `getBrandFromHostname()` - See [getBrandFromHostname.ts](./src/brand/getBrandFromHostname.ts)

## 🔧 Usage Examples

### Basic Environment Detection

```typescript
import {
  getEnvironmentFromHostname,
  isProductionEnvironment,
} from '@code-dot-org/core';

// Get current environment
const env = getEnvironmentFromHostname();
console.log(`Running in: ${env}`);

// Check specific environment
if (isProductionEnvironment()) {
  console.log('Production mode - enabling analytics');
}
```

### Using the Configuration Singleton

```typescript
import {CodeStudioConfig} from '@code-dot-org/core';

// Access global configuration
console.log(`Brand: ${CodeStudioConfig.brand}`);
console.log(`Environment: ${CodeStudioConfig.environment}`);
console.log(`Dashboard API: ${CodeStudioConfig.dashboardApiUrl}`);

// Also available globally
console.log(window.__CODE_STUDIO__.environment);
```

### Dashboard API Integration

```typescript
import {
  getDashboardApiUrl,
  getEnvironmentFromHostname,
} from '@code-dot-org/core';

const env = getEnvironmentFromHostname();
const apiUrl = getDashboardApiUrl(env);

// Make API request
fetch(`${apiUrl}/api/v1/user`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### Brand-Specific Logic

```typescript
import {CodeStudioConfig} from '@code-dot-org/core';

switch (CodeStudioConfig.brand) {
  case 'code.org':
    // Code.org specific features
    break;
}
```

## 🏗️ Architecture

### Directory Structure

```
src/
├── [feature]/
│   ├── __tests__/           # Unit Tests
│   ├── brand.ts             # Brand type definition
│   ├── index.ts             # Export file
└── index.ts                # Main export file
```

### Design Principles

1. **Singleton Pattern**: `SiteConfig` uses singleton pattern for global state
2. **Environment-First**: All utilities prioritize environment detection
3. **Type Safety**: Full TypeScript support with strict typing
4. **Browser-Only**: Designed specifically for browser environments
5. **Zero Runtime Config**: Configuration determined at runtime from browser context

### Dependencies

- **Development**: Vite, Vitest, TypeScript, ESLint

## 🛠️ Development

### Adding New Utilities

1. **Create the utility file** in the appropriate subdirectory
2. **Add TypeScript types** if needed
3. **Export from subdirectory index** (e.g., `src/environment/index.ts`)
4. **Export from main index** (`src/index.ts`) if public API
5. **Write comprehensive tests** in `__tests__/` directory
6. **Update this README** with documentation

## 🧪 Testing

### Test Framework

- **Framework**: Vitest
- **Configuration**: Global test utilities enabled
- **Coverage**: Include all source files

### Running Tests

```bash
# Run all tests
yarn test
```

### Test Structure

Tests are organized alongside source files in `__tests__/` directories:

```
src/environment/__tests__/
├── environment.test.ts
├── getEnvironmentFromHostname.test.ts
└── is[Environment]Environment.test.ts
```

### Writing Tests

```typescript
import {getEnvironmentFromHostname} from '../getEnvironmentFromHostname';

describe('getEnvironmentFromHostname', () => {
  beforeEach(() => {
    // Setup test environment
  });

  it('should detect development environment', () => {
    // Test implementation
  });
});
```
