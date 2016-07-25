/**
 * @overview Component for adding a new column to the specified table.
 */

import Radium from 'radium';
import React from 'react';
import ReactDOM from 'react-dom';

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
    columnNames: React.PropTypes.array.isRequired,
    deleteColumn: React.PropTypes.func.isRequired,
    editColumn: React.PropTypes.func.isRequired,
    isEditable: React.PropTypes.bool.isRequired,
    isEditing: React.PropTypes.bool.isRequired,
    renameColumn: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      newName: '',
      hasEnteredText: false,
    };
  },

  componentDidMount() {
    if (this.props.isEditing) {
      ReactDOM.findDOMNode(this.refs.input).select();
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
      ReactDOM.findDOMNode(this.refs.input).select();
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

  handleDelete() {
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

    // Try to rename even if we are not changing the name, in case the column does not
    // exist yet.
    const oldName = this.props.columnName;
    const newName = this.state.newName;
    if (newName === oldName ||
      (!this.props.columnNames.includes(newName)) && newName !== '') {
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
      display: this.props.isEditing ? 'none' : null
    };
    const inputStyle = [dataStyles.input, {
      display: this.props.isEditing ? null : 'none',
      backgroundColor: this.isInputValid() ? null : "#ffcccc",
    }];
    return (
      <th style={dataStyles.headerCell}>
        <div style={containerStyle}>
          {this.props.columnName}
          {/* TODO(dave): remove 'pull-right' once we upgrade to bootstrap 3.1.0 */}
          <span className="dropdown pull-right" style={menuStyle}>
            <a className="dropdown-toggle" data-toggle="dropdown">
              <i className="fa fa-cog" style={styles.icon} />
            </a>
            <ul className="dropdown-menu dropdown-menu-right">
              <li>
                <a onClick={this.handleRename}>
                 Rename
                </a>
              </li>
              <li>
                <a onClick={this.handleDelete}>
                 Delete
                </a>
              </li>
            </ul>
          </span>
        </div>
        <input
          ref="input"
          style={inputStyle}
          value={this.state.newName || this.props.columnName}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
        />
      </th>
    );
  }
});

export default Radium(ColumnHeader);
