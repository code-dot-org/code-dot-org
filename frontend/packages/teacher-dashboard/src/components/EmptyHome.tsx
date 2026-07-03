import {Typography} from '@mui/material';

import Image from '@code-dot-org/component-library/image';

import styles from '../TeacherDashboardHome.module.scss';

// Small decorative illustration (an empty tray) — self-contained so the
// pilot doesn't reach into apps/src's image assets across the bundle
// boundary. Purely decorative: rendered with alt="".
const EMPTY_STATE_ILLUSTRATION = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
    '<rect x="14" y="46" width="92" height="56" rx="6" fill="none" stroke="#767676" stroke-width="4"/>' +
    '<path d="M14 66h92" stroke="#767676" stroke-width="4"/>' +
    '<circle cx="60" cy="30" r="12" fill="none" stroke="#767676" stroke-width="4"/>' +
    '</svg>',
)}`;

/**
 * Empty-state region for a teacher with zero sections (TD-HOME-EMPTY).
 * Read-only: no create-section affordance.
 */
export function EmptyHome() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateImage}>
        <Image src={EMPTY_STATE_ILLUSTRATION} altText="" />
      </div>
      <Typography variant="h2" gutterBottom>
        It’s a bit empty here…
      </Typography>
      <Typography variant="body2" className={styles.emptyStateDescription}>
        You haven’t created any class sections yet.
      </Typography>
    </div>
  );
}
