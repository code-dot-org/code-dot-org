import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Position,
  Handle,
  useReactFlow,
  NodeResizer,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import React, {memo, useEffect, useState, ChangeEvent, useRef} from 'react';

import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types';
import {getAssetUrl} from '@cdo/apps/aichat/utils';
import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import askAi from '../../../flow/askAi';
import {useInputTexts} from '../../../flow/flowNodes';

import styles from './AiNode.module.scss';
export const ACCEPTED_FILE_TYPES = ['.jpg', '.jpeg', '.png', '.pdf'];

// This node asks the aichat service a question entered in its input field, and
// sends the response to its output handle as text.  It acepts optional context
// via any text sent to its input handle.  It makes a new request whenever
// shift-enter is pressed while its input has focus, and whenever its input
// context changes.

function AiNode({
  id,
  data,
  selected,
}: NodeProps<Node<{fieldText: string; askedText: string; selected: boolean}>>) {
  const {updateNodeData} = useReactFlow();
  const contextString = useInputTexts().join('\n');

  const [isWorking, setIsWorking] = useState(false);

  const channelId = useAppSelector(state => state.lab.channel?.id) || '';
  const currentLevelId = useAppSelector(state =>
    parseInt(state.progress.currentLevelId || '')
  );
  const scriptId = useAppSelector(state => state.progress.scriptId);

  const uploadedFiles = useRef<ChatAsset[]>([]);
  const [uploadedFileCount, setUploadedFileCount] = useState(0);

  const onUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    for (const file of files) {
      const asset = {filename: file.name, source: AssetSource.PROJECT};
      try {
        await HttpClient.put(getAssetUrl(asset, channelId), file);
        uploadedFiles.current.push(asset);
        setUploadedFileCount(uploadedFiles.current.length);
      } catch (error) {
        const status =
          error instanceof NetworkError && error.response.status === 413
            ? 'sizeLimitExceeded'
            : 'uploadFailed';
        console.log('Error uploading file:', file.name, status);
      }
    }
  };

  const [openFileInput, FileInput] = useHiddenFileInput(
    onUploadFiles,
    ACCEPTED_FILE_TYPES.join(','),
    true
  );

  const onDeviceUploadClick = (event: React.MouseEvent) => {
    openFileInput();
    event.stopPropagation();
  };

  useEffect(() => {
    (async () => {
      // Assume that asked text has just been set (in the case that
      // shift-enter was pressed), or the context changed so we're using the
      // last asked text.)  If there is none, then set the output to be empty.
      if (!data.askedText || data.askedText === '') {
        console.log('No text data available to ask chat');
        updateNodeData(id, {
          text: '',
        });
        return;
      }

      setIsWorking(true);

      const text: string =
        'Here is the context: \n' +
        contextString +
        '\nAnd here is the request: \n' +
        data.askedText;
      console.log('Ask chat:', text);

      const response = await askAi(
        text,
        currentLevelId,
        scriptId,
        channelId,
        uploadedFiles.current
      );
      console.log('Chat responded: ', response);

      const responseText =
        response && response.length > 1 ? response[1].chatMessageText : '';
      updateNodeData(id, {
        text: responseText,
      });

      setIsWorking(false);
    })();
  }, [
    channelId,
    contextString,
    currentLevelId,
    data.askedText,
    id,
    scriptId,
    updateNodeData,
  ]);

  // This doesn't use useCallback because a dependency on data.fieldText
  // would trigger an AI request every time the user types in the input field.
  const onEnter = () => {
    updateNodeData(id, {
      askedText: data.fieldText,
    });
  };

  return (
    <div
      className="nowheel"
      style={{
        width: '100%',
        height: '100%',
        minWidth: 200,
        minHeight: 100,
        maxWidth: 380,
        maxHeight: 380,
      }}
    >
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={220}
        minHeight={140}
        maxWidth={400}
        maxHeight={400}
      />

      <Handle
        type="target"
        position={Position.Left}
        /*isConnectable={connections.length === 0}*/
      />
      <div>
        AI {data.fieldText !== data.askedText && ' *'}
        {isWorking && (
          <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
        )}
      </div>

      <textarea
        onChange={evt => updateNodeData(id, {fieldText: evt.target.value})}
        onKeyDown={event => {
          if (event.key === 'Enter' && event.shiftKey) {
            onEnter();
            event.preventDefault();
          }
        }}
        value={data.fieldText}
        className="reactflow-textarea"
        rows={10}
      />
      <div className={styles.fileUploadContainer}>
        <Button
          size="xs"
          color="gray"
          type="secondary"
          text="Upload File"
          onClick={onDeviceUploadClick}
          className={styles.uploadButton}
        />
        <FileInput />
        {uploadedFileCount > 0 && (
          <span>
            {uploadedFileCount} file{uploadedFileCount > 1 ? 's' : ''} uploaded
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(AiNode);
