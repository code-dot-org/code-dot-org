import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {disabledBubblesSupportArticle} from '@cdo/apps/code-studio/disabledBubbles';
import {sectionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

import Button from '../Button';
import DropdownButton from '../DropdownButton';
import Notification, {NotificationType} from '../Notification';
import SmallChevronLink from '../SmallChevronLink';

import FontAwesome from './../FontAwesome';
import {switchToSection, recordSwitchToSection} from './sectionHelpers';
import {
  asyncLoadCourseOfferings,
  beginEditingSection,
  getAssignmentName,
  sortedSectionsList,
} from './teacherSectionsRedux';

function TeacherDashboardHeader({
  sections,
  selectedSection,
  assignmentName,
  openEditSectionDialog,
  asyncLoadCourseOfferings,
}) {
  React.useEffect(() => {
    asyncLoadCourseOfferings();
  }, [asyncLoadCourseOfferings]);

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
    <div style={styles.headerContainer}>
      <SmallChevronLink
        href="/home#classroom-sections"
        text={i18n.viewAllSections()}
        iconBefore
        style={styles.linkPadding}
      />
      {lockedSectionNotification({
        restrictSection: selectedSection.restrictSection,
        loginType: selectedSection.loginType,
      })}
      {selectedSection.postMilestoneDisabled && progressNotSavingNotification()}
      <div style={styles.header}>
        <div>
          <h1>{selectedSection.name}</h1>
          {assignmentName && (
            <div id="assignment-name">
              <span style={styles.sectionPrompt}>
                {i18n.assignedToWithColon()}{' '}
              </span>
              {assignmentName}
            </div>
          )}
        </div>
        <div style={styles.rightColumn}>
          <div style={styles.buttonSection}>
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
};

const styles = {
  sectionPrompt: {
    fontWeight: 'bold',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  buttonSection: {
    display: 'flex',
    marginBottom: 5,
  },
  buttonWithMargin: {
    margin: 0,
    marginRight: 5,
  },
  linkPadding: {
    padding: '10px 0',
  },
  headerContainer: {
    padding: '0 64px',
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
  }),
  dispatch => {
    return {
      openEditSectionDialog: id => dispatch(beginEditingSection(id)),
      asyncLoadCourseOfferings: () => dispatch(asyncLoadCourseOfferings()),
    };
  }
)(TeacherDashboardHeader);
