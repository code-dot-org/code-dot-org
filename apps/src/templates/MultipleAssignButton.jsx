import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {
  assignToSection,
  testingFunction,
  unassignSection,
  sectionsForDropdown
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import MultipleSectionsAssigner from '@cdo/apps/templates/MultipleSectionsAssigner';
import {updateHiddenScript} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';

class MultipleAssignButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    sectionName: PropTypes.string,
    courseId: PropTypes.number,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    scriptId: PropTypes.number,
    assignmentName: PropTypes.string,
    reassignConfirm: PropTypes.func,
    isOnCoursePage: PropTypes.bool,
    isStandAloneUnit: PropTypes.bool,
    participantAudience: PropTypes.string,
    // Redux
    assignToSection: PropTypes.func.isRequired,
    hiddenLessonState: PropTypes.object,
    updateHiddenScript: PropTypes.func.isRequired,
    isRtl: PropTypes.bool,
    testingFunction: PropTypes.func.isRequired,
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired
  };

  state = {
    confirmationDialogOpen: false,
    assignmentChoiceDialogOpen: false
  };

  onCloseDialog = () => {
    this.setState({
      confirmationDialogOpen: false,
      assignmentChoiceDialogOpen: false
    });
  };

  handleClick = () => {
    this.setState({
      assignmentChoiceDialogOpen: true
    });
    console.log('Handler activated!');
  };

  render() {
    const {assignmentChoiceDialogOpen} = this.state;
    const {
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId,
      assignmentName,
      isStandAloneUnit,
      isRtl,
      sectionsForDropdown,
      participantAudience,
      isOnCoursePage
    } = this.props;
    console.log('MultipleAssignButtonRendered');

    // Adjust styles if locale is RTL
    const buttonMarginStyle = isRtl
      ? styles.buttonMarginRTL
      : styles.buttonMargin;

    return (
      <div>
        <div style={buttonMarginStyle}>
          <Button
            __useDeprecatedTag
            color={Button.ButtonColor.orange}
            text={i18n.assignToMultipleSections()}
            icon="plus"
            onClick={this.handleClick}
            className={'uitest-assign-button'}
          />
        </div>
        {assignmentChoiceDialogOpen && (
          <MultipleSectionsAssigner
            assignmentName={assignmentName}
            onClose={this.onCloseDialog}
            sections={sectionsForDropdown}
            courseId={courseId}
            courseOfferingId={courseOfferingId}
            scriptId={scriptId}
            courseVersionId={courseVersionId}
            reassignConfirm={this.props.reassignConfirm}
            isOnCoursePage={isOnCoursePage}
            isStandAloneUnit={isStandAloneUnit}
            participantAudience={participantAudience}
          />
        )}
      </div>
    );
  }
}

const styles = {
  buttonMargin: {
    marginLeft: 10,
    display: 'flex',
    alignItems: 'center'
  },
  buttonMarginRTL: {
    marginRight: 10,
    display: 'flex',
    alignItems: 'center'
  }
};

export const UnconnectedMultipleAssignButton = MultipleAssignButton;

export default connect(
  (state, ownProps) => ({
    hiddenLessonState: state.hiddenLesson,
    isRtl: state.isRtl,
    sectionsForDropdown: sectionsForDropdown(
      state.teacherSections,
      ownProps.courseOfferingId,
      ownProps.courseVersionId,
      state.progress.scriptId
    )
  }),
  {
    assignToSection,
    updateHiddenScript,
    testingFunction,
    unassignSection
  }
)(MultipleAssignButton);
