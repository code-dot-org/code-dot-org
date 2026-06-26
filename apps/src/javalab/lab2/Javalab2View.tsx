import {Codebridge} from '@codebridge/Codebridge';
import {
  LevelbuilderSaveOverrides,
  useSource,
} from '@codebridge/hooks/useSource';
import {CodebridgeLevelProperties, ConfigType} from '@codebridge/types';
import {java} from '@codemirror/lang-java';
import {json} from '@codemirror/lang-json';
import {LanguageSupport} from '@codemirror/language';
import {isEqual} from 'lodash';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';

import {sendStartedReportIfNotStarted} from '@cdo/apps/code-studio/progressRedux';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import TestResultValidator from '@cdo/apps/lab2/progress/TestResultValidator';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {submitPredictResponse} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {setLoadedCodeEnvironment} from '@cdo/apps/lab2/redux/systemRedux';
import {
  LabConfig,
  LabProps,
  MultiFileSource,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils';
import {
  AppDispatch,
  useAppDispatch,
  useAppSelector,
} from '@cdo/apps/util/reduxHooks';

import {
  DEFAULT_PROJECT,
  JAVALAB_EDITABLE_FILE_TYPES,
  JAVALAB_SUPPORTED_FILE_TYPES,
} from './constants';
import {
  handleRunClick,
  sendJavaConsoleInput,
  sendTypedInputMessage,
  stopJavaCode,
} from './javabuilderRunUtils';
import {deriveLabConfig} from './labConfig';
import HorizontalLayout from './layout/HorizontalLayout';
import JavaValidationTracker from './progress/JavaValidationTracker';
import {
  flatToMultiFile,
  mergeValidationIntoStart,
  multiFileToFlat,
  splitForLevelbuilderSave,
} from './sourceConverter';
import {mergeStarterAssets} from './starterAssets';
import {
  flatSourceFromLevelProperties,
  JavalabFlatSource,
  JavalabLevelProperties,
} from './types';

const javalabLangMapping: {[key: string]: LanguageSupport} = {
  java: java(),
  json: json(),
};

const defaultConfig: ConfigType = {
  languageMapping: javalabLangMapping,
  editableFileTypes: JAVALAB_EDITABLE_FILE_TYPES,
  supportedFileTypes: JAVALAB_SUPPORTED_FILE_TYPES,
  activeLayout: 'horizontal',
  // For now, Java Lab does not support folders, for backwards compatibility with
  // the legacy source format.
  hideNewFolderButton: true,
  layoutComponents: {
    horizontal: HorizontalLayout,
    share: HorizontalLayout,
    widget: HorizontalLayout,
  },
};

// Java Lab 2 — lab2 shell. Loads a level, edits code in codebridge,
// runs against Javabuilder, prints stdout/stderr to the codebridge
// console. Open TODOs in the README.
const Javalab2View: React.FunctionComponent<
  LabProps<JavalabLevelProperties, ProjectSources>
> = ({levelProperties, initialSources, channel}) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const dispatch = useAppDispatch();
  const progressManager = useContext(ProgressManagerContext);
  const isPredictLevel = levelProperties.predictSettings?.isPredictLevel;

  // Register the lab-specific validator so the Lab2 progress system can
  // evaluate validation results (driven by Javabuilder test runs).
  useEffect(() => {
    if (progressManager && levelProperties.appName === 'javalab') {
      progressManager.setValidator(
        new TestResultValidator(JavaValidationTracker.getInstance())
      );
    }
  }, [progressManager, levelProperties.appName]);

  // Derive the labConfig (which sets the mini app in codebridge) from the
  // channel or the level's csaViewMode. Memoize to avoid reference changes
  // to initialSourcesWithLabConfig below, which would cause useSource to reset the project.
  const labConfigRef = useRef<LabConfig | undefined>(undefined);
  const labConfig = useMemo(() => {
    const derived = deriveLabConfig(
      levelProperties.csaViewMode,
      channel?.labConfig
    );
    if (!isEqual(derived, labConfigRef.current)) {
      labConfigRef.current = derived;
    }
    return labConfigRef.current;
  }, [levelProperties.csaViewMode, channel?.labConfig]);

  // Java Lab has no client-side runtime to warm up.
  // Mark the code environment loaded immediately so the Run button
  // is enabled as soon as the view mounts. Reset on unmount so a later
  // navigation to a lab with a real environment isn't tricked.
  useEffect(() => {
    dispatch(setLoadedCodeEnvironment(true));
    return () => {
      dispatch(setLoadedCodeEnvironment(false));
    };
  }, [dispatch]);

  // Stop any in-progress program when switching levels
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, stopJavaCode);

  // Codebridge expects MultiFileSource, but legacy Java lab/Javabuilder expects a flat source.
  // Convert here before passing to codebridge. Also merge in the level's starter assets
  // when loading from the level rather than an active project.
  const codebridgeLevelProperties = useMemo<CodebridgeLevelProperties>(() => {
    const flatTemplate = flatSourceFromLevelProperties(
      levelProperties.templateSources
    );
    const flatExemplar = flatSourceFromLevelProperties(
      levelProperties.exemplarSources
    );
    const flatStartRaw = flatSourceFromLevelProperties(
      levelProperties.startSources
    );
    const flatStart = getIsStartMode()
      ? mergeValidationIntoStart(flatStartRaw, levelProperties.validation)
      : flatStartRaw;

    const includeStarterAssets = (flat: JavalabFlatSource | undefined) =>
      flat
        ? mergeStarterAssets(
            flatToMultiFile(flat),
            levelProperties.starterAssets,
            levelProperties.name
          )
        : undefined;

    return {
      ...levelProperties,
      miniApp: labConfig?.miniApp?.name,
      startSources: includeStarterAssets(flatStart),
      templateSources: includeStarterAssets(flatTemplate),
      exemplarSources: includeStarterAssets(flatExemplar),
    };
  }, [levelProperties, labConfig]);

  // A loaded project's sources come from the flat S3 shape, which carries no
  // labConfig. Merge it back in so codebridge shows the mini-app for existing
  // miniApp-based projects.
  const initialSourcesWithLabConfig = useMemo(
    () =>
      initialSources && labConfig
        ? {...initialSources, labConfig}
        : initialSources,
    [initialSources, labConfig]
  );

  // Levelbuilder save needs Javalab's flat shape, not codebridge's
  // MultiFileSource. For start mode, split validation files off into a
  // separate `validation` field, for consistency with legacy.
  const levelbuilderSaveOverrides = useMemo<LevelbuilderSaveOverrides>(
    () => ({
      buildStartSavePayload: source => {
        const {startSources: startFlat, validation} =
          splitForLevelbuilderSave(source);
        return {start_sources: startFlat, validation};
      },
      buildExemplarSavePayload: source => ({
        exemplar_sources: multiFileToFlat(source),
      }),
    }),
    []
  );

  const {startSources} = useSource(
    DEFAULT_PROJECT,
    codebridgeLevelProperties,
    initialSourcesWithLabConfig,
    levelbuilderSaveOverrides
  );

  const sourceLevelId = useAppSelector(
    state => state.lab2Project.projectSourceLevelId
  );
  const source = useAppSelector(
    state =>
      state.lab2Project.projectSources?.source as MultiFileSource | undefined
  );
  const hasSource = !!source;

  // We track first save so we know whether handleRunClick needs to force a save
  // before running. We need to ensure the user has saved at least once before
  // running so their code is in S3 for Javabuilder to read.
  // Each level has its own channel and ProjectManager, so re-register (and
  // reset) per channel; the stale guard keeps a save from the previous
  // level's manager from marking the new level saved.
  const initialSourcesSaved = useRef(false);
  useEffect(() => {
    initialSourcesSaved.current = false;
    let stale = false;
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      projectManager.addSaveSuccessListener(() => {
        // Ensure a new version was actually saved by checking for a version id.
        if (!stale && projectManager.getCurrentVersionId()) {
          initialSourcesSaved.current = true;
        }
      });
    }
    return () => {
      stale = true;
    };
  }, [channel?.id]);

  const onRun = async (
    runTests: boolean,
    dispatch: AppDispatch,
    _source: MultiFileSource | undefined
  ) => {
    await handleRunClick(
      runTests,
      dispatch,
      levelProperties.id,
      labConfig?.miniApp?.name || 'console',
      progressManager,
      /* needsInitialSourcesSave */ !initialSources &&
        !initialSourcesSaved.current
    );
    if (!isPredictLevel) {
      dispatch(sendStartedReportIfNotStarted(levelProperties.appName || ''));
    }
    dispatch(submitPredictResponse({appType: levelProperties.appName || ''}));
  };

  return (
    <div>
      {hasSource && sourceLevelId === levelProperties.id && (
        <Codebridge
          config={config}
          setConfig={setConfig}
          startSources={startSources}
          onRun={onRun}
          onStop={stopJavaCode}
          sendConsoleInput={sendJavaConsoleInput}
          sendTypedInputMessage={sendTypedInputMessage}
          levelProperties={codebridgeLevelProperties}
          allowMultipleValidationFiles={true}
        />
      )}
    </div>
  );
};

export default Javalab2View;
