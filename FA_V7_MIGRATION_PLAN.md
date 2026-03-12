# Font Awesome v4 → v7 Migration Plan

## Context

We're currently on **FA 6.6.0 Pro** (self-hosted on DSCO CDN) with v4 shims loaded for backward compatibility. The goal is to migrate to **FA v7** and eliminate dependency on v4 shims. ~810+ files still use v4-style `fa fa-*` icon references across multiple patterns:

- **Legacy `FontAwesome.jsx` wrapper** — React component with `icon` string prop (~127 files)
- **Direct CSS classes** — `fa fa-*` in JSX/TSX/JS/HTML/HAML/ERB/SCSS/Ruby (~100+ files)
- **HAML chained classes** — `%i.fa.fa-*` syntax
- **Ruby string constants** — `'fa fa-*'` in model files
- **Embedded HTML in JSON** — `.script_json` curriculum files and locale files (~500+ files)

~138 files already use the modern `FontAwesomeV6Icon` component which is mostly v7-compatible (but has 3 known bugs to fix).

## Key v7 Changes That Affect Us

1. **v4 `-o` suffix icons** → use `fa-regular` style, drop the `-o` (e.g., `trash-o` → `trash-can` with `fa-regular`)
2. **`fa-fw` is now default** — can remove explicit `fa-fw` usages
3. **Only `.woff2` webfonts** — `.ttf`/`.woff` no longer shipped
4. **`sr-only` class removed** from distributed CSS
5. **Icons are decorative by default** (hidden from screen readers); use `aria-label` for semantic icons
6. **A few v6→v7 renames**: `user-large`→`user`, `headphones-simple`→`headphones`, `film-simple`→`film`, etc.
7. **v4 aliases still exist in v7** for icon names, but we want to remove shim dependency anyway
8. **Removed**: jQuery support, Less CSS, Rails gem, Require.js

## Strategy: Direct Inline Replacement via Codemod

Instead of a runtime mapping wrapper, we do a **one-shot codemod** that directly replaces all v4 icon names, styles, and class names with their v7 equivalents across every file. This is cleaner because:

- No runtime translation overhead
- Eliminates the need for a mapping file in production code
- After the codemod, all files are v7-native
- Makes it easier to eventually remove the legacy `FontAwesome.jsx` component

### FA_V4_TO_V7_MAP — Complete Validated Mapping

This mapping is used by the codemod script (not shipped to production). It covers every v4 icon name found in the codebase that differs from its v7 canonical name.

```ts
// Used by the codemod script only — not shipped to production.
// Maps v4 icon names → { name, style } in v7.
// Icons NOT in this map are already v7-compatible and only need the style prefix
// (fa-solid, fa-regular, or fa-brands) applied.

export const FA_V4_TO_V7_MAP: Record<
  string,
  { name: string; style: 'solid' | 'regular' | 'brands' }
> = {
  // ── Outline variants (-o suffix) → regular style, drop -o ──────────
  'arrow-circle-o-left': { name: 'circle-arrow-left', style: 'regular' },
  'arrow-circle-o-right': { name: 'circle-arrow-right', style: 'regular' },
  'check-square-o': { name: 'square-check', style: 'regular' },
  'circle-o': { name: 'circle', style: 'regular' },
  'circle-thin': { name: 'circle', style: 'regular' },
  'clock-o': { name: 'clock', style: 'regular' },
  'file-pdf-o': { name: 'file-pdf', style: 'regular' },
  'file-text-o': { name: 'file-lines', style: 'regular' },
  'lightbulb-o': { name: 'lightbulb', style: 'regular' },
  'pencil-square-o': { name: 'pen-to-square', style: 'regular' },
  'picture-o': { name: 'image', style: 'regular' },
  'square-o': { name: 'square', style: 'regular' },
  'thumbs-o-down': { name: 'thumbs-down', style: 'regular' },
  'thumbs-o-up': { name: 'thumbs-up', style: 'regular' },
  'trash-o': { name: 'trash-can', style: 'regular' },

  // ── Renamed icons (solid) ─────────────────────────────────────────
  'angle-double-left': { name: 'angles-left', style: 'solid' },
  'angle-double-right': { name: 'angles-right', style: 'solid' },
  'arrows-alt': { name: 'up-down-left-right', style: 'solid' },
  'arrows-v': { name: 'up-down', style: 'solid' },
  'bar-chart': { name: 'chart-bar', style: 'solid' },
  'chevron-circle-right': { name: 'circle-chevron-right', style: 'solid' },
  'close': { name: 'xmark', style: 'solid' },
  'cog': { name: 'gear', style: 'solid' },
  'edit': { name: 'pen-to-square', style: 'solid' },
  'ellipsis-h': { name: 'ellipsis', style: 'solid' },
  'ellipsis-v': { name: 'ellipsis-vertical', style: 'solid' },
  'exclamation-circle': { name: 'circle-exclamation', style: 'solid' },
  'exclamation-triangle': { name: 'triangle-exclamation', style: 'solid' },
  'external-link': { name: 'arrow-up-right-from-square', style: 'solid' },
  'external-link-square': { name: 'square-arrow-up-right', style: 'solid' },
  'fast-backward': { name: 'backward-fast', style: 'solid' },
  'file-text': { name: 'file-lines', style: 'solid' },
  'info-circle': { name: 'circle-info', style: 'solid' },
  'list-alt': { name: 'rectangle-list', style: 'solid' },
  'minus-square': { name: 'square-minus', style: 'solid' },
  'mobile': { name: 'mobile-screen-button', style: 'solid' },
  'mouse-pointer': { name: 'arrow-pointer', style: 'solid' },
  'plus-circle': { name: 'circle-plus', style: 'solid' },
  'plus-square': { name: 'square-plus', style: 'solid' },
  'question-circle': { name: 'circle-question', style: 'solid' },
  'refresh': { name: 'arrows-rotate', style: 'solid' },
  'repeat': { name: 'rotate-right', style: 'solid' },
  'search': { name: 'magnifying-glass', style: 'solid' },
  'search-minus': { name: 'magnifying-glass-minus', style: 'solid' },
  'sign-out': { name: 'right-from-bracket', style: 'solid' },
  'times': { name: 'xmark', style: 'solid' },
  'times-circle': { name: 'circle-xmark', style: 'solid' },
  'undo': { name: 'rotate-left', style: 'solid' },
  'video-camera': { name: 'video', style: 'solid' },
  'volume-off': { name: 'volume-xmark', style: 'solid' },
  'warning': { name: 'triangle-exclamation', style: 'solid' },

  // ── Brand icons → brands style ────────────────────────────────────
  'facebook': { name: 'facebook-f', style: 'brands' },
  'twitter': { name: 'x-twitter', style: 'brands' },
};

// Icons found in the codebase that are ALREADY v7-compatible (no mapping needed,
// just need the correct style prefix applied):
//
// solid: angle-left, angle-right, arrow-down, arrow-right, arrow-up, book,
//   calendar, caret-down, caret-left, caret-right, caret-up, check,
//   check-circle, chevron-left, chevron-right, circle, clone, code, comment,
//   comments, copy, desktop, download, envelope, eye, eye-slash, flag,
//   flag-checkered, flask, folder, graduation-cap, language, link, lock, map,
//   microphone, minus, music, pause, pencil, play, plus, print, rocket,
//   scissors, sitemap, spinner, star, thumbs-down, thumbs-up, trash, upload,
//   user, user-secret, users
//
// already-v6/v7 names (used by newer code): arrow-up-right-from-square,
//   arrows-from-line, arrows-to-line, book-open-cover, chalkboard-user,
//   chart-line, chart-simple, circle-check, circle-question, ellipsis-vertical,
//   folder-open, pen-to-square, person-chalkboard, share-from-square,
//   user-check, user-plus, xmark
```

### Step 1: Write the codemod script

Create `scripts/fa-v4-to-v7-codemod.js` that handles all patterns in a single pass across all file types.

#### All patterns the codemod must handle

**Pattern A — `FontAwesome` component `icon` prop (JSX/TSX):**
```
<FontAwesome icon="times" />          →  <FontAwesome icon="xmark" />
<FontAwesome icon="trash-o" />        →  <FontAwesome icon="trash-can" style="regular" />
```

**Pattern B — Direct CSS classes in JSX/TSX/JS strings:**
```
"fa fa-times"              →  "fa-solid fa-xmark"
"fa fa-trash-o"            →  "fa-regular fa-trash-can"
"fa fa-facebook"           →  "fa-brands fa-facebook-f"
```

**Pattern C — HAML chained class syntax (`.fa.fa-icon`):**
```
%i.fa.fa-pencil            →  %i.fa-solid.fa-pencil
%i.fa.fa-facebook.fa-lg    →  %i.fa-brands.fa-facebook-f.fa-lg
```

**Pattern D — HAML class attribute syntax:**
```
class: "fa fa-chevron-down"   →  class: "fa-solid fa-chevron-down"
```

**Pattern E — HTML files (`<i class="fa fa-icon">`):**
```
<i class="fa fa-question-circle fa-lg">  →  <i class="fa-solid fa-circle-question fa-lg">
```

**Pattern F — Ruby string constants (.rb):**
```ruby
'fa fa-sitemap'            →  'fa-solid fa-sitemap'
'fa fa-list-ul'            →  'fa-solid fa-list-ul'
```

**Pattern G — Embedded HTML in JSON (`.script_json`, locale files):**
```
"<i class=\"fa fa-check-square-o\">"  →  "<i class=\"fa-regular fa-square-check\">"
```

**Pattern H — `iconClass` and similar props:**
```
iconClass="fa fa-plus-circle"         →  iconClass="fa-solid fa-circle-plus"
iconClass="fa fa-arrows-alt"          →  iconClass="fa-solid fa-up-down-left-right"
```

#### Codemod rules

1. Use the `FA_V4_TO_V7_MAP` above for name translation
2. For icons NOT in the map, keep the name but replace `fa fa-{name}` with `fa-solid fa-{name}`
3. **Preserve modifiers**: `fa-fw`, `fa-lg`, `fa-2x`, `fa-3x`, `fa-spin`, `fa-pulse`, and all `aria-*` attributes must remain untouched
4. **Skip already-v6/v7 patterns**: do NOT touch lines with `fa-solid`, `fa-regular`, `fa-brands`, or `fa-duotone` prefixes
5. **Skip `FontAwesomeV6Icon`**: do NOT modify any `FontAwesomeV6Icon` component usage
6. Output a dry-run diff for review before applying (`--dry-run` flag)
7. Log a summary of all changes made per file

#### File types to scan

`*.jsx`, `*.tsx`, `*.js`, `*.ts`, `*.haml`, `*.erb`, `*.html`, `*.scss`, `*.css`, `*.rb`, `*.script_json`, `*.json` (locale files only)

**Exclude**: `node_modules/`, `dist/`, `build/`, `.git/`, `pegasus/` (deprecated), `icons.js` (auto-generated, handled separately in Step 6)

#### Cases that CANNOT be auto-codemoded (flag for manual review)

The codemod should **detect and log** these but NOT modify them:

1. **Dynamic/conditional icons** — icon name comes from a variable or ternary:
   - `<FontAwesome icon={isRunning ? 'stop' : 'play'} />`
   - `<FontAwesome icon={icons[type]} />`
   - `iconClass={isFullscreen ? 'fa fa-compress' : 'fa fa-arrows-alt'}`

2. **Computed icon names** — icon names from object lookups:
   - `Notification.jsx` icon mapping object

These need manual review after the codemod runs.

#### Existing bugs to fix during migration

These `FontAwesomeV6Icon` usages have incorrect syntax and should be fixed:

| File | Current (broken) | Correct |
|------|-----------------|---------|
| `apps/src/signUpFlow/LoginTypeSelection.tsx:257` | `iconName="brands fa-google"` | `iconFamily="brands" iconName="google"` |
| `apps/src/signUpFlow/LoginTypeSelection.tsx:276` | `iconName="brands fa-microsoft"` | `iconFamily="brands" iconName="microsoft"` |
| `apps/src/signUpFlow/LoginTypeSelection.tsx:313` | `iconName="kit fa-clever"` | `iconFamily="kit" iconName="clever"` |

### Step 2: Update legacy `FontAwesome.jsx` wrapper

**File**: `apps/src/legacySharedComponents/FontAwesome.jsx`

After the codemod has rewritten all `icon` prop values to v7 names, update the component itself to emit v7 class names:

```jsx
export default function FontAwesome({icon, style = 'solid', className, title, ...props}) {
  const newProps = _.assign({}, props, {
    className: `fa-${style} fa-${icon} ${className || ''}`.trim(),
  });
  return <i {...newProps} title={title} />;
}
```

The component no longer needs a runtime mapping because all callers already pass v7 icon names after the codemod.

For outline icons, the codemod also updates the call site to pass `style="regular"`:
```
<FontAwesome icon="trash-o" />  →  <FontAwesome icon="trash-can" style="regular" />
```

### Step 3: Update `FontAwesomeV6Icon` component for v7 compatibility

**File**: `frontend/packages/component-library/src/fontAwesomeV6Icon/FontAwesomeV6Icon.tsx`

Mostly compatible already. Changes needed:
- Remove any `fa-fw` additions (now default in v7)
- Ensure `'brands'` is a supported `iconStyle` value
- Update component docs/comments to reference v7
- Rename to `FontAwesomeIcon` (drop V6 from name) — optional, can be done later

### Step 4: Update CDN URLs to v7

**Files to update**:
- `shared/css/font.scss` (lines 141-149)
- `frontend/packages/fonts/src/loader/index.ts` (lines 17-26)
- `apps/.storybook/preview-head.html`

Changes:
- Point to new v7 CDN path on DSCO S3 (already uploaded)
- **Remove** `v4-font-face.min.css` and `v4-shims.min.css` imports
- Keep: `fontawesome.min.css`, `brands.min.css`, `solid.min.css`, `regular.min.css`, `duotone.min.css`, `custom-icons.min.css`

### Step 5: Update font family constants

**File**: `frontend/packages/fonts/src/constants.ts`

Change `"Font Awesome 6 *"` references to `"Font Awesome 7 *"` (or whatever v7 uses for font-family names).

### Step 6: Handle `icons.js` metadata

**File**: `apps/src/code-studio/components/icons.js` (auto-generated)

Re-run the generator script (`icons_metadata_generator.rb`) against v7 icon metadata, or update the source YAML it reads from.

### Step 7: Handle `sr-only` and accessibility

v7 removes `sr-only` from distributed CSS. Search for usages and replace with a custom utility class or inline styles if needed.

### Step 8: Clean up `fa-fw` usages

Since `fa-fw` (fixed-width) is now default in v7, search for and remove explicit `fa-fw` class usages across the codebase. This is a cosmetic cleanup but reduces noise.

## Files to Modify

| File | Change |
|------|--------|
| `scripts/fa-v4-to-v7-codemod.js` | **NEW** — codemod for all icon replacements |
| `apps/src/legacySharedComponents/FontAwesome.jsx` | Update to emit v7 classes, add `style` prop |
| `apps/src/signUpFlow/LoginTypeSelection.tsx` | Fix 3 broken `FontAwesomeV6Icon` usages |
| `shared/css/font.scss` | Update CDN URLs, remove v4 shims |
| `frontend/packages/fonts/src/loader/index.ts` | Update CDN URLs, remove v4 shims |
| `frontend/packages/fonts/src/constants.ts` | Update font family names |
| `frontend/packages/component-library/src/fontAwesomeV6Icon/FontAwesomeV6Icon.tsx` | Minor v7 updates |
| `apps/.storybook/preview-head.html` | Update FA script/CSS references |
| `apps/src/code-studio/components/icons.js` | Regenerate from v7 metadata |
| ~810+ files with v4 icon references | Codemod output (direct replacement) |
| A handful of files with dynamic icons | Manual review after codemod |

## Verification Plan

1. **After Step 1 (codemod dry-run)**: Review the diff output. Spot-check a sample of replacements against https://fontawesome.com/icons to confirm correctness.

2. **After Step 1 (codemod apply)**: Run lint on all modified files:
   ```bash
   ./tools/hooks/pre-commit
   ```

3. **After Step 2**: Run existing tests for components using `FontAwesome.jsx`:
   ```bash
   cd apps && yarn test:unit test/unit/legacySharedComponents/FontAwesomeTest.js
   ```

4. **After Step 4 (CDN update)**: Manual browser testing at `localhost:9000`:
   - Check teacher dashboard icons
   - Check student-facing lab UIs
   - Check levelbuilder icons
   - Verify no broken/missing icons in browser console

5. **Full test suite**: Run after all steps complete:
   ```bash
   cd apps && yarn test
   ```

6. **Visual regression**: Compare screenshots of key pages before/after (ideally via CI)

## Resolved Questions

- **v7 Pro assets**: Already uploaded to DSCO S3 bucket ✓
- **Rename FontAwesomeV6Icon**: Deferred — will decide later
- **Kit icons**: Already v7-compatible ✓
- **Runtime mapping vs. direct replacement**: Direct replacement chosen — cleaner, no runtime cost

## References

- [What's Changed in v7 | Font Awesome Docs](https://docs.fontawesome.com/upgrade/whats-changed/)
- [Upgrade to v7 on the Web | Font Awesome Docs](https://docs.fontawesome.com/upgrade/upgrade-on-web/)
- [Upgrade to v7 from Older Versions | Font Awesome Docs](https://docs.fontawesome.com/upgrade/upgrade-from-older-versions/)
