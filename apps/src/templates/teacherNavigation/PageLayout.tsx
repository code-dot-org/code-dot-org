import {selectedSectionSelector} from '@code-dot-org/teacher-dashboard/redux';
import React from 'react';
import {Outlet, useLocation, useParams} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import PageHeader from './PageHeader';
import {getPageNameFromPathname} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

const PageLayout: React.FC = () => {
  const selectedSection = useAppSelector(selectedSectionSelector);
  const urlSectionId = useParams().sectionId || selectedSection?.id;
  const location = useLocation();

  const sectionDemoType = selectedSection?.demoType ?? null;
  const sectionId = selectedSection?.id ?? null;

  React.useEffect(() => {
    if (sectionDemoType && sectionId !== null) {
      analyticsReporter.sendEvent(
        EVENTS.DEMO_SECTION_TEACHER_DASHBOARD_VIEWED,
        {
          demoType: sectionDemoType,
          sectionId,
          page: getPageNameFromPathname(location.pathname),
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
