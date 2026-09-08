// What an ACTOR demo is.
//
// A stock actor's row says what it is called, what it does in a sentence, and
// which rules and pictures come with it. What it cannot say is what the thing
// DOES, and for the actors whose worth is a behavior rather than a picture
// that is the whole of what a learner is choosing (specs/RULE_DEMOS.md makes
// the same argument for rules, and this is that argument one noun over).
//
// A rule demo builds its world with the engine directly, because a rule is our
// code and needs none of the machinery that exists to run a learner's safely.
// An actor demo cannot do that and stay honest: what it is demonstrating IS a
// file — the `.actor` the import copies in — so it imports that actor into a
// project the way the dialog would, compiles it the way the sandbox would, and
// presses keys the way a learner would. A Player that stops jumping stops
// jumping in its demo, because there is nothing in the middle to keep working.
//
// So a demo is DATA rather than a builder: which stock actors the scene needs,
// where they stand, how long to run, and what is held down when. The building
// is `record/stage`, which every reader of a demo shares.

import type * as WorldLab from '../../engine';
import type {Actor, World} from '../../engine';

/**
 * The rectangle of the world an actor demo films, in world pixels.
 *
 * Chosen by the Player's own jump, which is what a demo of it has to fit: it
 * rises 134 pixels from a standing start, so a scene with a floor at the
 * bottom and a jump in it is about 200 pixels tall whatever else is in it.
 * Eight tiles by six is the smallest whole-tile frame that holds one.
 */
export const ACTOR_DEMO_WORLD = {width: 256, height: 192} as const;

/**
 * How many world pixels go into one strip pixel, unless a demo says otherwise.
 *
 * A whole number, so a 32-pixel drawing shrinks to 16 by sampling every other
 * row and column rather than by inventing pixels between them. The alternative
 * was a strip the size of the world, which is a 256-pixel picture in a dialog
 * row beside two lines of text.
 *
 * A DEMO MAY CHOOSE ITS OWN, and the Coin is why. Nothing in that scene jumps,
 * so nothing needs the room a jump needs, and three coins shrunk to sixteen
 * pixels are three specks in an empty frame. Every strip is the same SIZE
 * whatever it picks — what changes is how much world is in it, which is the
 * difference between a wide shot and a portrait rather than a layout problem.
 */
export const ACTOR_DEMO_SHRINK = 2;

/** One cell of an actor demo's strip — the same for every demo. */
export const ACTOR_DEMO_SIZE = {
  width: ACTOR_DEMO_WORLD.width / ACTOR_DEMO_SHRINK,
  height: ACTOR_DEMO_WORLD.height / ACTOR_DEMO_SHRINK,
} as const;

/** One actor of the scene, at the place the world's blocks put it. */
export interface ActorPlacement {
  /** A stock actor's id — the subject's own, or one of `supporting`. */
  actor: string;
  /** In world pixels of the demo frame, as an `x, y` block would say it. */
  x: number;
  y: number;
}

/**
 * What a demo is handed to play the GAME around its actor.
 *
 * `modules` is every compiled module by path, which is how a demo reaches a
 * property somebody declared: `modules['actors/progressBar'].FractionProperty`
 * is the block `set fraction of ⟨actor⟩`, and nothing else. A rule's are
 * reached the same way, under `rules/…`.
 *
 * `engine` is the same door for the properties no rule owns — opacity, scale,
 * position — which are blocks too and belong to every actor. Handed over
 * rather than imported, so a demo file stays data the dialog can load without
 * dragging the engine into the lab's bundle behind it.
 */
export interface DemoStage {
  world: World;
  /** The actor the demo is about — the one its cast placed. */
  subject: Actor;
  modules: Record<string, Record<string, unknown>>;
  engine: typeof WorldLab;
  /** Elapsed time, as `keys` sees it. */
  seconds: number;
}

/** Where the pointer is this frame, in world pixels, and whether it presses. */
export interface PointerAt {
  x: number;
  y: number;
  /** The left button, which is the only one a demo has wanted. */
  down?: boolean;
}

export interface ActorDemo {
  /**
   * World pixels per strip pixel, when the default does not suit the scene.
   *
   * One is a portrait: the frame holds 128 by 96 of world and a 32-pixel actor
   * is 32 pixels of picture. Two is the wide shot the Player needs.
   */
  shrink?: number;
  /**
   * The other stock actors the scene needs, by id.
   *
   * Imported the way the dialog imports one, so a demo cannot show its subject
   * standing on something the library does not offer. The subject itself is
   * the key this demo is filed under and is always imported.
   */
  supporting?: readonly string[];
  /** Everything in the scene, in the order the world places it. */
  cast: readonly ActorPlacement[];
  /** How long to run it for, in seconds — the length of the recording. */
  seconds: number;
  /**
   * Which keys are held at that moment of the recording.
   *
   * A function of WHEN rather than of a counter the demo keeps, so the same
   * instant produces the same input in the recorder and in the test, and
   * neither has to be run from the start to ask what is down. The names are
   * the engine's (`engine/core/keys`): `right arrow`, `space`.
   *
   * This is the whole of what a demo does to its world. It never reaches past
   * the actor to move it — the actor's own file hears the keyboard, and what
   * the strip shows is that file working.
   */
  keys?(seconds: number): readonly string[];
  /**
   * What the GAME does, for an actor that is shown things rather than played.
   *
   * A Player is demonstrated by pressing keys, because a keyboard is what a
   * Player answers to. A Progress Bar answers to a NUMBER somebody else sets —
   * that is the whole of what it is, and a bar nothing filled would be a demo
   * of an empty rectangle. So a demo may also write the line a project would
   * write, in TypeScript rather than in blocks, which is exactly what the rule
   * demos do for the rules that raise an event and own nothing that follows
   * (specs/RULE_DEMOS.md).
   *
   * Called once a frame, beside `keys`, before the world ticks. It reaches the
   * actor's properties the way a block would and nothing deeper: a demo that
   * had to reach into the engine to make its actor look right would be
   * demonstrating the engine.
   */
  drive?(stage: DemoStage): void;
  /**
   * Where the pointer is, and whether the button is down.
   *
   * In WORLD pixels, as the cast's positions are; the stage converts to the
   * viewport coordinates `setPointer` speaks and draws the cursor at the same
   * place, so nothing the rule reads comes from a picture.
   *
   * A cursor is drawn in the frame for the reason the rule demos draw a key
   * cap: the cause has to be in the picture, or the strip shows a button
   * answering nobody.
   */
  pointer?(seconds: number): PointerAt | undefined;
  /**
   * The handlers a project would write, registered once before the first tick.
   *
   * `drive` is what the game DOES each frame; this is what it has arranged to
   * happen. A Button raises "is clicked with" on itself and owns nothing that
   * follows — that is the whole of the actor — so a demo of one has to supply
   * the answer, exactly as the Time and Shooting rule demos supply theirs
   * (specs/RULE_DEMOS.md).
   */
  wire?(stage: DemoStage): void;
}

/** How much WORLD a demo's frame holds, which is its shrink's business. */
export function demoWorldSize(demo: ActorDemo): {
  width: number;
  height: number;
} {
  const shrink = demo.shrink ?? ACTOR_DEMO_SHRINK;
  return {
    width: ACTOR_DEMO_SIZE.width * shrink,
    height: ACTOR_DEMO_SIZE.height * shrink,
  };
}
