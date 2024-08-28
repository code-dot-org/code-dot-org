/**
 * @overview Component for adding a new column to the specified table.
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Dialog from '../../legacySharedComponents/Dialog';
import FontAwesome from '../../legacySharedComponents/FontAwesome';
import color from '../../util/color';
import {valueOr} from '../../utils';

import ColumnMenu from './ColumnMenu';

import style from './column-header.module.scss';
import dataStyles from './data-styles.module.scss';

const INITIAL_STATE = {
  newName: undefined,
  hasEnteredText: false,
  isDialogOpen: false,
};

class ColumnHeader extends React.Component {
  static propTypes = {
    coerceColumn: PropTypes.func.isRequired,
    columnName: PropTypes.string.isRequired,
    columnNames: PropTypes.array.isRequired,
    deleteColumn: PropTypes.func.isRequired,
    editColumn: PropTypes.func.isRequired,
    isEditable: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isPending: PropTypes.bool.isRequired,
    readOnly: PropTypes.bool,
    renameColumn: PropTypes.func.isRequired,
  };

  state = {...INITIAL_STATE};

  componentDidMount() {
    if (this.props.isEditing) {
      this.input.select();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isEditing && nextProps.isEditing) {
      // Don't display a stale value for newName.
      this.setState(INITIAL_STATE);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.isEditing && !this.state.hasEnteredText) {
      this.input.select();
    }
  }

  handleBlur = () => this.handleRenameConfirm();

  handleChange = event => {
    this.setState({
      newName: event.target.value,
      hasEnteredText: true,
    });
  };

  handleClose = () => this.setState({isDialogOpen: false});

  handleDelete = () => this.setState({isDialogOpen: true});

  handleConfirmDelete = () => {
    this.setState({isDialogOpen: false});
    this.props.deleteColumn(this.props.columnName);
  };

  handleKeyUp = event => {
    if (event.key === 'Enter') {
      this.handleRenameConfirm();
    } else if (event.key === 'Escape') {
      this.props.editColumn(null);
    }
  };

  handleRename = () => this.props.editColumn(this.props.columnName);

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
  }

  /**
   * @param {ColumnType} type
   */
  coerceColumn = type => this.props.coerceColumn(this.props.columnName, type);

  isInputValid() {
    // The current name is always valid.
    const newName = this.state.newName;
    return (
      this.props.columnName === newName ||
      !this.props.columnNames.includes(newName)
    );
  }

  render() {
    const inputStyle = {
      ...{
        display: this.props.isEditing ? null : 'none',
        backgroundColor: this.isInputValid() ? null : color.lightest_red,
        minWidth: 80,
      },
    };
    return (
      <th
        className={classNames(
          dataStyles.headerCell,
          'uitest-data-table-column'
        )}
      >
        <div
          className={classNames(
            style.container,
            this.props.isEditing && style.containerIsEditing
          )}
        >
          <div className={classNames(style.columnName, 'test-tableNameDiv')}>
            {this.props.columnName}
          </div>
          {!this.props.readOnly && (
            <div className={style.iconWrapper}>
              {this.props.isPending ? (
                <FontAwesome
                  icon="spinner"
                  className={classNames('fa-spin', style.icon)}
                />
              ) : (
                <ColumnMenu
                  coerceColumn={this.coerceColumn}
                  handleDelete={this.handleDelete}
                  handleRename={this.handleRename}
                  isEditable={this.props.isEditable}
                />
              )}
            </div>
          )}
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
          ref={input => (this.input = input)}
          className={dataStyles.input}
          style={inputStyle}
          value={valueOr(this.state.newName, this.props.columnName)}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
        />
      </th>
    );
  }
}

export default ColumnHeader;
