import {Typography} from '@mui/material';

import Image from '@code-dot-org/component-library/image';

import noSections from '../assets/no_sections.png';

import styles from '../TeacherDashboardHome.module.scss';

// Legacy illustration copied from
// apps/src/templates/studioHomepages/teacherHomepageV2/images/no_sections.png
// so the pilot matches the legacy empty state without importing across the
// bundle boundary. Purely decorative: rendered with alt="".

/**
 * Empty-state region for a teacher with zero sections (TD-HOME-EMPTY).
 * Read-only: no create-section affordance. Copy matches the legacy
 * `emptySectionHeadline` / `emptyClassSections` en-US strings exactly.
 */
export function EmptyHome() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateImage}>
        <Image src={noSections} altText="" />
      </div>
      <Typography variant="h2" gutterBottom>
        It&apos;s a bit empty here...
      </Typography>
      <Typography variant="body2" className={styles.emptyStateDescription}>
        You haven&rsquo;t created any class sections yet.
      </Typography>
    </div>
  );
}
