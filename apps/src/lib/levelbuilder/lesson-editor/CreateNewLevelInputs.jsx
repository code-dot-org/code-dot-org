import React, {Component} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

export default class CreateNewLevelInputs extends Component {
  static propTypes = {
    levelOptions: PropTypes.array.isRequired,
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
    const needMoreLevelInformation =
      this.state.levelName === '' || this.state.levelType === '';
    if (needMoreLevelInformation) {
      this.setState({
        creatingLevel: false,
        error:
          this.state.levelType === ''
            ? 'Please choose a level type'
            : 'Please enter a level name'
      });
    } else {
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
          console.log(error.responseText);
          this.setState({
            creatingLevel: false,
            error: 'Could not create level'
          });
        });
    }
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
          {this.state.error && (
            <span style={{color: color.red}}>{this.state.error}</span>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  input: {
    marginLeft: 5
  }
};
