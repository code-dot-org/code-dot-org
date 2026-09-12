// "Hurts what it touches" — the other half of a health bar.
//
// Health has been on the shelf since the first enhancement and only ever
// answered one side of the question: an actor could have health to lose, and
// nothing in the library could take any. Every fixture that wanted a hazard
// wrote `use trait ⟨Health#Deals Damage⟩` by hand — the Crawler, the spikes,
// the Eyeball, four of the jetpack level's five enemies (`fixtures/jetpack`).
//
// TWO ACTORS, ONE MECHANIC, and which one is enhanced is the whole of the
// design. Damage is dealt by the toucher and felt by the touched, and neither
// half is the other's business: a spike does not care who walks into it, and a
// player with no health walks through one unharmed and correctly. So this row
// gives the hurting and leaves the feeling to the health row, rather than
// reaching into an actor nobody asked about.
//
// ITS DESCRIPTION NAMES THE TRAIT AND NOT THAT ROW, which is a smaller point
// that cost a test to learn. A row's title quoted inside another row's
// description is a coupling — rename one and the other lies — and it also made
// two buttons on this shelf carry the same words, which is an ambiguity for
// anything matching them by name, a screen reader included.
//
// ONE TRAIT, and the argument for the row is `patrols`' argument: what the
// rule shelf hands over is a file and a name, and the distance from there to a
// hazard is a `use trait` row and the right trait out of ninety.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const DEALS_DAMAGE = 'Health#DealsDamageTrait';

export const dealsDamageEnhancement: Enhancement = {
  id: 'deals-damage',
  subject: 'actor',
  name: 'Hurts what it touches',
  description:
    'Makes this actor damage whatever runs into it — a crawler, a spike, a pool of lava. How much it takes off is a block in its file. Only an actor that has health of its own can feel it, and giving it some is that actor’s business rather than this one’s.',
  brings: ['Deals Damage'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    return wears(id ? source.files[id].contents : '', DEALS_DAMAGE, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Health']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents =>
          electTraits(contents, root, [DEALS_DAMAGE]),
        );
  },
};
