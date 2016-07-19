/**
 * @overview Component for adding a new column to the specified table.
 */

import Radium from 'radium';
import React from 'react';

import * as dataStyles from './dataStyles';
import { connect } from 'react-redux';

const containerStyle = {
  float: 'right',
  paddingTop: 10,
  paddingLeft: 10,
  paddingBottom: 10,
  paddingRight: 0
};

const AddColumnButton = React.createClass({
  propTypes: {
    addColumn: React.PropTypes.func.isRequired
  },

  handleAdd() {
    this.props.addColumn('foo');
  },

  render() {
    return (
      <div style={containerStyle}>
        <button className="btn" onClick={this.handleAdd} style={dataStyles.button}>
          Add column
        </button>
      </div>
    );
  }
});
export default Radium(AddColumnButton);
