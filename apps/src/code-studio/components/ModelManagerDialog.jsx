import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Modal from '@code-dot-org/component-library/modal';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import i18n from '@cdo/locale';

import ModelCard from './ModelCard';

import moduleStyles from './ModelManagerDialog.module.scss';

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

  importMLModel = async () => {
    this.setState({isImportPending: true});
    await this.props.autogenerateML(this.state.selectedModel?.id);
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
    if (!this.props.isOpen) {
      return null;
    }
    const noModels =
      !this.state.isModelListPending && this.state.models.length === 0;
    const showDeleteButton =
      this.state.selectedModel?.id !== this.props.levelbuilderModel?.id;

    return (
      <>
        <Modal
          className={moduleStyles.mlModal}
          title={i18n.aiTrainedModels()}
          onClose={this.closeModelManager}
          customContent={
            <div>
              {this.state.isModelListPending && (
                <div style={styles.spinner}>
                  <Spinner />
                </div>
              )}
              {!this.state.isModelListPending && (
                <div className={moduleStyles.mlModalContent}>
                  <SimpleDropdown
                    name="model"
                    labelText={i18n.aiTrainedModels()}
                    isLabelVisible={false}
                    items={this.state.models.map(model => ({
                      value: model.id,
                      text: model.name,
                    }))}
                    selectedValue={this.state.selectedModel?.id}
                    onChange={this.handleChange}
                  />
                  {noModels && (
                    <div style={styles.message}>
                      {i18n.aiTrainedModelsNoModels()}
                    </div>
                  )}
                  <div className={moduleStyles.modelCardScroll}>
                    <ModelCard model={this.state.selectedModel} />
                  </div>
                </div>
              )}
            </div>
          }
          primaryButtonProps={{
            children: this.state.isImportPending
              ? i18n.importingWithEllipsis()
              : i18n.import(),
            onClick: this.importMLModel,
            disabled: noModels || this.state.isImportPending,
          }}
          secondaryButtonProps={
            showDeleteButton
              ? {
                  children: i18n.delete(),
                  onClick: this.showDeleteConfirmation,
                  color: 'error',
                  disabled: noModels,
                }
              : undefined
          }
        />
        {this.state.confirmDialogOpen && (
          <Modal
            className={moduleStyles.mlModal}
            title={i18n.aiTrainedModelsDeleteModelConfirm()}
            description={i18n.aiTrainedModelsDeleteModelMessage()}
            onClose={this.closeConfirmDialog}
            customContent={
              <div className={moduleStyles.mlModalContent}>
                <div className={moduleStyles.modelCardScroll}>
                  <ModelCard model={this.state.selectedModel} />
                </div>
                {this.state.deletionStatus && (
                  <p style={styles.message}>{this.state.deletionStatus}</p>
                )}
              </div>
            }
            primaryButtonProps={{
              children: this.state.isDeletePending
                ? i18n.deletingWithEllipsis()
                : i18n.delete(),
              onClick: this.deleteModel,
              color: 'error',
              disabled: this.state.isDeletePending,
            }}
            secondaryButtonProps={{
              children: i18n.no(),
              onClick: this.closeConfirmDialog,
            }}
          />
        )}
      </>
    );
  }
}

const styles = {
  message: {
    color: 'var(--text-neutral-secondary)',
    textAlign: 'left',
    margin: DEFAULT_MARGIN,
    overflow: 'hidden',
    lineHeight: '15px',
    whiteSpace: 'pre-wrap',
  },
  spinner: {
    height: 'calc(80vh - 140px)',
    color: 'var(--text-neutral-secondary)',
  },
};
