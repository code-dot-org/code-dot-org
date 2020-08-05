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

    // For some reason, requiring (or importing) project at the top of this
    // file causes the following error:
    //     TypeError: _project.default.useMakerAPIs is not a function
    // There seems to be an issue with initialization order around this
    // particular dependency; as a workaround, we require it here, in a
    // construction hook.
    // TODO fix the underlying error and remove this hack
    this.project = require('@cdo/apps/code-studio/initApp/project');

    this.state = {};
  }

  componentWillMount() {
    // load existing comments into redux
    this.project.getTeacherComments((err, response) => {
      if (err) {
        console.error(err);
      } else if (response && typeof response === 'object') {
        this.props.setComments(response);
      }
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
    const newComments = {
      ...this.props.comments,
      [this.props.lineNumber]: this.state.comment
    };

    this.project.saveTeacherComments(newComments, (err, response) => {
      if (err) {
        console.error(err);
      } else {
        this.props.setComments(newComments);
        this.props.hideCommentModal();
      }
    });
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
