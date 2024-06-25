import React, {useEffect, useState, useRef} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
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
  const [userWantsScroll, setUserWantsScroll] = useState<boolean>(false);
  const [contentNeedsScroll, setContentNeedsScroll] = useState<boolean>(false);

  const descriptionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      descriptionsContainerRef.current &&
      descriptionsContainerRef.current.scrollHeight >
        descriptionsContainerRef.current.clientHeight
    ) {
      setContentNeedsScroll(true);
    }
  }, [setContentNeedsScroll, descriptionsContainerRef]);

  const showViewMoreButton = !userWantsScroll && contentNeedsScroll;
  const shouldScroll = userWantsScroll && contentNeedsScroll;

  const onDropdownChange = (value: string) => {
    setSelectedModel(getModelFromId(value));
  };

  return (
    <div className={styles.modelDescriptionContainer}>
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
        className={styles.fullWidth}
      />
      <div
        ref={descriptionsContainerRef}
        className={
          shouldScroll ? styles.overflowYScroll : styles.overflowYHidden
        }
      >
        <StrongText>Overview</StrongText>
        <div className={styles.textContainer}>
          <BodyThreeText>{selectedModel.overview}</BodyThreeText>
        </div>
        <br />
        <StrongText>Training Data</StrongText>
        <div className={styles.textContainer}>
          <BodyThreeText>{selectedModel.trainingData}</BodyThreeText>
        </div>
      </div>
      {showViewMoreButton && (
        <div className={styles.rightAlign}>
          <Button
            size="xs"
            type="secondary"
            onClick={() => setUserWantsScroll(true)}
            text="view more"
            iconRight={{iconName: 'chevron-down'}}
            className={styles.viewMoreButton}
          />
        </div>
      )}
    </div>
  );
};

export default ModelDescriptionPanel;
