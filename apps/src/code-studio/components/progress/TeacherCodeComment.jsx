import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {hideCommentModal, setComments} from './teacherCodeCommentRedux';

const styles = {
  container: {
    backgroundColor: 'lightgray',
    position: 'absolute',
    zIndex: 9999,
    padding: 10,
    border: '1px solid darkgray'
  },
  header: {
    display: 'inline-block'
  },
  input: {
    display: 'block',
    width: '20em',
    height: '5em'
  },
  button: {
    fontSize: 14,
    margin: 2,
    padding: 6
  }
};

class TeacherCodeComment extends React.Component {
  static propTypes = {
    comments: PropTypes.object,
    hideCommentModal: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool,
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
      if (response && typeof response === 'object') {
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

  saveComments = newComments => {
    this.setState({
      submitting: true
    });

    // treat empty strings, nulls, undefineds, all falsy values as though they
    // were nonexistant
    for (let key in newComments) {
      if (!newComments[key]) {
        delete newComments[key];
      }
    }

    this.project.saveTeacherComments(newComments, (err, response) => {
      this.setState({
        submitting: false
      });

      if (err) {
        console.error(err);
      } else {
        this.props.setComments(newComments);
        this.props.hideCommentModal();
      }
    });
  };

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
    this.saveComments(newComments);
  };

  handleDelete = e => {
    const newComments = {
      ...this.props.comments,
      [this.props.lineNumber]: ''
    };
    this.saveComments(newComments);
  };

  renderTeacherEditInterface() {
    return (
      <div>
        <span style={styles.header}>
          Add comment to line #{this.props.lineNumber}
        </span>
        <textarea
          cols={48}
          rows={4}
          style={styles.input}
          onChange={this.handleChange}
          value={this.state.comment}
        />
        <fieldset>
          <button
            type="button"
            style={styles.button}
            onClick={this.handleSubmit}
            disabled={this.state.submitting}
          >
            {this.state.submitting ? 'submitting...' : 'submit'}
          </button>
          <button
            type="button"
            style={styles.button}
            onClick={this.props.hideCommentModal}
          >
            cancel
          </button>
          <button
            type="button"
            style={styles.button}
            onClick={this.handleDelete}
            disabled={!(this.props.lineNumber in this.props.comments)}
          >
            delete
          </button>
        </fieldset>
      </div>
    );
  }

  renderStudentViewInterface() {
    return <span>{this.state.comment}</span>;
  }

  render() {
    if (!(this.props && this.props.isOpen)) {
      return null;
    }

    if (!this.props.isTeacher && !this.state.comment) {
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
        {this.props.isTeacher
          ? this.renderTeacherEditInterface()
          : this.renderStudentViewInterface()}
      </div>
    );
  }
}

export const UnconnectedTeacherCodeComment = TeacherCodeComment;
export default connect(
  state => state.teacherCodeComment,
  {
    hideCommentModal,
    setComments
  }
)(TeacherCodeComment);
