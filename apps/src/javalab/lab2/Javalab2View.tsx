import {Codebridge} from '@codebridge/Codebridge';
import {useSource} from '@codebridge/hooks/useSource';
import {CodebridgeLevelProperties, ConfigType} from '@codebridge/types';
import {java} from '@codemirror/lang-java';
import {json} from '@codemirror/lang-json';
import {LanguageSupport} from '@codemirror/language';
import React, {useEffect, useMemo, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
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
import HorizontalLayout from './layout/HorizontalLayout';
import {flatToMultiFile} from './sourceConverter';
import {JavalabFlatSource, JavalabLevelProperties} from './types';

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

// Java Lab 2 — minimal Phase 1 lab2 shell. Loads a level, edits code in
// codebridge, runs against Javabuilder, prints stdout/stderr to the
// codebridge console. Validation, neighborhood, theater, captcha, backpack,
// and start_sources edit mode are TODOs.
const Javalab2View: React.FunctionComponent<
  LabProps<JavalabLevelProperties, ProjectSources>
> = ({levelProperties, initialSources}) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const viewDispatch = useAppDispatch();

  // Java Lab has no client-side runtime to warm up.
  // Mark the code environment loaded immediately so the Run button
  // is enabled as soon as the view mounts. Reset on unmount so a later
  // navigation to a lab with a real environment isn't tricked.
  useEffect(() => {
    viewDispatch(setLoadedCodeEnvironment(true));
    return () => {
      viewDispatch(setLoadedCodeEnvironment(false));
    };
  }, [viewDispatch]);

  // Codebridge expects MultiFileSource, but legacy Java lab/Javabuilder expects a flat source.
  // Convert here before passing to codebridge.
  const codebridgeLevelProperties = useMemo<CodebridgeLevelProperties>(() => {
    const flatStart = levelProperties.startSources as
      | JavalabFlatSource
      | undefined;
    const flatTemplate = levelProperties.templateSources as
      | JavalabFlatSource
      | undefined;
    const flatExemplar = levelProperties.exemplarSources as
      | JavalabFlatSource
      | undefined;

    return {
      ...levelProperties,
      startSources: flatStart ? flatToMultiFile(flatStart) : undefined,
      templateSources: flatTemplate ? flatToMultiFile(flatTemplate) : undefined,
      exemplarSources: flatExemplar ? flatToMultiFile(flatExemplar) : undefined,
    };
  }, [levelProperties]);

  const {startSources} = useSource(
    DEFAULT_PROJECT,
    codebridgeLevelProperties,
    initialSources
  );

  const sourceLevelId = useAppSelector(
    state => state.lab2Project.projectSourceLevelId
  );
  const source = useAppSelector(
    state =>
      state.lab2Project.projectSources?.source as MultiFileSource | undefined
  );
  const hasSource = !!source;

  const onRun = async (
    _runTests: boolean,
    dispatch: AppDispatch,
    _source: MultiFileSource | undefined
  ) => {
    // Javabuilder reads source from S3. Flush the in-memory editor first so
    // S3 reflects what the user sees before the WS connection opens.
    await Lab2Registry.getInstance().getProjectManager()?.flushSave();
    await handleRunClick(dispatch, levelProperties);
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
        />
      )}
    </div>
  );
};

export default Javalab2View;
