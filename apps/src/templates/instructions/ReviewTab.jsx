import React, {Component} from 'react';
import PropTypes from 'prop-types';
import javalabMsg from '@cdo/javalab/locale';
import Comment from './codeReview/Comment';
import {commentShape} from './codeReview/commentShape';
import CommentEditor from './codeReview/CommentEditor';

export default class ReviewTab extends Component {
  static propTypes = {
    comments: PropTypes.arrayOf(commentShape).isRequired,
    token: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      readyForReview: false,
      comments: this.props.comments
    };
  }

  onNewCommentSubmit = newComment => {
    const comments = this.state.comments;
    comments.push(newComment);

    this.setState({comments: comments});
  };

  renderReadyForReviewCheckbox() {
    const readyForReview = this.state.readyForReview;

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
    const {token} = this.props;
    const {comments} = this.state;

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
