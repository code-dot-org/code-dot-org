import type {SectionListSummary} from '@code-dot-org/core/api';

import {SectionCard} from './SectionCard';

import styles from './SectionList.module.scss';

export interface SectionListProps {
  sections: SectionListSummary[];
}

/**
 * Read-only list of a teacher's sections (TD-HOME-SECTION-LIST). Semantic
 * `<ol>`/`<li>` markup, mirroring the legacy `#ui-test-section-list` region.
 */
export function SectionList({sections}: SectionListProps) {
  return (
    <ol id="teacher-dashboard-home-section-list" className={styles.sectionList}>
      {sections.map(section => (
        <SectionCard key={section.id} section={section} />
      ))}
    </ol>
  );
}
