/**
 * @overview Component containing UI controls for modifying the table, including
 * import, export, adding a new column, and deleting the entire table.
 */

import React from 'react';

import * as dataStyles from './dataStyles';

const containerStyle = {
  float: 'right',
  paddingTop: 10,
  paddingLeft: 10,
  paddingBottom: 10,
  paddingRight: 0
};

const TableControls = React.createClass({
  propTypes: {
    addColumn: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div style={containerStyle}>
        <button className="btn" onClick={this.props.addColumn} style={dataStyles.button}>
          Add column
        </button>
      </div>
    );
  }
});
export default TableControls;
