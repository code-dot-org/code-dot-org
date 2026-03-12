# Font Awesome v4 → v7 Migration Plan

## Context

We're currently on **FA 6.6.0 Pro** (self-hosted on DSCO CDN) with v4 shims loaded for backward compatibility. The goal is to migrate to **FA v7** and eliminate dependency on v4 shims. ~227 files still use v4-style icon references across two patterns (legacy `FontAwesome.jsx` wrapper and direct CSS classes). ~138 files already use the modern `FontAwesomeV6Icon` component which is mostly v7-compatible.

## Key v7 Changes That Affect Us

1. **v4 `-o` suffix icons** → use `fa-regular` style, drop the `-o` (e.g., `trash-o` → `trash` with `fa-regular`)
2. **`fa-fw` is now default** — can remove explicit `fa-fw` usages
3. **Only `.woff2` webfonts** — `.ttf`/`.woff` no longer shipped
4. **`sr-only` class removed** from distributed CSS
5. **Icons are decorative by default** (hidden from screen readers); use `aria-label` for semantic icons
6. **A few v6→v7 renames**: `user-large`→`user`, `headphones-simple`→`headphones`, `film-simple`→`film`, etc.
7. **v4 aliases still exist in v7** for icon names, but we want to remove shim dependency anyway
8. **Removed**: jQuery support, Less CSS, Rails gem, Require.js

## Strategy: Smart Wrapper + Targeted Codemod

### Step 1: Create v4→v7 icon name mapping (~30 min)

Create a mapping file at `apps/src/utils/fontAwesomeV4ToV7Map.ts`:

```ts
// Maps v4 icon names to { name, style } in v7
// Icons not in this map are unchanged (just need fa-solid prefix)
export const FA_V4_TO_V7_MAP: Record<string, { name: string; style: 'solid' | 'regular' }> = {
  // -o suffix icons → regular style, drop -o
  'arrow-circle-o-left': { name: 'arrow-circle-left', style: 'regular' },
  'arrow-circle-o-right': { name: 'arrow-circle-right', style: 'regular' },
  'check-square-o': { name: 'square-check', style: 'regular' },
  'clock-o': { name: 'clock', style: 'regular' },
  'file-pdf-o': { name: 'file-pdf', style: 'regular' },
  'file-text-o': { name: 'file-lines', style: 'regular' },
  'minus-square': { name: 'square-minus', style: 'solid' },
  'pencil-square-o': { name: 'pen-to-square', style: 'regular' },
  'picture-o': { name: 'image', style: 'regular' },
  'plus-square': { name: 'square-plus', style: 'solid' },
  'square-o': { name: 'square', style: 'regular' },
  'trash-o': { name: 'trash-can', style: 'regular' },
  // Renamed icons (no style change)
  'arrows-alt': { name: 'up-down-left-right', style: 'solid' },
  'arrows-v': { name: 'up-down', style: 'solid' },
  'close': { name: 'xmark', style: 'solid' },
  'cog': { name: 'gear', style: 'solid' },
  'edit': { name: 'pen-to-square', style: 'solid' },
  'ellipsis-h': { name: 'ellipsis', style: 'solid' },
  'ellipsis-v': { name: 'ellipsis-vertical', style: 'solid' },
  'exclamation-circle': { name: 'circle-exclamation', style: 'solid' },
  'exclamation-triangle': { name: 'triangle-exclamation', style: 'solid' },
  'flag-checkered': { name: 'flag-checkered', style: 'solid' },
  'graduation-cap': { name: 'graduation-cap', style: 'solid' },
  'info-circle': { name: 'circle-info', style: 'solid' },
  'list-alt': { name: 'rectangle-list', style: 'solid' },
  'mouse-pointer': { name: 'arrow-pointer', style: 'solid' },
  'pencil': { name: 'pencil', style: 'solid' },
  'question-circle': { name: 'circle-question', style: 'solid' },
  'repeat': { name: 'rotate-right', style: 'solid' },
  'search': { name: 'magnifying-glass', style: 'solid' },
  'search-minus': { name: 'magnifying-glass-minus', style: 'solid' },
  'times': { name: 'xmark', style: 'solid' },
  'times-circle': { name: 'circle-xmark', style: 'solid' },
  'undo': { name: 'rotate-left', style: 'solid' },
  'video-camera': { name: 'video', style: 'solid' },
  'warning': { name: 'triangle-exclamation', style: 'solid' },
  'mobile': { name: 'mobile-screen-button', style: 'solid' },
  'facebook': { name: 'facebook-f', style: 'solid' }, // actually brands
  'twitter': { name: 'x-twitter', style: 'solid' }, // actually brands
};
```

> **Note**: This mapping needs to be validated against the actual FA v7 icon reference. Some names may differ slightly. Cross-reference with https://fontawesome.com/icons during implementation.

### Step 2: Update legacy `FontAwesome.jsx` wrapper (~15 min)

**File**: `apps/src/legacySharedComponents/FontAwesome.jsx`

Update it to translate v4 names to v7 at render time:

```jsx
import {FA_V4_TO_V7_MAP} from '@cdo/apps/utils/fontAwesomeV4ToV7Map';

export default function FontAwesome({icon, className, title, ...props}) {
  const mapped = FA_V4_TO_V7_MAP[icon];
  const iconName = mapped ? mapped.name : icon;
  const styleClass = mapped ? `fa-${mapped.style}` : 'fa-solid';

  const newProps = _.assign({}, props, {
    className: `${styleClass} fa-${iconName} ${className || ''}`,
  });
  return <i {...newProps} title={title} />;
}
```

This instantly fixes **~127 files** with zero changes to consumers.

### Step 3: Write a codemod script for direct CSS class usages (~1 hour)

**Target**: ~100 files with direct `fa fa-*` patterns in JSX/TSX/JS/HAML/ERB/HTML.

Create a Node.js codemod script (`scripts/fa-v4-to-v7-codemod.js`) that:
1. Finds all files with `fa fa-` pattern
2. Replaces `fa fa-{v4name}` with `fa-solid fa-{v7name}` (or `fa-regular` for `-o` icons)
3. Uses the same mapping from Step 1
4. Outputs a diff for review before applying

For HAML files (`.fa.fa-{name}`), the replacement is `.fa-solid.fa-{v7name}`.

### Step 4: Update `FontAwesomeV6Icon` component for v7 compatibility (~30 min)

**File**: `frontend/packages/component-library/src/fontAwesomeV6Icon/FontAwesomeV6Icon.tsx`

Mostly compatible already. Changes needed:
- Rename to `FontAwesomeIcon` (drop V6 from name) — optional, can be done later
- Remove any `fa-fw` additions (now default in v7)
- Update component docs/comments to reference v7

### Step 5: Update CDN URLs to v7 (~15 min)

**Files to update**:
- `shared/css/font.scss` (lines 141-149)
- `frontend/packages/fonts/src/loader/index.ts` (lines 17-26)
- `apps/.storybook/preview-head.html`

Changes:
- Point to new v7 CDN path on DSCO S3 (already uploaded)
- **Remove** `v4-font-face.min.css` and `v4-shims.min.css` imports
- Keep: `fontawesome.min.css`, `brands.min.css`, `solid.min.css`, `regular.min.css`, `duotone.min.css`, `custom-icons.min.css`

### Step 6: Update font family constants (~5 min)

**File**: `frontend/packages/fonts/src/constants.ts`

Change `"Font Awesome 6 *"` references to `"Font Awesome 7 *"` (or whatever v7 uses for font-family names).

### Step 7: Handle `icons.js` metadata (~15 min)

**File**: `apps/src/code-studio/components/icons.js` (auto-generated)

Re-run the generator script (`icons_metadata_generator.rb`) against v7 icon metadata, or update the source YAML it reads from.

### Step 8: Handle `sr-only` and accessibility (~15 min)

v7 removes `sr-only` from distributed CSS. Search for usages and replace with a custom utility class or inline styles if needed.

## Files to Modify

| File | Change |
|------|--------|
| `apps/src/utils/fontAwesomeV4ToV7Map.ts` | **NEW** — icon name mapping |
| `apps/src/legacySharedComponents/FontAwesome.jsx` | Update to use mapping |
| `scripts/fa-v4-to-v7-codemod.js` | **NEW** — codemod for direct CSS classes |
| `shared/css/font.scss` | Update CDN URLs, remove v4 shims |
| `frontend/packages/fonts/src/loader/index.ts` | Update CDN URLs, remove v4 shims |
| `frontend/packages/fonts/src/constants.ts` | Update font family names |
| `frontend/packages/component-library/src/fontAwesomeV6Icon/FontAwesomeV6Icon.tsx` | Minor v7 updates |
| `apps/.storybook/preview-head.html` | Update FA script/CSS references |
| `apps/src/code-studio/components/icons.js` | Regenerate from v7 metadata |
| ~100 files with direct `fa fa-*` | Codemod output |

## Verification Plan

1. **After Step 2**: Run existing tests for components using `FontAwesome.jsx`:
   ```bash
   cd dashboard && bundle exec spring testunit # relevant tests
   cd apps && yarn test:unit # relevant component tests
   ```

2. **After Step 3 (codemod)**: Run lint on modified files:
   ```bash
   ./tools/hooks/pre-commit
   ```

3. **After Step 5 (CDN update)**: Manual browser testing at `localhost:9000`:
   - Check teacher dashboard icons
   - Check student-facing lab UIs
   - Check levelbuilder icons
   - Verify no broken/missing icons in browser console

4. **Full test suite**: Run after all steps complete:
   ```bash
   cd apps && yarn test
   ```

5. **Visual regression**: Compare screenshots of key pages before/after (ideally via CI)

## Resolved Questions

- **v7 Pro assets**: Already uploaded to DSCO S3 bucket ✓
- **Rename FontAwesomeV6Icon**: Deferred — will decide later
- **Kit icons**: Already v7-compatible ✓

## References

- [What's Changed in v7 | Font Awesome Docs](https://docs.fontawesome.com/upgrade/whats-changed/)
- [Upgrade to v7 on the Web | Font Awesome Docs](https://docs.fontawesome.com/upgrade/upgrade-on-web/)
- [Upgrade to v7 from Older Versions | Font Awesome Docs](https://docs.fontawesome.com/upgrade/upgrade-from-older-versions/)
