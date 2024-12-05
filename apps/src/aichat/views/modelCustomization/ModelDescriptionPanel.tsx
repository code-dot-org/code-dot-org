import React, {useState} from 'react';

import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import {BodyThreeText, StrongText} from '@cdo/apps/componentLibrary/typography';

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
        labelText="Choose a model"
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
        <StrongText>Overview</StrongText>
        <div className={styles.textContainer}>
          <BodyThreeText className={styles.modelText}>
            {selectedModel.overview}
          </BodyThreeText>
        </div>
        <br />
        <StrongText>Training Data</StrongText>
        <div className={styles.textContainer}>
          <BodyThreeText className={styles.modelText}>
            {selectedModel.trainingData}
          </BodyThreeText>
        </div>
      </div>
    </div>
  );
};

export default ModelDescriptionPanel;
