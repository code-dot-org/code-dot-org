// A background image, as the map editor sets one: which of the project's
// backgrounds, stretched over the map or tiled across it, and slid by an
// offset (specs/LAYERS_PLAN.md, specs/BACKGROUNDS.md).
//
// The same fields wherever a background is set: in a layer's inspector, and
// in the map's own with nothing selected, where it is the background of the
// layer at the back — the one `set background to` sets — so that a map has
// a background without the Layers panel having to be found first.
//
// AND THE WAY TO THE BACKGROUNDS THEMSELVES, where one is chosen
// (specs/SHELL_FINISH_PLAN.md, step 4): Edit opens the chosen one in the
// image editor, a step on the trail, and a menu makes, uploads, draws,
// renames and deletes them, through the file menus (`files/fileActs`).

import {Button, ListItemText, Menu, MenuItem, Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent} from 'react';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';

import {requestAppearanceImport} from '../appearance/appearanceImport';
import {BACKGROUNDS_FOLDER} from '../appearance/backgroundsFolder';
import {label} from '../blockly/label';
import {requestFileAct} from '../files/fileActs';
import fields from '../formFields.module.css';

import styles from './mapEditor.module.css';
import type {MapSlotDoc} from './mapModel';
import {useAfterImport} from './useAfterImport';

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

/** Where a background of this file name is in the project. */
const pathOf = (file: string) => `${BACKGROUNDS_FOLDER}/${file}`;

/** `darkCave.png` → `Dark Cave`, as the file menus name it. */
const nameOf = (file: string) => label(file.replace(/\.[^.]+$/, ''));

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
  // A background imported, made or drawn here is the one this then shows:
  // taken in the render whose project has it, and one made to be drawn on
  // is then opened, on the render after (`useAfterImport`, `fileActs`).
  const importThen = useAfterImport<{open: boolean} | undefined>(
    backgrounds,
    (file, then) => {
      onChange({sprite: file});
      if (then?.open) {
        void requestFileAct({act: 'open', path: pathOf(file)});
      }
    },
  );
  const [menuAt, setMenuAt] = useState<HTMLElement | null>(null);
  const chosen = slot?.sprite && backgrounds.includes(slot.sprite);
  const act = (then: () => void) => () => {
    setMenuAt(null);
    then();
  };
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
          // back to what the map says until the file is in the project
          // (`appearance/appearanceImport`, `useAfterImport`).
          importThen(() => requestAppearanceImport('background'), undefined);
        }}
      />
      <div className={styles.layerActions}>
        {chosen && (
          <Button
            variant="text"
            size="extraSmall"
            startIcon={
              <FontAwesomeV6Icon iconName="pen-to-square" iconStyle="solid" />
            }
            onClick={() =>
              void requestFileAct({act: 'open', path: pathOf(slot.sprite!)})
            }
          >
            Edit background
          </Button>
        )}
        {!isReadOnly && (
          <Button
            variant="text"
            size="extraSmall"
            aria-haspopup="menu"
            aria-expanded={menuAt !== null}
            endIcon={
              <FontAwesomeV6Icon iconName="chevron-down" iconStyle="solid" />
            }
            onClick={event => setMenuAt(event.currentTarget)}
          >
            Backgrounds
          </Button>
        )}
        {menuAt && (
          <Menu open anchorEl={menuAt} onClose={() => setMenuAt(null)}>
            <MenuItem
              onClick={act(() =>
                importThen(
                  () =>
                    requestFileAct({
                      act: 'make',
                      folder: BACKGROUNDS_FOLDER,
                      open: false,
                      answer: 'name',
                    }),
                  {open: true},
                ),
              )}
            >
              <ListItemText>New background…</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={act(
                () =>
                  void requestFileAct({
                    act: 'upload',
                    folder: BACKGROUNDS_FOLDER,
                  }),
              )}
            >
              <ListItemText>Upload a background…</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={act(() =>
                importThen(
                  () =>
                    requestFileAct({
                      act: 'draw',
                      folder: BACKGROUNDS_FOLDER,
                      answer: 'name',
                    }),
                  undefined,
                ),
              )}
            >
              <ListItemText>Draw a background with AI…</ListItemText>
            </MenuItem>
            {chosen && (
              <MenuItem
                onClick={act(
                  () =>
                    void requestFileAct({
                      act: 'rename',
                      path: pathOf(slot.sprite!),
                    }),
                )}
              >
                <ListItemText>Rename {nameOf(slot.sprite!)}…</ListItemText>
              </MenuItem>
            )}
            {chosen && (
              <MenuItem
                onClick={act(
                  () =>
                    void requestFileAct({
                      act: 'clone',
                      path: pathOf(slot.sprite!),
                    }),
                )}
              >
                <ListItemText>Clone {nameOf(slot.sprite!)}…</ListItemText>
              </MenuItem>
            )}
            {chosen && (
              <MenuItem
                onClick={act(
                  () =>
                    void requestFileAct({
                      act: 'delete',
                      path: pathOf(slot.sprite!),
                    }),
                )}
              >
                <ListItemText>Delete {nameOf(slot.sprite!)}…</ListItemText>
              </MenuItem>
            )}
          </Menu>
        )}
      </div>
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
