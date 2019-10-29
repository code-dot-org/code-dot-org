import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {assignCourseToSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

class AssignButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    courseId: PropTypes.number,
    // Redux
    assignCourseToSection: PropTypes.func.isRequired
  };

  assignCourse = () => {
    const {sectionId, courseId, assignCourseToSection} = this.props;
    assignCourseToSection(sectionId, courseId);
  };

  render() {
    return (
      <div>
        <Button
          color={Button.ButtonColor.orange}
          text={i18n.assignToSection()}
          icon="plus"
          onClick={this.assignCourse}
        />
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
