import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import {scriptUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import firehoseClient from '../../../lib/util/firehose';
import i18n from '@cdo/locale';

const styles = {
  tooltip: {
    display: 'flex',
    textAlign: 'center'
  }
};
export default class ProgressTableStudentName extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    scriptName: PropTypes.string,
    scriptId: PropTypes.number,
    lastTimestamp: PropTypes.number,
    localeCode: PropTypes.string
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

  tooltipId() {
    return `tooltipIdForStudent${this.props.studentId}`;
  }

  renderTooltip() {
    const {lastTimestamp, localeCode} = this.props;
    const id = this.tooltipId();
    if (localeCode) {
      moment.locale(localeCode);
    }
    const timestamp = lastTimestamp
      ? moment(lastTimestamp).calendar()
      : i18n.none();
    return (
      <ReactTooltip
        id={id}
        key={id}
        role="tooltip"
        wrapper="span"
        effect="solid"
      >
        <span style={styles.tooltip}>
          {i18n.lastProgress()}
          <br />
          {timestamp}
        </span>
      </ReactTooltip>
    );
  }

  render() {
    const {name, studentId, sectionId, scriptName} = this.props;
    const studentUrl = scriptUrlForStudent(sectionId, scriptName, studentId);
    const tooltipId = this.tooltipId();

    return (
      <div data-tip data-for={tooltipId} aria-describedby={tooltipId}>
        {this.renderTooltip()}
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
