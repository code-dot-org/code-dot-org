import React, {useCallback, useEffect} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {submitChatContents} from '../redux/aichatRedux';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent<{
  editorContainerClassName?: string;
}> = ({editorContainerClassName}) => {
  const isWaitingForChatResponse = useAppSelector(
    state => state.aichat.isWaitingForChatResponse
  );

  const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);

  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(
    (userMessage: string) => {
      if (!isWaitingForChatResponse) {
        dispatch(submitChatContents(userMessage));
      }
    },
    [isWaitingForChatResponse, dispatch]
  );

  const disabled = isWaitingForChatResponse || saveInProgress;

  useEffect(() => {
    if (!disabled) {
      document.getElementById('uitest-chat-textarea')?.focus();
    }
  }, [disabled]);

  return (
    <UserMessageEditor
      onSubmit={handleSubmit}
      disabled={disabled}
      editorContainerClassName={editorContainerClassName}
    />
  );
};

export default UserChatMessageEditor;
