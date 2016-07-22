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
    renameColumn: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      isEditing: false,
      isValid: true,
      newName: ''
    };
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isEditing && !prevState.isEditing) {
      ReactDOM.findDOMNode(this.refs.input).select();
    }
  },

  handleBlur() {
    this.handleRenameConfirm();
  },

  handleChange(event) {
    const newName = event.target.value;
    const isValid = this.isValid(newName);
    this.setState({isValid, newName});
  },

  handleDelete() {
    this.props.deleteColumn(this.props.columnName);
  },

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.handleRenameConfirm();
    } else if (event.key === 'Escape') {
      this.setState(this.getInitialState());
    }
  },

  handleRename() {
    this.setState({
      isEditing: true,
      newName: this.props.columnName
    });
  },

  handleRenameConfirm() {
    if (this.state.isEditing && !this.props.columnNames.includes(this.state.newName)) {
      this.props.renameColumn(this.props.columnName, this.state.newName);
    }
    this.setState(this.getInitialState());
  },

  isValid(newName) {
    // The current name is always valid.
    return this.props.columnName === newName || !this.props.columnNames.includes(newName);
  },

  render() {
    const menuStyle = [styles.menu, {
      display: this.props.columnName === 'id' ? 'none' : null,
    }];
    const containerStyle = {
      display: this.state.isEditing ? 'none' : null
    };
    const inputStyle = [dataStyles.input, {
      display: this.state.isEditing ? null : 'none',
      backgroundColor: this.state.isValid ? null : "#ffcccc",
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
          value={this.state.newName}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
        />
      </th>
    );
  }
});

export default Radium(ColumnHeader);
