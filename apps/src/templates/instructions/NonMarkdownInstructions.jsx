import PropTypes from 'prop-types';
import React from 'react';
import UnsafeRenderedMarkdown from '../UnsafeRenderedMarkdown';

var styles = {
  main: {
    marginBottom: 35,
    marginLeft: 80
  }
};

/**
 * Non-markdown version of our instructions, displayed in a dialog when our top
 * pane instructions are not enabled.
 *
 * Currently only used by NetSim levels
 */
var NonMarkdownInstructions = function(props) {
  return (
    <div style={styles.main}>
      <p className="dialog-title">{props.puzzleTitle}</p>
      {props.shortInstructions && (
        <div className="instructions">
          <UnsafeRenderedMarkdown markdown={props.shortInstructions} />
        </div>
      )}
      {props.instructions2 && (
        <div className="instructions2">
          <UnsafeRenderedMarkdown markdown={props.instructions2} />
        </div>
      )}
    </div>
  );
};

NonMarkdownInstructions.propTypes = {
  puzzleTitle: PropTypes.string.isRequired,
  shortInstructions: PropTypes.string,
  instructions2: PropTypes.string
};

module.exports = NonMarkdownInstructions;
