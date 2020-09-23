import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';

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

//TODO Hook up the filtering system to work on the real levels
//Selects need real data added into them

export default class AddLevelFilters extends Component {
  static propTypes = {
    searchFields: PropTypes.array
  };

  render() {
    console.log(this.props.searchFields);

    return (
      <div style={styles.filters}>
        <label>
          By Name:
          <input
            style={styles.dropdown}
            onChange={() => {
              console.log('filter by name');
            }}
          />
        </label>
        <label>
          By Type:
          <select
            style={styles.dropdown}
            onClick={() => {
              console.log('filter by type');
            }}
          >
            {this.props.searchFields[1].options.map(levelType => (
              <option key={levelType[0]}>{levelType[0]}</option>
            ))}
          </select>
        </label>
        <label>
          By Script:
          <select
            style={styles.dropdown}
            onClick={() => {
              console.log('filer by script');
            }}
          >
            {this.props.searchFields[2].options.map(script => (
              <option key={script[0]}>{script[0]}</option>
            ))}
          </select>
        </label>
        <label>
          By Owner:
          <select
            style={styles.dropdown}
            onClick={() => {
              console.log('filter by owner');
            }}
          >
            {this.props.searchFields[3].options.map(owner => (
              <option key={owner[0]}>{owner[0]}</option>
            ))}
          </select>
        </label>
        <Button
          icon="search"
          text={''}
          onClick={() => {
            console.log('Search');
          }}
        />
      </div>
    );
  }
}
