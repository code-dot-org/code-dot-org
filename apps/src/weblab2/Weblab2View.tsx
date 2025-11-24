import {Codebridge} from '@codebridge/Codebridge';
import {DEFAULT_START_HTML_FILE} from '@codebridge/FilePreview/constants';
import {ConfigType} from '@codebridge/types';
import {getFolderPath} from '@codebridge/utils';
import {css} from '@codemirror/lang-css';
import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {markdown} from '@codemirror/lang-markdown';
import {LanguageSupport} from '@codemirror/language';
import React, {useEffect, useMemo, useState} from 'react';

import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import {
  setProjectSourceBeforeAiTutorVersion,
  setSource,
  setViewingAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {
  LabProps,
  MultiFileSource,
  ProjectSources,
  ProjectFile,
} from '@cdo/apps/lab2/types';
import experiments from '@cdo/apps/util/experiments';

import {ResponseSchemaSettings} from '../aichat/types';
import {useSource} from '../codebridge/hooks/useSource';
import {useAppDispatch, useAppSelector} from '../util/reduxHooks';

import {WEBLAB2_EDITABLE_FILE_TYPES} from './constants';
import {AiTutorWebLab2ContextHelper} from './helpers/aiTutorContextHelper';
import {getPromptNameFromMode} from './helpers/aiTutorHelper';
import {
  acceptRejectJsonSchema,
  formatExplanationResponse,
  copyCodeJsonSchema,
  formatAcceptRejectResponse,
  getMergedAiTutorCodeWithSource,
} from './helpers/aiTutorStructuredResponseHelper';
import ShareView from './layout/ShareView';
import VerticalLayout from './layout/VerticalLayout';
import {setAiFilePathToPreview, setViewMode} from './redux';
import {Weblab2LevelProperties, ViewMode} from './types';

import moduleStyles from './styles/weblab2-view.module.scss';

const aiTutorHelper = new AiTutorWebLab2ContextHelper();

const weblab2LangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
  js: javascript(),
  md: markdown(),
};

const defaultConfig: ConfigType = {
  languageMapping: weblab2LangMapping,
  editableFileTypes: WEBLAB2_EDITABLE_FILE_TYPES,
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

  const logLevelActivity = useLevelActivityMetrics(levelProperties);

  const source = useAppSelector(
    state =>
      state.lab2Project.projectSources?.source as MultiFileSource | undefined
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

  const aiTutorResponseSchemaSettings: ResponseSchemaSettings | undefined =
    useMemo(() => {
      if (
        experiments.isEnabledAllowingQueryString(
          experiments.WEBLAB2_ACCEPT_REJECT
        ) &&
        ['produce', 'designer'].includes(levelProperties.aiTutorMode || '')
      ) {
        return {
          jsonSchema: acceptRejectJsonSchema,
          responseCallback: (response: string) => {
            const jsonResponse = JSON.parse(response);
            console.log('AI Tutor response (in jsonSchema callback):', {
              jsonResponse,
            });
            const formattedResponse = formatAcceptRejectResponse(jsonResponse);
            console.log('formattedResponse', formattedResponse);
            dispatch(setViewingAiTutorVersion(true));
            // When viewing AI Tutor version, store current sources as projectSourceBeforeAiTutorVersion.
            // Workspace will be read-only until user clicks "accept" or "reject".

            // TODO:
            // If user clicks "reject", go back to projectSourceBeforeAiTutorVersion.
            // If user clicks "accept":
            // - force save a version for projectSourceBeforeAiTutorVersion.
            // - force save an AI version for AI tutor version with description 'AI Save'.
            // - Workspace is now editable.
            const aiTutorVersionFiles: ProjectFile[] = [];
            const mergedSourceVersion = getMergedAiTutorCodeWithSource(
              formattedResponse.code,
              source as MultiFileSource,
              aiTutorVersionFiles
            ) as MultiFileSource;
            console.log('mergedSourceVersion', mergedSourceVersion);
            console.log('source', source);
            console.log('aiTutorVersionFiles', aiTutorVersionFiles);
            dispatch(setProjectSourceBeforeAiTutorVersion(source));
            // Set the preview to first AI-updated html file, if it exists.
            const firstAiUpdatedHtmlFile = aiTutorVersionFiles.find(
              file => file.language === 'html'
            );
            if (firstAiUpdatedHtmlFile) {
              firstAiUpdatedHtmlFile.active = true;
              mergedSourceVersion.openFiles = [firstAiUpdatedHtmlFile.id];
              const folderPath = getFolderPath(
                firstAiUpdatedHtmlFile.folderId,
                mergedSourceVersion.folders
              ).substring(1);
              const filePath =
                folderPath === ''
                  ? firstAiUpdatedHtmlFile.name
                  : folderPath + '/' + firstAiUpdatedHtmlFile.name;
              dispatch(setAiFilePathToPreview(filePath));
            } else {
              if (aiTutorVersionFiles.length > 0) {
                aiTutorVersionFiles[0].active = true;
                mergedSourceVersion.openFiles = [aiTutorVersionFiles[0].id];
              } else {
                const firstFileId = Object.keys(mergedSourceVersion.files)[0];
                mergedSourceVersion.files[firstFileId].active = true;
                mergedSourceVersion.openFiles = [firstFileId];
              }
            }
            dispatch(setSource(mergedSourceVersion));
            return formattedResponse.explanation;
          },
        };
      } else {
        return {
          jsonSchema: copyCodeJsonSchema,
          responseCallback: (response: string) => {
            const jsonResponse = JSON.parse(response);
            console.log('🤖: Tutor response (in jsonSchema callback):', {
              jsonResponse,
            });
            return formatExplanationResponse(jsonResponse.answer);
          },
        };
      }
    }, [levelProperties.aiTutorMode, dispatch, source]);

  return (
    <div className={moduleStyles.weblab2Container}>
      {hasSource && (
        <Codebridge
          config={config}
          setConfig={setConfig}
          startSources={startSources}
          levelProperties={levelProperties}
          hiddenContextCallback={aiTutorHelper.getHiddenContextCallback()}
          aiTutorMultimodalEnabled={true}
          aiTutorChatButtonData={[]}
          aiTutorContextHelper={aiTutorHelper}
          aiTutorSystemPromptName={getPromptNameFromMode(
            levelProperties.aiTutorMode
          )}
          aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
        />
      )}
    </div>
  );
};

export default Weblab2View;
