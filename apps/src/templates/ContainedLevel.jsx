import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';

const styles = {
  main: {
    marginBottom: '10px',
  },
};

const ContainedLevel = createReactClass({
  // Note: This component modifies portions of the DOM outside of itself upon
  // mounting. This is generally considered a bad practice, and should not be
  // copied elsewhere.
  componentDidMount() {
    // dashboard provides us our contained level at #containedLevel0
    // Move it into this component once we mount.
    const container = $(ReactDOM.findDOMNode(this));
    $('#containedLevel0').appendTo(container);
  },

  render() {
    return (
      <ProtectedStatefulDiv
        style={styles.main}
      />
    );
  }
});

export default ContainedLevel;
