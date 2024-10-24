import React from 'react';
import {Outlet} from 'react-router-dom';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import PageHeader from './PageHeader';

import styles from './teacher-navigation.module.scss';

const PageLayout: React.FC = () => {
  const selectedSection = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
      : null
  );

  return (
    <div className={styles.pageWithHeader}>
      <PageHeader />
      {!!selectedSection && <Outlet />}
    </div>
  );
};

export default PageLayout;
