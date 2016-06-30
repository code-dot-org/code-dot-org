/**
 * @overview Component for editing key/value pairs.
 */

import { DataView } from './constants';
import Radium from 'radium';
import React from 'react';
import { changeView } from './redux/data';
import { connect } from 'react-redux';
import dataStyles from './dataStyles';

const DataProperties = React.createClass({
  propTypes: {
    // from redux state
    view: React.PropTypes.oneOf(Object.keys(DataView)),
    keyValueData: React.PropTypes.object.isRequired,

    // from redux dispatch
    onViewChange: React.PropTypes.func.isRequired
  },

  /**
   * Formats the key/value pairs on this.props.keyValueData and returns
   * them as an array of arrays [[key1, val1], [key2, val2] ...].
   * @returns {Array}
   */
  getKeyValueData() {
    return Object.keys(this.props.keyValueData).map(key => {
      return [key, this.props.keyValueData[key]];
    });
  },

  render() {
    const visible = (DataView.PROPERTIES === this.props.view);
    return (
      <div id='dataProperties' style={{display: visible ? 'block' : 'none'}}>
        <h4>
         <a href='#' style={dataStyles.link}
             onClick={() => this.props.onViewChange(DataView.OVERVIEW)}>
           Data
         </a>
         &nbsp;&gt; Key/value pairs
        </h4>

        {/* placeholder display of key-value pairs */}
        <table>
          <colgroup>
            <col width='200'/>
            <col width='200'/>
            <col width='160'/>
          </colgroup>
          <tbody>
            <tr>
              <th style={dataStyles.headerCell}>Key</th>
              <th style={dataStyles.headerCell}>Value</th>
              <th style={dataStyles.headerCell}></th>
            </tr>

            <tr style={dataStyles.addRow}>
              <td style={dataStyles.cell}>
                <input style={dataStyles.input}></input>
              </td>
              <td style={dataStyles.cell}>
                <input style={dataStyles.input}></input>
              </td>
              <td style={dataStyles.cell}>
                <button className="btn btn-primary" style={dataStyles.button}>Add pair</button>
              </td>
            </tr>

            {
              this.getKeyValueData().map(row => {
                const [key, value] = row;
                return <EditKeyRow key={key} keyName={key} value={value}/>;
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
});

const EditKeyRow = Radium(React.createClass({
  propTypes: {
    keyName: React.PropTypes.string.isRequired,
    value: React.PropTypes.any.isRequired
  },

  render() {
    return (
      <tr style={dataStyles.editRow}>
        <td style={dataStyles.cell}>{this.props.keyName}</td>
        <td style={dataStyles.cell}>{this.props.value}</td>
        <td style={dataStyles.cell}>
          <button className="btn" style={dataStyles.editButton}>Edit</button>
          <button className="btn btn-danger" style={dataStyles.button}>Delete</button>
        </td>
      </tr>
    );
  }
}));

export default connect(state => ({
  view: state.data.view,
  keyValueData: state.data.keyValueData
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(Radium(DataProperties));
