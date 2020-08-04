import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {
  addOrUpdateComment,
  hideCommentModal,
  setComments
} from './teacherCodeCommentRedux';

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
    addOrUpdateComment: PropTypes.func.isRequired,
    comments: PropTypes.object,
    hideCommentModal: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    lineNumber: PropTypes.number,
    setComments: PropTypes.func.isRequired,
    position: PropTypes.shape({
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired
    })
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount() {
    // load existing comments into redux
    this.props.setComments({
      3: 'initial comment'
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.lineNumber !== this.props.lineNumber) {
      // clear line number before change
      let comment = '';
      if (this.props.isOpen && this.props.lineNumber in this.props.comments) {
        comment = this.props.comments[this.props.lineNumber];
      }
      this.setState({
        comment
      });
    }
  }

  handleChange = e => {
    this.setState({
      comment: e.target.value
    });
  };

  handleSubmit = e => {
    this.props.addOrUpdateComment(this.state.comment, this.props.lineNumber);
    this.props.hideCommentModal();
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
        <span>Add comment to line #{this.props.lineNumber}</span>
        <textarea onChange={this.handleChange} value={this.state.comment} />
        <button type="submit" onClick={this.handleSubmit}>
          submit
        </button>
        <button type="button" onClick={this.props.hideCommentModal}>
          cancel
        </button>
      </div>
    );
  }
}

export const UnconnectedTeacherCodeComment = TeacherCodeComment;
export default connect(
  state => state.teacherCodeComment,
  {
    addOrUpdateComment,
    hideCommentModal,
    setComments
  }
)(TeacherCodeComment);
