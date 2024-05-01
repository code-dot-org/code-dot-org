import PropTypes from 'prop-types';
import React, {useEffect, useState, useRef} from 'react';

import color from '@cdo/apps/util/color';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

const CodeBlockWithCopy = ({children}) => {
  const textRef = useRef();
  const [copySuccess, setCopySuccess] = useState(false);
  const timeoutRef = useRef();

  const handleCopy = () => {
    copyToClipboard(textRef.current.textContent, () => {
      setCopySuccess(true);
      timeoutRef.current = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        margin: '5px',
      }}
    >
      <div
        style={{
          backgroundColor: color.black,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          color={buttonColors.white}
          disabled={false}
          iconRight={{
            iconName: copySuccess ? 'check' : 'clipboard',
            iconStyle: 'solid',
          }}
          onClick={handleCopy}
          text={copySuccess ? 'Copied!' : 'Copy code'}
          size="xs"
          type="tertiary"
        />
      </div>
      <pre ref={textRef}>
        <code style={{display: 'block', whiteSpace: 'pre-wrap'}}>
          {children}
        </code>
      </pre>
    </div>
  );
};

CodeBlockWithCopy.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CodeBlockWithCopy;
