import Button from '@code-dot-org/component-library/button';
import classnames from 'classnames';
import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';

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
  children?: React.ReactNode;
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
      children,
    },
    externalInputRef
  ) => {
    const internalInputRef = useRef<HTMLTextAreaElement | null>(null);
    const [userMessage, setUserMessage] = useState<string>('');
    // Track focus state on textarea to apply focus styles to container since
    // :focus-visible doesn't work on divs and :has() is not supported in Firefox.
    const [focused, setFocused] = useState(false);

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
      if (!internalInputRef.current) {
        return;
      }

      internalInputRef.current.style.height = 'auto'; // Need to reset height before update.
      internalInputRef.current.style.height =
        internalInputRef.current.scrollHeight + 2 + 'px'; // Add a couple of pixels to avoid scrollbars.
    }, [userMessage]);

    const icon = {iconName: 'arrow-up'};

    return (
      <div
        className={classnames(
          moduleStyles.editorContainer,
          focused && moduleStyles.focused,
          editorContainerClassName
        )}
      >
        <textarea
          ref={node => {
            internalInputRef.current = node;

            if (
              typeof externalInputRef === 'object' &&
              externalInputRef !== null
            ) {
              externalInputRef.current = node;
            }
          }}
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
          rows={1}
          aria-label={commonI18n.aiUserMessagePlaceholder()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div className={moduleStyles.chatActionsContainer}>
          {children}
          <Button
            aria-label={commonI18n.submit()}
            id="uitest-chat-submit"
            isIconOnly={!showSubmitLabel}
            size="xs"
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
