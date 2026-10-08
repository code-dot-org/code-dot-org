// The inspector with nothing selected, on a world's map: the world itself.
//
// Its name, the rules it holds, its background image and color, and the
// starting value of each property its `define property` rows declare — a field per row, as a placement's own properties are fields
// in its inspector (specs/MAP_FIRST.md, "Where the world's properties are
// set"). What is written is the row's DEFAULT (`worldProperties`); the `set`
// block remains for a value that changes while the game runs.

import {Button, Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent} from 'react';
import {useEffect, useRef, useState} from 'react';

import Accordion from '@code-dot-org/component-library/accordion';
import Checkbox from '@code-dot-org/component-library/checkbox';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';

import {countText} from '../blockly/extensions/rulesButton';
import {requestRulesConfig} from '../blockly/rulesConfig';
import {DEFAULT_BACKDROP_COLOR} from '../engine';
import fields from '../formFields.module.css';

import {AngleInput} from './AngleInput';
import {BackgroundColorField, BackgroundField} from './BackgroundField';
import styles from './mapEditor.module.css';
import type {MapSlotDoc} from './mapModel';
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
   * The theme the world is painted in — its `use theme` row — which is its
   * main map's too: a main map has no theme of its own (`worldProperties`).
   */
  theme: string | undefined;
  /** The project's themes, as `[label, path]`. */
  themeOptions: ReadonlyArray<readonly [string, string]>;
  onTheme: (path: string | undefined) => void;
  /**
   * The background image of the main map's back layer, the one `set
   * background to` sets — on the MAP, like the theme, and written there.
   */
  background?: MapSlotDoc;
  /** The project's backgrounds, by file name. */
  backgrounds?: readonly string[];
  onBackground?: (change: Partial<MapSlotDoc>) => void;
  /** …and the world's background color, a row in its code. */
  onBackgroundColor?: (color: string) => void;
  /**
   * How many rules the project holds — what the `define world` block's
   * button counts — for the button here that opens the same panel.
   */
  ruleCount?: number;
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
  background,
  backgrounds = [],
  onBackground,
  onBackgroundColor,
  ruleCount,
  isReadOnly,
}: WorldInspectorProps) => {
  // What is being typed, committed on blur or Enter as a placement's fields
  // are.
  const [name, setName] = useState(header.name);
  // Keyed by the SETTER where there is one: two rules may each have a
  // property called `strength`, and the world's own may too.
  const keyOf = (property: WorldProperty) => property.setter ?? property.name;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(header.properties.map(p => [keyOf(p), p.value])),
  );
  // A change from outside — the World view, a version restored — is what
  // the fields show. Followed by diffing the header rather than by
  // remounting on it, so the rule groups and a vector's popover stay open
  // across a commit: a drag on the grid commits on every move. Only what
  // CHANGED is re-seeded, so a field being typed into beside it keeps its
  // draft; a value this inspector just wrote comes back equal and is left
  // alone too.
  const seen = useRef(header);
  useEffect(() => {
    const before = seen.current;
    seen.current = header;
    if (before === header) {
      return;
    }
    if (before.name !== header.name) {
      setName(header.name);
    }
    const was = Object.fromEntries(
      before.properties.map(p => [keyOf(p), p.value]),
    );
    const changed = header.properties.filter(p => was[keyOf(p)] !== p.value);
    if (changed.length) {
      setValues(held => ({
        ...held,
        ...Object.fromEntries(changed.map(p => [keyOf(p), p.value])),
      }));
    }
  }, [header]);
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
    if (property.type === 'angle') {
      // …and the block's ring of common angles, for the same reason.
      const held = Number(values[key]);
      return (
        <AngleInput
          key={key}
          name={`world-${key}`}
          label={label}
          value={Number.isFinite(held) ? held : 0}
          disabled={isReadOnly}
          onChange={degrees => {
            const text = String(degrees);
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
        inputType={property.type === 'number' ? 'number' : 'text'}
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
      className={`${styles.inspector} ${fields.narrow}`}
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
      {ruleCount !== undefined && (
        // THE RULES IN PLAY, as the `define world` block's button shows them
        // and opening the same panel (`blockly/rulesConfig`): adding a rule
        // and taking one away are things a world is made of, and should not
        // need its code open.
        <FormFieldWrapper label="Rules" size="s">
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            data-callout="world.rules"
            aria-label={`Rules: ${countText(ruleCount)}. Add or remove rules.`}
            onClick={() => void requestRulesConfig({editable: !isReadOnly})}
          >
            {`${countText(ruleCount)}…`}
          </Button>
        </FormFieldWrapper>
      )}
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
      {onBackground && (
        <BackgroundField
          // Re-keyed on what the map says, so a change from outside — the
          // Layers panel, a `set background` edit — is what it shows.
          key={JSON.stringify(background ?? null)}
          name="map-background"
          slot={background}
          backgrounds={backgrounds}
          onChange={onBackground}
          isReadOnly={isReadOnly}
        />
      )}
      {onBackgroundColor && (
        <BackgroundColorField
          key={header.backgroundColor?.color ?? ''}
          color={header.backgroundColor?.color}
          fallback={DEFAULT_BACKDROP_COLOR}
          inCode={Boolean(header.backgroundColor?.inCode)}
          onChange={onBackgroundColor}
          isReadOnly={isReadOnly}
        />
      )}
      <ThemeField
        value={theme}
        options={themeOptions}
        onChange={onTheme}
        emptyLabel="(none)"
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default WorldInspector;
