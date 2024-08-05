import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import fontConstants from '@cdo/apps/fontConstants';
import firehoseClient from '@cdo/apps/metrics/utils/firehose';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {KeepWorkingBadge} from '@cdo/apps/templates/progress/BubbleBadge';
import {UnlocalizedTimeAgo as TimeAgo} from '@cdo/apps/templates/TimeAgo';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {feedbackShape} from './types';

const getElementHeight = element => {
  return ReactDOM.findDOMNode(element).offsetHeight;
};

const visibleCommentHeight = 46;

function LevelFeedbackEntry({feedback}) {
  const {
    id,
    created_at,
    comment,
    performance,
    review_state,
    seen_on_feedback_page_at,
    student_first_visited_at,
    is_awaiting_teacher_review,
  } = feedback;

  const feedbackSeenByStudent = !!(
    seen_on_feedback_page_at || student_first_visited_at
  );

  const commentExists = comment.length > 2;
  const commentSeenStyle = feedbackSeenByStudent ? styles.commentBlockSeen : {};

  const displayReviewState =
    review_state === ReviewStates.keepWorking ||
    review_state === ReviewStates.completed;

  return (
    <div style={{...styles.commentBlock, ...commentSeenStyle}}>
      <TimeAgo style={styles.time} dateString={created_at} />
      {displayReviewState && (
        <ReviewState
          reviewState={review_state}
          isAwaitingTeacherReview={is_awaiting_teacher_review}
        />
      )}
      {performance && <Performance performance={performance} />}
      {commentExists && (
        <Comment
          commentText={comment}
          feedbackSeenByStudent={feedbackSeenByStudent}
          feedbackId={id}
        />
      )}
    </div>
  );
}

function ReviewState({reviewState, isAwaitingTeacherReview}) {
  if (reviewState === ReviewStates.completed) {
    return <div style={styles.reviewState}>{i18n.reviewedComplete()}</div>;
  } else if (isAwaitingTeacherReview) {
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

ReviewState.propTypes = {
  reviewState: PropTypes.string,
  isAwaitingTeacherReview: PropTypes.bool,
};

function Performance({performance}) {
  const RubricPerformanceLabels = {
    performanceLevel1: i18n.rubricLevelOneHeader(),
    performanceLevel2: i18n.rubricLevelTwoHeader(),
    performanceLevel3: i18n.rubricLevelThreeHeader(),
    performanceLevel4: i18n.rubricLevelFourHeader(),
  };

  return (
    <div style={styles.feedbackText}>
      <span>{i18n.feedbackRubricEvaluation()}</span>&nbsp;
      <span style={styles.rubricPerformance}>
        {RubricPerformanceLabels[performance]}
      </span>
    </div>
  );
}

Performance.propTypes = {
  performance: PropTypes.string,
};

function Comment({commentText, feedbackSeenByStudent, feedbackId}) {
  const commentRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [commentHeight, setCommentHeight] = useState(0);

  useEffect(() => {
    commentRef.current &&
      setCommentHeight(getElementHeight(commentRef.current));
  }, [commentRef]);

  const expandComment = () => {
    setExpanded(true);
    firehoseClient.putRecord(
      {
        study: 'all-feedback',
        event: 'expand-feedback',
        data_json: {feedback_id: feedbackId},
      },
      {includeUserId: true}
    );
  };

  const collapseComment = () => {
    setExpanded(false);
  };

  const isCommentExpandable = commentHeight > visibleCommentHeight;
  const showCommentFade = isCommentExpandable && !expanded;

  const commentContainerStyle = expanded
    ? styles.commentContainer
    : styles.commentContainerCollapsed;

  return (
    <div style={commentContainerStyle}>
      {isCommentExpandable && (
        <FontAwesome
          style={styles.expanderIcon}
          icon={expanded ? 'caret-down' : 'caret-right'}
          onClick={expanded ? collapseComment : expandComment}
        />
      )}
      <span style={styles.commentText}>
        <div ref={commentRef} style={styles.feedbackText}>
          &quot;{commentText}&quot;
        </div>
        {showCommentFade && (
          <div
            id="comment-fade"
            style={{
              ...styles.fadeout,
              ...(feedbackSeenByStudent && styles.fadeoutSeen),
            }}
          />
        )}
      </span>
    </div>
  );
}

Comment.propTypes = {
  commentText: PropTypes.string,
  feedbackSeenByStudent: PropTypes.bool,
  feedbackId: PropTypes.number,
};

const styles = {
  commentBlock: {
    backgroundColor: color.lightest_gray,
    borderRadius: '3px',
    width: '100%',
    marginBottom: 8,
    boxSizing: 'border-box',
    padding: '8px 16px',
  },
  commentBlockSeen: {
    opacity: '60%',
  },
  time: {
    fontSize: 14,
    lineHeight: '17px',
    color: color.light_gray,
    float: 'right',
  },
  feedbackText: {
    color: color.dark_charcoal,
    marginTop: 8,
    fontSize: 14,
    lineHeight: '21px',
  },
  rubricPerformance: {
    ...fontConstants['main-font-semi-bold'],
  },
  reviewState: {
    display: 'flex',
    alignItems: 'center',
    ...fontConstants['main-font-semi-bold'],
    fontSize: 14,
    color: color.charcoal,
  },
  keepWorkingText: {
    color: color.red,
  },
  commentContainer: {
    display: 'flex',
  },
  commentContainerCollapsed: {
    display: 'flex',
    overflow: 'hidden',
    maxHeight: visibleCommentHeight,
  },
  expanderIcon: {
    fontSize: 18,
    paddingRight: 15,
    paddingLeft: 5,
    marginTop: 8,
    cursor: 'pointer',
  },
  commentText: {
    position: 'relative', // for positioning fade over comment text
    ...fontConstants['main-font-semi-bold'],
  },
  fadeout: {
    bottom: 0,
    height: 'calc(100% - 15px)',
    background:
      'linear-gradient(rgba(231, 232, 234, .1) 0%,rgba(231, 232, 234, 1) 100%)',
    position: 'absolute',
    width: '100%',
  },
};

LevelFeedbackEntry.propTypes = {feedback: feedbackShape};

export default LevelFeedbackEntry;
