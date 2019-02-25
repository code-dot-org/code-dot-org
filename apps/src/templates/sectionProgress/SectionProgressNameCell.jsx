import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {progressStyles} from './multiGridConstants';
import {getSelectedScriptName} from '@cdo/apps/redux/scriptSelectionRedux';
import {scriptUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

class SectionProgressNameCell extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    scriptId: PropTypes.number.isRequired,

    // Provided by redux.
    scriptName: PropTypes.string.isRequired
  };

  render() {
    const {name, studentId, sectionId, scriptId, scriptName} = this.props;
    const studentUrl = scriptUrlForStudent(
      sectionId,
      scriptId,
      scriptName,
      studentId
    );

    return (
      <div style={progressStyles.nameCell}>
        <a href={studentUrl} style={progressStyles.link}>
          {name}
        </a>
      </div>
    );
  }
}

export const UnconnectedSectionProgressNameCell = SectionProgressNameCell;
export default connect(state => ({
  scriptName: getSelectedScriptName(state)
}))(SectionProgressNameCell);
