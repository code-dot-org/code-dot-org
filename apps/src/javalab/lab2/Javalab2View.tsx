import {Codebridge} from '@codebridge/Codebridge';
import {
  LevelbuilderSaveOverrides,
  useSource,
} from '@codebridge/hooks/useSource';
import {CodebridgeLevelProperties, ConfigType} from '@codebridge/types';
import {java} from '@codemirror/lang-java';
import {json} from '@codemirror/lang-json';
import {LanguageSupport} from '@codemirror/language';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';

import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import TestResultValidator from '@cdo/apps/lab2/progress/TestResultValidator';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setLoadedCodeEnvironment} from '@cdo/apps/lab2/redux/systemRedux';
import {LabProps, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
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
import {flatSourceFromLevelProperties, JavalabLevelProperties} from './types';

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
    vertical: HorizontalLayout,
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

  // Register the lab-specific validator so the Lab2 progress system can
  // evaluate validation results (driven by Javabuilder test runs).
  useEffect(() => {
    if (progressManager && levelProperties.appName === 'javalab') {
      progressManager.setValidator(
        new TestResultValidator(JavaValidationTracker.getInstance())
      );
    }
  }, [progressManager, levelProperties.appName]);

  // Derive the labConfig (which sets the mini app in codebridge) from
  // the channel or the level's csaViewMode.
  const labConfig = useMemo(
    () => deriveLabConfig(levelProperties.csaViewMode, channel?.labConfig),
    [levelProperties.csaViewMode, channel?.labConfig]
  );

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

  // Codebridge expects MultiFileSource, but legacy Java lab/Javabuilder expects a flat source.
  // Convert here before passing to codebridge.
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

    return {
      ...levelProperties,
      miniApp: labConfig?.miniApp?.name,
      startSources: flatStart ? flatToMultiFile(flatStart) : undefined,
      templateSources: flatTemplate ? flatToMultiFile(flatTemplate) : undefined,
      exemplarSources: flatExemplar ? flatToMultiFile(flatExemplar) : undefined,
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
  const projectSources = useAppSelector(
    state => state.lab2Project.projectSources
  );
  const source = projectSources?.source as MultiFileSource | undefined;
  const hasSource = !!source;
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);

  // Javabuilder loads source from S3 by channel id. A brand-new project shows the level's
  // start code in the editor, but it won't be saved until the user edits. Persist it
  // once here so a first Run with no edits still has sources to fetch.
  const startCodeSavedForChannel = useRef<string | undefined>(undefined);
  useEffect(() => {
    const channelId = channel?.id;
    if (
      initialSources ||
      isReadOnly ||
      getIsStartMode() ||
      !projectSources ||
      !channelId ||
      sourceLevelId !== levelProperties.id ||
      startCodeSavedForChannel.current === channelId
    ) {
      return;
    }
    startCodeSavedForChannel.current = channelId;
    Lab2Registry.getInstance()
      .getProjectManager()
      ?.save(
        projectSources,
        /* forceSave */ true,
        /* forceNewVersion */ false,
        /* skipSourcesChangedCheck */ true
      );
  }, [
    initialSources,
    isReadOnly,
    projectSources,
    channel?.id,
    sourceLevelId,
    levelProperties.id,
  ]);

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
      progressManager
    );
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
          levelProperties={codebridgeLevelProperties}
          allowMultipleValidationFiles={true}
        />
      )}
    </div>
  );
};

export default Javalab2View;
