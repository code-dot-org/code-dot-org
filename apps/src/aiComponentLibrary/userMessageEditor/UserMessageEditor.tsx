import React, {useState, useCallback, useMemo} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import i18n from '@cdo/locale';

import moduleStyles from './user-message-editor.module.scss';

/**
 * Renders the user message editor component.
 */

export interface UserMessageEditorProps {
  onSubmit: (userMessage: string) => void;
  disabled: boolean;
}

const UserMessageEditor: React.FunctionComponent<UserMessageEditorProps> = ({
  onSubmit,
  disabled,
}) => {
  const [userMessage, setUserMessage] = useState<string>('');

  const userMessageIsEmpty = useMemo(() => {
    return userMessage.trim() === '';
  }, [userMessage]);

  const handleKeyPress = (e: React.KeyboardEvent, userMessage: string) => {
    if (e.key === 'Enter' && userMessage.trim() !== '') {
      handleSubmit(userMessage);
    }
  };

  const handleSubmit = useCallback(
    (userMessage: string) => {
      onSubmit(userMessage);
      setUserMessage('');
    },
    [onSubmit]
  );

  return (
    <div className={moduleStyles.editorContainer}>
      <textarea
        className={moduleStyles.textArea}
        placeholder={i18n.aiUserMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
        disabled={disabled}
        onKeyDown={e => handleKeyPress(e, userMessage)}
      />

      <div className={moduleStyles.centerSingleItemContainer}>
        <Button
          isIconOnly
          icon={{iconName: 'paper-plane'}}
          onClick={() => handleSubmit(userMessage)}
          disabled={disabled || !userMessage || userMessageIsEmpty}
        />
      </div>
    </div>
  );
};

export default UserMessageEditor;
