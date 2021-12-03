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
          <span style={styles.timestamp}>{` ${formattedTime}`}</span>
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
            onRubricChange={() => {}}
          />
        )}
        {!!latestFeedback && (
          <div style={styles.commentAndFooter}>
            <div style={styles.header}>
              <h1 style={styles.h1}> {i18n.feedbackCommentAreaHeader()} </h1>
              <ReadOnlyReviewState
                latestReviewState={this.getLatestReviewState()}
              />
            </div>
            {!!latestFeedback.comment && (
              <Comment isEditable={false} comment={latestFeedback.comment} />
            )}
            <div style={styles.footer}>{this.renderLastUpdated()}</div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  button: {
    fontWeight: 'bold'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 8
  },
  h1: {
    color: color.charcoal,
    fontSize: 18,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  },
  commentAndFooter: {
    padding: '8px 16px'
  },
  timestamp: {
    fontFamily: '"Gotham 7r", sans-serif'
  },
  timeStudent: {
    fontStyle: 'italic',
    fontSize: 12,
    color: color.cyan
  }
};

export default ReadonlyTeacherFeedback;
