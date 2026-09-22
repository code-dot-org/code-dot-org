// Editing a theme: the values, what each control is made of, and a live
// picture of the result (specs/STYLES_PLAN.md).
//
// TWO PANELS, BECAUSE A THEME HAS TWO LEVELS. Tokens are named values and
// styles are bundles that refer to them, which is the thing that stops
// recolouring from meaning "edit four styles". So the editor is a list of
// values, and a list of bundles that point at them.
//
// WHAT IT DOES NOT DO IS ADD A STYLE, and that is not an omission to fix here.
// A style nothing names does nothing: a drawing has to say `use style ⟨…⟩` for
// a role to exist at all, and that is a block in an `.actor` file. Offering
// "new style" here would make a thing whose only effect is to be unused, and
// would say nothing about where to go next. Adding a TOKEN is the same
// argument one level down — a token nothing refers to is a value nothing
// reads — so the editor edits what the file already holds.

// MUI for the button and the headings, the component library for the form
// fields — which is the mix the map editor's inspector already uses, two
// directories over, for the same kind of surface.
import {Button, Typography} from '@mui/material';
import {useCallback, useMemo, useState, type ChangeEvent} from 'react';

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';

import type {StyleSpec, ThemeDocument} from '../../engine/core/theme';

import styles from './styleEditor.module.css';
import {
  asReference,
  isColorToken,
  stylesOf,
  tokenNamed,
  tokensOf,
  withStyleField,
  withToken,
  writeThemeDocument,
} from './themeDocument';
import {ThemePreview} from './ThemePreview';

export interface StyleEditorProps {
  document: ThemeDocument;
  onChange: (document: ThemeDocument) => void;
  readOnly?: boolean;
}

/** The fields a style may carry, in the order a control is painted in. */
const FIELDS: Array<{
  key: keyof StyleSpec;
  label: string;
  kind: 'color' | 'number' | 'weight';
}> = [
  {key: 'fill', label: 'Fill', kind: 'color'},
  {key: 'stroke', label: 'Edge', kind: 'color'},
  {key: 'strokeWidth', label: 'Edge width', kind: 'number'},
  {key: 'corner', label: 'Corner', kind: 'number'},
  {key: 'weight', label: 'Letters', kind: 'weight'},
];

/** What a field is currently set to, as the three answers a form can show. */
type Setting = 'unset' | 'none' | 'token' | 'literal';

const settingOf = (value: unknown): Setting => {
  if (value === undefined) {
    return 'unset';
  }
  if (value === null) {
    return 'none';
  }
  return tokenNamed(value) === undefined ? 'literal' : 'token';
};

export const StyleEditor = ({
  document: theme,
  onChange,
  readOnly = false,
}: StyleEditorProps) => {
  const tokens = tokensOf(theme);
  const allStyles = stylesOf(theme);
  const [chosen, setChosen] = useState<string | null>(
    allStyles[0]?.[0] ?? null,
  );

  // Serialized once per edit, and handed to the preview — which reads the
  // stock actors through it exactly as the game would.
  const serialized = useMemo(() => writeThemeDocument(theme), [theme]);

  const setToken = useCallback(
    (name: string, value: string | number) =>
      onChange(withToken(theme, name, value)),
    [onChange, theme],
  );

  const colorTokens = tokens.filter(([, value]) => isColorToken(value));
  const numberTokens = tokens.filter(([, value]) => !isColorToken(value));
  const spec: StyleSpec = (chosen && theme.styles?.[chosen]) || {};

  /** One field of the chosen style: what it is set to, and to what. */
  const fieldRow = (field: (typeof FIELDS)[number]) => {
    const value = spec[field.key] as unknown;
    const setting = settingOf(value);
    const pool = field.kind === 'color' ? colorTokens : numberTokens;
    const set = (next: StyleSpec[keyof StyleSpec] | undefined) =>
      chosen && onChange(withStyleField(theme, chosen, field.key, next));

    if (field.kind === 'weight') {
      return (
        <div key={field.key} className={styles.field}>
          <SimpleDropdown
            name={`field-${String(field.key)}`}
            labelText={field.label}
            size="s"
            className={styles.select}
            disabled={readOnly}
            selectedValue={value === undefined ? '' : String(value)}
            // "Leave alone" is a real answer and the commonest one: a style
            // that says nothing about the letters keeps whatever the drawing
            // set, which is how two styles compose.
            items={[
              {value: '', text: 'leave alone'},
              {value: 'normal', text: 'normal'},
              {value: 'bold', text: 'bold'},
            ]}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              set(
                event.target.value === ''
                  ? undefined
                  : (event.target.value as 'bold' | 'normal'),
              )
            }
          />
        </div>
      );
    }

    return (
      <div key={field.key} className={styles.field}>
        <SimpleDropdown
          name={`field-${String(field.key)}`}
          labelText={field.label}
          size="s"
          className={styles.select}
          disabled={readOnly}
          selectedValue={
            setting === 'token' ? asReference(tokenNamed(value)!) : setting
          }
          items={[
            {value: 'unset', text: 'leave alone'},
            {value: 'none', text: 'none'},
            ...pool.map(([name]) => ({value: asReference(name), text: name})),
            {value: 'literal', text: 'a value of its own…'},
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            const next = event.target.value;
            if (next === 'unset') {
              set(undefined);
            } else if (next === 'none') {
              set(null);
            } else if (next === 'literal') {
              set(field.kind === 'color' ? '#000000' : 0);
            } else {
              set(next);
            }
          }}
        />
        {/*
          NO LABEL ON THIS ONE. The dropdown beside it already says which
          field this is; a second caption reading "Fill value" next to one
          reading "Fill" is the same word twice. The name it answers to is an
          `aria-label`, which the field forwards to its input.
        */}
        {setting === 'literal' &&
          (field.kind === 'color' ? (
            <input
              type="color"
              className={styles.swatch}
              disabled={readOnly}
              aria-label={`${field.label} colour`}
              value={String(value)}
              onChange={event => set(event.target.value)}
            />
          ) : (
            <TextField
              name={`field-${String(field.key)}-value`}
              inputType="number"
              size="s"
              className={styles.number}
              disabled={readOnly}
              aria-label={`${field.label} value`}
              value={String(value)}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                set(Number(event.target.value))
              }
            />
          ))}
      </div>
    );
  };

  return (
    <div className={styles.editor}>
      <ThemePreview theme={serialized} />

      <div className={styles.panels}>
        <section className={styles.panel} aria-labelledby="theme-values">
          <Typography
            id="theme-values"
            component="h2"
            variant="subtitle2"
            className={styles.heading}
          >
            Values
          </Typography>
          <Typography variant="body4" className={styles.note}>
            Every control is painted out of these. Change one and everything
            that uses it changes.
          </Typography>
          {/*
            ONE VISIBLE LABEL PER ROW, and it is the field's own. These rows
            carried a name of their own beside a control that draws a label
            too, so every number token read its name twice.

            The colour row is the map editor's inspector shape, copied: a
            native swatch carrying only an `aria-label`, and the labelled
            field beside it holding the hex. The swatch is for picking and the
            field is for pasting a colour somebody was given — which this
            editor had no way to do at all (`mapEditor/MapStage`).
          */}
          <ul className={styles.tokens}>
            {tokens.map(([name, value]) =>
              isColorToken(value) ? (
                <li key={name} className={styles.token}>
                  {/*
                    THE FIELD FIRST AND THE SWATCH AFTER IT, so that every
                    field in the list starts at the same x whether or not its
                    row has a swatch. With the picker leading, the colour rows
                    were indented by its width and the number rows were not.
                  */}
                  <TextField
                    name={`token-${name}`}
                    label={name}
                    size="s"
                    className={styles.hex}
                    disabled={readOnly}
                    value={String(value)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setToken(name, event.target.value)
                    }
                  />
                  <input
                    type="color"
                    className={styles.swatch}
                    disabled={readOnly}
                    // NOT the token's own name, which the field beside it
                    // already answers to: two controls in a row with one
                    // accessible name is a reader saying "accent" twice and
                    // no way to tell which is which.
                    aria-label={`pick ${name}`}
                    // The picker shows six digits or nothing: a value it
                    // cannot parse would silently become black, so it falls
                    // back and the field beside it still holds the truth.
                    value={
                      /^#[0-9a-fA-F]{6}$/.test(String(value))
                        ? String(value)
                        : '#ffffff'
                    }
                    onChange={event => setToken(name, event.target.value)}
                  />
                </li>
              ) : (
                <li key={name} className={styles.token}>
                  <TextField
                    name={`token-${name}`}
                    label={name}
                    inputType="number"
                    size="s"
                    className={styles.number}
                    disabled={readOnly}
                    value={String(value)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setToken(name, Number(event.target.value))
                    }
                  />
                </li>
              ),
            )}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="theme-styles">
          <Typography
            id="theme-styles"
            component="h2"
            variant="subtitle2"
            className={styles.heading}
          >
            Styles
          </Typography>
          <Typography variant="body4" className={styles.note}>
            What a drawing means when it says <code>use style</code>. A field
            left alone keeps whatever the drawing had already set.
          </Typography>
          <div className={styles.styleBody}>
            <ul className={styles.styleList}>
              {allStyles.map(([name]) => (
                <li key={name}>
                  <Button
                    variant={name === chosen ? 'contained' : 'text'}
                    size="extraSmall"
                    className={styles.styleName}
                    aria-pressed={name === chosen}
                    onClick={() => setChosen(name)}
                  >
                    {name}
                  </Button>
                </li>
              ))}
            </ul>
            {chosen && (
              <div className={styles.fields}>{FIELDS.map(fieldRow)}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
