// The size of the side a docked placement fixes, as a number
// (specs/DOCKING_PLAN.md, step 5): the same thing the line beside it is
// dragged to change. Written when the field is left, or on Enter.

import {useEffect, useState, type ChangeEvent, type KeyboardEvent} from 'react';

import TextField from '@code-dot-org/component-library/textField';

export interface DockSizeFieldProps {
  /** Which way the side runs: a bar across the top is a height. */
  split: 'across' | 'down';
  size: number;
  onSize: (size: number) => void;
  isReadOnly: boolean;
}

export const DockSizeField = ({
  split,
  size,
  onSize,
  isReadOnly,
}: DockSizeFieldProps) => {
  const [draft, setDraft] = useState(String(size));
  useEffect(() => setDraft(String(size)), [size]);
  const commit = () => {
    const typed = Number(draft);
    if (draft.trim() !== '' && Number.isFinite(typed) && typed >= 0) {
      if (typed !== size) {
        onSize(typed);
      }
    } else {
      setDraft(String(size));
    }
  };
  return (
    <TextField
      name="actor-dock-size"
      label={split === 'down' ? 'Docked height' : 'Docked width'}
      inputType="number"
      size="s"
      min={0}
      disabled={isReadOnly}
      value={draft}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        setDraft(event.target.value)
      }
      onBlur={commit}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          (event.target as HTMLInputElement).blur();
        }
      }}
    />
  );
};
