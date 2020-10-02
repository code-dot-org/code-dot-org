import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import _ from 'lodash';

const styles = {
  filters: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  dropdown: {
    width: 125,
    margin: 5
  }
};

export default class AddLevelFilters extends Component {
  static propTypes = {
    searchFields: PropTypes.object,
    handleSearch: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      levelName: '',
      levelType: this.props.searchFields.levelOptions[0][1],
      scriptId: this.props.searchFields.scriptOptions[0][1],
      ownerId: this.props.searchFields.ownerOptions[0][1]
    };
  }

  handleSearch = _.debounce(
    () => {
      const {levelName, levelType, scriptId, ownerId} = this.state;
      this.props.handleSearch(levelName, levelType, scriptId, ownerId);
    },
    1000,
    {
      leading: true,
      trailing: false
    }
  );

  handleInputChange = event => {
    this.setState({levelName: event.target.value});
  };

  handleChangeLevelType = event => {
    this.setState({levelType: event.target.value});
  };

  handleChangeScript = event => {
    this.setState({scriptId: event.target.value});
  };

  handleChangeOwner = event => {
    this.setState({ownerId: event.target.value});
  };

  render() {
    return (
      <div style={styles.filters}>
        <label>
          By Name:
          <input
            style={styles.dropdown}
            onChange={this.handleInputChange}
            value={this.state.levelName}
          />
        </label>
        <label>
          By Type:
          <select
            style={styles.dropdown}
            onChange={this.handleChangeLevelType}
            value={this.state.levelType}
          >
            {this.props.searchFields.levelOptions.map(levelType => (
              <option key={levelType[0]} value={levelType[1]}>
                {levelType[0]}
              </option>
            ))}
          </select>
        </label>
        <label>
          By Script:
          <select
            style={styles.dropdown}
            onChange={this.handleChangeScript}
            value={this.state.scriptId}
          >
            {this.props.searchFields.scriptOptions.map(script => (
              <option key={script[0]} value={script[1]}>
                {script[0]}
              </option>
            ))}
          </select>
        </label>
        <label>
          By Owner:
          <select
            style={styles.dropdown}
            onChange={this.handleChangeOwner}
            value={this.state.ownerId}
          >
            {this.props.searchFields.ownerOptions.map(owner => (
              <option key={owner[0]} value={owner[1]}>
                {owner[0]}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={this.handleSearch}>
          <FontAwesome icon="search" />
        </button>
      </div>
    );
  }
}
