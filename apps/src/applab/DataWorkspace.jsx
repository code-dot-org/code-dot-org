import { ApplabInterfaceMode } from './constants';
import DataOverview from './DataOverview';
import DataProperties from './DataProperties';
import React from 'react';
import PaneHeader, { PaneSection } from '../templates/PaneHeader';
import { connect } from 'react-redux';
import msg from '../locale';
import color from '../color';

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
  }
};

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
          <DataOverview/>
          <DataProperties/>
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
