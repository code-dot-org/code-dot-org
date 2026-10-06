import ailab, {
  type AccuracyRequirement,
  type InitAllOptions,
  type SaveResponse,
  type InstructionsKey,
} from '@code-dot-org/ailab';
import React, {useEffect, useMemo, useState} from 'react';

import {setValidationState} from '@cdo/apps/lab2/lab2Redux';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {ValidationState} from '@cdo/apps/lab2/progress/ProgressManager';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {getDefaultInstructions} from '../defaultInstructions';
import {AilabLevelProperties} from '../types';

import styles from './ailab-view.module.scss';

const getValidationState = (
  requirement: AccuracyRequirement | null
): ValidationState => ({
  hasConditions: !!requirement,
  satisfied: !!requirement?.met,
  message:
    requirement && !requirement.met
      ? `Train a model with at least ${requirement.minimum}% accuracy to continue.`
      : null,
  index: 0,
});

const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const {showDialog} = useDialogControl();
  const [dynamicInstructionsKey, setDynamicInstructionsKey] =
    useState<InstructionsKey>();
  const [accuracyRequirement, setAccuracyRequirement] =
    useState<AccuracyRequirement | null>(null);
  const dynamicInstructionsMap: {[key: string]: string} = useMemo(
    () => JSON.parse(levelProperties.dynamicInstructions || '{}'),
    [levelProperties.dynamicInstructions]
  );

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

    ailab.mount({
      assetPath: '/blockly/media/skins/ailab/',
      onContinue,
      setInstructionsKey,
      setAccuracyRequirement,
      i18n: {}, // TODO: Pass through localization map if necessary
      saveTrainedModel,
      logMetric,
      onStartOver,
    });

    return () => ailab.unmount();
  }, [dispatch, showDialog]);

  // Reload whenever the level changes regardless of if the mode has changed.
  useEffect(() => {
    const mode = levelProperties.mode
      ? JSON.parse(levelProperties.mode)
      : undefined;
    ailab.loadLevel(mode);
  }, [levelProperties.id, levelProperties.mode]);

  // From an effect, so ProgressContainer's validation reset can't overwrite it.
  useEffect(() => {
    dispatch(setValidationState(getValidationState(accuracyRequirement)));
  }, [dispatch, accuracyRequirement]);

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
