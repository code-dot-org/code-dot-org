import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {hideCommentModal} from './teacherCodeCommentRedux';

const styles = {
  container: {
    backgroundColor: 'lightgray',
    position: 'absolute',
    zIndex: 9999,
    padding: 10,
    border: '1px solid darkgray'
  }
};

class TeacherCodeComment extends React.Component {
  static propTypes = {
    handleClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    lineNumber: PropTypes.number,
    position: PropTypes.shape({
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired
    })
  };

  close = () => {
    this.props.handleClose();
  };

  render() {
    if (!(this.props && this.props.isOpen)) {
      return null;
    }

    return (
      <div
        style={{
          left: this.props.position.left,
          top: this.props.position.top,
          ...styles.container
        }}
      >
        <textarea />
        <button type="submit">submit</button>
        <button type="button" onClick={this.close}>
          cancel
        </button>
      </div>
    );
  }
}

export const UnconnectedTeacherCodeComment = TeacherCodeComment;
export default connect(
  state => state.teacherCodeComment,
  dispatch => ({
    handleClose: () => dispatch(hideCommentModal())
  })
)(TeacherCodeComment);
