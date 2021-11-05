/** @file controls below a dialog to delete animations */
import PropTypes from 'prop-types';
import React from 'react';
import Dialog, {Buttons, Cancel, Confirm} from '@cdo/apps/templates/Dialog';
import i18n from '@cdo/locale';

export default class DeleteAnimationDialog extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  render() {
    return (
      <Dialog
        isOpen={this.props.isOpen}
        handleClose={this.props.onCancel}
        title={i18n.deleteAsset({assetType: i18n.animation()})}
        body={i18n.deleteAssetConfirm({assetType: i18n.animation()})}
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
