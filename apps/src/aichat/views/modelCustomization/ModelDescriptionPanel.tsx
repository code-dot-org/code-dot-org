import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import aichatI18n from '../../locale';
import {ModelDescription} from '../../types';

import styles from './compare-models-dialog.module.scss';

const ModelDescriptionPanel: React.FunctionComponent<{
  initialSelectedModelId: string;
  availableModels: ModelDescription[];
  dropdownName: string;
}> = ({initialSelectedModelId, availableModels, dropdownName}) => {
  const getModelFromId = (modelId: string): ModelDescription => {
    return (
      availableModels.find(model => model.id === modelId) || availableModels[0]
    );
  };

  const [selectedModel, setSelectedModel] = useState<ModelDescription>(
    getModelFromId(initialSelectedModelId)
  );

  const onDropdownChange = (value: string) => {
    setSelectedModel(getModelFromId(value));
  };

  return (
    <div className={styles.modelDescriptionPanelContainer}>
      <SimpleDropdown
        labelText={aichatI18n.modelDescriptionPanel()}
        isLabelVisible={false}
        onChange={event => onDropdownChange(event.target.value)}
        items={availableModels.map(model => {
          return {value: model.id, text: model.name};
        })}
        selectedValue={selectedModel.id}
        name={dropdownName}
        size="s"
        className={styles.compareModelsDropdown}
      />
      <br />
      <div className={styles.modelDescriptionContainer}>
        <Typography variant="strong">
          {aichatI18n.technicalInfoHeader_overview()}
        </Typography>
        <div className={styles.textContainer}>
          <Typography className={styles.modelText} variant="body3" gutterBottom>
            {selectedModel.overview}
          </Typography>
        </div>
        <br />
        <Typography variant="strong">
          {aichatI18n.technicalInfoHeader_trainingData()}
        </Typography>
        <div className={styles.textContainer}>
          <Typography className={styles.modelText} variant="body3" gutterBottom>
            {selectedModel.trainingData}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default ModelDescriptionPanel;
