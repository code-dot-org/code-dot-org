import React from 'react';
import Radium from 'radium';
import color from '../../color';

const HintPrompt = ({ styles, onConfirm, onDismiss }) => {
  const buttonStyles = {
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
  };

  return (
    <div style={[styles.container]}>
      <p style={[styles.message]}>Do you want a hint?</p>
      <button onClick={onConfirm} style={[buttonStyles.common, buttonStyles.yes]}>Yes</button>
      <button onClick={onDismiss} style={[buttonStyles.common, buttonStyles.no]}>No</button>
    </div>
  );
};

HintPrompt.propTypes = {
  styles: React.PropTypes.object,
  onConfirm: React.PropTypes.func.isRequired,
  onDismiss: React.PropTypes.func.isRequired,
};

export default Radium(HintPrompt);
