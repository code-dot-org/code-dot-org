import React, {Component} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  input: {
    marginLeft: 5
  }
};

export default class CreateNewLevelInputs extends Component {
  static propTypes = {
    levelOptions: PropTypes.array,
    addLevel: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      levelName: '',
      levelType: this.props.levelOptions[0][1],
      creatingLevel: false,
      error: null
    };
  }

  handleInputChange = event => {
    this.setState({levelName: event.target.value, error: null});
  };

  handleChangeLevelType = event => {
    this.setState({levelType: event.target.value, error: null});
  };

  handleCreateLevel = () => {
    this.setState({creatingLevel: true, error: null});
    $.ajax({
      url: '/levels?do_not_redirect=true',
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
        this.setState({creatingLevel: false});
      })
      .fail(error => {
        this.setState({
          creatingLevel: false,
          error: `Could not create level: ${error}`
        });
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
            style={styles.input}
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
            style={styles.input}
          />
        </label>
        <div>
          <button
            type="button"
            onClick={this.handleCreateLevel}
            disabled={this.state.creatingLevel}
          >
            <span>Create and Add</span>
          </button>
          {this.state.creatingLevel && (
            <FontAwesome icon="spinner" className="fa-spin" />
          )}
          {this.state.error && <span>{this.state.error}</span>}
        </div>
      </div>
    );
  }
}
