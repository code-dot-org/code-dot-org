import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {hideCommentModal, setComments} from './redux';
import LineNumberDialog from './LineNumberDialog';
import * as teacherCodeCommentPropTypes from './propTypes';
import Button from '@cdo/apps/templates/Button';

const styles = {
  header: {
    display: 'inline-block'
  },
  input: {
    display: 'block',
    height: '5em',
    marginBottom: 5,
    marginTop: 5,
    width: '20em'
  }
};

class TeacherCodeComment extends React.Component {
  static propTypes = {
    comments: PropTypes.object,
    hasBreakpoint: PropTypes.bool,
    hideCommentModal: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool,
    lineNumber: PropTypes.number,
    position: teacherCodeCommentPropTypes.position,
    setComments: PropTypes.func.isRequired
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
      working: true
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
        working: false
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
          {this.state.working ? (
            'Saving ...'
          ) : (
            <span>
              Add comment to: <strong>Line {this.props.lineNumber + 1}</strong>
            </span>
          )}
        </span>
        <textarea
          cols={48}
          rows={4}
          style={styles.input}
          onChange={this.handleChange}
          value={this.state.comment}
        />
        <fieldset>
          <Button
            color={Button.ButtonColor.red}
            disabled={
              this.state.working ||
              !(this.props.lineNumber in this.props.comments)
            }
            onClick={this.handleDelete}
            size={Button.ButtonSize.narrow}
            text="Delete"
          />
          <fieldset style={{float: 'right'}}>
            <Button
              color={Button.ButtonColor.white}
              disabled={this.state.working}
              onClick={this.props.hideCommentModal}
              size={Button.ButtonSize.narrow}
              text="Cancel"
            />
            <Button
              color={Button.ButtonColor.orange}
              disabled={this.state.working || !this.state.comment}
              onClick={this.handleSubmit}
              size={Button.ButtonSize.narrow}
              text="Submit"
            />
          </fieldset>
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
      <LineNumberDialog position={this.props.position}>
        {this.props.isTeacher
          ? this.renderTeacherEditInterface()
          : this.renderStudentViewInterface()}
      </LineNumberDialog>
    );
  }
}

export const UnconnectedTeacherCodeComment = TeacherCodeComment;
export default connect(
  state => state.teacherCodeComments,
  {
    hideCommentModal,
    setComments
  }
)(TeacherCodeComment);
