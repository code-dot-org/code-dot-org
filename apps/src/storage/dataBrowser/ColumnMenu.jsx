/**
 * @overview Component for the dropdown menu and icon in the column header.
 */
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import {ColumnType} from './dataUtils';

export default class ColumnMenu extends React.Component {
  static propTypes = {
    coerceColumn: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    handleRename: PropTypes.func.isRequired,
    isEditable: PropTypes.bool.isRequired,
  };

  render() {
    const menuStyle = {
      visibility: this.props.isEditable ? null : 'hidden',
    };
    /* TODO(dave): remove 'pull-right' once we upgrade to bootstrap 3.1.0 */
    return (
      <span className="dropdown pull-right" style={menuStyle}>
        <a className="dropdown-toggle" data-toggle="dropdown">
          <FontAwesome icon="cog" style={styles.icon} />
        </a>
        <ul className="dropdown-menu dropdown-menu-right" style={{minWidth: 0}}>
          <li style={{cursor: 'pointer'}}>
            <a onClick={this.props.handleRename}>{msg.rename()}</a>
          </li>
          <li style={{cursor: 'pointer'}}>
            <a onClick={this.props.handleDelete}>{msg.delete()}</a>
          </li>
          <li style={{cursor: 'pointer'}}>
            <a onClick={() => this.props.coerceColumn(ColumnType.STRING)}>
              {msg.dataTableConvertToString()}
            </a>
          </li>
          <li style={{cursor: 'pointer'}}>
            <a onClick={() => this.props.coerceColumn(ColumnType.NUMBER)}>
              {msg.dataTableConvertToNumber()}
            </a>
          </li>
          <li style={{cursor: 'pointer'}}>
            <a onClick={() => this.props.coerceColumn(ColumnType.BOOLEAN)}>
              {msg.dataTableConvertToBoolean()}
            </a>
          </li>
        </ul>
      </span>
    );
  }
}

const styles = {
  icon: {
    color: 'white',
    cursor: 'pointer',
  },
};
