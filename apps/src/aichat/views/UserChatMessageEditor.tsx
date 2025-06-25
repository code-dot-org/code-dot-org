import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useEffect, useRef} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectMultimodalEnabled, submitChatContents} from '../redux';

import moduleStyles from './UserChatMessageEditor.module.scss';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent<{
  editorContainerClassName?: string;
}> = ({editorContainerClassName}) => {
  const isWaitingForChatResponse = useAppSelector(
    state => !!state.aichat.chatMessagePending
  );

  const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);
  const multimodalEnabled = useAppSelector(selectMultimodalEnabled);
  const chatAssets = useAppSelector(state =>
    state.aichat.stagedFiles.map(file => file.asset)
  );
  const uploadsPending = useAppSelector(state =>
    state.aichat.stagedFiles.some(file => file.status === 'uploading')
  );
  const chatButtons = useAppSelector(state => state.aichat.chatButtons);
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userMessageExtra = useAppSelector(
    state => state.aichat.userMessageExtra
  );

  const handleSubmit = useCallback(
    (userMessage: string) => {
      if (!isWaitingForChatResponse) {
        dispatch(
          submitChatContents({
            text: userMessage,
            textExtra: userMessageExtra,
            assets:
              multimodalEnabled && chatAssets.length > 0
                ? chatAssets
                : undefined,
          })
        );
      }
    },
    [
      isWaitingForChatResponse,
      dispatch,
      userMessageExtra,
      multimodalEnabled,
      chatAssets,
    ]
  );

  const disabled = isWaitingForChatResponse || saveInProgress || uploadsPending;

  useEffect(() => {
    if (!disabled) {
      // Return focus to user input textarea after user submits chat message and response displayed
      // or after user updates model customizations.
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <>
      {chatButtons.length > 0 && (
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
