import React, {useRef, useEffect} from 'react';
import {Editor} from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const ToastExampleTextArea = () => {
  const textArea = useRef(null);

  const onChange = () => {
    console.log(textArea.current.editorInst.getMarkdown());
  };

  return (
    <Editor
      initialValue="hello react editor world!"
      previewStyle="vertical"
      height="200px"
      initialEditType="wysiwyg"
      useCommandShortcut={true}
      hideModeSwitch={true}
      toolbarItems={[
        [
          'code',
          'codeblock',
          {
            // custom code block button
            name: 'codeblock',
            className: 'codeblock',
            command: 'codeBlock',
            tooltip: 'Insert CodeBlock',
            state: 'codeBlock',
            text: 'Code'
          }
        ]
      ]}
      ref={textArea}
      onChange={onChange}
    />
  );
};
export default ToastExampleTextArea;
