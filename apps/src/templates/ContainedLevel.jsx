import React from 'react';
import ReactDOM from 'react-dom';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';

const styles = {
  main: {
    minHeight: 200,
  }
};

const ContainedLevel = React.createClass({
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
