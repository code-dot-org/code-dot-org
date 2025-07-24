import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useEffect, useRef} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {submitChatContents} from '../redux';
import {AiChatClientType, ChatButton, ModelParameters} from '../types';

import moduleStyles from './UserChatMessageEditor.module.scss';

interface UserChatMessageEditorProps {
  modelParameters: ModelParameters;
  clientType: AiChatClientType;
  editorContainerClassName?: string;
  chatButtons?: ChatButton[];
  hiddenContext?: string;
  multimodalAvailable?: boolean;
}

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent<
  UserChatMessageEditorProps
> = ({
  modelParameters,
  clientType,
  editorContainerClassName,
  chatButtons,
  hiddenContext,
  multimodalAvailable,
}) => {
  const isWaitingForChatResponse = useAppSelector(
    state => !!state.aichat.chatMessagePending
  );

  const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);
  const chatAssets = useAppSelector(state =>
    state.aichat.stagedFiles.map(file => file.asset)
  );
  const uploadsPending = useAppSelector(state =>
    state.aichat.stagedFiles.some(file => file.status === 'uploading')
  );
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const disabled = isWaitingForChatResponse || saveInProgress || uploadsPending;

  const handleSubmit = useCallback(
    (userMessage: string) => {
      if (!disabled) {
        dispatch(
          submitChatContents({
            text: userMessage,
            modelParameters,
            clientType,
            hiddenContext,
            assets:
              multimodalAvailable && chatAssets.length > 0
                ? chatAssets
                : undefined,
          })
        );
      }
    },
    [
      disabled,
      dispatch,
      hiddenContext,
      multimodalAvailable,
      chatAssets,
      modelParameters,
      clientType,
    ]
  );

  useEffect(() => {
    if (!disabled) {
      // Return focus to user input textarea after user submits chat message and response displayed
      // or after user updates model customizations.
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <>
      {chatButtons && (
        <div className={moduleStyles.chatButtonsContainer}>
          {chatButtons.map(button => (
            <Button
              key={button.label}
              aria-label={button.label}
              id="button-hint"
              onClick={() => handleSubmit(button.value)}
              text={button.label}
              size="s"
              type="secondary"
              color="gray"
            />
          ))}
        </div>
      )}
      <UserMessageEditor
        onSubmit={handleSubmit}
        disabled={disabled}
        editorContainerClassName={editorContainerClassName}
        ref={inputRef}
      />
    </>
  );
};

export default UserChatMessageEditor;
