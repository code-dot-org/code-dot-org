// Choosing a theme to copy into the project.
//
// `ImportMapDialog`'s sibling, and the smallest of the three pickers: a theme
// brings nothing with it. What there is to show is its name and one line on
// what it looks like — the tiles share the actor dialog's styles, so the
// pickers read as one shelf.

import {Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import styles from '../actors/importActorDialog.module.css';

import {STOCK_STYLES, type StockStyle} from './stock';

export interface ImportStyleDialogProps {
  onImport: (style: StockStyle) => void;
  onCancel: () => void;
}

export const ImportStyleDialog = ({
  onImport,
  onCancel,
}: ImportStyleDialogProps) => {
  const [chosen, setChosen] = useState<StockStyle | null>(null);
  return (
    <Dialog
      role="dialog"
      title="Add a theme"
      description="Pick how this world’s controls are painted. Every “use style” in every drawing is looked up in the theme the world names, so changing it changes them all."
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
            {STOCK_STYLES.map(style => {
              const picked = chosen?.id === style.id;
              return (
                <li key={style.id} className={styles.holder}>
                  <button
                    type="button"
                    className={
                      picked
                        ? `${styles.tile} ${styles.tileChosen}`
                        : styles.tile
                    }
                    aria-pressed={picked}
                    aria-label={style.name}
                    onClick={() => setChosen(style)}
                    onDoubleClick={() => onImport(style)}
                  >
                    <Typography
                      component="span"
                      variant="label2"
                      color="inherit"
                      className={styles.name}
                    >
                      {style.name}
                    </Typography>
                  </button>
                </li>
              );
            })}
          </ul>
          {chosen && (
            <div className={styles.detail}>
              <Typography variant="body3">{chosen.description}</Typography>
            </div>
          )}
        </div>
      }
    />
  );
};
