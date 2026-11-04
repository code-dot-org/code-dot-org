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

import {BackgroundColorField, BackgroundField} from './BackgroundField';
import {IconAction} from './IconAction';
import styles from './mapEditor.module.css';
import type {MapSlotDoc} from './mapModel';
import {ThemeField} from './ThemeField';

export interface MapInspectorProps {
  /** What the head says: `Map`, or `Screen` for a screen the game shows. */
  title?: string;
  /** The color behind the map's placements; absent shows what is under it. */
  backgroundColor?: string;
  onBackgroundColor?: (color: string | undefined) => void;
  /** The theme everything this map places is painted out of; absent inherits. */
  theme: string | undefined;
  /** The project's themes, as `[label, path]`. */
  themeOptions: ReadonlyArray<readonly [string, string]>;
  onTheme: (path: string | undefined) => void;
  /**
   * The background image of the map's back layer, the one `set background
   * to` sets.
   */
  background?: MapSlotDoc;
  /** The project's backgrounds, by file name. */
  backgrounds?: readonly string[];
  onBackground?: (change: Partial<MapSlotDoc>) => void;
  isReadOnly: boolean;
  /** Folds it down to its head, uncovering the map (`MapStage`). */
  onFold?: () => void;
}

export const MapInspector = ({
  title = 'Map',
  backgroundColor,
  onBackgroundColor,
  theme,
  themeOptions,
  onTheme,
  background,
  backgrounds = [],
  onBackground,
  isReadOnly,
  onFold,
}: MapInspectorProps) => (
  <div
    className={`${styles.inspector} ${fields.narrow}`}
    data-testid="map-inspector"
  >
    <div className={styles.inspectorHead}>
      <Typography variant="subtitle2" component="span">
        {title}
      </Typography>
      {onFold && (
        <IconAction
          label={`Hide ${title} properties`}
          icon="chevron-down"
          aria-expanded
          onClick={onFold}
        />
      )}
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
    {onBackgroundColor && (
      <BackgroundColorField
        key={backgroundColor ?? ''}
        name="map-background-color"
        color={backgroundColor}
        fallback="#000000"
        inCode={false}
        onChange={onBackgroundColor}
        onClear={() => onBackgroundColor(undefined)}
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
