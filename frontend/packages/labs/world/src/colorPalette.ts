// The colors a learner is offered by name.
//
// A picker that shows the whole spectrum can say any color, which is what makes
// it worth having and also what makes it the wrong thing to open with: "pick a
// color" answered by a rectangle of every color asks a beginner to have an
// opinion before they have a reason. A short row of colors that already have
// names asks nothing — you want the red one — and the spectrum is still there
// underneath for the moment somebody wants a particular blue.
//
// SIXTEEN, and not the seventy Blockly's own `colour_picker` grid shows. Seventy
// is the overwhelming thing, and at swatch size half of them are the same color
// twice. These are one of each thing you would name, plus the four the lab
// already uses, so a project can be matched to the rules it took: `#e0484a` is
// what a switch and a wall are (`rules/switches`), `#4da3ff` is a teleport pad,
// `#9657c7` is the lab's own purple, and `#101020` is the backdrop a new world
// starts on (`DEFAULT_BACKDROP_COLOR`).
//
// Names are not decoration: they are the swatch's tooltip and its accessible
// label, and a grid of unlabeled squares is unusable without a pointer.

/** One offered color: what it is, and what it is called. */
export interface Swatch {
  readonly hex: string;
  readonly name: string;
}

/**
 * The offered colors, in reading order — the neutrals first, then the hues
 * around the wheel. Drawn eight to a row, which is what makes it two rows.
 */
export const COLOR_SWATCHES: readonly Swatch[] = [
  {hex: '#000000', name: 'black'},
  {hex: '#4d4d4d', name: 'dark gray'},
  {hex: '#9e9e9e', name: 'gray'},
  {hex: '#ffffff', name: 'white'},
  {hex: '#e0484a', name: 'red'},
  {hex: '#ff8a3d', name: 'orange'},
  {hex: '#ffd23f', name: 'yellow'},
  {hex: '#8a5a3b', name: 'brown'},
  {hex: '#7ac74f', name: 'green'},
  {hex: '#2e9e5b', name: 'dark green'},
  {hex: '#3ecfcf', name: 'teal'},
  {hex: '#4da3ff', name: 'blue'},
  {hex: '#2b5fd9', name: 'dark blue'},
  {hex: '#9657c7', name: 'purple'},
  {hex: '#ff7ac0', name: 'pink'},
  {hex: '#101020', name: 'midnight'},
];

/** How many fit on a row, and so how wide a grid of them is. */
export const SWATCHES_PER_ROW = 8;

/** What a color is called, when it is one of these. */
export const swatchName = (hex: string): string | undefined =>
  COLOR_SWATCHES.find(swatch => swatch.hex === hex.toLowerCase())?.name;
