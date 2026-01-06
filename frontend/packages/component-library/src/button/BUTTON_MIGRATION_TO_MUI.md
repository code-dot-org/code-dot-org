# Button Component Migration Guide: Custom to MUI

This guide documents how to migrate the custom Button component to MUI Button while maintaining the same API and visual design.

## Table of Contents

1. [Current Button API](#current-button-api)
2. [MUI Button API](#mui-button-api)
3. [Props Mapping](#props-mapping)
4. [Style Overrides](#style-overrides)
5. [Migration Strategy](#migration-strategy)
6. [Examples](#examples)

---

## Current Button API

### Component Structure

The current Button system consists of:

- **`GenericButton`** - Base component that handles both `<button>` and `<a>` tags
- **`Button`** - Wrapper for `<button>` elements
- **`LinkButton`** - Wrapper for `<a>` elements

### Core Props

```typescript
interface CoreButtonProps {
  // Button type (variant)
  type?: 'primary' | 'secondary' | 'tertiary';

  // Button color
  color?: 'purple' | 'black' | 'gray' | 'white' | 'destructive';

  // Size
  size?: 'xs' | 's' | 'm' | 'l';

  // Content
  text?: string;
  iconLeft?: FontAwesomeV6IconProps;
  iconRight?: FontAwesomeV6IconProps;

  // Icon-only mode
  isIconOnly?: boolean;
  icon?: FontAwesomeV6IconProps; // Only when isIconOnly=true

  // States
  disabled?: boolean;
  isPending?: boolean;
  forceHover?: boolean;

  // Accessibility
  ariaLabel?: string;

  // Standard HTML props
  className?: string;
  id?: string;
  onClick?: (event: MouseEvent) => void;
}
```

### Button-Specific Props (for `<button>` tag)

```typescript
interface ButtonSpecificProps {
  buttonTagTypeAttribute?: 'submit' | 'button';
  value?: string;
  name?: string;
  forceHover?: boolean;
}
```

### Link-Specific Props (for `<a>` tag)

```typescript
interface LinkButtonSpecificProps {
  useAsLink?: boolean;
  href?: string;
  target?: string;
  download?: boolean | string;
  title?: string;
  analyticsCallback?: () => void;
}
```

### Size Specifications

| Size | Padding         | Gap     | Icon Size | Icon Width | Icon-Only Padding | Icon-Only Min-Width |
| ---- | --------------- | ------- | --------- | ---------- | ----------------- | ------------------- |
| `xs` | 0.125rem 0.5rem | 0.25rem | 0.8125rem | 1rem       | 0.25rem           | 1.5rem              |
| `s`  | 0.3125rem 1rem  | 0.5rem  | 0.875rem  | 1.125rem   | 0.4375rem         | 2rem                |
| `m`  | 0.5rem 1rem     | 0.5rem  | 1rem      | 1.25rem    | 0.625rem          | 2.5rem              |
| `l`  | 0.625rem 1rem   | 0.5rem  | 1.1875rem | 1.5rem     | 0.75rem           | 3rem                |

### Type × Color Combinations

#### Primary Buttons

- ✅ `primary` + `purple` - Purple background, white text
- ✅ `primary` + `black` - Black background, white text
- ✅ `primary` + `white` - White background, dark text
- ✅ `primary` + `destructive` - Red background, white text
- ❌ `primary` + `gray` - Not allowed

#### Secondary Buttons

- ⚠️ `secondary` + `purple` - **Deprecated** (border + text)
- ✅ `secondary` + `black` - Border, neutral background
- ✅ `secondary` + `gray` - Border, neutral background
- ✅ `secondary` + `white` - White border, dark background
- ✅ `secondary` + `destructive` - Red border, neutral background

#### Tertiary Buttons

- ✅ `tertiary` + `purple` - Text only, purple
- ✅ `tertiary` + `black` - Text only, neutral
- ✅ `tertiary` + `white` - Text only, white
- ✅ `tertiary` + `gray` - Text only, gray (icon-only only)
- ✅ `tertiary` + `destructive` - Text only, red

---

## MUI Button API

### Core MUI Button Props

```typescript
interface MuiButtonProps {
  // Variant (similar to our "type")
  variant?: 'text' | 'outlined' | 'contained';

  // Color (extended with custom colors via theme)
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | 'inherit'
    | 'white' // Custom color
    | 'tertiary'; // Custom color (maps to gray)

  // Size (extended with custom sizes via theme)
  size?: 'extraSmall' | 'small' | 'medium' | 'large';

  // Content
  children?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;

  // States
  disabled?: boolean;
  loading?: boolean; // Loading/pending state

  // Link behavior
  href?: string;
  component?: React.ElementType;

  // Standard props
  className?: string;
  onClick?: (event: MouseEvent) => void;
}
```

### MUI IconButton Props (for icon-only buttons)

```typescript
interface MuiIconButtonProps {
  // Variant (extended to support contained/outlined/text)
  variant?: 'contained' | 'outlined' | 'text';

  // Color (extended with custom colors via theme)
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | 'white' // Custom color
    | 'tertiary'; // Custom color (maps to gray)

  // Size (extended with custom sizes via theme)
  size?: 'extraSmall' | 'small' | 'medium' | 'large';

  disabled?: boolean;
  children?: ReactNode; // Icon goes here
  // ... other ButtonBase props
}
```

### MUI Button Capabilities & Considerations

1. **Loading state** - ⚠️ MUI Button doesn't have built-in `loading` prop (requires `LoadingButton` from `@mui/lab`). Currently using custom implementation with spinner icon.
2. **Icon-only mode** - ✅ Use MUI's `IconButton` component for icon-only buttons (with `variant` prop support)
3. **Custom colors** - ✅ Added via theme extensions: `white` and `tertiary` (see [Custom Colors](#custom-colors))
4. **Custom sizes** - ✅ Added via theme extensions: `extraSmall` (see [Custom Sizes](#custom-sizes))
5. **ForceHover** - ⚠️ No built-in prop, but can be handled with custom className + style overrides
6. **Link behavior** - ✅ Works automatically when `href` prop is provided

---

## Props Mapping

### Direct Mappings

| Current Prop | MUI Prop    | Notes                                   |
| ------------ | ----------- | --------------------------------------- |
| `disabled`   | `disabled`  | ✅ Direct match                         |
| `className`  | `className` | ✅ Direct match                         |
| `id`         | `id`        | ✅ Direct match                         |
| `onClick`    | `onClick`   | ✅ Direct match                         |
| `href`       | `href`      | ✅ Direct match (when `useAsLink=true`) |
| `target`     | `target`    | ✅ Direct match (when `useAsLink=true`) |

### Type → Variant Mapping

| Current `type` | MUI `variant` | Notes                              |
| -------------- | ------------- | ---------------------------------- |
| `primary`      | `contained`   | Solid background                   |
| `secondary`    | `outlined`    | Border with transparent background |
| `tertiary`     | `text`        | Text only, no border/background    |

### Size Mapping

**Implemented**: Extended MUI Theme with Custom Sizes

- Added `extraSmall` as custom size via theme configuration
- Mapping: `xs` → `extraSmall`, `s` → `small`, `m` → `medium`, `l` → `large`
- All sizes are handled via theme variants
- See [Custom Sizes](#custom-sizes) section below

### Color Mapping Strategy

**Implemented**: Extended MUI Theme with Custom Colors + Native Props

- Added `white` and `tertiary` as custom colors via theme extensions
- Color mapping:
  - `purple` → `color="primary"`
  - `black` → `color="secondary"`
  - `gray` → `color="tertiary"`
  - `white` → `color="white"`
  - `destructive` → `color="error"`
- All colors are handled via `variant × color` combinations in theme variants
- Uses native MUI `variant` and `color` props (no data attributes)
- See [Custom Colors](#custom-colors) section below

### Icon Mapping

| Current Prop       | MUI Prop         | Implementation                    |
| ------------------ | ---------------- | --------------------------------- |
| `iconLeft`         | `startIcon`      | ✅ Direct match                   |
| `iconRight`        | `endIcon`        | ✅ Direct match                   |
| `icon` (icon-only) | Use `IconButton` | ✅ Use MUI `IconButton` component |

**Note**: For icon-only buttons, use MUI's `IconButton` component instead of regular `Button`.

### Special Props That Need Custom Implementation

| Current Prop             | MUI Equivalent | Implementation Strategy                                                                      |
| ------------------------ | -------------- | -------------------------------------------------------------------------------------------- |
| `isPending`              | Custom         | ⚠️ Custom implementation with spinner icon (MUI Button doesn't have built-in `loading` prop) |
| `forceHover`             | ❌ None        | Custom className + style override                                                            |
| `useAsLink`              | `href` prop    | ✅ Automatic when `href` is provided                                                         |
| `buttonTagTypeAttribute` | `type`         | Direct mapping when not link                                                                 |
| `analyticsCallback`      | ❌ None        | Custom onClick wrapper                                                                       |

---

## Custom Colors & Sizes

### Custom Colors

**Implemented**: Custom colors are handled via theme variants using `variant × color` combinations.

Custom colors are added via TypeScript type extensions in `src/themes/code.org/types.d.ts`:

```typescript
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    white: true;
    tertiary: true;
  }
}
```

All color combinations are handled via theme variants in `src/themes/code.org/styleOverrides/button.tsx`:

```typescript
// Example: Contained variant × color combinations
{
  props: {variant: 'contained', color: 'primary'},  // purple
  style: { /* styles */ },
},
{
  props: {variant: 'contained', color: 'secondary'},  // black
  style: { /* styles */ },
},
{
  props: {variant: 'contained', color: 'white'},
  style: { /* styles */ },
},
{
  props: {variant: 'contained', color: 'error'},  // destructive
  style: { /* styles */ },
},
// ... similar for outlined and text variants
```

**Color Mapping:**

- `purple` → `color="primary"`
- `black` → `color="secondary"`
- `gray` → `color="tertiary"`
- `white` → `color="white"`
- `destructive` → `color="error"`

### Custom Sizes

**Implemented**: Custom sizes are added via theme variants.

Custom sizes are added via TypeScript type extensions in `src/themes/code.org/types.d.ts`:

```typescript
declare module '@mui/material/Button' {
  interface ButtonPropsSizeOverrides {
    extraSmall: true;
    small: true;
    medium: true;
    large: true;
  }
}
```

Size variants are implemented in `src/themes/code.org/styleOverrides/button.tsx`:

```typescript
{
  props: {size: 'extraSmall'},  // xs
  style: {
    padding: '0.125rem 0.5rem',
    gap: '0.25rem',
    fontSize: '0.75rem',
    // ... xs size styles
  },
},
{
  props: {size: 'small'},  // s
  style: {
    padding: '0.3125rem 1rem',
    gap: '0.5rem',
    fontSize: '0.875rem',
    // ... s size styles
  },
},
// ... similar for medium and large
```

**Size Mapping:**

- `xs` → `size="extraSmall"`
- `s` → `size="small"`
- `m` → `size="medium"`
- `l` → `size="large"`

---

## Style Overrides

### File Structure

Create: `src/themes/code.org/styleOverrides/button.ts`

### Key Override Areas

1. **Size Overrides** - Map xs/s/m/l to MUI small/medium/large
2. **Type × Color Combinations** - All primary/secondary/tertiary × color combinations
3. **Icon Sizing** - FontAwesome icon dimensions
4. **Icon-Only Mode** - Padding adjustments
5. **Pending State** - Spinner positioning
6. **Hover States** - Including `forceHover`
7. **Focus States** - Outline styling
8. **Disabled States** - All color combinations

### Size Override Structure

```typescript
const SIZE_OVERRIDES = {
  small: {
    // xs size
    xs: {
      padding: '0.125rem 0.5rem',
      gap: '0.25rem',
      iconSize: '0.8125rem',
      iconWidth: '1rem',
      iconOnlyPadding: '0.25rem',
      iconOnlyMinWidth: '1.5rem',
    },
    // s size
    s: {
      padding: '0.3125rem 1rem',
      gap: '0.5rem',
      iconSize: '0.875rem',
      iconWidth: '1.125rem',
      iconOnlyPadding: '0.4375rem',
      iconOnlyMinWidth: '2rem',
    },
  },
  medium: {
    // m size
    m: {
      padding: '0.5rem 1rem',
      gap: '0.5rem',
      iconSize: '1rem',
      iconWidth: '1.25rem',
      iconOnlyPadding: '0.625rem',
      iconOnlyMinWidth: '2.5rem',
    },
  },
  large: {
    // l size
    l: {
      padding: '0.625rem 1rem',
      gap: '0.5rem',
      iconSize: '1.1875rem',
      iconWidth: '1.5rem',
      iconOnlyPadding: '0.75rem',
      iconOnlyMinWidth: '3rem',
    },
  },
};
```

### Type × Color Override Structure

**Implemented**: All type × color combinations are handled via theme variants using native MUI props.

For each combination, we define:

- Default state colors
- Hover state colors (including `forceHover` support)
- Active/pressed state colors
- Disabled state colors
- Focus state outline

Example structure:

```typescript
// Contained (primary) variant × color combinations
{
  props: {variant: 'contained', color: 'primary'},  // purple
  style: {
    backgroundColor: 'var(--background-brand-purple-primary)',
    color: 'var(--text-neutral-white-fixed)',
    '&:hover, &.force-hover, &[data-force-hover="true"]': {
      backgroundColor: 'var(--background-brand-purple-strong)',
    },
    '&.Mui-disabled': {
      backgroundColor: 'var(--background-neutral-disabled)',
      color: 'var(--text-neutral-disabled-inverse)',
    },
  },
},
{
  props: {variant: 'contained', color: 'secondary'},  // black
  style: {
    backgroundColor: 'var(--background-neutral-primary-inverse)',
    color: 'var(--text-neutral-inverse)',
    // ... hover, disabled states
  },
},
// ... similar for all variant × color combinations
```

**Note**: All styling is done via theme variants using native `variant` and `color` props. No data attributes are used.

---

## Migration Strategy

### Phase 1: Extend Theme with Custom Colors & Sizes

1. Add custom colors (`purple`, `black`, `gray`, `white`, `destructive`) to theme
2. Add custom sizes (`xs`, `s`, `m`, `l`) to theme via variants
3. Create `button.ts` in `styleOverrides/`
4. Implement type × color combinations
5. Add to `STYLE_OVERRIDES` in `index.ts`

### Phase 2: Create Wrapper Component

Create `ButtonMui.tsx` that:

- Accepts current Button API
- Maps props to MUI Button
- Handles special cases (pending, icon-only, forceHover)
- Wraps MUI Button with custom logic

### Phase 3: Handle Special Features

1. **Pending State**

   - Use MUI Button's `loading` prop (or `LoadingButton` from `@mui/lab`)
   - Configure spinner appearance via theme

2. **Icon-Only Mode**

   - Use MUI's `IconButton` component instead of regular `Button`
   - IconButton supports `variant` prop (contained/outlined/text) matching Button
   - Apply custom size/color via theme extensions
   - Handle icon-only padding via style overrides
   - Uses same `variant × color` combinations as Button

3. **Force Hover**

   - Add custom className when `forceHover=true`
   - Style override applies hover styles

4. **Link Behavior**
   - MUI automatically handles `<a>` tag when `href` is provided
   - Handle analytics callback in `onClick` wrapper

### Phase 4: FontAwesome Icon Integration

- Use `MuiIconAdapter` (or similar) for `startIcon`/`endIcon`
- Ensure icons render correctly with proper sizing

### Phase 5: Testing & Validation

1. Visual regression testing
2. All type × color combinations
3. All sizes
4. All states (hover, focus, active, disabled, pending)
5. Icon-only mode
6. Link vs button behavior

---

## Examples

### Example 1: Simple Primary Button

**Current:**

```tsx
<Button
  type="primary"
  color="purple"
  size="m"
  text="Click Me"
  onClick={handleClick}
/>
```

**MUI Equivalent:**

```tsx
<Button
  variant="contained"
  color="primary" // purple maps to primary
  size="medium" // m maps to medium
  onClick={handleClick}
>
  Click Me
</Button>
```

### Example 2: Button with Icons

**Current:**

```tsx
<Button
  type="secondary"
  color="black"
  size="l"
  text="Save"
  iconLeft={{iconName: 'save', iconStyle: 'solid'}}
  iconRight={{iconName: 'arrow-right', iconStyle: 'solid'}}
  onClick={handleSave}
/>
```

**MUI Equivalent:**

```tsx
<Button
  variant="outlined"
  color="secondary" // black maps to secondary
  size="large" // l maps to large
  startIcon={<FontAwesomeV6Icon iconName="save" iconStyle="solid" />}
  endIcon={<FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />}
  onClick={handleSave}
>
  Save
</Button>
```

### Example 3: Icon-Only Button

**Current:**

```tsx
<Button
  type="tertiary"
  color="black"
  size="m"
  isIconOnly
  icon={{iconName: 'close', iconStyle: 'solid'}}
  onClick={handleClose}
/>
```

**MUI Equivalent (using IconButton):**

```tsx
<IconButton
  variant="text" // tertiary maps to text
  color="secondary" // black maps to secondary
  size="medium" // m maps to medium
  onClick={handleClose}
  aria-label="Close"
>
  <FontAwesomeV6Icon iconName="close" iconStyle="solid" />
</IconButton>
```

### Example 4: Pending/Loading State

**Current:**

```tsx
<Button
  type="primary"
  color="purple"
  size="m"
  text="Submit"
  isPending
  onClick={handleSubmit}
/>
```

**MUI Equivalent (custom implementation):**

```tsx
<Button
  variant="contained"
  color="primary" // purple maps to primary
  size="medium" // m maps to medium
  disabled={isPending} // Disable when pending
  startIcon={
    isPending ? (
      <FontAwesomeV6Icon
        iconName="spinner"
        iconStyle="solid"
        animationType="spin"
      />
    ) : undefined
  }
  onClick={handleSubmit}
>
  Submit
</Button>
```

**Note**: MUI Button doesn't have a built-in `loading` prop. The current implementation uses a custom spinner icon and disabled state. To use MUI's `LoadingButton`, you would need to install `@mui/lab`:

```tsx
import {LoadingButton} from '@mui/lab';

<LoadingButton
  variant="contained"
  color="primary"
  size="medium"
  loading={isPending}
  onClick={handleSubmit}
>
  Submit
</LoadingButton>;
```

### Example 5: Link Button

**Current:**

```tsx
<LinkButton
  type="primary"
  color="purple"
  size="m"
  text="Learn More"
  href="/learn"
  target="_blank"
  analyticsCallback={trackClick}
/>
```

**MUI Equivalent:**

```tsx
<Button
  variant="contained"
  color="primary" // purple maps to primary
  size="medium" // m maps to medium
  href="/learn"
  target="_blank"
  rel="noopener noreferrer"
  onClick={trackClick}
>
  Learn More
</Button>
```

**Note**: When `href` is provided, MUI automatically renders as `<a>` tag. No need for `component="a"`.

---

## Implementation Checklist

### Theme Extensions

- [x] Add custom colors to theme (`white` and `tertiary` via type extensions)
- [x] Add custom sizes to theme via variants (`extraSmall` for xs)
- [x] Configure IconButton custom colors and sizes
- [x] Add `variant` prop support for IconButton (contained/outlined/text)
- [x] Implement all `variant × color` combinations via theme variants

### Style Overrides (`button.tsx` and `iconButton.tsx`)

- [x] Implement primary × color combinations (purple, black, white, destructive) via variants
- [x] Implement secondary × color combinations (purple, black, gray, white, destructive) via variants
- [x] Implement tertiary × color combinations (purple, black, white, gray, destructive) via variants
- [x] Add hover states for all combinations (including `forceHover` support)
- [x] Add active/pressed states
- [x] Add focus-visible states
- [x] Add disabled states
- [x] Handle icon-only mode padding (for IconButton)
- [x] Handle icon sizing
- [x] Handle forceHover className
- [x] Configure loading spinner appearance (custom implementation)
- [x] Remove all data attribute selectors (using native MUI props only)

### Prop Mapping Function (`buttonPropsToMui.tsx`)

- [x] Map `type` → `variant` (primary→contained, secondary→outlined, tertiary→text)
- [x] Map `size` → custom size (xs→extraSmall, s→small, m→medium, l→large)
- [x] Map `color` → MUI color (purple→primary, black→secondary, gray→tertiary, white→white, destructive→error)
- [x] Map `iconLeft` → `startIcon`
- [x] Map `iconRight` → `endIcon`
- [x] Handle `isIconOnly` → use `IconButton` component with `variant` prop
- [x] Handle `isPending` → custom spinner icon implementation
- [x] Handle `forceHover` prop (via className)
- [x] Handle `useAsLink` → just pass `href` (MUI handles automatically)
- [x] Handle `buttonTagTypeAttribute` → `type`
- [x] Handle `analyticsCallback` in onClick wrapper
- [x] Preserve all other props
- [x] Use native MUI props (no data attributes)

### Testing

- [x] All type × color combinations render correctly
- [x] All sizes (xs, s, m, l) render correctly
- [x] Icons render with correct sizing
- [x] Icon-only mode works
- [x] Pending state works
- [x] Hover states work
- [x] Focus states work
- [x] Active states work
- [x] Disabled states work
- [x] Link behavior works
- [x] Analytics callback works
- [x] Force hover works

---

## Notes

1. **Color System**: ✅ **Implemented** - Custom colors are handled via theme extensions (`white` and `tertiary`) and native MUI `color` prop. All color combinations are styled via `variant × color` theme variants. No data attributes are used.

2. **Size System**: ✅ **Implemented** - Custom size `extraSmall` is added via theme extension. All sizes (xs→extraSmall, s→small, m→medium, l→large) are handled via theme variants. No data attributes are used.

3. **Pending State**: ⚠️ **Custom Implementation** - MUI Button doesn't have a built-in `loading` prop. Currently using a custom implementation with spinner icon and disabled state. Can optionally use `LoadingButton` from `@mui/lab` if needed.

4. **Icon Integration**: ✅ **Implemented** - Directly using `FontAwesomeV6Icon` component for `startIcon` and `endIcon`. No adapter needed.

5. **IconButton Variant Support**: ✅ **Implemented** - IconButton now supports `variant` prop (contained/outlined/text) matching Button, allowing consistent styling between Button and IconButton.

6. **Native MUI Props**: ✅ **Implemented** - All styling uses native MUI `variant` and `color` props. No data attributes (`data-color`, `data-type`, `data-size`) are used.

7. **Deprecation**: Secondary purple button is deprecated in current implementation - still supported via `variant="outlined"` + `color="primary"` but marked as deprecated in SCSS.

---

## Resources

- [MUI Button Documentation](https://mui.com/material-ui/react-button/)
- [MUI Theming Documentation](https://mui.com/material-ui/customization/theming/)
- Current Button Implementation: `src/button/GenericButton.tsx`
- Current Button Styles: `src/button/genericButton.module.scss`
