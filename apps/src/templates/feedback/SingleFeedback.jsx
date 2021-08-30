import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {feedbackShape} from './types';
import {UnlocalizedTimeAgo as TimeAgo} from '@cdo/apps/templates/TimeAgo';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import {KeepWorkingBadge} from '@cdo/apps/templates/progress/BubbleBadge';

const getElementHeight = element => {
  return ReactDOM.findDOMNode(element).offsetHeight;
};

const visibleCommentHeight = 40;

const RubricPerformanceLabels = {
  performanceLevel1: i18n.rubricLevelOneHeader(),
  performanceLevel2: i18n.rubricLevelTwoHeader(),
  performanceLevel3: i18n.rubricLevelThreeHeader(),
  performanceLevel4: i18n.rubricLevelFourHeader()
};

export default class SingleFeedback extends Component {
  state = {
    expanded: false,
    commentHeight: 0
  };

  static propTypes = {feedback: feedbackShape};

  expandComment = () => {
    this.setState({expanded: true});
    firehoseClient.putRecord(
      {
        study: 'all-feedback',
        event: 'expand-feedback',
        data_json: {feedback_id: this.props.feedback.id}
      },
      {includeUserId: true}
    );
  };

  collapseComment = () => {
    this.setState({expanded: false});
  };

  componentDidMount() {
    this.comment &&
      this.setState({commentHeight: getElementHeight(this.comment)});
  }

  feedbackSeenByStudent() {
    const {
      seen_on_feedback_page_at,
      student_first_visited_at
    } = this.props.feedback;
    return seen_on_feedback_page_at || student_first_visited_at;
  }

  renderReviewState() {
    const {review_state, is_awaiting_teacher_review} = this.props.feedback;

    if (review_state === ReviewStates.completed) {
      return <div style={styles.reviewState}>{i18n.reviewedComplete()}</div>;
    } else if (is_awaiting_teacher_review) {
      return (
        <div style={styles.reviewState}>{i18n.waitingForTeacherReview()}</div>
      );
    } else {
      return (
        <div style={styles.reviewState}>
          <KeepWorkingBadge />
          &nbsp;
          <span style={styles.keepWorkingText}>{i18n.keepWorking()}</span>
        </div>
      );
    }
  }

  renderPerformance() {
    return (
      <div style={styles.feedbackText}>
        <span>{i18n.feedbackRubricEvaluation()}</span>&nbsp;
        <span style={styles.rubricPerformance}>
          {RubricPerformanceLabels[this.props.feedback.performance]}
        </span>
      </div>
    );
  }

  renderComment() {
    const {comment} = this.props.feedback;
    const {expanded, commentHeight} = this.state;

    const isCommentExpandable = commentHeight > visibleCommentHeight;

    const commentContainerStyle = expanded
      ? styles.commentContainer
      : styles.commentContainerCollapsed;

    return (
      <div style={commentContainerStyle}>
        {isCommentExpandable && (
          <FontAwesome
            style={styles.expanderIcon}
            icon={expanded ? 'caret-down' : 'caret-right'}
            onClick={expanded ? this.collapseComment : this.expandComment}
          />
        )}
        <span style={styles.commentText}>
          <div ref={r => (this.comment = r)} style={styles.feedbackText}>
            &quot;{comment}&quot;
          </div>
        </span>
      </div>
    );
  }

  render() {
    const {
      created_at,
      comment,
      performance,
      review_state
    } = this.props.feedback;

    const commentExists = comment.length > 2;

    const commentSeenStyle = this.feedbackSeenByStudent()
      ? styles.commentBlockSeen
      : {};

    const displayReviewState =
      review_state === ReviewStates.keepWorking ||
      review_state === ReviewStates.completed;

    return (
      <div style={{...styles.commentBlock, ...commentSeenStyle}}>
        <TimeAgo style={styles.time} dateString={created_at} />
        {displayReviewState && this.renderReviewState()}
        {performance && this.renderPerformance()}
        {commentExists && this.renderComment()}
      </div>
    );
  }
}

const styles = {
  commentBlock: {
    backgroundColor: color.lightest_gray,
    borderRadius: '3px',
    width: '100%',
    marginBottom: 8,
    boxSizing: 'border-box',
    padding: '8px 16px'
  },
  commentBlockSeen: {
    opacity: '60%'
  },
  time: {
    fontSize: 14,
    lineHeight: '17px',
    color: color.light_gray,
    float: 'right'
  },
  feedbackText: {
    color: color.dark_charcoal,
    marginTop: 8,
    fontSize: 14,
    lineHeight: '21px'
  },
  rubricPerformance: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  reviewState: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    color: color.charcoal
  },
  keepWorkingText: {
    color: color.red
  },
  commentContainer: {
    display: 'flex'
  },
  commentContainerCollapsed: {
    display: 'flex',
    overflow: 'hidden',
    maxHeight: visibleCommentHeight
  },
  expanderIcon: {
    fontSize: 18,
    paddingRight: 15,
    paddingLeft: 5,
    marginTop: 8,
    cursor: 'pointer'
  },
  commentText: {
    fontFamily: '"Gotham 5r", sans-serif'
  }
};
