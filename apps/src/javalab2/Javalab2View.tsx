import {Codebridge} from '@codebridge/Codebridge';
import {useSource} from '@codebridge/hooks/useSource';
import {CodebridgeLevelProperties, ConfigType} from '@codebridge/types';
import {java} from '@codemirror/lang-java';
import {json} from '@codemirror/lang-json';
import {LanguageSupport} from '@codemirror/language';
import React, {useEffect, useMemo, useState} from 'react';

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
  sendStdin,
  stopJavaCode,
} from './javabuilderRunner';
import HorizontalLayout from './layout/HorizontalLayout';
import ShareView from './layout/ShareView';
import VerticalLayout from './layout/VerticalLayout';
import {migrateLegacyJavalabSources} from './migrateLegacySources';

import moduleStyles from './javalab-view.module.scss';

const javalabLangMapping: {[key: string]: LanguageSupport} = {
  java: java(),
  json: json(),
};

const defaultConfig: ConfigType = {
  languageMapping: javalabLangMapping,
  editableFileTypes: JAVALAB_EDITABLE_FILE_TYPES,
  supportedFileTypes: JAVALAB_SUPPORTED_FILE_TYPES,
  activeLayout: 'horizontal',
  layoutComponents: {
    horizontal: HorizontalLayout,
    vertical: VerticalLayout,
    share: ShareView,
    widget: HorizontalLayout,
  },
};

const Javalab2View: React.FunctionComponent<
  LabProps<CodebridgeLevelProperties, ProjectSources>
> = ({levelProperties, initialSources}) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  // Old Java Lab wrote channel sources as a flat {filename: code} hash; the
  // codebridge code path requires MultiFileSource. Normalize here so returning
  // users with legacy projects do not crash on load.
  const migratedInitialSources = useMemo(
    () => migrateLegacyJavalabSources(initialSources),
    [initialSources]
  );
  const {startSources} = useSource(
    DEFAULT_PROJECT,
    levelProperties,
    migratedInitialSources
  );
  const sourceLevelId = useAppSelector(
    state => state.lab2Project.projectSourceLevelId
  );
  const source = useAppSelector(
    state =>
      state.lab2Project.projectSources?.source as MultiFileSource | undefined
  );

  const hasSource = !!source;
  const csaViewMode = (
    levelProperties as CodebridgeLevelProperties & {csaViewMode?: string}
  ).csaViewMode;

  // Java Lab runs against Javabuilder; there is no in-browser environment
  // to bootstrap (unlike pythonlab's Pyodide). Mark the environment loaded
  // at mount so the Run button is enabled immediately.
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setLoadedCodeEnvironment(true));
    return () => {
      dispatch(setLoadedCodeEnvironment(false));
    };
  }, [dispatch]);

  const onRun = async (
    runTests: boolean,
    _dispatch: AppDispatch,
    runSource: MultiFileSource | undefined
  ) => {
    await handleRunClick(runTests, runSource, levelProperties.id, csaViewMode);
  };

  return (
    <div className={moduleStyles.javalab}>
      {hasSource && sourceLevelId === levelProperties.id && (
        <Codebridge
          config={config}
          setConfig={setConfig}
          startSources={startSources}
          onRun={onRun}
          onStop={stopJavaCode}
          sendConsoleInput={sendStdin}
          levelProperties={levelProperties}
        />
      )}
    </div>
  );
};

export default Javalab2View;
