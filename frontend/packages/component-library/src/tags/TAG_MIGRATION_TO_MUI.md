# Tag Component Migration Guide: Custom to MUI Chip

This guide documents how to migrate the existing Tags component to the new MUI Chip-based Tag implementation while preserving the current API and adding new variants/colors.

## Current Tags API

### Component structure

- **`Tags`** renders a list of tags via `tagsList`.

### Core props (TagProps)

```typescript
interface TagProps {
  label: string;
  tooltipContent?: string | ReactNode;
  tooltipId?: string;
  ariaLabel?: string;
  icon?: FontAwesomeV6IconProps & {placement: 'left' | 'right'};
  type?: 'default' | 'closable';
  onClose?: (event?: MouseEvent | KeyboardEvent) => void;
}
```

## New Tag API (MUI Chip wrapper)

### Single Tag component

```typescript
interface TagProps {
  label: ReactNode;
  size?: 's' | 'm' | 'l';
  variant?: 'light' | 'solid' | 'filled' | 'outlined';
  color?:
    | 'teal'
    | 'purple'
    | 'aqua'
    | 'error'
    | 'warning'
    | 'success'
    | 'gray'
    | 'disabled';
  icon?: FontAwesomeV6IconProps & {placement: 'left' | 'right'};
  onDelete?: (event?: MouseEvent<HTMLButtonElement>) => void;
  tooltipContent?: string | ReactNode;
  tooltipId?: string;
  ariaLabel?: string;
}
```

### List wrapper

`Tags` remains as a convenience wrapper; it forwards `size` to each tag unless a tag overrides it.

## Prop Mapping

| Legacy prop        | New prop   | Notes                                                          |
| ------------------ | ---------- | -------------------------------------------------------------- |
| `type: 'closable'` | `onDelete` | Use `onDelete` instead of `type`                               |
| `onClose`          | `onDelete` | Same behavior, new naming                                      |
| _N/A_              | `variant`  | `light` and `solid` per Figma; `filled`/`outlined` are aliases |
| _N/A_              | `color`    | Adds sentiment colors + disabled                               |

## Migration Strategy

1. **Keep existing usages working**: `Tags` still supports the legacy `type`/`onClose` API.
2. **Adopt new props**: Start using `variant` and `color` where needed.
3. **Codemod (optional)**: Use the Tags codemod to rename `onClose` → `onDelete` and remove `type`.

## Codemod

From `frontend/packages/component-library`:

```bash
yarn codemod:tags ../../../apps/src
```
