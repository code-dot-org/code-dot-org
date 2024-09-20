import React, {useCallback, useEffect, useRef} from 'react';

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

  const inputRef = useRef<HTMLDivElement | null>(null);

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
      // Return focus to user input textarea after user submits chat message and response displayed
      // or after user updates model customizations.
      inputRef.current?.querySelector('textarea')?.focus();
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
