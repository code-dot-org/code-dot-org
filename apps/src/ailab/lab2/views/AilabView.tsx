import React, {useContext, useEffect, useMemo, useState} from 'react';

import * as ailab from '@cdo/apps/ailab/engine';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import AccuracyValidator from '../AccuracyValidator';
import {getDefaultInstructions} from '../defaultInstructions';
import {AilabLevelProperties} from '../types';

import styles from './ailab-view.module.scss';

const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const {showDialog} = useDialogControl();
  const progressManager = useContext(ProgressManagerContext);
  const [validator] = useState(() => new AccuracyValidator());
  const [dynamicInstructionsKey, setDynamicInstructionsKey] =
    useState<ailab.InstructionsKey>();
  const mode: ailab.Mode | undefined = useMemo(
    () => (levelProperties.mode ? JSON.parse(levelProperties.mode) : undefined),
    [levelProperties.mode]
  );
  const dynamicInstructionsMap: {[key: string]: string} = useMemo(
    () => JSON.parse(levelProperties.dynamicInstructions || '{}'),
    [levelProperties.dynamicInstructions]
  );

  useEffect(() => {
    progressManager?.setValidator(validator);
  }, [progressManager, validator]);

  const onContinue = () => {
    dispatch(continueOrFinishLesson());
  };

  const setInstructionsKey: ailab.AilabEngineProps['setInstructionsKey'] = (
    key,
    options
  ) => {
    setDynamicInstructionsKey(key);
    // Overlay is not shown in Lab2 AI Lab; dismiss immediately.
    if (options?.showOverlay) {
      ailab.instructionsDismissed();
    }
  };

  const saveTrainedModel: ailab.AilabEngineProps['saveTrainedModel'] = async (
    dataToSave,
    callback
  ) => {
    try {
      const response = await HttpClient.post(
        '/api/v1/ml_models/save',
        JSON.stringify(dataToSave),
        true,
        {'Content-Type': 'application/json'}
      );
      const saveResponse = (await response.json()) as ailab.SaveResponse;
      callback(saveResponse);
    } catch (error) {
      callback({status: 'error'});
    }
  };

  const logMetric = (eventName: string, details: object) => {
    analyticsReporter.sendEvent(eventName, {details});
  };

  const onStartOver = () => {
    showDialog({type: DialogType.StartOver, handleConfirm: ailab.startOver});
  };

  const onTrained = (accuracy: number) => {
    validator.latestAccuracy = accuracy;
    progressManager?.resetValidation();
    progressManager?.updateProgress();
  };

  const dynamicInstructionsContent = useMemo(() => {
    if (!dynamicInstructionsKey) {
      return undefined;
    }
    const instructions =
      dynamicInstructionsMap[dynamicInstructionsKey] ||
      getDefaultInstructions(dynamicInstructionsKey);
    if (!instructions) {
      console.warn(
        `No dynamic instructions available for key ${dynamicInstructionsKey}`
      );
    }
    return instructions;
  }, [dynamicInstructionsKey, dynamicInstructionsMap]);

  return (
    <div id="ailab-lab2" className={styles.ailab} data-notranslate>
      <ResourcePanel
        className={styles.resourcePanel}
        levelProperties={levelProperties}
        isRunning={false}
        hasRun={false}
        hasEdited={false}
        validationTooltip={
          mode?.requireAccuracy
            ? `Train a model with at least ${mode.requireAccuracy}% accuracy`
            : undefined
        }
        dynamicInstructions={dynamicInstructionsContent}
      />
      <div className={styles.divider} />
      <div className={styles.workspace}>
        <div className={styles.root}>
          <ailab.AilabEngine
            assetPath="/blockly/media/skins/ailab/"
            mode={mode}
            levelId={levelProperties.id}
            onContinue={onContinue}
            setInstructionsKey={setInstructionsKey}
            onTrained={onTrained}
            i18n={{}} // TODO: Pass through localization map if necessary
            saveTrainedModel={saveTrainedModel}
            logMetric={logMetric}
            onStartOver={onStartOver}
          />
        </div>
      </div>
    </div>
  );
};

export default AilabView;
