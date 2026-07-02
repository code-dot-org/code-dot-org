import ailab, {
  type InitAllOptions,
  type SaveResponse,
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
  const dynamicInstructionsMap: {[key: string]: string} = useMemo(
    () => JSON.parse(levelProperties.dynamicInstructions || '{}'),
    [levelProperties.dynamicInstructions]
  );
  const [dynamicInstructions, setDynamicInstructions] = useState<string>();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const onContinue = () => {
      dispatch(continueOrFinishLesson());
    };

    const setInstructionsKey: InitAllOptions['setInstructionsKey'] = (
      key,
      options
    ) => {
      if (dynamicInstructionsMap[key]) {
        setDynamicInstructions(dynamicInstructionsMap[key]);
      } else if (ailabI18n[key]) {
        setDynamicInstructions(ailabI18n[key]());
      } else {
        console.warn(`No dynamic instructions available for key ${key}`);
        setDynamicInstructions(undefined);
      }

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
          {
            'Content-Type': 'application/json',
          }
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

    ailab.setAssetPath('/blockly/media/skins/ailab/');
    ailab.initAll({
      mode: levelProperties.mode ? JSON.parse(levelProperties.mode) : undefined,
      onContinue,
      setInstructionsKey,
      i18n: {}, // TODO: Pass through localization map if necessary
      saveTrainedModel,
      logMetric,
    });
  }, [levelProperties.mode, dynamicInstructionsMap, dispatch]);

  return (
    <div id="ailab-lab2" className={styles.ailab} data-notranslate>
      <ResourcePanel
        className={styles.resourcePanel}
        levelProperties={levelProperties}
        isRunning={false}
        hasRun={false}
        hasEdited={false}
        dynamicInstructions={dynamicInstructions}
      />
      <div className={styles.divider} />
      <div className={styles.workspace}>
        <div id="root" className={styles.root} />
      </div>
    </div>
  );
};

export default AilabView;
