# `componentLibrary/chips`

A group of checkboxes, each drawn as a chip. [MuiChips](MuiChips.tsx) is the
MUI version of the deprecated DSCO [Chips](Chips.tsx). It takes the same
props, so moving a call site over changes only its import.

```javascript
import {MuiChips} from '@code-dot-org/component-library/chips';
```

To move a legacy call site, use the
[codemod](../../codemods/README.md#chips-to-mui-chipsts). The plan, its
deferred changes and its deviations are in
[CHIPS_MIGRATION_TO_MUI.md](CHIPS_MIGRATION_TO_MUI.md).

## Form contract

Each chip is a real `<input type="checkbox">` inside a `<label>`. The input
is named `<name>[]` and its value is the option's `value`, so a host form
posts `name[]=value` for every checked chip and Rails reads an array. The
root `div` carries `data-testid="chips-<name>"`.

The component is controlled: `values` lists the checked values, and
`setValues` receives the next list. Checking a chip appends its value;
unchecking removes it.

With `required`, every input is `required` until one is checked, so the
browser blocks an empty submit and shows `requiredMessageText` in its
validation bubble on the first chip. Pass a localized message; without one
the component warns in the console and falls back to the English "Please
choose at least one option".

`label` renders a heading above the chips and names the group: the
`fieldset` points at it through `aria-labelledby`.

## Why the MUI `Chip` is never clickable

Each chip is an MUI `Chip` with `component="label"` and no `onClick`,
`clickable`, `onDelete` or `disabled`. Any of those would make the root an
MUI `ButtonBase`, with `role="button"` and a second Tab stop beside the
checkbox, or would apply MUI's disabled opacity and drop the `not-allowed`
cursor. The native checkbox stays the only control: Tab moves from chip to
chip, Space toggles, and the focus ring is drawn on the chip.

## Props

| Prop                  | Values                      | Default   | Effect                                                                    |
| --------------------- | --------------------------- | --------- | ------------------------------------------------------------------------- |
| `name`                | string                      |           | Input name `<name>[]`; `data-testid="chips-<name>"` on the root           |
| `options`             | `{value, label}[]`          |           | One chip per option, in order                                             |
| `values`              | string[]                    |           | Checked values                                                            |
| `setValues`           | `(values) => void`          |           | Called with the next `values`                                             |
| `label`               | string                      | none      | Group heading and accessible name                                         |
| `required`            | boolean                     | `false`   | Blocks an empty submit                                                    |
| `requiredMessageText` | string                      | English   | Validation message for `required`                                         |
| `disabled`            | boolean                     | `false`   | Disables every checkbox                                                   |
| `size`                | `'xs'`, `'s'`, `'m'`, `'l'` | `'m'`     | Chip padding and text size, and heading size                              |
| `color`               | `'black'`, `'gray'`         | `'black'` | Unchecked border: `--borders-neutral-solid` or `--borders-neutral-strong` |
| `textThickness`       | `'thick'`, `'thin'`         | `'thin'`  | Chip text weight: button (semi-bold) or body (regular)                    |
| `className`           | string                      | none      | Added to the root `div`                                                   |

Checked chips fill with the brand teal (CADS selected tokens under
`[data-brand='codeai-next']`). The thin text style carries a 1em bottom
margin (0.5rem for thick) from the type mixins; cancel it from a parent class
when chips sit in a tight layout.

## Prop map: `Chips` to `MuiChips`

Every prop keeps its name and value. What changes under it:

| `Chips`                 | `MuiChips`                                                                       |
| ----------------------- | -------------------------------------------------------------------------------- |
| chip `<label>`          | MUI `Chip` root (`component="label"`, `variant="outlined"`), same local classes  |
| input directly in label | Input inside `span.MuiChip-label`                                                |
| `div.chipsContainer`    | MUI `FormGroup row` with the same class                                          |
| heading `<label>`       | Same element, plus an id; the `fieldset` gains `aria-labelledby`                 |
| `white-space: nowrap`   | A chip wider than its row wraps instead of overflowing                           |
| `size`, `color`         | Module classes on the root; MUI `Chip` `size` and `color` stay at their defaults |
| `disabled`              | On the inputs only; the MUI `Chip` never gets `disabled`                         |
| display name `Chips`    | `MuiChips`: Enzyme `find('Chips')` matches nothing; pass the component instead   |

For live examples, see DesignSystem / Chips / MuiChips in Storybook.

## Deprecated: `Chips`

```javascript
import {Chips} from '@code-dot-org/component-library/chips';
// OR
import Chips from '@code-dot-org/component-library/chips';
```

Same props and behavior as above, without the group name and with
`nowrap` chips. Do not add new call sites; run `yarn codemod:chips` on
existing ones. These names resolve until the legacy source is deleted, at
which point they re-export `MuiChips`.
