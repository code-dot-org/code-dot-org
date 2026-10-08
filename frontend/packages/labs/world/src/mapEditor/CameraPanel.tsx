// The camera strip: what cameras the thing being edited has declared.
//
// The world's on a main map with nothing selected, a Viewport's with that
// placement selected, and nothing at all on a level `.map` — which is the
// plan's point made visible: a map has no cameras, a Viewport decides, and the
// world is the main Viewport (specs/SPACE_CAMERAS_PLAN.md, step 9a).
//
// THE WORLD'S ARE EDITED HERE (9b): added, removed, and opened in a camera's
// inspector by clicking one, which is where it is named, given traits and
// told what to follow (`CameraInspector`, `worldCameraEdits`). Its main
// camera is listed first, because every world has one and it is the one the
// world looks through unless told otherwise. A Viewport's stay read-only,
// declared in its placement's code, and the strip says so with one button.
// Built the way the layer strip is, because it is the same shape of thing: a
// short list belonging to what is being edited.

import {Button, Typography} from '@mui/material';

import {IconAction} from './IconAction';
import styles from './mapEditor.module.css';
import {MAIN_CAMERA} from './worldCameraEdits';
import type {DeclaredCamera} from './worldCameras';

/** What makes the strip an editor, for the world's own cameras. */
export interface CameraStripEdits {
  /** The camera open in the inspector, if one is. */
  selected: string | null;
  /** The camera the world starts looking through, `MAIN_CAMERA` by default. */
  starting: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  isReadOnly: boolean;
}

export interface CameraPanelProps {
  cameras: readonly DeclaredCamera[];
  /** Whose cameras these are, for the heading: "the world", "Minimap". */
  owner: string;
  /** Open the script they are declared in, where they are written. */
  onOpen?: () => void;
  /** Present for the world's, which are edited here. */
  edits?: CameraStripEdits;
}

/** `Camera Follow#Follows` → `Follows`: the trait's own name, for a chip. */
const traitName = (ref: string): string =>
  (ref.split('#').pop() ?? ref).replace(/Trait$/, '');

export const CameraPanel = ({
  cameras,
  owner,
  onOpen,
  edits,
}: CameraPanelProps) => {
  const rows = edits
    ? [{id: MAIN_CAMERA, name: 'Main camera', traits: []}, ...cameras]
    : cameras;
  return (
    <div className={styles.layers} data-testid="camera-panel">
      <Typography variant="subtitle2" component="span">
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
                  aria-pressed={camera.id === edits.selected}
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
        </ul>
      )}
      <div className={styles.layerActions}>
        {edits && (
          <>
            <IconAction
              label="Add camera"
              icon="plus"
              onClick={edits.onAdd}
              disabled={edits.isReadOnly}
            />
            <IconAction
              label="Remove camera"
              icon="trash"
              onClick={() => edits.selected && edits.onRemove(edits.selected)}
              // The main camera cannot go: every world has one.
              disabled={
                edits.isReadOnly ||
                !edits.selected ||
                edits.selected === MAIN_CAMERA
              }
            />
          </>
        )}
        {onOpen && !edits && (
          // "Open code" and not "Code": the placement inspector beside this
          // already has a button called Code, and two buttons with one name
          // is one a screen reader cannot tell apart.
          <Button variant="text" size="extraSmall" onClick={onOpen}>
            Open code
          </Button>
        )}
      </div>
    </div>
  );
};

export default CameraPanel;
