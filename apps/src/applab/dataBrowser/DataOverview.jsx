/**
 * @overview Component containing a link to edit key/value pairs, a list of
 * existing data tables with controls to edit/delete, and a control to add
 * a new data table.
 */

import { DataView } from '../constants';
import Radium from 'radium';
import React from 'react';
import msg from '../../locale';
import { changeView } from '../redux/data';
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

const EditLink = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired
  },
  render() {
    return (
      <a style={dataStyles.link} href='#' onClick={this.props.onClick}>
        {this.props.name}
      </a>
    );
  }
});

const EditTableRow = React.createClass({
  propTypes: {
    onViewChange: React.PropTypes.func.isRequired,
    tableName: React.PropTypes.string.isRequired
  },

  handleClick() {
    this.props.onViewChange(DataView.TABLE, this.props.tableName);
  },

  render() {
    return (
      <tr style={dataStyles.editRow}>
        <td style={dataStyles.cell}>
          <EditLink name={this.props.tableName} onClick={this.handleClick}/>
        </td>
        <td style={dataStyles.cell}>
          <button className='btn btn-danger' style={dataStyles.button}>Delete</button>
        </td>
      </tr>
    );
  }
});

const AddTableRow = React.createClass({
  render() {
    return (
      <tr style={dataStyles.addRow}>
        <td style={dataStyles.cell}>
          <input style={dataStyles.input} placeholder={msg.dataTableNamePlaceholder()}></input>
        </td>
        <td style={dataStyles.cell}>
          <button className='btn btn-primary' style={dataStyles.button}>Add</button>
        </td>
      </tr>
    );
  }
});

const DataOverview = React.createClass({
  propTypes: {
    // from redux state
    view: React.PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
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
          {/* placeholder table names, to be populated from Firebase */}
          <EditTableRow
              tableName="Table 1"
              onViewChange={this.props.onViewChange}/>
          <EditTableRow
              tableName="Table 2"
              onViewChange={this.props.onViewChange}/>
          <AddTableRow/>
          </tbody>
        </table>
      </div>
    );
  }
});

export default connect(state => ({
  view: state.data.view
}), dispatch => ({
  onViewChange(view, tableName) {
    dispatch(changeView(view, tableName));
  }
}))(Radium(DataOverview));
