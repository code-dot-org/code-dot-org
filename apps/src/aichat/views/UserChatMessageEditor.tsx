import React, {useState, useCallback} from 'react';
import Button from '@cdo/apps/componentLibrary/button/Button';
import moduleStyles from './userChatMessageEditor.module.scss';
import aichatI18n from '../locale';
import {submitChatContents} from '../redux/aichatRedux';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {useSelector} from 'react-redux';
import {CurrentUserState} from '@cdo/apps/templates/CurrentUserState';
import {ChatContext} from '../types';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useAppSelector(
    state => state.aichat.isWaitingForChatResponse
  );

  const userId: number = useSelector(
    (state: {currentUser: CurrentUserState}) => state.currentUser.userId
  );

  const {currentLevelId, scriptId} = useSelector(
    (state: {progress: ProgressState}) => state.progress
  );

  const channelId = useSelector(
    (state: {lab: LabState}) => state.lab.channel?.id
  );

  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(() => {
    if (!isWaitingForChatResponse) {
      const chatContents: ChatContext = {
        userMessage,
        userId,
        currentLevelId,
        scriptId,
        channelId,
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
    channelId,
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
