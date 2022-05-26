import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Editor} from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import './codeReviewCommentEditor.scss';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';

const CodeReviewCommentEditor = ({addCodeReviewComment}) => {
  const textArea = useRef(null);
  const [displayAddCommentFailure, setDisplayAddCommentFailure] = useState(
    false
  );

  const handleSubmit = () => {
    addCodeReviewComment(
      textArea.current.editorInst.getMarkdown(),
      onSubmitSuccess,
      onSubmitFailure
    );
  };

  const onSubmitSuccess = () => {
    clearTextBox();
    setDisplayAddCommentFailure(false);
  };

  const clearTextBox = () => {
    textArea.current.editorInst.moveCursorToEnd();
    const selectionEnd = textArea.current.editorInst.getSelection()[1];
    textArea.current.editorInst.deleteSelection(0, selectionEnd);
  };

  const onSubmitFailure = () => {
    setDisplayAddCommentFailure(true);
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
      <div style={styles.submit}>
        <Button
          onClick={handleSubmit}
          text={javalabMsg.submit()}
          color={Button.ButtonColor.orange}
          style={styles.submitButton}
        />
        {displayAddCommentFailure && <CodeReviewError />}
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
  submit: {
    display: 'flex',
    alignItems: 'end',
    flexDirection: 'column'
  },
  submitButton: {
    marginTop: '10px'
  }
};
