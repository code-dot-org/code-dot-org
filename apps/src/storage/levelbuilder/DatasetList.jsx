import React from 'react';
import PropTypes from 'prop-types';

class DatasetList extends React.Component {
  static propTypes = {
    datasets: PropTypes.arrayOf(PropTypes.string).isRequired,
    liveDatasets: PropTypes.arrayOf(PropTypes.string).isRequired
  };
  render() {
    return (
      <div>
        <h1>Datasets</h1>
        <ul>
          {this.props.datasets.map(dataset => (
            <li key={dataset}>
              <a href={`/datasets/${dataset}`}>{dataset}</a>
              {this.props.liveDatasets.includes(dataset) && (
                <span> (Live) </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default DatasetList;
