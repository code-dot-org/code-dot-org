// The blocks a page of one thing's code is headed by: an actor's or a rule's
// block (`memberHead`), a step (`stepHead`) and an actor's drawing
// (`drawingHead`), each with what it does below it. Named here for the
// readers that cannot import the blocks.

/**
 * An actor's own block on its member page: the block being made, with its
 * implementation below it (`memberHead`). Named here, beside the other
 * heads, for the readers that cannot import the block.
 */
export const MEMBER_HEAD = 'world_member_head';

/** The one member head on the page. */
export const MEMBER_HEAD_ID = 'member-head';

/** The socket a member head's `at`th value fills with its getter. */
export const memberValueSocket = (at: number): string => `VALUE${at}`;

/**
 * A step on its page: the moment of the frame it runs in, with what it does
 * below it (`stepHead`).
 */
export const STEP_HEAD = 'world_step_head';

/** The one step head on the page. */
export const STEP_HEAD_ID = 'step-head';

/**
 * An actor's drawing on its page: the size it is drawn at, with the pen and
 * shapes below it (`drawingHead`).
 */
export const DRAWING_HEAD = 'world_drawing_head';

/** The one drawing head on the page. */
export const DRAWING_HEAD_ID = 'drawing-head';

/**
 * An actor's tween on its page: how long, on what curve, with its
 * destinations below it (`tweenHead`).
 */
export const TWEEN_HEAD = 'world_tween_head';

/** The one tween head on the page. */
export const TWEEN_HEAD_ID = 'tween-head';
