import Radium from 'radium';
import React from 'react';
import LibraryCategory from './LibraryCategory';
import SearchBar from '@cdo/apps/templates/SearchBar';
import datasetManifest from './datasetManifest.json';
import color from '../../util/color';
import msg from '@cdo/locale';

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
  },
  divider: {
    borderColor: color.light_gray,
    margin: '5px 0px 10px 0px'
  }
};

class DataLibraryPane extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <p>{msg.dataLibraryDescription()}</p>
        <SearchBar
          placeholderText={'Search'}
          onChange={() => console.log('search!')}
        />
        <hr style={styles.divider} />
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
