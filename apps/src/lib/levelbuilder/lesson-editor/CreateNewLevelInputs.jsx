import React, {Component} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

export default class CreateNewLevelInputs extends Component {
  static propTypes = {
    levelOptions: PropTypes.array,
    addLevel: PropTypes.func.isRequired
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
    $.ajax({
      url: '/levels',
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify({
        type: this.state.levelType,
        name: this.state.levelName
      }),
      contentType: 'application/json;charset=UTF-8'
    })
      .done(data => {
        this.props.addLevel(data);
      })
      .fail(error => {
        console.log(error);
      });
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
