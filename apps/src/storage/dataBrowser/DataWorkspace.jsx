import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import msg from '@cdo/locale';

import {ApplabInterfaceMode} from '../../applab/constants';
import Dialog from '../../legacySharedComponents/Dialog';
import PaneHeader, {PaneSection, PaneButton} from '../../templates/PaneHeader';
import {DataView} from '../constants';
import {clearWarning} from '../redux/data';

import DataOverview from './DataOverview';
import DataTableView from './DataTableView';

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
    onClearWarning: PropTypes.func.isRequired,
  };

  render() {
    const style = {
      display: this.props.isVisible ? 'block' : 'none',
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
              <MuiTypography
                variant="body4"
                id="library-header-span"
                sx={{
                  color: 'var(--text-neutral-white-fixed)',
                }}
              >
                {msg.dataLibraryHeader()}
              </MuiTypography>
            </PaneSection>
          )}
          <span
            id="dataModeHeaders"
            style={{
              flex: '1 1 0',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <PaneSection
              id="workspace-header"
              style={{
                flex: '1 1 0',
              }}
            >
              <MuiTypography
                variant="body4"
                id="workspace-header-span"
                sx={{
                  color: 'var(--text-neutral-white-fixed)',
                }}
              >
                {msg.dataWorkspaceHeader()}
              </MuiTypography>
            </PaneSection>
            <PaneButton
              id="data-mode-versions-header"
              iconProps={{iconName: 'clock', iconStyle: 'regular'}}
              label={msg.showVersionsHeader()}
              headerHasFocus={!this.props.isRunning}
              isRtl={this.props.isRtl}
              onClick={this.props.handleVersionHistory}
            />
          </span>
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
    backgroundColor: 'var(--background-neutral-primary)',
    boxSizing: 'border-box',
    borderLeft: '1px solid var(--borders-neutral-strong)',
    borderRight: '1px solid var(--borders-neutral-strong)',
    borderBottom: '1px solid var(--borders-neutral-strong)',
    overflowY: 'auto',
  },
  libraryHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    width: 271,
    height: 30,
    borderRight: '1px solid var(--borders-neutral-strong)',
    float: 'left',
  },
};

export default connect(
  state => ({
    isRtl: state.isRtl,
    isRunning: !!state.runState.isRunning,
    isVisible: ApplabInterfaceMode.DATA === state.interfaceMode,
    warningMsg: state.data.warningMsg,
    warningTitle: state.data.warningTitle || '',
    isWarningDialogOpen: state.data.isWarningDialogOpen,
    view: state.data.view,
  }),
  dispatch => ({
    onClearWarning() {
      dispatch(clearWarning());
    },
  })
)(DataWorkspace);
