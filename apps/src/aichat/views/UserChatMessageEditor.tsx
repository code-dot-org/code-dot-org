import React, {useCallback} from 'react';
import {submitChatContents} from '../redux/aichatRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent = () => {
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

  return (
    <>
      <UserMessageEditor onSubmit={handleSubmit} disabled={disabled} />
    </>
  );
};

export default UserChatMessageEditor;
