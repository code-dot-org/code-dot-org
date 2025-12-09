import React from 'react';
import {Outlet, useParams} from 'react-router-dom';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';

import PageHeader from './PageHeader';

import styles from './teacher-navigation.module.scss';

const PageLayout: React.FC = () => {
  const selectedSection = useAppSelector(selectedSectionSelector);
  const urlSectionId = useParams().sectionId || selectedSection?.id;

  return (
    <div className={styles.pageWithHeader}>
      <PageHeader urlSectionId={urlSectionId} />
      {!!selectedSection && <Outlet />}
    </div>
  );
};

export default PageLayout;
