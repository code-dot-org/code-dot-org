import React, {useCallback, useEffect, useRef} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {submitChatContents} from '../redux';
import {
  AiChatClientType,
  ChatButtonAndKey,
  ModelParameters,
  AnalyticsProperties,
} from '../types';

import moduleStyles from './UserChatMessageEditor.module.scss';

interface UserChatMessageEditorProps {
  modelParameters: ModelParameters;
  clientType: AiChatClientType;
  editorContainerClassName?: string;
  chatButtons?: ChatButtonAndKey[];
  hiddenContextCallback?: () => Promise<string>;
  multimodalAvailable?: boolean;
  disabled?: boolean;
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
  disabled = false,
}) => {
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

  const chatDisabled =
    isWaitingForChatResponse || saveInProgress || uploadsPending || disabled;

  const handleSubmit = useCallback(
    async (userMessage: string, analyticsProperties?: AnalyticsProperties) => {
      if (!chatDisabled) {
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
          })
        );
      }
    },
    [
      chatDisabled,
      dispatch,
      hiddenContextCallback,
      modelParameters,
      clientType,
      multimodalAvailable,
      chatAssets,
      userAddedSelectionContext,
    ]
  );

  useEffect(() => {
    if (!chatDisabled) {
      // Return focus to user input textarea after user submits chat message and response displayed
      // or after user updates model customizations.
      inputRef.current?.focus();
    }
  }, [chatDisabled]);

  return (
    <>
      {chatButtons && !disabled && (
        <div className={moduleStyles.chatButtonsContainer}>
          {chatButtons.map(({ChatButton, key}) => (
            <ChatButton key={key} onClick={handleSubmit} />
          ))}
        </div>
      )}
      <UserMessageEditor
        onSubmit={handleSubmit}
        disabled={chatDisabled}
        editorContainerClassName={editorContainerClassName}
        ref={inputRef}
      />
    </>
  );
};

export default UserChatMessageEditor;
