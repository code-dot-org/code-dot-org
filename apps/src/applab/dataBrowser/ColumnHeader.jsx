/**
 * @overview Component for adding a new column to the specified table.
 */

import Radium from 'radium';
import React from 'react';

import * as dataStyles from './dataStyles';

const styles = {
  menu: {
    float: 'right'
  },
  icon: {
    color: 'white'
  }
};

const ColumnHeader = React.createClass({
  propTypes: {
    columnName: React.PropTypes.string.isRequired,
    deleteColumn: React.PropTypes.func.isRequired
  },

  handleDelete() {
    this.props.deleteColumn(this.props.columnName);
  },

  toggleMenu() {
    this.setState({isMenuOpen: !this.state.isMenuOpen});
  },

  render() {
    const menuStyle = [styles.menu, {
      display: this.props.columnName === 'id' ? 'none' : null,
    }];
    return (
      <th style={dataStyles.headerCell} onClick={this.toggleMenu}>
        {this.props.columnName}
        {/* TODO(dave): remove 'pull-right' once we upgrade to bootstrap 3.1.0 */}
        <span className="dropdown pull-right" style={menuStyle}>
          <a className="dropdown-toggle" data-toggle="dropdown">
            <i className="fa fa-cog" style={styles.icon} />
          </a>
          <ul className="dropdown-menu dropdown-menu-right">
            <li>
              <a onClick={this.handleDelete}>
               Delete
              </a>
            </li>
          </ul>
        </span>
      </th>
    );
  }
});

export default Radium(ColumnHeader);
