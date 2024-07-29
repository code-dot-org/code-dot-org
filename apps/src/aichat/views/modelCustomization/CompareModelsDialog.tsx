import React from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ModelDescription} from '../../types';

import ModelDescriptionPanel from './ModelDescriptionPanel';

import styles from './compare-models-dialog.module.scss';

const CompareModelsDialog: React.FunctionComponent<{
  onClose: () => void;
  availableModels: ModelDescription[];
}> = ({onClose, availableModels}) => {
  const selectedModelId = useAppSelector(
    state =>
      state.aichat.currentAiCustomizations.selectedModelId ||
      availableModels[0].id
  );
  const chosenModelLeft = selectedModelId;
  const chosenModelRight =
    availableModels.find(model => model.id !== selectedModelId)?.id ||
    selectedModelId;

  return (
    <AccessibleDialog
      onClose={onClose}
      className={styles.modelComparisonDialog}
    >
      <div className={styles.headerContainer}>
        <Heading3>Compare Models</Heading3>
      </div>
      <hr />
      <div className={styles.modelComparisonContainer}>
        <ModelDescriptionPanel
          initialSelectedModelId={chosenModelLeft}
          availableModels={availableModels}
          dropdownName="choose-model-1"
        />
        <ModelDescriptionPanel
          initialSelectedModelId={chosenModelRight}
          availableModels={availableModels}
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
