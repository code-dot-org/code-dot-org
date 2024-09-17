import PropTypes from 'prop-types';
import React from 'react';

import project from '@cdo/apps/code-studio/initApp/project';
import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/metrics/firehose';
import StylizedBaseDialog from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {sources as sourcesApi} from '../clientApi';
import * as utils from '../utils';

const DEFAULT_FILE_NAME = 'main.json';

/**
 * A component for viewing project version history.
 */
export default class VersionHistoryWithCommitsDialog extends React.Component {
  static propTypes = {
    handleClearPuzzle: PropTypes.func.isRequired,
    isProjectTemplateLevel: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
  };

  /**
   * state:
   * {
   *   statusMessage: string,
   *   versions: (null|{
   *     lastModified: Date,
   *     isLatest: boolean,
   *     versionId: string,
   *     comment: string
   *   }[]),
   *   showSpinner: boolean,
   *   confirmingClearPuzzle: boolean,
   *   isOpen: boolean
   * }
   */
  constructor(props) {
    super(props);
    this.state = {
      versions: null,
      statusMessage: '',
      showSpinner: true,
      confirmingClearPuzzle: false,
      isOpen: true,
    };

    sourcesApi.ajax(
      'GET',
      `${DEFAULT_FILE_NAME}/versions`,
      this.onVersionListReceived,
      this.onAjaxFailure,
      null,
      ['with_comments=true']
    );
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
    sourcesApi.restorePreviousFileVersion(
      DEFAULT_FILE_NAME,
      versionId,
      this.onRestoreSuccess,
      this.onAjaxFailure
    );

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
    this.setState({showSpinner: true});
    firehoseClient.putRecord(
      {
        study: 'project-data-integrity',
        study_group: 'v4',
        event: 'clear-puzzle',
        project_id: project.getCurrentId(),
        data_json: JSON.stringify({
          isOwner: project.isOwner(),
          currentUrl: window.location.href,
          shareUrl: project.getShareUrl(),
          isProjectTemplateLevel: this.props.isProjectTemplateLevel,
          currentSourceVersionId: project.getCurrentSourceVersionId(),
        }),
      },
      {includeUserId: true}
    );

    this.props
      .handleClearPuzzle()
      .then(() => project.save(true))
      .then(() => utils.reload());
  };

  render() {
    let title;
    let body;
    let footerButtons = [];

    if (this.state.statusMessage) {
      title = i18n.versionHistory_header();
      body = <div style={styles.defaultBody}>{this.state.statusMessage}</div>;
    } else if (this.state.showSpinner) {
      title = i18n.versionHistory_header();
      body = (
        <div
          style={{
            ...{margin: '1em 0', textAlign: 'center'},
            ...styles.defaultBody,
          }}
        >
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
        </div>
      );
    } else if (this.state.confirmingClearPuzzle) {
      title = i18n.versionHistory_clearProgress_header();
      body = (
        <div style={styles.defaultBody}>
          <p>{i18n.versionHistory_clearProgress_prompt()}</p>
          {this.props.isProjectTemplateLevel && (
            <p className="template-level-warning">
              {i18n.versionHistory_clearProgress_templateLevelWarning()}
            </p>
          )}
        </div>
      );
      footerButtons = [
        <Button
          key="confirmClearProgress"
          style={{marginLeft: 0}}
          onClick={this.onClearPuzzle}
          color={Button.ButtonColor.red}
          text={i18n.versionHistory_clearProgress_confirm()}
        />,
        <Button
          key="cancelClearProgress"
          style={{float: 'right'}}
          onClick={this.onCancelClearPuzzle}
          color={Button.ButtonColor.gray}
          text={i18n.versionHistory_clearProgress_cancel()}
        />,
      ];
    } else {
      title = i18n.versionHistory_header();

      const rows = this.state.versions.map((version, i) => (
        <VersionWithCommit
          key={version.versionId}
          versionId={version.versionId}
          lastModified={new Date(version.lastModified)}
          isLatest={version.isLatest}
          comment={version.comment}
          onChoose={() => this.onChooseVersion(version.versionId)}
          rowColor={i % 2 === 0 ? color.background_gray : null}
        />
      ));

      const initialRowColor =
        this.state.versions.length % 2 === 0 ? color.lightest_gray : null;
      body = (
        <div style={{margin: 10}}>
          <div style={styles.versionHistoryBody}>
            <table style={{width: '100%'}}>
              <tbody>
                {rows}
                <tr style={{backgroundColor: initialRowColor}}>
                  <td>
                    <p style={styles.label}>
                      {i18n.versionHistory_initialVersion_label()}
                    </p>
                  </td>
                  <td width="250" style={{textAlign: 'right'}}>
                    <Button
                      onClick={this.onConfirmClearPuzzle}
                      style={{float: 'right'}}
                      text={i18n.versionHistory_clearProgress_confirm()}
                      color={Button.ButtonColor.red}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <StylizedBaseDialog
        isOpen={this.props.isOpen}
        title={title}
        body={body}
        handleClose={this.props.onClose}
        hideFooter={footerButtons.length === 0}
        renderFooter={() => footerButtons}
      />
    );
  }
}

function getLastModifiedTimestamp(timestamp) {
  if (timestamp.toLocaleString) {
    return timestamp.toLocaleString();
  }
  return timestamp.toString();
}

function VersionWithCommit(props) {
  let button;
  if (props.isLatest) {
    button = (
      <Button
        color={Button.ButtonColor.gray}
        text={i18n.current()}
        onClick={props.onChoose}
        disabled
        style={{cursor: 'default'}}
      />
    );
  } else {
    button = [
      <Button
        key="preview"
        icon="eye"
        iconClassName="f-eye"
        href={
          location.origin + location.pathname + '?version=' + props.versionId
        }
        target="_blank"
        color={Button.ButtonColor.gray}
        text={i18n.preview()}
        __useDeprecatedTag
        style={{verticalAlign: 'middle'}}
      />,
      <Button
        key="restore"
        onClick={props.onChoose}
        text={i18n.restore()}
        color={Button.ButtonColor.teal}
      />,
    ];
  }

  const label = props.comment
    ? i18n.committedVersionLabel
    : i18n.autosaveVersionLabel;

  return (
    <tr style={{backgroundColor: props.rowColor}}>
      <td>
        <p
          style={
            props.comment ? {...styles.label, fontWeight: 'bold'} : styles.label
          }
        >
          {label({
            timestamp: getLastModifiedTimestamp(props.lastModified),
          })}
        </p>
        {props.comment && <p style={styles.comment}>{props.comment}</p>}
      </td>
      <td width="275" style={{textAlign: 'right'}}>
        {button}
      </td>
    </tr>
  );
}

VersionWithCommit.propTypes = {
  versionId: PropTypes.string.isRequired,
  lastModified: PropTypes.instanceOf(Date).isRequired,
  isLatest: PropTypes.bool,
  comment: PropTypes.string,
  onChoose: PropTypes.func,
  rowColor: PropTypes.string,
};

const styles = {
  label: {
    margin: '10px 0 10px 10px',
    fontSize: 14,
    color: color.charcoal,
  },
  comment: {
    margin: '0 0 10px 10px',
    fontStyle: 'italic',
    fontSize: 14,
    color: color.charcoal,
  },
  versionHistoryBody: {
    overflowY: 'auto',
    maxHeight: 300,
    margin: '1em 0',
  },
  defaultBody: {color: color.charcoal},
};
