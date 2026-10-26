// Which of the three draws, decided before the door is offered.
//
// Asked ONCE and up front, as the tutor's is (`aiTutor/transport`): a door
// that offers to draw and then fails on the first press reads as a broken lab,
// and a learner who is told nothing can draw has been told something true.
//
// THREE OUTCOMES, and the middle one is the reason the status route answers
// even when it has no key:
//
//   a dev server with a key      the direct transport, which really draws
//   a dev server without one     the fixture, so the flow can still be walked
//   no dev server at all         nothing, and the door is not offered
//
// The third is the important one. This lab is a library that runs inside the
// dashboard too, where `/__images/status` is served by nobody — and falling
// back to the fixture there would put four canned pictures in front of a
// student as though something had drawn them.

import {directImages, imageProxyStatus} from './directImages';
import {fixtureImages} from './fixtureImages';
import type {ImageGenerator} from './imageGenerator';

/** What was settled on, for the page to say so if it wants to. */
export interface ChosenGenerator {
  generator?: ImageGenerator;
  /** The model, when something can really draw. */
  model?: string;
  /** Why it is the fixture, or why there is nothing — for a human. */
  reason?: string;
}

export const chooseImageGenerator = async (): Promise<ChosenGenerator> => {
  const status = await imageProxyStatus();
  if (!status) {
    return {reason: 'no drawing service here'};
  }
  if (status.available) {
    return {generator: directImages(), model: status.model};
  }
  return {generator: fixtureImages(), reason: status.reason};
};
