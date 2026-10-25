// What a shelf offers by purpose (specs/PURPOSE_PLAN.md, step 3).
//
// The rule shelf, the actor shelf and the enhancement checklist each list
// what is for the purpose they were opened for — a game's, an interface's —
// with what is for both, and keep the rest one press away under "Show
// everything". A flag decides what is offered first and never what can be
// used: nothing is refused.

import {useState, type ChangeEvent} from 'react';

import {getActiveFileForSource} from '@code-dot-org/codebridge';
import Checkbox from '@code-dot-org/component-library/checkbox';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../runtime/projectFiles';

import {
  isUnder,
  purposeOf,
  type ActorPurpose,
  type PaletteTab,
} from './actorPurpose';
import type {EnhanceTarget} from './enhance/enhancements';

/**
 * The purpose a shelf opened here is for: the open actor's own, a Screen's
 * an interface's, a level's or a world's a game's. Nothing for anything else,
 * or for an actor for both, which offers everything.
 */
export function purposeHere(source: MultiFileSource): PaletteTab | undefined {
  const file = getActiveFileForSource(source);
  if (!file) {
    return undefined;
  }
  if (file.name.endsWith('.actor')) {
    return asTab(purposeOf(file.contents));
  }
  if (file.name.endsWith('.screen')) {
    return 'interface';
  }
  if (file.name.endsWith('.map') || file.name.endsWith('.world')) {
    return 'game';
  }
  return undefined;
}

/**
 * The purpose Enhance is opened for: the actor's own, read from its file. A
 * world's shelf, and an actor a world defines, are not narrowed.
 */
export function purposeOfTarget(
  source: MultiFileSource,
  target: EnhanceTarget,
): PaletteTab | undefined {
  if (target.kind !== 'actor') {
    return undefined;
  }
  const id = fileIdAt(source, `${target.path}.actor`);
  return id === undefined
    ? undefined
    : asTab(purposeOf(source.files[id].contents));
}

/** A purpose as a shelf is opened for one: both is no narrowing at all. */
export const asTab = (purpose: ActorPurpose): PaletteTab | undefined =>
  purpose === 'both' ? undefined : purpose;

/**
 * Whether a shelf shows a thing for `of`, and the box that shows the rest.
 * With no purpose, everything, and no box.
 */
export function usePurposeFilter(purpose: PaletteTab | undefined): {
  shows: (of: ActorPurpose) => boolean;
  toggle: React.ReactNode;
} {
  const [everything, setEverything] = useState(false);
  const shows = (of: ActorPurpose) =>
    !purpose || everything || isUnder(of, purpose);
  const toggle = purpose ? (
    <Checkbox
      name="show-everything"
      label={`Show everything, not only what fits ${
        purpose === 'game' ? 'a game' : 'an interface'
      }`}
      checked={everything}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        setEverything(event.target.checked)
      }
    />
  ) : null;
  return {shows, toggle};
}
