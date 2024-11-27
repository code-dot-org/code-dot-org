import classNames from 'classnames';
import _ from 'lodash';
import React from 'react';
import {matchPath, useLocation} from 'react-router-dom';

import {Heading1} from '@cdo/apps/componentLibrary/typography';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';

import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

const skeletonSectionName = (
  <span
    className={classNames(
      skeletonizeContent.skeletonizeContent,
      styles.skeletonHeaderSectionName
    )}
  >
    SKELETON SECTION NAME
  </span>
);

const PageHeader: React.FC = () => {
  const isLoadingSectionData = useAppSelector(
    state => state.teacherSections.isLoadingSectionData
  );
  const selectedSection = useAppSelector(selectedSectionSelector);

  const location = useLocation();
  const pathName = React.useMemo(
    () =>
      _.find(
        LABELED_TEACHER_NAVIGATION_PATHS,
        path => matchPath(path.absoluteUrl, location.pathname) !== null
      )?.label || 'unknown path',
    [location]
  );

  const sectionNameText = selectedSection ? selectedSection.name : '';

  const sectionName = (
    <Typography
      semanticTag={'h2'}
      visualAppearance={'overline-two'}
      className={styles.headerSectionName}
    >
      {sectionNameText}
    </Typography>
  );

  return (
    <div className={styles.header}>
      {isLoadingSectionData ? skeletonSectionName : sectionName}
      <Heading1>{pathName}</Heading1>
    </div>
  );
};

export default PageHeader;
