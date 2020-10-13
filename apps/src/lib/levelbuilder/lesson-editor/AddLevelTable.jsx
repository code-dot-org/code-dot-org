import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import {NEW_LEVEL_ID} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

const styles = {
  orderIcon: {
    float: 'right'
  },
  pages: {
    marginTop: 10
  }
};

export default class AddLevelTable extends Component {
  static propTypes = {
    addLevel: PropTypes.func,
    levels: PropTypes.array
  };

  handleAddLevel = level => {
    this.props.addLevel(level);
  };

  handleCloneAndAddLevel = level => {
    const newLevelName = prompt('Enter new level name');
    if (newLevelName) {
      level.name = newLevelName;
      level.id = NEW_LEVEL_ID;
    }
    this.props.addLevel(level);
  };

  render() {
    return (
      <div>
        <table style={{width: '100%'}}>
          <thead>
            <tr>
              <th style={{width: '13%'}}>Actions</th>
              <th style={{width: '33%'}}>Name</th>
              <th style={{width: '18%'}}>Type</th>
              <th style={{width: '15%'}}>Owner</th>
              <th style={{width: '20%'}}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {this.props.levels.map(level => (
              <tr key={level.id}>
                <td>
                  <button
                    onClick={this.handleAddLevel.bind(this, level)}
                    type="button"
                  >
                    <FontAwesome icon="plus" />
                  </button>
                  <button
                    type="button"
                    onClick={this.handleCloneAndAddLevel.bind(this, level)}
                  >
                    <FontAwesome icon="files-o" />
                  </button>
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
            ))}
          </tbody>
        </table>
        <div style={styles.pages}>
          <span>{'1 '}</span>
          <a>2 </a>
          <a>3 </a>
          <a>4 </a>
          <a>5 </a>
          ...
          <a>Next></a>
          <a>Last>></a>
        </div>
      </div>
    );
  }
}
