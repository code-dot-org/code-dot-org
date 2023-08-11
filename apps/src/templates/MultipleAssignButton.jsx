import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {
  assignToSection,
  unassignSection,
  sectionsForDropdown,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import MultipleSectionsAssigner from '@cdo/apps/templates/MultipleSectionsAssigner';
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
    isAssigningCourse: PropTypes.bool,
    isStandAloneUnit: PropTypes.bool,
    participantAudience: PropTypes.string,
    // Redux
    assignToSection: PropTypes.func.isRequired,
    isRtl: PropTypes.bool,
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
  };

  state = {
    assignmentChoiceDialogOpen: false,
  };

  onCloseDialog = () => {
    this.setState({
      assignmentChoiceDialogOpen: false,
    });
  };

  handleClick = () => {
    this.setState({
      assignmentChoiceDialogOpen: true,
    });
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
      isAssigningCourse,
      reassignConfirm,
    } = this.props;

    // Adjust styles if locale is RTL
    const buttonMarginStyle = isRtl
      ? styles.buttonMarginRTL
      : styles.buttonMargin;

    return (
      <div>
        <div style={buttonMarginStyle}>
          <Button
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
            reassignConfirm={reassignConfirm}
            isAssigningCourse={isAssigningCourse}
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
    alignItems: 'center',
  },
  buttonMarginRTL: {
    marginRight: 10,
    display: 'flex',
    alignItems: 'center',
  },
};

export const UnconnectedMultipleAssignButton = MultipleAssignButton;

export default connect(
  (state, ownProps) => ({
    isRtl: state.isRtl,
    sectionsForDropdown: sectionsForDropdown(
      state.teacherSections,
      ownProps.courseOfferingId,
      ownProps.courseVersionId,
      state.progress.scriptId
    ),
  }),
  {
    assignToSection,
    unassignSection,
  }
)(MultipleAssignButton);
