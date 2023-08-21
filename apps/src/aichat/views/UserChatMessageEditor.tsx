import React, {useState, useContext, useCallback} from 'react';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './userChatMessageEditor.module.scss';
import {ChatWorkspaceContext} from './ChatWorkspace';
import aichatI18n from '../locale';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {useSelector} from 'react-redux';
import {AichatLevelProperties} from '../types';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');
  const systemPrompt = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.systemPrompt
  );

  const onSubmit = useContext(ChatWorkspaceContext)?.onSubmit;
  const handleSubmit = useCallback(() => {
    const prompt = systemPrompt ? systemPrompt : '';
    onSubmit?.(userMessage, prompt);
    setUserMessage('');
  }, [onSubmit, userMessage, systemPrompt]);

  return (
    <div className={moduleStyles.UserChatMessageEditor}>
      <textarea
        className={moduleStyles.textArea}
        placeholder={aichatI18n.userChatMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />
      <Button
        key="submit"
        text="Submit"
        icon="arrow-up"
        onClick={() => handleSubmit()}
        color={Button.ButtonColor.brandSecondaryDefault}
      />
    </div>
  );
};

export default UserChatMessageEditor;
