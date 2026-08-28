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
  /** How long to hold them, in seconds, at a fixed sixty frames a second. */
  seconds: number;
}

/**
 * One question about the world, asked at each sample point.
 *
 * Deliberately few. Every probe here is something an existing play-test already
 * asks (`sokobanPlays`, `lessonsPlay`), and a check that needs a sixth is a
 * check to think about again before it is a probe to add — the vocabulary is
 * what keeps the sandbox side small enough to trust.
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
  | {kind: 'property'; of: string; name: string};

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
