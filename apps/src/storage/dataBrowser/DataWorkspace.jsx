import {ApplabInterfaceMode} from '../../applab/constants';
import {DataView} from '../constants';
import DataOverview from './DataOverview';
import DataTableView from './DataTableView';
import Dialog from '../../templates/Dialog';
import PropTypes from 'prop-types';
import React from 'react';
import PaneHeader, {PaneSection, PaneButton} from '../../templates/PaneHeader';
import {connect} from 'react-redux';
import {clearWarning} from '../redux/data';
import msg from '@cdo/locale';
import color from '../../util/color';

class DataWorkspace extends React.Component {
  static propTypes = {
    // from redux state
    isRtl: PropTypes.bool.isRequired,
    handleVersionHistory: PropTypes.func.isRequired,
    isRunning: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    warningMsg: PropTypes.string.isRequired,
    warningTitle: PropTypes.string.isRequired,
    isWarningDialogOpen: PropTypes.bool.isRequired,
    view: PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onClearWarning: PropTypes.func.isRequired
  };

  render() {
    const style = {
      display: this.props.isVisible ? 'block' : 'none'
    };
    return (
      <div id="dataWorkspaceWrapper" style={style}>
        <PaneHeader
          id="headers"
          dir={this.props.isRtl ? 'rtl' : 'ltr'}
          hasFocus={!this.props.isRunning}
          className={this.props.isRunning ? 'is-running' : ''}
        >
          {(this.props.view === DataView.OVERVIEW ||
            this.props.view === DataView.PROPERTIES) && (
            <PaneSection id="library-header" style={styles.libraryHeader}>
              <span id="library-header-span">{msg.dataLibraryHeader()}</span>
            </PaneSection>
          )}
          <div id="dataModeHeaders">
            <PaneButton
              id="data-mode-versions-header"
              iconClass="fa fa-clock-o"
              label={msg.showVersionsHeader()}
              headerHasFocus={!this.props.isRunning}
              isRtl={this.props.isRtl}
              onClick={this.props.handleVersionHistory}
            />
            <PaneSection id="workspace-header">
              <span id="workspace-header-span">
                {msg.dataWorkspaceHeader()}
              </span>
            </PaneSection>
          </div>
        </PaneHeader>

        <div id="data-mode-container" style={styles.container}>
          <DataOverview />
          <DataTableView />
        </div>
        <Dialog
          body={this.props.warningMsg}
          confirmText="Ok"
          isOpen={this.props.isWarningDialogOpen}
          handleClose={this.props.onClearWarning}
          onConfirm={this.props.onClearWarning}
          title={this.props.warningTitle}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'absolute',
    top: 30,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 0,
    backgroundColor: color.white,
    boxSizing: 'border-box',
    borderLeft: '1px solid gray',
    borderRight: '1px solid gray',
    borderBottom: '1px solid gray',
    overflowY: 'auto'
  },
  libraryHeader: {
    display: 'block',
    width: 270,
    borderRight: '1px solid gray',
    float: 'left'
  }
};

export default connect(
  state => ({
    isRtl: state.isRtl,
    isRunning: !!state.runState.isRunning,
    isVisible: ApplabInterfaceMode.DATA === state.interfaceMode,
    warningMsg: state.data.warningMsg,
    warningTitle: state.data.warningTitle || '',
    isWarningDialogOpen: state.data.isWarningDialogOpen,
    view: state.data.view
  }),
  dispatch => ({
    onClearWarning() {
      dispatch(clearWarning());
    }
  })
)(DataWorkspace);
