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

  // Color (can be extended with custom colors via theme)
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | 'inherit'
    | 'purple'
    | 'black'
    | 'gray'
    | 'white'
    | 'destructive';

  // Size (can be extended with custom sizes via theme)
  size?: 'small' | 'medium' | 'large' | 'xs' | 's' | 'm' | 'l';

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
  // Similar to Button but optimized for icons
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children?: ReactNode; // Icon goes here
  // ... other ButtonBase props
}
```

### MUI Button Capabilities & Considerations

1. **Loading state** - ✅ MUI Button has `loading` prop (or use `LoadingButton` from `@mui/lab`)
2. **Icon-only mode** - ✅ Use MUI's `IconButton` component for icon-only buttons
3. **Custom colors** - ✅ Can be added via theme extensions (see [Custom Colors](#custom-colors))
4. **Custom sizes** - ✅ Can be added via theme extensions (see [Custom Sizes](#custom-sizes))
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

**Option 1: Extend MUI Theme with Custom Sizes** (Recommended)

- Add `xs`, `s`, `m`, `l` as custom sizes via theme configuration
- MUI supports extending the size system through theme overrides
- See [Custom Sizes](#custom-sizes) section below

**Option 2: Map to Existing MUI Sizes + Overrides**

- Map `xs`/`s` → `small` with custom overrides
- Map `m` → `medium` with custom overrides
- Map `l` → `large` with custom overrides

**Recommended**: Option 1 - Add custom sizes to theme for cleaner implementation.

### Color Mapping Strategy

**Option 1: Extend MUI Theme with Custom Colors** (Recommended)

- Add `purple`, `black`, `gray`, `white`, `destructive` as custom colors via theme
- MUI supports extending the color palette through theme configuration
- See [Custom Colors](#custom-colors) section below

**Option 2: Use Data Attributes + Overrides**

- Use `data-color` attribute with style overrides
- Always use `color="primary"` (or `color="inherit"`)
- Handle all colors via style overrides

**Recommended**: Option 1 - Extend theme with custom colors for better type safety and cleaner API.

### Icon Mapping

| Current Prop       | MUI Prop         | Implementation                    |
| ------------------ | ---------------- | --------------------------------- |
| `iconLeft`         | `startIcon`      | ✅ Direct match                   |
| `iconRight`        | `endIcon`        | ✅ Direct match                   |
| `icon` (icon-only) | Use `IconButton` | ✅ Use MUI `IconButton` component |

**Note**: For icon-only buttons, use MUI's `IconButton` component instead of regular `Button`.

### Special Props That Need Custom Implementation

| Current Prop             | MUI Equivalent | Implementation Strategy                                                 |
| ------------------------ | -------------- | ----------------------------------------------------------------------- |
| `isPending`              | `loading`      | ✅ Use MUI Button's `loading` prop (or `LoadingButton` from `@mui/lab`) |
| `forceHover`             | ❌ None        | Custom className + style override                                       |
| `useAsLink`              | `href` prop    | ✅ Automatic when `href` is provided                                    |
| `buttonTagTypeAttribute` | `type`         | Direct mapping when not link                                            |
| `analyticsCallback`      | ❌ None        | Custom onClick wrapper                                                  |

---

## Custom Colors & Sizes

### Custom Colors

MUI allows extending the color palette via theme configuration. Add custom colors in `src/themes/code.org/index.ts`:

```typescript
import {createTheme} from '@mui/material';

const theme = createTheme({
  // ... existing theme config
  components: {
    MuiButton: {
      variants: [
        {
          props: {color: 'purple'},
          style: {
            // Custom purple color styles
          },
        },
        {
          props: {color: 'black'},
          style: {
            // Custom black color styles
          },
        },
        // ... other custom colors
      ],
    },
  },
});
```

Or extend the palette directly:

```typescript
const theme = createTheme({
  palette: {
    purple: {
      main: 'var(--background-brand-purple-primary)',
      dark: 'var(--background-brand-purple-strong)',
      contrastText: 'var(--text-neutral-white-fixed)',
    },
    black: {
      main: 'var(--background-neutral-primary-inverse)',
      dark: 'var(--background-neutral-octonary)',
      contrastText: 'var(--text-neutral-inverse)',
    },
    // ... other colors
  },
});
```

### Custom Sizes

MUI allows extending the size system via theme configuration:

```typescript
const theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: {size: 'xs'},
          style: {
            padding: '0.125rem 0.5rem',
            gap: '0.25rem',
            fontSize: '...',
            // ... xs size styles
          },
        },
        {
          props: {size: 's'},
          style: {
            padding: '0.3125rem 1rem',
            gap: '0.5rem',
            // ... s size styles
          },
        },
        {
          props: {size: 'm'},
          style: {
            padding: '0.5rem 1rem',
            gap: '0.5rem',
            // ... m size styles
          },
        },
        {
          props: {size: 'l'},
          style: {
            padding: '0.625rem 1rem',
            gap: '0.5rem',
            // ... l size styles
          },
        },
      ],
    },
  },
});
```

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

For each combination, we need:

- Default state colors
- Hover state colors
- Active/pressed state colors
- Disabled state colors
- Focus state outline

Example structure:

```typescript
// Primary Purple
'&.MuiButton-contained': {
  '&[data-color="purple"]': {
    backgroundColor: 'var(--background-brand-purple-primary)',
    color: 'var(--text-neutral-white-fixed)',
    '&:hover': {
      backgroundColor: 'var(--background-brand-purple-strong)',
    },
    '&.Mui-disabled': {
      backgroundColor: 'var(--background-neutral-disabled)',
      color: 'var(--text-neutral-disabled-inverse)',
    },
  },
}
```

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
   - Apply custom size/color via theme extensions
   - Handle icon-only padding via style overrides

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
  size="medium"
  data-color="purple" // Custom prop for color override
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
  size="large"
  data-color="black"
  startIcon={<MuiIconAdapter iconName="save" iconStyle="solid" />}
  endIcon={<MuiIconAdapter iconName="arrow-right" iconStyle="solid" />}
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
  color="black" // Custom color via theme
  size="m" // Custom size via theme
  onClick={handleClose}
  aria-label="Close"
>
  <MuiIconAdapter iconName="close" iconStyle="solid" />
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

**MUI Equivalent (using loading prop):**

```tsx
<Button
  variant="contained"
  color="purple" // Custom color via theme
  size="m" // Custom size via theme
  loading={isPending}
  onClick={handleSubmit}
>
  Submit
</Button>
```

**Or using LoadingButton from @mui/lab:**

```tsx
import {LoadingButton} from '@mui/lab';

<LoadingButton
  variant="contained"
  color="purple"
  size="m"
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
  color="purple" // Custom color via theme
  size="m" // Custom size via theme
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

- [ ] Add custom colors to theme (purple, black, gray, white, destructive)
- [ ] Add custom sizes to theme via variants (xs, s, m, l)
- [ ] Configure IconButton custom colors and sizes

### Style Overrides (`button.ts`)

- [ ] Implement primary × color combinations (purple, black, white, destructive)
- [ ] Implement secondary × color combinations (purple, black, gray, white, destructive)
- [ ] Implement tertiary × color combinations (purple, black, white, gray, destructive)
- [ ] Add hover states for all combinations
- [ ] Add active/pressed states
- [ ] Add focus-visible states
- [ ] Add disabled states
- [ ] Handle icon-only mode padding (for IconButton)
- [ ] Handle icon sizing
- [ ] Handle forceHover className
- [ ] Configure loading spinner appearance

### Wrapper Component (`ButtonMui.tsx`)

- [ ] Map `type` → `variant`
- [ ] Map `size` → custom size (xs, s, m, l) via theme
- [ ] Map `color` → custom color (purple, black, etc.) via theme
- [ ] Map `iconLeft` → `startIcon`
- [ ] Map `iconRight` → `endIcon`
- [ ] Handle `isIconOnly` → use `IconButton` component
- [ ] Handle `isPending` → `loading` prop
- [ ] Handle `forceHover` prop
- [ ] Handle `useAsLink` → just pass `href` (MUI handles automatically)
- [ ] Handle `buttonTagTypeAttribute` → `type`
- [ ] Handle `analyticsCallback` in onClick wrapper
- [ ] Preserve all other props

### Testing

- [ ] All type × color combinations render correctly
- [ ] All sizes (xs, s, m, l) render correctly
- [ ] Icons render with correct sizing
- [ ] Icon-only mode works
- [ ] Pending state works
- [ ] Hover states work
- [ ] Focus states work
- [ ] Active states work
- [ ] Disabled states work
- [ ] Link behavior works
- [ ] Analytics callback works
- [ ] Force hover works

---

## Notes

1. **Color System**: Since MUI's color system doesn't match ours, we'll use `data-color` attributes and style overrides to handle all color combinations.

2. **Size System**: MUI only has 3 sizes, but we have 4. We'll use style overrides with custom data attributes to handle all 4 sizes.

3. **Pending State**: MUI doesn't have built-in loading state. We'll need to implement this with a custom spinner and disabled state.

4. **Icon Integration**: Use `MuiIconAdapter` or similar to bridge FontAwesome icons with MUI's icon system.

5. **Backward Compatibility**: The wrapper component should maintain the exact same API as the current Button, so existing code doesn't need to change.

6. **Deprecation**: Secondary purple button is deprecated in current implementation - consider removing or marking clearly in migration.

---

## Resources

- [MUI Button Documentation](https://mui.com/material-ui/react-button/)
- [MUI Theming Documentation](https://mui.com/material-ui/customization/theming/)
- Current Button Implementation: `src/button/GenericButton.tsx`
- Current Button Styles: `src/button/genericButton.module.scss`
