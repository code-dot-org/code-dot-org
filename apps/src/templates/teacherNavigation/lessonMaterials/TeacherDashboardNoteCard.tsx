import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import React from 'react';

import {noteColorClassName} from './teacherDashboardNoteColors';
import {TeacherDashboardNote} from './teacherDashboardNotesTypes';
import TeacherNoteMarkdown from './TeacherNoteMarkdown';

import styles from './lesson-materials.module.scss';

interface TeacherDashboardNoteCardProps {
  note: TeacherDashboardNote;
  onEdit: (note: TeacherDashboardNote) => void;
  onDelete: (note: TeacherDashboardNote) => void;
  dragHandle?: React.ReactNode;
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
  dragHandle,
}) => (
  <article
    className={`${styles.teacherNoteCard} ${noteColorClassName(
      note.noteColor
    )}`}
  >
    <div className={styles.teacherNoteCardHeader}>
      <div className={styles.teacherNoteTitleRow}>
        {note.title && (
          <Typography variant="body2" className={styles.teacherNoteTitle}>
            {note.title}
          </Typography>
        )}
        {!note.isOwner && (
          <Typography
            variant="body4"
            component="span"
            className={styles.teacherNoteReadOnlyIndicator}
          >
            Read only
          </Typography>
        )}
      </div>
      {(note.isOwner || dragHandle) && (
        <div className={styles.teacherNoteActions}>
          {note.isOwner && (
            <>
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
            </>
          )}
          {dragHandle}
        </div>
      )}
    </div>
    <TeacherNoteMarkdown markdown={note.body} />
    <Typography variant="body4" className={styles.teacherNoteMetadata}>
      {note.isOwner ? 'Your note' : `Shared by ${note.authorName}`} ·{' '}
      {reachLabel(note)}
      {note.shareableGlobally ? ' · Code.org review allowed' : ''}
    </Typography>
  </article>
);

export default TeacherDashboardNoteCard;
