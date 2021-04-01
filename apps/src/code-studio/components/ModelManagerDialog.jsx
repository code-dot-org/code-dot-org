import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import ModelCard from './ModelCard';
import color from '@cdo/apps/util/color';

const DEFAULT_MARGIN = 7;

const styles = {
  dialog: {
    padding: '0 15px',
    cursor: 'default'
  },
  left: {
    float: 'left',
    width: '40%',
    padding: 20,
    boxSizing: 'border-box'
  },
  right: {
    float: 'left',
    width: '60%',
    padding: 20,
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    marginTop: 20
  },
  message: {
    color: color.dark_charcoal,
    textAlign: 'left',
    margin: DEFAULT_MARGIN,
    overflow: 'hidden',
    lineHeight: '15px',
    whiteSpace: 'pre-wrap'
  }
};

export default class ModelManagerDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    autogenerateML: PropTypes.func,
    // Levelbuilders can pre-populate App Lab levels with a pre-trained model.
    levelbuilderModel: PropTypes.object
  };

  state = {
    selectedModel: undefined,
    models: [],
    isImportPending: false,
    confirmDialogOpen: false
  };

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.setState({selectedModel: undefined, models: []});
      this.getModelList();
    }
  }

  closeModelManager = () => {
    this.props.onClose();
  };

  getModelList = () => {
    $.ajax({
      url: '/api/v1/ml_models/names',
      method: 'GET'
    }).then(models => {
      if (this.props.levelbuilderModel?.id) {
        models.unshift(this.props.levelbuilderModel);
      }
      this.setState({models, selectedModel: models[0]});
    });
  };

  getModelById = id => {
    return this.state.models.find(model => model.id === id);
  };

  importMLModel = async () => {
    this.setState({isImportPending: true});
    const modelId = this.root.value;
    await this.props.autogenerateML(modelId);
    this.setState({isImportPending: false});
    this.closeModelManager();
  };

  handleChange = e => {
    const model = this.getModelById(e.target.value);
    this.setState({selectedModel: model});
  };

  showDeleteConfirmation = () => {
    this.setState({confirmDialogOpen: true});
    this.closeModelManager();
  };

  closeConfirmDialog = () => {
    this.setState({confirmDialogOpen: false});
    this.closeModelManager();
  };

  deleteModel = () => {
    $.ajax({
      url: `/api/v1/ml_models/${this.state.selectedModel.id}`,
      method: 'DELETE'
    }).then(() => {
      this.setState({confirmDialogOpen: false});
    });
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
          style={styles.dialog}
        >
          <h1 style={styles.header}>AI Trained Models</h1>
          <div style={styles.left}>
            <select
              name="model"
              ref={element => (this.root = element)}
              onChange={this.handleChange}
            >
              {this.state.models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            {noModels && <div>You have not trained any A.I. models yet.</div>}
            <br />
            <Button
              text={'Import'}
              color={Button.ButtonColor.orange}
              onClick={this.importMLModel}
              disabled={noModels}
              isPending={this.state.isImportPending}
              pendingText={'Importing...'}
            />
            <Button
              text={'Delete'}
              color={Button.ButtonColor.red}
              onClick={this.showDeleteConfirmation}
              disabled={noModels}
              icon={'trash'}
              iconClassName={'fa-trash'}
            />
          </div>
          <div style={styles.right}>
            <ModelCard model={this.state.selectedModel} />
          </div>
        </BaseDialog>
        <BaseDialog
          isOpen={this.state.confirmDialogOpen}
          handleClose={this.closeConfirmDialog}
          useUpdatedStyles
          style={styles.dialog}
        >
          <h1 style={styles.header}>
            Are you sure you would like to delete this model?
          </h1>
          <div style={styles.left}>
            <p style={styles.message}>
              This model will be permanently deleted, and you will not be able
              to use this model in any App Lab projects.
            </p>
            <div>
              <Button
                text={'No'}
                color={Button.ButtonColor.orange}
                onClick={this.closeConfirmDialog}
              />
              <Button
                text={'Delete'}
                color={Button.ButtonColor.red}
                onClick={this.deleteModel}
                icon={'trash'}
                iconClassName={'fa-trash'}
              />
            </div>
          </div>
          <div style={styles.right}>
            <ModelCard model={this.state.selectedModel} />
          </div>
        </BaseDialog>
      </div>
    );
  }
}
