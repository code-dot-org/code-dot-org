// What a control in the map editor says when a gated lab withholds it.
//
// A gated lab draws what it withholds rather than leaving it out, so a
// learner looking round can tell what is not theirs yet from what does not
// exist (specs/KINDS_FROM_THE_MAP_PLAN.md). The control keeps its place and
// wears a lock; the sentence naming the lesson that grants it is its tooltip,
// and pressing it opens a popover with the way to that lesson. Nothing is
// written into the layout beside it.
//
// The control stays FOCUSABLE — `aria-disabled`, not `disabled`, which takes a
// button out of the tab order and with it any way for a keyboard to find out
// why — and points with `aria-describedby` at a hidden copy of the sentence,
// so what is read on focus is the same words the tooltip shows.

import {Button, Popover, Typography} from '@mui/material';
import {useState, type MouseEvent, type ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {unlockLesson, type UnlockLesson} from '../progression/LessonLink';
import {
  useMaybeProgression,
  type Progression,
} from '../progression/progressionContext';
import type {Affordance} from '../progression/types';

import styles from './mapEditor.module.css';

/** The lesson that grants `affordance`, if any lesson does. */
function lessonFor(
  progression: Progression | undefined,
  affordance: Affordance,
): UnlockLesson | undefined {
  return unlockLesson(progression, {kind: 'affordance', id: affordance});
}

/** Why a withheld control cannot be used, in the words every lock uses. */
export function withheldSentence(lesson: UnlockLesson | undefined): string {
  return lesson ? `Unlocked by: ${lesson.title}` : 'Not unlocked yet';
}

/** The sentence for each affordance, for a caller that draws several. */
export function useWithheldSentence(): (affordance: Affordance) => string {
  const progression = useMaybeProgression();
  return affordance => withheldSentence(lessonFor(progression, affordance));
}

export interface WithheldNoteProps {
  affordance: Affordance;
  /** The id the withheld control's `aria-describedby` names. */
  id: string;
}

/** The sentence, out of sight, for the withheld control to be described by. */
export const WithheldNote = ({affordance, id}: WithheldNoteProps) => (
  <span id={id} className={styles.visuallyHidden}>
    {useWithheldSentence()(affordance)}
  </span>
);

/** The lock a withheld control wears, over the corner of its own icon. */
export const LockBadge = () => (
  <span className={styles.lockBadge} aria-hidden>
    <FontAwesomeV6Icon iconName="lock" iconStyle="solid" />
  </span>
);

/**
 * What pressing a withheld control opens. `explain(affordance)` is its click
 * handler; `popover` is rendered once, anywhere in the caller.
 */
export function useWithheldPopover(): {
  explain: (affordance: Affordance) => (event: MouseEvent<HTMLElement>) => void;
  popover: ReactNode;
} {
  const progression = useMaybeProgression();
  const [open, setOpen] = useState<{
    anchor: HTMLElement;
    affordance: Affordance;
  } | null>(null);
  const close = () => setOpen(null);
  const lesson = open && lessonFor(progression, open.affordance);

  return {
    explain: affordance => event =>
      setOpen({anchor: event.currentTarget, affordance}),
    popover: open && (
      <Popover
        open
        anchorEl={open.anchor}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        slotProps={{
          paper: {
            className: styles.withheldPopover,
            role: 'dialog',
            'aria-label': 'Locked',
          },
        }}
      >
        <Typography variant="body3">
          {withheldSentence(lesson ?? undefined)}
        </Typography>
        {lesson && (
          <Button
            variant="text"
            size="small"
            onClick={() => {
              close();
              lesson.open();
            }}
          >
            Go to lesson
          </Button>
        )}
      </Popover>
    ),
  };
}

export default WithheldNote;
