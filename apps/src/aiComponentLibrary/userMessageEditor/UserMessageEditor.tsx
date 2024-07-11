import React, {useState, useCallback, useMemo} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './user-message-editor.module.scss';

/**
 * Renders the user message editor component.
 */

export interface UserMessageEditorProps {
  onSubmit: (userMessage: string) => void;
  disabled: boolean;
  showSubmitLabel?: boolean;
}

const UserMessageEditor: React.FunctionComponent<UserMessageEditorProps> = ({
  onSubmit,
  disabled,
  showSubmitLabel = false,
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

  const icon = {iconName: 'paper-plane'};
  return (
    <div className={moduleStyles.editorContainer}>
      <textarea
        className={moduleStyles.textArea}
        placeholder={commonI18n.aiUserMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
        disabled={disabled}
        onKeyDown={e => handleKeyPress(e, userMessage)}
      />

      <div className={moduleStyles.centerSingleItemContainer}>
        <Button
          isIconOnly={!showSubmitLabel}
          onClick={() => handleSubmit(userMessage)}
          disabled={disabled || !userMessage || userMessageIsEmpty}
          text={showSubmitLabel ? commonI18n.submit() : undefined}
          {...{[showSubmitLabel ? 'iconLeft' : 'icon']: icon}}
        />
      </div>
    </div>
  );
};

export default UserMessageEditor;
