import React, {useRef, useState} from 'react';

const TextAreaWithCodeButton = () => {
  const textArea = useRef(null);
  const [isCodeMode, setIsCodeMode] = useState(false);

  const onClickCodeToggle = () => {
    if (isCodeMode) {
      textArea.current.innerHTML = textArea.current.innerHTML + '<br/>';
      setIsCodeMode(false);
    } else {
      const codeBlock =
        '<br/><div style="background:#e7e8ea; font-family: monospace;">&nbsp;</div>';
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

  return (
    <div style={styles.wrapper}>
      <button type="button" onClick={onClickCodeToggle}>
        Code Toggle
      </button>
      <div contentEditable="true" ref={textArea} style={styles.editor}>
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
