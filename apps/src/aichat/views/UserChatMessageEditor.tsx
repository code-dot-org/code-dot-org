import {extension as mimeToExtension} from 'mime-types';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {type SpeechToTextAnalytics} from '@cdo/apps/aiComponentLibrary/userMessageEditor/speechToTextButton/SpeechToTextButton';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import AiTutorEnglishOnlyWarning from '@cdo/apps/aiTutor/views/AiTutorEnglishOnlyWarning';
import {isViewingAiTutorVersionFileUpdates} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import supportsClientApi from '../api/supportsClientApi';
import {
  selectIsWaitingForChatResponse,
  sendAnalytics,
  submitChatContents,
  uploadFiles,
} from '../redux';
import {
  AiChatClientType,
  ChatButtonAndKey,
  ModelParameters,
  AnalyticsProperties,
} from '../types';
import {getAllowedFileTypes} from '../utils';

import UploadButton, {UploadButtonProps} from './assets/UploadButton';

import moduleStyles from './UserChatMessageEditor.module.scss';

interface UserChatMessageEditorProps {
  modelParameters: ModelParameters;
  clientType: AiChatClientType;
  editorContainerClassName?: string;
  chatButtons?: ChatButtonAndKey[];
  hiddenContextCallback?: () => Promise<string>;
  multimodalAvailable?: boolean;
  responseCallback?: (response: string) => string;
  currentLevelId?: string | null;
  logLevelActivity?: () => void;

  lessonId?: number;

  /** UploadButton props */
  uploadDisabled?: UploadButtonProps['isDisabled'];
  levelName?: UploadButtonProps['levelName'];
  buildAssetUrl?: UploadButtonProps['buildAssetUrl'];
  hasStarterAssets?: UploadButtonProps['hasStarterAssets'];
  chatDisabled?: boolean;
}

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent<
  UserChatMessageEditorProps
> = ({
  modelParameters,
  clientType,
  editorContainerClassName,
  chatButtons,
  hiddenContextCallback,
  multimodalAvailable,
  responseCallback,
  currentLevelId,
  logLevelActivity,
  lessonId,
  levelName,
  hasStarterAssets,
  buildAssetUrl,
  uploadDisabled,
  chatDisabled,
}) => {
  const [userMessage, setUserMessage] = useState<string>('');
  const isWaitingForChatResponse = useAppSelector(
    selectIsWaitingForChatResponse
  );

  const viewingAiTutorVersionFileUpdates = useAppSelector(
    isViewingAiTutorVersionFileUpdates
  );

  // FIX!!!
  const saveInProgress = useAppSelector(
    state => state.aichatLab.saveInProgress
  );
  const chatAssets = useAppSelector(state =>
    state.aichat.stagedFiles.map(file => file.asset)
  );
  const uploadsPending = useAppSelector(state =>
    state.aichat.stagedFiles.some(file => file.status === 'uploading')
  );
  const userAddedSelectionContext = useAppSelector(
    state => state.aichat.userAddedSelectionContext
  );

  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const disabled =
    isWaitingForChatResponse ||
    saveInProgress ||
    uploadsPending ||
    viewingAiTutorVersionFileUpdates ||
    !!chatDisabled;

  const clearUserMessage = () => setUserMessage('');

  const handleSubmit = useCallback(
    async (message: string, analyticsProperties?: AnalyticsProperties) => {
      if (!disabled) {
        const hiddenContext = await hiddenContextCallback?.();
        dispatch(
          submitChatContents({
            text: message,
            modelParameters,
            clientType,
            hiddenContext,
            analyticsProperties,
            assets:
              multimodalAvailable && chatAssets.length > 0
                ? chatAssets
                : undefined,
            userAddedSelectionContext:
              Object.values(userAddedSelectionContext).length > 0
                ? Object.values(userAddedSelectionContext)
                : undefined,
            responseCallback,
            logLevelActivity,
            lessonId,
          })
        );
        clearUserMessage();
      }
    },
    [
      disabled,
      hiddenContextCallback,
      dispatch,
      modelParameters,
      clientType,
      multimodalAvailable,
      chatAssets,
      userAddedSelectionContext,
      responseCallback,
      logLevelActivity,
      lessonId,
    ]
  );

  useEffect(() => {
    clearUserMessage();
  }, [currentLevelId]);

  useEffect(() => {
    if (!disabled) {
      // Return focus to user input textarea after user submits chat message and response displayed
      // or after user updates model customizations.
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Speech to text is only enabled if the client API is supported for the current model
  // since it makes use of the AI Gateway.
  const speechToTextEnabled =
    supportsClientApi(modelParameters.selectedModelId) ||
    experiments.isEnabledAllowingQueryString('enable-speech-to-text');

  const acceptedFileTypes = getAllowedFileTypes(
    modelParameters.selectedModelId
  );

  const canUploadFiles =
    multimodalAvailable && buildAssetUrl && acceptedFileTypes.length > 0;

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!canUploadFiles) {
        return;
      }
      const files = Array.from(e.clipboardData.items)
        .filter(({type}) =>
          acceptedFileTypes.includes(`.${mimeToExtension(type) || ''}`)
        )
        .map(item => item.getAsFile())
        .filter(item => item !== null);
      dispatch(uploadFiles({files, buildAssetUrl}));
    },
    [canUploadFiles, buildAssetUrl, dispatch, acceptedFileTypes]
  );

  const onSpeechToTextFinished = useCallback(
    (analytics: SpeechToTextAnalytics) => {
      if (speechToTextEnabled) {
        dispatch(sendAnalytics(EVENTS.AICHAT_DICTATION_COMPLETED, analytics));
      }
    },
    [dispatch, speechToTextEnabled]
  );

  return (
    <>
      {chatButtons && chatButtons.length > 0 && !chatDisabled && (
        <div className={moduleStyles.chatButtonsContainer}>
          {chatButtons.map(({ChatButton, key}) => (
            <ChatButton key={key} onClick={handleSubmit} disabled={disabled} />
          ))}
        </div>
      )}
      <UserMessageEditor
        userMessage={userMessage}
        onChange={setUserMessage}
        onSubmit={handleSubmit}
        disabled={disabled}
        editorContainerClassName={editorContainerClassName}
        speechToTextEnabled={speechToTextEnabled}
        onSpeechToTextFinished={onSpeechToTextFinished}
        onPaste={onPaste}
        ref={inputRef}
      >
        {canUploadFiles && levelName && (
          <div className={moduleStyles.buttonRow}>
            <UploadButton
              isDisabled={!!uploadDisabled || disabled}
              levelName={levelName}
              hasStarterAssets={hasStarterAssets}
              buildAssetUrl={buildAssetUrl}
              acceptedFileTypes={acceptedFileTypes}
            />
          </div>
        )}
      </UserMessageEditor>
      <AiTutorEnglishOnlyWarning />
    </>
  );
};

export default UserChatMessageEditor;
