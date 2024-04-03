import React, {useState, useRef, useEffect} from 'react';

import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
import {
  StrongText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from './compare-models-dialog.module.scss';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import Button from '@cdo/apps/componentLibrary/button/Button';

type ModelDescription = {
  id: string;
  name: string;
  overview: string;
  trainingData: string;
};

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const models: ModelDescription[] = [
  {
    id: 'llama2',
    name: 'LLama 2',
    overview: `llama2 + ${loremIpsum}`,
    trainingData: `llama2 + ${loremIpsum}`,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    overview: `mistral + ${loremIpsum}`,
    trainingData: `mistral + ${loremIpsum}`,
  },
];

const CompareModelsDialog: React.FunctionComponent<{onClose: () => void}> = ({
  onClose,
}) => {
  const [chosenModelLeft, setChosenModelLeft] = useState<string>('llama2');
  const [chosenModelRight, setChosenModelRight] = useState<string>('mistral');

  return (
    <AccessibleDialog onClose={onClose} modalId={styles.modelComparisonDialog}>
      <div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Heading3>Compare Models</Heading3>
        </div>
        <button type="button" onClick={onClose} className={styles.xCloseButton}>
          <i id="x-close" className="fa-solid fa-xmark" />
        </button>
      </div>
      <hr />
      <div className={styles.modelComparisonContainer}>
        <ModelDescriptionPanel
          onChange={setChosenModelLeft}
          selectedModelName={chosenModelLeft}
          dropdownName="choose-model-1"
        />
        <ModelDescriptionPanel
          onChange={setChosenModelRight}
          selectedModelName={chosenModelRight}
          dropdownName="choose-model-2"
        />
      </div>
      <hr />
      <div className={styles.rightAlign}>
        <Button onClick={onClose} text="Finish" />
      </div>
    </AccessibleDialog>
  );
};

const ModelDescriptionPanel: React.FunctionComponent<{
  onChange: (modelId: string) => void;
  selectedModelName: string;
  dropdownName: string;
}> = ({onChange, selectedModelName, dropdownName}) => {
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
    models.find(model => model.id === selectedModelName) || models[0];

  return (
    <div className={styles.modelDescriptionContainer}>
      <SimpleDropdown
        labelText="Choose a model"
        isLabelVisible={false}
        onChange={event => onChange(event.target.value)}
        items={models.map(model => {
          return {value: model.id, text: model.name};
        })}
        selectedValue={selectedModelName}
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

export default CompareModelsDialog;
