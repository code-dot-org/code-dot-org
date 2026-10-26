// Every enhancement, made to an actor of either shape (specs/ACTOR_EDITOR_PLAN.md,
// step 3): given to each actor of the starter project as it ships and as data,
// it makes the same change.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {projectFiles} from '../../../runtime/projectFiles';
import {asActorData, isDataShaped} from '../../actorData';
import {ENHANCEMENTS, type EnhanceTarget} from '../enhancements';

const STARTER = WORLD_SCENARIOS.simple.source;

/** The project with each of its actors folded into data. */
const asData = (source: MultiFileSource): MultiFileSource => ({
  ...source,
  files: Object.fromEntries(
    Object.entries(source.files).map(([id, file]) => [
      id,
      file.name.endsWith('.actor')
        ? {...file, contents: asActorData(file.contents)}
        : file,
    ]),
  ),
});

/** Every file, with each actor in the data shape, to compare two projects by. */
const inData = (source: MultiFileSource) =>
  Object.fromEntries(
    Object.entries(projectFiles(source)).map(([path, contents]) => [
      path,
      path.endsWith('.actor') ? JSON.parse(asActorData(contents)) : contents,
    ]),
  );

const TARGETS: EnhanceTarget[] = Object.keys(projectFiles(STARTER))
  .filter(path => path.startsWith('actors/') && path.endsWith('.actor'))
  .map(path => ({
    kind: 'actor' as const,
    path: path.replace(/\.actor$/, ''),
    name: path,
  }));

describe.each(ENHANCEMENTS.filter(one => one.subject === 'actor'))(
  '$id',
  enhancement => {
    it.each(TARGETS)(
      'makes the same change to $path in either shape',
      target => {
        const data = asData(STARTER);
        if (enhancement.refuse?.(STARTER, target)) {
          expect(enhancement.refuse(data, target)).toBe(
            enhancement.refuse(STARTER, target),
          );
          return;
        }
        const answer = enhancement.asks?.options(STARTER, target)[0]?.value;
        expect(enhancement.applied(data, target, answer)).toBe(
          enhancement.applied(STARTER, target, answer),
        );

        const fromBlocks = enhancement.apply(STARTER, target, answer);
        const fromData = enhancement.apply(data, target, answer);

        expect(inData(fromData)).toEqual(inData(fromBlocks));
        // …and a data-shaped actor stays data.
        const touched = projectFiles(fromData)[`${target.path}.actor`];
        expect(isDataShaped(touched)).toBe(true);
        expect(enhancement.applied(fromData, target, answer)).toBe(
          enhancement.applied(fromBlocks, target, answer),
        );
      },
    );
  },
);
