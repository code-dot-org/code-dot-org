import Dialog from '@code-dot-org/component-library/dialog';
import TextField from '@code-dot-org/component-library/textField';
import React, {useCallback, useState} from 'react';

import {SpriteLab2Behavior2} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

// Sentinel option value for "create a new system". System names are
// student-entered but this shape is not creatable through the dialog (the
// name is sanitized), so no collision.
const NEW_SYSTEM_VALUE = '__new_system__';

// System names key the generated-code registry and the sprite groups, so
// keep them word-shaped: letters, digits, spaces (trimmed).
export function sanitizeSystemName(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ +/g, ' ')
    .trim();
}

interface Behavior2SelectorProps {
  behavior2s: SpriteLab2Behavior2[];
  activeName: string;
  // Disabled off the Systems tab, where switching has no effect.
  disabled?: boolean;
  onSelect: (name: string) => void;
  onCreate: (name: string) => void;
}

/**
 * System picker in the tab bar: choose which system implementation the
 * Systems tab shows, or create a new one via the option at the bottom
 * (which opens a naming dialog). Mirrors SceneSelector.
 */
const Behavior2Selector: React.FunctionComponent<Behavior2SelectorProps> = ({
  behavior2s,
  activeName,
  disabled,
  onSelect,
  onCreate,
}) => {
  const [naming, setNaming] = useState(false);
  const [newName, setNewName] = useState('');

  const closeDialog = useCallback(() => {
    setNaming(false);
    setNewName('');
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === NEW_SYSTEM_VALUE) {
        // Open the naming dialog; the controlled value snaps back to the
        // active system until one is actually created.
        setNaming(true);
      } else {
        onSelect(e.target.value);
      }
    },
    [onSelect]
  );

  const cleaned = sanitizeSystemName(newName);
  const taken = behavior2s.some(b => b.name === cleaned);

  const handleCreate = useCallback(() => {
    const name = sanitizeSystemName(newName);
    if (name && !behavior2s.some(b => b.name === name)) {
      onCreate(name);
    }
    closeDialog();
  }, [newName, behavior2s, onCreate, closeDialog]);

  return (
    <>
      <select
        className={moduleStyles.sceneSelect}
        value={activeName}
        onChange={handleChange}
        disabled={disabled}
        aria-label="System"
      >
        {behavior2s.map(({name}) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
        <option value={NEW_SYSTEM_VALUE}>＋ New system…</option>
      </select>
      {naming && (
        <Dialog
          title="New system"
          onClose={closeDialog}
          customContent={
            <TextField
              name="systemName"
              label="System name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              errorMessage={
                taken ? 'A system with this name already exists' : undefined
              }
            />
          }
          primaryButtonProps={{
            children: 'Create',
            size: 'small',
            disabled: !cleaned || taken,
            onClick: handleCreate,
          }}
          secondaryButtonProps={{
            children: 'Cancel',
            size: 'small',
            color: 'tertiary',
            variant: 'outlined',
            onClick: closeDialog,
          }}
        />
      )}
    </>
  );
};

export default Behavior2Selector;
