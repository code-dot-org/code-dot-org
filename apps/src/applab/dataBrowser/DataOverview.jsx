/**
 * @overview Component containing a link to edit key/value pairs, a list of
 * existing data tables with controls to edit/delete, and a control to add
 * a new data table.
 */

import AddTableListRow from './AddTableListRow';
import { DataView } from '../constants';
import EditLink from './EditLink';
import EditTableListRow from './EditTableListRow';
import Radium from 'radium';
import React from 'react';
import msg from '../../locale';
import { addTableName, changeView, deleteTableName } from '../redux/data';
import { connect } from 'react-redux';
import * as dataStyles from './dataStyles';

const tableWidth = 400;
const buttonColumnWidth = 90;

const styles = {
  table: {
    width: tableWidth,
    marginTop: 10,
    marginBottom: 10
  }
};

const DataOverview = React.createClass({
  propTypes: {
    // from redux state
    tableListMap: React.PropTypes.object.isRequired,
    view: React.PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onTableAdd: React.PropTypes.func.isRequired,
    onTableDelete: React.PropTypes.func.isRequired,
    onViewChange: React.PropTypes.func.isRequired
  },

  render() {
    const visible = (DataView.OVERVIEW === this.props.view);
    return (
      <div id='dataOverview' style={{display: visible ? 'block' : 'none'}}>
        <h4>Data</h4>

        <table style={styles.table}>
          <tbody>
          <tr style={dataStyles.editRow}>
            <td style={dataStyles.cell}>
              <EditLink
                  name={msg.keyValuePairLink()}
                  onClick={() => this.props.onViewChange(DataView.PROPERTIES)}/>
            </td>
          </tr>
          </tbody>
        </table>

        <table style={styles.table}>
          <colgroup>
            <col width={tableWidth - buttonColumnWidth}/>
            <col width={buttonColumnWidth}/>
          </colgroup>
          <tbody>
          {
            Object.keys(this.props.tableListMap).map(tableName => (
              <EditTableListRow
                  key={tableName}
                  tableName={tableName}
                  onViewChange={this.props.onViewChange}
                  onTableDelete={this.props.onTableDelete}/>
            ))
          }
          <AddTableListRow
              onTableAdd={this.props.onTableAdd}
              onViewChange={this.props.onViewChange}/>
          </tbody>
        </table>
      </div>
    );
  }
});

export default connect(state => ({
  view: state.data.view,
  tableListMap: state.data.tableListMap || {}
}), dispatch => ({
  onViewChange(view, tableName) {
    dispatch(changeView(view, tableName));
  },
  onTableAdd(tableName) {
    // Add the table name to the model even though it doesn't exist in the database yet,
    // so that it appears in the overview even if we don't create a record in it.
    // addTableName() is idempotent, so we won't double-count the table name later
    // when the the first record is added to it.
    dispatch(addTableName(tableName));
  },
  onTableDelete(tableName) {
    // Explicitly remove the table from the model to make sure it disappears from the
    // list, since we won't receive a delete event from the database if the table did
    // not exist in the database. This could happen when deleting a table after adding it
    // without adding any records to it.
    dispatch(deleteTableName(tableName));
  }
}))(Radium(DataOverview));
