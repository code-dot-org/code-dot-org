import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {removeLesson} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import Dialog from '@cdo/apps/templates/Dialog';

/**
 * Dialog which confirms removal of the lesson in the specified position
 * within the lesson group.
 */
export class UnconnectedRemoveLessonDialog extends Component {
  static propTypes = {
    lessonGroupPosition: PropTypes.number.isRequired,
    // Position of lesson to remove. Dialog opens when this is set.
    lessonPosToRemove: PropTypes.number,
    lessonName: PropTypes.string,
    handleClose: PropTypes.func.isRequired,

    // provided by redux
    removeLesson: PropTypes.func.isRequired
  };

  handleConfirm = () => {
    const {
      lessonGroupPosition,
      lessonPosToRemove,
      removeLesson,
      handleClose
    } = this.props;
    removeLesson(lessonGroupPosition, lessonPosToRemove);
    handleClose();
  };

  render() {
    const {lessonName, handleClose, lessonPosToRemove} = this.props;
    let bodyText = `Are you sure you want to permanently delete the lesson named "${lessonName}" and all its contents?`;
    let footerText =
      'This will delete any details within the lesson, such as level progressions and lesson plan markdown. Individual levels will not be deleted.';
    return (
      <Dialog
        body={bodyText}
        footer={footerText}
        cancelText="Cancel"
        confirmText="Delete"
        confirmType="danger"
        isOpen={!!lessonPosToRemove}
        handleClose={handleClose}
        onCancel={handleClose}
        onConfirm={this.handleConfirm}
      />
    );
  }
}

const RemoveLessonDialog = connect(
  state => ({}),
  {
    removeLesson
  }
)(UnconnectedRemoveLessonDialog);
export default RemoveLessonDialog;
