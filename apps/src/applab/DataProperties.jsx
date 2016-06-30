/**
 * @overview Component for editing key/value pairs.
 */

import { DataView } from './constants';
import React from 'react';
import { changeView } from './redux/data';
import color from '../color';
import { connect } from 'react-redux';

const styles = {
  link: {
    color: color.purple,
    fontFamily: "'Gotham 7r', sans-serif"
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
          <tbody>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
            {
              this.getKeyValueData().map(row => {
                const [key, value] = row;
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
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
