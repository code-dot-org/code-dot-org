import classNames from 'classnames';
import _ from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {matchPath, useLocation} from 'react-router-dom';

import {Heading1} from '@cdo/apps/componentLibrary/typography';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import {
  convertStudentDataToArray,
  filterAgeGatedStudents,
  loadSectionStudentData,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {AgeGatedStudentsBanner} from '@cdo/apps/templates/policy_compliance/AgeGatedStudentsModal/AgeGatedStudentsBanner';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

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
  const [ageGatedModalOpen, setAgeGatedModalOpen] = useState(false);
  const toggleAgeGatedModal = useCallback(() => {
    setAgeGatedModalOpen(!ageGatedModalOpen);
  }, [ageGatedModalOpen]);
  const selectedSection = useAppSelector(selectedSectionSelector);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (selectedSection?.id)
      dispatch(loadSectionStudentData(selectedSection.id));
  }, [dispatch, selectedSection?.id]);
  const studentData = useAppSelector(
    state => state.manageStudents?.studentData
  );
  const ageGatedStudents = filterAgeGatedStudents(
    convertStudentDataToArray(studentData)
  );
  const ageGatedStudentsUsState =
    ageGatedStudents?.length > 0 ? ageGatedStudents[0].usState : undefined;
  const showAgeGatedStudentsBanner = ageGatedStudents?.length > 0;

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
      {showAgeGatedStudentsBanner && (
        <AgeGatedStudentsBanner
          toggleModal={toggleAgeGatedModal}
          modalOpen={ageGatedModalOpen}
          ageGatedStudentsUsState={ageGatedStudentsUsState}
          ageGatedStudentsCount={ageGatedStudents?.length}
        />
      )}
    </div>
  );
};

export default PageHeader;
