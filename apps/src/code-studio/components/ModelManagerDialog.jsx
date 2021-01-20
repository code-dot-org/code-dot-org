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

  state = {
    models: []
  };

  componentDidUpdate() {
    this.getModelList();
  }

  closeModelManager = () => {
    this.props.onClose();
  };

  getModelList = () => {
    $.ajax({
      url: '/api/v1/ml_models/names',
      method: 'GET'
    }).then(models => {
      this.setState({models});
    });
  };

  importMLModel = () => {
    const modelId = this.root.value;
    Applab.autogenerateML(modelId);
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
          <h2>Machine Learning Models</h2>
          <select name="model" ref={element => (this.root = element)}>
            {this.state.models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <Button
            text={'Import'}
            color={Button.ButtonColor.orange}
            onClick={this.importMLModel}
          />
          <h3>Model card details will go here.</h3>
        </BaseDialog>
      </div>
    );
  }
}
