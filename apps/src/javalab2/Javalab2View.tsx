import {Codebridge} from '@codebridge/Codebridge';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {useSource} from '@codebridge/hooks/useSource';
import {CodebridgeLevelProperties, ConfigType} from '@codebridge/types';
import {java} from '@codemirror/lang-java';
import {json} from '@codemirror/lang-json';
import {LanguageSupport} from '@codemirror/language';
import React, {useMemo, useState} from 'react';

import {LabProps, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {AppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  DEFAULT_PROJECT,
  JAVALAB_EDITABLE_FILE_TYPES,
  JAVALAB_SUPPORTED_FILE_TYPES,
} from './constants';
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

  // Stub run handler — Phase 3 swaps this for the Javabuilder adapter.
  const onRun = async (
    _runTests: boolean,
    _dispatch: AppDispatch,
    _source: MultiFileSource | undefined
  ) => {
    const consoleManager =
      CodebridgeRegistry.getInstance().getConsoleManager();
    consoleManager?.writeConsoleMessage(
      'Java execution not yet wired up. Phase 3 will connect this to Javabuilder.'
    );
  };

  const onStop = () => {
    // Phase 3 wires this to JavabuilderClient.disconnect().
  };

  return (
    <div className={moduleStyles.javalab}>
      {hasSource && sourceLevelId === levelProperties.id && (
        <Codebridge
          config={config}
          setConfig={setConfig}
          startSources={startSources}
          onRun={onRun}
          onStop={onStop}
          levelProperties={levelProperties}
        />
      )}
    </div>
  );
};

export default Javalab2View;
