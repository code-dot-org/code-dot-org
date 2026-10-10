// The flat background colour a generated picture is drawn on. Every prompt
// names it, so the keyer can clear it wherever it is, enclosed gaps
// included. Two candidates, far apart in hue; the prompt decides which one
// the subject is less likely to wear.

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
  /\b(green|frog|toad|lizard|turtle|tortoise|dragon|dinosaur|dino|crocodile|alligator|snake|zombie|alien|goblin|orc|ogre|troll|cactus|leaf|leaves|grass|emerald|jade|lime|olive|mint|slime|plant|tree|broccoli|peas?|caterpillar|grasshopper|chameleon|iguana|gecko|elf|elves|pickle|kiwi|moss|swamp|forest)\b/gi;

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

/**
 * The prompt clause asking for the key colour as the whole background and
 * nowhere on the subject, which the prompt calls `subject` ("character",
 * "subject", "artwork").
 */
export function keyClause(key: KeyColor, subject: string = 'character') {
  const wear =
    subject === 'character'
      ? ' — not on clothes, hat, hair, skin or accessories; choose other colors for those'
      : '; choose other colors';
  return `Use a plain, solid, flat background of exactly one color, ${key.name} (${key.hex}), filling the image to every edge — no gradient, no scenery, no ground, no sky, and no shadow under the ${subject}. Only the ${subject} on that flat ${key.name}. The ${subject} itself must contain no ${key.name} or anything close to it anywhere${wear}.`;
}
