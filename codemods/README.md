# Codemods

## button-to-mui-button.js

Transforms Button and LinkButton components from `@code-dot-org/component-library/button` to MUI Button/IconButton components.

### Usage

```bash
# Transform all JS files in directory
npx jscodeshift -t codemods/button-to-mui-button.js apps/src/templates/curriculumCatalog/**/*.js

# Transform all JSX files in directory
npx jscodeshift -t codemods/button-to-mui-button.js apps/src/templates/curriculumCatalog/**/*.jsx

# Transform both JS and JSX files (run both commands)
npx jscodeshift -t codemods/button-to-mui-button.js apps/src/templates/curriculumCatalog/**/*.js apps/src/templates/curriculumCatalog/**/*.jsx

# Transform with dry-run (preview changes)
npx jscodeshift -t codemods/button-to-mui-button.js --dry apps/src/templates/curriculumCatalog/**/*.jsx

# Transform specific file
npx jscodeshift -t codemods/button-to-mui-button.js apps/src/templates/curriculumCatalog/CurriculumCatalogCard.jsx
```

### What it does

1. **Updates imports:**
   - Removes `Button` and `LinkButton` from `@code-dot-org/component-library/button`
   - Adds `buttonPropsToMui` import
   - Adds `MuiButton` and `MuiIconButton` imports from `@mui/material`
   - Keeps `buttonColors` import if present

2. **Transforms Button/LinkButton JSX:**
   - Converts `<Button>` and `<LinkButton>` to use `buttonPropsToMui` utility
   - Renders `<MuiButton>` or `<MuiIconButton>` based on `isIconButton` flag
   - Preserves all props (onClick, href, text, color, type, className, etc.)
   - Automatically adds `useAsLink: true` for LinkButton components

### Example transformation

**Before:**
```jsx
import {Button, LinkButton, buttonColors} from '@code-dot-org/component-library/button';

<Button
  type="primary"
  color={buttonColors.purple}
  text="Click me"
  onClick={handleClick}
/>
```

**After:**
```jsx
import {buttonColors, buttonPropsToMui} from '@code-dot-org/component-library/button';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';

{(() => {
  const {isIconButton, buttonProps, iconButtonProps} = buttonPropsToMui({
    type: 'primary',
    color: buttonColors.purple,
    text: 'Click me',
    onClick: handleClick,
  });
  return isIconButton ? (
    <MuiIconButton {...iconButtonProps} />
  ) : (
    <MuiButton {...buttonProps} />
  );
})()}
```

### Notes

- The codemod preserves all existing props and functionality
- It handles both Button and LinkButton components
- Spread attributes are preserved
- The transformation is safe and can be run multiple times (idempotent)

