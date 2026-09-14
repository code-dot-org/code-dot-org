// "Carries what stands on it" — the moving platform, from the platform's end.
//
// Solid Bodies stops a body ending up inside a solid one and Gravity rests a
// faller on what it landed on, so a platform holds a player up perfectly and
// slides out from under them: neither rule ever says the platform is GOING
// anywhere (`rules/stock/carry`).
//
// TWO ACTORS, WHICH IS WHY THIS ASKS. `Carries` is the platform and `Rides` is
// whatever should go along with it, and a row that elected only the first
// would leave the learner with a platform that behaves exactly as it did
// before — the worst kind of enhancement, one that writes blocks and changes
// nothing. So it names a passenger, the way the camera names what it follows,
// and writes into that actor's file too.
//
// AND THE OTHER END HAS ITS OWN ROW. A learner making the PASSENGER rather
// than the platform reaches for "Rides moving platforms", which is one trait
// and no question, and is offered only when the project holds something that
// carries (`enhance/rides`). The pair can be built from either end because
// either end can be the one being made.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {actorChoices, targetOf} from './actorChoices';
import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

export const CARRIES = 'Carrying#CarriesTrait';
export const RIDES = 'Carrying#RidesTrait';

/** Whether the actor at `path` wears `trait` — the passenger's half. */
const rider = (
  source: MultiFileSource,
  target: EnhanceTarget,
  answer: string,
): boolean => {
  const passenger = targetOf(answer, target);
  const {path, root} = fileOf(passenger);
  const id = fileIdAt(source, path);
  return wears(id ? source.files[id].contents : '', RIDES, root);
};

export const carriesEnhancement: Enhancement = {
  id: 'carries',
  subject: 'actor',
  name: 'Carries what stands on it',
  description:
    'Makes this actor a moving platform: whatever is standing on it goes along with it. A lift, a raft, a log on a river. Without this a platform holds a player up perfectly and slides out from under them, because nothing else in the library ever says the platform is going anywhere. The passenger is told to ride, which is a line in ITS file rather than this one — anything else that should ride takes “Rides moving platforms”.',
  brings: ['Carries', 'Rides, on the passenger'],
  asks: {
    label: 'Carrying',
    options: actorChoices,
  },
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const carries = wears(id ? source.files[id].contents : '', CARRIES, root);
    // BOTH ENDS, where one was named. A platform that carries nobody is a row
    // half done, and saying it is done would leave it that way for good.
    return carries && (answer === undefined || rider(source, target, answer));
  },
  apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    if (answer === undefined) {
      return source;
    }
    let current = importRules(source, ['Carrying']);

    const platform = fileOf(target);
    const platformId = fileIdAt(current, platform.path);
    if (platformId !== undefined) {
      current = edit(current, platformId, contents =>
        electTraits(contents, platform.root, [CARRIES]),
      );
    }

    const passenger = fileOf(targetOf(answer, target));
    const passengerId = fileIdAt(current, passenger.path);
    if (passengerId !== undefined) {
      current = edit(current, passengerId, contents =>
        electTraits(contents, passenger.root, [RIDES]),
      );
    }
    return current;
  },
};
