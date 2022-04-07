import React, {useRef} from 'react';

const TextAreaWithCode = () => {
  const displayTextArea = useRef(null);
  const startingText = 'Starting text';
  // const [textToSave, setTextToSave] = useState(startingText);

  const onKeyup = e => {
    console.log(e.target.innerHTML);
    const newHTML = styleDisplayedCodeContent(e.target.innerHTML);
    console.log(newHTML);
    displayTextArea.current.innerHTML = newHTML;
  };

  const styleDisplayedCodeContent = innerHTML => {
    let newHTML = '';
    const splitByStuff = innerHTML.split('```');
    console.log(splitByStuff);
    splitByStuff.forEach((el, index) => {
      if (index % 2 === 1) {
        newHTML += `<div style="background:#e7e8ea; font-family: monospace;">${el}</div>`;
      } else {
        newHTML += el;
      }
    });
    return newHTML;
  };

  const onScroll = e => {
    displayTextArea.current.scrollTop = e.target.scrollTop;
  };

  return (
    <div style={styles.wrapper}>
      <div
        id="for-testing"
        style={{
          ...styles.sharedTextArea,
          ...styles.inputTextArea
        }}
        contentEditable="true"
        onKeyUp={onKeyup}
        onScroll={onScroll}
      >
        {startingText}
      </div>
      <div
        id="dummy"
        ref={displayTextArea}
        style={{...styles.sharedTextArea, ...styles.displayTextArea}}
      >
        {startingText}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%'
  },
  sharedTextArea: {
    position: 'absolute',
    width: '100%',
    padding: '1em',
    background: '#fff',
    height: '100px',
    margin: '2px',
    border: '1px solid black',
    color: '#fff',
    overflow: 'auto',
    boxSizing: 'border-box'
  },
  inputTextArea: {
    zIndex: 10,
    background: 'transparent',
    color: 'transparent',
    caretColor: 'black'
  },
  displayTextArea: {
    color: 'black',
    whiteSpace: 'pre-wrap'
  }
};

export default TextAreaWithCode;
