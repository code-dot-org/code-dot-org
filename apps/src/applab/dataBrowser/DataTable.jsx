/**
 * @overview Component for editing a data table.
 */

import { DataView } from '../constants';
import Radium from 'radium';
import React from 'react';
import { changeView } from '../redux/data';
import * as dataStyles from './dataStyles';
import { connect } from 'react-redux';

const DataTable = React.createClass({
  propTypes: {
    // from redux state
    tableData: React.PropTypes.object.isRequired,
    tableName: React.PropTypes.string.isRequired,
    view: React.PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onViewChange: React.PropTypes.func.isRequired
  },

  render() {
    const visible = (DataView.TABLE === this.props.view);
    return (
      <div id='dataTable' style={{display: visible ? 'block' : 'none'}}>
        <h4>
          <a href='#' style={dataStyles.link}
             onClick={() => this.props.onViewChange(DataView.OVERVIEW)}>
            Data
          </a>
          &nbsp;&gt; {this.props.tableName}
        </h4>
        {/* placeholder display of table contents */}
        {JSON.stringify(this.props.tableData, null, 2)}
      </div>
    );
  }
});

export default connect(state => ({
  view: state.data.view,
  tableData: state.data.tableData,
  tableName: state.data.tableName || ''
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(Radium(DataTable));
