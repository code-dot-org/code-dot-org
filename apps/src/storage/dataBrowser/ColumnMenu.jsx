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
        <button
          type="button"
          className="dropdown-toggle"
          data-toggle="dropdown"
          style={styles.dropdownToggle}
        >
          <FontAwesome icon="cog" style={styles.icon} />
        </button>
        <ul className="dropdown-menu dropdown-menu-right" style={{minWidth: 0}}>
          <li style={{cursor: 'pointer'}}>
            <button
              type="button"
              onClick={this.props.handleRename}
              style={styles.menuButton}
            >
              {msg.rename()}
            </button>
          </li>
          <li style={{cursor: 'pointer'}}>
            <button
              type="button"
              onClick={this.props.handleDelete}
              style={styles.menuButton}
            >
              {msg.delete()}
            </button>
          </li>
          <li style={{cursor: 'pointer'}}>
            <button
              type="button"
              onClick={() => this.props.coerceColumn(ColumnType.STRING)}
              style={styles.menuButton}
            >
              {msg.dataTableConvertToString()}
            </button>
          </li>
          <li style={{cursor: 'pointer'}}>
            <button
              type="button"
              onClick={() => this.props.coerceColumn(ColumnType.NUMBER)}
              style={styles.menuButton}
            >
              {msg.dataTableConvertToNumber()}
            </button>
          </li>
          <li style={{cursor: 'pointer'}}>
            <button
              type="button"
              onClick={() => this.props.coerceColumn(ColumnType.BOOLEAN)}
              style={styles.menuButton}
            >
              {msg.dataTableConvertToBoolean()}
            </button>
          </li>
        </ul>
      </span>
    );
  }
}

const buttonReset = {
  background: 'none',
  border: 'none',
  font: 'inherit',
  cursor: 'pointer',
};

const styles = {
  icon: {
    color: 'white',
    cursor: 'pointer',
  },
  dropdownToggle: {
    ...buttonReset,
    padding: 0,
    margin: 0,
  },
  menuButton: {
    ...buttonReset,
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '2px 12px',
  },
};
