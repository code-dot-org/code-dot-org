# Divider Migration: DSCO to MUI

## Summary

Divider moves to `Divider` from `@mui/material`, theme-only, like Typography,
Breadcrumbs and Tooltip: no wrapper. CdoTheme's `MuiDivider` entry
(`themes/code.org/styleOverrides/divider.ts`) sets the border color to
`--background-neutral-quaternary`, the legacy `primary` color, and nothing
else. The legacy `Divider` stays exported, `@deprecated`, until its consumers
have moved; step 4 deletes it.

Tracked in RE-227 (steps 1 to 3) and RE-228 (step 4).

## Approach

The first version of this migration shipped a wrapper, `MuiDivider`, that kept
the legacy `color` and `margin` props, so that no `@mui/material` divider
already in apps would change. It was replaced before merge: neither consumer
passes `color` or `margin`, so the wrapper preserved an API nobody calls,
while the theme-only shape is what `MIGRATION_STATUS.md` defines as Migrated.

Plain MUI `Divider` needs the color override. MUI's default border color is
`palette.divider`, a 12% black that nearly vanishes on the Dark surfaces Lab2
renders, where the quiz uses its divider.

The override sets only the border color, on the `<hr>` and on the
`::before`/`::after` lines a labelled divider draws. Margins, width and
`flex-shrink` stay MUI's, so vertical and `flexItem` dividers lay out as
before. MUI's deprecated `light` prop no longer lightens the line.

## Prop map

| Legacy                                        | MUI                                                      |
| --------------------------------------------- | -------------------------------------------------------- |
| `color="primary"`                             | the theme default                                        |
| `color="strong"`                              | `sx={{borderColor: 'var(--background-neutral-senary)'}}` |
| `margin="none"`                               | MUI's default (`margin: 0`)                              |
| `margin="xs"`–`l`                             | `sx={{my: 1}}`, `2`, `4`, `8`                            |
| `className`, `style`, other `<hr>` attributes | passed through unchanged                                 |

No consumer passes `color` or `margin`.

## Behavior differences

- The `<hr>` gains MUI's classes (`MuiDivider-root`, `MuiDivider-fullWidth`
  and a generated `css-…` class that holds MUI's styles) and loses the
  legacy module classes.
- Legacy drew a top border; MUI draws a bottom border on a zero-height box,
  so the 1px line lands on the same pixel row.
- Legacy set `width: 100%` and `margin-inline: auto` and left `flex-shrink`
  at its default of 1. MUI sets `margin: 0` and `flex-shrink: 0` and leaves
  width `auto`. Where that differs:
  - A divider in a flex row with no `flex` of its own collapses to zero
    width. PageDivider gives its rules `flex: 1 0 0`, so it is unaffected.
  - A divider after a float, with no `clear`, now sits beside the float
    instead of dropping below it. The consumer PR gives Markdown's `hr`
    `width: 100%` to keep the legacy behavior for curriculum text beside
    floated images.
  - A divider narrowed by an inline `width` sits at the inline-start edge
    instead of centering. No curriculum `<hr>` in `dashboard/config` sets a
    narrower width; inline `width`, `margin` and `border` override both
    implementations alike.
- Every existing `@mui/material` divider in apps takes the new color unless
  its own CSS sets one with more specificity. AI Lab's dataset picker does
  (two classes). The workshop dashboard pages, the AI diff chat header and
  the add-resource dialog set none, and change from MUI's 12% black to
  `--background-neutral-quaternary`. Sketch Lab's toolbar and canvas controls
  set one with a single class. MUI's own styles also sit on a single class,
  and in apps they usually load later and win, so these likely change too.
- The marketing sites are unaffected: `code-dot-org/marketing-sites` builds
  its own themes and carries its own copy of this package.

## Consumers

| File                                                     | Change |
| -------------------------------------------------------- | ------ |
| `apps/src/quiz/attempt/PageDivider.tsx`                  | import |
| `frontend/packages/markdown/src/components/Markdown.tsx` | import |

The consumer PR also bans `@code-dot-org/component-library/divider` in
`apps/.eslintrc.js`.

## Parity

- Storybook: the MUI stories under DesignSystem / Divider / MuiDivider assert
  the token color in their play functions.
- Apps: the Quiz Lab results page
  (`/s/allthethings/lessons/52/levels/11`), captured before and after at
  1280px and 400px. See the consumer PR.

## Shared globals

None. MUI `Divider` has no focus, keys, portal or scroll lock.

## Deferred changes

None. MUI `Divider` has no behavior of its own to hold off, so there is no
step 5.

| Behavior | Legacy today | With MUI | UI tests at risk | After | Moves DOM | Ticket |
| -------- | ------------ | -------- | ---------------- | ----- | --------- | ------ |

## Story gaps

None. The MUI stories cover the states the legacy stories lacked: a divider
between two labels in a flex row, a labelled divider, one narrowed by an
inline `width`, and a vertical one.

## Risks

- The recolor of the existing `@mui/material` dividers listed above is
  visible, though slight in Light.
- Sketch Lab's toolbar and canvas-control dividers likely take the new
  color (see Behavior differences); not checked in a browser.
