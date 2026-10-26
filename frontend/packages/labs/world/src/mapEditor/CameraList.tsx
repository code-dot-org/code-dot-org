// The cameras of what is being inspected, as a section of its inspector:
// a selected Viewport's, or the world's on a project still shaped as a world
// (SIMPLE_INTERFACE.md, "Cameras"; specs/SHELL_FINISH_PLAN.md, step 3).
//
// The main camera is listed first, because every Viewport and every world
// has one, and it is the one looked through unless told otherwise. A row
// opens that camera in its own inspector (`CameraInspector`), which is where
// it is named, given traits, told what to follow, and removed. Cameras
// declared in code beside the ones made here are listed and marked, and are
// changed only in the code.
//
// It was a strip on the stage behind a toolbar button, apart from the thing
// whose cameras it listed; selecting the Viewport and then finding the strip
// was two errands for one.

import {Button, Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './mapEditor.module.css';
import {MAIN_CAMERA} from './worldCameraCode';
import type {DeclaredCamera} from './worldCameras';

/** What makes the list an editor, for cameras made here. */
export interface CameraListEdits {
  /** The camera the owner starts looking through, `MAIN_CAMERA` by default. */
  starting: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  isReadOnly: boolean;
}

export interface CameraListProps {
  cameras: readonly DeclaredCamera[];
  /** Whose cameras these are, for the list's name: "the world", "Minimap". */
  owner: string;
  /** Open the script they are declared in, where they are written. */
  onOpen?: () => void;
  /** Present for the cameras edited here. */
  edits?: CameraListEdits;
  /**
   * Cameras declared in code beside the ones edited here — a Viewport's
   * written in its placement's code — listed, and changed only there.
   */
  inCode?: readonly DeclaredCamera[];
}

/** `Camera Follow#Follows` → `Follows`: the trait's own name, for a row. */
const traitName = (ref: string): string =>
  (ref.split('#').pop() ?? ref).replace(/Trait$/, '');

export const CameraList = ({
  cameras,
  owner,
  onOpen,
  edits,
  inCode = [],
}: CameraListProps) => {
  const rows = edits
    ? [{id: MAIN_CAMERA, name: 'Main camera', traits: []}, ...cameras]
    : cameras;
  return (
    <section
      className={styles.cameraList}
      aria-label="Cameras"
      data-testid="camera-list"
    >
      <Typography variant="body2" component="h3">
        Cameras
      </Typography>
      {rows.length === 0 ? (
        <Typography
          variant="body3"
          component="span"
          className={styles.inspectorNote}
        >
          {/* Every space has a main camera whether or not one is declared,
              and saying so here is what stops an empty list reading as "no
              view". */}
          Only the main camera. Declare another in the code.
        </Typography>
      ) : (
        <ul className={styles.layerList} aria-label={`Cameras of ${owner}`}>
          {rows.map(camera => (
            <li key={camera.id}>
              {edits ? (
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
              ) : (
                <span className={styles.layerRow}>
                  {camera.name}
                  {camera.traits.length > 0 && (
                    <span className={styles.recordKind}>
                      {camera.traits.map(traitName).join(', ')}
                    </span>
                  )}
                </span>
              )}
            </li>
          ))}
          {edits &&
            inCode.map(camera => (
              <li key={camera.id}>
                <span className={styles.layerRow}>
                  {camera.name}
                  <span className={styles.recordKind}>in code</span>
                </span>
              </li>
            ))}
        </ul>
      )}
      <div className={styles.layerActions}>
        {edits && !edits.isReadOnly && (
          <Button
            variant="text"
            size="extraSmall"
            startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
            onClick={edits.onAdd}
          >
            Add a camera
          </Button>
        )}
        {onOpen && (!edits || inCode.length > 0) && (
          // "Open code" and not "Code": the placement inspector this sits in
          // already has a button called Code, and two buttons with one name
          // is one a screen reader cannot tell apart.
          <Button variant="text" size="extraSmall" onClick={onOpen}>
            Open code
          </Button>
        )}
      </div>
    </section>
  );
};

export default CameraList;
