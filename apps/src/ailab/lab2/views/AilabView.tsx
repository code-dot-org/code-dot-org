// @ts-expect-error ml-playground has no type declarations
import {setAssetPath} from '@code-dot-org/ml-playground/dist/assetPath';
import React, {useEffect, useRef} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import localization from '@cdo/apps/localization';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  setDynamicInstructionsDefaults,
  setDynamicInstructionsKey,
  setDynamicInstructionsOverlayDismissCallback,
} from '@cdo/apps/redux/instructions';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

// @ts-expect-error legacy JS module
import ailabMsg from '../../locale';
// @ts-expect-error legacy JS module
import mlPlaygroundMsg from '../../mlPlayground_locale';
import {AilabLevelProperties} from '../types';

import styles from './AilabView.module.scss';

type MsgFn = (...args: unknown[]) => string;
type MsgTree = {[key: string]: MsgFn | MsgTree};

function localize(tree: MsgTree, scope: string): MsgTree {
  const out: MsgTree = {};
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === 'function') {
      out[key] = (...args: unknown[]) =>
        localization.translate(value(...args), [scope]);
    } else {
      out[key] = localize(value, scope);
    }
  }
  return out;
}

function parseMode(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw ?? null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const AilabView: React.FunctionComponent<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  // ml-playground's initAll mounts into a global #root and exposes no teardown,
  // so the effect must run exactly once. React 18 StrictMode double-invokes
  // effects in dev, and levelProperties is a fresh reference on every parent
  // render — both would re-trigger init without this guard.
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const aiMsg = localize(ailabMsg, 'ailab') as Record<string, MsgFn>;
    const mlMsg = localize(mlPlaygroundMsg, 'ailab');

    dispatch(
      setDynamicInstructionsDefaults({
        selectDataset: aiMsg.selectDataset(),
        uploadedDataset: aiMsg.uploadedDataset(),
        selectedDataset: aiMsg.selectedDataset(),
        dataDisplayLabel: aiMsg.dataDisplayLabel(),
        dataDisplayFeatures: aiMsg.dataDisplayFeatures(),
        selectedFeatureNumerical: aiMsg.selectedFeatureNumerical(),
        selectedFeatureCategorical: aiMsg.selectedFeatureCategorical(),
        trainModel: aiMsg.trainModel(),
        generateResults: aiMsg.generateResults(),
        results: aiMsg.results(),
        resultsDetails: aiMsg.resultsDetails(),
        saveModel: aiMsg.saveModel(),
        modelSummary: aiMsg.modelSummary(),
      })
    );

    setAssetPath('/blockly/media/skins/ailab/');

    const setInstructionsKey = (key: string, options: unknown) => {
      dispatch(setDynamicInstructionsKey(key, options));
    };

    const saveTrainedModel = async (
      dataToSave: object,
      callback: (resp: object) => void
    ) => {
      try {
        const response = await HttpClient.post(
          '/api/v1/ml_models/save',
          JSON.stringify(dataToSave),
          false,
          {'Content-Type': 'application/json;charset=UTF-8'}
        );
        callback(await response.json());
      } catch {
        callback({status: 'failure'});
      }
    };

    const logMetric = (eventName: string, details: object) => {
      analyticsReporter.sendEvent(eventName, {details});
    };

    const {
      initAll,
      instructionsDismissed,
    } = require('@code-dot-org/ml-playground');

    initAll({
      mode: parseMode(levelProperties.mode),
      onContinue: () => dispatch(continueOrFinishLesson()),
      setInstructionsKey,
      i18n: mlMsg,
      saveTrainedModel,
      logMetric,
    });

    if (instructionsDismissed) {
      dispatch(
        setDynamicInstructionsOverlayDismissCallback(instructionsDismissed)
      );
    }
  }, [dispatch, levelProperties]);

  return (
    <div className={styles.container} data-notranslate>
      <ResourcePanel
        levelProperties={levelProperties}
        isRunning={false}
        hasRun={false}
        hasEdited={false}
        className={styles.resourcePanel}
      />
      <div className={styles.divider} />
      <div className={styles.workspace}>
        <div id="root" className={styles.root} />
      </div>
    </div>
  );
};

export default AilabView;
