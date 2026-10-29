// A game's name and its properties, as the map editor's inspector shows them
// with nothing selected (specs/MAIN_MAP_PLAN.md, "the world's properties on
// empty selection"). The Main Screen reads and writes them
// (`screenProperties`).

export interface WorldProperty {
  /** As the row names it: `score`, `lives`. */
  name: string;
  /** The row's TYPE: `number`, `boolean`, `string`, `vector`, … */
  type: string;
  /**
   * The row's DEFAULT as stored — a string, whatever the type. A vector or a
   * point is two numbers with a comma between, `"0,1"` (`vectorText`), so a
   * value can be compared to a rule's own as text like every other.
   */
  value: string;
  /**
   * The block that sets it, for a RULE's world-scoped property —
   * `world_set_Scoring_TargetScoreProperty`. Absent for the world's own,
   * which carry their starting value as a DEFAULT field instead.
   */
  setter?: string;
  /** Which rule it came from, which is the group the inspector lists it under. */
  rule?: string;
}

/**
 * A rule's world-scoped property, as the caller describes one.
 *
 * Handed in rather than looked up: what a project holds and what each
 * property's default is are the map editor's to know
 * (`blockly/projectModules`, specs/WORLD_RULE_FIELDS_PLAN.md).
 */
export interface WorldRuleProperty {
  /** The setter's block type. */
  setter: string;
  name: string;
  type: string;
  rule: string;
  /** The rule's own starting value, shown when the world says nothing. */
  default: string;
}

export interface WorldHeader {
  name: string;
  properties: WorldProperty[];
  /** The color behind the background image. */
  backgroundColor?: BackgroundColor;
  /** The theme the game is painted in, or nothing. */
  theme?: string;
  /** The map the World starts with, by path, or nothing. */
  worldMap?: string;
}

/**
 * The game's background color.
 *
 * `color` is the `#rrggbb` a swatch holds, or nothing when none is set — the
 * engine's own then (`DEFAULT_BACKDROP_COLOR`). `inCode` says it is set to
 * something a field cannot show, a blend or an `r g b a`, which a field would
 * throw away by writing over it.
 */
export interface BackgroundColor {
  color: string | undefined;
  inCode: boolean;
}

/** A vector or point, as the text a `WorldProperty` carries it in. */
export const vectorText = (value: {x: number; y: number}): string =>
  `${value.x},${value.y}`;

/** The vector `vectorText` wrote, or nothing for text that is not one. */
export const parseVectorText = (
  text: string,
): {x: number; y: number} | undefined => {
  const parts = text.split(',');
  if (parts.length !== 2) {
    return undefined;
  }
  const [x, y] = parts.map(part => Number(part.trim()));
  return Number.isFinite(x) && Number.isFinite(y) ? {x, y} : undefined;
};
