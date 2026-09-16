// Choosing a stock map to copy into the project.
//
// `ImportActorDialog`'s sibling, smaller: a map is an arrangement, and what
// there is to show is its name and what it brings. The tiles share the actor
// dialog's styles, so the two pickers read as one shelf.

import {Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import styles from '../actors/importActorDialog.module.css';
import {stockActorById} from '../actors/stock';

import {STOCK_MAPS, type StockMap} from './stock';

export interface ImportMapDialogProps {
  onImport: (map: StockMap) => void;
  onCancel: () => void;
}

/** What the map places, by the actors' own names. */
const brings = (map: StockMap): string[] =>
  map.actors.map(id => stockActorById(id)?.name ?? id);

export const ImportMapDialog = ({onImport, onCancel}: ImportMapDialogProps) => {
  const [chosen, setChosen] = useState<StockMap | null>(null);
  return (
    <Dialog
      role="dialog"
      title="Add a map"
      description="Pick an arrangement to copy into your project, with the actors it places. Load it from a world, and open it in the map editor to move things."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Import',
        disabled: chosen === null,
        onClick: () => chosen && onImport(chosen),
      }}
      secondaryButtonProps={{children: 'Cancel', onClick: onCancel}}
      customContent={
        <div className={styles.body}>
          <ul className={styles.grid}>
            {STOCK_MAPS.map(map => {
              const picked = chosen?.id === map.id;
              return (
                <li key={map.id} className={styles.holder}>
                  <button
                    type="button"
                    className={
                      picked
                        ? `${styles.tile} ${styles.tileChosen}`
                        : styles.tile
                    }
                    aria-pressed={picked}
                    aria-label={map.name}
                    onClick={() => setChosen(map)}
                    onDoubleClick={() => onImport(map)}
                  >
                    <Typography
                      component="span"
                      variant="label2"
                      color="inherit"
                      className={styles.name}
                    >
                      {map.name}
                    </Typography>
                  </button>
                </li>
              );
            })}
          </ul>
          {chosen && (
            <div className={styles.detail}>
              <Typography variant="body3">{chosen.description}</Typography>
              <Typography variant="body4">
                {`Brings: ${brings(chosen).join(', ')}`}
              </Typography>
            </div>
          )}
        </div>
      }
    />
  );
};
