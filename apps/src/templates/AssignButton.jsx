import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {assignToSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import ConfirmHiddenAssignment from '@cdo/apps/templates/courseOverview/ConfirmHiddenAssignment';
import {
  isScriptHiddenForSection,
  updateHiddenScript
} from '@cdo/apps/code-studio/hiddenStageRedux';

const styles = {
  buttonMargin: {
    marginLeft: 10
  }
};

class AssignButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    sectionName: PropTypes.string,
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    assignmentName: PropTypes.string,
    // Redux
    assignToSection: PropTypes.func.isRequired,
    hiddenStageState: PropTypes.object,
    updateHiddenScript: PropTypes.func.isRequired
  };

  state = {
    confirmationDialogOpen: false
  };

  onCloseDialog = () => {
    this.setState({
      confirmationDialogOpen: false
    });
  };

  unhideAndAssign = () => {
    const {
      sectionId,
      courseId,
      scriptId,
      assignToSection,
      updateHiddenScript
    } = this.props;
    updateHiddenScript(sectionId, scriptId, false);
    assignToSection(sectionId, courseId, scriptId);
  };

  handleClick = () => {
    const {
      scriptId,
      courseId,
      sectionId,
      hiddenStageState,
      assignToSection
    } = this.props;
    const isHiddenFromSection =
      sectionId &&
      scriptId &&
      hiddenStageState &&
      isScriptHiddenForSection(hiddenStageState, sectionId, scriptId);
    if (isHiddenFromSection) {
      this.setState({
        confirmationDialogOpen: true
      });
    } else {
      assignToSection(sectionId, courseId, scriptId);
    }
  };

  render() {
    const {confirmationDialogOpen} = this.state;
    const {assignmentName, sectionName} = this.props;

    return (
      <div>
        <div style={styles.buttonMargin}>
          <Button
            __useDeprecatedTag
            color={Button.ButtonColor.orange}
            text={i18n.assignToSection()}
            icon="plus"
            onClick={this.handleClick}
            className={'uitest-assign-button'}
          />
        </div>
        {confirmationDialogOpen && (
          <ConfirmHiddenAssignment
            sectionName={sectionName}
            assignmentName={assignmentName}
            onClose={this.onCloseDialog}
            onConfirm={this.unhideAndAssign}
          />
        )}
      </div>
    );
  }
}

export const UnconnectedAssignButton = AssignButton;

export default connect(
  state => ({
    hiddenStageState: state.hiddenStage
  }),
  {
    assignToSection,
    updateHiddenScript
  }
)(AssignButton);
