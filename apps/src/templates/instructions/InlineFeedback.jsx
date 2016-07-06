import React from 'react';
import Radium from 'radium';

const InlineFeedback = (props) => {
  return (
    <div style={props.style.container}>
      <p style={props.style.message}>{props.message}</p>
      {props.extra && <p style={props.style.message}>{props.extra}</p>}
    </div>
  );
};

InlineFeedback.propTypes = {
  messge: React.PropTypes.string.isRequired,
  extra: React.PropTypes.string,
};

export default Radium(InlineFeedback);
