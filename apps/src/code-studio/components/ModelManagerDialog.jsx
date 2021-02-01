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
    models: [],
    isImportPending: false
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

  importMLModel = async () => {
    this.setState({isImportPending: true});
    const modelId = this.root.value;
    await Applab.autogenerateML(modelId);
    this.setState({isImportPending: false});
    this.closeModelManager();
  };

  render() {
    const {isOpen} = this.props;
    const noModels = this.state.models.length === 0;

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
          {noModels && <div>You have not trained any AI models yet.</div>}
          <Button
            text={'Import'}
            color={Button.ButtonColor.orange}
            onClick={this.importMLModel}
            disabled={noModels}
            pending={this.state.isImportPending}
            pendingText={'Importing...'}
          />
          <h3>Model card details will go here.</h3>
        </BaseDialog>
      </div>
    );
  }
}
