import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

class Comment extends React.Component {
  static propTypes = {
    isEditable: PropTypes.bool,
    comment: PropTypes.string,
    placeholderText: PropTypes.string,
    onCommentChange: PropTypes.func.isRequired
  };

  commentChanged = event => {
    this.props.onCommentChange(event.target.value);
  };

  render() {
    const readOnlyStyle = !this.props.isEditable && styles.readOnly;

    return (
      <textarea
        id="ui-test-feedback-input"
        style={{...styles.textInput, ...readOnlyStyle}}
        onChange={this.commentChanged}
        placeholder={this.props.placeholderText}
        value={this.props.comment}
        readOnly={!this.props.isEditable}
      />
    );
  }
}

const styles = {
  textInput: {
    marginTop: 0,
    marginBottom: 8,
    display: 'block',
    width: '90%',
    fontSize: 12
  },
  readOnly: {
    backgroundColor: color.lightest_cyan
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

export default Comment;
