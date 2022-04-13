import React, {useRef, useState} from 'react';
import './codeReviewStyles.scss';

const TextAreaWithCodeButton = () => {
  const textArea = useRef(null);
  const [isCodeMode, setIsCodeMode] = useState(false);

  // TODO
  // 1. Ability to add a code block - not only to the end
  // 2. Create a placeholder, there's an article here: https://answerly.io/blog/add-a-placeholder-to-a-contenteditable-div-with-css/#:~:text=But%20when%20we're%20building,to%20start%20writing%20some%20code!
  // 3. Typing ``` takes you in and out of code mode and hides ```

  const onClickCodeToggle = () => {
    if (isCodeMode) {
      textArea.current.innerHTML = textArea.current.innerHTML + '<br/>';
      setIsCodeMode(false);
    } else {
      const codeBlock = '<br/><div class="text-area-code"></div>';
      textArea.current.innerHTML = textArea.current.innerHTML + codeBlock;
      setIsCodeMode(true);
    }
    focusEndOfText();
  };

  const focusEndOfText = () => {
    textArea.current.focus();
    // Steps to get cursor at end of range
    let range = document.createRange(); //Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(textArea.current); //Select the entire contents of the element with the range
    range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
    let selection = window.getSelection(); //get the selection object (allows you to change selection)
    selection.removeAllRanges(); //remove any selections already made
    selection.addRange(range);
  };

  const onClickTextArea = e => {
    setIsCodeMode(e.target.classList.contains('text-area-code'));
  };

  const onSubmit = () => {
    console.log(textArea.current.innerHTML);
  };

  return (
    <div style={styles.wrapper}>
      <button type="button" onClick={onClickCodeToggle}>
        Code Toggle
      </button>
      <button type="button" onClick={onSubmit}>
        Submit
      </button>
      <div
        contentEditable="true"
        ref={textArea}
        style={styles.editor}
        onClick={onClickTextArea}
      >
        With button
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    margin: '10px 0px'
  },
  editor: {
    border: '1px solid black',
    padding: 5
  }
};

export default TextAreaWithCodeButton;
