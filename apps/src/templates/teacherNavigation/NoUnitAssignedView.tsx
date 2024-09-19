import React from 'react';
import {useSelector} from 'react-redux';
import {generatePath, useNavigate} from 'react-router-dom';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import TeacherDashboardEmptyState from '@cdo/apps/templates/teacherNavigation/images/TeacherDashboardEmptyState.svg';
import i18n from '@cdo/locale';

import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './lesson-materials.module.scss';

type NoUnitAssignedViewProps = {
  courseName: string;
};

const NoUnitAssignedView: React.FC<NoUnitAssignedViewProps> = ({
  courseName,
}) => {
  const selectedSectionId = useSelector(
    (state: {teacherSections: {selectedSectionId: number}}) =>
      state.teacherSections.selectedSectionId
  );
  const navigate = useNavigate();

  const navigateToCoursePage = () => {
    console.log('Navigating to course page');
    navigate(
      generatePath(
        LABELED_TEACHER_NAVIGATION_PATHS.courseOverview.absoluteUrl,
        {
          sectionId: selectedSectionId,
        }
      )
    );
  };
  return (
    <div className={styles.noUnitContainer}>
      <img
        src={TeacherDashboardEmptyState}
        alt={i18n.almostThere()}
        className={styles.noUnitImage}
      />
      <Heading3>{i18n.almostThere()}</Heading3>
      <BodyTwoText>
        {' '}
        {i18n.noUnitAssigned({courseName: courseName})}
      </BodyTwoText>
      <Button onClick={navigateToCoursePage} text={i18n.assignAUnit()} />
    </div>
  );
};

export default NoUnitAssignedView;
