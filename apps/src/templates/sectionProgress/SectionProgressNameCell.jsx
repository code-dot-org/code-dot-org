import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {progressStyles} from './multiGridConstants';
import {getSelectedScriptName} from '@cdo/apps/redux/scriptSelectionRedux';
import {tooltipIdForStudent} from './sectionProgressConstants';
import {scriptUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import firehoseClient from '../../lib/util/firehose';

class SectionProgressNameCell extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,

    // Provided by redux.
    scriptName: PropTypes.string,
    scriptId: PropTypes.number
  };

  recordStudentNameClick = () => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_student',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          script_id: this.props.scriptId,
          student_id: this.props.studentId
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    const {name, studentId, sectionId, scriptName} = this.props;
    const studentUrl = scriptUrlForStudent(sectionId, scriptName, studentId);
    const tooltipId = tooltipIdForStudent(studentId);

    return (
      <div
        style={progressStyles.nameCell}
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        {studentUrl && (
          <a
            href={studentUrl}
            style={progressStyles.link}
            onClick={this.recordStudentNameClick}
          >
            {name}
          </a>
        )}
        {!studentUrl && <span>{name}</span>}
      </div>
    );
  }
}

export const UnconnectedSectionProgressNameCell = SectionProgressNameCell;
export default connect((state, ownProps) => ({
  scriptName: getSelectedScriptName(state),
  scriptId: state.scriptSelection.scriptId
}))(SectionProgressNameCell);
