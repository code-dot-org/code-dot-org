import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import firehoseClient from '../../../lib/util/firehose';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';

const styles = {
  link: {
    color: color.teal,
    verticalAlign: 'middle'
  },
  tooltip: {
    display: 'flex',
    textAlign: 'center'
  },
  collapser: {
    paddingRight: '10px',
    fontSize: '20px',
    verticalAlign: 'middle'
  }
};
class ProgressTableStudentName extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    scriptId: PropTypes.number,
    lastTimestamp: PropTypes.number,
    localeCode: PropTypes.string,
    studentUrl: PropTypes.string.isRequired,
    onExpandToggle: PropTypes.func.isRequired,
    isExpanded: PropTypes.bool.isRequired,

    // redux provided
    showSectionProgressDetails: PropTypes.bool
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
    const {name, studentUrl, onExpandToggle, isExpanded} = this.props;
    const tooltipId = this.tooltipId();

    return (
      <div
        style={progressStyles.studentListContent}
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        {this.props.showSectionProgressDetails && (
          <CollapserIcon
            isCollapsed={!isExpanded}
            onClick={onExpandToggle}
            collapsedIconClass="fa-caret-right"
            expandedIconClass="fa-caret-down"
            style={styles.collapser}
          />
        )}
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

export const UnconnectedProgressTableStudentName = ProgressTableStudentName;

export default connect(state => ({
  showSectionProgressDetails: state.sectionProgress.showSectionProgressDetails
}))(ProgressTableStudentName);
