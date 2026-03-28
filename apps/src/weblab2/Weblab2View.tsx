import {Codebridge} from '@codebridge/Codebridge';
import {ConfigType} from '@codebridge/types';
import {css} from '@codemirror/lang-css';
import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';
import {LanguageSupport} from '@codemirror/language';
import React, {useEffect, useMemo, useState} from 'react';

import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {
  AppName,
  LabProps,
  MultiFileSource,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {DEFAULT_START_HTML_FILE} from '@cdo/apps/weblab2/htmlPreview/constants';

import {useSource} from '../codebridge/hooks/useSource';
import {useAppDispatch, useAppSelector} from '../util/reduxHooks';

import {
  DEFAULT_ANSWER_TYPES,
  TUTOR_MODE_TO_ANSWER_TYPE,
  WEBLAB2_EDITABLE_FILE_TYPES,
  WEBLAB2_SUPPORTED_FILE_TYPES,
} from './constants';
import {AiTutorWebLab2ContextHelper} from './helpers/aiTutorContextHelper';
import {generateAiTutorPrompt} from './helpers/aiTutorPromptGenerator';
import {useAiTutorResponseSchemaSettings} from './hooks/useAiTutorResponseSchemaSettings';
import ShareView from './layout/ShareView';
import VerticalLayout from './layout/VerticalLayout';
import {Weblab2LevelProperties, ViewMode, AiTutorAnswerType} from './types';
import {setViewMode} from './weblab2Redux';

import moduleStyles from './styles/weblab2-view.module.scss';

const aiTutorHelper = new AiTutorWebLab2ContextHelper();

const weblab2LangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
  js: javascript(),
  md: markdown(),
  json: json(),
};

const defaultConfig: ConfigType = {
  languageMapping: weblab2LangMapping,
  editableFileTypes: WEBLAB2_EDITABLE_FILE_TYPES,
  supportedFileTypes: WEBLAB2_SUPPORTED_FILE_TYPES,
  activeLayout: 'vertical',
  layoutComponents: {
    vertical: VerticalLayout,
    widget: VerticalLayout,
    share: ShareView,
  },
};

const defaultSource: MultiFileSource = {
  folders: {},
  files: {
    '1': {
      id: '1',
      name: DEFAULT_START_HTML_FILE,
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

const Weblab2LoadedView = ({
  levelProperties,
  initialSources,
}: LabProps<Weblab2LevelProperties, ProjectSources>) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);

  const logLevelActivity = useLevelActivityMetrics(levelProperties);

  const source = useAppSelector(
    state =>
      state.lab2Project.projectSources?.source as MultiFileSource | undefined
  );
  const sourceLevel = useAppSelector(
    state => state.lab2Project.projectSourceLevelId
  );

  const {startSources} = useSource(
    defaultProject,
    levelProperties,
    initialSources
  );

  const hasSource = useAppSelector(
    state => !!state.lab2Project.projectSources?.source
  );

  const hasEdited = useAppSelector(state => state.lab2Project.hasEdited);

  const hasRun = useAppSelector(state => state.lab2System.hasRun);

  // Note: this causes Web Lab 2 to re-render when sources change.
  // Unfortunately, the way AI tutor is set up right now requires passing in a context
  // rather than a callback for the context. In the future, we should consider refactoring AI
  // Tutor so we don't have to re-render the entire lab when sources change (this is also the case for Python Lab).
  useEffect(() => {
    aiTutorHelper.setAiTutorContext({
      source,
      longInstructions: levelProperties.longInstructions,
      hasEdited,
      hasRun,
    });
  }, [source, levelProperties.longInstructions, hasEdited, hasRun]);

  const systemPrompt = useMemo(() => {
    let answerTypes: AiTutorAnswerType[] | undefined =
      levelProperties.aiTutorPromptSettings?.answerTypes;
    if (
      !levelProperties.aiTutorPromptSettings?.answerTypes &&
      levelProperties.aiTutorMode
    ) {
      answerTypes =
        TUTOR_MODE_TO_ANSWER_TYPE[
          levelProperties.aiTutorMode as keyof typeof TUTOR_MODE_TO_ANSWER_TYPE
        ] || DEFAULT_ANSWER_TYPES;
    } else if (!answerTypes) {
      answerTypes = DEFAULT_ANSWER_TYPES;
    }
    return generateAiTutorPrompt(
      answerTypes,
      levelProperties.aiTutorPromptSettings?.answerTypeCustomizations
    );
  }, [levelProperties.aiTutorMode, levelProperties.aiTutorPromptSettings]);

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
    if (hasEdited) {
      logLevelActivity();
    }
  }, [hasEdited, logLevelActivity]);

  useEffect(() => {
    dispatch(setViewMode(levelProperties?.initialViewMode || ViewMode.SPLIT));
  }, [dispatch, levelProperties?.initialViewMode]);

  const aiTutorResponseSchemaSettings = useAiTutorResponseSchemaSettings(
    source,
    levelProperties?.widgetView
  );

  const secondaryBackpackAppNames: AppName[] = useMemo(() => ['sketchlab'], []);

  return (
    <div className={moduleStyles.weblab2Container}>
      {hasSource && sourceLevel === levelProperties.id && (
        <Codebridge
          config={config}
          setConfig={setConfig}
          startSources={startSources}
          levelProperties={levelProperties}
          hiddenContextCallback={aiTutorHelper.getHiddenContextCallback()}
          aiTutorMultimodalEnabled={true}
          aiTutorChatButtonData={[]}
          aiTutorContextHelper={aiTutorHelper}
          aiTutorSystemPrompt={systemPrompt}
          aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
          secondaryBackpackAppNames={secondaryBackpackAppNames}
        />
      )}
    </div>
  );
};

const Weblab2View: React.FC<
  LabProps<Weblab2LevelProperties, ProjectSources>
> = ({levelProperties, initialSources}) => {
  const [reformedSources, setReformedSources] = useState<
    ProjectSources | undefined
  >(undefined);

  // When we are in a legacy Weblab level and we didn't pull modern sources,
  // this might mean that we have legacy sources. We need to poll the old files
  // API for a file list before we render and save the project sources into the
  // ProjectContainer.
  //
  // Once the level loads and we use the ProjectManager to save, we now supply
  // the modern sources API and that will get pulled as 'initialSources' on the
  // next page load. That will complete the cycle and fully migrate the project
  // over to Weblab2.
  const fetchingLegacySources = useMemo(
    () => levelProperties.appName === 'weblab' && !initialSources,
    [initialSources, levelProperties]
  );

  // We need the channel id just in case we need to pull from the files API
  const channelId = useAppSelector(state => state.lab.channel?.id);

  useEffect(() => {
    // Load, potentially, the weblab 1 sources and convert them before
    // continuing to load the view
    if (fetchingLegacySources) {
      (async () => {
        // Get the file list
        const response = await fetch(`/v3/files/${channelId}`);
        const filesList = await response.json();

        // Parse through and download all of the files referenced in the files list
        const promises = (filesList?.files || []).map(
          async (
            file: {
              filename: string;
              category: 'text' | 'image';
            },
            i: number
          ) => {
            const id = (i + 1).toString();
            const fileURL = `/v3/files/${channelId}/${file.filename}`;
            if (file.category !== 'image') {
              // For text content, pull it down so we can store it in the sources
              const fileResponse = await fetch(fileURL);
              return [
                id,
                {
                  id,
                  contents: await fileResponse.text(),
                  name: file.filename,
                  folderId: '0',
                },
              ];
            } else {
              // For images, just reference the image directly from its existing
              // uploaded place in the files bucket.
              return [
                id,
                {
                  id,
                  contents: '',
                  url: fileURL,
                  name: file.filename,
                  folderId: '0',
                },
              ];
            }
          }
        );

        // Resolve all of the file metadata
        const files = await Promise.all(promises);

        // And then set the current sources, which will finally allow the actual
        // Weblab view to load.
        setReformedSources({
          source: {
            // Convert array to object keyed by the id property
            files: Object.fromEntries(files),
            folders: {},
          },
        });
      })();
    }
  }, [setReformedSources, fetchingLegacySources, channelId]);

  return fetchingLegacySources ? (
    // Weblab 1 Conversion
    reformedSources ? (
      <Weblab2LoadedView
        levelProperties={levelProperties}
        initialSources={reformedSources}
      />
    ) : (
      <Loading isLoading={true} />
    )
  ) : (
    // Normal Weblab 2
    <Weblab2LoadedView
      levelProperties={levelProperties}
      initialSources={initialSources}
    />
  );
};

export default Weblab2View;
