import React, {useEffect, useState, useRef} from 'react';

import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import {BodyThreeText, StrongText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {ModelDescription} from '../../types';

import styles from './compare-models-dialog.module.scss';

const ModelDescriptionPanel: React.FunctionComponent<{
  onChange: (modelId: string) => void;
  selectedModelId: string;
  availableModels: ModelDescription[];
  dropdownName: string;
}> = ({onChange, selectedModelId, availableModels, dropdownName}) => {
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

  const selectedModel =
    availableModels.find(model => model.id === selectedModelId) ||
    availableModels[0];

  return (
    <div className={styles.modelDescriptionContainer}>
      <SimpleDropdown
        labelText="Choose a model"
        isLabelVisible={false}
        onChange={event => onChange(event.target.value)}
        items={availableModels.map(model => {
          return {value: model.id, text: model.name};
        })}
        selectedValue={selectedModelId}
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
