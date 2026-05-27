import React from 'react';
import {Outlet, useLocation, useParams} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';

import PageHeader from './PageHeader';

import styles from './teacher-navigation.module.scss';

// Derive a stable page name from a dashboard pathname, e.g.:
//   /teacher_dashboard/sections/42/progress   → "progress"
//   /teacher_dashboard/sections/42/courses/csd → "course_overview"
//   /teacher_dashboard/sections/42/courses/csd/units/1 → "unit_overview"
const getPageFromPathname = (pathname: string): string => {
  if (pathname.includes('/units/')) return 'unit_overview';
  if (pathname.includes('/courses/')) return 'course_overview';
  if (pathname.includes('/unit/')) return 'unit_overview';
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] || 'unknown';
};

const PageLayout: React.FC = () => {
  const selectedSection = useAppSelector(selectedSectionSelector);
  const urlSectionId = useParams().sectionId || selectedSection?.id;
  const location = useLocation();

  // Extract to primitives so the effect only re-runs when these specific
  // values change, not on every section object identity change.
  const sectionDemoType = selectedSection?.demoType ?? null;
  const sectionId = selectedSection?.id ?? null;

  React.useEffect(() => {
    if (sectionDemoType && sectionId !== null) {
      analyticsReporter.sendEvent(
        EVENTS.DEMO_SECTION_TEACHER_DASHBOARD_VIEWED,
        {
          demoType: sectionDemoType,
          sectionId,
          page: getPageFromPathname(location.pathname),
        }
      );
    }
  }, [location.pathname, sectionDemoType, sectionId]);

  return (
    <div className={styles.pageWithHeader}>
      <PageHeader urlSectionId={urlSectionId} />
      {!!selectedSection && <Outlet />}
    </div>
  );
};

export default PageLayout;
