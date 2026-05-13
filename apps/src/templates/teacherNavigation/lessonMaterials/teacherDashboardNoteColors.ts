import {
  DEFAULT_TEACHER_DASHBOARD_NOTE_COLOR,
  TeacherDashboardNoteColor,
} from './teacherDashboardNotesTypes';

import styles from './lesson-materials.module.scss';

export const noteColorClassName = (
  color?: TeacherDashboardNoteColor | null
) => {
  const noteColor = color || DEFAULT_TEACHER_DASHBOARD_NOTE_COLOR;
  const classNames: Record<TeacherDashboardNoteColor, string> = {
    white: styles.teacherNoteColorWhite,
    yellow: styles.teacherNoteColorYellow,
    peach: styles.teacherNoteColorPeach,
    mint: styles.teacherNoteColorMint,
    blue: styles.teacherNoteColorBlue,
    lavender: styles.teacherNoteColorLavender,
    pink: styles.teacherNoteColorPink,
    gray: styles.teacherNoteColorGray,
    aqua: styles.teacherNoteColorAqua,
    cream: styles.teacherNoteColorCream,
  };

  return (
    classNames[noteColor] || classNames[DEFAULT_TEACHER_DASHBOARD_NOTE_COLOR]
  );
};
