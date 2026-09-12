// "Falls when nothing holds it up" — the row the enemy rows needed.
//
// Gravity arrives with `Jumps` for a player and with nothing at all for
// anything else, and that gap is why this exists. The Crawler every platformer
// starts with has no gravity — it patrols across at whatever height it was
// placed, and the floor it appears to walk on is a coincidence of placement
// (`fixtures/platformerSingle`). That is right for a Crawler and wrong the
// moment somebody wants the jetpack level's Blob, which elects
// `Affected by Gravity` on its own, has no jump and no keyboard, and is simply
// pulled onto the floor (`fixtures/jetpack`). The same level's Rocket takes
// the trait from a `falls` flag, which is one enemy built both ways and the
// clearest statement in the repo that this is a per-actor decision.
//
// SO IT IS NOT THE PLATFORMER ROW WITH THINGS REMOVED. "Walks and jumps like a
// platformer" gives a control scheme — keys, a jump, a hand on the thing. This
// gives only the pull, which is what an actor that must NOT be steered wants.
//
// AND IT KNOWS WHEN IT IS ALREADY TRUE. An actor that elects `Jumps` is
// affected by gravity, because a trait brings its own dependencies — so
// offering this to a platformer player would write a second line saying what
// the first already says. That is the reason the stock Player elects neither
// twice (`actors/stock/player`). The check is not exhaustive and does not try
// to be: it knows about the one trait that is a row on this same shelf.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {
  edit,
  electTraits,
  fileOf,
  importRules,
  wears,
  type ActorRoot,
} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const FALLS = 'Gravity#AffectedByGravityTrait';
/** The other way an actor comes to fall: jumping requires being pulled down. */
const JUMPS = 'Jumping#JumpsTrait';

/**
 * Whether this actor is pulled down already, by either route.
 *
 * READ BY BOTH HALVES, which is the point of naming it. `applied` said yes for
 * an actor that jumps and `apply` wrote the row anyway, because electing
 * checked for the gravity trait alone — a shelf saying "already has this" and
 * then adding a line if anybody asks. The dialog disables the row, so nothing
 * reachable hit it; a caller that applies without asking first did.
 */
const fallsAlready = (contents: string, root: ActorRoot): boolean =>
  wears(contents, FALLS, root) || wears(contents, JUMPS, root);

export const fallsEnhancement: Enhancement = {
  id: 'falls',
  subject: 'actor',
  name: 'Falls when nothing holds it up',
  description:
    'Pulls this actor down until something solid stops it — a blob that walks the floor, a crate that drops when its ledge goes. It gets no jump and no keys with it: “Walks and jumps like a platformer” is the row for something you steer. Whatever it comes to rest on has to hold things up.',
  brings: ['Affected by Gravity'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    return fallsAlready(id ? source.files[id].contents : '', root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Gravity']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents =>
          fallsAlready(contents, root)
            ? contents
            : electTraits(contents, root, [FALLS]),
        );
  },
};
