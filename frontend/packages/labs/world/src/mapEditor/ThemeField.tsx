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

import type {ChangeEvent} from 'react';

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';

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
  const importThen = useAfterImport(
    options.map(([, path]) => path),
    path => onChange(path),
  );
  return (
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
  );
};

export default ThemeField;
