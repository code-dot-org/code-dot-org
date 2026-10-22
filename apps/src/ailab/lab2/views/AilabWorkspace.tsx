import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Provider} from 'react-redux';

import {
  AilabEngine,
  type AilabEngineProps,
  type AilabProject,
  instructionsDismissed,
  type InstructionsKey,
  loadLevel,
  type Mode,
  ProjectProvider,
  type SaveResponse,
  store,
  TrainingDataProvider,
} from '@cdo/apps/ailab/engine';
import {sendStartedReportIfNotStarted} from '@cdo/apps/code-studio/progressRedux';
import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import type ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import AccuracyValidator from '../AccuracyValidator';
import {getDefaultInstructions} from '../defaultInstructions';
import {type AilabProjectSources, sourceToProject} from '../sources';
import {AilabLevelProperties} from '../types';

import styles from './ailab-view.module.scss';

interface AilabWorkspaceProps {
  levelProperties: AilabLevelProperties;
  hasEdited: boolean;
  savedSource: AilabProjectSources['source'];
  save: (project: AilabProject) => void;
  startOver: () => void;
  projectManager: ProjectManager | null;
}

const AilabWorkspace: React.FC<AilabWorkspaceProps> = ({
  levelProperties,
  hasEdited,
  savedSource,
  save,
  startOver,
  projectManager,
}) => {
  // Read once: the sources change with every save, but the project the lab
  // opens with is the one this level was loaded with.
  const [initialProject] = useState(() => sourceToProject(savedSource));
  const dispatch = useAppDispatch();
  const {showDialog} = useDialogControl();
  const progressManager = useContext(ProgressManagerContext);
  const [validator] = useState(() => new AccuracyValidator());
  const [dynamicInstructionsKey, setDynamicInstructionsKey] =
    useState<InstructionsKey>();
  const levelStatus = useAppSelector(state => getCurrentLevel(state)?.status);
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

  // Use a layout effect to load the level before the browser paints, preventing
  // a flash of the previous level's state.
  useLayoutEffect(() => {
    loadLevel(mode);
  }, [levelProperties.id, mode]);

  const onContinue = async () => {
    await projectManager?.flushSave();
    dispatch(continueOrFinishLesson());
  };

  const setInstructionsKey: AilabEngineProps['setInstructionsKey'] = (
    key,
    options
  ) => {
    setDynamicInstructionsKey(key);
    // Overlay is not shown in Lab2 AI Lab; dismiss immediately.
    if (options?.showOverlay) {
      instructionsDismissed();
    }
  };

  const saveTrainedModel: AilabEngineProps['saveTrainedModel'] = async (
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
    showDialog({type: DialogType.StartOver, handleConfirm: startOver});
  };

  const onTrained = (accuracy: number) => {
    if (levelStatus === LevelStatus.not_tried) {
      dispatch(sendStartedReportIfNotStarted(levelProperties.appName));
    }
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
        hasEdited={hasEdited}
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
          <Provider store={store}>
            <ProjectProvider
              initialProject={initialProject}
              onProjectChange={save}
            >
              <TrainingDataProvider>
                <AilabEngine
                  assetPath="/blockly/media/skins/ailab/"
                  onContinue={onContinue}
                  setInstructionsKey={setInstructionsKey}
                  onTrained={onTrained}
                  i18n={{}} // TODO: Pass through localization map if necessary
                  saveTrainedModel={saveTrainedModel}
                  logMetric={logMetric}
                  onStartOver={onStartOver}
                />
              </TrainingDataProvider>
            </ProjectProvider>
          </Provider>
        </div>
      </div>
    </div>
  );
};

export default AilabWorkspace;
