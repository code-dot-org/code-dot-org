import ailab, {
  type InitAllOptions,
  type SaveResponse,
  type InstructionsKey,
} from '@code-dot-org/ailab';
import React, {useEffect, useMemo, useState} from 'react';

import ailabI18n from '@cdo/apps/ailab/locale';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {AilabLevelProperties} from '../types';

import styles from './ailab-view.module.scss';

const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const [dynamicInstructionsKey, setDynamicInstructionsKey] =
    useState<InstructionsKey>();
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

    ailab.mount({
      assetPath: '/blockly/media/skins/ailab/',
      onContinue,
      setInstructionsKey,
      i18n: {}, // TODO: Pass through localization map if necessary
      saveTrainedModel,
      logMetric,
    });

    return () => ailab.unmount();
  }, [dispatch]);

  // Reload whenever the level changes regardless of if the mode has changed.
  useEffect(() => {
    const mode = levelProperties.mode
      ? JSON.parse(levelProperties.mode)
      : undefined;
    ailab.loadLevel(mode);
  }, [levelProperties.id, levelProperties.mode]);

  const dynamicInstructionsContent = useMemo(() => {
    if (!dynamicInstructionsKey) {
      return undefined;
    }
    if (dynamicInstructionsMap[dynamicInstructionsKey]) {
      return dynamicInstructionsMap[dynamicInstructionsKey];
    } else if (ailabI18n[dynamicInstructionsKey]) {
      return ailabI18n[dynamicInstructionsKey]();
    } else {
      console.warn(
        `No dynamic instructions available for key ${dynamicInstructionsKey}`
      );
      return undefined;
    }
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
