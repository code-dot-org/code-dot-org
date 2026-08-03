// The map, opened from a `create actor in map` block.
//
// The same canvas the `.map` file editor uses (`MapStage`), scoped to one actor
// type: no palette, because the block's dropdown already said which actor these
// are, and the rest of the world drawn behind them but not selectable — you are
// arranging coins IN a world, and a coin's place is meaningless without the
// ground under it (MAPS.md §4).
//
// One control the file editor does not need: a toggle between adding and
// editing. The palette is what switches those there, and there is no palette
// here. It opens in select mode, because opening an arrangement you already
// made to move one thing is the commoner errand.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import {
  asMapActors,
  asPlacements,
  type MapPlacement,
} from '../blockly/mapPlacements';
import {translate} from '../effect/localization';
import type {ActorSchema} from '../runtime/messages';

import {DEFAULT_TILE, type MapDoc, type Placement} from './mapModel';
import styles from './mapPlacementsDialog.module.css';
import {MapStage} from './MapStage';

export interface MapPlacementsDialogProps {
  /** What to call the actor being arranged. */
  name: string;
  /** Its type — what a placed one carries, and how its drawing is looked up. */
  type: string;
  /** What the block has now. */
  placements: readonly MapPlacement[];
  /** The rest of the world: drawn, never selectable. */
  context: readonly Placement[];
  thumbnails: Record<string, string>;
  schemas: Record<string, ActorSchema>;
  /** Keep these — the block takes them. */
  onDone: (placements: MapPlacement[]) => void;
  /** Leave it as it was. */
  onCancel: () => void;
}

export const MapPlacementsDialog = ({
  name,
  type,
  placements,
  context,
  thumbnails,
  schemas,
  onDone,
  onCancel,
}: MapPlacementsDialogProps) => {
  const [doc, setDoc] = useState<MapDoc>(() => ({
    type: 'map',
    tile: {width: DEFAULT_TILE, height: DEFAULT_TILE},
    actors: asMapActors(placements, type),
  }));
  const [adding, setAdding] = useState(false);

  return (
    <Dialog
      role="dialog"
      title={translate('Arrange {name}', {name})}
      description={translate(
        'Add, move and remove these actors. Everything else is drawn for ' +
          'reference and cannot be selected.',
      )}
      onClose={onCancel}
      closeLabel={translate('Close')}
      primaryButtonProps={{
        children: translate('Done'),
        onClick: () => onDone(asPlacements(doc.actors)),
      }}
      secondaryButtonProps={{
        children: translate('Cancel'),
        onClick: onCancel,
      }}
      customContent={
        <div className={styles.body}>
          <div className={styles.modeBar}>
            <Button
              variant={adding ? 'contained' : 'outlined'}
              size="small"
              aria-pressed={adding}
              onClick={() => setAdding(value => !value)}
            >
              {adding
                ? translate('Stop adding')
                : translate('Add {name}', {name})}
            </Button>
            <Typography variant="body3">
              {adding
                ? translate(
                    'Click the map to add one. Hold Alt to place freely.',
                  )
                : translate(
                    '{n} placed. Click one to move or edit it; Delete removes it.',
                    {n: String(doc.actors.length)},
                  )}
            </Typography>
          </div>
          <div className={styles.stageBox}>
            <MapStage
              doc={doc}
              onDocChange={setDoc}
              context={context}
              placing={adding ? type : null}
              thumbnails={thumbnails}
              schemas={schemas}
              isReadOnly={false}
            />
          </div>
        </div>
      }
    />
  );
};

export default MapPlacementsDialog;
