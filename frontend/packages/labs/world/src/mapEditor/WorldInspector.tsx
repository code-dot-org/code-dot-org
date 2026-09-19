// The inspector with nothing selected, on a world's map: the world itself.
//
// Its name, and the starting value of each property its `define property`
// rows declare — a field per row, as a placement's own properties are fields
// in its inspector (specs/MAP_FIRST.md, "Where the world's properties are
// set"). What is written is the row's DEFAULT (`worldProperties`); the `set`
// block remains for a value that changes while the game runs.

import {Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent} from 'react';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';

import styles from './mapEditor.module.css';
import type {WorldHeader} from './worldProperties';

export interface WorldInspectorProps {
  header: WorldHeader;
  onRename: (name: string) => void;
  onSetDefault: (property: string, value: string) => void;
  isReadOnly: boolean;
}

const capitalize = (text: string) =>
  text ? text[0].toUpperCase() + text.slice(1) : text;

/** The kinds of value a field can hold; the rest are read as they are. */
const EDITABLE = new Set(['number', 'angle', 'string', 'boolean']);

export const WorldInspector = ({
  header,
  onRename,
  onSetDefault,
  isReadOnly,
}: WorldInspectorProps) => {
  // What is being typed, committed on blur or Enter as a placement's fields
  // are; the parent re-keys this on a change from outside.
  const [name, setName] = useState(header.name);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(header.properties.map(p => [p.name, p.value])),
  );
  const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };
  const commitName = () => {
    const next = name.trim();
    if (next && next !== header.name) {
      onRename(next);
    } else {
      setName(header.name);
    }
  };
  const commitValue = (property: string) => {
    const held = header.properties.find(p => p.name === property);
    if (held && values[property] !== held.value) {
      onSetDefault(property, values[property]);
    }
  };

  return (
    <div
      className={styles.inspector}
      data-testid="world-inspector"
      data-callout="world.properties"
    >
      <div className={styles.inspectorHead}>
        <Typography variant="subtitle2" component="span">
          World
        </Typography>
      </div>
      <TextField
        name="world-name"
        label="Name"
        size="s"
        value={name}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setName(event.target.value)
        }
        onBlur={commitName}
        onKeyDown={blurOnEnter}
      />
      {header.properties.length > 0 && (
        <div className={styles.inspectorGroup}>
          {header.properties.map(property =>
            property.type === 'boolean' ? (
              <Checkbox
                key={property.name}
                name={`world-${property.name}`}
                label={capitalize(property.name)}
                checked={values[property.name] === 'true'}
                disabled={isReadOnly}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const next = event.target.checked ? 'true' : 'false';
                  setValues(held => ({...held, [property.name]: next}));
                  onSetDefault(property.name, next);
                }}
              />
            ) : (
              <TextField
                key={property.name}
                name={`world-${property.name}`}
                label={capitalize(property.name)}
                inputType={
                  property.type === 'number' || property.type === 'angle'
                    ? 'number'
                    : 'text'
                }
                size="s"
                value={values[property.name] ?? ''}
                disabled={isReadOnly || !EDITABLE.has(property.type)}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setValues(held => ({
                    ...held,
                    [property.name]: event.target.value,
                  }))
                }
                onBlur={() => commitValue(property.name)}
                onKeyDown={blurOnEnter}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default WorldInspector;
