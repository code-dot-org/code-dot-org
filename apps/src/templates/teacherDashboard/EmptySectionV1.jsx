import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {
  Heading3,
  BodyTwoText,
  Heading1,
} from '@cdo/apps/componentLibrary/typography';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {setShowProgressTableV2} from '@cdo/apps/templates/currentUserRedux';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import blankScreen from '@cdo/apps/templates/teacherDashboard/images/no_curriculum_assigned.svg';
import i18n from '@cdo/locale';

import {TEACHER_DASHBOARD_PATHS} from './TeacherDashboardNavigation';

import styles from './teacher-dashboard.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

function EmptySectionV1({
  hasStudents,
  hasCurriculumAssigned,
  showProgressPageHeader = false,
  element,
  setShowProgressTableV2,
}) {
  const textDescription = !hasStudents
    ? i18n.emptySectionDescription()
    : i18n.noCurriculumAssigned();

  useEffect(() => {
    const params = queryParams('view');
    if (params === 'v2') {
      setShowProgressTableV2(true);
      new UserPreferences().setShowProgressTableV2(true);
    }
  }, [setShowProgressTableV2]);

  const displayedImage = !hasStudents ? (
    <img src={emptyDesk} alt="empty desk" />
  ) : (
    <img src={blankScreen} alt="blank screen" />
  );

  const emptySectionGraphic = className => (
    <div className={className}>
      {displayedImage}
      <Heading3 className={styles.topPadding}>
        {i18n.emptySectionHeadline()}
      </Heading3>
      <BodyTwoText>{textDescription}</BodyTwoText>
      {!hasStudents && (
        <NavLink
          key={TEACHER_DASHBOARD_PATHS.manageStudents}
          to={TEACHER_DASHBOARD_PATHS.manageStudents}
          className={styles.navLink}
        >
          {i18n.addStudents()}
        </NavLink>
      )}
      {!hasCurriculumAssigned && hasStudents && (
        <LinkButton href="/catalog" text={i18n.browseCurriculum()} />
      )}
    </div>
  );

  if (hasStudents && hasCurriculumAssigned) {
    return element;
  }
  return (
    <div className={dashboardStyles.emptyClassroomDiv}>
      {showProgressPageHeader ? (
        <div>
          <Heading1 className={dashboardStyles.progressHeaderV1}>
            {i18n.progress()}
          </Heading1>
          {emptySectionGraphic(dashboardStyles.emptyClassroomProgress)}
        </div>
      ) : (
        emptySectionGraphic(dashboardStyles.emptyClassroom)
      )}
    </div>
  );
}

EmptySectionV1.propTypes = {
  className: PropTypes.string,
  hasStudents: PropTypes.bool,
  hasCurriculumAssigned: PropTypes.bool,
  showProgressPageHeader: PropTypes.bool,
  element: PropTypes.element,
  setShowProgressTableV2: PropTypes.func.isRequired,
};

export const UnconnectedEmptySectionV1 = EmptySectionV1;

const mapDispatchToProps = dispatch => ({
  setShowProgressTableV2: showProgressTableV2 =>
    dispatch(setShowProgressTableV2(showProgressTableV2)),
});

export default connect(null, mapDispatchToProps)(EmptySectionV1);
