import React from 'react';
import Radium from 'radium';
var color = require('../../color');

const HintPrompt = (props) => {
  const { style, onConfirm, onDismiss } = props;

  const styles = {
    button: {
      common: {
        color: 'white',
        minWidth: 100
      },
      yes: {
        backgroundColor: color.orange,
        borderColor: color.orange,
      },
      no: {
        backgroundColor: color.green,
        borderColor: color.green,
      }
    }
  };

  return (
    <div style={[style.container]}>
      <p style={[style.message]}>Do you want a hint?</p>
      <button onClick={onConfirm} style={[styles.button.common, styles.button.yes]}>Yes</button>
      <button onClick={onDismiss} style={[styles.button.common, styles.button.no]}>No</button>
    </div>
  );
};

HintPrompt.propTypes = {
  style: React.PropTypes.object,
  onConfirm: React.PropTypes.func.isRequired,
  onDismiss: React.PropTypes.func.isRequired,
};

export default Radium(HintPrompt);
