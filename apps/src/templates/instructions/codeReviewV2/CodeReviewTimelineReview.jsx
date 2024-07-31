import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import {queryParams} from '@cdo/apps/code-studio/utils';
import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import CodeReviewCommentEditor from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewCommentEditor';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType,
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import Comment from '@cdo/apps/templates/instructions/codeReviewV2/Comment';
import {reviewShape} from '@cdo/apps/templates/instructions/codeReviewV2/shapes';
import javalabMsg from '@cdo/javalab/locale';

const CodeReviewTimelineReview = ({
  review,
  isLastElementInTimeline,
  addCodeReviewComment,
  closeReview,
  toggleResolveComment,
  deleteCodeReviewComment,
  currentUserId,
}) => {
  const {id, createdAt, isOpen, version, ownerId, ownerName, comments} = review;
  const [displayCloseError, setDisplayCloseError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const formattedDate = moment(createdAt).format('M/D/YYYY [at] h:mm A');

  const isViewingOldVersion = !!queryParams('version');

  const handleCloseCodeReview = () => {
    setIsClosing(true);
    closeReview(
      () => handleCloseComplete(false), // on success
      () => handleCloseComplete(true) // on failure
    );
  };

  const handleCloseComplete = requestFailed => {
    setDisplayCloseError(requestFailed);
    setIsClosing(false);
  };

  const viewingAsOwner = ownerId === currentUserId;

  return (
    <CodeReviewTimelineElement
      type={codeReviewTimelineElementType.CODE_REVIEW}
      isLast={isLastElementInTimeline}
      projectVersionId={version}
    >
      <div
        style={styles.wrapper}
        className="uitest-code-review-timeline-review"
      >
        <div style={styles.header}>
          <div style={styles.icon}>
            <FontAwesome icon="comments-o" />
          </div>
          <div style={styles.title}>
            <div style={styles.codeReviewTitle}>
              {viewingAsOwner
                ? javalabMsg.codeReviewForYou()
                : javalabMsg.codeReviewForStudent({student: ownerName})}
            </div>
            <div style={styles.date}>
              {javalabMsg.openedDate({date: formattedDate})}
            </div>
          </div>
          {isOpen && viewingAsOwner && !isViewingOldVersion && (
            <div>
              <Button
                className="uitest-close-code-review"
                icon="close"
                style={{fontSize: 13, margin: 0}}
                onClick={handleCloseCodeReview}
                text={javalabMsg.closeReview()}
                color={Button.ButtonColor.blue}
                disabled={isClosing}
              />
              {displayCloseError && <CodeReviewError />}
            </div>
          )}
        </div>
        {isOpen && viewingAsOwner && (
          <div style={styles.codeWorkspaceDisabledMsg}>
            <span style={styles.note}>{javalabMsg.noteWorthy()}</span>
            &nbsp;
            {javalabMsg.codeEditingDisabled()}
          </div>
        )}
        {comments &&
          comments.map(comment => {
            return (
              <Comment
                viewingAsOwner={ownerId === currentUserId}
                comment={comment}
                key={`code-review-comment-${comment.id}`}
                onResolveStateToggle={toggleResolveComment}
                onDelete={deleteCodeReviewComment}
              />
            );
          })}
        {comments?.length === 0 && !isOpen && (
          <span>{javalabMsg.noFeedbackGiven()}</span>
        )}
        {isOpen && !viewingAsOwner && !isViewingOldVersion && (
          <CodeReviewCommentEditor
            addCodeReviewComment={(commentText, onSuccess, onFailure) =>
              addCodeReviewComment(commentText, id, onSuccess, onFailure)
            }
          />
        )}
      </div>
    </CodeReviewTimelineElement>
  );
};

export const UnconnectedCodeReviewTimelineReview = CodeReviewTimelineReview;

export default connect(state => ({
  currentUserId: state.currentUser?.userId,
}))(CodeReviewTimelineReview);

CodeReviewTimelineReview.propTypes = {
  isLastElementInTimeline: PropTypes.bool,
  review: reviewShape,
  addCodeReviewComment: PropTypes.func.isRequired,
  closeReview: PropTypes.func.isRequired,
  toggleResolveComment: PropTypes.func.isRequired,
  deleteCodeReviewComment: PropTypes.func.isRequired,
  currentUserId: PropTypes.number,
};

const styles = {
  wrapper: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '16px 12px',
  },
  icon: {
    marginRight: '5px',
    backgroundColor: 'lightgrey',
    minWidth: '30px',
    height: '30px',
    borderRadius: '100%',
    fontSize: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    marginBottom: '10px',
  },
  title: {
    flexGrow: 1,
    fontStyle: 'italic',
    marginRight: '10px',
  },
  codeReviewTitle: {
    ...fontConstants['main-font-semi-bold'],
    lineHeight: '14px',
    marginBottom: '4px',
  },
  author: {
    fontSize: '12px',
    lineHeight: '12px',
    marginBottom: '4px',
  },
  date: {
    fontSize: '12px',
    marginBottom: '10px',
    lineHeight: '15px',
  },
  codeWorkspaceDisabledMsg: {
    textAlign: 'center',
    fontStyle: 'italic',
    margin: '10px 0',
  },
  note: {
    ...fontConstants['main-font-semi-bold'],
  },
};
