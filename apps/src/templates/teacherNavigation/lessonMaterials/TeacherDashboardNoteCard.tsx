import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton, Typography} from '@mui/material';
import React from 'react';

import {noteColorClassName} from './teacherDashboardNoteColors';
import {TeacherDashboardNote} from './teacherDashboardNotesTypes';
import TeacherNoteMarkdown from './TeacherNoteMarkdown';

import styles from './lesson-materials.module.scss';

interface TeacherDashboardNoteCardProps {
  note: TeacherDashboardNote;
  onEdit: (note: TeacherDashboardNote) => void;
  onDelete: (note: TeacherDashboardNote) => void;
}

const reachLabel = (note: TeacherDashboardNote) => {
  const sharedSectionCount = note.sharedSectionIds?.length || 0;
  if (!note.sectionId) {
    return sharedSectionCount > 0
      ? 'All sections · Shared with selected coteachers'
      : 'All sections';
  }
  if (sharedSectionCount > 0 || note.sharedWithSection) {
    return 'Current section only · Shared with coteachers';
  }
  return 'Current section only';
};

const TeacherDashboardNoteCard: React.FC<TeacherDashboardNoteCardProps> = ({
  note,
  onEdit,
  onDelete,
}) => (
  <article
    className={`${styles.teacherNoteCard} ${noteColorClassName(
      note.noteColor
    )}`}
  >
    {(note.title || note.isOwner) && (
      <div className={styles.teacherNoteCardHeader}>
        {note.title && (
          <Typography variant="body2" className={styles.teacherNoteTitle}>
            {note.title}
          </Typography>
        )}
        {note.isOwner && (
          <div className={styles.teacherNoteActions}>
            <IconButton
              aria-label="Edit note"
              size="small"
              onClick={() => onEdit(note)}
            >
              <FontAwesomeV6Icon iconName="pen" iconStyle="solid" />
            </IconButton>
            <IconButton
              aria-label="Delete note"
              size="small"
              onClick={() => onDelete(note)}
            >
              <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
            </IconButton>
          </div>
        )}
      </div>
    )}
    <TeacherNoteMarkdown markdown={note.body} />
    {!note.isOwner && (
      <MuiButton disabled size="small" variant="text">
        Read only
      </MuiButton>
    )}
    <Typography variant="body4" className={styles.teacherNoteMetadata}>
      {note.isOwner ? 'Your note' : `Shared by ${note.authorName}`} ·{' '}
      {reachLabel(note)}
      {note.shareableGlobally ? ' · Code.org review allowed' : ''}
    </Typography>
  </article>
);

export default TeacherDashboardNoteCard;
