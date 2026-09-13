// Where pictures come from, when a learner describes one.
//
// A SEAM, and the reason it exists before anything can draw is that the flow
// and the service are on different clocks. What a learner does — type a few
// words, wait, look at what came back, keep one or ask again — is answerable
// with no key, no network and no model, and every design question in it is
// answerable today. The service is a client to extract out of the webpack
// bundle, a token to mint, and a question about whether a World Lab user may
// ask for a picture at all that nobody has answered
// (specs/AI_IMAGE_GENERATION.md).
//
// So the door is built against this, and this has three answers: a fixture,
// which everything runs on; a dev proxy holding a key, for a developer trying
// it locally; and the product one. The tutor in this same lab is built exactly
// this way and the shape is borrowed rather than invented
// (`aiTutor/transport`, `@code-dot-org/aitutor`).
//
// IT ANSWERS "IS THERE ONE?" SEPARATELY FROM "DRAW ME ONE", and the separation
// is the point rather than tidiness. A door that offers to draw and then fails
// on the first press reads as a broken lab; one that can ask first can say
// there is nothing behind it, or not offer at all. That is the same reason
// `proxyStatus()` is a route of its own in the tutor's dev proxy.
//
// WHAT COMES BACK IS BYTES ON A URL, which is what every picture in a project
// already is (`appearance/importStock`, `files/newThing`). Nothing downstream
// of this knows or cares that a picture was described rather than drawn or
// imported, and there is nothing on the file that says so.

import type {ImageKind} from './imagePrompts';

/** One picture that came back. */
export interface GeneratedPicture {
  /**
   * A short word for it, which is where its file name comes from.
   *
   * The transport's, not the learner's: what they typed may be a sentence, and
   * a file called `a purple crab with big claws.png` is a file nobody wants.
   */
  name: string;
  /** The bytes, as the project stores them. */
  dataUrl: string;
  mediaType: string;
}

/** What was asked for. */
export interface DrawRequest {
  /** The learner's own words, whole and untouched. */
  prompt: string;
  /**
   * What the picture is FOR, which decides how the words are asked
   * (`generate/imagePrompts`).
   *
   * The call site's, never the learner's: the Actor Creator knows it is asking
   * for an actor, and a door that asked would be asking a question it already
   * had the answer to.
   */
  kind?: ImageKind;
  /**
   * How many tiles the actor will fill, when it is not one.
   *
   * A picture drawn square and then stretched over two tiles is a stretched
   * picture. Asked for in the shape it will be drawn in, it arrives right — so
   * the shape the learner drew is a fact the provider is told, not one applied
   * afterwards (`generate/ScaleGrid`, specs/ACTOR_SIZE.md).
   */
  shape?: {x: number; y: number};
  /** How many to offer. A transport may answer with fewer. */
  count?: number;
  /**
   * Abandoned, when the learner has stopped waiting.
   *
   * A drawing takes seconds, and in that time a learner may close the wizard
   * or ask for something else. A transport that cannot be called off leaves
   * its answer arriving at a door that has gone.
   */
  signal?: AbortSignal;
}

/** Somewhere pictures come from. */
export interface ImageGenerator {
  /**
   * What this is called, for the lab to say which it got.
   *
   * Said out loud because the three are NOT interchangeable in the one way
   * that matters: the dev proxy runs none of the moderation a product path
   * runs, and a page that could not tell them apart could not say so.
   */
  readonly kind: 'fixture' | 'direct' | 'gateway';
  draw(request: DrawRequest): Promise<GeneratedPicture[]>;
}

/**
 * How many to ask for when nobody says.
 *
 * ONE. Four was the fixture's habit and it does not survive contact with a
 * real service: each is a provider call and a wait, and the learner's next act
 * is almost never "pick the best of four" but "that is close, but greener" —
 * which is an edit to the words, not a choice between pictures. So one, and
 * drawing again is a press.
 */
export const DRAW_COUNT = 1;

/** Thrown by a transport whose request was abandoned. */
export class DrawAbandoned extends Error {
  constructor() {
    super('The drawing was abandoned.');
    this.name = 'DrawAbandoned';
  }
}
