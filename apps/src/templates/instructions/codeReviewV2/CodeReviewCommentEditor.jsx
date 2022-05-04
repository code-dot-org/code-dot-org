import React, {useRef} from 'react';
import {Editor} from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import './codeReviewCommentEditor.scss';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

const CodeReviewCommentEditor = () => {
  const textArea = useRef(null);

  const onChange = () => {
    console.log(textArea.current.editorInst.getMarkdown());
  };

  const handleSubmit = () => {
    console.log('save the following comment:');
    console.log(textArea.current.editorInst.getMarkdown());
  };

  const handleCancel = () => {
    console.log('canceled');
  };

  return (
    <>
      <Editor
        placeholder="Add a comment to the review"
        previewStyle="vertical"
        height="auto"
        minHeight="60px"
        initialEditType="wysiwyg"
        useCommandShortcut={true}
        hideModeSwitch={true}
        className="testit"
        toolbarItems={[
          [
            {
              // custom code block button
              name: 'codeblock',
              className: 'code toastui-editor-toolbar-icons',
              command: 'codeBlock',
              tooltip: 'Insert CodeBlock',
              state: 'codeBlock'
            }
          ]
        ]}
        ref={textArea}
        onChange={onChange}
      />
      <div style={styles.buttons}>
        <Button
          onClick={handleCancel}
          text={'Cancel'}
          color={Button.ButtonColor.gray}
        />
        <Button
          onClick={handleSubmit}
          text={'Submit'}
          color={Button.ButtonColor.orange}
        />
      </div>
    </>
  );
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
  }
};
