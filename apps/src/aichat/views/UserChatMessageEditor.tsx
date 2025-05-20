import React, {useCallback, useEffect, useRef} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectMultimodalEnabled, submitChatContents} from '../redux';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent<{
  editorContainerClassName?: string;
}> = ({editorContainerClassName}) => {
  const isWaitingForChatResponse = useAppSelector(
    state => !!state.aichat.chatMessagePending
  );

  const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);
  const multimodalEnabled = useAppSelector(selectMultimodalEnabled);
  const chatAssets = useAppSelector(state =>
    state.aichat.stagedFiles.map(file => file.asset)
  );
  const uploadsPending = useAppSelector(state =>
    state.aichat.stagedFiles.some(file => file.status === 'uploading')
  );

  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (userMessage: string) => {
      if (!isWaitingForChatResponse) {
        dispatch(
          submitChatContents({
            text: userMessage,
            assets:
              multimodalEnabled && chatAssets.length > 0
                ? chatAssets
                : undefined,
          })
        );
      }
    },
    [isWaitingForChatResponse, multimodalEnabled, chatAssets, dispatch]
  );

  const disabled = isWaitingForChatResponse || saveInProgress || uploadsPending;

  useEffect(() => {
    if (!disabled) {
      // Return focus to user input textarea after user submits chat message and response displayed
      // or after user updates model customizations.
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <UserMessageEditor
      onSubmit={handleSubmit}
      disabled={disabled}
      editorContainerClassName={editorContainerClassName}
      ref={inputRef}
    />
  );
};

export default UserChatMessageEditor;
