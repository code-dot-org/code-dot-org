// What a check asks the running world, and what it gets back.
//
// specs/PROGRESSION.md ranks the evidence a lesson can be checked by: an
// OUTCOME (the game reached a state) survives a learner solving it their own
// way, which a check on the shape of their workspace does not. An outcome means
// running the project, and running the project means the sandbox — learner code
// does not execute on the lab's origin (specs/SANDBOX.md).
//
// So a check travels as DATA. The lab sends a script of inputs and a set of
// probes; the sandbox builds a fresh world, plays the script on a fixed clock,
// samples the probes, and sends the numbers back. **The sandbox makes no
// judgement.** Whether the numbers pass is decided in the lab, where the
// catalogue is — which keeps the untrusted side as small as it can be, and
// means a check can be corrected without rebuilding anything down there.
//
// Deterministic by construction: a fixed timestep, and inputs measured in
// frames rather than in wall-clock time. The same project gives the same answer
// on a fast machine and a slow one, which is the difference between a check and
// a coin toss.

/** A stretch of the script: keys held, for a length of time. */
export interface TraceStep {
  /**
   * Keys held throughout this stretch, as `KeyboardEvent.key` names
   * ('ArrowRight', ' ' for space) — the names the browser hands the driver,
   * translated the same way the driver translates them.
   */
  hold?: readonly string[];
  /**
   * Where the pointer is for this stretch, and which of its buttons are down
   * ('left', 'middle', 'right' — `engine/core/pointer`).
   *
   * A stretch that says nothing leaves the pointer where the last one put it,
   * which is what a hand does. Two stretches at one place with the button down
   * and then up are a CLICK, and that is how a check scripts one.
   */
  pointer?: {x: number; y: number; buttons?: readonly string[]};
  /**
   * A world property turned to a new value BEFORE this stretch runs, by the
   * path a snapshot names it with (`${ruleId}.${propId}`).
   *
   * The one thing in a script that is not a pair of hands. It exists for the
   * one lesson that is about the editor rather than about a game: turning a
   * number while the world runs, and seeing the difference without starting
   * again (`simulation/dials`). This is the same call the reconciler makes when
   * it decides a change can be patched (`driver/reconcile`) — a check that
   * rebuilt the module instead would need a compiler in the sandbox, and would
   * be testing the build rather than the dial.
   *
   * A path nothing answers to is left alone and reported by the probes as the
   * absence it is: a project that never declared the property is a project that
   * has not done the lesson, and that is the check's answer rather than its
   * error.
   */
  set?: {path: string; value: unknown};
  /**
   * Characters TYPED at the start of this stretch — `['h', 'i']`.
   *
   * A different question from `hold`, and the reason it is a different field:
   * a key is held or it is not, and typing is a sequence. Shift, a dead key,
   * an IME and a paste all make a character and no key edge anybody could name
   * (specs/UI_ACTORS.md), so a check that scripted a field being filled in
   * with `hold` would be scripting something the browser never does.
   *
   * Delivered ONCE, before the stretch's frames run, and drained by the first
   * of them — which is what a pair of hands typing and then waiting looks
   * like. A stretch that wants two words apart is two stretches.
   */
  type?: readonly string[];
  /** How long to hold them, in seconds, at a fixed sixty frames a second. */
  seconds: number;
}

/**
 * One question about the world, asked at each sample point.
 *
 * Deliberately few. Every probe here is something an existing play-test already
 * asks (`sokobanPlays`, `lessonsPlay`), and a check that needs a new one is a
 * check to think about again before it is a probe to add — the vocabulary is
 * what keeps the sandbox side small enough to trust.
 *
 * They have been added in twos and threes as a region needed them, and each
 * addition says why below. What none of them does is hand back the world: a
 * probe answers one question in one shape, so the sandbox stays a thing that
 * measures rather than a thing that reports.
 */
export type Probe =
  /** How many actors are in the world; `of` narrows to one kind. */
  | {kind: 'actorCount'; of?: string}
  /** Where every actor of a kind is, in the order the world holds them. */
  | {kind: 'positions'; of: string}
  /** How many actors draw anything at all — a picture or their own drawing. */
  | {kind: 'drawnCount'}
  /** Which pictures are on screen, by the name the frame names. */
  | {kind: 'sprites'}
  /** A world-scoped property, by `${ruleId}.${propId}`. */
  | {kind: 'worldProperty'; path: string}
  /**
   * A named property on every actor of a kind, in the order the world holds
   * them — `{of: 'Label', name: 'text'}`.
   *
   * The sixth probe, and the note above says a check wanting one is a check to
   * think about twice first. This is the second thought: a lesson about state
   * is a lesson about a value an actor carries, and until now nothing could
   * read one. Memory, Story and every lesson that draws a word are unprovable
   * without it — "the label says the right thing" is not a position, a count or
   * a picture.
   *
   * Matched on the property's id OR its name, for the reason `of` accepts
   * either: a check is written by somebody reading the lesson, who knows what
   * the block calls it.
   */
  | {kind: 'property'; of: string; name: string}
  /**
   * What a kind of actor DRAWS FOR ITSELF: the identity of its commands, and
   * the size it draws at.
   *
   * Three more probes arrive together here, and they are the Look region's:
   * nothing in the five above can see a picture. `sprites` answers which file
   * is on screen, which is the whole of what a picture was until an actor could
   * describe one. A drawing has no file — it is commands — so what identifies
   * it is `key`, which the driver already computes to decide whether it has
   * rasterized this exact picture before. Two health bars at different
   * fractions have different keys, and that is the only way to say from outside
   * that a bar's width follows anything.
   *
   * The commands themselves are NOT here. They are a tree with colors and
   * numbers in it, and a check that read one would be reading the workspace
   * back out of the running world — which is what `inspect` is for.
   */
  | {kind: 'drawings'; of?: string}
  /**
   * What is drawn BEHIND everything, per layer: the picture, whether it tiles,
   * and where it has been slid to.
   *
   * A backdrop is not an actor (specs/BACKGROUNDS.md), so no actor probe can
   * find one — and "the backdrop is set" is the whole of what its lesson asks.
   */
  | {kind: 'backdrop'}
  /**
   * The effects on every actor of a kind, or on the world and its backdrops,
   * by module path and knob settings.
   *
   * `of` names a kind; without it the answer is the world's own and each
   * backdrop's. The DOCUMENT is dropped — an effect's source is a file the
   * project holds, and a probe that carried one would send a shader across the
   * sandbox boundary to answer "is it on".
   */
  | {kind: 'effects'; of?: string}
  /**
   * Where the view is: each camera's position, and which one is being looked
   * through.
   *
   * WHAT IS DRAWN and WHERE THINGS ARE are two different questions, which is
   * the Place region's whole subject — and a probe that reads positions is
   * answering the second one. A camera that follows, stops at the edge of the
   * map, eases, or ignores a small movement is right or wrong in the FIRST,
   * and nothing else here can see it.
   */
  | {kind: 'cameras'};

export interface CheckRun {
  /** The probes, by the name their samples come back under. */
  probes: Record<string, Probe>;
  /** The script. Probes are sampled once before it, and after every step. */
  trace: readonly TraceStep[];
}

/**
 * What came back.
 *
 * `samples[name]` has one entry per sample point: `trace.length + 1` of them,
 * the first taken before the script starts. So "did this change" and "what was
 * it at the end" are both answerable without a second run.
 */
export interface CheckResult {
  samples: Record<string, unknown[]>;
  /** Everything the project printed, for the checks that watch for a word. */
  console: string[];
  /** Set if the world threw; the samples are then whatever was taken first. */
  error?: string;
}

/** A point in the world, as a probe reports one. */
export interface ProbePoint {
  x: number;
  y: number;
}

/** Frames a second the script is played at. Fixed, and that is the point. */
export const CHECK_FPS = 60;
