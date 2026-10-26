// What an interface actor is shown by (specs/ACTORS_AS_DATA_PLAN.md, step 3).
//
// An interface actor is drawn, and its look is mostly its size and its
// properties: a thumbnail of one Button says little about Buttons. So the
// Actor Editor offers it a symbol where a game actor's Looks like is — the
// same symbols the palette and the blocks show it by (`blockly/actorIcons`).
//
// A button each, pressed when chosen, as the animation row's are: sixteen is
// few enough to see at once, and a dropdown would hide the pictures that are
// the point of choosing.

import {Button, Typography} from '@mui/material';

import {ACTOR_ICONS} from '../../blockly/actorIcons';

import styles from './actorEditor.module.css';

export interface ActorIconPickerProps {
  /** The icon chosen, by name, or nothing. */
  selected: string | undefined;
  /** Choose one, or press the chosen one again for none. */
  onChange: (icon: string | undefined) => void;
  isReadOnly: boolean;
}

export const ActorIconPicker = ({
  selected,
  onChange,
  isReadOnly,
}: ActorIconPickerProps) => (
  <section className={styles.icons} aria-labelledby="actor-icon-heading">
    <Typography variant="body2" component="h3" id="actor-icon-heading">
      Icon
    </Typography>
    <ul className={styles.iconList}>
      {Object.entries(ACTOR_ICONS).map(([name, image]) => (
        <li key={name}>
          <Button
            variant={name === selected ? 'contained' : 'outlined'}
            color="secondary"
            size="small"
            className={styles.iconChoice}
            aria-pressed={name === selected}
            disabled={isReadOnly}
            onClick={() => onChange(name === selected ? undefined : name)}
          >
            <img src={image} alt="" aria-hidden="true" />
            {name}
          </Button>
        </li>
      ))}
    </ul>
  </section>
);

export default ActorIconPicker;
