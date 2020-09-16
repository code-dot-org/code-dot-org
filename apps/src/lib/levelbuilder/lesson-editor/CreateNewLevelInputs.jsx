import React, {Component} from 'react';
import Button, {ButtonColor} from '@cdo/apps/templates/Button';

//TODO: Set up creating a new level. Make sure dropdown has all level types

export default class AddLevelFilters extends Component {
  static propTypes = {};

  render() {
    return (
      <div>
        <label>
          Level Type:
          <select
            onClick={() => {
              console.log('select type');
            }}
          >
            <option>App Lab</option>
            <option>Game Lab</option>
            <option>Standalone Video</option>
          </select>
        </label>
        <label>
          Level Name:
          <input
            onChange={() => {
              console.log('Change level name');
            }}
          />
        </label>
        <Button
          text="Create & Add"
          color={ButtonColor.blue}
          onClick={() => {
            console.log('create and add level');
          }}
        />
      </div>
    );
  }
}
