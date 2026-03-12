# Font Awesome v4 → v7 Migration Plan

## Current Status

| Step | Description | Status | PR |
|------|-------------|--------|-----|
| 1a | Write codemod script | **Done** | [#71307](https://github.com/code-dot-org/code-dot-org/pull/71307) |
| 1b | Run codemod (apply v4→v7 replacements) | **Done** | [#71308](https://github.com/code-dot-org/code-dot-org/pull/71308) |
| 1c | Manual review of 61 dynamic icon usages | TODO | — |
| 2 | Update legacy `FontAwesome.jsx` wrapper | TODO | — |
| 3 | Update `FontAwesomeV6Icon` for v7 | TODO | — |
| 4 | Update CDN URLs to v7 | TODO | — |
| 5 | Update font family constants | TODO | — |
| 6 | Regenerate `icons.js` metadata | TODO | — |
| 7 | Handle `sr-only` accessibility | TODO | — |
| 8 | Clean up `fa-fw` usages | TODO | — |

## Context

We're currently on **FA 6.6.0 Pro** (self-hosted on DSCO CDN) with v4 shims loaded for backward compatibility. The goal is to migrate to **FA v7** and eliminate dependency on v4 shims.

~138 files already use the modern `FontAwesomeV6Icon` component which is mostly v7-compatible (3 known bugs fixed by the codemod).

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

### Step 1: Write and run the codemod script ✅

**Codemod**: `apps/tools/codemod/fa-v4-to-v7-codemod.js` ([PR #71307](https://github.com/code-dot-org/code-dot-org/pull/71307))
**Codemod output**: 657 files changed, ~35K line replacements ([PR #71308](https://github.com/code-dot-org/code-dot-org/pull/71308))

The codemod handles all patterns in a single pass across all file types. It is idempotent — running it again produces 0 changes.

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

**Exclude**: `node_modules/`, `dist/`, `build/`, `.git/`, `.claude/`, `pegasus/` (deprecated), `vendor/`, `icons.js` (auto-generated, handled separately in Step 6), `fa-v4-to-v7-codemod.js` (self)

#### Cases that CANNOT be auto-codemoded (flagged for manual review)

The codemod detected and logged **61 items** with dynamic/conditional icon usage that it did NOT modify. These need manual review.

Most use icon names that are already v7-compatible (e.g. `lock`, `caret-up`, `caret-down`). Items marked with ⚡ need actual icon name changes or `fa fa-*` class updates.

**Ternary icon props (already v7-compatible names — just verify):**

| # | File | Code | Action |
|---|------|------|--------|
| 1 | `apps/src/code-studio/components/AudioRecorder.jsx:143` | `icon={this.state.recording ? 'stop' : 'circle'}` | OK — both names valid in v7 |
| 2 | `apps/src/code-studio/components/lessonExtras/BonusLevels.jsx:73` | `icon={document.dir === 'rtl' ? 'caret-right' : 'caret-left'}` | OK |
| 3 | `apps/src/code-studio/components/lessonExtras/BonusLevels.jsx:107` | `icon={document.dir === 'rtl' ? 'caret-left' : 'caret-right'}` | OK |
| 4 | `apps/src/code-studio/pd/application_dashboard/detail_view_contents.jsx:576` | `icon={this.state.locked ? 'lock' : 'unlock'}` | OK |
| 5 | `apps/src/javalab/ControlButtons.jsx:51` | `icon={isRunning ? 'stop' : 'play'}` | OK |
| 6 | `apps/src/levelbuilder/CollapsibleEditorSection.jsx:24` | `icon={collapsed ? 'expand' : 'compress'}` | OK |
| 7 | `apps/src/levelbuilder/lesson-editor/ActivityCard.jsx:116` | `icon={this.props.collapsed ? 'expand' : 'compress'}` | OK |
| 8 | `apps/src/templates/DropdownButton.js:90` | `icon={dropdownOpen ? 'caret-up' : 'caret-down'}` | OK |
| 9 | `apps/src/templates/feedback/LevelFeedbackEntry.jsx:140` | `icon={expanded ? 'caret-down' : 'caret-right'}` | OK |
| 10 | `apps/src/templates/progress/LessonGroup.jsx:90` | `icon={this.state.collapsed ? 'caret-right' : 'caret-down'}` | OK |
| 11 | `apps/src/templates/progress/ProgressLesson.jsx:171` | `icon={showAsLocked ? 'lock' : 'unlock'}` | OK |
| 12 | `apps/src/templates/progress/SummaryProgressRow.jsx:74` | `icon={showAsLocked ? 'lock' : 'unlock'}` | OK |
| 13 | `apps/src/templates/projects/StartNewProject.jsx:196` | `icon={showFullList ? 'caret-up' : 'caret-down'}` | OK |
| 14 | `apps/src/templates/sectionProgressV2/LessonProgressColumnHeader.jsx:29` | `icon={allLocked ? 'lock' : 'lock-open'}` | OK |
| 15 | `apps/src/templates/sectionProgressV2/LevelProgressHeader.jsx:47` | `icon={isExpanded ? 'caret-down' : 'caret-right'}` | OK |
| 16 | `apps/src/templates/studioHomepages/ParticipantSections.jsx:99` | `icon={viewHidden ? 'caret-up' : 'caret-down'}` | OK |
| 17 | `apps/src/templates/teacherDashboard/OwnedSections.jsx:84` | `icon={viewHidden ? 'caret-up' : 'caret-down'}` | OK |
| 18 | `apps/src/music/views/PreviewControlsV2.tsx:74` | `icon={{iconName: isPlayingPreview ? 'stop' : 'play'}}` | OK |
| 19 | `apps/src/weblab2/htmlPreview/HTMLPreviewHeader.tsx:253` | `icon={{iconName: isFullScreenView ? 'compress' : 'expand'}}` | OK |

**⚡ Ternary icon props that need v4→v7 name changes or `fa fa-*` class updates:**

| # | File | Code | Action |
|---|------|------|--------|
| 20 | `apps/src/javalab/PreviewPaneHeader.jsx:57` | `iconClass={isFullscreen ? 'fa fa-compress' : 'fa fa-arrows-alt'}` | Change `'fa fa-arrows-alt'` → `'fa-solid fa-up-down-left-right'`, `'fa fa-compress'` → `'fa-solid fa-compress'` |
| 21 | `apps/src/templates/ShowCodeToggle.js:59` | `iconClass={this.props.showingBlocks ? 'fa fa-code' : ''}` | Change `'fa fa-code'` → `'fa-solid fa-code'` |
| 22 | `apps/src/templates/instructions/BackgroundMusicMuteButton.jsx:68` | `iconClass={isBackgroundMusicMuted ? 'fa fa-volume-off' : 'fa fa-music'}` | Change `'fa fa-volume-off'` → `'fa-solid fa-volume-xmark'`, `'fa fa-music'` → `'fa-solid fa-music'` |

**Variable/passthrough icon props (need to trace where the value comes from):**

| # | File | Code | Action |
|---|------|------|--------|
| 23 | `apps/src/javalab/Backpack.jsx:334` | `icon={backpackIcon}` | Trace `backpackIcon` source |
| 24 | `apps/src/lab2/views/dialogs/GenericConfirmationDialog.tsx:57` | `icon={icon}` | Passthrough — check callers |
| 25 | `apps/src/lab2/views/dialogs/GenericDialog.tsx:195` | `icon={useModal ? undefined : icon}` | Passthrough — check callers |
| 26 | `apps/src/legacySharedComponents/Button.jsx:201` | `icon={icon}` | Passthrough — check callers |
| 27 | `apps/src/levelbuilder/lesson-editor/LessonTipIconWithTooltip.jsx:30` | `icon={tipTypes[tip.type].icon}` | Trace `tipTypes` icon mapping |
| 28 | `apps/src/levelbuilder/reference-guide-editor/ReferenceGuideEditAll.jsx:60` | `icon={<FontAwesome icon={icon} title={alt} />}` | Passthrough — check callers |
| 29 | `apps/src/maker/ui/MakerStatusOverlay.jsx:270` | `icon={icon}` | Passthrough — check callers |
| 30 | `apps/src/sharedComponents/Notification.jsx:98` | `icon={icons[type]}` | Trace `icons` mapping object |
| 31 | `apps/src/storage/dataBrowser/LibraryCategory.jsx:46` | `icon={icon}` | Passthrough — check callers |
| 32 | `apps/src/storage/dataBrowser/LibraryTable.jsx:61` | `icon={icon}` | Passthrough — check callers |
| 33 | `apps/src/templates/ContentContainer.jsx:108` | `icon={icon}` | Passthrough — check callers |
| 34 | `apps/src/templates/ContentContainer.jsx:112` | `icon={icon}` | Passthrough — check callers |
| 35 | `apps/src/templates/ShowCodeToggle.js:60` | `icon={this.props.showingBlocks ? null : blocksGlyphIcon}` | Trace `blocksGlyphIcon` |
| 36 | `apps/src/templates/certificates/LargeChevronLink.jsx:25` | `icon={icon}` | Passthrough — check callers |
| 37 | `apps/src/templates/certificates/LargeChevronLink.jsx:29` | `icon={icon}` | Passthrough — check callers |
| 38 | `apps/src/templates/codeDocs/MethodWithOverloads.jsx:80` | `icon={icon}` | Passthrough — check callers |
| 39 | `apps/src/templates/curriculumCatalog/ExpandedCurriculumCatalogCard.jsx:259` | `icon={iconData[devices[device]].icon}` | Trace `iconData` mapping |
| 40 | `apps/src/templates/instructions/NetworkResourceLink.js:30` | `icon={this.props.icon}` | Passthrough — check callers |
| 41 | `apps/src/templates/instructions/ResourceLink.jsx:71` | `icon={icon}` | Passthrough — check callers |
| 42 | `apps/src/templates/lessonOverview/activities/LessonTip.jsx:83` | `icon={tipTypes[this.props.tip.type].icon}` | Trace `tipTypes` mapping |
| 43 | `apps/src/templates/lessonOverview/activities/LessonTip.jsx:87` | `icon={caretIcon}` | Trace `caretIcon` source |
| 44 | `apps/src/templates/progress/BubbleFactory.jsx:151` | `icon={icon}` | Passthrough — check callers |
| 45 | `apps/src/templates/progress/ProgressLegend.jsx:306` | `icon={icon}` | Passthrough — check callers |
| 46 | `apps/src/templates/progress/ProgressLegend.jsx:315` | `icon={defaultBubbleIcon}` | Trace `defaultBubbleIcon` |
| 47 | `apps/src/templates/progress/ProgressLesson.jsx:164` | `icon={caret}` | Trace `caret` source |
| 48 | `apps/src/templates/progress/ProgressLevelSet.jsx:74` | `icon={icon}` | Passthrough — check callers |
| 49 | `apps/src/templates/progress/ProgressPill.jsx:125` | `icon={icon}` | Passthrough — check callers |
| 50 | `apps/src/templates/progress/TooltipWithIcon.jsx:32` | `icon={icon}` | Passthrough — check callers |
| 51 | `apps/src/templates/sectionsRefresh/CurriculumQuickAssignTopRow.jsx:41` | `icon={icon}` | Passthrough — check callers |
| 52 | `apps/src/templates/tables/QuickActionsCell.jsx:113` | `icon={icons[type]}` | Trace `icons` mapping |
| 53 | `apps/src/weblab2/debugPanel/Console.tsx:167` | `icon={LEVEL_ICONS[log.level]}` | Trace `LEVEL_ICONS` mapping |

**Component library (generic passthrough — likely no FA-specific changes needed):**

| # | File | Code | Action |
|---|------|------|--------|
| 54 | `frontend/packages/component-library/src/alert/__tests__/Alert.test.tsx:15` | `icon={icon}` | Test file — verify test icon values |
| 55 | `frontend/packages/component-library/src/alert/__tests__/Alert.test.tsx:77` | `icon={icon}` | Test file — verify test icon values |
| 56 | `frontend/packages/component-library/src/dropdown/iconDropdown/IconDropdown.tsx:111` | `icon={selectedOption?.icon}` | Generic passthrough |
| 57 | `frontend/packages/component-library/src/heroBanner/HeroBanner.tsx:103` | `icon={announcementBannerProps.icon}` | Generic passthrough |
| 58 | `frontend/packages/component-library/src/notification-banner/stories/NotificationBanner.story.tsx:154` | `icon={icon}` | Storybook — verify story icon values |
| 59 | `frontend/packages/component-library/src/notification-banner/stories/NotificationBanner.story.tsx:169` | `icon={icon}` | Storybook — verify story icon values |
| 60 | `frontend/packages/component-library/src/segmentedButtons/SegmentedButtons.tsx:84` | `icon={icon}` | Generic passthrough |
| 61 | `frontend/packages/component-library/src/tags/Tags.tsx:52` | `icon={icon}` | Generic passthrough |

#### Existing bugs fixed by codemod ✅

These `FontAwesomeV6Icon` usages had incorrect syntax and were fixed:

| File | Before (broken) | After (fixed) |
|------|-----------------|---------------|
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

## Remaining Files to Modify

| File | Change | Step |
|------|--------|------|
| `apps/src/legacySharedComponents/FontAwesome.jsx` | Update to emit v7 classes, add `style` prop | 2 |
| `frontend/packages/component-library/src/fontAwesomeV6Icon/FontAwesomeV6Icon.tsx` | Minor v7 updates | 3 |
| `shared/css/font.scss` | Update CDN URLs, remove v4 shims | 4 |
| `frontend/packages/fonts/src/loader/index.ts` | Update CDN URLs, remove v4 shims | 4 |
| `apps/.storybook/preview-head.html` | Update FA script/CSS references | 4 |
| `frontend/packages/fonts/src/constants.ts` | Update font family names | 5 |
| `apps/src/code-studio/components/icons.js` | Regenerate from v7 metadata | 6 |
| 61 files with dynamic icons | Manual review | 1c |

### Already Done

| File | Change | PR |
|------|--------|-----|
| `apps/tools/codemod/fa-v4-to-v7-codemod.js` | **NEW** — codemod script | [#71307](https://github.com/code-dot-org/code-dot-org/pull/71307) |
| `apps/src/signUpFlow/LoginTypeSelection.tsx` | Fixed 3 broken `FontAwesomeV6Icon` usages | [#71308](https://github.com/code-dot-org/code-dot-org/pull/71308) |
| 657 files with v4 icon references | Codemod output (direct replacement) | [#71308](https://github.com/code-dot-org/code-dot-org/pull/71308) |

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

## Learnings from Codemod Run

- **Actual scope**: 657 files modified (not ~810+ as initially estimated), ~35K line replacements
- **Breakdown**: The vast majority of changes are in locale JSON and `script_json` curriculum files containing embedded HTML with FA classes. Only ~100 JSX/TSX/JS/HAML/Ruby/SCSS files had direct code changes.
- **Most changes are invisible**: The bulk of replacements are style prefix swaps (`fa fa-*` → `fa-solid fa-*`) that render identically. Only the ~50 icon renames (e.g. `times` → `xmark`, `trash-o` → `trash-can`) could produce visual differences, and most of those look the same.
- **Prettier reformatting**: Some longer v7 icon names (e.g. `fa-magnifying-glass-minus`, `fa-arrow-up-right-from-square`) pushed lines over prettier's line length limit, requiring auto-formatting. This is expected and harmless.
- **No `-o` icons in FontAwesome component**: No outline (`-o` suffix) icons were used via the `<FontAwesome icon="..." />` pattern, so the `style="regular"` prop addition was only needed for CSS class contexts.
- **v6 syntax already v7-compatible**: Files already using `fa-solid`/`fa-regular`/`fa-brands` class syntax are correctly skipped — v6 and v7 share the same class format.

## Resolved Questions

- **v7 Pro assets**: Already uploaded to DSCO S3 bucket ✓
- **Rename FontAwesomeV6Icon**: Deferred — will decide later
- **Kit icons**: Already v7-compatible ✓
- **Runtime mapping vs. direct replacement**: Direct replacement chosen — cleaner, no runtime cost
- **Codemod location**: `apps/tools/codemod/fa-v4-to-v7-codemod.js` (alongside existing `typography-to-mui.js` codemod)

## References

- [What's Changed in v7 | Font Awesome Docs](https://docs.fontawesome.com/upgrade/whats-changed/)
- [Upgrade to v7 on the Web | Font Awesome Docs](https://docs.fontawesome.com/upgrade/upgrade-on-web/)
- [Upgrade to v7 from Older Versions | Font Awesome Docs](https://docs.fontawesome.com/upgrade/upgrade-from-older-versions/)
