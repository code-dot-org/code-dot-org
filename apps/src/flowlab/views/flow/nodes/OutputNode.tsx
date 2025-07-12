import {Handle, Position} from '@xyflow/react';
import React, {memo} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {useInputTexts} from '../../../flow/flowNodes';

// This node simply displays any text sent to its input handle.

function OutputNode() {
  const outputTexts = useInputTexts();

  const text = outputTexts.map((outputText, index) => (
    <SafeMarkdown
      key={index}
      openExternalLinksInNewTab
      markdown={outputText}
      className="outputnode-markdown"
    />
  ));

  return (
    <div className="nowheel" style={{maxWidth: 140, width: '100%'}}>
      <Handle type="target" position={Position.Left} />
      <div>Output</div>
      <div
        style={{
          maxHeight: 200,
          overflowWrap: 'break-word',
          overflowY: 'scroll',
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default memo(OutputNode);
