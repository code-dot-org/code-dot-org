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
  static propTypes = {};

  render() {
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
            <option>All Types</option>
            <option>App Lab</option>
            <option>Game Lab</option>
            <option>Standalone Video</option>
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
            <option>All Scripts</option>
            <option>csp1-2020</option>
            <option>csd3-2020</option>
            <option>coursea-2020</option>
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
            <option>Any Owner</option>
            <option>Hannah</option>
            <option>Mike</option>
            <option>Dan</option>
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
