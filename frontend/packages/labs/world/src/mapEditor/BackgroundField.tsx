// A background image, as the map editor sets one: which of the project's
// backgrounds, stretched over the map or tiled across it, and slid by an
// offset (specs/LAYERS_PLAN.md, specs/BACKGROUNDS.md).
//
// The same fields wherever a background is set: in a layer's inspector, and
// in the map's own with nothing selected, where it is the background of the
// layer at the back — the one `set background to` sets — so that a map has
// a background without the Layers panel having to be found first.

import {Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent} from 'react';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';

import {requestAppearanceImport} from '../appearance/appearanceImport';
import fields from '../formFields.module.css';

import styles from './mapEditor.module.css';
import type {MapSlotDoc} from './mapModel';

/**
 * The dropdown row that opens the backdrop library. A value no file name
 * would be, since a file name is what every other row holds.
 */
export const IMPORT_SLOT = '__import__';

export interface BackgroundFieldProps {
  /** What the fields are named after: `layer-background`, `map-background`. */
  name: string;
  /** The background as the map says it, or nothing. */
  slot: MapSlotDoc | undefined;
  /** The project's backgrounds, by file name. */
  backgrounds: readonly string[];
  onChange: (change: Partial<MapSlotDoc>) => void;
  isReadOnly: boolean;
}

const asNumber = (text: string, fallback: number): number => {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) ? value : fallback;
};

/**
 * The fields. What is being typed into the offset is held here and
 * committed on blur or Enter; the caller re-keys this when the background
 * changes from outside.
 */
export const BackgroundField = ({
  name,
  slot,
  backgrounds,
  onChange,
  isReadOnly,
}: BackgroundFieldProps) => {
  const [offset, setOffset] = useState({
    x: String(slot?.offset?.x ?? 0),
    y: String(slot?.offset?.y ?? 0),
  });
  const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };
  const commitOffset = () =>
    onChange({
      offset: {x: asNumber(offset.x, 0), y: asNumber(offset.y, 0)},
    });
  return (
    <div className={styles.inspectorGroup}>
      <SimpleDropdown
        name={name}
        labelText="Background"
        size="s"
        className={styles.inspectorDropdown}
        disabled={isReadOnly}
        selectedValue={slot?.sprite ?? ''}
        items={[
          {value: '', text: '(none)'},
          ...backgrounds.map(file => ({value: file, text: file})),
          // …and the way to one the project has not got. Without it the map
          // editor could set a background to any backdrop already in the
          // project and never bring one in, where the block that does the
          // same has offered it all along (specs/LOOK_PLAN.md).
          {value: IMPORT_SLOT, text: '(import…)'},
        ]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const chosen = event.target.value;
          if (chosen !== IMPORT_SLOT) {
            onChange({sprite: chosen});
            return;
          }
          // Asked of the lab, as every other import is; the dropdown goes
          // back to what the map says until something comes back
          // (`appearance/appearanceImport`).
          void requestAppearanceImport('background').then(file => {
            if (file) {
              onChange({sprite: file});
            }
          });
        }}
      />
      <Checkbox
        name={`${name}-tiled`}
        label="Tiled"
        checked={Boolean(slot?.repeat)}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange({repeat: event.target.checked})
        }
      />
      <div className={styles.inspectorGrid}>
        {(['x', 'y'] as const).map(axis => (
          <TextField
            key={axis}
            name={`${name}-${axis}`}
            label={`Slide ${axis.toUpperCase()}`}
            inputType="number"
            size="s"
            value={offset[axis]}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setOffset(held => ({...held, [axis]: event.target.value}))
            }
            onBlur={commitOffset}
            onKeyDown={blurOnEnter}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundField;

export interface BackgroundColorFieldProps {
  /** The `#rrggbb` the world sets, or nothing for the engine's own. */
  color: string | undefined;
  /** What shows when the world sets none: the engine's own color. */
  fallback: string;
  /** The world sets it to more than a swatch, which a field cannot show. */
  inCode: boolean;
  onChange: (color: string) => void;
  isReadOnly: boolean;
}

/** A full six-digit hex, which is all the browser's picker can show. */
const HEX = /^#[0-9a-f]{6}$/i;

/**
 * The color behind the background image, and behind everything where there
 * is none: the world's `set background color` row.
 *
 * NOT A DESIGN-SYSTEM COMPONENT, because there is not one: the library has
 * no color input. So it is the inspector's color row — a field for a hex
 * somebody was given, and the browser's swatch beside it for picking — as a
 * color property's is (`MapStage`).
 */
export const BackgroundColorField = ({
  color,
  fallback,
  inCode,
  onChange,
  isReadOnly,
}: BackgroundColorFieldProps) => {
  const [typed, setTyped] = useState(color ?? fallback);
  const commit = (next: string) => {
    if (HEX.test(next) && next.toLowerCase() !== (color ?? '').toLowerCase()) {
      onChange(next.toLowerCase());
    }
  };
  if (inCode) {
    return (
      <Typography
        variant="body3"
        component="span"
        className={styles.inspectorNote}
      >
        The background color is worked out in the code, so it is changed there.
      </Typography>
    );
  }
  return (
    <div className={styles.inspectorColor}>
      <TextField
        name="world-background-color"
        label="Background color"
        size="s"
        value={typed}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setTyped(event.target.value)
        }
        onBlur={() => commit(typed.trim())}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            (event.target as HTMLInputElement).blur();
          }
        }}
      />
      <input
        type="color"
        className={fields.swatch}
        name="world-background-color-swatch"
        aria-label="pick background color"
        value={HEX.test(typed) ? typed : fallback}
        disabled={isReadOnly}
        onChange={event => {
          setTyped(event.target.value);
          commit(event.target.value);
        }}
      />
    </div>
  );
};
