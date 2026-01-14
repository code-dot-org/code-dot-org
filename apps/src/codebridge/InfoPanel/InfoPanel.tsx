import React, {useMemo} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  createNewFileThunk,
  saveFileThunk,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {
  setIsValidating,
  setHasValidated,
} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {logUserLevelInteraction} from '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {UserLevelInteractions} from '@cdo/generated-scripts/sharedConstants';

import {sendLab2AnalyticsEvent} from '../../lab2/utils/analyticsReporterHelper';
import {useCodebridgeContext} from '../codebridgeContext';
import CodebridgeRegistry from '../CodebridgeRegistry';
import {getSystemMessage} from '../Console/MessageHelpers';
import {DEFAULT_FOLDER_ID} from '../constants';
import {useCodebridgeSettings} from '../hooks/useCodebridgeSettings';
import {validateBackpackFileName} from '../utils';

import moduleStyles from './styles/info-panel.module.scss';
interface InfoPanelProps {
  style?: React.CSSProperties;
  className?: string;
}

export const InfoPanel: React.FunctionComponent<InfoPanelProps> = ({
  style,
  className,
}) => {
  const {
    levelProperties,
    onRun,
    onStop,
    AiTutorResponseView,
    hiddenContextCallback,
    startSources,
    aiTutorSystemPromptName,
    aiTutorMultimodalEnabled,
    aiTutorChatButtonData,
    aiTutorResponseSchemaSettings,
    config,
  } = useCodebridgeContext();

  const dispatch = useAppDispatch();
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  ) as MultiFileSource | undefined;
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const isValidating = useAppSelector(state => state.lab2System.isValidating);
  const hasEdited = useAppSelector(state => state.lab2Project.hasEdited);
  const hasLoadedEnvironment = useAppSelector(
    state => state.lab2System.loadedCodeEnvironment
  );
  console.log({supportedFileTypes: config.supportedFileTypes});

  const {appName, id: levelId} = levelProperties;
  const settings = useCodebridgeSettings();
  const backpackProps = useMemo(() => {
    const projectFiles = source?.files || {};
    return {
      validateFileName: (fileName: string) =>
        validateBackpackFileName(
          fileName,
          projectFiles,
          levelProperties.validationFile
        ),
      saveFileToProject: (fileId: string, contents: string, url?: string) =>
        dispatch(saveFileThunk({fileId, contents, url})),
      createNewProjectFile: (
        fileName: string,
        contents: string,
        url?: string
      ) => dispatch(createNewFileThunk({fileName, contents, url})),
      findIdForFileName: (fileName: string) =>
        Object.keys(projectFiles).find(
          id =>
            projectFiles[id].name === fileName &&
            projectFiles[id].folderId === DEFAULT_FOLDER_ID
        ),
      supportedFileTypes: config.supportedFileTypes,
    };
  }, [
    source?.files,
    config.supportedFileTypes,
    levelProperties.validationFile,
    dispatch,
  ]);

  const handleValidate = () => {
    if (onRun) {
      dispatch(setIsValidating(true));
      sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_VALIDATE_CLICK);
      logUserLevelInteraction({
        levelId: levelId,
        scriptId: scriptId,
        interaction: UserLevelInteractions.click_validate,
      });
      onRun(true, dispatch, source).finally(() =>
        dispatch(setIsValidating(false))
      );
      dispatch(setHasValidated(true));
    } else {
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage(
          getSystemMessage(codebridgeI18n.cannotTest(), appName)
        );
    }
  };

  const handleStopValidation = () => {
    if (onStop) {
      onStop();
      dispatch(setIsValidating(false));
    } else {
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage(
          getSystemMessage(codebridgeI18n.cannotStop(), appName)
        );
      dispatch(setIsValidating(false));
    }
  };

  return (
    <div style={style} className={className}>
      <ResourcePanel
        isRunning={isRunning}
        hasRun={hasRun}
        hasEdited={hasEdited}
        validationSettings={{
          onValidate: handleValidate,
          onStopValidation: handleStopValidation,
          isValidating,
          isValidateDisabled: !hasLoadedEnvironment || isRunning,
        }}
        AiTutorResponseView={AiTutorResponseView}
        className={moduleStyles.instructionsContainer}
        headerClassName={moduleStyles.infoPanelHeader}
        levelProperties={levelProperties}
        requireRun={appName === 'pythonlab'}
        hiddenContextCallback={hiddenContextCallback}
        settings={settings}
        versionHistoryProps={{startSources}}
        aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
        aiTutorChatButtonData={aiTutorChatButtonData}
        isValidationTourEnabled={appName === 'pythonlab'}
        isOnboardingTourEnabled={true}
        aiTutorSystemPromptName={aiTutorSystemPromptName}
        aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
        documentationUrl={
          appName === 'pythonlab' ? '/docs/ide/pythonlab' : undefined // For now, only python lab supports documentation.
        }
        backpackProps={backpackProps}
      />
    </div>
  );
};
