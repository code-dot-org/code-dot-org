import React from 'react';
import Radium from 'radium';

const InlineFeedback = ({ extra, message, styles }) => {
  return (
    <div style={styles.container}>
      <p style={styles.message}>{message}</p>
      {extra && <p style={styles.message}>{extra}</p>}
    </div>
  );
};

InlineFeedback.propTypes = {
  extra: React.PropTypes.string,
  messge: React.PropTypes.string.isRequired,
  styles: React.PropTypes.object,
};

export default Radium(InlineFeedback);
