import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

const styles = {
  textInput: {
    marginTop: 0,
    marginBottom: 16,
    display: 'block',
    width: '90%'
  },
  textInputStudent: {
    margin: 10,
    display: 'block',
    width: '90%',
    backgroundColor: color.lightest_cyan
  },
  h1: {
    color: color.charcoal,
    marginTop: 8,
    marginBottom: 12,
    fontSize: 24,
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  }
};

export class CommentArea extends Component {
  static propTypes = {
    disabledMode: PropTypes.bool,
    comment: PropTypes.string,
    placeholderText: PropTypes.string,
    studentHasFeedback: PropTypes.bool,
    onCommentChange: PropTypes.func
  };

  commentChanged = event => {
    this.props.onCommentChange(event.target.value);
  };

  render() {
    return (
      <div>
        <h1 style={styles.h1}>Teacher Feedback</h1>
        <textarea
          id="ui-test-feedback-input"
          style={
            this.props.disabledMode ? styles.textInputStudent : styles.textInput
          }
          onChange={this.commentChanged}
          placeholder={this.props.placeholderText}
          value={this.props.comment}
          readOnly={this.props.disabledMode}
        />
      </div>
    );
  }
}
