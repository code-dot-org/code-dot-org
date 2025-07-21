import Button from '@code-dot-org/component-library/button';
import {Handle, NodeProps, NodeResizer, Position} from '@xyflow/react';
import React, {memo, useCallback} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

import {useInputTexts} from '../../../flow/flowNodes';

import styles from './ResultNode.module.scss';
// This node simply displays any text sent to its input handle.

function ResultNode({selected, width}: NodeProps) {
  const resultTexts = useInputTexts();
  const combinedResultTexts = resultTexts.join('\n');

  const text = resultTexts.map((resultText, index) => (
    <SafeMarkdown
      key={index}
      openExternalLinksInNewTab
      markdown={resultText}
      className="resultnode-markdown"
    />
  ));

  const onCopyToClipboard = useCallback(() => {
    copyToClipboard(combinedResultTexts);
  }, [combinedResultTexts]);

  return (
    <div
      className="nowheel"
      style={{
        width: '100%',
        height: '100%',
        minWidth: 200,
        minHeight: 100,
        maxWidth: 378,
        maxHeight: 378,
        display: 'flex',
        flexDirection: 'column',
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
      <Handle type="target" position={Position.Left} />
      <div>Result</div>
      <div
        style={{
          overflowWrap: 'break-word',
          overflowY: 'scroll',
          height: 'calc(100% - 45px)',
          maxWidth: '100%',
          marginBottom: 10,
        }}
      >
        {text || ''}
      </div>
      {combinedResultTexts.length > 0 && (
        <div className={styles.copyToClipboardContainer}>
          <Button
            size="xs"
            color="gray"
            type="secondary"
            text="Copy to clipboard"
            onClick={onCopyToClipboard}
            className={styles.copytoClipboardButton}
          />
        </div>
      )}
    </div>
  );
}

export default memo(ResultNode);
