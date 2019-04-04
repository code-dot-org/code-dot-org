import PropTypes from 'prop-types';
import React from 'react';
import {assets as assetsApi, files as filesApi} from '@cdo/apps/clientApi';
import AssetThumbnail from './AssetThumbnail';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import color from '@cdo/apps/util/color';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import Button from '../../templates/Button';
import DialogFooter from '../../templates/teacherDashboard/DialogFooter';

const styles = {
  deleteWarning: {
    paddingLeft: '34px',
    textAlign: 'left',
    color: color.red
  },
  leftAlign: {
    textAlign: 'left'
  }
};

class ConfirmImageDeleteDialog extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    usage: PropTypes.number,
    onCancel: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    // For logging purposes
    studyGroup: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    elementId: PropTypes.string
  };

  onConfirmDelete = () => {
    firehoseClient.putRecord({
      study: 'delete-asset',
      study_group: this.props.studyGroup,
      event: 'confirm-referenced',
      project_id: this.props.projectId,
      data_json: JSON.stringify({
        assetName: this.props.name,
        elementId: this.props.elementId,
        usage: this.props.usage
      })
    });
    this.props.handleDelete();
  };

  render() {
    return (
      <Dialog
        title={i18n.warning()}
        isOpen
        handleClose={this.props.onCancel}
        style={styles.leftAlign}
      >
        <Body>
          <p>
            {i18n.deleteUsedImage({
              name: this.props.name,
              value: this.props.usage
            })}
          </p>
          <DialogFooter>
            <Button
              onClick={this.props.onCancel}
              text={i18n.no()}
              color={Button.ButtonColor.gray}
            />
            <Button
              onClick={this.onConfirmDelete}
              text={i18n.yesSure()}
              color={Button.ButtonColor.orange}
            />
          </DialogFooter>
        </Body>
      </Dialog>
    );
  }
}

/**
 * A single row in the AssetManager, describing one asset.
 */
export default class AssetRow extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
    type: PropTypes.oneOf(['image', 'audio', 'video', 'pdf', 'doc']).isRequired,
    size: PropTypes.number,
    useFilesApi: PropTypes.bool.isRequired,
    onChoose: PropTypes.func,
    onDelete: PropTypes.func.isRequired,
    soundPlayer: PropTypes.object,
    projectId: PropTypes.string,

    // For logging purposes
    imagePicker: PropTypes.bool, // identifies if displayed by 'Manage Assets' flow
    elementId: PropTypes.string
  };

  state = {
    action: 'normal',
    actionText: '',
    usage: 0
  };

  /**
   * Confirm the user actually wants to delete this asset.
   */
  confirmDelete = () => {
    let places = $('#designModeViz').find(`[src$=\'${this.props.name}']`);
    this.setState({action: 'confirming delete', actionText: ''});
    if (places.length > 0) {
      this.setState({usage: places.length});
    }
    firehoseClient.putRecord({
      study: 'delete-asset',
      study_group:
        this.props.onChoose && typeof this.props.onChoose === 'function'
          ? 'choose-assets'
          : 'manage-assets',
      event: 'initiate',
      project_id: this.props.projectId,
      data_json: JSON.stringify({
        assetName: this.props.name,
        elementId: this.props.elementId,
        usage: places.length
      })
    });
  };

  /**
   * This user didn't want to delete this asset.
   */
  cancelDelete = () => {
    this.setState({action: 'normal', actionText: ''});
  };

  /**
   * Delete this asset and notify the parent to remove this row. If the delete
   * fails, flip back to 'confirming delete' and display a message.
   */
  handleDelete = () => {
    this.setState({action: 'deleting', actionText: ''});

    let api = this.props.useFilesApi ? filesApi : assetsApi;
    api.deleteFile(this.props.name, this.props.onDelete, () => {
      this.setState({
        action: 'confirming delete',
        actionText: i18n.errorDeleting()
      });
    });
  };

  chooseAsset = () => {
    if (!this.props.imagePicker) {
      firehoseClient.putRecord(
        {
          study: 'sound-dialog-2',
          study_group: 'library-tab',
          event: 'choose-uploaded-sound',
          data_json: this.props.name
        },
        {includeUserId: true}
      );
    }
    this.props.onChoose();
  };

  render() {
    let actions, flex;
    // `flex` is the "Choose" button in file-choose mode, or the filesize.
    if (this.props.onChoose) {
      flex = <button onClick={this.chooseAsset}>{i18n.choose()}</button>;
    } else {
      const size = (this.props.size / 1000).toFixed(2);
      flex = size + ' kb';
    }

    switch (this.state.action) {
      case 'normal':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            {flex}
            <button className="btn-danger" onClick={this.confirmDelete}>
              <i className="fa fa-trash-o" />
            </button>
          </td>
        );
        break;
      case 'confirming delete':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            {this.state.usage > 0 && (
              <ConfirmImageDeleteDialog
                name={this.props.name}
                usage={this.state.usage}
                onCancel={this.cancelDelete}
                handleDelete={this.handleDelete}
                elementId={this.props.elementId}
                projectId={this.props.projectId}
                studyGroup={
                  this.props.onChoose &&
                  typeof this.props.onChoose === 'function'
                    ? 'choose-assets'
                    : 'manage-assets'
                }
              />
            )}
            <button className="btn-danger" onClick={this.handleDelete}>
              Delete File
            </button>
            <button onClick={this.cancelDelete}>Cancel</button>
            <div style={styles.deleteWarning}>
              {i18n.confirmDeleteExplanation()}
            </div>
            {this.state.actionText}
          </td>
        );
        break;
      case 'deleting':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            <i
              className="fa fa-spinner fa-spin"
              style={{
                fontSize: '32px',
                marginRight: '15px'
              }}
            />
          </td>
        );
        break;
    }

    return (
      <tr className="assetRow" onDoubleClick={this.props.onChoose}>
        <td width="80">
          <AssetThumbnail
            type={this.props.type}
            name={this.props.name}
            timestamp={this.props.timestamp}
            useFilesApi={this.props.useFilesApi}
            soundPlayer={this.props.soundPlayer}
          />
        </td>
        <td>{this.props.name}</td>
        {actions}
      </tr>
    );
  }
}
