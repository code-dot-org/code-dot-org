import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import $ from 'jquery';
import color from '@cdo/apps/util/color';

export default class AddLevelTableRow extends Component {
  static propTypes = {
    addLevel: PropTypes.func,
    level: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      creatingClonedLevel: false,
      error: null
    };
  }

  handleAddLevel = level => {
    this.setState({error: null});
    this.props.addLevel(level);
  };

  handleCloneAndAddLevel = level => {
    this.setState({creatingClonedLevel: true, error: null});
    const newLevelName = prompt('Enter new level name');
    if (newLevelName) {
      $.ajax({
        url: `/levels/${
          level.id
        }/clone?name=${newLevelName}&do_not_redirect=true`,
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8'
      })
        .done(data => {
          this.props.addLevel(data);
          this.setState({creatingClonedLevel: false});
        })
        .fail(error => {
          console.log(error.responseText);
          this.setState({
            creatingClonedLevel: false,
            error: 'Could not clone level'
          });
        });
    } else {
      this.setState({
        creatingClonedLevel: false,
        error: 'Must provide new name for the cloned level'
      });
    }
  };

  render() {
    const {level} = this.props;

    return (
      <tr key={level.id}>
        <td>
          <button onClick={this.handleAddLevel.bind(this, level)} type="button">
            <FontAwesome icon="plus" />
          </button>
          <button
            type="button"
            onClick={this.handleCloneAndAddLevel.bind(this, level)}
            disabled={this.state.creatingClonedLevel}
          >
            <FontAwesome icon="files-o" />
          </button>
          {this.state.creatingClonedLevel && (
            <FontAwesome icon="spinner" className="fa-spin" />
          )}
          {this.state.error && (
            <div style={{color: color.red}}>{this.state.error}</div>
          )}
        </td>
        <td>
          <div>{level.name}</div>
        </td>
        <td>
          <div>{level.type}</div>
        </td>
        <td>
          <div>{level.owner}</div>
        </td>
        <td>
          <div>{level.updated_at}</div>
        </td>
      </tr>
    );
  }
}
