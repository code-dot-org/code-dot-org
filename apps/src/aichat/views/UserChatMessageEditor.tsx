import {Button} from '@code-dot-org/component-library/button';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useDropzone} from 'react-dropzone';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {queryParams} from '@cdo/apps/code-studio/utils';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {submitChatContents} from '../redux';
import {UploadAssetResponse} from '../types';

import moduleStyles from './chatWorkspace.module.scss';

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

  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (userMessage: string) => {
      if (!isWaitingForChatResponse) {
        dispatch(submitChatContents({text: userMessage}));
      }
    },
    [isWaitingForChatResponse, dispatch]
  );

  const disabled = isWaitingForChatResponse || saveInProgress;

  useEffect(() => {
    if (!disabled) {
      // Return focus to user input textarea after user submits chat message and response displayed
      // or after user updates model customizations.
      inputRef.current?.focus();
    }
  }, [disabled]);

  const isChatGpt = useAppSelector(
    state =>
      state.aichat.currentAiCustomizations.selectedModelId ===
      AiChatModelIds.CHATGPT
  );
  const multimodalEnabled = isChatGpt && queryParams('multimodal') === 'true';
  if (multimodalEnabled) {
    return (
      <UploadButton inputRef={inputRef}>
        <UserMessageEditor
          onSubmit={handleSubmit}
          disabled={disabled}
          editorContainerClassName={editorContainerClassName}
          ref={inputRef}
        />
      </UploadButton>
    );
  }

  return (
    <UserMessageEditor
      onSubmit={handleSubmit}
      disabled={disabled}
      editorContainerClassName={editorContainerClassName}
      ref={inputRef}
    />
  );
};

const plusIcon: FontAwesomeV6IconProps = {
  iconName: 'plus',
};
const spinIcon: FontAwesomeV6IconProps = {
  iconName: 'spinner',
  animationType: 'spin',
};

/** Upload button for adding assets to current chat message. UI is not final (hidden behind URL param) */
interface UploadProps {
  inputRef: RefObject<HTMLTextAreaElement>;
  children: React.ReactNode;
}
const UploadButton: React.FC<UploadProps> = ({inputRef, children}) => {
  const dispatch = useAppDispatch();
  const currentChannelId = useAppSelector(state => state.lab.channel?.id);
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (currentChannelId) {
        setLoading(true);
        const assets: string[] = [];
        // Cap at 3 for now
        for (const file of acceptedFiles.slice(0, 3)) {
          const response = await HttpClient.put(
            `/v3/assets/${currentChannelId}/${file.name}`,
            file
          );
          const {filename} = (await response.json()) as UploadAssetResponse;
          assets.push(filename);
        }

        // Temp solution: grab the input value from the ref and submit when choosing assets.
        dispatch(
          submitChatContents({
            text: inputRef.current?.value || '',
            assets,
          })
        );
        setLoading(false);
      }
    },
    [currentChannelId, dispatch, inputRef]
  );
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
  });
  return (
    <div className={moduleStyles.messageEditorRow}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Button
          disabled={loading}
          isIconOnly={true}
          icon={loading ? spinIcon : plusIcon}
          size="m"
          type="secondary"
          color={isDragActive ? 'black' : 'gray'}
          onClick={() => {}}
        />
      </div>
      {children}
    </div>
  );
};

export default UserChatMessageEditor;
