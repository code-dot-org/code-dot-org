// What stands for a hand, in a recording nobody is touching.
//
// The input rules are about a player DOING something, and a strip of an actor
// moving with no cause shown demonstrates the effect while hiding the reason
// — which is worse than no demo, because it reads as the rule acting on its
// own (specs/RULE_DEMOS.md).
//
// So the demo draws the controls. A key cap is a small box that lights while
// its key is held, and the key being held is a fact about the WORLD, which is
// why `look` is handed one: the cap does not remember anything, it just asks.
// The same box unlit is the same box, so the cluster is always there and only
// its colour moves.
//
// The input itself is scripted in the demo's `input`, which the recorder calls
// where a driver calls `setInput` — so what the strip shows is the rule
// reacting to a keyboard, not a demo reaching past the rule to move an actor.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {type Look} from './types';

/** A control drawn in the frame, and the key it answers to. */
export interface Cap {
  readonly id: string;
  readonly key: string;
  readonly at: Vector;
  readonly width: number;
  readonly height: number;
}

const cap = (id: string, key: string, x: number, y: number): Cap => ({
  id,
  key,
  at: new Vector(x, y),
  width: 14,
  height: 14,
});

/**
 * The four arrows, in the inverted T every keyboard has.
 *
 * Bottom left, where a HUD goes and where no demo puts its subject. The shape
 * is what makes it legible without a letter on it: a box above three boxes is
 * an arrow cluster to anyone who has seen a keyboard, and this recorder cannot
 * draw a letter (`specs/RULE_DEMOS.md`).
 */
export const ARROW_CAPS: readonly Cap[] = [
  cap('capUp', 'up arrow', 30, 92),
  cap('capLeft', 'left arrow', 14, 108),
  cap('capDown', 'down arrow', 30, 108),
  cap('capRight', 'right arrow', 46, 108),
];

/** One wide bar along the bottom, which is what a space bar looks like. */
export const SPACE_CAP: readonly Cap[] = [
  {
    id: 'capSpace',
    key: 'space',
    at: new Vector(96, 108),
    width: 60,
    height: 12,
  },
];

const DARK = '#3b4048';
const LIT = '#e5c07b';

/** Put the controls in the world. They never move; only their colour does. */
export function addCaps(world: World, caps: readonly Cap[]): void {
  for (const control of caps) {
    world.addActor(
      new ActorBuilder({id: control.id, name: 'cap'})
        .set(PositionProperty, control.at)
        .instantiate(control.id),
    );
  }
}

/**
 * How to draw a control this frame, or undefined if `id` is not one.
 *
 * Undefined rather than a fallback, so a demo's own `look` keeps deciding
 * about its own actors and this only answers for the controls it added.
 */
export function capLook(
  id: string,
  world: World,
  caps: readonly Cap[],
): Look | undefined {
  const control = caps.find(one => one.id === id);
  return control
    ? {
        width: control.width,
        height: control.height,
        colour: world.isKeyDown(control.key) ? LIT : DARK,
      }
    : undefined;
}

/** A stretch of the recording during which some keys are held. */
export type Beat = readonly [from: number, to: number, keys: readonly string[]];

/**
 * Turn a script into the `input` a demo declares.
 *
 * A function of TIME rather than of a frame counter the demo keeps: the same
 * instant produces the same keyboard whether it is the recorder asking or a
 * test, and neither has to have run from the beginning to find out.
 */
export const keyboard =
  (script: readonly Beat[]) =>
  (world: World, seconds: number): void => {
    world.setInput(
      script
        .filter(([from, to]) => seconds >= from && seconds < to)
        .flatMap(([, , keys]) => keys),
    );
  };

/**
 * Where to put the pointer so it lands on a given point of the WORLD.
 *
 * `setPointer` speaks viewport pixels — the driver's own coordinates, straight
 * off a mouse event — and the world converts on the way in, by the active
 * camera. A demo that handed it world coordinates would put the pointer some
 * ninety pixels adrift of where the strip drew it, and the click would miss
 * silently: no error, no event, just a target that never answers.
 *
 * Read from the camera and the viewport rather than written down, because the
 * two rectangles are different sizes here and the arithmetic between them is
 * exactly the thing to get wrong once.
 */
export function pointerFor(world: World, at: Vector): Vector {
  const camera = world.cameraSnapshot().find(one => one.active);
  const view = world.viewSize();
  return new Vector(
    at.x - ((camera?.position.x ?? 0) - view.x / 2),
    at.y - ((camera?.position.y ?? 0) - view.y / 2),
  );
}
