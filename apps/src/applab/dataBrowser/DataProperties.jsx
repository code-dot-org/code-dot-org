/**
 * @overview Component for editing key/value pairs.
 */

import _ from 'lodash';
import AddKeyRow from './AddKeyRow';
import { DataView } from '../constants';
import EditKeyRow from './EditKeyRow';
import FontAwesome from '../../templates/FontAwesome';
import Radium from 'radium';
import React from 'react';
import { changeView } from '../redux/data';
import { connect } from 'react-redux';
import * as dataStyles from './dataStyles';

const styles = {
  container: {
    height: '100%',
    overflowY: 'scroll',
  },
  tableName: {
    fontSize: 18,
    marginBottom: 10,
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

  getInitialState() {
    return {
      showDebugView: false,
    };
  },

  toggleDebugView() {
    const showDebugView = !this.state.showDebugView;
    this.setState({showDebugView});
  },

  getKeyValueJson() {
    const keyValueData = _.mapValues(this.props.keyValueData, JSON.parse);
    return JSON.stringify(keyValueData, null, 2);
  },

  render() {
    const visible = (DataView.PROPERTIES === this.props.view);
    const containerStyle = [styles.container, {
      display: visible ? 'block' : 'none'
    }];
    const keyValueDataStyle = {
      display: this.state.showDebugView ? 'none' : ''
    };
    const debugDataStyle = [dataStyles.debugData, {
      display: this.state.showDebugView ? '' : 'none',
    }];
    return (
      <div id="dataProperties" style={containerStyle}>
        <div style={dataStyles.viewHeader}>
          <span style={dataStyles.backLink}>
            <a
              id="propertiesBackToOverview"
              style={dataStyles.link}
              onClick={() => this.props.onViewChange(DataView.OVERVIEW)}
            >
              <FontAwesome icon="arrow-circle-left"/>&nbsp;Back to data
            </a>
          </span>

          <span style={dataStyles.debugLink}>
            <a
              id="tableDebugLink"
              style={dataStyles.link}
              onClick={() => this.toggleDebugView()}
            >
              {this.state.showDebugView ? 'Key/value view' : 'Debug view'}
            </a>

          </span>
        </div>

        <div style={styles.tableName}>
          Key/value pairs
        </div>

        <div style={debugDataStyle}>
          {this.getKeyValueJson()}
        </div>

        <table style={keyValueDataStyle}>
          <tbody>
            <tr>
              <th style={dataStyles.headerCell}>Key</th>
              <th style={dataStyles.headerCell}>Value</th>
              <th style={dataStyles.headerCell}>Actions</th>
            </tr>

            <AddKeyRow/>

            {
              Object.keys(this.props.keyValueData).map(key => (
                <EditKeyRow
                  key={key}
                  keyName={key}
                  value={JSON.parse(this.props.keyValueData[key])}
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
  keyValueData: state.data.keyValueData || {}
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(Radium(DataProperties));
