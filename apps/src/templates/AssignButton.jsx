import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {assignToSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const styles = {
  buttonMargin: {
    marginLeft: 10
  }
};

class AssignButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    // Redux
    assignToSection: PropTypes.func.isRequired
  };

  assign = () => {
    const {sectionId, courseId, scriptId, assignToSection} = this.props;
    assignToSection(sectionId, courseId, scriptId);
  };

  render() {
    return (
      <div style={styles.buttonMargin}>
        <Button
          color={Button.ButtonColor.orange}
          text={i18n.assignToSection()}
          icon="plus"
          onClick={this.assign}
          className={'uitest-assign-button'}
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
    assignToSection
  }
)(AssignButton);
