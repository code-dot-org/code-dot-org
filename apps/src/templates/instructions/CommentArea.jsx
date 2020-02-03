import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const styles = {
  textInput: {
    marginTop: 0,
    marginBottom: 8,
    display: 'block',
    width: '90%',
    fontSize: 12
  },
  textInputStudent: {
    marginTop: 0,
    marginBottom: 8,
    display: 'block',
    width: '90%',
    backgroundColor: color.lightest_cyan,
    fontSize: 12
  },
  h1: {
    color: color.charcoal,
    marginTop: 0,
    marginBottom: 8,
    fontSize: 18,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  }
};

export class CommentArea extends Component {
  static propTypes = {
    disabledMode: PropTypes.bool,
    comment: PropTypes.string,
    placeholderText: PropTypes.string,
    onCommentChange: PropTypes.func.isRequired
  };

  commentChanged = event => {
    this.props.onCommentChange(event.target.value);
  };

  render() {
    const textInputStyle = this.props.disabledMode
      ? styles.textInputStudent
      : styles.textInput;
    return (
      <div>
        <h1 style={styles.h1}> {i18n.feedbackCommentAreaHeader()} </h1>
        <textarea
          id="ui-test-feedback-input"
          style={textInputStyle}
          onChange={this.commentChanged}
          placeholder={this.props.placeholderText}
          value={this.props.comment}
          readOnly={this.props.disabledMode}
        />
      </div>
    );
  }
}
