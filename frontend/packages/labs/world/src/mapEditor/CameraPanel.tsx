// The camera strip: what cameras the thing being edited has declared.
//
// The world's on a main map with nothing selected, a Viewport's with that
// placement selected, and nothing at all on a level `.map` — which is the
// plan's point made visible: a map has no cameras, a Viewport decides, and the
// world is the main Viewport (specs/SPACE_CAMERAS_PLAN.md, step 9a).
//
// READ-ONLY, deliberately. A camera is declared in blocks, so the way to add
// or change one is to open the script this lists them from — and the strip
// says so with one button rather than pretending to a surgery it cannot do
// yet (9b). Built the way the layer strip is, because it is the same shape of
// thing: a short list belonging to what is being edited.

import {Button, Typography} from '@mui/material';

import styles from './mapEditor.module.css';
import type {DeclaredCamera} from './worldCameras';

export interface CameraPanelProps {
  cameras: readonly DeclaredCamera[];
  /** Whose cameras these are, for the heading: "the world", "Minimap". */
  owner: string;
  /** Open the script they are declared in. */
  onOpen: () => void;
}

/** `Camera Follow#Follows` → `Follows`: the trait's own name, for a chip. */
const traitName = (ref: string): string => ref.split('#').pop() ?? ref;

export const CameraPanel = ({cameras, owner, onOpen}: CameraPanelProps) => (
  <div className={styles.layers} data-testid="camera-panel">
    <Typography variant="subtitle2" component="span">
      Cameras
    </Typography>
    {cameras.length === 0 ? (
      <Typography
        variant="body3"
        component="span"
        className={styles.inspectorNote}
      >
        {/* Every space has a main camera whether or not one is declared, and
            saying so here is what stops an empty list reading as "no view". */}
        Only the main camera. Declare another in the code.
      </Typography>
    ) : (
      <ul className={styles.layerList} aria-label={`Cameras of ${owner}`}>
        {cameras.map(camera => (
          <li key={camera.id} className={styles.layerRow}>
            {camera.name}
            {camera.traits.length > 0 && (
              <Typography
                variant="body3"
                component="span"
                className={styles.inspectorNote}
              >
                {' '}
                — {camera.traits.map(traitName).join(', ')}
              </Typography>
            )}
          </li>
        ))}
      </ul>
    )}
    <div className={styles.layerActions}>
      {/* "Open code" and not "Code": the placement inspector beside this
          already has a button called Code, and two buttons with one name is
          one a screen reader cannot tell apart. */}
      <Button variant="text" size="extraSmall" onClick={onOpen}>
        Open code
      </Button>
    </div>
  </div>
);

export default CameraPanel;
