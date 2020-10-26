import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import _ from 'lodash';
import {connect} from 'react-redux';

const styles = {
  filters: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    width: 195,
    margin: 5
  },
  dropdown: {
    width: 150,
    margin: 5
  },
  label: {
    marginRight: 15
  }
};

class AddLevelFilters extends Component {
  static propTypes = {
    handleSearch: PropTypes.func,
    handleChangeLevelName: PropTypes.func,
    handleChangeLevelType: PropTypes.func,
    handleChangeScript: PropTypes.func,
    handleChangeOwner: PropTypes.func,
    ownerId: PropTypes.string,
    scriptId: PropTypes.string,
    levelType: PropTypes.string,
    levelName: PropTypes.string,

    // from redux
    searchOptions: PropTypes.object.isRequired
  };

  handleSearch = _.debounce(
    () => {
      this.props.handleSearch();
    },
    1000,
    {
      leading: true,
      trailing: false
    }
  );

  render() {
    return (
      <div style={styles.filters}>
        <label style={styles.label}>
          By Name:
          <input
            style={styles.input}
            onChange={this.props.handleChangeLevelName}
            value={this.props.levelName}
          />
        </label>
        <label style={styles.label}>
          By Type:
          <select
            style={styles.dropdown}
            onChange={this.props.handleChangeLevelType}
            value={this.props.levelType}
            id={'add-level-type'}
          >
            {this.props.searchOptions.levelOptions.map(levelType => (
              <option key={levelType[0]} value={levelType[1]}>
                {levelType[0]}
              </option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          By Script:
          <select
            style={styles.dropdown}
            onChange={this.props.handleChangeScript}
            value={this.props.scriptId}
          >
            {this.props.searchOptions.scriptOptions.map(script => (
              <option key={script[0]} value={script[1]}>
                {script[0]}
              </option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          By Owner:
          <select
            style={styles.dropdown}
            onChange={this.props.handleChangeOwner}
            value={this.props.ownerId}
          >
            {this.props.searchOptions.ownerOptions.map(owner => (
              <option key={owner[1]} value={owner[1]}>
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

export const UnconnectedAddLevelFilters = AddLevelFilters;

export default connect(state => ({
  searchOptions: state.searchOptions
}))(AddLevelFilters);
