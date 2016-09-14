/**
 * @overview Component for adding a new column to the specified table.
 */

import Dialog from '../../templates/Dialog';
import FontAwesome from '../../templates/FontAwesome';
import Radium from 'radium';
import React from 'react';
import color from '../../color';
import * as dataStyles from './dataStyles';
import { valueOr } from '../../utils';

const styles = {
  menu: {
    float: 'right'
  },
  icon: {
    color: 'white',
    cursor: 'pointer',
  }
};

const ColumnHeader = React.createClass({
  propTypes: {
    columnName: React.PropTypes.string.isRequired,
    columnNames: React.PropTypes.array.isRequired,
    deleteColumn: React.PropTypes.func.isRequired,
    editColumn: React.PropTypes.func.isRequired,
    isEditable: React.PropTypes.bool.isRequired,
    isEditing: React.PropTypes.bool.isRequired,
    renameColumn: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      newName: undefined,
      hasEnteredText: false,
      isDialogOpen: false,
    };
  },

  componentDidMount() {
    if (this.props.isEditing) {
      this.input.select();
    }
  },

  componentWillReceiveProps(nextProps) {
    if (!this.props.isEditing && nextProps.isEditing) {
      // Don't display a stale value for newName.
      this.setState(this.getInitialState());
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.props.isEditing && !this.state.hasEnteredText) {
      this.input.select();
    }
  },

  handleBlur() {
    this.handleRenameConfirm();
  },

  handleChange(event) {
    this.setState({
      newName: event.target.value,
      hasEnteredText: true,
    });
  },

  handleClose() {
    this.setState({isDialogOpen: false});
  },

  handleConfirmDelete() {
    this.setState({isDialogOpen: false});
    this.props.deleteColumn(this.props.columnName);
  },

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.handleRenameConfirm();
    } else if (event.key === 'Escape') {
      this.props.editColumn(null);
    }
  },

  handleRename() {
    this.props.editColumn(this.props.columnName);
  },

  handleRenameConfirm() {
    // Make sure we only save once.
    if (!this.props.isEditing) {
      return;
    }

    const oldName = this.props.columnName;
    // newName could be undefined if the name has not been edited, or empty if the user
    // has deleted all the text from the input. In either case, treat the name as
    // unchanged.
    const newName = this.state.newName || this.props.columnName;
    // Try to rename even if we are not changing the name, in case the column does not
    // exist yet.
    if (newName === oldName || !this.props.columnNames.includes(newName)) {
      this.props.renameColumn(oldName, newName);
    } else {
      this.props.editColumn(null);
    }
  },

  isInputValid() {
    // The current name is always valid.
    const newName = this.state.newName;
    return this.props.columnName === newName || !this.props.columnNames.includes(newName);
  },

  render() {
    const menuStyle = [styles.menu, {
      display: this.props.isEditable ? null : 'none',
    }];
    const containerStyle = {
      display: this.props.isEditing ? 'none' : null,
      padding: '6px 0',
    };
    const inputStyle = [dataStyles.input, {
      display: this.props.isEditing ? null : 'none',
      backgroundColor: this.isInputValid() ? null : color.lightest_red,
      minWidth: 80,
    }];
    const columnNameStyle = {
      display: 'inline-block',
      maxWidth: dataStyles.maxCellWidth,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    };
    return (
      <th style={dataStyles.headerCell}>
        <div style={containerStyle}>
          <div style={columnNameStyle}>
            {this.props.columnName}
          </div>
          {/* TODO(dave): remove 'pull-right' once we upgrade to bootstrap 3.1.0 */}
          <span className="dropdown pull-right" style={menuStyle}>
            <a className="dropdown-toggle" data-toggle="dropdown">
              <FontAwesome icon="cog" style={styles.icon}/>
            </a>
            <ul className="dropdown-menu dropdown-menu-right">
              <li>
                <a onClick={this.handleRename}>
                 Rename
                </a>
              </li>
              <li>
                <a onClick={() => this.setState({isDialogOpen: true})}>
                 Delete
                </a>
              </li>
            </ul>
          </span>
        </div>
        <Dialog
          body="Are you sure you want to delete this entire column? You cannot undo this action."
          cancelText="Cancel"
          confirmText="Delete"
          confirmType="danger"
          isOpen={this.state.isDialogOpen}
          handleClose={this.handleClose}
          onCancel={this.handleClose}
          onConfirm={this.handleConfirmDelete}
          title="Delete column"
        />
        <input
          ref={input => this.input = input}
          style={inputStyle}
          value={valueOr(this.state.newName, this.props.columnName)}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
        />
      </th>
    );
  }
});

export default Radium(ColumnHeader);
