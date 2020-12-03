import PropTypes from 'prop-types';
import React from 'react';
import {tooltipIdForStudent} from '../sectionProgressConstants';
import {scriptUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import firehoseClient from '../../../lib/util/firehose';

export default class ProgressTableStudentName extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,

    scriptName: PropTypes.string,
    scriptId: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.recordStudentNameClick = this.recordStudentNameClick.bind(this);
  }

  recordStudentNameClick() {
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
  }

  render() {
    const {name, studentId, sectionId, scriptName} = this.props;
    const studentUrl = scriptUrlForStudent(sectionId, scriptName, studentId);
    const tooltipId = tooltipIdForStudent(studentId);

    return (
      <div data-tip data-for={tooltipId} aria-describedby={tooltipId}>
        {studentUrl && (
          <a href={studentUrl} onClick={this.recordStudentNameClick}>
            {name}
          </a>
        )}
        {!studentUrl && <span>{name}</span>}
      </div>
    );
  }
}
