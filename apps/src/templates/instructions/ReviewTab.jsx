import React, {Component} from 'react';
import {getStore} from '@cdo/apps/redux';
import _ from 'lodash';
import javalabMsg from '@cdo/javalab/locale';
import Comment from './codeReview/Comment';
import CommentEditor from './codeReview/CommentEditor';
import * as codeReviewDataApi from './codeReview/codeReviewDataApi';

export default class ReviewTab extends Component {
  state = {
    isReadyForReview: false,
    comments: [],
    token: '',
    forceRecreateEditorKey: 0
  };

  componentDidMount() {
    const channelId = getStore().getState().pageConstants.channelId;

    codeReviewDataApi
      .getCodeReviewCommentsForProject(channelId)
      .done((data, _, request) => {
        this.setState({
          comments: data,
          token: request.getResponseHeader('csrf-token')
        });
      });
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
    setTimeout(() => this.setCommentErrorStatus(commentId, false), 5000);
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
    const {isReadyForReview} = this.state;

    return (
      <div style={styles.checkboxContainer}>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={isReadyForReview}
            onChange={() =>
              this.setState({isReadyForReview: !isReadyForReview})
            }
            style={styles.checkbox}
          />
          {javalabMsg.enablePeerReview()}
        </label>
      </div>
    );
  }

  render() {
    const {comments, forceRecreateEditorKey} = this.state;

    return (
      <div style={styles.reviewsContainer}>
        {this.renderReadyForReviewCheckbox()}
        {comments.map(comment => {
          return (
            <Comment
              comment={comment}
              key={`code-review-comment-${comment.id}`}
              onResolveStateToggle={() =>
                this.onCommentResolveStateToggle(
                  comment.id,
                  !comment.isResolved
                )
              }
              onDelete={() => this.onCommentDelete(comment.id)}
            />
          );
        })}
        <CommentEditor
          onNewCommentSubmit={this.onNewCommentSubmit}
          key={forceRecreateEditorKey}
        />
      </div>
    );
  }
}

const styles = {
  reviewsContainer: {
    margin: '10px 5%'
  },
  label: {
    margin: 0
  },
  checkbox: {margin: '0 7px 0 0'},
  checkboxContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '10px 0'
  }
};
