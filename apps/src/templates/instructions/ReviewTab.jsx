import React, {Component} from 'react';
import $ from 'jquery';
import javalabMsg from '@cdo/javalab/locale';
import Comment from './codeReview/Comment';
import CommentEditor from './codeReview/CommentEditor';
import {getStore} from '@cdo/apps/redux';
import * as topInstructionsDataApi from '@cdo/apps/templates/instructions/topInstructionsDataApi';

export default class ReviewTab extends Component {
  state = {
    readyForReview: false,
    comments: [],
    token: '',
    forceRecreateEditorKey: 0
  };

  componentDidMount() {
    const channelId = getStore().getState().pageConstants.channelId;

    // projectVersion = 'latest' is a placeholder until we implement
    // storing project version when saving comments
    topInstructionsDataApi
      .getCodeReviewCommentsForProject(channelId, 'latest')
      .done((data, _, request) => {
        this.setState({
          comments: data,
          token: request.getResponseHeader('csrf-token')
        });
      });
  }

  onNewCommentSubmit = newCommentText => {
    // projectVersion = 'latest' is a placeholder until we implement
    // storing project version when saving comments
    $.ajax({
      url: `/code_review_comments`,
      type: 'POST',
      headers: {'X-CSRF-Token': this.state.token},
      data: {
        channel_id: getStore().getState().pageConstants.channelId,
        project_version: 'latest',
        comment: newCommentText
      }
    }).done(newComment => {
      const comments = this.state.comments;
      comments.push(newComment);

      this.setState({
        comments: comments,
        forceRecreateEditorKey: this.state.forceRecreateEditorKey + 1
      });
    });
  };

  renderReadyForReviewCheckbox() {
    const {readyForReview} = this.state;

    return (
      <div style={styles.checkboxContainer}>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={readyForReview}
            onChange={() => this.setState({readyForReview: !readyForReview})}
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
