// The Screens and Maps of a project, to move between, opened from the name
// at the head of the map editor (SIMPLE_INTERFACE.md, "Screen/Map Toolbar";
// specs/SHELL_PLAN.md, step 4).
//
// A section of screens and a section of maps, each with a way to add one.
// The entries are names for now: a picture of a Screen or a Map needs a
// renderer and a place in the project to keep it.

import {Button, Typography} from '@mui/material';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './placeSwitcher.module.css';

export interface Place {
  fileId: string;
  name: string;
}

export interface PlaceSwitcherProps {
  screens: readonly Place[];
  maps: readonly Place[];
  /** The one open now, which is marked and not offered. */
  currentId: string;
  onOpen: (fileId: string) => void;
  onNew: (folder: 'screens' | 'maps') => void;
  onClose: () => void;
  isReadOnly: boolean;
}

export const PlaceSwitcher = ({
  screens,
  maps,
  currentId,
  onOpen,
  onNew,
  onClose,
  isReadOnly,
}: PlaceSwitcherProps) => {
  const section = (
    title: string,
    folder: 'screens' | 'maps',
    places: readonly Place[],
    add: string,
  ) => (
    <section className={styles.section} aria-label={title}>
      <Typography variant="h4" component="h3" className={styles.heading}>
        {title}
      </Typography>
      <ul className={styles.places}>
        {places.map(place => (
          <li key={place.fileId}>
            <button
              type="button"
              className={styles.place}
              aria-current={place.fileId === currentId ? 'page' : undefined}
              onClick={() =>
                place.fileId === currentId ? onClose() : onOpen(place.fileId)
              }
            >
              <FontAwesomeV6Icon
                iconName={folder === 'screens' ? 'display' : 'map'}
                iconStyle="solid"
              />
              <span>{place.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {!isReadOnly && (
        <Button
          variant="text"
          size="small"
          startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
          onClick={() => onNew(folder)}
        >
          {add}
        </Button>
      )}
    </section>
  );

  return (
    <Dialog
      // A place to choose from, not an alert (`ActorPickerDialog`).
      role="dialog"
      title="Screens and Maps"
      onClose={onClose}
      closeLabel="Close"
      primaryButtonProps={{children: 'Done', onClick: onClose}}
      customContent={
        <div className={styles.body}>
          {section('Screens', 'screens', screens, 'New screen')}
          {section('Maps', 'maps', maps, 'New map')}
        </div>
      }
    />
  );
};
