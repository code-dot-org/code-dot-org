// The stock themes: what a control looks like, as a file rather than as code.
//
// A `.style` file holds TOKENS — named values — and STYLES, which are named
// bundles that refer to them. A drawing says `use style ⟨button face⟩` and a
// world says `use theme ⟨styles/modern⟩`, so the drawings name roles and one
// row decides what a role means (specs/STYLES_PLAN.md).
//
// TWO OF THEM, because one theme proves nothing. The whole claim is that a
// bordered Classic and a shadowed borderless Modern come out of the SAME
// drawings, and the only way to know that is true is to have both.
//
// EVERY THEME DEFINES EVERY ROLE. A drawing naming a style its theme lacks
// leaves the pen as it was (`CommandPen.useStyle`) — visible and wrong rather
// than absent, which is the right failure but still a failure. `stockStyles`
// is pinned to the list below by a test so a new role cannot be added to one
// theme and forgotten in the other.

import {classicStyle} from './classic';
import {modernStyle} from './modern';

export interface StockStyle {
  /** File stem this is imported as — `modern` becomes `styles/modern.style`. */
  id: string;
  name: string;
  /** One line on what it is, for a menu. */
  description: string;
  /** The `.style` JSON, copied verbatim on import. */
  contents: string;
}

/**
 * The roles a theme must name, which is the vocabulary the kit draws with.
 *
 * Read as a table: a surface is a sheet things sit ON, a well is a recess
 * things sit IN, a field is a well you may put a caret in, and an accent is
 * the one colour that means "this is the thing to press".
 */
export const STYLE_ROLES = [
  'surface',
  'surface edge',
  'well',
  'floating',
  'field',
  'button face',
  'button caption',
  'menu',
  'chosen row',
  'pointed row',
  'bar',
  'bar track',
  'knob',
  'switch on',
  'switch off',
  'focus ring',
  'wrong edge',
  'hint',
] as const;

export const STOCK_STYLES: readonly StockStyle[] = [
  {
    id: 'modern',
    name: 'Modern',
    description:
      'Rounded corners, no borders, and a shadow under anything raised — the look a phone app has. The default the kit is drawn at.',
    contents: modernStyle,
  },
  {
    id: 'classic',
    name: 'Classic',
    description:
      'Square corners and a visible border on everything, with no shadows. The same controls, drawn the way a desktop program drew them.',
    contents: classicStyle,
  },
];
