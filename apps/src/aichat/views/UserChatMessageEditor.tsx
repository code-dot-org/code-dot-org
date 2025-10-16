import React, {useCallback, useEffect, useRef} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {submitChatContents} from '../redux';
import {
  AiChatClientType,
  ChatButtonAndKey,
  ModelParameters,
  AnalyticsProperties,
} from '../types';

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

  /** UploadButton props */
  uploadDisabled?: UploadButtonProps['isDisabled'];
  levelName?: UploadButtonProps['levelName'];
  buildAssetUrl?: UploadButtonProps['buildAssetUrl'];
  hasStarterAssets?: UploadButtonProps['hasStarterAssets'];
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
  levelName,
  hasStarterAssets,
  buildAssetUrl,
  uploadDisabled,
}) => {
  const {chatDisabled} = useAiChatDisabled();
  const isWaitingForChatResponse = useAppSelector(
    state => !!state.aichat.chatMessagePending
  );

  const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);
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
    chatDisabled;

  const handleSubmit = useCallback(
    async (userMessage: string, analyticsProperties?: AnalyticsProperties) => {
      if (!disabled) {
        const hiddenContext = await hiddenContextCallback?.();
        dispatch(
          submitChatContents({
            text: userMessage,
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
          })
        );
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
    ]
  );

  useEffect(() => {
    if (!disabled) {
      // Return focus to user input textarea after user submits chat message and response displayed
      // or after user updates model customizations.
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <>
      {chatButtons && !chatDisabled && (
        <div className={moduleStyles.chatButtonsContainer}>
          {chatButtons.map(({ChatButton, key}) => (
            <ChatButton key={key} onClick={handleSubmit} />
          ))}
        </div>
      )}
      <UserMessageEditor
        onSubmit={handleSubmit}
        disabled={disabled}
        editorContainerClassName={editorContainerClassName}
        ref={inputRef}
      >
        {multimodalAvailable && buildAssetUrl && levelName && (
          <div className={moduleStyles.buttonRow}>
            <UploadButton
              isDisabled={!!uploadDisabled || disabled}
              levelName={levelName}
              hasStarterAssets={hasStarterAssets}
              buildAssetUrl={buildAssetUrl}
            />
          </div>
        )}
      </UserMessageEditor>
    </>
  );
};

export default UserChatMessageEditor;
