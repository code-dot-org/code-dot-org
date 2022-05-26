import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import moment from 'moment';
import javalabMsg from '@cdo/javalab/locale';
import Comment from '@cdo/apps/templates/instructions/codeReviewV2/Comment';
import CodeReviewCommentEditor from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewCommentEditor';
import {reviewShape} from '@cdo/apps/templates/instructions/codeReviewV2/shapes';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';

const CodeReviewTimelineReview = ({
  review,
  isLastElementInTimeline,
  addCodeReviewComment,
  closeReview,
  toggleResolveComment,
  viewAsCodeReviewer
}) => {
  const {id, createdAt, isOpen, version, isVersionExpired, comments} = review;
  const [displayCloseError, setDisplayCloseError] = useState(false);
  const formattedDate = moment(createdAt).format('M/D/YYYY [at] h:mm A');

  const handleCloseCodeReview = () => {
    closeReview(
      () => setDisplayCloseError(false), // on success
      () => setDisplayCloseError(true) // on failure
    );
  };

  return (
    <CodeReviewTimelineElement
      type={codeReviewTimelineElementType.CODE_REVIEW}
      isLast={isLastElementInTimeline}
      projectVersionId={version}
      isProjectVersionExpired={isVersionExpired}
    >
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.icon}>
            <FontAwesome icon="comments-o" />
          </div>
          <div style={styles.title}>
            <div style={styles.codeReviewTitle}>{javalabMsg.codeReview()}</div>
            <div style={styles.date}>
              {javalabMsg.openedDate({date: formattedDate})}
            </div>
          </div>
          {isOpen && (
            <div>
              <Button
                icon="close"
                style={{fontSize: 13, margin: 0}}
                onClick={handleCloseCodeReview}
                text={javalabMsg.closeReview()}
                color={Button.ButtonColor.blue}
              />
              {displayCloseError && <CodeReviewError />}
            </div>
          )}
        </div>
        {isOpen && !viewAsCodeReviewer && (
          <div style={styles.codeWorkspaceDisabledMsg}>
            <span style={styles.note}>{javalabMsg.noteWorthy()}</span>
            &nbsp;
            {javalabMsg.codeEditingDisabled()}
          </div>
        )}
        {comments &&
          comments.map(comment => {
            // When we create the V2 comment, no longer convert, use the new comment shape
            const convertDataForComponent = {
              id: comment.id,
              name: comment.commenterName,
              commentText: comment.comment,
              timestampString: comment.createdAt,
              isResolved: comment.isResolved
            };
            return (
              <Comment
                comment={convertDataForComponent}
                key={`code-review-comment-${comment.id}`}
                onResolveStateToggle={toggleResolveComment}
                onDelete={() => {}}
                viewAsCodeReviewer={viewAsCodeReviewer}
              />
            );
          })}
        {isOpen && viewAsCodeReviewer && (
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
  viewAsCodeReviewer: state.pageConstants.isCodeReviewing
}))(CodeReviewTimelineReview);

CodeReviewTimelineReview.propTypes = {
  isLastElementInTimeline: PropTypes.bool,
  review: reviewShape,
  addCodeReviewComment: PropTypes.func.isRequired,
  closeReview: PropTypes.func.isRequired,
  toggleResolveComment: PropTypes.func.isRequired,
  viewAsCodeReviewer: PropTypes.bool
};

const styles = {
  wrapper: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '16px 12px'
  },
  icon: {
    marginRight: '5px',
    backgroundColor: 'lightgrey',
    width: '30px',
    height: '30px',
    borderRadius: '100%',
    fontSize: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    display: 'flex',
    marginBottom: '10px'
  },
  title: {
    flexGrow: 1,
    fontStyle: 'italic'
  },
  codeReviewTitle: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  date: {
    fontSize: '12px',
    marginBottom: '10px',
    lineHeight: '12px'
  },
  codeWorkspaceDisabledMsg: {
    textAlign: 'center',
    fontStyle: 'italic',
    margin: '10px 0'
  },
  note: {
    fontFamily: '"Gotham 5r", sans-serif'
  }
};
