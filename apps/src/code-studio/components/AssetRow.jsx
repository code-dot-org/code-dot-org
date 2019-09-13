import PropTypes from 'prop-types';
import React from 'react';
import AssetThumbnail from './AssetThumbnail';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import color from '@cdo/apps/util/color';
import $ from 'jquery';

const styles = {
  deleteWarning: {
    paddingLeft: '34px',
    textAlign: 'left',
    color: color.red
  }
};

/**
 * A single row in the AssetManager, describing one asset.
 */
export default class AssetRow extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
    type: PropTypes.oneOf(['image', 'audio', 'video', 'pdf', 'doc']).isRequired,
    size: PropTypes.number,
    api: PropTypes.object.isRequired,
    onChoose: PropTypes.func,
    onDelete: PropTypes.func.isRequired,
    soundPlayer: PropTypes.object,
    projectId: PropTypes.string,
    levelName: PropTypes.string,
    hideDelete: PropTypes.bool,

    // For logging purposes
    imagePicker: PropTypes.bool, // identifies if displayed by 'Manage Assets' flow
    elementId: PropTypes.string
  };

  state = {
    action: 'normal',
    actionText: '',
    attemptedUsedDelete: false
  };

  /**
   * Confirm the user actually wants to delete this asset.
   */
  confirmDelete = () => {
    this.setState({action: 'confirming delete', actionText: ''});
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
        elementId: this.props.elementId
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

    this.props.api.deleteFile(this.props.name, this.props.onDelete, () => {
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

  attemptBadDelete = () => {
    this.setState({attemptedUsedDelete: true});
  };

  render() {
    let actions, flex;
    // `flex` is the "Choose" button in file-choose mode, or the filesize.
    if (this.props.onChoose) {
      flex = (
        <button type="button" onClick={this.chooseAsset}>
          {i18n.choose()}
        </button>
      );
    } else {
      const size = (this.props.size / 1000).toFixed(2);
      flex = size + ' kb';
    }

    let usage = $('#visualization').find(
      `[src*=\'${encodeURIComponent(this.props.name).replace("'", "\\'")}']`
    ).length;

    switch (this.state.action) {
      case 'normal':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            {flex}
            {!this.props.hideDelete && (
              <button
                type="button"
                className={usage > 0 ? '' : 'btn-danger'}
                onClick={usage > 0 ? this.attemptBadDelete : this.confirmDelete}
              >
                <i className="fa fa-trash-o" />
              </button>
            )}

            {this.state.attemptedUsedDelete && (
              <div style={styles.deleteWarning}>
                {i18n.cannotDeleteUsedImage()}
              </div>
            )}
          </td>
        );
        break;
      case 'confirming delete':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            <button
              type="button"
              className="btn-danger"
              onClick={this.handleDelete}
            >
              Delete File
            </button>
            <button type="button" onClick={this.cancelDelete}>
              Cancel
            </button>
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
            api={this.props.api}
            soundPlayer={this.props.soundPlayer}
            levelName={this.props.levelName}
          />
        </td>
        <td>{this.props.name}</td>
        {actions}
      </tr>
    );
  }
}
