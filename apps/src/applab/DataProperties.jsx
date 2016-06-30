/**
 * @overview Component for editing key/value pairs.
 */

import { DataView } from './constants';
import React from 'react';
import { changeView } from './redux/data';
import color from '../color';
import { connect } from 'react-redux';

const rowHeight = 45;
const cellPadding = 10;

const styles = {
  addRow: {
    backgroundColor: color.lighter_purple,
    height: rowHeight
  },
  editRow: {
    height: rowHeight
  },
  link: {
    color: color.purple,
    fontFamily: "'Gotham 7r', sans-serif"
  },
  cell: {
    padding: cellPadding,
    border: '1px solid gray',
    fontSize: 14
  },
  headerCell: {
    padding: cellPadding,
    border: '1px solid gray',
    backgroundColor: color.teal
  },
  button: {
    margin: 0
  },
  editButton: {
    marginTop: 0,
    marginLeft: 0,
    marginBottom: 0,
    marginRight: 10
  }
};

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
         <a href='#' style={styles.link}
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
              <th style={styles.headerCell}>Key</th>
              <th style={styles.headerCell}>Value</th>
              <th style={styles.headerCell}></th>
            </tr>

            <tr style={styles.addRow}>
              <td style={styles.cell}></td>
              <td style={styles.cell}></td>
              <td style={styles.cell}>
                <button className="btn btn-primary" style={styles.button}>Add pair</button>
              </td>
            </tr>

            {
              this.getKeyValueData().map(row => {
                const [key, value] = row;
                return (
                  <tr key={key} style={styles.editRow}>
                    <td style={styles.cell}>{key}</td>
                    <td style={styles.cell}>{value}</td>
                    <td style={styles.cell}>
                      <button className="btn" style={styles.editButton}>Edit</button>
                      <button className="btn btn-danger" style={styles.button}>Delete</button>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
});

export default connect(state => ({
  view: state.data.view,
  keyValueData: state.data.keyValueData
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(DataProperties);
