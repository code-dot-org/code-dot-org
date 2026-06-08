import ailab from '@code-dot-org/ailab';
import React, {useEffect} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {AilabLevelProperties} from '../types';

import styles from './ailab-view.module.scss';

const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const onContinue = () => {
      dispatch(continueOrFinishLesson());
    };

    const setInstructionsKey = (...args: unknown[]) => {
      // TODO: Configure dynamic instructions.
      console.log('Set instructions key', ...args);
    };

    const saveTrainedModel = async (...args: unknown[]) => {
      // TODO: Save trained model.
      console.log('Save trained model', ...args);
    };

    const logMetric = (eventName: string, details: object) => {
      analyticsReporter.sendEvent(eventName, {details});
    };

    ailab.setAssetPath('/blockly/media/skins/ailab/');
    ailab.initAll({
      mode: levelProperties.mode ? JSON.parse(levelProperties.mode) : undefined,
      onContinue,
      setInstructionsKey,
      i18n: {},
      saveTrainedModel,
      logMetric,
    });
  }, [levelProperties.mode, dispatch]);

  return (
    <div id="ailab-lab2" className={styles.ailab} data-notranslate>
      <ResourcePanel
        className={styles.resourcePanel}
        levelProperties={levelProperties}
        isRunning={false}
        hasRun={false}
        hasEdited={false}
      />
      <div className={styles.divider} />
      <div className={styles.workspace}>
        <div id="root" className={styles.root} />
      </div>
    </div>
  );
};

export default AilabView;
