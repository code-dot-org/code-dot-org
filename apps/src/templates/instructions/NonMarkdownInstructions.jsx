import PropTypes from 'prop-types';
import React from 'react';
import SafeMarkdown from '../SafeMarkdown';

var styles = {
  main: {
    marginBottom: 35,
    marginLeft: 80
  }
};

/**
 * Non-markdown version of our instructions, displayed in a dialog when our top
 * pane instructions are not enabled.
 */
var NonMarkdownInstructions = function(props) {
  return (
    <div style={styles.main}>
      {props.shortInstructions && (
        <div className="instructions">
          <SafeMarkdown markdown={props.shortInstructions} />
        </div>
      )}
      {props.instructions2 && (
        <div className="instructions2">
          <SafeMarkdown markdown={props.instructions2} />
        </div>
      )}
    </div>
  );
};

NonMarkdownInstructions.propTypes = {
  shortInstructions: PropTypes.string,
  instructions2: PropTypes.string
};

module.exports = NonMarkdownInstructions;
