import React from 'react';
import Radium from 'radium';

const InlineFeedback = ({ extra, message, styles }) => {
  // We add a classname to this element exclusively so that UI tests can
  // easily detect its presence. This class should NOT be used for
  // styling.
  return (
    <div style={styles.container} className="uitest-topInstructions-inline-feedback">
      <p style={styles.message}>{message}</p>
      {extra && <p style={styles.message}>{extra}</p>}
    </div>
  );
};

InlineFeedback.propTypes = {
  extra: React.PropTypes.string,
  message: React.PropTypes.string.isRequired,
  styles: React.PropTypes.object,
};

export default Radium(InlineFeedback);
