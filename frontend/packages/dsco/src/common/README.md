# `dsco/common`

This package contains all ComponentLibrary (DSCO) common design constants, tokens, and styles. These are made available
as `.scss, .ts` files.

**Notes:**

- The [`@use`](https://sass-lang.com/documentation/at-rules/use) Sass feature is only available for Dart Sass. If you
  are using a different Sass implementation, replace `@use` with [
  `@import`](https://sass-lang.com/documentation/at-rules/import). Internally, this package uses `@import` to maintain
  compatibility with all Sass implementations.
- The import paths below use the "exports" field in `package.json`, which is a feature only available to Webpack 5+
  consumers. If you use Webpack 4 or below, you should import this package as `@cdo/apps/componentLibrary/common` (which
  corresponds to the "main" field in `package.json`), or point to a specific file in the package (e.g.,
  `@code-dot-org/dsco/common/styles/mixins`).

### SCSS

## [mixins](styles/mixins.scss)

Common mixins.

Usage example:

```scss
@import '@code-dot-org/dsco/common/styles/mixins';

.custom-link-text {
  @include link-body-three; // (include mixin styles)
  font-weight: 400; // override mixin / add custom styles
}
```

### TypeScript

## [constants](constants.ts)

Common constants.

```ts
import {componentSizeToBodyTextSizeMap} from '@code-dot-org/dsco/common/constants';
// ...
// ...
// ...
const bodyTextSize = componentSizeToBodyTextSizeMap[size];
```

## [types](types.ts)

Common types.

```ts
import {ComponentSizeXSToL} from '@code-dot-org/dsco/common/types';
// ...
// ...
// ...
type ComponentProps = {
  size?: ComponentSizeXSToL;
};
```

## [hooks](hooks)

Common hooks.

```tsx
import {useBodyScrollLock} from '@code-dot-org/dsco/common/hooks';
// OR
import useBodyScrollLock from '@code-dot-org/dsco/common/hooks/useBodyScrollLock';

// ...
// ...
// ...
useBodyScrollLock();
```

## [contexts](contexts)

Common contexts.

```tsx
import {DropdownContext} from '@code-dot-org/dsco/common/contexts';
// ...

<DropdownContext.Provider value={dropdownContextValue}>
  {children}
</DropdownContext.Provider>;
```
