import {Typography} from '@mui/material';

import type {SectionListSummary} from '@code-dot-org/core/api';

import styles from './SectionList.module.scss';

export interface SectionCardProps {
  section: SectionListSummary;
}

function studentCountLabel(studentCount: number): string {
  return `${studentCount} ${studentCount === 1 ? 'student' : 'students'}`;
}

/**
 * Read-only section summary: name, join code, student count, and the
 * assigned course (or an unassigned affordance). No mutating controls.
 */
export function SectionCard({section}: SectionCardProps) {
  return (
    <li className={styles.sectionCard}>
      <Typography variant="h3" className={styles.sectionName}>
        {section.name}
      </Typography>
      {section.code && (
        <Typography variant="body2">Join code: {section.code}</Typography>
      )}
      <Typography variant="body2">
        {studentCountLabel(section.studentCount)}
      </Typography>
      {section.courseDisplayName ? (
        <Typography variant="body2">
          Course: {section.courseDisplayName}
        </Typography>
      ) : (
        <Typography variant="body2" className={styles.unassigned}>
          No course assigned
        </Typography>
      )}
    </li>
  );
}
