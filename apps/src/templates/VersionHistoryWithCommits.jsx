import PropTypes from 'prop-types';
import React from 'react';
import {sources as sourcesApi, files as filesApi} from '../clientApi';
import project from '@cdo/apps/code-studio/initApp/project';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import * as utils from '../utils';
import i18n from '@cdo/locale';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
/**
 * A component for viewing project version history.
 */
export default class VersionHistoryWithCommits extends React.Component {
  static propTypes = {
    handleClearPuzzle: PropTypes.func.isRequired,
    isProjectTemplateLevel: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool.isRequired,
    versions: PropTypes.arrayOf(PropTypes.object)
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
    isOpen: true
  };

  componentWillMount() {
    if (this.props.versions) {
      this.setState({versions: this.props.versions, showSpinner: false});
      return;
    }
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
          currentSourceVersionId: project.getCurrentSourceVersionId()
        })
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
    if (this.state.showSpinner) {
      title = i18n.versionHistory_header();
      body = (
        <div style={{margin: '1em 0', textAlign: 'center'}}>
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
        </div>
      );
    } else if (this.state.confirmingClearPuzzle) {
      title = i18n.versionHistory_clearProgress_header();
      body = (
        <div>
          <p>{i18n.versionHistory_clearProgress_prompt()}</p>
          {this.props.isProjectTemplateLevel && (
            <p className="template-level-warning">
              {i18n.versionHistory_clearProgress_templateLevelWarning()}
            </p>
          )}
          <button
            type="button"
            className="btn-danger"
            id="start-over-button"
            style={{marginLeft: 0}}
            onClick={this.onClearPuzzle}
          >
            {i18n.versionHistory_clearProgress_confirm()}
          </button>
          <button
            type="button"
            id="again-button"
            style={{float: 'right'}}
            onClick={this.onCancelClearPuzzle}
          >
            {i18n.versionHistory_clearProgress_cancel()}
          </button>
        </div>
      );
    } else {
      title = i18n.versionHistory_header();

      const rows = this.state.versions.map((version, i) => (
        <VersionWithComment
          key={version.versionId}
          versionId={version.versionId}
          lastModified={new Date(version.lastModified)}
          isLatest={version.isLatest}
          comment={version.comment}
          onChoose={this.onChooseVersion.bind(this, version.versionId)}
          rowColor={i % 2 === 0 ? color.lightest_gray : null}
        />
      ));

      const initialRowColor =
        this.state.versions.length % 2 === 0 ? color.lightest_gray : null;
      console.log(initialRowColor);
      body = (
        <div>
          <div style={{maxHeight: '330px', overflowX: 'auto', margin: '1em 0'}}>
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
        isOpen={this.state.isOpen}
        title={title}
        body={body}
        handleClose={() => this.setState({isOpen: false})}
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

function VersionWithComment(props) {
  let button;
  if (props.isLatest) {
    button = (
      <Button
        style={{cursor: 'default'}}
        color={Button.ButtonColor.gray}
        text={i18n.current()}
        onClick={props.onChoose}
        disabled
      />
    );
  } else {
    button = [
      <a key={0} target="_blank" rel="noopener noreferrer">
        <Button
          icon="eye"
          iconClassName="f-eye"
          href={
            location.origin + location.pathname + '?version=' + props.versionId
          }
          color={Button.ButtonColor.gray}
        />
      </a>,
      <Button
        key={1}
        onClick={props.onChoose}
        text={i18n.restore()}
        color={Button.ButtonColor.blue}
      />
    ];
  }

  console.log(props);
  const label = props.comment
    ? i18n.committedVersionLabel
    : i18n.autosaveVersionLabel;

  return (
    <tr style={{backgroundColor: props.rowColor}}>
      <td>
        <p
          style={
            props.comment
              ? styles.label
              : {...styles.label, color: color.charcoal}
          }
        >
          {label({
            timestamp: getLastModifiedTimestamp(props.lastModified)
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

VersionWithComment.propTypes = {
  versionId: PropTypes.string.isRequired,
  lastModified: PropTypes.instanceOf(Date).isRequired,
  isLatest: PropTypes.bool,
  comment: PropTypes.string,
  onChoose: PropTypes.func,
  rowColor: PropTypes.string
};

const styles = {
  label: {
    margin: '10px 0 10px 10px'
  },
  comment: {
    margin: '0 0 10px 10px',
    fontStyle: 'italic'
  }
};
