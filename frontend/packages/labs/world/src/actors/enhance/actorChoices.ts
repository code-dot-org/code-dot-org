// Which actors a row can be pointed AT, and how an answer names one.
//
// TWO ROWS ASK THIS and they ask the same thing: the camera picks somebody to
// follow, a moving platform picks somebody to carry. What differs is what is
// done with the answer, which is each row's own business — this is only the
// list, and the one rule about it that is not obvious.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {authoredName} from '../../blockly/projectModules';
import {filePath} from '../../runtime/projectFiles';

import type {EnhanceChoice, EnhanceTarget} from './enhancements';

/**
 * The actors this one can be pointed at, as the field names them.
 *
 * ITSELF LEFT OUT, which is the one answer that is never meant: an actor told
 * to chase its own kind picks the nearest of them, which on the commonest
 * setup is the actor itself, and a hunter standing on its own spot is a bug
 * that looks like the trait not working.
 *
 */
export const actorChoices = (
  source: MultiFileSource,
  target: EnhanceTarget,
): EnhanceChoice[] => {
  const files = Object.keys(source.files)
    .map(id => ({id, path: filePath(source, id) ?? ''}))
    .filter(one => one.path.endsWith('.actor'))
    .map(one => ({
      value: one.path.replace(/\.actor$/, ''),
      name:
        authoredName(source.files[one.id].contents ?? '') ??
        (one.path.split('/').pop() ?? '').replace(/\.actor$/, ''),
    }));
  return files.filter(choice => choice.value !== target.path);
};

/** The answer, as a thing an enhancement can edit: a file's path. */
export const targetOf = (answer: string): EnhanceTarget => ({
  kind: 'actor',
  path: answer,
  name: answer,
});
