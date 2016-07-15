import React from 'react';
import Radium from 'radium';
import ChatBubble from './ChatBubble';

const InlineFeedback = ({ extra, message, styles, isMinecraft, borderColor }) => {
  // We add a classname to this element exclusively so that UI tests can
  // easily detect its presence. This class should NOT be used for
  // styling.
  return (
    <ChatBubble
        isMinecraft={isMinecraft}
        borderColor={borderColor}
        className="uitest-topInstructions-inline-feedback">
      <p>{message}</p>
      {extra && <p style={styles.message}>{extra}</p>}
    </ChatBubble>
  );
};

InlineFeedback.propTypes = {
  borderColor: React.PropTypes.string,
  extra: React.PropTypes.string,
  isMinecraft: React.PropTypes.bool,
  message: React.PropTypes.string.isRequired,
  styles: React.PropTypes.object,
};

export default Radium(InlineFeedback);
