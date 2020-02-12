import React from 'react';
import PropTypes from 'prop-types';

class DatasetList extends React.Component {
  static propTypes = {
    datasets: PropTypes.arrayOf(PropTypes.string).isRequired
  };
  render() {
    return (
      <ul>
        {this.props.datasets.map(dataset => (
          <li key={dataset}>{dataset}</li>
        ))}
      </ul>
    );
  }
}

export default DatasetList;
