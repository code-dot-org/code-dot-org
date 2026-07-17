---
name: rebrand
description: Migrate a legacy UI component in apps/ to the design system for the rebrand (Jira epic SL-1892) — swap legacy controls to MUI/DSCO components, legacy colors to semantic CSS vars, and text to MUI Typography, then open a minimal-diff draft PR with old-vs-new compare links and a QA checklist. Use when implementing a rebrand ticket.
---

# Rebrand a component to the design system

A rebrand migrates legacy UI in `apps/` to the design system: DS components, semantic
colors, MUI Typography. This skill is the end-to-end procedure for a clean, correct PR.

**Scope a PR by risk, not by component.** Bundle the *low-risk* cosmetic changes —
semantic color swaps and MUI `Typography` text swaps — for a **whole view/screen** into
one PR; splitting those into per-component PRs just multiplies manual-QA and review cycles
for no benefit. **Isolate *high-risk* changes** — component/DOM swaps that change structure
or behavior, and state/logic refactors (anything that needs functional re-testing) — into
their own PR(s). A single rebrand ticket may name one component, but if sibling components
in the same view need the same low-risk treatment, fold them in (note it in the PR) rather
than opening a fragment per file.

**Read first:** the `design-system` skill (MUI-vs-DSCO rules, `MIGRATION_STATUS.md`) and
every `README.md` from the repo root down to the target file's directory.

## The loop (in order)

1. Identify the component file(s) from the ticket; read them.
2. Read the README hierarchy + the `design-system` skill.
3. Make the swap as **minimal, surgical edits** (see Diff discipline).
4. Verify code: from `apps/`, `yarn run typecheck` and `./tools/hooks/pre-commit`
   (lints only changed files). Both must be clean.
5. Render it; inspect computed styles and states — **don't eyeball** (see Rendering & QA).
6. Branch off `staging`, commit (Co-Authored-By trailer), push, open a **draft** PR with
   the template below. Never merge; never force-push unless asked.

## Diff discipline (this is graded)

- Edit surgically; **never rewrite a whole file**. The diff must show only the semantic
  change (legacy → DS), nothing else.
- Preserve byte-for-byte what isn't changing: variable names, values, selectors, order.
  If `margin: 0 0 10px 0` still expresses the intent, keep it — don't recast it as
  `margin-bottom: 10px`.
- **No narrating comments.** Comment only genuinely non-obvious constraints (a DS
  component's layout quirk). Never narrate preserved behavior.
- Some structural change is unavoidable when the DS component's DOM differs from the
  legacy one. That's fine — **call it out in the PR**, don't hide it behind a fake-minimal
  diff.
- **ASCII-only in code and comments.** The `deprecated_code.rb` pre-commit hook reads
  changed files as US-ASCII and *errors* (not warns) on non-ASCII bytes — em-dashes, smart
  quotes, unicode. Use plain hyphens and straight quotes, or lint fails.

## Component mapping (MUI vs DSCO)

- **You're migrating away from non-design-system components**, not just
  `apps/src/legacySharedComponents/` and `apps/src/sharedComponents/`. Prefer a DS component;
  only keep a custom or legacy element when no DS equivalent exists.
- **`CdoTheme` is applied app-level via `<ThemeProvider>` — don't wrap components yourself.**
  But MUI only renders *styled* under it, so on an older/standalone surface, confirm it's
  inside the provider before trusting a swap's appearance.
- **MUI** (`@mui/material`): Typography, Button, IconButton, Breadcrumbs. DSCO equivalents
  are deprecated — use MUI. Convention: alias on import, e.g.
  `import {IconButton as MuiIconButton} from '@mui/material'`.
- **DSCO** (`@code-dot-org/component-library/<name>`): everything else —
  `dropdown/simpleDropdown`, `dialog`, `segmentedButtons`, `tabs`, `textField`, `checkbox`,
  `slider`, `tooltip`, etc. Check `frontend/packages/component-library/MIGRATION_STATUS.md`
  when unsure.
- **No DSCO Card and no DSCO Table exist.** Need a table → MUI `Table` directly. Need a card
  → keep a styled `<div>` (typography + colors only) and flag to design.
- Icon-only legacy buttons → MUI `IconButton` with `<FontAwesomeV6Icon iconName="..." />`
  inside (NOT MUI `Button`). Legacy FA class `fa-solid fa-play-pause` → `iconName="play-pause"`.
- **Before swapping a DSCO component, read its `README.md` + `.module.scss` + Storybook story.**
  Each has its own sizing/layout assumptions. Known `SimpleDropdown` gotchas:
  - Its container is `inline-flex` and the inner arrow-div is content-width unless
    `styleAsFormField` is set. To fill a row: `.yourClass { flex: 1; > div { width: 100%; } }`.
  - `size` bundles control-height AND label/text size (e.g. `size="s"` → 32px control,
    12px label). `dropdownTextThickness="thin"` = regular-weight value text; default
    `"thick"` = bold.
- **If no existing MUI/DSCO variant, color, or size fits, stop — that's *extending* the DS,
  not using it.** Flag it to design (like the no-Card/no-Table case); don't roll your own
  theme augmentation. (Adding variants means editing the DS theme + syncing type
  augmentations, coordinated with the design team — out of scope for a consumer rebrand PR.)
- Reference: the deployed DSCO Storybook (`yarn storybook` locally, or the team's hosted
  build) for DSCO props/states; MUI docs (mui.com) for MUI components.

## Styling

- **All component styling goes in a `.module.scss`** (locally scoped CSS module). Migrating
  often means moving styling *out of* inline `style={}`, Radium, or a global stylesheet
  *into* a `.module.scss`. Never add new inline or global styles.
- **Module *files* yes; SCSS *features* no.** Use `.module.scss` for scoping, but write plain
  CSS inside: semantic `var(--*)` for color/theming, literals for one-off values. Don't add
  `$vars`, and inline any single-use `$var` you find (deprecating SCSS is preferred).
- **Never rely on stylesheet load order for specificity.** Override a DS component's internal
  styles via its class selector from your module (e.g. `.yourClass > div { ... }`).

## Colors: legacy → semantic

Replace legacy colors (`@cdo/apps/util/color`, `shared/css/color.scss`, inline hex, and any
`@import "color"`) with semantic CSS vars from
`frontend/packages/component-library-styles/colors.css`:
`var(--text-...)`, `var(--background-...)`, `var(--borders-...)`, `var(--icon-...)`.

**Do not guess a mapping. Verify the old value by hex first:**
1. Legacy value: `grep <name> apps/src/util/color.js` or `shared/css/color.scss` → `#hex`.
2. Primitive with that hex: `grep -i <hex> frontend/packages/component-library-styles/primitiveColors.css` → `--brand-<x>-NN`.
3. Semantic token referencing that primitive:
   `grep "var(--brand-<x>-NN)" frontend/packages/component-library-styles/colors.css` →
   the token to use. Match the family to usage: `--background-*` for fills, `--borders-*`
   for borders, `--text-*` for text.

**Map by the element's role, never by hex alone — and never use sentiment tokens for
actions.** The sentiment families (`--*-info-*`, `--*-error-*`, `--*-success-*`,
`--*-warning-*`) are reserved for status/feedback. An action or brand accent (a button,
link, the "+" tile) maps to a **brand** family (teal/purple) even when a sentiment token is
a closer hex match — e.g. polar-blue `#0094ca` is near `info-*` blue but must map to brand
teal. A genuine validation/status color (an invalid-input background) *does* map to
`--*-error-*`; that's the distinction — role, not hue.

Exact old hex to new semantic token is nice, not required. Some legacy colors have no exact
semantic match; moving a non-DSCO color to the closest semantically correct design-system
color is expected.

**Priority when no exact semantic token matches the hex:** closest semantic token by use and
intent → primitive (`--brand-*` from `primitiveColors.css`) → raw value (last resort). Never
leave a raw hex if a token fits. If the closest semantic token changes the rendered color in
a visible way, call that out in the PR testing story.

Verified anchor — **code.org's old primary is TEAL, not purple** (the name `light_primary`
is misleading; always verify):

| Legacy | hex | primitive | semantic token |
|---|---|---|---|
| `$light_primary_500` | `#0093A4` | `--brand-teal-50` | `--borders-brand-teal-primary` (border, exact) / `--background-brand-teal-primary` (bg, teal-60) |
| `$light_primary_700` | `#007785` | `--brand-teal-70` | `--background-brand-teal-strong` / `--borders-brand-teal-strong` |
| `$neutral_white` (on color) | `#ffffff` | — | `--text-neutral-white-fixed` |
| (purple-50) | `#9657c7` | `--brand-purple-50` | `--background-brand-purple-primary` |

**Theme caveat:** `colors.css` has multiple `data-theme` blocks. Some intentionally render
brand tokens as hot pink `#ff69b4` — that is the **designer's "what is still semantic"
visualization** ahead of the rebrand, NOT a missing-token bug. The default/light block has
the real values. Confirm your token resolves to a real value in the theme the surface uses.

## Typography: legacy → MUI

- Replace raw `<h1>/<h2>/<p>/<span>/<b>` text and `@cdo/apps/fontConstants` styling with
  MUI `<Typography>`.
- DSCO components render their own label/value typography via their `size` prop — you
  usually do NOT wrap their internal text.
- **`<Typography>` carries its own color.** CdoTheme's `MuiTypography` root sets
  `color: var(--text-neutral-primary)`, which **beats a color inherited from a parent**. So
  swapping a `<div>`/`<span>` that relied on inherited text color (e.g. white on a colored
  box) for `<Typography>` will silently flip the text to the theme default — set the color
  **on the Typography element itself** (its `style`/className or a CSS-module class), not the
  parent. Always re-check the computed `color` after a `div`→`Typography` swap.
- Type scale: `frontend/packages/component-library-styles/typography.module.scss` —
  `heading-xxl`(3rem) … `heading-xs`(1rem), `body-one`…`body-four`, `label-*`, `overline-*`.
  For MUI `<Typography variant="...">`, **confirm the exact variant name** in the theme's
  typography overrides (`frontend/packages/component-library/src/themes/code.org/`) before
  using — do not guess the variant name.

## Spacing & sizing

There is **no spacing-scale token set in code** — only `$form-field-width` (18.75rem) and
`$regular-border-radius` (0.25rem) in `component-library-styles/variables.scss`. So **do not
"tokenize" spacing — preserve the original raw rem/px values.** Standardize border-radius to
`$regular-border-radius` only where the original already used a ~4px radius. (Plain-CSS /
no-`$vars` guidance lives in the Styling section above.)

## Rendering & QA (verify, don't eyeball)

- Run `apps` (`yarn start`, HMR) + dashboard, `use_my_apps: true`. After an edit, wait
  ~15-20s for webpack to recompile before reloading.
- Find a **deterministic URL** that renders the component without login/state. For labs, a
  script-level level URL is often easiest, but project pages are fine when they render the
  target component reliably.
  **Dance example:** `/courses/dance-2019/units/1/lessons/1/levels/1?songfilter=on`
  (`?songfilter=on` skips the age-gate modal).
- For a **whole-lab pink-test pass**, load the lab with `?brand=codeai-next` and use that
  visual audit to sweep every reachable lab-owned surface, not just the component named in
  the ticket. Check Code, authoring tabs, side panels, popovers/tooltips, overlays, empty
  states, embedded same-origin iframes, and lab shell backgrounds. If local DCDO does not
  apply the URL param, set `document.documentElement.dataset.brand = 'codeai-next'` and
  `document.documentElement.dt as out of scope unless the ticket says otherwise: stage canvas pixels,
  Blockly block colors, Piskel checkerboards/artwork/swatches, media thumbnails, and global
  site/project header chrome should not be recolored just to make the page pink.
- Local `?brand=codeai-next` needs the brand router enabled. In `dashboard/`, run
  `bin/dashboard-console`, then `DCDO.set('brand-router-enabled', true)`. Without this,
  the URL param may silently fail and the pink-test pass is not testing what it claims.
- **Inspect, don't eyeball:** read computed styles (`getComputedStyle`) and bounding boxes,
  open dropdowns, exercise states. A screenshot is not verification.
- **Confirm the state you changed is reachable on each surface you claim.** A component
  shared by two labs does not mean a given *state* shows in both — e.g. the AnimationTab
  empty-state renders only in Game Lab (Sprite Lab seeds default sprites, so it's hidden).
  Don't write "test in both labs" for a state one surface can't reach; say where it's
  observable, and QA it there.
- **Contrast: compute it (WCAG AA = 4.5:1 normal text, 3:1 large/icon) — but a passing ratio
  is not "good."** Dark text on a *mid*-tone surface can clear AA yet read muddy. When a combo
  is marginal or the legacy combo already failed, give design the **lighter** option too
  (light surface + secondary/dark text), not just "darken the text," with the measured ratio
  for each, and let them choose.
- **Known port-9000 gotchas (not your bug):**
  - `error saving thumbnail image` / `Cannot PUT /v3/files/.../.metadata/thumbnail.png` on
    **Run** is a long-standing dev-server proxy gap — the thumbnail metadata PUT isn't routed
    on :9000 (works on :3000). Harmless to UI testing; ignore it, or use `localhost:3000`
    (no HMR, `yarn build` to see changes) if you need the save path.
  - This is a different failure from the AWS `ExpiredTokenException` 500 on `/projects/.../edit`
    (that one is the replay-video presigned URL). Don't conflate them.
- Check widths (e.g. 1568 / 1280 / 1024 / 768). Many labs have a fixed min width and
  h-scroll below it (pre-existing — note it, don't "fix" it).
- Env knobs you may need: a DCDO flag via the dev cookie
  (`document.cookie = 'DCDO=' + encodeURIComponent(JSON.stringify({flag:false})) + ';path=/'`)
  or persistently via `bin/dashboard-console` → `DCDO.set('flag', false)`.

## PR

- Branch off `staging`. Open as **draft**. Follow `.github/pull_request_template.md`; delete
  the Deployment/Privacy sections if N/A.
- **Testing story: write it TO the human reviewer, conversationally**, not as a clinical
  spec. They execute it by hand, so address them directly and use markdown checkboxes.
  **Always lead with a screenshots placeholder** — the human drags screenshots into the
  PR after opening it, so the skill's job is to leave a clearly-labeled hole at the top,
  not to bury "_TODO: attach_" at the bottom. Shape it like this:

  ```
  ## Testing story
  Hey, human! Add screenshots here.

  **Before screenshot**

  **After screenshot**

  Then, make sure you manually test the following:
  - [ ] <functional check>
  - [ ] <visual check, comparing against prod>
  - [ ] <screen-sizes check>
  - [ ] Try all of the above on Firefox and Safari.
  - [ ] <keyboard nav check>
  - [ ] <screen-reader check>
  - [ ] <RTL check>

  Make sure you ask @<designer>:
  - [ ] <the design judgment call, framed as a real choice>
  ```

  No separate trailing "Screenshots" section — the placeholder at the top is the only one.
  If compare URLs are useful, put them inline between the screenshot block and the test
  checklist; localhost needs this branch + `use_my_apps`.
- **Don't manufacture design questions.** A faithful mapping is mechanical and correct; it
  needs NO sign-off. "Faithful" includes the same color/size preserved via the canonical
  semantic token, or a minor tint move from a non-DSCO color to the closest semantically
  correct DS token. Only add an **"ask @<designer>"** item for a genuine judgment call: the
  migration changes appearance in a material way, the right token is truly ambiguous, or
  there's no DS equivalent (e.g. Card/Table). When you do ask, frame it as a real decision
  and name only tokens that are actually in the diff. If a migration is fully faithful, the
  ask section is empty — that's the expected, good case.
- **Accessibility is always a legitimate question.** A pre-existing contrast/a11y failure
  that a faithful migration would *perpetuate* is worth raising — flag it with measured
  ratios and 1-2 concrete token options. That is not "manufacturing" a question. (Watch for
  the reverse too: passing a ratio is not design approval — see the contrast note in
  Rendering & QA.)

## Self-check before reporting done

- [ ] Diff shows only the semantic change; no file rewrite, no narrating comments.
- [ ] `yarn run typecheck` + `./tools/hooks/pre-commit` clean.
- [ ] Every old color value checked by hex; replacement is the closest semantic DS token,
      exact match when available; token defined in the target theme.
- [ ] Rendered and inspected via computed styles, not just screenshotted.
- [ ] PR is a draft, follows the template, has compare links + bucketed QA checklist.
.
