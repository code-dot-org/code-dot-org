// The inspector with nothing selected, on a `.map`: the map itself.
//
// WHAT BELONGS HERE is a fact about the map that is not about where things are:
// whether it covers what is under it, what it is painted out of, and what is
// behind it. Both were
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
import type {ChangeEvent} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';

import fields from '../formFields.module.css';

import {BackgroundField} from './BackgroundField';
import styles from './mapEditor.module.css';
import type {MapSlotDoc} from './mapModel';
import {ThemeField} from './ThemeField';

export interface MapInspectorProps {
  /** Whether input stops at this map when it is loaded over another. */
  modal: boolean;
  onModal: (modal: boolean) => void;
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
  modal,
  onModal,
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
    {/*
      A SCREEN COVERS WHAT IS UNDER IT. A dialog loaded over a game takes the
      clicks, the tabbing and the typing, and a HUD does not
      (specs/MODALITY_PLAN.md). It is on the MAP rather than on the block that
      loads it because a dialog is a dialog wherever it is put on.

      Absent for a world's MAIN map, and absent by being here: that map shows
      `WorldInspector` instead, and nothing can ever be under it — a main map
      lives inside the `.world` file, so `load map` cannot name it.
    */}
    <Checkbox
      name="map-modal"
      label="Covers what is under it"
      size="s"
      checked={modal}
      disabled={isReadOnly}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onModal(event.target.checked)
      }
    />
    <Typography
      variant="body3"
      component="span"
      className={styles.inspectorNote}
    >
      A screen, not a HUD: a clock or a score bar should leave this off.
    </Typography>
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
