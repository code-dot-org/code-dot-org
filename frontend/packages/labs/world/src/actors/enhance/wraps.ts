// "Comes back on the other side" — walking off one edge and in at the other.
//
// TWO ROWS, because wanting one is not wanting the other, which is the rule's
// own reason for having two traits (`rules/stock/wrap`). A side-scroller wraps
// across and would be broken by wrapping down: step off a ledge and you
// reappear in the sky. Asteroids wants both, and takes both rows.
//
// Neither asks anything and neither needs a companion. An actor that wraps
// wraps by itself, against the edges of the map rather than against anything
// in it — which is what makes these the shortest rows on the shelf.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const ACROSS = 'Screen Wrap#WrapsAcrossTrait';
const DOWN = 'Screen Wrap#WrapsDownTrait';

/** One direction, as a row. The two differ in a trait and a sentence. */
const wrapRow = (
  id: string,
  trait: string,
  name: string,
  description: string,
  brings: string,
): Enhancement => ({
  id,
  subject: 'actor',
  name,
  description,
  brings: [brings],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const fileId = fileIdAt(source, path);
    return wears(fileId ? source.files[fileId].contents : '', trait, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Screen Wrap']);
    const {path, root} = fileOf(target);
    const fileId = fileIdAt(current, path);
    return fileId === undefined
      ? current
      : edit(current, fileId, contents => electTraits(contents, root, [trait]));
  },
});

export const wrapsAcrossEnhancement = wrapRow(
  'wraps-across',
  ACROSS,
  'Comes back on the other side',
  'Sends this actor off the left edge of the map and in at the right, and the other way round. The vertical is left alone, so an actor that falls off the bottom still falls off the bottom — which is what a side-on game wants. An actor that should wrap both ways takes “Comes back at the top” as well.',
  'Wraps Across',
);

export const wrapsDownEnhancement = wrapRow(
  'wraps-down',
  DOWN,
  'Comes back at the top',
  'Sends this actor off the bottom edge of the map and in at the top, and the other way round. On its own this is a game played up and down; with “Comes back on the other side” it is a map with no edges at all, which is what an asteroids field is.',
  'Wraps Down',
);
