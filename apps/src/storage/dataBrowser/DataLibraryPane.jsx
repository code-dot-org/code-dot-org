import Radium from 'radium';
import React from 'react';
import LibraryCategory from './LibraryCategory';
import datasetManifest from './datasetManifest.json';

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
    return (
      <div style={styles.container}>
        {datasetManifest.categories.map(category => (
          <LibraryCategory
            key={category.name}
            name={category.name}
            datasets={category.datasets}
            description={category.description}
          />
        ))}
      </div>
    );
  }
}

export default Radium(DataLibraryPane);
