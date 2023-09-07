# `apps/src/componentLibrary/common`

This package contains all ComponentLibrary (DSCO) common design constants, tokens, and styles. These are made available as `.scss, .ts` files.

**Notes:**

- The [`@use`](https://sass-lang.com/documentation/at-rules/use) Sass feature is only available for Dart Sass. If you are using a different Sass implementation, replace `@use` with [`@import`](https://sass-lang.com/documentation/at-rules/import). Internally, this package uses `@import` to maintain compatibility with all Sass implementations.
- The import paths below use the "exports" field in `package.json`, which is a feature only available to Webpack 5+ consumers. If you use Webpack 4 or below, you should import this package as `@dsco_/common` (which corresponds to the "main" field in `package.json`), or point to a specific file in the package (e.g., `@dsco_/common/styles/_tokens.scss`).



### SCSS

## [mixins](styles/_mixins.scss)

Common mixins.

Example usage:

```scss
@use '@dsco_/common/mixins';

.custom-link-text {
  @include link-body-three; // (include mixin styles)
  font-weight: 400; // override mixin / add custom styles
}
```
### TypeScript

## [constants](constants.ts)
Common constants.

```ts 
import {componentSizeToBodyTextSizeMap} from '@cdo/apps/componentLibrary/common/constants';
// ...
// ...
// ...
const bodyTextSize = componentSizeToBodyTextSizeMap[size];
```

## [types](types.ts)

Common types.


```ts 
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
// ...
// ...
// ...
type ComponentProps = {
  size?: ComponentSizeXSToL;
};
```