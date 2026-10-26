// Why a control in the map editor cannot be used yet, said beside it.
//
// A gated lab draws what it withholds rather than leaving it out, so a
// learner looking round can tell what is not theirs yet from what does not
// exist (specs/KINDS_FROM_THE_MAP_PLAN.md). The control stays FOCUSABLE —
// `aria-disabled`, not `disabled`, which takes a button out of the tab order
// and with it any way for a keyboard to find out why — and points here with
// `aria-describedby`, so what is read on focus is this sentence.
//
// The sentence is the lesson that grants the thing, as a link that opens the
// map on it (`progression/LessonLink`). When no lesson does — nothing in the
// catalogue grants it, or there is no progression at all — it is plain words,
// so the id the control points at always names something.

import {Typography} from '@mui/material';

import {LessonLink, unlockLesson} from '../progression/LessonLink';
import {useMaybeProgression} from '../progression/progressionContext';
import type {Affordance} from '../progression/types';

import styles from './mapEditor.module.css';

export interface WithheldNoteProps {
  affordance: Affordance;
  /** The id the withheld control's `aria-describedby` names. */
  id: string;
}

export const WithheldNote = ({affordance, id}: WithheldNoteProps) => {
  const unlock = {kind: 'affordance', id: affordance} as const;
  const lesson = unlockLesson(useMaybeProgression(), unlock);
  return lesson ? (
    <LessonLink id={id} unlock={unlock} locked />
  ) : (
    <Typography
      id={id}
      variant="body3"
      component="span"
      className={styles.inspectorNote}
    >
      Not unlocked yet
    </Typography>
  );
};

export default WithheldNote;
