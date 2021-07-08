import React, {Component} from 'react';
import PropTypes from 'prop-types';
import javalabMsg from '@cdo/javalab/locale';
import Comment from './codeReview/Comment';
import {commentShape} from './codeReview/commentShape';
import CommentEditor from './codeReview/CommentEditor';

export default class ReviewTab extends Component {
  static propTypes = {
    comments: PropTypes.arrayOf(commentShape)
  };

  state = {
    readyForReview: false
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
    const {comments} = this.props;

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
        <CommentEditor />
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
