// The inspector with nothing selected, on a `.map`: the map itself.
//
// WHAT BELONGS HERE is a fact about the map that is not about where things
// are — which of its placements the camera follows, whether it covers what is
// under it, and what it is painted out of. The last two were in the palette
// strip along the top, beside the width and the height, which is where the
// tools for arranging a map are and not where its properties are.
//
// A world's main map shows the world here (`WorldInspector`); a level has no
// world of its own to show, and one thing to say that no placement can say
// for it: what the camera follows when the level is held by a Viewport
// (specs/VIEWPORT_PLAN.md, specs/RETIREMENTS_PLAN.md). The choice is one of
// the map's own placements, by id, or nothing. A map loaded into the root by
// `load map` does not steer the world's camera, which is the world's.

import {Typography} from '@mui/material';
import type {ChangeEvent} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';

import styles from './mapEditor.module.css';
import {ThemeField} from './ThemeField';

export interface MapInspectorProps {
  /** The placement the camera follows, by id; absent, nothing. */
  follows: string | undefined;
  /** The map's placements, by id, in document order. */
  placements: readonly string[];
  onFollow: (id: string | undefined) => void;
  /** Whether input stops at this map when it is loaded over another. */
  modal: boolean;
  onModal: (modal: boolean) => void;
  /** The theme everything this map places is painted out of; absent inherits. */
  theme: string | undefined;
  /** The project's themes, as `[label, path]`. */
  themeOptions: ReadonlyArray<readonly [string, string]>;
  onTheme: (path: string | undefined) => void;
  isReadOnly: boolean;
}

export const MapInspector = ({
  follows,
  placements,
  onFollow,
  modal,
  onModal,
  theme,
  themeOptions,
  onTheme,
  isReadOnly,
}: MapInspectorProps) => (
  <div className={styles.inspector} data-testid="map-inspector">
    <div className={styles.inspectorHead}>
      <Typography variant="subtitle2" component="span">
        Map
      </Typography>
    </div>
    <SimpleDropdown
      name="map-camera-follows"
      labelText="Camera follows"
      size="s"
      className={styles.inspectorDropdown}
      disabled={isReadOnly}
      selectedValue={follows ?? ''}
      items={[
        {value: '', text: '(nothing)'},
        ...placements.map(id => ({value: id, text: id})),
      ]}
      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
        onFollow(event.target.value || undefined)
      }
    />
    <Typography
      variant="body3"
      component="span"
      className={styles.inspectorNote}
    >
      Used when a Viewport holds this map.
    </Typography>
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
    <ThemeField
      value={theme}
      options={themeOptions}
      onChange={onTheme}
      isReadOnly={isReadOnly}
    />
  </div>
);

export default MapInspector;
