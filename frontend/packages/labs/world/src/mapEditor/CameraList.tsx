// A selected Viewport's cameras, as a section of its inspector
// (SIMPLE_INTERFACE.md, "Cameras"; specs/SHELL_FINISH_PLAN.md, step 3).
//
// The main camera is listed first, because every Viewport has one, and it is
// the one looked through unless told otherwise. A row opens that camera in
// its own inspector (`CameraInspector`), which is where it is named, given
// traits, told what to follow, and removed.
//
// It was a strip on the stage behind a toolbar button, apart from the thing
// whose cameras it listed; selecting the Viewport and then finding the strip
// was two errands for one.

import {Button, Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './mapEditor.module.css';
import {MAIN_CAMERA} from './worldCameraCode';

/** What makes the list an editor, for cameras made here. */
export interface CameraListEdits {
  /** The camera the owner starts looking through, `MAIN_CAMERA` by default. */
  starting: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  isReadOnly: boolean;
}

/** A camera as a row names it. */
export interface ListedCamera {
  id: string;
  name: string;
}

export interface CameraListProps {
  cameras: readonly ListedCamera[];
  /** Whose cameras these are, for the list's name: "Minimap". */
  owner: string;
  edits: CameraListEdits;
}

export const CameraList = ({cameras, owner, edits}: CameraListProps) => {
  const rows = [{id: MAIN_CAMERA, name: 'Main camera'}, ...cameras];
  return (
    <section
      className={styles.cameraList}
      aria-label="Cameras"
      data-testid="camera-list"
    >
      <Typography variant="body2" component="h3">
        Cameras
      </Typography>
      <ul className={styles.layerList} aria-label={`Cameras of ${owner}`}>
        {rows.map(camera => (
          <li key={camera.id}>
            <button
              type="button"
              className={styles.layerRow}
              onClick={() => edits.onSelect(camera.id)}
            >
              {camera.name}
              {camera.id === edits.starting && (
                <span className={styles.recordKind}>at the start</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.layerActions}>
        {!edits.isReadOnly && (
          <Button
            variant="text"
            size="extraSmall"
            startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
            onClick={edits.onAdd}
          >
            Add a camera
          </Button>
        )}
      </div>
    </section>
  );
};

export default CameraList;
