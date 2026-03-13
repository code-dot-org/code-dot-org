import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import aichatI18n from '../../locale';
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
        <Typography variant="h3" gutterBottom>
          Compare Models
        </Typography>
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
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          onClick={onClose}
          type="button"
        >
          {aichatI18n.modelComparisonCompletionButton()}
        </MuiButton>
      </div>
    </AccessibleDialog>
  );
};

export default CompareModelsDialog;
