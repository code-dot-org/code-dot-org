// Which actors a row can be pointed AT, and how an answer names one.
//
// TWO ROWS ASK THIS and they ask the same thing: the camera picks somebody to
// follow, a moving platform picks somebody to carry. What differs is what is
// done with the answer, which is each row's own business — this is only the
// list, and the one rule about it that is not obvious.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {authoredName} from '../../blockly/projectModules';
import {fileIdAt, filePath} from '../../runtime/projectFiles';

import type {EnhanceChoice, EnhanceTarget} from './enhancements';
import {rootsOf} from './patch';

/**
 * The actors this one can be pointed at, as the field names them.
 *
 * ITSELF LEFT OUT, which is the one answer that is never meant: an actor told
 * to chase its own kind picks the nearest of them, which on the commonest
 * setup is the actor itself, and a hunter standing on its own spot is a bug
 * that looks like the trait not working.
 *
 * A world's own `define actor` blocks are offered only to an actor that world
 * defines, because `local:` ids are the world's and a `.actor` file cannot
 * name one (`blockly/localActors`).
 */
export const actorChoices = (
  source: MultiFileSource,
  target: EnhanceTarget,
): EnhanceChoice[] => {
  const local = target.block
    ? rootsOf(
        source.files[fileIdAt(source, `${target.path}.world`) ?? '']
          ?.contents ?? '',
      )
        .filter(root => root.type === 'world_actor' && root.id)
        .map(root => ({
          value: `local:${String(root.id)}`,
          name: String(root.fields?.NAME ?? root.id),
        }))
    : [];
  const files = Object.keys(source.files)
    .map(id => ({id, path: filePath(source, id) ?? ''}))
    .filter(one => one.path.endsWith('.actor'))
    .map(one => ({
      value: one.path.replace(/\.actor$/, ''),
      name:
        authoredName(source.files[one.id].contents ?? '') ??
        (one.path.split('/').pop() ?? '').replace(/\.actor$/, ''),
    }));
  const self = target.block ? `local:${target.block}` : target.path;
  return [...local, ...files].filter(choice => choice.value !== self);
};

/**
 * The answer, as a thing an enhancement can edit.
 *
 * An answer is either a file's path — `actors/player` — or `local:<id>` for an
 * actor a world defines, and the second kind has no path of its own: it lives
 * in the world file of whoever is being enhanced, which is the only world it
 * could have come from (`actorChoices` offers locals to a local alone).
 */
export const targetOf = (answer: string, from: EnhanceTarget): EnhanceTarget =>
  answer.startsWith('local:')
    ? {
        kind: 'actor',
        path: from.path,
        block: answer.slice('local:'.length),
        name: answer,
      }
    : {kind: 'actor', path: answer, name: answer};
