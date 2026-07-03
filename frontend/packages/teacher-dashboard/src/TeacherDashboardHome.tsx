import {
  DashboardApiClient,
  QueryClientProvider,
  useSections,
} from '@code-dot-org/core/api';

import {EmptyHome} from './components/EmptyHome';
import {SectionList} from './components/SectionList';

import styles from './TeacherDashboardHome.module.scss';

function TeacherDashboardHomeRegion() {
  const {data: sections} = useSections(DashboardApiClient);

  if (!sections) {
    // Loading: nothing to announce yet — the region root still exists so a
    // later state transition doesn't remount the tree.
    return (
      <div
        id="teacher-dashboard-home"
        data-state="loading"
        className={styles.root}
      />
    );
  }

  if (sections.length === 0) {
    return (
      <div
        id="teacher-dashboard-home"
        data-state="empty"
        className={styles.root}
      >
        <EmptyHome />
      </div>
    );
  }

  return (
    <div id="teacher-dashboard-home" data-state="list" className={styles.root}>
      <SectionList sections={sections} />
    </div>
  );
}

/**
 * Read-only teacher-dashboard home region: the section-list slice of
 * `/teacher_dashboard/home`. Self-contained — owns its own QueryClient so it
 * can mount standalone (dev shell, Playwright) or inside the Studio route.
 */
export function TeacherDashboardHome() {
  return (
    <QueryClientProvider>
      <TeacherDashboardHomeRegion />
    </QueryClientProvider>
  );
}
