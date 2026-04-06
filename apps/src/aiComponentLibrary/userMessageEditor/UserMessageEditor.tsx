import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classnames from 'classnames';
import React, {useState, useMemo, useEffect, useRef, useCallback} from 'react';

import {AnalyticsProperties} from '@cdo/apps/aichat/types';
import {commonI18n} from '@cdo/apps/types/locale';

import SpeechToTextButton from './speechToTextButton/SpeechToTextButton';

import moduleStyles from './user-message-editor.module.scss';

const MAX_MESSAGE_LENGTH = 10000;

/**
 * Renders the user message editor component.
 */

export interface UserMessageEditorProps {
  userMessage: string;
  onChange: (userMessage: string) => void;
  onSubmit: (
    userMessage: string,
    analyticsProperties?: AnalyticsProperties
  ) => void;
  disabled: boolean;
  showSubmitLabel?: boolean;
  /** Custom className for editor container */
  editorContainerClassName?: string;
  customPlaceholder?: string;
  speechToTextEnabled?: boolean;
  onPaste?: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  children?: React.ReactNode;
}

const EditorButtonIcon = () => <FontAwesomeV6Icon iconName="arrow-up" />;

const UserMessageEditor = React.forwardRef<
  HTMLTextAreaElement,
  UserMessageEditorProps
>(
  (
    {
      userMessage,
      onChange,
      onSubmit,
      disabled,
      editorContainerClassName,
      customPlaceholder,
      showSubmitLabel = false,
      speechToTextEnabled = false,
      onPaste,
      children,
    },
    externalInputRef
  ) => {
    const internalInputRef = useRef<HTMLTextAreaElement | null>(null);
    // Track focus state on textarea to apply focus styles to container since
    // :focus-visible doesn't work on divs and :has() is not supported in Firefox.
    const [focused, setFocused] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const userMessageIsEmpty = useMemo(() => {
      return userMessage.trim() === '';
    }, [userMessage]);

    const handleKeyPress = (e: React.KeyboardEvent, userMessage: string) => {
      if (e.key === 'Enter' && !e.shiftKey && userMessage.trim() !== '') {
        e.preventDefault(); // Prevent the text box from having just a blank line.
        submitMessage(userMessage);
      }
    };

    useEffect(() => {
      if (!internalInputRef.current) {
        return;
      }

      internalInputRef.current.style.height = 'auto'; // Need to reset height before update.
      internalInputRef.current.style.height =
        internalInputRef.current.scrollHeight + 2 + 'px'; // Add a couple of pixels to avoid scrollbars.
    }, [userMessage]);

    const editorButtonCommonProps = {
      variant: 'contained' as const,
      color: 'primary' as const,
      size: 'extraSmall' as const,
      disabled: disabled || !userMessage || userMessageIsEmpty || isRecording,
      id: 'uitest-chat-submit',
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        submitMessage(userMessage);
      },
      'aria-label': commonI18n.submit(),
      type: 'button' as const,
      component: 'button' as const,
    };

    const [speechToTextCount, setSpeechToTextCount] = useState(0);
    const [clearedMessageCount, setClearedMessageCount] = useState(0);
    /** True after the field becomes empty following STT use, until the next successful transcription. */
    const [lastDictationCleared, setLastDictationCleared] = useState(false);

    useEffect(() => {
      // Track how many times the message was cleared after using speech to text.
      if (speechToTextCount > 0 && !userMessage) {
        setClearedMessageCount(c => c + 1);
        setLastDictationCleared(true);
      }
    }, [speechToTextCount, userMessage]);

    const submitMessage = useCallback(
      (userMessage: string) => {
        onSubmit(userMessage, {
          dictationEnabled: speechToTextEnabled,
          dictationUsageCount: speechToTextCount,
          dictationMessageClearedCount: clearedMessageCount,
          dictationClearedSinceLastTranscription: lastDictationCleared,
        });
        setSpeechToTextCount(0);
        setClearedMessageCount(0);
        setLastDictationCleared(false);
      },
      [
        speechToTextCount,
        speechToTextEnabled,
        clearedMessageCount,
        lastDictationCleared,
        onSubmit,
      ]
    );

    return (
      <div
        className={classnames(
          moduleStyles.editorContainer,
          focused && moduleStyles.focused,
          editorContainerClassName
        )}
        onClick={() => internalInputRef.current?.focus()}
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
          onChange={e => onChange(e.target.value)}
          value={userMessage}
          disabled={disabled || isRecording}
          onKeyDown={e => handleKeyPress(e, userMessage)}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          aria-label={commonI18n.aiUserMessagePlaceholder()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={onPaste}
        />
        <div className={moduleStyles.chatActionsContainer}>
          {children}
          <div className={moduleStyles.actionButtons}>
            {speechToTextEnabled && (
              <SpeechToTextButton
                onTranscribed={text => {
                  onChange(`${userMessage ? userMessage + ' ' : ''}${text}`);
                  setIsRecording(false);
                  setSpeechToTextCount(c => c + 1);
                  setLastDictationCleared(false);
                }}
                onRecordStart={() => setIsRecording(true)}
                disabled={disabled}
              />
            )}
            {showSubmitLabel ? (
              <MuiButton
                {...editorButtonCommonProps}
                startIcon={<EditorButtonIcon />}
              >
                {commonI18n.submit()}
              </MuiButton>
            ) : (
              <MuiIconButton {...editorButtonCommonProps}>
                <EditorButtonIcon />
              </MuiIconButton>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default UserMessageEditor;
