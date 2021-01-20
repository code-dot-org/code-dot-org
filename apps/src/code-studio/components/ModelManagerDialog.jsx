import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import Applab from '@cdo/apps/applab/applab';

export default class ModelManagerDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  };

  closeModelManager = () => {
    this.props.onClose();
  };

  importMLModel = () => {
    Applab.autogenerateML();
  };

  render() {
    const {isOpen} = this.props;

    return (
      <div>
        <BaseDialog
          isOpen={isOpen}
          handleClose={this.closeModelManager}
          useUpdatedStyles
        >
          <h1>Machine Learning Models</h1>
          <Button
            text={'Import'}
            color={Button.ButtonColor.orange}
            onClick={this.importMLModel}
          />
        </BaseDialog>
      </div>
    );
  }
}
