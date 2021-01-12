import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import firehoseClient from '../../../lib/util/firehose';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

const styles = {
  link: {
    color: color.teal
  },
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
    scriptId: PropTypes.number,
    lastTimestamp: PropTypes.number,
    localeCode: PropTypes.string,
    studentUrl: PropTypes.string.isRequired
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
    const {name, studentUrl} = this.props;
    const tooltipId = this.tooltipId();

    return (
      <div
        style={progressStyles.studentListContent}
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        {this.renderTooltip()}
        <a
          style={styles.link}
          href={studentUrl}
          onClick={this.recordStudentNameClick}
        >
          {name}
        </a>
      </div>
    );
  }
}
