import FontAwesome from './../FontAwesome';
import React from 'react';
import {connect} from 'react-redux';
import Notification, {NotificationType} from '../Notification';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {switchToSection, recordSwitchToSection} from './sectionHelpers';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SmallChevronLink from '../SmallChevronLink';
import {
  beginEditingSection,
  getAssignmentName,
  sortedSectionsList,
} from './teacherSectionsRedux';
import {sectionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import Button from '../Button';
import DropdownButton from '../DropdownButton';
import {disabledBubblesSupportArticle} from '@cdo/apps/code-studio/disabledBubbles';

class TeacherDashboardHeader extends React.Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionShape).isRequired,
    selectedSection: sectionShape.isRequired,
    openEditSectionDialog: PropTypes.func.isRequired,
    assignmentName: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.getDropdownOptions = this.getDropdownOptions.bind(this);
  }
  getDropdownOptions(optionMetricName) {
    let self = this;

    let options = self.props.sections.map(function (section, i) {
      let optionOnClick = () => {
        switchToSection(section.id, self.props.selectedSection.id);
        recordSwitchToSection(
          section.id,
          self.props.selectedSection.id,
          optionMetricName
        );
      };
      let icon = undefined;
      if (section.id === self.props.selectedSection.id) {
        icon = <FontAwesome icon="check" />;
      }
      return (
        <a key={i} id={section.id} onClick={optionOnClick}>
          {icon} {section.name}
        </a>
      );
    });
    return options;
  }

  lockedSectionNotification = ({restrictSection, loginType}) =>
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

  progressNotSavingNotification() {
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
  }
  /**
   * Returns the URL to the correct section to be edited
   */
  editRedirectUrl = sectionId => {
    return '/sections/' + sectionId + '/edit';
  };

  render() {
    return (
      <div>
        <SmallChevronLink
          href="/home#classroom-sections"
          text={i18n.viewAllSections()}
          iconBefore
        />
        <this.lockedSectionNotification
          restrictSection={this.props.selectedSection.restrictSection}
          loginType={this.props.selectedSection.loginType}
        />
        {this.props.selectedSection.postMilestoneDisabled && (
          <this.progressNotSavingNotification />
        )}
        <div style={styles.header}>
          <div>
            <h1>{this.props.selectedSection.name}</h1>
            {this.props.assignmentName && (
              <div id="assignment-name">
                <span style={styles.sectionPrompt}>
                  {i18n.assignedToWithColon()}{' '}
                </span>
                {this.props.assignmentName}
              </div>
            )}
          </div>
          <div style={styles.rightColumn}>
            <div style={styles.buttonSection}>
              <Button
                __useDeprecatedTag
                href={this.editRedirectUrl(this.props.selectedSection.id)}
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
                {this.getDropdownOptions('from_button_switch_section')}
              </DropdownButton>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

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
};

export const UnconnectedTeacherDashboardHeader = TeacherDashboardHeader;

export default connect(
  state => {
    // In most cases, filtering out hidden sections is done on the backend.
    // However in this case, we need hidden sections in the redux tree in case
    // the selected section is hidden.
    let sections = sortedSectionsList(state.teacherSections.sections).filter(
      section => !section.hidden
    );
    let selectedSectionId = state.teacherSections.selectedSectionId;
    let selectedSection = state.teacherSections.sections[selectedSectionId];
    let assignmentName = getAssignmentName(state, selectedSectionId);
    return {sections, selectedSection, assignmentName};
  },
  dispatch => {
    return {
      openEditSectionDialog: id => dispatch(beginEditingSection(id)),
    };
  }
)(TeacherDashboardHeader);
