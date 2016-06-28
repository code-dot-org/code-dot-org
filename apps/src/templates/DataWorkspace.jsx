import { ApplabInterfaceMode } from '../applab/constants';
import React from 'react';
import PaneHeader, { PaneSection } from './PaneHeader';
import { connect } from 'react-redux';
import msg from '../locale';
import color from '../color';

const tableWidth = 400;
const buttonColumnWidth = 90;
const rowHeight = 45;
const cellPadding = 10;

const styles = {
  container: {
    position: 'absolute',
    top: 30,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: color.white,
    boxSizing: 'border-box',
    borderLeft: '1px solid gray',
    borderRight: '1px solid gray',
    borderBottom: '1px solid gray'
  },
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

const DataWorkspace = React.createClass({
  propTypes: {
    localeDirection: React.PropTypes.string.isRequired,
    isRunning: React.PropTypes.bool.isRequired,
    isVisible: React.PropTypes.bool.isRequired
  },
  render() {
    var style = {
      display: this.props.isVisible ? 'block' : 'none'
    };
    return (
      <div id='dataWorkspaceWrapper' style={style}>
        <PaneHeader
            id='headers'
            dir={this.props.localeDirection}
            hasFocus={!this.props.isRunning}
            className={this.props.isRunning ? 'is-running' : ''}>
          <div id='dataModeHeaders'>
            <PaneSection id='workspace-header'>
              <span id='workspace-header-span'>
                {msg.dataWorkspaceHeader()}
              </span>
            </PaneSection>
          </div>
        </PaneHeader>

        <div id='data-mode-container' style={styles.container}>
          <div id='data-table-container' style={styles.tableContainer}>
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
        </div>
      </div>
    );
  }
});

export default connect(state => ({
  localeDirection: state.pageConstants.localeDirection,
  isRunning: !!state.runState.isRunning,
  isVisible: ApplabInterfaceMode.DATA === state.interfaceMode
}))(DataWorkspace);
