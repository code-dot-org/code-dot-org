// The flat background colour a character set is drawn on and keyed against.
//
// A single sprite lets the model pick its own contrasting background and
// keys it out by flood-filling from the corners, which works well for one
// picture. A set is two dozen pictures that must key identically, and the
// corner flood has three failure modes across that many: the model's pick
// lands near the character's own colours and the matte hollows it out; an
// enclosed gap (between legs, under an arm) is never reached; and a pose
// that touches a corner gets the character sampled as the background. So a
// set names its colour up front and keys every pixel near it, wherever it
// is. Two candidates, far apart in hue; the prompt decides which one the
// character is less likely to wear.

export interface KeyColor {
  /** The name the prompt uses. */
  name: string;
  hex: string;
  rgb: [number, number, number];
}

export const KEY_COLORS: Record<'magenta' | 'green', KeyColor> = {
  magenta: {name: 'pure magenta', hex: '#FF00FF', rgb: [255, 0, 255]},
  green: {name: 'pure bright green', hex: '#00FF00', rgb: [0, 255, 0]},
};

// Words that suggest the character itself is pink-to-purple, so magenta
// would be a bad key; and words that suggest green.
const MAGENTA_WORDS =
  /\b(pink|magenta|fuchsia|purple|violet|lavender|lilac|orchid|rose|mauve|plum|unicorn|flamingo|princess|fairy|axolotl|jellyfish|blossom|cherry)\b/gi;
const GREEN_WORDS =
  /\b(green|frog|toad|lizard|turtle|tortoise|dragon|dinosaur|dino|crocodile|alligator|snake|zombie|alien|goblin|orc|ogre|troll|cactus|leaf|leaves|grass|emerald|jade|lime|olive|mint|slime|creeper|plant|tree|broccoli|peas?|caterpillar|grasshopper|chameleon|iguana|gecko|hulk|shrek|elf|elves|pickle|kiwi|moss|swamp|forest)\b/gi;

/**
 * The key colour least likely to appear on the character the prompt
 * describes: whichever candidate the prompt mentions fewer of; magenta when
 * it is a tie (including no mention of either).
 */
export function chooseKeyColor(prompt: string): KeyColor {
  const magentaHits = (prompt.match(MAGENTA_WORDS) || []).length;
  const greenHits = (prompt.match(GREEN_WORDS) || []).length;
  return magentaHits > greenHits ? KEY_COLORS.green : KEY_COLORS.magenta;
}
