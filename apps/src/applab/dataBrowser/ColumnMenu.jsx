/**
 * @overview Component for the dropdown menu and icon in the column header.
 */

import { ColumnType } from './dataUtils';
import FontAwesome from '../../templates/FontAwesome';
import React from 'react';

const styles = {
  icon: {
    color: 'white',
    cursor: 'pointer',
  }
};

const ColumnMenu = React.createClass({
  propTypes: {
    coerceColumn: React.PropTypes.func.isRequired,
    handleDelete: React.PropTypes.func.isRequired,
    handleRename: React.PropTypes.func.isRequired,
    isEditable: React.PropTypes.bool.isRequired,
  },

  render() {
    const menuStyle = {
      visibility: this.props.isEditable ? null : 'hidden',
    };
    /* TODO(dave): remove 'pull-right' once we upgrade to bootstrap 3.1.0 */
    return (
      <span className="dropdown pull-right" style={menuStyle}>
        <a className="dropdown-toggle" data-toggle="dropdown">
          <FontAwesome icon="cog" style={styles.icon}/>
        </a>
        <ul className="dropdown-menu dropdown-menu-right" style={{minWidth: 0}}>
          <li style={{cursor: 'pointer'}}>
            <a onClick={this.props.handleRename}>
              Rename
            </a>
          </li>
          <li style={{cursor: 'pointer'}}>
            <a onClick={this.props.handleDelete}>
              Delete
            </a>
          </li>
          <li style={{cursor: 'pointer'}}>
            <a onClick={() => this.props.coerceColumn(ColumnType.STRING)}>
              Convert to string
            </a>
          </li>
          <li style={{cursor: 'pointer'}}>
            <a onClick={() => this.props.coerceColumn(ColumnType.NUMBER)}>
              Convert to number
            </a>
          </li>
          <li style={{cursor: 'pointer'}}>
            <a onClick={() => this.props.coerceColumn(ColumnType.BOOLEAN)}>
              Convert to boolean
            </a>
          </li>
        </ul>
      </span>
    );
  }
});
export default ColumnMenu;
