// Choosing a stock screen to copy into the project.
//
// `ImportActorDialog`'s sibling, smaller: a screen is an arrangement, and what
// there is to show is its name and what it brings. The tiles share the actor
// dialog's styles, so the two pickers read as one shelf
// (specs/SCREEN_STACK_PLAN.md, step 7).

import {Typography} from '@mui/material';
import {useState} from 'react';

import {MuiDialog as Dialog} from '@code-dot-org/component-library/dialog';

import styles from '../actors/importActorDialog.module.css';
import {stockActorById} from '../actors/stock';

import {STOCK_MAPS, type StockMap} from './stock';

export interface ImportScreenDialogProps {
  onImport: (screen: StockMap) => void;
  onCancel: () => void;
}

/** What the screen places, by the actors' own names. */
const brings = (map: StockMap): string[] =>
  map.actors.map(id => stockActorById(id)?.name ?? id);

export const ImportScreenDialog = ({
  onImport,
  onCancel,
}: ImportScreenDialogProps) => {
  const [chosen, setChosen] = useState<StockMap | null>(null);
  return (
    <Dialog
      role="dialog"
      title="Add a screen"
      description="Pick a screen to copy into your project, with the actors it places. Show it with “show screen”, and open it in the editor to move things."
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
            {STOCK_MAPS.filter(map => map.screen).map(map => {
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
