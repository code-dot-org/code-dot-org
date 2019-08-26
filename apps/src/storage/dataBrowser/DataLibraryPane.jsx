import Radium from 'radium';
import React from 'react';
import DataCategory from './DataCategory';

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

// TODO: real data
const categories = {
  Animals: {description: 'description', datasets: ['one', 'two']},
  'Arts & Entertainment': {
    description: 'description',
    datasets: ['three', 'four']
  },
  'Business & Money': {description: 'description', datasets: ['five', 'six']},
  Education: {description: 'description', datasets: ['seven', 'eight', 'nine']},
  'Health & Medicine': {description: 'description', datasets: ['ten']}
};
class DataLibraryPane extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        {Object.keys(categories).map(category => (
          <DataCategory
            key={category}
            name={category}
            datasets={categories[category].datasets}
            description={categories[category].description}
          />
        ))}
      </div>
    );
  }
}

export default Radium(DataLibraryPane);
