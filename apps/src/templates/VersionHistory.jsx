import Dialog from '@code-dot-org/component-library/dialog';
import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import project from '@cdo/apps/code-studio/initApp/project';
import i18n from '@cdo/locale';

import {sources as sourcesApi, files as filesApi} from '../clientApi';
import * as utils from '../utils';

import VersionRow from './VersionRow';

import styles from './versionHistory.module.scss';

/**
 * A component for viewing project version history.
 */
export default class VersionHistory extends React.Component {
  static propTypes = {
    handleClearPuzzle: PropTypes.func.isRequired,
    isProjectTemplateLevel: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool.isRequired,
    selectedVersion: PropTypes.string,
    isReadOnly: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  /**
   * {
   *   statusMessage: string,
   *   versions: (null|{
   *     lastModified: Date,
   *     isLatest: boolean,
   *     versionId: string
   *   }[]),
   *   showSpinner: boolean,
   *   confirmingClearPuzzle: boolean,
   * }
   */
  state = {
    versions: null,
    statusMessage: '',
    showSpinner: true,
    confirmingClearPuzzle: false,
  };

  UNSAFE_componentWillMount() {
    if (this.props.useFilesApi) {
      filesApi.getVersionHistory(
        this.onVersionListReceived,
        this.onAjaxFailure
      );
    } else {
      // TODO: Use Dave's client api when it's finished.
      sourcesApi.ajax(
        'GET',
        'main.json/versions',
        this.onVersionListReceived,
        this.onAjaxFailure
      );
    }
  }

  /**
   * Called after the component mounts, when the server responds with the
   * current list of versions.
   * @param xhr
   */
  onVersionListReceived = xhr => {
    this.setState({versions: JSON.parse(xhr.responseText), showSpinner: false});
  };

  /**
   * Called if the server responds with an error when loading an API request.
   */
  onAjaxFailure = () => {
    this.setState({statusMessage: i18n.versionHistory_ajaxFailure()});
  };

  /**
   * Called when the server responds to a request to restore a previous version.
   */
  onRestoreSuccess = () => {
    utils.reload();
  };

  /**
   * Called when the user chooses a previous version to restore.
   * @param versionId
   */
  onChooseVersion = versionId => {
    if (this.props.useFilesApi) {
      filesApi.restorePreviousVersion(
        versionId,
        this.onRestoreSuccess,
        this.onAjaxFailure
      );
    } else {
      sourcesApi.restorePreviousFileVersion(
        'main.json',
        versionId,
        this.onRestoreSuccess,
        this.onAjaxFailure
      );
    }

    // Show the spinner.
    this.setState({showSpinner: true});
  };

  onConfirmClearPuzzle = () => {
    this.setState({confirmingClearPuzzle: true});
  };

  onCancelClearPuzzle = () => {
    this.setState({confirmingClearPuzzle: false});
  };

  onClearPuzzle = () => {
    this.setState({confirmingClearPuzzle: false, showSpinner: true});

    this.props
      .handleClearPuzzle()
      .then(() => project.save(true))
      .then(() => utils.reload());
  };

  renderStartOverDialog() {
    return (
      <Dialog
        title={i18n.versionHistory_clearProgress_header()}
        description={i18n.versionHistory_clearProgress_prompt()}
        onClose={this.onCancelClearPuzzle}
        closeLabel={i18n.versionHistory_clearProgress_cancel()}
        customContent={
          this.props.isProjectTemplateLevel && (
            <MuiTypography variant="body1" className="template-level-warning">
              {i18n.versionHistory_clearProgress_templateLevelWarning()}
            </MuiTypography>
          )
        }
        primaryButtonProps={{
          id: 'start-over-button',
          color: 'error',
          children: i18n.versionHistory_clearProgress_confirm(),
          onClick: this.onClearPuzzle,
        }}
        secondaryButtonProps={{
          id: 'again-button',
          className: styles.cancelButton,
          children: i18n.versionHistory_clearProgress_cancel(),
          onClick: this.onCancelClearPuzzle,
        }}
      />
    );
  }

  render() {
    if (this.state.confirmingClearPuzzle) {
      return this.renderStartOverDialog();
    }

    let body;
    if (this.state.showSpinner) {
      body = (
        <div style={{margin: '1em 0', textAlign: 'center'}}>
          <i
            className="fa-solid fa-spinner fa-spin"
            style={{fontSize: '32px'}}
          />
        </div>
      );
    } else {
      const rows = this.state.versions.map(
        function (version, index) {
          return (
            <VersionRow
              key={version.versionId}
              rowIndex={index}
              versionId={version.versionId}
              lastModified={new Date(version.lastModified)}
              isLatest={version.isLatest}
              isSelectedVersion={
                this.props.selectedVersion
                  ? version.versionId === this.props.selectedVersion
                  : version.isLatest
              }
              isReadOnly={this.props.isReadOnly}
              onChoose={this.onChooseVersion.bind(this, version.versionId)}
            />
          );
        }.bind(this)
      );

      body = (
        <div className={styles.versionList}>
          <table style={{width: '100%'}}>
            <tbody>
              {rows}
              {!this.props.isReadOnly && (
                <tr>
                  <td className={styles.labelCell}>
                    <MuiTypography variant="body1">
                      {i18n.versionHistory_initialVersion_label()}
                    </MuiTypography>
                  </td>
                  <td
                    width="275"
                    style={{textAlign: 'right'}}
                    className={styles.actionCell}
                  >
                    <MuiButton
                      type="button"
                      color="error"
                      size="small"
                      variant="contained"
                      onClick={this.onConfirmClearPuzzle}
                    >
                      {i18n.versionHistory_clearProgress_confirm()}
                    </MuiButton>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <Modal
        title={i18n.versionHistory_header()}
        onClose={this.props.onClose}
        closeLabel={i18n.closeDialog()}
        customContent={
          <div className={styles.modalBody}>
            {body}
            <MuiTypography variant="body2" className="caption-text">
              {this.state.statusMessage}
            </MuiTypography>
          </div>
        }
        primaryButtonProps={{
          children: i18n.closeDialog(),
          onClick: this.props.onClose,
        }}
      />
    );
  }
}
