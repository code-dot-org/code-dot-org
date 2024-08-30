import _ from 'lodash';
import React from 'react';
import {useSelector} from 'react-redux';
import {matchPath, useLocation} from 'react-router-dom';

import {Heading1} from '@cdo/apps/componentLibrary/typography';

import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';
import {Section} from './TeacherNavigationRouter';

import styles from './teacher-navigation.module.scss';

const PageHeader: React.FC = () => {
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

  const location = useLocation();
  const pathName = React.useMemo(
    () =>
      _.find(
        LABELED_TEACHER_NAVIGATION_PATHS,
        path => matchPath(path.absoluteUrl, location.pathname) !== null
      )?.label || 'unknown path',
    [location]
  );

  const sectionName = selectedSection ? selectedSection.name : '';

  return (
    <div className={styles.header}>
      <span className={styles.headerSectionName}>{sectionName}</span>
      <Heading1>{pathName}</Heading1>
    </div>
  );
};

export default PageHeader;
