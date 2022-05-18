import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Editor} from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import './codeReviewCommentEditor.scss';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';

const CodeReviewCommentEditor = ({addCodeReviewComment}) => {
  const textArea = useRef(null);

  const handleSubmit = () => {
    addCodeReviewComment(
      textArea.current.editorInst.getMarkdown(),
      onSubmitSuccess,
      onSubmitFailure
    );
  };

  const onSubmitSuccess = () => {
    clearTextBox();
  };

  const clearTextBox = () => {
    textArea.current.editorInst.moveCursorToEnd();
    const selectionEnd = textArea.current.editorInst.getSelection()[1];
    textArea.current.editorInst.deleteSelection(0, selectionEnd);
  };

  const onSubmitFailure = () => {
    // TODO: handle submit failure
  };

  return (
    <>
      <Editor
        placeholder={javalabMsg.addACommentToReview()}
        previewStyle="vertical"
        height="auto"
        minHeight="60px"
        initialEditType="wysiwyg"
        useCommandShortcut={true}
        hideModeSwitch={true}
        toolbarItems={[
          [
            {
              name: 'codeblock',
              className: 'code toastui-editor-toolbar-icons',
              command: 'codeBlock',
              tooltip: javalabMsg.insertCode(),
              state: 'codeBlock'
            }
          ]
        ]}
        ref={textArea}
      />
      <div style={styles.buttons}>
        <Button
          onClick={handleSubmit}
          text={javalabMsg.submit()}
          color={Button.ButtonColor.orange}
          style={styles.submitButton}
        />
      </div>
    </>
  );
};

CodeReviewCommentEditor.propTypes = {
  addCodeReviewComment: PropTypes.func.isRequired
};

export default CodeReviewCommentEditor;

const styles = {
  wrapper: {
    border: `1px solid ${color.droplet_bright_blue}`,
    borderRadius: '4px'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'end'
  },
  submitButton: {
    marginTop: '10px'
  }
};
