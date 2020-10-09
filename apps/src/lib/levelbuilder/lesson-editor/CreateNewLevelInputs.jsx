import React, {Component} from 'react';
import PropTypes from 'prop-types';

//TODO: Set up creating a new level.

export default class CreateNewLevelInputs extends Component {
  static propTypes = {
    levelOptions: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      levelName: '',
      levelType: this.props.levelOptions[0][1]
    };
  }

  handleInputChange = event => {
    this.setState({levelName: event.target.value});
  };

  handleChangeLevelType = event => {
    this.setState({levelType: event.target.value});
  };

  handleCreateLevel = () => {
    console.log('create level');
  };

  render() {
    return (
      <div>
        <label>
          Level Type:
          <select
            onChange={this.handleChangeLevelType}
            value={this.state.levelType}
          >
            {this.props.levelOptions.map(levelType => (
              <option key={levelType[0]} value={levelType[1]}>
                {levelType[0]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Level Name:
          <input
            onChange={this.handleInputChange}
            value={this.state.levelName}
          />
        </label>
        <button type="button" onClick={this.handleCreateLevel}>
          <span>Create and Add</span>
        </button>
      </div>
    );
  }
}
