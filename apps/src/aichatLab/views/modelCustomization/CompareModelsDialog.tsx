import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

import {ModelDescription} from '@cdo/apps/aichat/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import ModelDescriptionPanel from './ModelDescriptionPanel';

import styles from './compare-models-dialog.module.scss';

const CompareModelsDialog: React.FunctionComponent<{
  onClose: () => void;
  availableModels: ModelDescription[];
}> = ({onClose, availableModels}) => {
  const selectedModelId = useAppSelector(
    state =>
      state.aichatLab.currentAiCustomizations.selectedModelId ||
      availableModels[0].id
  );
  const chosenModelLeft = selectedModelId;
  const chosenModelRight =
    availableModels.find(model => model.id !== selectedModelId)?.id ||
    selectedModelId;

  return (
    <Modal
      className={styles.compareModelsModal}
      title="Compare Models"
      onClose={onClose}
      closeLabel={i18n.closeDialog()}
      customContent={
        <div
          id="dsco-dialog-description"
          className={styles.modelComparisonContainer}
        >
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
      }
      primaryButtonProps={{
        children: 'Finish',
        onClick: onClose,
      }}
    />
  );
};

export default CompareModelsDialog;
