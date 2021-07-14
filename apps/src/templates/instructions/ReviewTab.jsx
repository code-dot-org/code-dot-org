import React, {Component} from 'react';
import javalabMsg from '@cdo/javalab/locale';
import Comment from './codeReview/Comment';
import CommentEditor from './codeReview/CommentEditor';
import {getStore} from '@cdo/apps/redux';
import * as topInstructionsDataApi from '@cdo/apps/templates/instructions/topInstructionsDataApi';

export default class ReviewTab extends Component {
  state = {
    readyForReview: false,
    comments: [],
    token: ''
  };

  componentDidMount() {
    const channelId = getStore().getState().pageConstants.channelId;

    topInstructionsDataApi
      .getCodeReviewCommentsForProject(channelId, 'yyy')
      .done((data, _, request) => {
        this.setState({
          comments: data,
          token: request.getResponseHeader('csrf-token')
        });
      });
  }

  onNewCommentSubmit = newComment => {
    const comments = this.state.comments;
    comments.push(newComment);

    this.setState({comments: comments});
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
    const {token, comments} = this.state;

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
          token={token}
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
