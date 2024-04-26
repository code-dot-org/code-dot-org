import PropTypes from 'prop-types';
import React, {useRef} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';

CodeBlockWithCopy.propTypes = {
  children: PropTypes.node.isRequired,
};

const CodeBlockWithCopy = ({children}) => {
  const textRef = useRef();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(textRef.current.textContent)
      .then(() => alert('Code copied!'))
      .catch(err => console.error('Failed to copy text:', err));
  };

  return (
    <div
      style={{
        position: 'relative',
        border: '1px solid #ccc',
        margin: '10px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <pre
        ref={textRef}
        style={{
          margin: 0,
          padding: '20px',
          overflow: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        <code style={{display: 'block', whiteSpace: 'pre-wrap'}}>
          {children}
        </code>
      </pre>
      <Button />
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          padding: '5px 10px',
          cursor: 'pointer',
        }}
        type="button"
      >
        Copy
      </button>
    </div>
  );
};

export default CodeBlockWithCopy;
