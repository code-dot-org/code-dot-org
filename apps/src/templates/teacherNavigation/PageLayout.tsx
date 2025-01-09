import React from 'react';
import {Outlet} from 'react-router-dom';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';

import PageHeader from './PageHeader';

import styles from './teacher-navigation.module.scss';

const PageLayout: React.FC = () => {
  const selectedSection = useAppSelector(selectedSectionSelector);

  return (
    <div className={styles.pageWithHeader}>
      <PageHeader />
      {!!selectedSection && <Outlet />}
    </div>
  );
};

export default PageLayout;
