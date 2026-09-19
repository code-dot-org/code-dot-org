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
import type {WorldHeader, WorldProperty} from './worldProperties';

export interface WorldInspectorProps {
  header: WorldHeader;
  onRename: (name: string) => void;
  /**
   * Set one property's starting value. What that MEANS differs by where the
   * property comes from, and the caller knows: a `define property` row's
   * DEFAULT for the world's own, a `set` row under `define world` for a
   * rule's (specs/WORLD_RULE_FIELDS_PLAN.md).
   */
  onSetDefault: (property: WorldProperty, value: string) => void;
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
  // Keyed by the SETTER where there is one: two rules may each have a
  // property called `strength`, and the world's own may too.
  const keyOf = (property: WorldProperty) => property.setter ?? property.name;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(header.properties.map(p => [keyOf(p), p.value])),
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
  const commitValue = (property: WorldProperty) => {
    const key = keyOf(property);
    if (values[key] !== property.value) {
      onSetDefault(property, values[key]);
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
          {header.properties.map(property => {
            const key = keyOf(property);
            // A rule's says whose it is: two rules may both have a
            // `strength`, and "Gravity" is the only thing telling them
            // apart (specs/WORLD_RULE_FIELDS_PLAN.md).
            const label = property.rule
              ? `${capitalize(property.name)} (${property.rule})`
              : capitalize(property.name);
            return property.type === 'boolean' ? (
              <Checkbox
                key={key}
                name={`world-${key}`}
                label={label}
                checked={values[key] === 'true'}
                disabled={isReadOnly}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const next = event.target.checked ? 'true' : 'false';
                  setValues(held => ({...held, [key]: next}));
                  onSetDefault(property, next);
                }}
              />
            ) : (
              <TextField
                key={key}
                name={`world-${key}`}
                label={label}
                inputType={
                  property.type === 'number' || property.type === 'angle'
                    ? 'number'
                    : 'text'
                }
                size="s"
                value={values[key] ?? ''}
                disabled={isReadOnly || !EDITABLE.has(property.type)}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setValues(held => ({...held, [key]: event.target.value}))
                }
                onBlur={() => commitValue(property)}
                onKeyDown={blurOnEnter}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorldInspector;
