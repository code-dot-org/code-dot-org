// Every "Show me" in every lesson names a place the lab has, and a thing the
// lesson's own project holds (specs/SHOW_ME_PLAN.md).
//
// A link in a lesson's instructions carries a NAME — `map.enhance:Hero` —
// and a name the registry does not know points at nothing, silently: the
// link is drawn, pressed, and nothing happens. This is what stops that, and
// what stops a kind being renamed out from under a lesson that points at it.

import {describe, expect, it} from 'vitest';

import {
  clickableNames,
  parsePlaceName,
  placeNamed,
} from '../../callouts/places';
import {projectFiles} from '../../runtime/projectFiles';
import {LESSONS} from '../lessons';
import type {TileId} from '../types';

const ids = Object.keys(LESSONS) as TileId[];
const pointing = ids.filter(
  id => clickableNames(LESSONS[id].instructions).length > 0,
);

/** The names the lesson's actor files declare: `define actor ⟨Hero⟩`. */
const kindsOf = (id: TileId): string[] =>
  Object.entries(projectFiles(LESSONS[id].source))
    .filter(([path]) => path.endsWith('.actor'))
    .flatMap(([, contents]) => {
      try {
        const roots = (
          JSON.parse(contents) as {
            blocks?: {blocks?: Array<{type: string; fields?: {NAME?: string}}>};
          }
        ).blocks?.blocks;
        return (roots ?? [])
          .filter(root => root.type === 'world_actor')
          .flatMap(root => (root.fields?.NAME ? [root.fields.NAME] : []));
      } catch {
        return [];
      }
    });

/** Places whose argument is a kind by the name it declares. */
const ABOUT_A_KIND = new Set([
  'map.palette',
  'map.enhance',
  'map.openKind',
  'map.script',
]);

describe('Show me, in the lessons', () => {
  it('is used by the lessons that name a control', () => {
    // Not every lesson told on the map points: `motion/units` is one number
    // in an inspector, and its own sentence says where.
    expect(pointing.sort()).toEqual([
      'input/arrows',
      'input/two-hands',
      'motion/drag',
      'motion/gravity',
      'motion/speed',
      'origin/first-world',
    ]);
  });

  it.each(pointing)('%s names only places the lab has', id => {
    for (const name of clickableNames(LESSONS[id].instructions)) {
      expect(placeNamed(name), `${id} points at ${name}`).toBeDefined();
    }
  });

  it.each(pointing)('%s names only kinds its own project holds', id => {
    const kinds = kindsOf(id);
    for (const name of clickableNames(LESSONS[id].instructions)) {
      const {place, argument} = parsePlaceName(name);
      if (ABOUT_A_KIND.has(place) && argument) {
        expect(kinds, `${id} points at ${name}`).toContain(argument);
      }
      // …and a place in another file names one too: `@Hero`.
      for (const step of placeNamed(name)?.reveals ?? []) {
        if (step.kind === 'file' && step.actor) {
          expect(kinds, `${id} points at ${name}`).toContain(step.actor);
        }
      }
    }
  });

  it.each(pointing)(
    '%s opens on the map when it points at the map first',
    id => {
      // A lesson whose first pointer is on the map and which opens on the
      // workspace would have Show me switch views under a learner on step one.
      const [first] = clickableNames(LESSONS[id].instructions);
      if (first.startsWith('map.')) {
        expect(LESSONS[id].levelData?.worldView).toBe('map');
      }
    },
  );
});
