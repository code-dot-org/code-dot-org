import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';

class DatasetList extends React.Component {
  static propTypes = {
    datasets: PropTypes.arrayOf(PropTypes.string).isRequired,
    liveDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  state = {
    newTableName: '',
  };

  render() {
    const isValidTableName =
      this.state.newTableName &&
      this.props.datasets.indexOf(this.state.newTableName) === -1;
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
        <br />
        <p> Add a dataset </p>
        <input
          type="text"
          onChange={e => this.setState({newTableName: e.target.value})}
        />
        <br />
        <Button
          __useDeprecatedTag
          text="New Dataset"
          href={`/datasets/${this.state.newTableName}`}
          disabled={!isValidTableName}
          color={Button.ButtonColor.blue}
          size={Button.ButtonSize.large}
        />
        <p>
          After adding a new dataset, you'll need to{' '}
          <a href="../data_docs/edit">add documentation</a> and{' '}
          <a href="./manifest/edit">edit the manifest</a>.
        </p>
      </div>
    );
  }
}

export default DatasetList;
