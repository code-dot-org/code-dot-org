import React, {Component} from 'react';
import i18n from '@cdo/locale';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';
import {
  teacherFeedbackShape,
  rubricShape
} from '@cdo/apps/templates/instructions/teacherFeedback/types';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import ReadOnlyReviewState from '@cdo/apps/templates/instructions/teacherFeedback/ReadOnlyReviewState';
import moment from 'moment/moment';
import teacherFeedbackStyles from '@cdo/apps/templates/instructions/teacherFeedback/teacherFeedbackStyles';

export class ReadonlyTeacherFeedback extends Component {
  static propTypes = {
    rubric: rubricShape,
    visible: PropTypes.bool.isRequired,
    latestFeedback: teacherFeedbackShape
  };

  getLatestReviewState() {
    const {latestFeedback} = this.props;
    const reviewState = latestFeedback?.is_awaiting_teacher_review
      ? ReviewStates.awaitingReview
      : latestFeedback?.review_state;
    return reviewState || null;
  }

  renderLastUpdated() {
    const {created_at} = this.props.latestFeedback;
    const formattedTime = moment.min(moment(), moment(created_at)).fromNow();
    return (
      <div style={styles.timeStudent} id="ui-test-feedback-time">
        {i18n.lastUpdated()}
        {formattedTime && (
          <span
            style={teacherFeedbackStyles.timestamp}
          >{` ${formattedTime}`}</span>
        )}
      </div>
    );
  }

  render() {
    const {rubric, visible, latestFeedback} = this.props;

    if (!visible) {
      return null;
    }

    return (
      <div>
        {rubric && (
          <Rubric
            rubric={rubric}
            performance={latestFeedback?.performance || null}
            isEditable={false}
          />
        )}
        {!!latestFeedback && (
          <div style={teacherFeedbackStyles.commentAndFooter}>
            <div style={teacherFeedbackStyles.header}>
              <h1 style={teacherFeedbackStyles.h1}>
                {' '}
                {i18n.feedbackCommentAreaHeader()}{' '}
              </h1>
              <ReadOnlyReviewState
                latestReviewState={this.getLatestReviewState()}
              />
            </div>
            {!!latestFeedback.comment && (
              <Comment isEditable={false} comment={latestFeedback.comment} />
            )}
            <div style={teacherFeedbackStyles.footer}>
              {this.renderLastUpdated()}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  timeStudent: {
    fontStyle: 'italic',
    fontSize: 12,
    color: color.cyan
  }
};

export default ReadonlyTeacherFeedback;
