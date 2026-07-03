import {Typography} from '@mui/material';
import {Component, type ReactNode} from 'react';

import {
  DashboardApiClient,
  QueryClientProvider,
  useSections,
} from '@code-dot-org/core/api';

import {EmptyHome} from './components/EmptyHome';
import {SectionList} from './components/SectionList';

import styles from './TeacherDashboardHome.module.scss';

function ErrorState() {
  return (
    <div
      id="teacher-dashboard-home"
      data-state="error"
      className={styles.root}
      role="alert"
    >
      <Typography variant="body2" className={styles.errorMessage}>
        Something went wrong loading your class sections. Refresh the page to
        try again.
      </Typography>
    </div>
  );
}

/**
 * Render-time throws (e.g. a malformed section summary) degrade to the same
 * error state instead of blanking the host page. Suspense on the route only
 * covers the lazy import, not render errors.
 */
class RegionErrorBoundary extends Component<
  {children: ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? <ErrorState /> : this.props.children;
  }
}

function TeacherDashboardHomeRegion() {
  const {data: sections, isError} = useSections(DashboardApiClient);

  if (isError) {
    return <ErrorState />;
  }

  if (!sections) {
    // Loading: keep the region root mounted so the state transition doesn't
    // remount the tree; announce progress to assistive tech.
    return (
      <div
        id="teacher-dashboard-home"
        data-state="loading"
        className={styles.root}
        role="status"
      >
        <span className={styles.srOnly}>Loading class sections…</span>
      </div>
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
      {/* Region-level heading so the per-card h3s nest under a consistent
          h2 in both states (the empty state's visible headline is its h2).
          Visually hidden: the legacy region's visible title lives outside
          the compared region bound. */}
      <Typography variant="h2" className={styles.srOnly}>
        Class Sections
      </Typography>
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
      <RegionErrorBoundary>
        <TeacherDashboardHomeRegion />
      </RegionErrorBoundary>
    </QueryClientProvider>
  );
}
