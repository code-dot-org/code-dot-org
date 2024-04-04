import React, {useState} from 'react';

import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/componentLibrary/button/Button';

import ModelDescriptionPanel from './ModelDescriptionPanel';
import styles from './compare-models-dialog.module.scss';

const CompareModelsDialog: React.FunctionComponent<{onClose: () => void}> = ({
  onClose,
}) => {
  const [chosenModelLeft, setChosenModelLeft] = useState<string>('llama2');
  const [chosenModelRight, setChosenModelRight] = useState<string>('mistral');

  return (
    <AccessibleDialog
      onClose={onClose}
      className={styles.modelComparisonDialog}
    >
      <div>
        <div className={styles.headerContainer}>
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

export default CompareModelsDialog;
