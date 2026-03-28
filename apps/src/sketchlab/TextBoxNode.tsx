import {Handle, Position, useReactFlow, type NodeProps} from '@xyflow/react';
import React, {useCallback, useState, useRef, useEffect, memo} from 'react';

import moduleStyles from './styles/sketchlab-view.module.scss';

const TextBoxNode: React.FC<NodeProps> = memo(({id, data, selected}) => {
  const {updateNodeData} = useReactFlow();
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const text = (data.text as string) || '';

  // Focus the textarea when entering edit mode
  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [editing]);

  const enterEditMode = useCallback(() => setEditing(true), []);

  const exitEditMode = useCallback(() => setEditing(false), []);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, {text: event.target.value});
    },
    [id, updateNodeData]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!editing && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault(); // prevent ReactFlow from handling space/enter
        enterEditMode();
      }
      if (editing && event.key === 'Escape') {
        exitEditMode();
      }
    },
    [editing, enterEditMode, exitEditMode]
  );

  const onTextareaKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Escape') {
        exitEditMode();
        event.stopPropagation();
      }
      // Allow normal Enter in textarea for newlines; stop propagation so
      // ReactFlow doesn't intercept it
      if (event.key === 'Enter') {
        event.stopPropagation();
      }
    },
    [exitEditMode]
  );

  return (
    <div
      className={`${moduleStyles.textBoxNode} ${
        selected ? moduleStyles.textBoxNodeSelected : ''
      }`}
      onDoubleClick={enterEditMode}
      onKeyDown={onKeyDown}
      tabIndex={-1}
      aria-label="Text box node, double-click or press Enter to edit"
    >
      <Handle type="target" position={Position.Top} />
      {editing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={onChange}
          onBlur={exitEditMode}
          onKeyDown={onTextareaKeyDown}
          placeholder="Type here..."
          className={moduleStyles.textBoxNodeTextarea}
        />
      ) : (
        <div className={moduleStyles.textBoxNodeDisplay}>
          {text || (
            <span className={moduleStyles.textBoxNodePlaceholder}>
              Double-click to edit
            </span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

TextBoxNode.displayName = 'TextBoxNode';

export default TextBoxNode;
