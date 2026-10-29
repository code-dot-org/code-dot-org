// The inspector with nothing selected, on a `.map`: the map itself.
//
// WHAT BELONGS HERE is a fact about the map that is not about where things are:
// what it is painted out of, and what is behind it. Both were
// in the palette strip along the top, beside the width and the height, which is
// where the tools for arranging a map are and not where its properties are.
//
// WHAT NO LONGER BELONGS HERE is "Camera follows". A map is data — it says where
// things are and nothing about how the view onto it behaves — so where the view
// looks moved to the thing that decides it: a Viewport, the world being the main
// one (specs/SPACE_CAMERAS_PLAN.md). A level in a hundred-level game should not
// have to configure a camera, which is the argument that took a map's own events
// off it too (specs/MAP_EVENTS_PLAN.md).
//
// A world's main map shows the world here (`WorldInspector`) instead.

import {Typography} from '@mui/material';

import fields from '../formFields.module.css';

import {BackgroundField} from './BackgroundField';
import styles from './mapEditor.module.css';
import type {MapSlotDoc} from './mapModel';
import {ThemeField} from './ThemeField';

export interface MapInspectorProps {
  /** The theme everything this map places is painted out of; absent inherits. */
  theme: string | undefined;
  /** The project's themes, as `[label, path]`. */
  themeOptions: ReadonlyArray<readonly [string, string]>;
  onTheme: (path: string | undefined) => void;
  /**
   * The background image of the map's back layer, the one `set background
   * to` sets. A map has no background COLOR of its own: that is the world's.
   */
  background?: MapSlotDoc;
  /** The project's backgrounds, by file name. */
  backgrounds?: readonly string[];
  onBackground?: (change: Partial<MapSlotDoc>) => void;
  isReadOnly: boolean;
}

export const MapInspector = ({
  theme,
  themeOptions,
  onTheme,
  background,
  backgrounds = [],
  onBackground,
  isReadOnly,
}: MapInspectorProps) => (
  <div
    className={`${styles.inspector} ${fields.narrow}`}
    data-testid="map-inspector"
  >
    <div className={styles.inspectorHead}>
      <Typography variant="subtitle2" component="span">
        Map
      </Typography>
    </div>
    {onBackground && (
      <BackgroundField
        key={JSON.stringify(background ?? null)}
        name="map-background"
        slot={background}
        backgrounds={backgrounds}
        onChange={onBackground}
        isReadOnly={isReadOnly}
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

export default MapInspector;
