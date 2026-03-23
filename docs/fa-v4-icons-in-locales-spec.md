# Font Awesome v4 Icon Usage in Locale Files — Analysis & Spec

## Background

We are currently on **Font Awesome v6** and planning to upgrade to **v7**. FA v7 removes the v4 backward-compatibility shims that v6 provides (due to change in how we serve font files vs how FA serves source files), meaning all remaining v4 class references will break after the upgrade.

As part of the FA v4 to v7 migration effort:
- **PR #71307** added a codemod script to migrate FA v4 class references in source code (JS/JSX/TSX/HAML/Ruby/JSON)
- **PR #71309** (open, not yet merged) proposes a DB migration on `activity_sections` and `levels` tables to update English source data

Both the **English source data in the DB** and **translated locale files** still contain FA v4 references. The locale files live in `dashboard/config/locales/` and are synced through CrowdIn (the i18n translation platform). The FA v4 icon HTML is baked into both the source strings and the translated strings.

**Important:** The DB migration (PR #71309) will NOT fix locale files. The `sync-out` process (`bin/i18n/resources/dashboard/curriculum_content/sync_out.rb`) writes locale files from **CrowdIn translations**, not from the DB. Translators copied FA v4 HTML (e.g. `<i class="fa fa-list-alt">`) verbatim into their translations. Even after the DB migration updates English source data and `sync-in` uploads clean v7 strings, CrowdIn does not auto-update already-translated strings for non-translatable content like HTML class names. The locale files require their own separate migration.

---

## Current Impact: v4 Icons Still Render Correctly

**The v4 icon class names in locale files currently work fine** because we are on FA v6, which ships v4 backward-compatibility shims (`v4-shims.min.css` and `v4-font-face.min.css`). These are loaded on every dashboard page via `frontend/packages/fonts/src/loader/index.ts:injectFontAwesome()`, which is called from `apps/src/sites/studio/pages/code-studio.js`. The shims automatically map v4 class names (e.g. `fa fa-list-alt`) to their v6 equivalents at the CSS level.

**However, FA v7 update will drop v4 shims entirely.** When we upgrade from v6 to v7, these shims will no longer be available (due to how we serve font files), and all v4 class references in locale files will result in **missing/invisible icons** for ~40 translated locales. This might make the locale migration a **hard prerequisite for the FA v7 upgrade**.

### Decision framework for PM

| Option | Effort                                              | Risk | When it matters                                       |
|--------|-----------------------------------------------------|------|-------------------------------------------------------|
| **Migrate locale files now** | Unknown (we're in a middle of locales infra change) | Very low | Clears the path for v7 upgrade; no blockers later     |
| **Migrate as part of v7 upgrade** | Unknown (we're in a middle of locales infra change) | Medium — easy to overlook; adds scope to the v7 upgrade | Must be done before or alongside v7 upgrade           |
| **Do nothing** | None | **High — icons will break when we move to FA v7** | Might be not viable if affected locales are important |

---

## Scope of the Problem

### Impact Summary

| Category | Audience | Page Type | Curricula | Locale Files | Occurrences |
|----------|----------|-----------|-----------|-------------|-------------|
| `fa fa-*` in activity_sections | **Teachers** | Lesson Plan pages | CSF, CSD, CSC, AI/ML courses (29 scripts) | 40 | ~35,500 |
| `fa fa-*` in long_instructions | **Students** | Level instruction panel | K-5 Online PD (2 levels) | 13 | ~26 |
| `icon://fa-*` in long_instructions | **Students** | Level instruction panel | CSD Unit 6 (18 levels) | 8 | 72 |

### Technical Summary

| Category | Directory | Files Affected | Total Occurrences | Distinct Icons |
|----------|-----------|---------------|-------------------|----------------|
| HTML class `fa fa-*` | `activity_sections/` | 40 | ~35,500 | 11 |
| HTML class `fa fa-*` | `long_instructions/` | 13 | ~26 | 1 |
| Icon URI `icon://fa-*` | `long_instructions/` | 8 | 72 | 7 |

**No FA v4 references exist in any other locale subdirectory** (blocks, short_instructions, authored_hints, resources, etc.) or in `apps/i18n/`.

**Note:** English locale files (`en-GB.json`) do not contain `description` fields — English descriptions are served directly from the DB, not from locale files. Only translated (non-English) locales have `description` fields with embedded FA v4 icon HTML.

---

## Category 1: HTML Class References in `activity_sections/`

### Location
`dashboard/config/locales/activity_sections/<locale>.json`

### Pattern
FA v4 icons appear embedded in HTML within `description` fields of translated activity sections:
```html
<i class="fa fa-list-alt" aria-hidden="true"></i>
```

### Affected Locales (40 files)
ar-SA, az-AZ, bg-BG, ca-ES, cs-CZ, de-DE, el-GR, es-ES, es-MX, fa-IR, fil-PH, fr-FR, he-IL, hi-IN, hu-HU, id-ID, it-IT, ja-JP, ka-GE, kn-IN, ko-KR, mn-MN, ms-MY, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sk-SK, sq-AL, ta-IN, te-IN, th-TH, tr-TR, uk-UA, ur-PK, uz-UZ, vi-VN, zh-CN, zh-TW

### Distinct Icons & Counts

| v4 Class | Occurrences | v7 Equivalent | Style |
|----------|-------------|---------------|-------|
| `fa fa-list-alt` | 26,772 | `fa-solid fa-rectangle-list` | solid (renamed) |
| `fa fa-comments` | 2,448 | `fa-solid fa-comments` | solid (same name) |
| `fa fa-lightbulb-o` | 1,738 | `fa-regular fa-lightbulb` | regular (outline) |
| `fa fa-check-square-o` | 1,287 | `fa-regular fa-square-check` | regular (renamed+outline) |
| `fa fa-video-camera` | 817 | `fa-solid fa-video` | solid (renamed) |
| `fa fa-refresh` | 691 | `fa-solid fa-arrows-rotate` | solid (renamed) |
| `fa fa-desktop` | 607 | `fa-solid fa-desktop` | solid (same name) |
| `fa fa-file-text-o` | 545 | `fa-regular fa-file-lines` | regular (renamed+outline) |
| `fa fa-microphone` | 390 | `fa-solid fa-microphone` | solid (same name) |
| `fa fa-pencil` | 254 | `fa-solid fa-pencil` | solid (same name) |
| `fa fa-file-text` | 3 | `fa-solid fa-file-lines` | solid (renamed) |

**Total: ~35,552 occurrences across 11 distinct icon names**

### Where These Are Rendered

**Page type:** Teacher Lesson Plan pages
**URL pattern:** `/s/<script>/lessons/<position>` or `/courses/<course>/units/<unit>/lessons/<position>`
**Audience:** Teachers only (student lesson plans do NOT include activity section descriptions)
**Rendering pipeline:** `LessonsController#show` → `ActivitySection.summarize_for_lesson_show` → `EnhancedSafeMarkdown`

### Affected Curricula (29 scripts, ~2,700 unique activity sections)

| Curriculum | Scripts | Activity Sections with v4 Icons |
|-----------|---------|-------------------------------|
| **CS Discoveries (CSD)** Unit 7 | csd7-2021, csd7-2022, csd7-2023 | ~735 |
| **CS Fundamentals (CSF)** Course D | coursed-2022, coursed-2023 | ~310 |
| **CSF** Course C | coursec-2022, coursec-2023 | ~294 |
| **CSF** Course F | coursef-2022, coursef-2023 | ~286 |
| **CSF** Course E | coursee-2022, coursee-2023 | ~236 |
| **K-5 Special Topics** Unplugged | k5-unplugged | ~148 |
| **How AI Works** (6-8 Special Topics) | how-ai-works-2023 | ~143 |
| **Computer Vision** (9-12 Special Topics) | computer-vision | ~130 |
| **CSD** Unit 6 (Physical Computing) | csd6-2022, csd6a-2023, csd6b-2023 | ~145 |
| **Foundations of Gen AI** (9-12 Special Topics) | foundations-gen-ai-2024 | ~91 |
| **CSC K-5** (CS Connections) | poetry-2023, csc-timecapsule-2023, csc-ecosystems-2023, csc-mappinglandmarks-2023, csc-bookcovers-2023, csc-adaptations-2023, csc-starquilts-2023 | ~174 |
| **AI Ethics** (9-12 Special Topics) | ai-ethics-2023 | ~12 |
| **CSD** Unit 5 | csd5-2021, csd5-2022, csd5-2023 | ~3 |

**Note:** Counts are based on the most-translated locale (es-MX). Less-translated locales have fewer affected sections. Different locales may have different subsets depending on translation coverage.

---

## Category 2: HTML Class References in `long_instructions/`

### Location
`dashboard/config/locales/long_instructions/<locale>.json`

### Affected Locales (13 files)
de-DE, es-ES, es-MX, fr-FR, hi-IN, it-IT, ja-JP, pt-BR, pt-PT, ru-RU, uk-UA, uz-UZ, zh-CN

**Note:** mn-MN also contains `fa fa-` but the translator translated the icon class name itself into Mongolian (`fa fa-гадаад-холбоос-дөрвөлжин`), making it non-functional regardless. This is a pre-existing broken translation unrelated to the v4-to-v7 migration.

### Distinct Icons

| v4 Class | Occurrences | v7 Equivalent | Style |
|----------|-------------|---------------|-------|
| `fa fa-external-link-square` | 26 | `fa-solid fa-square-up-right` | solid (renamed) |

### Where These Are Rendered

**Page type:** Student Level pages (instruction panel)
**URL pattern:** `/s/<script>/lessons/<position>/levels/<id>`
**Audience:** Students
**Rendering pipeline:** `ScriptLevelsController#show` → `TopInstructions` → `MarkdownInstructions` → `SafeMarkdown`

### Affected Levels & Curricula

| Level Name | Curriculum |
|-----------|------------|
| OPD-K5 Problem Solving | K-5 Online Professional Development |
| OPD-K5 Problem Solving_dani | K-5 Online Professional Development (kodea-pd-2021) |

These are PD (Professional Development) levels containing Twitter share links with `<i class="fa fa-external-link-square">`.

---

## Category 3: `icon://` URI References in `long_instructions/`

### Location
`dashboard/config/locales/long_instructions/<locale>.json`

### Pattern
These are **not CSS class references**. They are AppLab/GameLab icon URIs used as image sources in student code examples:
```
icon://fa-smile-o
```

These are resolved at runtime by `apps/src/assetManagement/assetPrefix.js:renderIconToString()`, which maps icon names to unicode code points via the mapping in `apps/src/code-studio/components/icons.js`.

### Affected Locales (8 files)
az-AZ, es-ES, es-MX, it-IT, pt-BR, sq-AL, uk-UA, zh-CN

### Distinct Icons

| v4 Icon URI | Occurrences | Unicode | Usage Context |
|-------------|-------------|---------|---------------|
| `icon://fa-smile-o` | 41 | `f118` | Emotion machine curriculum — happy face |
| `icon://fa-meh-o` | 23 | `f11a` | Emotion machine curriculum — neutral face |
| `icon://fa-frown-o` | 21 | `f119` | Emotion machine curriculum — sad face |
| `icon://fa-thumbs-o-up` | 16 | `f087` | Emotion machine curriculum — thumbs up |
| `icon://fa-arrow-up` | 12 | — | Directional arrows in instructions |
| `icon://fa-arrow-right` | 12 | — | Directional arrows in instructions |
| `icon://fa-arrow-left` | 12 | — | Directional arrows in instructions |
| `icon://fa-arrow-down` | 12 | — | Directional arrows in instructions |

### Where These Are Rendered

**Page type:** Student Level pages (instruction panel)
**URL pattern:** `/s/<script>/lessons/<position>/levels/<id>`
**Audience:** Students
**Rendering pipeline:** Same as Category 2

### Affected Levels & Curricula

All are **CS Discoveries Unit 6** (Physical Computing / AppLab) levels:

| Level Name | Versions |
|-----------|----------|
| CSD U6 emotion machine 1 | original, _2018, _2019, _2021 |
| CSD U6 for loop images | original, _2018, _2019, _2021 |
| CSD U6 - Board Inputs - A | _2222, _2023 |
| CSD U6 - Board Inputs - PracB | _2222, _2023 |
| CSD U6 - Screen Outputs - ChalB | _2222, _2023, _mb2022 |
| CSD U6 - Screen Outputs - PracB | _2222, _2023, _mb2022 |

These appear in scripts: csd6-2017 through csd6-2023, devices-2022/2023, microbit-2022/2023, and various focus-on-* scripts.

---

## How Locale Files Are Generated (Data Flow)

```
DB (activity_sections.description, levels.long_instructions)
  --> bin/i18n sync-in (serialize to i18n source JSON)
    --> CrowdIn (upload English source)
      --> Translators produce translations
        --> bin/i18n sync-down (download translations)
          --> bin/i18n sync-out (write to dashboard/config/locales/<type>/<locale>.json)
```

Key files:
- `bin/i18n/sync-all.rb` — orchestrates the full sync pipeline
- `bin/i18n/resources/dashboard/curriculum_content/sync_in.rb` — serializes activity sections by UUID
- `bin/i18n/resources/dashboard/curriculum_content/sync_out.rb` — writes to locale JSON files
- `dashboard/lib/services/i18n/curriculum_sync_utils/serializers.rb` — `ActivitySectionCrowdinSerializer`

---

## Recommendations (by Claude)

### Category 1 & 2 (HTML class `fa fa-*`): Script-based migration

**Recommended approach: Write a locale-specific migration script.**

These are straightforward find-and-replace operations within JSON string values. The mapping is well-defined (see tables above) and deterministic.

**Why not wait for CrowdIn re-sync:**
- The v4 references are baked into the translated strings themselves. Re-syncing won't fix them because the translations contain the literal HTML — CrowdIn doesn't auto-update icon classes in already-translated strings.
- Waiting for retranslation of ~35,000 strings across 40+ languages is impractical.

**Implementation approach:**
1. Write a script (Ruby or Node) that:
   - Reads each `activity_sections/<locale>.json` and `long_instructions/<locale>.json`
   - Applies the v4-to-v7 class name substitutions within JSON string values
   - Writes the updated files back
2. The mapping table is small (12 entries) and matches the codemod's `FA_V4_TO_V7_MAP`
3. Run the script once, commit the results
4. Optionally: add a `sync-out` post-processing hook to catch any future v4 references that come through CrowdIn translations (defensive measure)

**Substitution map for the script:**
```
"fa fa-list-alt"            --> "fa-solid fa-rectangle-list"
"fa fa-comments"            --> "fa-solid fa-comments"
"fa fa-lightbulb-o"         --> "fa-regular fa-lightbulb"
"fa fa-check-square-o"      --> "fa-regular fa-square-check"
"fa fa-video-camera"        --> "fa-solid fa-video"
"fa fa-refresh"             --> "fa-solid fa-arrows-rotate"
"fa fa-desktop"             --> "fa-solid fa-desktop"
"fa fa-file-text-o"         --> "fa-regular fa-file-lines"
"fa fa-file-text"           --> "fa-solid fa-file-lines"
"fa fa-microphone"          --> "fa-solid fa-microphone"
"fa fa-pencil"              --> "fa-solid fa-pencil"
"fa fa-external-link-square" --> "fa-solid fa-square-up-right"
```

### Category 3 (`icon://` URIs): Migrate as part of a coordinated effort

These use v4-era (possibly v3) icon names and should be updated to v7 names as part of the broader migration. However, unlike Categories 1 & 2, updating locale files alone is **not sufficient** — the `icon://` system has multiple coupled components that must be updated together:

1. **`apps/src/code-studio/components/icons.js`** — the unicode mapping uses v4 short names as keys (e.g. `'smile-o': 'f118'`). Must add/rename keys to v7 names (e.g. `'face-smile'`).
2. **`apps/src/assetManagement/assetPrefix.js:renderIconToString()`** — uses font family `'FontAwesome'` (v4 font face name). Must update to the v7 font family name.
3. **DB level source data** — the same `icon://fa-smile-o` references exist in level properties in the database (these are what students see in their code). Must be updated via DB migration.
4. **Locale files** — the translated `long_instructions/` files (8 locales, 72 occurrences).

**Locale-only `icon://` substitution map (for when the coordinated migration happens):**
```
"icon://fa-smile-o"      --> "icon://fa-face-smile"
"icon://fa-frown-o"      --> "icon://fa-face-frown"
"icon://fa-meh-o"        --> "icon://fa-face-meh"
"icon://fa-thumbs-o-up"  --> "icon://fa-thumbs-up"
"icon://fa-arrow-up"     --> "icon://fa-arrow-up"       (unchanged)
"icon://fa-arrow-down"   --> "icon://fa-arrow-down"     (unchanged)
"icon://fa-arrow-left"   --> "icon://fa-arrow-left"     (unchanged)
"icon://fa-arrow-right"  --> "icon://fa-arrow-right"    (unchanged)
```

**Note:** The `fa-arrow-*` icons are unchanged in v7. Only the `-o` suffix icons (outline variants) need renaming.

### Optional: Defensive sync-out hook

To prevent v4 references from creeping back in via future CrowdIn translations:
- Add a post-processing step in `bin/i18n/resources/dashboard/curriculum_content/sync_out.rb` that applies the same substitution map when writing locale files
- This ensures any new translations that copy v4 HTML from older translations get auto-corrected

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Doing nothing**: v4 shims are dropped in FA v7 upgrade | High | High — icons break for ~40 translated locales | This is a hard blocker for the v7 upgrade |
| Script introduces malformed JSON | Low | High | Validate JSON after transformation; test with `JSON.parse` |
| Wrong icon mapping breaks visual | Low | Medium | Mapping matches the DB migration proposed in PR #71309 |
| CrowdIn sync overwrites fixes | Medium | Medium | Add sync-out hook; or run script after each sync-down |
| `icon://` locale-only migration without updating icons.js + DB | Medium | High — breaks icon rendering at runtime | Must be a coordinated migration across all 4 components |

---

## Estimated Scope

- **Script development**: Small — 12-entry substitution map applied to JSON files
- **Files modified**: ~53 locale JSON files (40 activity_sections + 13 long_instructions)
- **String occurrences modified**: ~35,580
- **Testing**: Spot-check rendered icons in a few locales in the browser; verify JSON validity
