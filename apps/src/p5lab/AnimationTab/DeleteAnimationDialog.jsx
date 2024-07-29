/** @file controls below a dialog to delete animations */
import PropTypes from 'prop-types';
import React from 'react';

import Dialog, {Buttons, Cancel, Confirm} from '@cdo/apps/templates/Dialog';
import i18n from '@cdo/locale';

import {P5LabType} from '../constants';

export default class DeleteAnimationDialog extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    labType: PropTypes.string.isRequired,
  };

  render() {
    let assetType;
    switch (this.props.labType) {
      case P5LabType.GAMELAB:
        assetType = i18n.animation();
        break;
      case P5LabType.SPRITELAB:
      case P5LabType.POETRY:
        assetType = i18n.costume();
        break;
    }
    return (
      <Dialog
        isOpen={this.props.isOpen}
        handleClose={this.props.onCancel}
        title={i18n.deleteAsset({assetType})}
        body={i18n.deleteAssetConfirm({assetType})}
      >
        <Buttons>
          <Cancel onClick={this.props.onCancel}>{i18n.cancel()}</Cancel>
          <Confirm onClick={this.props.onDelete} type="danger">
            {i18n.delete()}
          </Confirm>
        </Buttons>
      </Dialog>
    );
  }
}
