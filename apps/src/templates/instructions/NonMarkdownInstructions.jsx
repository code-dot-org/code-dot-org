/* eslint-disable react/no-danger */
import React, {PropTypes} from 'react';

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
var NonMarkdownInstructions = function (props) {
  return (
    <div style={styles.main}>
      <p className="dialog-title">{props.puzzleTitle}</p>
      {props.instructions &&
        <p className="instructions" dangerouslySetInnerHTML={{ __html: props.instructions }}/>
      }
      {props.instructions2 &&
        <p className="instructions2" dangerouslySetInnerHTML={{ __html: props.instructions2 }}/>
      }
    </div>
  );
};

NonMarkdownInstructions.propTypes = {
  puzzleTitle: PropTypes.string.isRequired,
  instructions: PropTypes.string,
  instructions2: PropTypes.string
};

module.exports = NonMarkdownInstructions;
