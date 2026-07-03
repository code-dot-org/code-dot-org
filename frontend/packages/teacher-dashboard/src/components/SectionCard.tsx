import {Typography} from '@mui/material';

import type {SectionListSummary} from '@code-dot-org/core/api';

import {COLOR_LABELS, COLORS, EMOJI_LABELS, EMOJIS} from './avatarConstants';

import styles from './SectionList.module.scss';

export interface SectionCardProps {
  section: SectionListSummary;
}

function studentCountLabel(studentCount: number): string {
  return `${studentCount} ${studentCount === 1 ? 'student' : 'students'}`;
}

/**
 * Read-only avatar label from avatar_color/avatar_emoji, matching the legacy
 * SectionAvatar mapping: indexed lookup with clamp-to-0 fallback (legacy
 * treats null/out-of-range as 0), named "{Color}, {Emoji}".
 */
function SectionAvatarLabel({color, emoji}: {color: number; emoji: number}) {
  const safeColor = color >= 0 && color < COLORS.length ? color : 0;
  const safeEmoji = emoji >= 0 && emoji < EMOJIS.length ? emoji : 0;
  return (
    <div
      className={styles.sectionAvatar}
      style={{backgroundColor: COLORS[safeColor]}}
      role="img"
      aria-label={`${COLOR_LABELS[safeColor]}, ${EMOJI_LABELS[safeEmoji]}`}
    >
      {EMOJIS[safeEmoji]}
    </div>
  );
}

/**
 * Read-only section summary: avatar, name, section code, student count, and
 * the assigned course (or an unassigned affordance). No mutating controls.
 */
export function SectionCard({section}: SectionCardProps) {
  return (
    <li className={styles.sectionCard}>
      <div className={styles.sectionCardHeader}>
        <SectionAvatarLabel
          color={section.avatarColor ?? 0}
          emoji={section.avatarEmoji ?? 0}
        />
        <Typography variant="h3" className={styles.sectionName}>
          {section.name}
        </Typography>
      </div>
      {section.code && (
        <Typography variant="body2">Section code: {section.code}</Typography>
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
