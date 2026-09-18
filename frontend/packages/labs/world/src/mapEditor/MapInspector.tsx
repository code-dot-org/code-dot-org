// The inspector with nothing selected, on a `.map`: the map itself.
//
// A world's main map shows the world here (`WorldInspector`); a level has no
// world of its own to show, and one thing to say that no placement can say
// for it: what the camera follows when the level is held by a Viewport
// (specs/VIEWPORT_PLAN.md, specs/RETIREMENTS_PLAN.md). The choice is one of
// the map's own placements, by id, or nothing. A map loaded into the root by
// `load map` does not steer the world's camera, which is the world's.

import {Typography} from '@mui/material';
import type {ChangeEvent} from 'react';

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';

import styles from './mapEditor.module.css';

export interface MapInspectorProps {
  /** The placement the camera follows, by id; absent, nothing. */
  follows: string | undefined;
  /** The map's placements, by id, in document order. */
  placements: readonly string[];
  onFollow: (id: string | undefined) => void;
  isReadOnly: boolean;
}

export const MapInspector = ({
  follows,
  placements,
  onFollow,
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
  </div>
);

export default MapInspector;
