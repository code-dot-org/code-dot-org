import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import ModelCard from './ModelCard';

const DEFAULT_MARGIN = 7;

export default class ModelManagerDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    autogenerateML: PropTypes.func,
    // Levelbuilders can pre-populate App Lab levels with a pre-trained model.
    levelbuilderModel: PropTypes.object,
  };

  state = {
    selectedModel: undefined,
    models: [],
    isModelListPending: true,
    isImportPending: false,
    isDeletePending: false,
    confirmDialogOpen: false,
    deletionStatus: undefined,
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
    this.setState({isModelListPending: true});
    $.ajax({
      url: '/api/v1/ml_models/names',
      method: 'GET',
    }).then(models => {
      if (this.props.levelbuilderModel?.id) {
        $.ajax({
          url: `/api/v1/ml_models/${this.props.levelbuilderModel.id}`,
          method: 'GET',
        }).then(metadata => {
          this.props.levelbuilderModel.metadata = metadata;
          models.unshift(this.props.levelbuilderModel);
          this.setState({
            isModelListPending: false,
            models,
            selectedModel: models[0],
          });
        });
      } else {
        this.setState({
          isModelListPending: false,
          models,
          selectedModel: models[0],
        });
      }
    });
  };

  getModelById = id => {
    return this.state.models.find(model => model.id === id);
  };

  logImport = modelId => {
    firehoseClient.putRecord(
      {
        study: 'ai-ml',
        study_group: 'trained-models',
        event: 'import-to-applab',
        data_json: JSON.stringify({modelId: modelId}),
      },
      {includeUserId: true}
    );
  };

  importMLModel = async () => {
    this.setState({isImportPending: true});
    const modelId = this.root.value;
    this.logImport(modelId);
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
  };

  closeConfirmDialog = () => {
    this.setState({confirmDialogOpen: false, deletionStatus: undefined});
  };

  deleteModel = () => {
    this.setState({isDeletePending: true});
    $.ajax({
      url: `/api/v1/ml_models/${this.state.selectedModel.id}`,
      method: 'DELETE',
    }).then(response => {
      if (response.status === 'failure') {
        this.setState({
          deletionStatus: i18n.aiTrainedModelsDeleteModelFailed({
            id: response.id,
          }),
          isDeletePending: false,
        });
      } else {
        this.setState({confirmDialogOpen: false, isDeletePending: false});
        this.getModelList();
      }
    });
  };

  render() {
    const {isOpen} = this.props;
    const noModels =
      !this.state.isModelListPending && this.state.models.length === 0;
    const showDeleteButton =
      this.state.selectedModel?.id !== this.props.levelbuilderModel?.id;

    return (
      <div className="ml-modal">
        <BaseDialog
          isOpen={isOpen}
          handleClose={this.closeModelManager}
          useUpdatedStyles
          style={styles.dialog}
        >
          <h1 style={styles.header}>{i18n.aiTrainedModels()}</h1>
          {this.state.isModelListPending && (
            <div style={styles.spinner}>
              <Spinner />
            </div>
          )}
          {!this.state.isModelListPending && (
            <div>
              <div style={styles.left}>
                <select
                  name="model"
                  ref={element => (this.root = element)}
                  onChange={this.handleChange}
                  style={{marginBottom: 0}}
                >
                  {this.state.models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                {noModels && (
                  <div style={styles.message}>
                    {i18n.aiTrainedModelsNoModels()}
                  </div>
                )}
                <br />
                <Button
                  text={i18n.import()}
                  color={Button.ButtonColor.brandSecondaryDefault}
                  onClick={this.importMLModel}
                  disabled={noModels}
                  isPending={this.state.isImportPending}
                  pendingText={i18n.importingWithEllipsis()}
                />
                {showDeleteButton && (
                  <Button
                    text={i18n.delete()}
                    color={Button.ButtonColor.red}
                    onClick={this.showDeleteConfirmation}
                    disabled={noModels}
                    icon={'trash'}
                    iconClassName={'fa-trash'}
                  />
                )}
              </div>
              <div style={styles.right}>
                <ModelCard model={this.state.selectedModel} />
              </div>
            </div>
          )}
        </BaseDialog>
        <BaseDialog
          isOpen={this.state.confirmDialogOpen}
          handleClose={this.closeConfirmDialog}
          useUpdatedStyles
          style={styles.dialog}
        >
          <h1 style={styles.header}>
            {i18n.aiTrainedModelsDeleteModelConfirm()}
          </h1>
          <div style={styles.left}>
            <p style={styles.message}>
              {i18n.aiTrainedModelsDeleteModelMessage()}
            </p>
            <div>
              <Button
                text={i18n.no()}
                color={Button.ButtonColor.brandSecondaryDefault}
                onClick={this.closeConfirmDialog}
              />
              <Button
                text={i18n.delete()}
                color={Button.ButtonColor.red}
                onClick={this.deleteModel}
                icon={'trash'}
                iconClassName={'fa-trash'}
                pendingText={i18n.deletingWithEllipsis()}
                isPending={this.state.isDeletePending}
              />
            </div>
            <p style={styles.message}>{this.state.deletionStatus}</p>
          </div>
          <div style={styles.right}>
            <ModelCard model={this.state.selectedModel} />
          </div>
        </BaseDialog>
      </div>
    );
  }
}

const styles = {
  dialog: {
    padding: '0 15px',
    cursor: 'default',
  },
  left: {
    float: 'left',
    width: '40%',
    padding: 20,
    boxSizing: 'border-box',
  },
  right: {
    float: 'left',
    width: '60%',
    padding: 20,
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    marginTop: 20,
  },
  message: {
    color: color.dark_charcoal,
    textAlign: 'left',
    margin: DEFAULT_MARGIN,
    overflow: 'hidden',
    lineHeight: '15px',
    whiteSpace: 'pre-wrap',
  },
  spinner: {
    height: 'calc(80vh - 140px)',
    color: color.dark_charcoal,
  },
};
