# design-system-storybook

Storybook for the `@code-dot-org/component-library` design system.

- `yarn storybook` / `yarn dev` — dev server on :6006
- `yarn build` — static build under `dist/`
- `yarn test` — Vitest (browser) story tests

## Brand switcher

The toolbar has a **Brand** dropdown (paintbrush icon) for previewing any
story under each brand in the rebrand. Selecting a brand drives
`decorators/BrandDecorator.tsx`, which:

- writes `data-brand="<code>"` onto the preview `<html>`, switching the CSS
  token set defined in
  `@code-dot-org/component-library-styles/brandOverrides.css`, and
- applies the matching MUI theme, so palette-driven MUI components follow.

This mirrors production, where `data-brand` is set server-side on `<html>` by
`Cdo::Brand` (see `lib/cdo/brand.rb`). The brand codes:

| Code           | Toolbar label         | Tokens                                                 |
| -------------- | --------------------- | ------------------------------------------------------ |
| `code`         | code.org              | legacy `:root` ramp (== `codeai`)                      |
| `codeai`       | CodeAI                | legacy `:root` ramp                                    |
| `codeai-next`  | CodeAI · CADS         | CADS ramp (`[data-brand='codeai-next']`) — **default** |
| `codeai-audit` | CodeAI · Audit (pink) | all-pink audit (`[data-brand='codeai-audit']`)         |

The default is `codeai-next`, matching the production `default-brand` DCDO key.
`code` and `codeai` render identically until the brand cutover.
