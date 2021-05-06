import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import _ from 'lodash';
import {connect} from 'react-redux';

class AddLevelFilters extends Component {
  static propTypes = {
    handleSearch: PropTypes.func.isRequired,
    handleChangeLevelName: PropTypes.func.isRequired,
    handleChangeLevelType: PropTypes.func.isRequired,
    handleChangeScript: PropTypes.func.isRequired,
    handleChangeOwner: PropTypes.func.isRequired,
    ownerId: PropTypes.string.isRequired,
    scriptId: PropTypes.string.isRequired,
    levelType: PropTypes.string.isRequired,
    levelName: PropTypes.string.isRequired,

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
            className="uitest-add-level-name-input"
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

export const UnconnectedAddLevelFilters = AddLevelFilters;

export default connect(state => ({
  searchOptions: state.searchOptions
}))(AddLevelFilters);
