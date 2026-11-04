// What a shelf offers by purpose (specs/PURPOSE_PLAN.md, step 3).
//
// The rule shelf, the actor shelf and the enhancement checklist each list
// what is for the purpose they were opened for — a game's, an interface's —
// with what is for both, and keep the rest one press away under "Show
// everything". A flag decides what is offered first and never what can be
// used: nothing is refused.

import {useRef, useState, type ChangeEvent, type RefObject} from 'react';

import {getActiveFileForSource} from '@code-dot-org/codebridge';
import Checkbox from '@code-dot-org/component-library/checkbox';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../runtime/projectFiles';

import {
  isUnder,
  purposeOf,
  type OfferedTo,
  type PaletteTab,
} from './actorPurpose';
import type {EnhanceTarget} from './enhance/enhancements';

/**
 * The purpose a shelf opened here is for: the open actor's own, a Screen's
 * an interface's, a level's or a world's a game's. Nothing for anything else,
 * which offers everything.
 */
export function purposeHere(source: MultiFileSource): PaletteTab | undefined {
  const file = getActiveFileForSource(source);
  if (!file) {
    return undefined;
  }
  if (file.name.endsWith('.actor')) {
    return purposeOf(file.contents);
  }
  if (file.name.endsWith('.screen')) {
    return 'interface';
  }
  if (file.name.endsWith('.map')) {
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
  return id === undefined ? undefined : purposeOf(source.files[id].contents);
}

/** How many more a shelf shows with the box ticked, said in its label. */
const more = (count: number) =>
  count === 0 ? 'nothing more' : `${count} more`;

const EverythingBox = ({
  purpose,
  extra,
  everything,
  onChange,
}: {
  purpose: PaletteTab;
  extra: RefObject<number>;
  everything: boolean;
  onChange: (everything: boolean) => void;
}) => {
  // Read here, not where the box is made: a child draws after its parent,
  // so every `shows` of the shelf's render has been asked by now.
  const count = extra.current ?? 0;
  const [said, setSaid] = useState('');
  return (
    <>
      <Checkbox
        name="show-everything"
        label={`Show everything, not only what fits ${
          purpose === 'game' ? 'a game' : 'an interface'
        } (${more(count)})`}
        checked={everything}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.checked);
          setSaid(
            count === 0
              ? ''
              : event.target.checked
                ? `${count} more shown`
                : `${count} hidden`,
          );
        }}
      />
      <span role="status" aria-live="polite" style={VISUALLY_HIDDEN}>
        {said}
      </span>
    </>
  );
};

const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
} as const;

/**
 * Whether a shelf shows a thing for `of`, and the box that shows the rest.
 * With no purpose, everything, and no box. The box counts what it adds from
 * the things `shows` is asked of, so ask it only of what the shelf would
 * otherwise list.
 */
export function usePurposeFilter(purpose: PaletteTab | undefined): {
  shows: (of: OfferedTo) => boolean;
  toggle: React.ReactNode;
} {
  const [everything, setEverything] = useState(false);
  const extra = useRef(0);
  extra.current = 0;
  const shows = (of: OfferedTo) => {
    if (!purpose || isUnder(of, purpose)) {
      return true;
    }
    extra.current += 1;
    return everything;
  };
  const toggle = purpose ? (
    <EverythingBox
      purpose={purpose}
      extra={extra}
      everything={everything}
      onChange={setEverything}
    />
  ) : null;
  return {shows, toggle};
}
