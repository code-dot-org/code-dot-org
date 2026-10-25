// One value in the Actor Editor's panel: a field shaped for its type, which
// says what was typed when it is left (specs/ACTOR_EDITOR_PLAN.md, step 4).
//
// The camera inspector's fields, for an actor (`mapEditor/CameraInspector`):
// a box for a truth value, two numbers for a vector, a swatch for a color,
// and text for the rest. What is typed is kept until the field is left or
// Enter is pressed, so a half-typed number is not written.

import {useEffect, useState, type ChangeEvent, type KeyboardEvent} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';

import {parseVectorText, vectorText} from '../../mapEditor/worldProperties';

import styles from './actorEditor.module.css';

export interface ValueFieldProps {
  /** Unique in the panel: what the field is named by. */
  name: string;
  label: string;
  type: string;
  /** What it holds now, as text. */
  value: string;
  onValue: (text: string) => void;
  isReadOnly: boolean;
}

const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') {
    (event.target as HTMLInputElement).blur();
  }
};

export const ValueField = ({
  name,
  label,
  type,
  value,
  onValue,
  isReadOnly,
}: ValueFieldProps) => {
  const [draft, setDraft] = useState(value);
  // What the file says, once it says something else.
  useEffect(() => setDraft(value), [value]);
  const commit = (text: string) => {
    if (text !== value) {
      onValue(text);
    }
  };

  if (type === 'boolean') {
    return (
      <Checkbox
        name={name}
        label={label}
        checked={value === 'true'}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onValue(event.target.checked ? 'true' : 'false')
        }
      />
    );
  }
  if (type === 'vector' || type === 'point') {
    const at = parseVectorText(draft) ?? parseVectorText(value) ?? {x: 0, y: 0};
    return (
      <div className={styles.pair}>
        {(['x', 'y'] as const).map(axis => (
          <TextField
            key={axis}
            name={`${name}-${axis}`}
            label={`${label} ${axis.toUpperCase()}`}
            inputType="number"
            size="s"
            value={String(at[axis])}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDraft(
                vectorText({...at, [axis]: Number(event.target.value) || 0}),
              )
            }
            onBlur={() => commit(draft)}
            onKeyDown={blurOnEnter}
          />
        ))}
      </div>
    );
  }
  if (type === 'color') {
    return (
      <label className={styles.color}>
        <span>{label}</span>
        <input
          type="color"
          name={name}
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'}
          disabled={isReadOnly}
          onChange={event => onValue(event.target.value)}
        />
      </label>
    );
  }
  return (
    <TextField
      name={name}
      label={label}
      inputType={type === 'number' || type === 'angle' ? 'number' : 'text'}
      size="s"
      value={draft}
      disabled={isReadOnly}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        setDraft(event.target.value)
      }
      onBlur={() => commit(draft)}
      onKeyDown={blurOnEnter}
    />
  );
};
