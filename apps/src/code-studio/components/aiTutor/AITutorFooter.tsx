import React, {useState, useCallback} from 'react';
import {
  AichatState,
  submitChatMessage,
} from '@cdo/apps/aichat/redux/aichatRedux';
import style from './ai-tutor.module.scss';
import Button from '@cdo/apps/templates/Button';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {useSelector} from 'react-redux';

interface AITutorFooterProps {}

const AITutorFooter: React.FC<AITutorFooterProps> = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useSelector(
    (state: {aichat: AichatState}) => state.aichat.isWaitingForChatResponse
  );

  const dispatch = useAppDispatch();
  const handleSubmit = useCallback(() => {
    if (!isWaitingForChatResponse) {
      dispatch(submitChatMessage(userMessage));
      setUserMessage('');
    }
  }, [userMessage, dispatch, isWaitingForChatResponse]);

  return (
    <div className={style.aiTutorFooter}>
      <textarea
        className={style.textArea}
        // TODO: Update to support i18n
        placeholder={'Add a chat message...'}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />
      <div className={style.submitToStudentButtonAndError}>
        <Button
          id="ui-submitChatButton"
          icon="arrow-up"
          text={'Submit'}
          color={Button.ButtonColor.brandSecondaryDefault}
          onClick={handleSubmit}
          className={style.submitToStudentButton}
          disabled={isWaitingForChatResponse}
        />
        {/*TODO: Add error handling*/}
      </div>
    </div>
  );
};

export default AITutorFooter;
