import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressBox from '../ProgressBox';
import firehoseClient from '../../../lib/util/firehose';

const styles = {
  lessonBox: {
    marginRight: 5,
    marginLeft: 5
  }
};

export default class ProgressBoxForLessonNumber extends Component {
  static propTypes = {
    completed: PropTypes.bool,
    lessonNumber: PropTypes.number,
    tooltipId: PropTypes.string,
    linkToLessonPlan: PropTypes.string
  };

  handleClick = () => {
    if (window.location.pathname.includes('standards_report')) {
      firehoseClient.putRecord(
        {
          study: 'teacher_dashboard_actions',
          study_group: 'standards_report',
          event: 'click_progress_box',
          data_json: JSON.stringify({
            link: this.props.linkToLessonPlan
          })
        },
        {includeUserId: true}
      );
    }
  };

  render() {
    const {completed, lessonNumber, tooltipId, linkToLessonPlan} = this.props;
    const progressBox = (
      <ProgressBox
        style={styles.lessonBox}
        started={completed}
        incomplete={completed ? 0 : 20}
        imperfect={0}
        perfect={completed ? 20 : 0}
        lessonNumber={lessonNumber}
      />
    );

    if (linkToLessonPlan) {
      return (
        <a
          href={linkToLessonPlan}
          target="_blank"
          data-for={tooltipId}
          data-tip
          onClick={this.handleClick}
        >
          {progressBox}
        </a>
      );
    } else {
      return progressBox;
    }
  }
}
