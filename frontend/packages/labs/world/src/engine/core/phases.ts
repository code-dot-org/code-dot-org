// The named moments of one frame, in the order they happen.
//
// A step used to say when it ran by naming a NEIGHBOUR — `before Physics ▸
// reposition`. That is the right thing to say when a rule genuinely knows its
// neighbour, and the wrong thing for a pipeline: five of the seven steps the
// stock rules ship carried a cross-rule anchor, so a learner writing a new
// force had to discover that Physics existed and pick the right one of its
// steps before their rule could work. What they wanted to say was "this is a
// force", and there was no way to say it.
//
// So the anchors the stock rules already hand-wired are given names, and that
// list is this file. Nothing here is new behaviour — `applyVelocity` before
// `reposition` before `find` before `resolve` before `handleCollisions` is the
// order those rules already produce. It is the same pipeline, sayable.
//
// A phase is not a subdivision of anything. There are no sub-phases: the camera
// moments sit in the one list beside the physical ones, because a frame is one
// sequence and the camera occupies four of its moments the way physics occupies
// four of them. Ordering among rules the engine has never heard of — a project's
// own pipeline — is not this list's business; those rules anchor to each other,
// which is what `before`/`after` is for.

/**
 * Which subject a phase is about, and so which steps may name it.
 *
 * A step declared under a trait knows its subject, so the editor offers only
 * the phases that subject takes part in: `push` is not a thing a camera does,
 * and a camera trait never sees it. A rule-level step has no subject and may
 * name any of them — that is where the work that fits no single actor lives
 * (reading the keyboard, walking every pair of bodies).
 */
export type PhaseSubject = 'world' | 'actor' | 'camera';

/** One named moment, and what it is for. */
export interface PhaseDef {
  readonly id: string;
  /** The label a learner reads in the dropdown. */
  readonly name: string;
  readonly subject: PhaseSubject;
  readonly summary: string;
}

/**
 * Every phase, in the order they run. INDEX IS MEANING here: the list is the
 * schedule, and moving an entry changes what a world does.
 */
export const PHASES: readonly PhaseDef[] = [
  {
    id: 'sense',
    name: 'sense',
    subject: 'world',
    summary: 'Read the outside world — keys, pointer, timers.',
  },
  {
    id: 'decide',
    name: 'decide',
    subject: 'actor',
    summary:
      'Turn intent into motion: what the player asked for, what an ' +
      'enemy chose.',
  },
  {
    id: 'push',
    name: 'push',
    subject: 'actor',
    summary: 'Add forces to velocity — gravity, wind, a magnet.',
  },
  {
    id: 'move',
    name: 'move',
    subject: 'actor',
    summary: 'Turn velocity into position.',
  },
  {
    id: 'touch',
    name: 'touch',
    subject: 'actor',
    summary: 'Work out what is against what.',
  },
  {
    id: 'settle',
    name: 'settle',
    subject: 'actor',
    summary: 'Push overlapping bodies apart.',
  },
  {
    id: 'react',
    name: 'react',
    subject: 'actor',
    summary:
      'Respond to what happened — landing, damage, scoring, which ' +
      'animation to play.',
  },
  {
    id: 'choose',
    name: 'choose the camera',
    subject: 'camera',
    summary: 'Decide which camera the view is taken through.',
  },
  {
    id: 'aim',
    name: 'aim',
    subject: 'camera',
    summary: 'Choose where the camera wants to look.',
  },
  {
    id: 'smooth',
    name: 'smooth',
    subject: 'camera',
    summary: 'Soften that choice — easing, a deadzone, looking ahead.',
  },
  {
    id: 'confine',
    name: 'confine',
    subject: 'camera',
    summary: 'Keep the view somewhere legal — inside the map, on one axis.',
  },
  {
    id: 'view',
    name: 'take the view',
    subject: 'camera',
    summary: 'Commit the choice: the camera moves to where it decided to look.',
  },
];

/** A phase id, for the `StepOrder` that names one. */
export type PhaseId = (typeof PHASES)[number]['id'];

const INDEX = new Map(PHASES.map((phase, at) => [phase.id, at]));

/**
 * Where a phase sits in the frame, or `undefined` if nothing is named.
 *
 * Undefined rather than a fallback index: a step naming a phase that does not
 * exist has said something meaningless, and putting it at the front by accident
 * would be a worse answer than leaving it unordered.
 */
export const phaseIndex = (id: string): number | undefined => INDEX.get(id);

/** The phases a subject may take part in — what the editor offers. */
export const phasesFor = (subject: PhaseSubject): readonly PhaseDef[] =>
  subject === 'world'
    ? PHASES
    : PHASES.filter(phase => phase.subject === subject);
