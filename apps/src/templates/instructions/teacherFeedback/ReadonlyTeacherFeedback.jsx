import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import FeedbackStatus from '@cdo/apps/templates/instructions/teacherFeedback/FeedbackStatus';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';
import {
  teacherFeedbackShape,
  rubricShape
} from '@cdo/apps/templates/instructions/teacherFeedback/types';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import ReadOnlyReviewState from '@cdo/apps/templates/instructions/teacherFeedback/ReadOnlyReviewState';

export class ReadonlyTeacherFeedback extends Component {
  static propTypes = {
    rubric: rubricShape,
    visible: PropTypes.bool.isRequired,
    teacher: PropTypes.number,
    latestFeedback: teacherFeedbackShape,
    //Provided by Redux
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired
  };

  getLatestReviewState() {
    const {latestFeedback} = this.props;
    const reviewState = latestFeedback?.is_awaiting_teacher_review
      ? ReviewStates.awaitingReview
      : latestFeedback?.review_state;
    return reviewState || null;
  }

  render() {
    const {viewAs, rubric, visible, latestFeedback} = this.props;

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
            viewAs={viewAs}
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
            <div style={styles.footer}>
              <FeedbackStatus viewAs={viewAs} latestFeedback={latestFeedback} />
            </div>
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
  }
};

export const UnconnectedReadonlyTeacherFeedback = ReadonlyTeacherFeedback;

export default connect(state => ({
  viewAs: state.viewAs
}))(ReadonlyTeacherFeedback);
