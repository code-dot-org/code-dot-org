// What a map is painted out of: the theme, in the inspector.
//
// One component because two inspectors ask it — a `.map`'s (`MapInspector`)
// and a world's main map's (`WorldInspector`) — and the question is the same
// one in both. A drawing names a CLASS and never a file (specs/STYLES_PLAN.md);
// this says which file, for everything the map places.
//
// It was a bare `<select>` in the palette strip along the top, beside the width
// and the height. It is a property of the map and not a tool for arranging one,
// so it lives where a reader looks for properties.
//
// With the way to the themes themselves (specs/SHELL_FINISH_PLAN.md, step
// 4): Edit opens the chosen one in the theme editor, a step on the trail,
// and a Themes menu makes one, which the map then takes, and renames,
// clones and deletes the chosen one (`files/fileActs`).

import {Button, ListItemText, Menu, MenuItem} from '@mui/material';
import type {ChangeEvent} from 'react';
import {useState} from 'react';

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {requestFileAct} from '../files/fileActs';
import {IMPORT_STYLE_VALUE, requestStyleImport} from '../styles/styleImport';

import styles from './mapEditor.module.css';
import {useAfterImport} from './useAfterImport';

export interface ThemeFieldProps {
  /** The theme's module path; empty or absent inherits. */
  value: string | undefined;
  /** The project's themes, as `[label, path]`. */
  options: ReadonlyArray<readonly [string, string]>;
  /** Called with the chosen path, or undefined for "inherit". */
  onChange: (path: string | undefined) => void;
  /**
   * What the empty choice is called: a map's inherits the world's, and the
   * world's is no theme at all, there being nothing above it.
   */
  emptyLabel?: string;
  isReadOnly: boolean;
}

export const ThemeField = ({
  value,
  options,
  onChange,
  emptyLabel = '(the world’s)',
  isReadOnly,
}: ThemeFieldProps) => {
  // A theme imported or made here is the one the map then takes, in the
  // render whose project has it; one made here is then opened, to be
  // drawn in (`useAfterImport`, `fileActs`).
  const importThen = useAfterImport<{open: boolean} | undefined>(
    options.map(([, path]) => path),
    (path, then) => {
      onChange(path);
      if (then?.open) {
        void requestFileAct({act: 'open', path: `${path}.style`});
      }
    },
  );
  const chosenName = options.find(([, path]) => path === value)?.[0];
  const chosen = Boolean(value && chosenName);
  const [menuAt, setMenuAt] = useState<HTMLElement | null>(null);
  const act = (then: () => void) => () => {
    setMenuAt(null);
    then();
  };
  return (
    <div className={styles.themeField}>
      <SimpleDropdown
        name="map-theme"
        labelText="Theme"
        size="s"
        className={styles.inspectorDropdown}
        disabled={isReadOnly}
        selectedValue={value ?? ''}
        items={[
          // Empty is INHERIT, not "none": a map that says nothing takes the
          // world's, as a placement that says nothing takes its map's.
          {value: '', text: emptyLabel},
          ...options.map(([label, path]) => ({value: path, text: label})),
          // …and a way in, because a project starts with no themes and a menu
          // whose only row is "the world's" is a dead end that says nothing
          // about where a theme comes from. The same seam the `use theme`
          // block's `(import…)` uses, and the one a placement's Theme field
          // uses.
          {value: IMPORT_STYLE_VALUE, text: '(import…)'},
        ]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          if (event.target.value === IMPORT_STYLE_VALUE) {
            // The import writes the file and answers its path, and the map
            // takes it once the file is in the project — so picking a theme
            // and fetching one are one gesture (`useAfterImport`).
            importThen(requestStyleImport, undefined);
            return;
          }
          onChange(event.target.value || undefined);
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
              void requestFileAct({act: 'open', path: `${value}.style`})
            }
          >
            Edit theme
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
            Themes
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
                      folder: 'styles',
                      open: false,
                      answer: 'name',
                    }).then(
                      made => made && `styles/${made.replace(/\.style$/, '')}`,
                    ),
                  {open: true},
                ),
              )}
            >
              <ListItemText>New theme…</ListItemText>
            </MenuItem>
            {chosen &&
              (['rename', 'clone', 'delete'] as const).map(verb => (
                <MenuItem
                  key={verb}
                  onClick={act(
                    () =>
                      void requestFileAct({act: verb, path: `${value}.style`}),
                  )}
                >
                  <ListItemText>
                    {`${verb[0].toUpperCase()}${verb.slice(1)} ${chosenName}…`}
                  </ListItemText>
                </MenuItem>
              ))}
          </Menu>
        )}
      </div>
    </div>
  );
};

export default ThemeField;
