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

import Accordion from '@code-dot-org/component-library/accordion';
import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';

import styles from './mapEditor.module.css';
import {ThemeField} from './ThemeField';
import {VectorInput} from './VectorInput';
import {
  parseVectorText,
  vectorText,
  type WorldHeader,
  type WorldProperty,
} from './worldProperties';

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
  /**
   * What the world's main map is painted out of; absent takes the world's own.
   *
   * On the MAP and not on the world header, which is why it is its own pair of
   * props rather than another `WorldProperty`: it is written to the map
   * document beside the placements (`mapEditor/MapStage`). What is NOT here is
   * "covers what is under it" — a main map lives inside the `.world` file, so
   * `load map` cannot name it and nothing can ever be under it
   * (specs/MODALITY_PLAN.md).
   */
  theme: string | undefined;
  /** The project's themes, as `[label, path]`. */
  themeOptions: ReadonlyArray<readonly [string, string]>;
  onTheme: (path: string | undefined) => void;
  isReadOnly: boolean;
}

const capitalize = (text: string) =>
  text ? text[0].toUpperCase() + text.slice(1) : text;

/** The kinds of value a field can hold; the rest are read as they are. */
const EDITABLE = new Set(['number', 'angle', 'string', 'boolean']);

/** The two axes of a point, each its own field. */
const AXES = ['x', 'y'] as const;

export const WorldInspector = ({
  header,
  onRename,
  onSetDefault,
  theme,
  themeOptions,
  onTheme,
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

  // The world's own properties, and each rule's under the rule's name: the
  // same shape a placement's inspector gives its traits, and for the same
  // reason. Two rules may both have a `strength`, and the group is what tells
  // them apart, so the field itself need not (specs/WORLD_RULE_FIELDS_PLAN.md).
  const own = header.properties.filter(property => !property.rule);
  const byRule = new Map<string, WorldProperty[]>();
  for (const property of header.properties) {
    if (property.rule) {
      byRule.set(property.rule, [
        ...(byRule.get(property.rule) ?? []),
        property,
      ]);
    }
  }
  const rules = [...byRule];
  // A point's two axes are drafted apart, as a placement's are, and go back
  // together as the one text its row is read from (`vectorText`).
  const commitAxis = (property: WorldProperty, axis: 'x' | 'y') => {
    const key = keyOf(property);
    const held = parseVectorText(values[key] ?? '') ?? {x: 0, y: 0};
    const typed = Number(values[`${key}.${axis}`]);
    if (!Number.isFinite(typed) || typed === held[axis]) {
      return;
    }
    const next = vectorText({...held, [axis]: typed});
    setValues(held => ({...held, [key]: next}));
    onSetDefault(property, next);
  };
  const renderField = (property: WorldProperty) => {
    const key = keyOf(property);
    const label = capitalize(property.name);
    if (property.type === 'vector') {
      // The block's own dial and grid: a direction is chosen, not typed.
      return (
        <VectorInput
          key={key}
          name={`world-${key}`}
          label={label}
          value={parseVectorText(values[key] ?? '') ?? {x: 0, y: 0}}
          disabled={isReadOnly}
          onChange={next => {
            const text = vectorText(next);
            setValues(held => ({...held, [key]: text}));
            onSetDefault(property, text);
          }}
        />
      );
    }
    if (property.type === 'point') {
      const held = parseVectorText(values[key] ?? '') ?? {x: 0, y: 0};
      return (
        <div key={key} className={styles.inspectorGrid}>
          {AXES.map(axis => (
            <TextField
              key={axis}
              name={`world-${key}-${axis}`}
              label={`${label} ${axis.toUpperCase()}`}
              inputType="number"
              size="s"
              value={values[`${key}.${axis}`] ?? String(held[axis])}
              disabled={isReadOnly}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setValues(held => ({
                  ...held,
                  [`${key}.${axis}`]: event.target.value,
                }))
              }
              onBlur={() => commitAxis(property, axis)}
              onKeyDown={blurOnEnter}
            />
          ))}
        </div>
      );
    }
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
      {own.length > 0 && (
        <div className={styles.inspectorGroup}>{own.map(renderField)}</div>
      )}
      {rules.length > 0 && (
        <Accordion
          className={styles.inspectorAccordion}
          items={rules.map(([rule, properties]) => ({
            id: rule,
            label: rule,
            content: (
              <div className={styles.inspectorGroup}>
                {properties.map(renderField)}
              </div>
            ),
          }))}
        />
      )}
      <ThemeField
        value={theme}
        options={themeOptions}
        onChange={onTheme}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default WorldInspector;
