// An actor's animations, as a row under its picture (SIMPLE_INTERFACE.md,
// "Animations"; specs/ANIMATION_PLAN.md, step 5).
//
// Main first, and said to be the one it plays when it is made; then the
// rest, in the order the actor keeps them. Choosing one shows it in the
// picture above. Under the row, what can be done to the chosen one — loop
// it, rename it, delete it — and Add New Animation, which makes one that does
// nothing yet: a timeline to set its pictures and tweens on.
//
// A ROW THAT WRAPS, where the spec has a row that gives way to a dropdown
// and a modal once there is no room. An actor with more animations than a
// row holds is rare, and a second line of them is read as easily as the
// first.

import {Button, Typography} from '@mui/material';
import type {ChangeEvent} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {MAIN_ANIMATION} from '../actorData';

import styles from './actorEditor.module.css';

export interface AnimationRowProps {
  /** Its animations' names, Main first. */
  names: readonly string[];
  /** The one chosen, if any. */
  selected: string | undefined;
  /** Whether the chosen one loops. */
  loop: boolean;
  onSelect: (name: string) => void;
  onAdd: () => void;
  onRename: (name: string) => void;
  onRemove: (name: string) => void;
  onLoop: (name: string, loop: boolean) => void;
  isReadOnly: boolean;
}

export const AnimationRow = ({
  names,
  selected,
  loop,
  onSelect,
  onAdd,
  onRename,
  onRemove,
  onLoop,
  isReadOnly,
}: AnimationRowProps) => (
  <section className={styles.animations} aria-label="Animations">
    <Typography variant="body2" component="h3">
      Animations
    </Typography>
    {names.length === 0 ? (
      <Typography variant="body3" component="p" className={styles.note}>
        None yet. An animation is a picture that changes, or moves, over time.
      </Typography>
    ) : (
      <ul className={styles.animationList}>
        {names.map(name => (
          <li key={name}>
            <Button
              variant={name === selected ? 'contained' : 'outlined'}
              color="secondary"
              size="small"
              aria-pressed={name === selected}
              onClick={() => onSelect(name)}
            >
              {name}
              {name === MAIN_ANIMATION && (
                // Said, since a name alone does not say it.
                <span className={styles.mainMark}> (when made)</span>
              )}
            </Button>
          </li>
        ))}
      </ul>
    )}
    {selected && (
      <div className={styles.animationActions}>
        <Checkbox
          name={`animation-${selected}-loop`}
          label="Loop"
          checked={loop}
          disabled={isReadOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onLoop(selected, event.target.checked)
          }
        />
        {/* Main is what it plays when it is made, by that name: it is not
            renamed, and it goes by Looks like's "(drawn by its code)". */}
        {selected !== MAIN_ANIMATION && !isReadOnly && (
          <>
            <Button
              variant="text"
              size="small"
              onClick={() => onRename(selected)}
            >
              Rename
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => onRemove(selected)}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    )}
    {!isReadOnly && (
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
        onClick={onAdd}
      >
        Add New Animation
      </Button>
    )}
  </section>
);

export default AnimationRow;
