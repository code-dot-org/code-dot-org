import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';

class DatasetList extends React.Component {
  static propTypes = {
    datasets: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  state = {
    newTableName: ''
  };
  render() {
    const isValidTableName =
      this.state.newTableName &&
      this.props.datasets.indexOf(this.state.newTableName) === -1;
    return (
      <div>
        <ul>
          {this.props.datasets.map(dataset => (
            <li key={dataset}>
              <a href={`/datasets/${dataset}/edit`}>{dataset}</a>
            </li>
          ))}
        </ul>
        <br />
        <p> Add a dataset </p>
        <input
          ref="nameInput"
          type="text"
          onChange={e => this.setState({newTableName: e.target.value})}
        />
        <br />
        <Button
          text="New Dataset"
          href={`/datasets/${this.state.newTableName}/edit`}
          disabled={!isValidTableName}
          color={Button.ButtonColor.blue}
          size={Button.ButtonSize.large}
        />
      </div>
    );
  }
}

export default DatasetList;
