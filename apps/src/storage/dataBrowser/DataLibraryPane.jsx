import Radium from 'radium';
import React from 'react';

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 270,
    boxSizing: 'border-box',
    borderRight: '1px solid gray',
    overflowY: 'hidden',
    padding: 10
  }
};
class DataLibraryPane extends React.Component {
  render() {
    return <div style={styles.container} />;
  }
}

export default Radium(DataLibraryPane);
