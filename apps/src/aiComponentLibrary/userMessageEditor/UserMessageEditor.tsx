import Button from '@code-dot-org/component-library/button';
import classnames from 'classnames';
import React, {useState, useCallback, useMemo, useEffect} from 'react';

import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './user-message-editor.module.scss';

const MAX_MESSAGE_LENGTH = 10000;

/**
 * Renders the user message editor component.
 */

export interface UserMessageEditorProps {
  onSubmit: (userMessage: string) => void;
  disabled: boolean;
  showSubmitLabel?: boolean;
  /** Custom className for editor container */
  editorContainerClassName?: string;
  customPlaceholder?: string;
}

const UserMessageEditor = React.forwardRef<
  HTMLTextAreaElement,
  UserMessageEditorProps
>(
  (
    {
      onSubmit,
      disabled,
      editorContainerClassName,
      customPlaceholder,
      showSubmitLabel = false,
    },
    ref
  ) => {
    const [userMessage, setUserMessage] = useState<string>('');

    const userMessageIsEmpty = useMemo(() => {
      return userMessage.trim() === '';
    }, [userMessage]);

    const handleKeyPress = (e: React.KeyboardEvent, userMessage: string) => {
      if (e.key === 'Enter' && !e.shiftKey && userMessage.trim() !== '') {
        e.preventDefault(); // Prevent the text box from having just a blank line.
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

    useEffect(() => {
      if (typeof ref !== 'object' || ref === null) {
        return;
      }

      if (!ref.current) {
        return;
      }

      ref.current.style.height = 'auto'; // Reset height
      ref.current.style.height = ref.current.scrollHeight + 'px'; // Set to scroll height
    }, [ref, userMessage]);

    const icon = {iconName: 'paper-plane'};

    return (
      <div
        className={classnames(
          moduleStyles.editorContainer,
          editorContainerClassName
        )}
      >
        <textarea
          ref={ref}
          id="uitest-chat-textarea"
          className={moduleStyles.textArea}
          placeholder={
            customPlaceholder || commonI18n.aiUserMessagePlaceholder()
          }
          onChange={e => setUserMessage(e.target.value)}
          value={userMessage}
          disabled={disabled}
          onKeyDown={e => handleKeyPress(e, userMessage)}
          maxLength={MAX_MESSAGE_LENGTH}
        />

        <div className={moduleStyles.centerSingleItemContainer}>
          <Button
            aria-label={commonI18n.submit()}
            id="uitest-chat-submit"
            isIconOnly={!showSubmitLabel}
            onClick={() => handleSubmit(userMessage)}
            disabled={disabled || !userMessage || userMessageIsEmpty}
            text={showSubmitLabel ? commonI18n.submit() : undefined}
            {...{[showSubmitLabel ? 'iconLeft' : 'icon']: icon}}
          />
        </div>
      </div>
    );
  }
);

export default UserMessageEditor;
