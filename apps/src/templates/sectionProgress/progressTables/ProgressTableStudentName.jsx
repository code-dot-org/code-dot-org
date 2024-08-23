import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';

import CollapserIcon from '@cdo/apps/templates/CollapserIcon';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import harness from '../../../lib/util/harness';

export default class ProgressTableStudentName extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    scriptId: PropTypes.number,
    lastTimestamp: PropTypes.number,
    studentUrl: PropTypes.string.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
    isExpanded: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.toggleExpand = this.toggleExpand.bind(this);
    this.recordStudentNameClick = this.recordStudentNameClick.bind(this);
  }

  toggleExpand() {
    this.props.onToggleExpand(this.props.studentId);
  }

  recordStudentNameClick() {
    harness.trackAnalytics(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_student',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          script_id: this.props.scriptId,
          student_id: this.props.studentId,
        }),
      },
      {includeUserId: true}
    );
  }

  tooltipId() {
    return `tooltipIdForStudent${this.props.studentId}`;
  }

  renderTooltip() {
    const id = this.tooltipId();
    const timestamp = this.props.lastTimestamp
      ? moment.unix(this.props.lastTimestamp).calendar()
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
    const {name, studentUrl, isExpanded} = this.props;
    const tooltipId = this.tooltipId();

    return (
      <div
        className="content"
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        <CollapserIcon
          isCollapsed={!isExpanded}
          onClick={this.toggleExpand}
          collapsedIconClass="fa-caret-right"
          expandedIconClass="fa-caret-down"
          style={styles.collapser}
        />
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

const styles = {
  link: {
    color: color.teal,
    verticalAlign: 'middle',
  },
  tooltip: {
    display: 'flex',
    textAlign: 'center',
  },
  collapser: {
    paddingRight: 8,
    fontSize: 20,
    verticalAlign: 'middle',
    width: 11,
    boxSizing: 'content-box',
    textAlign: 'left',
  },
};
