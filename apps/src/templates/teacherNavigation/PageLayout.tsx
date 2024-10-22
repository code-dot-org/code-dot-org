import React from 'react';
import {useSelector} from 'react-redux';
import {Outlet} from 'react-router-dom';

import PageHeader from './PageHeader';
import {Section} from './TeacherNavigationRouter';

import styles from './teacher-navigation.module.scss';

const PageLayout: React.FC = () => {
  const selectedSection = useSelector(
    (state: {
      teacherSections: {
        selectedSectionId: number | null;
        sections: {[id: number]: Section};
      };
    }) =>
      state.teacherSections.selectedSectionId
        ? state.teacherSections.sections[
            state.teacherSections.selectedSectionId
          ]
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
