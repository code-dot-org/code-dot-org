import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AddLevelTableRow from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelTableRow';

const styles = {
  pages: {
    marginTop: 10
  }
};

export default class AddLevelTable extends Component {
  static propTypes = {
    addLevel: PropTypes.func,
    levels: PropTypes.array
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
              <AddLevelTableRow
                key={level.id}
                addLevel={this.props.addLevel}
                level={level}
              />
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
