import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import {disabledBubblesSupportArticle} from '@cdo/apps/code-studio/disabledBubbles';
import Link from '@cdo/apps/componentLibrary/link';
import DCDO from '@cdo/apps/dcdo';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {getStore} from '@cdo/apps/redux';
import {sectionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {isProductionEnvironment} from '@cdo/apps/utils';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import DropdownButton from '../DropdownButton';
import {
  convertStudentDataToArray,
  filterAgeGatedStudents,
  loadSectionStudentData,
} from '../manageStudents/manageStudentsRedux';
import Notification, {NotificationType} from '../Notification';
import {AgeGatedStudentsBanner} from '../policy_compliance/AgeGatedStudentsModal/AgeGatedStudentsBanner';

import FontAwesome from './../FontAwesome';
import {switchToSection, recordSwitchToSection} from './sectionHelpers';
import {
  asyncLoadCourseOfferings,
  beginEditingSection,
  getAssignmentName,
  sortedSectionsList,
} from './teacherSectionsRedux';

import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

function TeacherDashboardHeader({
  sections,
  selectedSection,
  assignmentName,
  openEditSectionDialog,
  asyncLoadCourseOfferings,
  isRtl,
  ageGatedStudentsCount,
  sectionId,
  loadSectionStudentData,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const currentUser = getStore().getState().currentUser;
  const inUSA =
    ['US', 'RD'].includes(currentUser.countryCode) || !!currentUser.usStateCode;
  const showAgeGatedStudentsBanner =
    inUSA &&
    currentUser.isTeacher &&
    ageGatedStudentsCount > 0 &&
    DCDO.get('show-age-gated-students-banner', !isProductionEnvironment());

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  React.useEffect(() => {
    asyncLoadCourseOfferings();
    loadSectionStudentData(sectionId);
  }, [asyncLoadCourseOfferings, loadSectionStudentData, sectionId]);

  const getDropdownOptions = optionMetricName => {
    let options = sections.map(function (section, i) {
      let optionOnClick = () => {
        switchToSection(section.id, selectedSection.id);
        recordSwitchToSection(section.id, selectedSection.id, optionMetricName);
      };
      let icon = undefined;
      if (section.id === selectedSection.id) {
        icon = <FontAwesome icon="check" />;
      }
      return (
        <a key={i} id={section.id} onClick={optionOnClick}>
          {icon} {section.name}
        </a>
      );
    });
    return options;
  };

  const lockedSectionNotification = ({restrictSection, loginType}) =>
    restrictSection &&
    loginType !==
      (SectionLoginType.google_classroom || SectionLoginType.clever) && (
      <Notification
        type={NotificationType.failure}
        notice={i18n.manageStudentsNotificationLocked()}
        details={i18n.manageStudentsNotificationLockedDetails({loginType})}
        dismissable={false}
      />
    );

  const progressNotSavingNotification = () => {
    return (
      <Notification
        type={NotificationType.failure}
        notice={i18n.disabledProgressTeacherDashboard1()}
        details={
          i18n.disabledProgress1() +
          ' ' +
          i18n.disabledProgressTeacherDashboard2()
        }
        detailsLinkText={i18n.learnMore()}
        detailsLink={disabledBubblesSupportArticle}
        detailsLinkNewWindow={true}
        dismissable={false}
      />
    );
  };
  /**
   * Returns the URL to the correct section to be edited
   */
  const editRedirectUrl = sectionId => {
    return '/sections/' + sectionId + '/edit';
  };

  return (
    <div className={dashboardStyles.headerContainer}>
      <div className={dashboardStyles.headerLink}>
        <a
          href="/home#classroom-sections"
          className={dashboardStyles.headerLinkChevron}
        >
          <FontAwesome
            icon="chevron-left"
            className={isRtl ? 'fa-flip-horizontal' : undefined}
            style={{textDecoration: 'none'}}
            aria-label={i18n.viewAllSections()}
          />
        </a>
        <Link type="primary" size="s" href="/home#classroom-sections">
          {i18n.viewAllSections()}
        </Link>
      </div>
      {lockedSectionNotification({
        restrictSection: selectedSection.restrictSection,
        loginType: selectedSection.loginType,
      })}
      {selectedSection.postMilestoneDisabled && progressNotSavingNotification()}
      {showAgeGatedStudentsBanner && (
        <AgeGatedStudentsBanner
          toggleModal={toggleModal}
          modalOpen={modalOpen}
          ageGatedStudentsCount={ageGatedStudentsCount}
        />
      )}
      <div className={dashboardStyles.header}>
        <div>
          <h1>{selectedSection.name}</h1>
          {assignmentName && (
            <div
              id="assignment-name"
              className={dashboardStyles.headerCurriculum}
            >
              <span>{i18n.assignedToWithColon()} </span>
              {assignmentName}
            </div>
          )}
        </div>
        <div className={dashboardStyles.headerRightColumn}>
          <div className={dashboardStyles.headerButtonSection}>
            <Button
              __useDeprecatedTag
              href={editRedirectUrl(selectedSection.id)}
              className="edit-section-details-link"
              icon="gear"
              size="narrow"
              color="gray"
              text={i18n.editSectionDetails()}
              style={styles.buttonWithMargin}
            />
            <DropdownButton
              size="narrow"
              color="gray"
              text={i18n.switchSection()}
            >
              {getDropdownOptions('from_button_switch_section')}
            </DropdownButton>
          </div>
        </div>
      </div>
    </div>
  );
}

TeacherDashboardHeader.propTypes = {
  sections: PropTypes.arrayOf(sectionShape).isRequired,
  selectedSection: sectionShape.isRequired,
  openEditSectionDialog: PropTypes.func.isRequired,
  assignmentName: PropTypes.string,
  asyncLoadCourseOfferings: PropTypes.func.isRequired,
  isRtl: PropTypes.bool,
  ageGatedStudentsCount: PropTypes.number,
  sectionId: PropTypes.number,
  loadSectionStudentData: PropTypes.func,
};

const styles = {
  buttonWithMargin: {
    margin: 0,
    marginInlineEnd: 5,
  },
};

export const UnconnectedTeacherDashboardHeader = TeacherDashboardHeader;

export default connect(
  state => ({
    // In most cases, filtering out hidden sections is done on the backend.
    // However in this case, we need hidden sections in the redux tree in case
    // the selected section is hidden.
    sections: sortedSectionsList(state.teacherSections.sections).filter(
      section => !section.hidden
    ),
    selectedSection:
      state.teacherSections.sections[state.teacherSections.selectedSectionId],
    assignmentName: getAssignmentName(
      state,
      state.teacherSections.selectedSectionId
    ),
    isRtl: state.isRtl,
    sectionId: state.teacherSections.selectedSectionId,
    ageGatedStudentsCount: filterAgeGatedStudents(
      convertStudentDataToArray(state.manageStudents.studentData)
    ).length,
  }),
  dispatch => {
    return {
      openEditSectionDialog: id => dispatch(beginEditingSection(id)),
      asyncLoadCourseOfferings: () => dispatch(asyncLoadCourseOfferings()),
      loadSectionStudentData: sectionId => {
        dispatch(loadSectionStudentData(sectionId));
      },
    };
  }
)(TeacherDashboardHeader);
