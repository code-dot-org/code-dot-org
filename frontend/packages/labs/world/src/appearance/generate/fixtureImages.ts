// Four pictures, so the door can be built before anything can draw.
//
// NOT A STUB — this is the transport almost everything runs on. Every test of
// the flow uses it, every screenshot comes from it, and a developer with no key
// sees the whole door work (specs/IMAGE_GENERATION.md).
//
// FOUR RATHER THAN ONE, because choosing between pictures is a different act
// from accepting one: a door that offers a single picture and a retry button
// makes a learner reject before they can compare. They are deliberately unlike
// each other — a different colour and a different silhouette apiece — since two
// tiles a learner cannot tell apart would test the layout and not the choosing.
//
// AND THEY IGNORE THE PROMPT, which is the one thing about this that could
// mislead. A fixture that appeared to answer what was typed would be a demo
// rather than a stand-in, and the first real transport would then be a
// surprise. What the words do here is pick the ORDER, so asking again with
// different words visibly changes the answer without pretending to understand
// it.
//
// 32 by 32 and a few hundred bytes each, written as data URLs for the reason
// `files/newThing`'s blank sprite is: a picture the project holds is bytes on a
// URL, and these have to be that from the start or they would be testing a
// different write.

import {
  DrawAbandoned,
  type GeneratedPicture,
  type ImageGenerator,
} from './imageGenerator';

/** How long the fixture pretends to take, in milliseconds. */
export const FIXTURE_DELAY = 900;

const CRAB =
  'data:image/png;base64,' +
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAYklEQVR42mNgGA' +
  'WjYKiBa1EB//HhAbGUpo4h13KKHUGpxRQ7ZEAdQG3LSXIErSwn2hED6gBCmmVk' +
  'NOCYEjWjDhi6DqB5QhxwB4yWA4OiKB6tDQdNg2TQNMkGRaN0FIwCWgIAHXtNeW' +
  'UBiqoAAAAASUVORK5CYII=';

const STAR =
  'data:image/png;base64,' +
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAa0lEQVR42mNgGA' +
  'VDHbzY5/EfGx5Qy+nmCJo6gJCBhCynyAHEGEozBxBjMLF41AED7gCyHEMrB5Dk' +
  'EFyaZWQ04JgSNWQ7gloOINsRI8sBA5oYR67lw64gGq0LhmaDZFA0yUZbxUOmYz' +
  'IKqAEA+LAFcGviBMUAAAAASUVORK5CYII=';

const GEM =
  'data:image/png;base64,' +
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAkUlEQVR42mNgGA' +
  'UUgIRpD/6D8IBaPiCOQLecro7AZTldHEHIcpo6gljLaeIIUi2nqiPItZwqjqDU' +
  'coocQS3LyXIEtS0nyRH4DJCR0YBjctVQ5HNqOACnI4gJQmo5AKsjBtwBtEx8VE' +
  '0HA54ThmxZMPSK4kFRGQ2K6nhQNEgGRZNsUDRKB0WzfFB0TAZF12zYAACNQIKh' +
  'mrx2rwAAAABJRU5ErkJggg==';

const SPROUT =
  'data:image/png;base64,' +
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAQElEQVR42mNgGA' +
  'WjAA3kbcn7T0s86oBRB4w6YNQBFDlARkYDjslVM+qAoe2A0Vww6oBRB4w6YNQB' +
  'dHHAKBhxAAB5maWM3zBsGwAAAABJRU5ErkJggg==';

/** What every one of them measures, which is stated because it is known. */
const FIXTURE_SIZE = {width: 32, height: 32};

/** The four of them, in the order they were drawn. */
const PICTURES: readonly GeneratedPicture[] = [
  {name: 'crab', dataUrl: CRAB, mediaType: 'image/png', ...FIXTURE_SIZE},
  {name: 'star', dataUrl: STAR, mediaType: 'image/png', ...FIXTURE_SIZE},
  {name: 'gem', dataUrl: GEM, mediaType: 'image/png', ...FIXTURE_SIZE},
  {name: 'sprout', dataUrl: SPROUT, mediaType: 'image/png', ...FIXTURE_SIZE},
];

/** A small stable hash of a string, for ordering and nothing else. */
const hashOf = (text: string): number =>
  [...text].reduce((hash, letter) => (hash * 31 + letter.charCodeAt(0)) | 0, 7);

/**
 * Where one picture sorts, for this prompt.
 *
 * MIXED rather than concatenated, which took two goes to get right. Hashing
 * `prompt + name` looks like it combines them and does not: that hash is
 * `h(prompt) × 31^len(name) + h(name)`, so for two pictures whose names are
 * the same length the prompt's whole contribution is the same number and
 * cancels in the comparison. The order came out of the names alone, and six
 * prompts gave four orders — every one of them from the names being different
 * lengths. Exclusive-or and a multiply actually let one change the other.
 */
const keyFor = (prompt: string, name: string): number =>
  Math.imul(hashOf(prompt) ^ hashOf(name), 2654435761) | 0;

/**
 * Which four, and in what order.
 *
 * The prompt decides the ORDER and nothing else. A fixture that appeared to
 * answer the words would be a demo; one that ignored them entirely would make
 * "ask again" look broken, since the same four would come back in the same
 * order for ever. So the words shuffle the list: different words, visibly
 * different answer, no pretence of understanding.
 *
 * A PERMUTATION RATHER THAN A ROTATION, which the tests caught. Rotating four
 * pictures gives four orders, so one pair of prompts in four came back
 * identical — and the one thing this has to demonstrate is that asking again
 * with different words does something. Sorting each picture by a hash of the
 * prompt AND its own name gives twenty-four.
 */
const orderedFor = (prompt: string): GeneratedPicture[] =>
  [...PICTURES].sort(
    (one, other) => keyFor(prompt, one.name) - keyFor(prompt, other.name),
  );

/**
 * The transport everything runs on until something can draw.
 *
 * SLOW ON PURPOSE. A generator that answers instantly designs a flow with no
 * waiting in it, and waiting is most of what this flow is: the button has to
 * say it is working, the grid has to hold its place, and asking again while an
 * answer is in flight has to mean something. None of that gets built against a
 * transport that returns before the next paint.
 */
export const fixtureImages = (
  delay: number = FIXTURE_DELAY,
): ImageGenerator => ({
  kind: 'fixture',
  draw: ({prompt, count = PICTURES.length, signal}) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', stop);
        resolve(orderedFor(prompt).slice(0, count));
      }, delay);
      // Called off rather than left to arrive at a door that has gone.
      const stop = () => {
        clearTimeout(timer);
        reject(new DrawAbandoned());
      };
      if (signal?.aborted) {
        stop();
        return;
      }
      signal?.addEventListener('abort', stop, {once: true});
    }),
});
