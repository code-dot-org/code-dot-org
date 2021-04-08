import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import ModelCard from './ModelCard';

const styles = {
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
    selectedModelId: undefined,
    models: [],
    isImportPending: false
  };

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.setState({selectedModelId: undefined, models: []});
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
      this.setState({models});
    });
  };

  importMLModel = async () => {
    this.setState({isImportPending: true});
    const modelId = this.root.value;
    await this.props.autogenerateML(modelId);
    this.setState({isImportPending: false});
    this.closeModelManager();
  };

  handleChange = e => {
    this.setState({selectedModelId: e.target.value});
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
          <h2>AI Trained Models</h2>
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
          </div>
          <div style={styles.right}>
            <ModelCard modelId={this.state.selectedModelId} />
          </div>
        </BaseDialog>
      </div>
    );
  }
}
