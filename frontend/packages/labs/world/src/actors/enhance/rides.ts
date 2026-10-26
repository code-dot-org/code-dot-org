// "Rides moving platforms" — the same ability from the passenger's end.
//
// EITHER END CAN BE THE ONE BEING MADE. `enhance/carries` is for a learner
// building the lift, and names who rides it; this is for one building the
// player in a project that already has a lift. One trait, no question, and the
// trait names no platform — so a rider carried by one is carried by the next
// without being told about it (`rules/stock/carry`).
//
// OFFERED ONLY WHERE THERE IS SOMETHING TO RIDE. In a project with nothing
// that carries, this writes a trait that does nothing and says nothing about
// why, which is worse than not being on the shelf. The shelf asks each row
// whether it is worth showing (`Enhancement.offered`), and this is the reason
// that hook exists.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import {CARRIES, RIDES} from './carries';
import type {Enhancement, EnhanceTarget} from './enhancements';

/** Whether anything in the project is a moving platform already. */
const somethingCarries = (source: MultiFileSource): boolean =>
  Object.values(source.files).some(file =>
    (file.contents ?? '').includes(CARRIES),
  );

export const ridesEnhancement: Enhancement = {
  id: 'rides',
  subject: 'actor',
  name: 'Rides moving platforms',
  description:
    'Lets this actor be carried by anything that carries: stand on a lift and go up with it, stand on a raft and go across. It names no platform, so whatever it steps onto next carries it too. The platform’s own half is “Carries what stands on it”, which is what makes something a moving platform in the first place.',
  brings: ['Rides'],
  offered: (source: MultiFileSource) => somethingCarries(source),
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    return wears(id ? source.files[id].contents : '', RIDES, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Carrying']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => electTraits(contents, root, [RIDES]));
  },
};
