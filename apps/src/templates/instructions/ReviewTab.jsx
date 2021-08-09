import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import color from '@cdo/apps/util/color';
import _ from 'lodash';
import javalabMsg from '@cdo/javalab/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Comment from './codeReview/Comment';
import CommentEditor from './codeReview/CommentEditor';
import * as codeReviewDataApi from './codeReview/codeReviewDataApi';

const FLASH_ERROR_TIME_MS = 5000;

class ReviewTab extends Component {
  static propTypes = {
    // Populated by redux
    viewAsCodeReviewer: PropTypes.bool.isRequired
  };

  state = {
    reviewCheckboxEnabled: false,
    isReadyForReview: false,
    reviewableProjectId: '',
    loadingReviewableState: false,
    errorSavingReviewableProject: false,
    comments: [],
    token: '',
    forceRecreateEditorKey: 0
  };

  componentDidMount() {
    const {
      channelId,
      serverLevelId,
      serverScriptId
    } = getStore().getState().pageConstants;

    // If there's no channelId (happens when a teacher is viewing as a student who has not done any work on a level),
    // do not make API calls that require a channelId
    if (channelId) {
      codeReviewDataApi
        .getCodeReviewCommentsForProject(channelId)
        .done((data, _, request) => {
          this.setState({
            comments: data,
            token: request.getResponseHeader('csrf-token')
          });
        });

      codeReviewDataApi
        .getPeerReviewStatus(channelId, serverLevelId, serverScriptId)
        .done(data => {
          const id = (data && data.id) || null;
          this.setState({
            reviewCheckboxEnabled: data.canMarkReviewable,
            isReadyForReview: data.reviewEnabled,
            reviewableProjectId: id
          });
        })
        .fail(() => {
          this.setState({
            reviewCheckboxEnabled: false,
            isReadyForReview: false
          });
        });
    }
  }

  onNewCommentSubmit = commentText => {
    const channelId = getStore().getState().pageConstants.channelId;
    const {token} = this.state;

    codeReviewDataApi
      .submitNewCodeReviewComment(commentText, channelId, token)
      .done(newComment => {
        const comments = this.state.comments;
        comments.push(newComment);

        this.setState({
          comments: comments,
          forceRecreateEditorKey: this.state.forceRecreateEditorKey + 1
        });
      });
  };

  onCommentDelete = deletedCommentId => {
    const {token} = this.state;

    codeReviewDataApi
      .deleteCodeReviewComment(deletedCommentId, token)
      .done(() => {
        const comments = [...this.state.comments];
        _.remove(comments, comment => comment.id === deletedCommentId);

        this.setState({comments: comments});
      })
      .fail(() => this.flashErrorOnComment(deletedCommentId));
  };

  onCommentResolveStateToggle = (resolvedCommentId, newResolvedStatus) => {
    const {token} = this.state;

    codeReviewDataApi
      .resolveCodeReviewComment(resolvedCommentId, newResolvedStatus, token)
      .done(() => {
        const comments = [...this.state.comments];
        const resolvedCommentIndex = comments.findIndex(
          comment => comment.id === resolvedCommentId
        );
        comments[resolvedCommentIndex].isResolved = !comments[
          resolvedCommentIndex
        ].isResolved;

        this.setState({comments: comments});
      })
      .fail(() => this.flashErrorOnComment(resolvedCommentId));
  };

  flashErrorOnComment = commentId => {
    this.setCommentErrorStatus(commentId, true);
    setTimeout(
      () => this.setCommentErrorStatus(commentId, false),
      FLASH_ERROR_TIME_MS
    );
  };

  setCommentErrorStatus = (commentId, newErrorStatus) => {
    const comments = [...this.state.comments];
    const resolvedCommentIndex = comments.findIndex(
      comment => comment.id === commentId
    );
    comments[resolvedCommentIndex].hasError = newErrorStatus;

    this.setState({comments: comments});
  };

  renderReadyForReviewCheckbox() {
    if (
      !this.state.reviewCheckboxEnabled ||
      !this.state.token ||
      this.state.token.length === 0
    ) {
      return null;
    }

    const {
      isReadyForReview,
      errorSavingReviewableProject,
      loadingReviewableState
    } = this.state;

    return (
      <div style={styles.checkboxContainer}>
        <label style={styles.label}>
          {loadingReviewableState ? (
            <Spinner size="small" style={styles.checkbox} />
          ) : (
            <input
              type="checkbox"
              checked={isReadyForReview}
              onChange={() => {
                this.setReadyForReview(!isReadyForReview);
              }}
              style={styles.checkbox}
            />
          )}
          {javalabMsg.enablePeerReview()}
        </label>
        {errorSavingReviewableProject && (
          <div style={styles.checkboxErrorMessage}>
            {javalabMsg.togglePeerReviewError()}
          </div>
        )}
      </div>
    );
  }

  setReadyForReview(isReadyForReview) {
    this.setState({
      loadingReviewableState: true,
      errorSavingReviewableProject: false
    });

    if (isReadyForReview) {
      const {
        channelId,
        serverLevelId,
        serverScriptId
      } = getStore().getState().pageConstants;
      codeReviewDataApi
        .enablePeerReview(
          channelId,
          serverLevelId,
          serverScriptId,
          this.state.token
        )
        .done(data => {
          this.setState({
            reviewableProjectId: data.id,
            isReadyForReview: true,
            errorSavingReviewableProject: false,
            loadingReviewableState: false
          });
        })
        .fail(() => {
          this.setState({
            isReadyForReview: false,
            errorSavingReviewableProject: true,
            loadingReviewableState: false
          });
        });
    } else {
      codeReviewDataApi
        .disablePeerReview(this.state.reviewableProjectId, this.state.token)
        .done(() => {
          this.setState({
            isReadyForReview: false,
            errorSavingReviewableProject: false,
            loadingReviewableState: false
          });
        })
        .fail(() => {
          this.setState({
            isReadyForReview: true,
            errorSavingReviewableProject: true,
            loadingReviewableState: false
          });
        });
    }
  }

  renderComments(comments, canShowNoCommentsMessage) {
    if (comments.length === 0 && canShowNoCommentsMessage) {
      return (
        <div style={styles.messageText}>
          {javalabMsg.noCodeReviewComments()}
        </div>
      );
    }

    return comments.map(comment => {
      return (
        <Comment
          comment={comment}
          key={`code-review-comment-${comment.id}`}
          onResolveStateToggle={() =>
            this.onCommentResolveStateToggle(comment.id, !comment.isResolved)
          }
          onDelete={() => this.onCommentDelete(comment.id)}
          viewAsCodeReviewer={this.props.viewAsCodeReviewer}
        />
      );
    });
  }

  renderCommentEditor(forceRecreateEditorKey) {
    if (!this.state.isReadyForReview) {
      return (
        <div style={styles.messageText}>
          {javalabMsg.disabledPeerReviewMessage()}
        </div>
      );
    }

    return (
      <CommentEditor
        onNewCommentSubmit={this.onNewCommentSubmit}
        key={forceRecreateEditorKey}
      />
    );
  }

  render() {
    const {comments, forceRecreateEditorKey, isReadyForReview} = this.state;

    // channelId is not available on projects where the student has not edited the starter code.
    // comments cannot be made on projects in this tate.
    const projectOwnerHasEditedCode = !!getStore().getState().pageConstants
      .channelId;

    if (projectOwnerHasEditedCode) {
      return (
        <div style={styles.reviewsContainer}>
          <div style={styles.reviewHeader}>
            {this.renderReadyForReviewCheckbox()}
          </div>
          <div style={styles.commentsSection}>
            <div style={styles.messageText}>
              {javalabMsg.feedbackBeginning()}
            </div>
            {this.renderComments(comments, !isReadyForReview)}
            {this.renderCommentEditor(forceRecreateEditorKey)}
          </div>
        </div>
      );
    } else {
      return (
        <div style={{...styles.reviewsContainer, ...styles.messageText}}>
          {javalabMsg.noCodeReviewUntilStudentEditsCode()}
        </div>
      );
    }
  }
}

export const UnconnectedReviewTab = ReviewTab;
export default connect(state => ({
  viewAsCodeReviewer: state.pageConstants.isCodeReviewing
}))(ReviewTab);

const styles = {
  reviewsContainer: {
    margin: '25px 5%'
  },
  label: {
    margin: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  checkbox: {margin: '0 7px 0 0'},
  checkboxContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'column'
  },
  checkboxErrorMessage: {
    fontStyle: 'italic',
    textAlign: 'end',
    fontSize: '12px'
  },
  messageText: {
    fontSize: '18px',
    marginBottom: '25px',
    textAlign: 'center',
    fontStyle: 'italic',
    color: color.light_gray
  },
  reviewHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '25px'
  },
  commentsSection: {
    display: 'flex',
    flexDirection: 'column'
  }
};
