import Radium from 'radium';
import React from 'react';

const styles = {
  container: {
    display: 'block',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 270,
    boxSizing: 'border-box',
    borderRight: '1px solid gray',
    overflowY: 'auto',
    padding: 10,
    paddingRight: 0 // setting this to 0 allows 2 columns with the potential scrollbar on Windows
  }
};
class DataLibraryPane extends React.Component {
  render() {
    return <div style={styles.container} />;
  }
}

export default Radium(DataLibraryPane);
