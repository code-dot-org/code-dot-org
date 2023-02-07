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
// KT added function ^^
// import ConfirmHiddenAssignment from '@cdo/apps/templates/courseOverview/ConfirmHiddenAssignment';
import MultipleSectionsAssigner from '@cdo/apps/templates/MultipleSectionsAssigner';
import {
  isScriptHiddenForSection,
  updateHiddenScript
} from '@cdo/apps/code-studio/hiddenLessonRedux';
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
    buttonLocationAnalytics: PropTypes.string,
    isStandAloneUnit: PropTypes.bool,
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

  // unhideAndAssign = () => {
  //   const {
  //     sectionId,
  //     courseId,
  //     courseOfferingId,
  //     courseVersionId,
  //     scriptId,
  //     assignToSection,
  //     updateHiddenScript,
  //     testingFunction
  //   } = this.props;
  //   updateHiddenScript(sectionId, scriptId, false);
  //   assignToSection(
  //     sectionId,
  //     courseId,
  //     courseOfferingId,
  //     courseVersionId,
  //     scriptId
  //   );
  //   testingFunction(
  //     sectionId,
  //     courseId,
  //     courseOfferingId,
  //     courseVersionId,
  //     scriptId
  //   );
  // };

  handleClick = () => {
    const {scriptId, sectionId, hiddenLessonState} = this.props;
    const isHiddenFromSection =
      sectionId &&
      scriptId &&
      hiddenLessonState &&
      isScriptHiddenForSection(hiddenLessonState, sectionId, scriptId);
    if (isHiddenFromSection) {
      // this creates a popup
      this.setState({
        confirmationDialogOpen: true
      });
    } else {
      this.setState({
        assignmentChoiceDialogOpen: true
      });
      console.log(
        'assignmentChoiceDialog ' + this.state.assignmentChoiceDialogOpen
      );
    }
  };

  render() {
    const {assignmentChoiceDialogOpen} = this.state;
    const {
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId,
      assignmentName,
      buttonLocationAnalytics,
      isStandAloneUnit,
      isRtl,
      sectionsForDropdown
    } = this.props;

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
            buttonLocationAnalytics={buttonLocationAnalytics}
            isStandAloneUnit={isStandAloneUnit}
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

export const UnconnectedAssignButton = MultipleAssignButton;

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
