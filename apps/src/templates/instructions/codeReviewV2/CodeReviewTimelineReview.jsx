import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import moment from 'moment';
import javalabMsg from '@cdo/javalab/locale';
import Comment from '@cdo/apps/templates/instructions/codeReview/Comment';
import CodeReviewCommentEditor from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewCommentEditor';
import {reviewShape} from '@cdo/apps/templates/instructions/codeReviewV2/shapes';

const CodeReviewTimelineReview = ({
  review,
  isLastElementInTimeline,
  addCodeReviewComment,
  closeReview
}) => {
  const {
    createdAt,
    isClosed,
    projectVersion,
    isVersionExpired,
    comments
  } = review;
  const formattedDate = moment(createdAt).format('M/D/YYYY [at] h:mm A');

  return (
    <CodeReviewTimelineElement
      type={codeReviewTimelineElementType.CODE_REVIEW}
      isLast={isLastElementInTimeline}
      projectVersionId={projectVersion}
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
          {!isClosed && (
            <div>
              <Button
                icon="close"
                style={{fontSize: 13, margin: 0}}
                onClick={closeReview}
                text={javalabMsg.closeReview()}
                color={Button.ButtonColor.blue}
              />
            </div>
          )}
        </div>
        {comments.map(comment => (
          <Comment
            comment={comment}
            key={`code-review-comment-${comment.id}`}
            onResolveStateToggle={() => {}}
            onDelete={() => {}}
            viewAsCodeReviewer={true}
          />
        ))}
        {!isClosed && (
          <CodeReviewCommentEditor
            addCodeReviewComment={addCodeReviewComment}
          />
        )}
        {!isClosed && (
          <div style={styles.codeWorkspaceDisabledMsg}>
            <span style={styles.note}>{javalabMsg.noteWorthy()}</span>&nbsp;
            {javalabMsg.codeEditingDisabled()}
          </div>
        )}
      </div>
    </CodeReviewTimelineElement>
  );
};

CodeReviewTimelineReview.propTypes = {
  isLastElementInTimeline: PropTypes.bool,
  review: reviewShape,
  addCodeReviewComment: PropTypes.func.isRequired,
  closeReview: PropTypes.func.isRequired
};

export default CodeReviewTimelineReview;

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
