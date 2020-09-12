import React, {Component} from 'react';
import Button, {ButtonColor, ButtonSize} from '@cdo/apps/templates/Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';

const styles = {
  th: {
    width: '20%'
  },
  orderIcon: {
    float: 'right'
  },
  pages: {
    marginTop: 10
  }
};

//TODO Change the table to something more dynamic like used on teacher dashboard
//And pull in real level data

export default class AddLevelTable extends Component {
  static propTypes = {
    addLevel: PropTypes.func
  };

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Actions</th>
              <th style={styles.th}>
                Name
                <FontAwesome icon="sort" style={styles.orderIcon} />
              </th>
              <th style={styles.th}>
                Type
                <FontAwesome icon="sort" style={styles.orderIcon} />
              </th>
              <th style={styles.th}>
                Owner
                <FontAwesome icon="sort" style={styles.orderIcon} />
              </th>
              <th style={styles.th}>
                Last Updated
                <FontAwesome icon="sort" style={styles.orderIcon} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Button
                  icon="plus"
                  text={''}
                  onClick={this.props.addLevel}
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
                <div>My Level</div>
              </td>
              <td>
                <div>App Lab</div>
              </td>
              <td>
                <div>Hannah</div>
              </td>
              <td>
                <div>Tuesday at 5 pm</div>
              </td>
            </tr>
            <tr>
              <td>
                <Button
                  icon="plus"
                  text={''}
                  onClick={() => {
                    console.log('Add level');
                  }}
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
                <div>Super Awesome Level</div>
              </td>
              <td>
                <div>Sprite Lab</div>
              </td>
              <td>
                <div>Mike</div>
              </td>
              <td>
                <div>5 minutes ago</div>
              </td>
            </tr>
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
