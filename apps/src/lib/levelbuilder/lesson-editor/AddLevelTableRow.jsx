import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import $ from 'jquery';

export default class AddLevelTableRow extends Component {
  static propTypes = {
    addLevel: PropTypes.func,
    level: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      creatingClonedLevel: false
    };
  }

  handleAddLevel = level => {
    this.props.addLevel(level);
  };

  handleCloneAndAddLevel = level => {
    this.setState({creatingClonedLevel: true});
    const newLevelName = prompt('Enter new level name');
    if (newLevelName) {
      $.ajax({
        url: `/levels/${level.id}/clone?name=${newLevelName}`,
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8'
      })
        .done(data => {
          this.props.addLevel(data);
          this.setState({creatingClonedLevel: false});
        })
        .fail(error => {
          console.log(error);
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
