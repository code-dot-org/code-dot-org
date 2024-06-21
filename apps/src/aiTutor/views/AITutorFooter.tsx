import React, {useState, useCallback} from 'react';
import style from './ai-tutor.module.scss';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {AITutorTypes as ActionType} from '@cdo/apps/aiTutor/types';

interface AITutorFooterProps {
  renderAITutor: boolean;
}

const AITutorFooter: React.FC<AITutorFooterProps> = ({renderAITutor}) => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const level = useAppSelector(state => state.aiTutor.level);

  const sources = useAppSelector(state => state.javalabEditor.sources);
  const fileMetadata = useAppSelector(
    state => state.javalabEditor.fileMetadata
  );
  const activeTabKey = useAppSelector(
    state => state.javalabEditor.activeTabKey
  );
  const studentCode = sources[fileMetadata[activeTabKey]].text;

  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(() => {
    if (isWaitingForChatResponse) {
      return;
    }

    const chatContext = {
      studentInput: userMessage,
      studentCode,
      actionType: ActionType.GENERAL_CHAT,
    };

    dispatch(askAITutor(chatContext));
    setUserMessage('');

    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_ASK_GENERAL_CHAT, {
      levelId: level?.id,
      levelType: level?.type,
    });
  }, [userMessage, studentCode, isWaitingForChatResponse, level, dispatch]);

  const disabled = !renderAITutor || isWaitingForChatResponse;

  const userMessageIsEmpty = userMessage.trim() === '';

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userMessage.trim() !== '') {
      handleSubmit();
    }
  };

  return (
    <div className={style.aiTutorFooter}>
      <div className={style.aiTutorFooterInputArea}>
        <textarea
          className={style.textArea}
          // TODO: Update to support i18n
          placeholder={'Add a chat message...'}
          onChange={e => setUserMessage(e.target.value)}
          value={userMessage}
          disabled={disabled}
          onKeyDown={e => handleKeyPress(e)}
        />
        <Button
          className={style.submitButton}
          color={buttonColors.purple}
          disabled={disabled || userMessageIsEmpty}
          iconRight={{iconName: 'arrow-up', iconStyle: 'solid'}}
          size="s"
          key="submit"
          onClick={() => handleSubmit()}
          text="Submit"
        />
      </div>
    </div>
  );
};

export default AITutorFooter;
