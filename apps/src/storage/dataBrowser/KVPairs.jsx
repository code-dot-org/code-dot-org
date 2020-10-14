/**
 * @overview Component for editing key/value pairs.
 */
import _ from 'lodash';
import AddKeyRow from './AddKeyRow';
import {DataView} from '../constants';
import EditKeyRow from './EditKeyRow';
import DataEntryError from './DataEntryError';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import {changeView, showWarning} from '../redux/data';
import {connect} from 'react-redux';
import * as dataStyles from './dataStyles';

class KVPairs extends React.Component {
  static propTypes = {
    // from redux state
    view: PropTypes.oneOf(Object.keys(DataView)),
    keyValueData: PropTypes.object.isRequired,

    // from redux dispatch
    onShowWarning: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired
  };

  state = {
    showDebugView: false,
    showError: false
  };

  showError = () => this.setState({showError: true});
  hideError = () => this.setState({showError: false});

  toggleDebugView = () => {
    const showDebugView = !this.state.showDebugView;
    this.setState({showDebugView});
  };

  getKeyValueJson() {
    const keyValueData = _.mapValues(this.props.keyValueData, JSON.parse);
    return JSON.stringify(keyValueData, null, 2);
  }

  render() {
    const keyValueDataStyle = {
      display: this.state.showDebugView ? 'none' : ''
    };

    const kvTable = (
      <table style={keyValueDataStyle}>
        <tbody>
          <tr>
            <th style={dataStyles.headerCell}>Key</th>
            <th style={dataStyles.headerCell}>Value</th>
            <th style={dataStyles.headerCell}>Actions</th>
          </tr>

          <AddKeyRow
            onShowWarning={this.props.onShowWarning}
            showError={this.showError}
            hideError={this.hideError}
          />

          {Object.keys(this.props.keyValueData).map(key => (
            <EditKeyRow
              key={key}
              keyName={key}
              value={JSON.parse(this.props.keyValueData[key])}
              showError={this.showError}
              hideError={this.hideError}
            />
          ))}
        </tbody>
      </table>
    );

    return (
      <div>
        <DataEntryError isVisible={this.state.showError} />
        {kvTable}
      </div>
    );
  }
}

export default connect(
  state => ({
    view: state.data.view,
    keyValueData: state.data.keyValueData || {}
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    },
    onViewChange(view) {
      dispatch(changeView(view));
    }
  })
)(Radium(KVPairs));
