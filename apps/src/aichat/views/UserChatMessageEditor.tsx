import React, {useState, useCallback, useEffect} from 'react';
import Button from '@cdo/apps/componentLibrary/button/Button';
import moduleStyles from './userChatMessageEditor.module.scss';
import aichatI18n from '../locale';
import {
  AichatState,
  submitChatContents,
} from '../redux/aichatRedux';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import {} from '@cdo/apps/templates/currentUserRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {useSelector} from 'react-redux';
import {CurrentUserState} from '@cdo/apps/templates/CurrentUserState';
import {ChatContext} from '../types';
/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useSelector(
    (state: {aichat: AichatState}) => state.aichat.isWaitingForChatResponse
  );

  const userId: number = useSelector(
    (state: {currentUser: CurrentUserState}) => state.currentUser.userId
  );

  const currentLevelId: string | null = useSelector(
    (state: {progress: ProgressState}) => state.progress.currentLevelId
  );

  const scriptId: number | null = useSelector(
    (state: {progress: ProgressState}) => state.progress.scriptId
  );



  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(() => {
    if (!isWaitingForChatResponse) {
      const chatContents: ChatContext = {
        userMessage,
        userId,
        currentLevelId,
        scriptId,
      };
      dispatch(submitChatContents(chatContents));
      setUserMessage('');
    }
  }, [
    isWaitingForChatResponse,
    dispatch,
    userId,
    userMessage,
    currentLevelId,
    scriptId,
  ]);

  return (
    <div className={moduleStyles.editorContainer}>
      <textarea
        className={moduleStyles.textArea}
        placeholder={aichatI18n.userChatMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />

      <div className={moduleStyles.centerSingleItemContainer}>
        <Button
          isIconOnly
          icon={{iconName: 'paper-plane'}}
          onClick={handleSubmit}
          disabled={isWaitingForChatResponse}
        />
      </div>
    </div>
  );
};


export default UserChatMessageEditor;
