import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
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
        <StrongText>{aichatI18n.technicalInfoHeader_overview()}</StrongText>
        <div className={styles.textContainer}>
          <BodyThreeText className={styles.modelText}>
            {selectedModel.overview}
          </BodyThreeText>
        </div>
        <br />
        <StrongText>{aichatI18n.technicalInfoHeader_trainingData()}</StrongText>
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
