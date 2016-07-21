/**
 * @overview Component for editing a data table.
 */

import AddColumnButton from './AddColumnButton';
import AddTableRow from './AddTableRow';
import { DataView } from '../constants';
import EditTableRow from './EditTableRow';
import ColumnHeader from './ColumnHeader';
import Radium from 'radium';
import React from 'react';
import { changeView } from '../redux/data';
import * as dataStyles from './dataStyles';
import { connect } from 'react-redux';

const MAX_TABLE_WIDTH = 970;

const styles = {
  table: {
    clear: 'both',
    width: '100%'
  }
};

const DataTable = React.createClass({
  propTypes: {
    // from redux state
    tableName: React.PropTypes.string.isRequired,
    // "if all of the keys are integers, and more than half of the keys between 0 and
    // the maximum key in the object have non-empty values, then Firebase will render
    // it as an array."
    // https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
    tableRecords: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array
    ]).isRequired,
    view: React.PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onViewChange: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      newColumns: []
    };
  },

  addColumn(newColumn) {
    this.setState({
      newColumns: this.state.newColumns.concat(newColumn)
    });
  },

  getColumnNames() {
    // Make sure 'id' is the first column.
    let columnNames = ['id'];

    Object.keys(this.props.tableRecords).forEach(id => {
      const record = JSON.parse(this.props.tableRecords[id]);
      Object.keys(record).forEach(columnName => {
        if (columnNames.indexOf(columnName) === -1) {
          columnNames.push(columnName);
        }
      });
    });

    this.state.newColumns.forEach(columnName => {
      if (columnNames.indexOf(columnName) === -1) {
        columnNames.push(columnName);
      }
    });

    return columnNames;
  },

  render() {
    const columnNames = this.getColumnNames();
    const visible = (DataView.TABLE === this.props.view);
    const containerStyle = {
      display: visible ? 'block' : 'none',
      maxWidth: MAX_TABLE_WIDTH
    };
    return (
      <div id="dataTable" style={containerStyle}>
        <h4>
          <a
            href="#"
            style={dataStyles.link}
            onClick={() => this.props.onViewChange(DataView.OVERVIEW)}
          >
            Data
          </a>
          &nbsp;&gt; {this.props.tableName}
        </h4>

        <AddColumnButton columns={columnNames} addColumn={this.addColumn}/>

        <table style={styles.table}>
          <tbody>
          <tr>
            {
              columnNames.map(columnName => (
                <ColumnHeader key={columnName} columnName={columnName}/>
              ))
            }
            <th style={dataStyles.headerCell}/>
          </tr>

          <AddTableRow tableName={this.props.tableName} columnNames={columnNames}/>

          {
            Object.keys(this.props.tableRecords).map(id => (
              <EditTableRow
                columnNames={columnNames}
                tableName={this.props.tableName}
                record={JSON.parse(this.props.tableRecords[id])}
                key={id}
              />
            ))
          }
          </tbody>
        </table>
      </div>
    );
  }
});

export default connect(state => ({
  view: state.data.view,
  tableRecords: state.data.tableRecords || {},
  tableName: state.data.tableName || ''
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(Radium(DataTable));
