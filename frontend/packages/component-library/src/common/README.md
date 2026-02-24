# `dsco/common`

This package contains all ComponentLibrary (DSCO) common helpers, types, functions, logic, etc. These are made available
as `.ts, .tsx` files.

### TypeScript

## [constants](constants)

Common constants.

```ts
import {componentSizeToBodyTextSizeMap} from '@code-dot-org/dsco/common/constants';
// ...
// ...
// ...
const bodyTextSize = componentSizeToBodyTextSizeMap[size];
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

## [helpers](helpers)

Common helpers.

```ts
import {updatePositionedElementStyles} from '@code-dot-org/dsco/common/helpers';
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

## [types](types)

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
