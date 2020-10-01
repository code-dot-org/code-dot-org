import React, {Component} from 'react';
import Button, {ButtonColor, ButtonSize} from '@cdo/apps/templates/Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';

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

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th style={{width: '13%'}}>Actions</th>
              <th style={{width: '33%'}}>
                Name
                <FontAwesome icon="sort" style={styles.orderIcon} />
              </th>
              <th style={{width: '18%'}}>
                Type
                <FontAwesome icon="sort" style={styles.orderIcon} />
              </th>
              <th style={{width: '15%'}}>
                Owner
                <FontAwesome icon="sort" style={styles.orderIcon} />
              </th>
              <th style={{width: '20%'}}>
                Last Updated
                <FontAwesome icon="sort" style={styles.orderIcon} />
              </th>
            </tr>
          </thead>
          <tbody>
            {this.props.levels.map(level => (
              <tr key={level.id}>
                <td>
                  <Button
                    icon="plus"
                    text={''}
                    onClick={() => {
                      console.log('Add');
                    }}
                    //onClick={this.handleAddLevel}
                    color={ButtonColor.blue}
                    size={ButtonSize.narrow}
                  />
                  <Button
                    icon="files-o"
                    text={''}
                    onClick={() => {
                      console.log('Clone Level and Add');
                    }}
                    color={ButtonColor.blue}
                    size={ButtonSize.narrow}
                  />
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
