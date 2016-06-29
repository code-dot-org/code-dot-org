/**
 * @overview Component containing a link to edit key/value pairs, a list of
 * existing data tables with controls to edit/delete, and a control to add
 * a new data table.
 */

import React from 'react';
import msg from '../locale';
import color from '../color';

const tableWidth = 400;
const buttonColumnWidth = 90;
const rowHeight = 45;
const cellPadding = 10;

const styles = {
  table: {
    width: tableWidth,
    marginTop: 10,
    marginBottom: 10,
    color: color.purple
  },
  editRow: {
    height: rowHeight
  },
  addRow: {
    height: rowHeight,
    backgroundColor: color.lighter_purple
  },
  cell: {
    padding: cellPadding,
    border: '1px solid gray'
  },
  input: {
    width: 'calc(100% - 14px)',
    height: 20,
    border: '1px solid gray',
    borderRadius: 5,
    padding: '4px 6px'
  },
  button: {
    margin: 0
  },
  link: {
    color: color.purple,
    fontFamily: "'Gotham 7r', sans-serif",
    fontSize: 14
  }
};

const EditLink = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired
  },
  render() {
    return <a style={styles.link} href='#'>{this.props.name}</a>;
  }
});

const EditTableRow = React.createClass({
  propTypes: {
    tableName: React.PropTypes.string.isRequired
  },
  render() {
    return (
      <tr style={styles.editRow}>
        <td style={styles.cell}>
          <EditLink name={this.props.tableName}/>
        </td>
        <td style={styles.cell}>
          <button className='btn btn-danger' style={styles.button}>Delete</button>
        </td>
      </tr>
    );
  }
});

const AddTableRow = React.createClass({
  render() {
    return (
      <tr style={styles.addRow}>
        <td style={styles.cell}>
          <input style={styles.input} placeholder={msg.dataTableNamePlaceholder()}></input>
        </td>
        <td style={styles.cell}>
          <button className='btn btn-primary' style={styles.button}>Add</button>
        </td>
      </tr>
    );
  }
});

const DataOverview = React.createClass({
  render() {
    return (
      <div id='dataOverview'>
        <h4>Data</h4>

        <table style={styles.table}>
          <tbody>
          <tr style={styles.editRow}>
            <td style={styles.cell}>
              <EditLink name={msg.keyValuePairLink()}/>
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
          {/* placeholder table names, to be populated from Firebase */}
          <EditTableRow tableName="Table 1"/>
          <EditTableRow tableName="Table 2"/>
          <AddTableRow/>
          </tbody>
        </table>
      </div>
    );
  }
});

export default DataOverview;
