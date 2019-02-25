import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {progressStyles} from './multiGridConstants';
import {getSelectedScriptName} from '@cdo/apps/redux/scriptSelectionRedux';
import experiments from '@cdo/apps/util/experiments';

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

    let scriptUrlForStudent = '';
    if (experiments.isEnabled(experiments.TEACHER_DASHBOARD_REACT)) {
      scriptUrlForStudent = `/s/${scriptName}?section_id=${sectionId}&user_id=${studentId}&viewAs=Teacher`;
    } else {
      scriptUrlForStudent = `/teacher-dashboard#/sections/${sectionId}/student/${studentId}/script/${scriptId}`;
    }

    return (
      <div style={progressStyles.nameCell}>
        <a href={scriptUrlForStudent} style={progressStyles.link}>
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
