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
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const disabled = isWaitingForChatResponse || saveInProgress || uploadsPending;

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
          })
        );
      }
    },
    [
      disabled,
      dispatch,
      hiddenContextCallback,
      multimodalAvailable,
      chatAssets,
      modelParameters,
      clientType,
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
      {chatButtons && (
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
      />
    </>
  );
};

export default UserChatMessageEditor;
