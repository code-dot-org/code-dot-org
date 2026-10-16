# `component-library/common`

This package contains all ComponentLibrary (DSCO) common helpers, types, functions, logic, etc. These are made available
as `.ts, .tsx` files.

### TypeScript

## [constants](constants)

Common constants.

```ts
import {componentSizeToBodyTextSizeMap} from '@code-dot-org/component-library/common/constants';
// ...
// ...
// ...
const bodyTextSize = componentSizeToBodyTextSizeMap[size];
```

## [contexts](contexts)

Common contexts.

```tsx
import {
  DropdownProviderWrapper,
  useDropdownContext,
} from '@code-dot-org/component-library/common/contexts';
// ...

<DropdownProviderWrapper>{children}</DropdownProviderWrapper>;
// ...
const {activeDropdownName, setActiveDropdownName} = useDropdownContext();
```

## [helpers](helpers)

Common helpers.

```ts
import {updatePositionedElementStyles} from '@code-dot-org/component-library/common/helpers';
```

## [hooks](hooks)

Common hooks.

```tsx
import {useBodyScrollLock} from '@code-dot-org/component-library/common/hooks';

// ...
// ...
// ...
useBodyScrollLock();
```

## [types](types)

Common types.

```ts
import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
// ...
// ...
// ...
type ComponentProps = {
  size?: ComponentSizeXSToL;
};
```
