import React from 'react';

const TextAreaWithCode = () => {
  const startingText = 'Starting text';
  // const [textToSave, setTextToSave] = useState(startingText);

  const onKeyup = e => {
    console.log(e.target.textContent);
    const newHTML = styleCodeContent(e.target.textContent);
    document.getElementById('dummy').innerHTML = newHTML;
  };

  const styleCodeContent = textContent => {
    let newHTML = '';
    const splitByStuff = textContent.split('```');
    splitByStuff.forEach((el, index) => {
      console.log(el, 'is code block', index % 2 === 1);
      if (index % 2 === 1) {
        newHTML += `<span style="background:#c6cacd">${el}</span>`;
      } else {
        newHTML += el;
      }
    });
    return newHTML;
  };

  return (
    <div>
      <div
        id="for-testing"
        style={{
          ...styles.original,
          ...styles.inputTextArea
        }}
        contentEditable="true"
        onKeyUp={onKeyup}
      >
        {startingText}
      </div>
      <div id="dummy" style={{...styles.original, color: 'black'}}>
        {startingText}
      </div>
    </div>
  );
};

const styles = {
  original: {
    position: 'absolute',
    width: '100%',
    padding: '1em',
    background: '#fff',
    height: '100px',
    margin: '2px',
    border: '1px solid black',
    color: '#fff',
    overflow: 'auto'
  },
  inputTextArea: {
    zIndex: 10,
    background: 'transparent',
    color: 'transparent',
    caretColor: 'black'
  }
};

export default TextAreaWithCode;
