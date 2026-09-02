// What an ACTOR demo is.
//
// A stock actor's row says what it is called, what it does in a sentence, and
// which rules and pictures come with it. What it cannot say is what the thing
// DOES, and for the actors whose worth is a behaviour rather than a picture
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
 * How many world pixels go into one strip pixel.
 *
 * A whole number, so a 32-pixel drawing shrinks to 16 by sampling every other
 * row and column rather than by inventing pixels between them. The alternative
 * was a strip the size of the world, which is a 256-pixel picture in a dialog
 * row beside two lines of text.
 */
export const ACTOR_DEMO_SHRINK = 2;

/** One cell of an actor demo's strip, which is the world shrunk. */
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

export interface ActorDemo {
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
}
