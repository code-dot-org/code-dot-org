// The Main Screen's background, as the screen's own calls.
//
// A screen is flat: one background, behind its placements, and no layers
// (specs/ONE_WORLD_PLAN.md). Its data says the picture, whether it tiles and
// where it sits, and the generator says them as `setScreenBackground` and its
// two companions. The World's layers are its map's.

/** The screen's background, as its data states it. */
export interface ScreenBackground {
  sprite?: unknown;
  repeat?: unknown;
  offset?: {x?: unknown; y?: unknown};
}

/** The background a screen's data states, or none. */
export function screenBackgroundOf(
  contents: string,
): ScreenBackground | undefined {
  try {
    const {background} = JSON.parse(contents) as {background?: unknown};
    return background && typeof background === 'object'
      ? (background as ScreenBackground)
      : undefined;
  } catch {
    return undefined;
  }
}

const num = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

/** The calls that give the screen its background, or nothing to say. */
export function screenBackgroundCalls(
  background: ScreenBackground | undefined,
): string {
  if (!background) {
    return '';
  }
  let code = '';
  if (typeof background.sprite === 'string' && background.sprite) {
    code += `world.setScreenBackground(${JSON.stringify(background.sprite)});\n`;
  }
  if (background.repeat === true) {
    code += 'world.setScreenBackgroundRepeat(true);\n';
  }
  const x = num(background.offset?.x);
  const y = num(background.offset?.y);
  if (x !== 0 || y !== 0) {
    code += `world.setScreenBackgroundOffset(new WorldLab.Vector(${x}, ${y}));\n`;
  }
  return code;
}
