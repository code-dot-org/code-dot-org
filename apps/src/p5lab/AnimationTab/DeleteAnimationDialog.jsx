/** @file controls below a dialog to delete animations */
import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React from 'react';

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
    if (!this.props.isOpen) {
      return null;
    }
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
        title={i18n.deleteAsset({assetType})}
        description={i18n.deleteAssetConfirm({assetType})}
        onClose={this.props.onCancel}
        closeLabel={i18n.cancel()}
        primaryButtonProps={{
          children: i18n.delete(),
          onClick: this.props.onDelete,
          color: 'error',
        }}
        secondaryButtonProps={{
          children: i18n.cancel(),
          onClick: this.props.onCancel,
        }}
      />
    );
  }
}
