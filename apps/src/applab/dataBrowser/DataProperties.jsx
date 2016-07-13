/**
 * @overview Component for editing key/value pairs.
 */

import AddKeyRow from './AddKeyRow';
import { DataView } from '../constants';
import EditKeyRow from './EditKeyRow';
import Radium from 'radium';
import React from 'react';
import { changeView } from '../redux/data';
import { connect } from 'react-redux';
import * as dataStyles from './dataStyles';

const DataProperties = React.createClass({
  propTypes: {
    // from redux state
    view: React.PropTypes.oneOf(Object.keys(DataView)),
    keyValueData: React.PropTypes.object.isRequired,

    // from redux dispatch
    onViewChange: React.PropTypes.func.isRequired
  },

  getValue(key) {
    return String(JSON.parse(this.props.keyValueData[key]));
  },

  render() {
    const visible = (DataView.PROPERTIES === this.props.view);
    return (
      <div id='dataProperties' style={{display: visible ? 'block' : 'none'}}>
        <h4>
         <a
             href='#'
             style={dataStyles.link}
             onClick={() => this.props.onViewChange(DataView.OVERVIEW)}
         >
           Data
         </a>
         &nbsp;&gt; Key/value pairs
        </h4>

        <table>
          <colgroup>
            <col width='200'/>
            <col width='200'/>
            <col width='162'/>
          </colgroup>
          <tbody>
            <tr>
              <th style={dataStyles.headerCell}>Key</th>
              <th style={dataStyles.headerCell}>Value</th>
              <th style={dataStyles.headerCell}></th>
            </tr>

            <AddKeyRow/>

            {
              Object.keys(this.props.keyValueData).map(key => (
                <EditKeyRow key={key} keyName={key} value={this.getValue(key)}/>
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
  keyValueData: state.data.keyValueData || {}
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(Radium(DataProperties));
