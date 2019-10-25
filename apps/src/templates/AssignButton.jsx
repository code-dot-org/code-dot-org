import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import ConfirmAssignment from '@cdo/apps/templates/courseOverview/ConfirmAssignment';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {assignCourseToSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

class AssignButton extends React.Component {
  static propTypes = {
    section: sectionForDropdownShape,
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    assignmentName: PropTypes.string,
    // Redux
    assignCourseToSection: PropTypes.func.isRequired
  };

  state = {
    dialogOpen: false,
    errorString: null
  };

  onClickAssign = event => {
    this.setState({dialogOpen: true});
  };

  onCloseDialog = event => {
    this.setState({dialogOpen: false});
  };

  assignCourse = () => {
    const {section, courseId, assignCourseToSection} = this.props;
    assignCourseToSection(section.id, courseId);
    this.setState({dialogOpen: false});
  };

  render() {
    const {section, assignmentName} = this.props;
    return (
      <div>
        <Button
          color={Button.ButtonColor.orange}
          text={i18n.assignToSection()}
          icon="plus"
          onClick={this.onClickAssign}
        />
        {this.state.dialogOpen && (
          <ConfirmAssignment
            sectionName={section.name}
            assignmentName={assignmentName}
            onClose={this.onCloseDialog}
            onConfirm={this.assignCourse}
            isHiddenFromSection={false}
          />
        )}
      </div>
    );
  }
}

export const UnconnectedAssignButton = AssignButton;

export default connect(
  state => ({
    sections: state.teacherSections.sections
  }),
  {
    assignCourseToSection
  }
)(AssignButton);
