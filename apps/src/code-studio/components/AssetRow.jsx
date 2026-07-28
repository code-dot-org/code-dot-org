import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import AssetThumbnail from './AssetThumbnail';

import rowStyles from './AssetRow.module.scss';

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
    elementId: PropTypes.string,
  };

  state = {
    action: 'normal',
    actionText: '',
    attemptedUsedDelete: false,
  };

  /**
   * Confirm the user actually wants to delete this asset.
   */
  confirmDelete = () => {
    this.setState({action: 'confirming delete', actionText: ''});
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
        actionText: i18n.errorDeleting(),
      });
    });
  };

  chooseAsset = () => {
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
        <MuiButton
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={this.chooseAsset}
          type="button"
        >
          {i18n.choose()}
        </MuiButton>
      );
    } else {
      const size = (this.props.size / 1000).toFixed(2);
      flex = (
        <MuiTypography variant="body2" component="span">
          {size} kb
        </MuiTypography>
      );
    }

    let usage = $('#visualization').find(
      `[src*="${encodeURIComponent(this.props.name)}"]`
    ).length;

    switch (this.state.action) {
      case 'normal':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            <span style={styles.actionGroup}>
              {flex}
              {!this.props.hideDelete && (
                <MuiIconButton
                  variant="text"
                  color={usage > 0 ? 'secondary' : 'error'}
                  size="medium"
                  aria-label="Delete file"
                  onClick={
                    usage > 0 ? this.attemptBadDelete : this.confirmDelete
                  }
                  sx={{marginRight: 1}}
                >
                  <FontAwesomeV6Icon iconName="trash-can" iconStyle="regular" />
                </MuiIconButton>
              )}
            </span>

            {this.state.attemptedUsedDelete && (
              <div style={styles.confirmDeleteWarning}>
                {i18n.cannotDeleteUsedImage()}
              </div>
            )}
          </td>
        );
        break;
      case 'confirming delete':
        actions = (
          <td
            width="250"
            style={{
              textAlign: 'right',
              paddingRight: 16,
              paddingTop: 16,
              paddingBottom: 16,
            }}
          >
            <span style={styles.actionGroup}>
              <MuiButton
                variant="contained"
                color="error"
                size="small"
                onClick={this.handleDelete}
                type="button"
              >
                Delete File
              </MuiButton>
              <MuiButton
                variant="outlined"
                color="secondary"
                size="small"
                onClick={this.cancelDelete}
                type="button"
              >
                Cancel
              </MuiButton>
            </span>
            <div style={styles.confirmDeleteWarning}>
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
              className="fa-solid fa-spinner fa-spin"
              style={{
                fontSize: '32px',
                marginRight: '15px',
              }}
            />
          </td>
        );
        break;
    }

    return (
      <tr
        className={classNames('assetRow', rowStyles.row)}
        onDoubleClick={this.props.onChoose}
      >
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
        <td>
          <MuiTypography variant="body2" component="span">
            {this.props.name}
          </MuiTypography>
        </td>
        {actions}
      </tr>
    );
  }
}

const styles = {
  actionGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  confirmDeleteWarning: {
    marginTop: 8,
    textAlign: 'right',
    color: color.red,
  },
};
