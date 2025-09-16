import {Codebridge} from '@codebridge/Codebridge';
import {DEFAULT_START_HTML_FILE} from '@codebridge/FilePreview/constants';
import {ConfigType} from '@codebridge/types';
import {css} from '@codemirror/lang-css';
import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {LanguageSupport} from '@codemirror/language';
import React, {useEffect, useMemo, useState} from 'react';

import {SystemPromptOption} from '@cdo/apps/aichat/types';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {LabProps, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';

import {useSource} from '../codebridge/hooks/useSource';
import {useAppDispatch, useAppSelector} from '../util/reduxHooks';

import {WEBLAB2_EDITABLE_FILE_TYPES} from './constants';
import {AiTutorWebLab2ContextHelper} from './helpers/aiTutorContextHelper';
import {
  DEFAULT_AI_TUTOR_MODE,
  getPromptNameFromMode,
  getPromptOptionsFromModes,
} from './helpers/aiTutorHelper';
import FullScreenView from './layout/FullScreenView';
import ShareView from './layout/ShareView';
import VerticalLayout from './layout/VerticalLayout';
import {setViewMode} from './redux';
import {Weblab2LevelProperties, ViewMode} from './types';

import moduleStyles from './styles/weblab2-view.module.scss';

const aiTutorHelper = new AiTutorWebLab2ContextHelper();

const weblab2LangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
  js: javascript(),
};

const defaultConfig: ConfigType = {
  languageMapping: weblab2LangMapping,
  editableFileTypes: WEBLAB2_EDITABLE_FILE_TYPES,
  activeLayout: 'vertical',
  layoutComponents: {
    vertical: VerticalLayout,
    widget: VerticalLayout,
    share: ShareView,
    fullScreen: FullScreenView,
  },
};

const defaultSource: MultiFileSource = {
  folders: {},
  files: {
    '1': {
      id: '1',
      name: DEFAULT_START_HTML_FILE,
      language: 'html',
      contents: `<!DOCTYPE html>
<html>
  <body>
    Content goes here!
  </body>
</html>
  `,
      active: true,
      folderId: '0',
    },
  },
  openFiles: ['1'],
};

const defaultProject: ProjectSources = {source: defaultSource};

const Weblab2View: React.FC<
  LabProps<Weblab2LevelProperties, ProjectSources>
> = ({levelProperties, initialSources}) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);

  const source = useAppSelector(
    state =>
      state.lab2Project.projectSources?.source as MultiFileSource | undefined
  );
  const [aiTutorSystemPromptName, setAiTutorSystemPromptName] =
    useState<string>(() => {
      const availableModes = levelProperties.availableAiTutorModes;
      return getPromptNameFromMode(
        availableModes ? availableModes[0] : undefined
      );
    });
  const [systemPromptOptions, setSystemPromptOptions] = useState<
    SystemPromptOption[] | undefined
  >(undefined);

  const {startSources} = useSource(
    defaultProject,
    levelProperties,
    initialSources
  );

  const hasSource = useAppSelector(
    state => !!state.lab2Project.projectSources?.source
  );

  // Set up AI Tutor system prompt options based on available modes in level properties.
  useEffect(() => {
    const availableModes = levelProperties.availableAiTutorModes || [
      DEFAULT_AI_TUTOR_MODE,
    ];
    const systemPromptName = getPromptNameFromMode(
      availableModes ? availableModes[0] : undefined
    );
    setAiTutorSystemPromptName(systemPromptName);
    setSystemPromptOptions(getPromptOptionsFromModes(availableModes));
  }, [levelProperties.availableAiTutorModes]);

  const aiTutorSystemPromptSettings = useMemo(() => {
    if (!systemPromptOptions || !aiTutorSystemPromptName) {
      return undefined;
    }
    return {
      systemPromptOptions,
      selectedSystemPromptName: aiTutorSystemPromptName,
      onSystemPromptChange: setAiTutorSystemPromptName,
    };
  }, [aiTutorSystemPromptName, systemPromptOptions]);

  // Note: this causes Web Lab 2 to re-render when sources change.
  // Unfortunately, the way AI tutor is set up right now requires passing in a context
  // rather than a callback for the context. In the future, we should consider refactoring AI
  // Tutor so we don't have to re-render the entire lab when sources change (this is also the case for Python Lab).
  useEffect(() => {
    aiTutorHelper.setAiTutorContext({
      source,
      longInstructions: levelProperties.longInstructions,
    });
  }, [source, levelProperties.longInstructions]);

  // Since there's no run button in Weblab2, set it to true by default
  // to enable the Submit button on edit on submittable levels.
  // Set back to false on unmount in case we switch to a different level type.
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setHasRun(true));

    return () => {
      dispatch(setHasRun(false));
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setViewMode(levelProperties?.initialViewMode || ViewMode.SPLIT));
  }, [dispatch, levelProperties?.initialViewMode]);

  return (
    <div className={moduleStyles.weblab2Container}>
      {hasSource && (
        <Codebridge
          config={config}
          setConfig={setConfig}
          startSources={startSources}
          levelProperties={levelProperties}
          hiddenContextCallback={aiTutorHelper.getHiddenContextCallback()}
          aiTutorSystemPromptSettings={aiTutorSystemPromptSettings}
          aiTutorMultimodalEnabled={true}
        />
      )}
    </div>
  );
};

export default Weblab2View;
