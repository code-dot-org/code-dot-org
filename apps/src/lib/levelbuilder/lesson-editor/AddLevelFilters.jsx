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
  },
  label: {
    marginRight: 15
  }
};

export default class AddLevelFilters extends Component {
  static propTypes = {
    searchFields: PropTypes.object,
    handleSearch: PropTypes.func,
    handleChangeLevelName: PropTypes.func,
    handleChangeLevelType: PropTypes.func,
    handleChangeScript: PropTypes.func,
    handleChangeOwner: PropTypes.func,
    ownerId: PropTypes.string,
    scriptId: PropTypes.string,
    levelType: PropTypes.string,
    levelName: PropTypes.string
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
            style={styles.dropdown}
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
          >
            {this.props.searchFields.levelOptions.map(levelType => (
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
            {this.props.searchFields.scriptOptions.map(script => (
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
            onChange={this.props.handleChangeLevelName}
            value={this.props.ownerId}
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
