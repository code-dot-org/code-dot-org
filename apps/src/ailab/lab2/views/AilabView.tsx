import ailab, {
  type InitAllOptions,
  type Mode,
  type SaveResponse,
  type InstructionsKey,
} from '@code-dot-org/ailab';
import React, {useContext, useEffect, useMemo, useState} from 'react';

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
    useState<InstructionsKey>();
  const mode: Mode | undefined = useMemo(
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

  useEffect(() => {
    const onContinue = () => {
      dispatch(continueOrFinishLesson());
    };

    const setInstructionsKey: InitAllOptions['setInstructionsKey'] = (
      key,
      options
    ) => {
      setDynamicInstructionsKey(key);
      // Overlay is not shown in Lab2 AI Lab; dismiss immediately.
      if (options?.showOverlay) {
        ailab.instructionsDismissed();
      }
    };

    const saveTrainedModel: InitAllOptions['saveTrainedModel'] = async (
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
        const saveResponse = (await response.json()) as SaveResponse;
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

    ailab.mount({
      assetPath: '/blockly/media/skins/ailab/',
      onContinue,
      setInstructionsKey,
      onTrained,
      i18n: {}, // TODO: Pass through localization map if necessary
      saveTrainedModel,
      logMetric,
      onStartOver,
    });

    return () => ailab.unmount();
  }, [dispatch, showDialog, progressManager, validator]);

  // Reload whenever the level changes regardless of if the mode has changed.
  useEffect(() => {
    ailab.loadLevel(mode);
  }, [levelProperties.id, mode]);

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
        skipValidationOncePassed
        validationTooltip={
          mode?.requireAccuracy
            ? `Train a model with at least ${mode.requireAccuracy}% accuracy`
            : undefined
        }
        dynamicInstructions={dynamicInstructionsContent}
      />
      <div className={styles.divider} />
      <div className={styles.workspace}>
        <div id="root" className={styles.root} />
      </div>
    </div>
  );
};

export default AilabView;
