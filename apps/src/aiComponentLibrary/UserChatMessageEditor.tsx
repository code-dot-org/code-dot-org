import React, {useState, useCallback} from 'react';
import Button from '@cdo/apps/componentLibrary/button/Button';
import moduleStyles from '@cdo/apps/aichat/views/user-chat-message-editor.module.scss';
import i18n from '@cdo/locale';
import {submitChatContents} from '@cdo/apps/aichat/redux/aichatRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Renders the AI user chat message editor component.
 */

interface UserChatMessageEditorProps {
    isWaitingForChatResponse: boolean;
    saveInProgress: boolean;
    textInputDisabled: boolean;
    buttonDisabled: boolean;
    handleSubmit: () => void;
}
const UserChatMessageEditor: React.FunctionComponent<UserChatMessageEditorProps> = ({handleSubmit, isWaitingForChatResponse, saveInProgress}) => {
  const [userMessage, setUserMessage] = useState<string>('');

//   const isWaitingForChatResponse = useAppSelector(
//     state => state.aichat.isWaitingForChatResponse
//   );

//   const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);

//   const dispatch = useAppDispatch();

//   const handleSubmit = useCallback(() => {
//     if (!isWaitingForChatResponse) {
//       dispatch(submitChatContents(userMessage));
//       setUserMessage('');
//     }
//   }, [isWaitingForChatResponse, dispatch, userMessage]);

  return (
    <div className={moduleStyles.editorContainer}>
      <textarea
        className={moduleStyles.textArea}
        placeholder={i18n.aiUserChatMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
        disabled={isWaitingForChatResponse}
      />

      <div className={moduleStyles.centerSingleItemContainer}>
        <Button
          isIconOnly
          icon={{iconName: 'paper-plane'}}
          onClick={() => handleSubmit(userMessage)}
          disabled={isWaitingForChatResponse || !userMessage || saveInProgress}
        />
      </div>
    </div>
  );
};

export default UserChatMessageEditor;