import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import {usePushSnapshot, useSketchLabReadOnly} from '../context';

interface UseInlineTextEditingOptions {
  /** Node id whose data field this editor writes back to. */
  id: string;
  /** Node data key holding the editable string (e.g. 'text' or 'label'). */
  field: string;
  /** Current committed value, used to seed edits and revert on Escape. */
  value: string;
  /** When the node is locked, editing is suppressed. */
  locked?: boolean;
  /**
   * Read committed text from innerText (preserves visible newlines from
   * Shift+Enter) instead of textContent (which flattens them). Multi-line
   * editors want this; single-line labels do not.
   */
  preserveNewlines?: boolean;
}

/**
 * Drives in-place contentEditable editing for a node's text field. Owns the
 * editing flag, focuses and selects the editable element on entry, commits to
 * node data on blur (pushing an undo snapshot only on real change), and
 * reverts on Escape. Returns the ref to attach to the editable element plus
 * the handlers its consumers spread onto it.
 */
export function useInlineTextEditing({
  id,
  field,
  value,
  locked,
  preserveNewlines,
}: UseInlineTextEditingOptions) {
  const readOnly = useSketchLabReadOnly();
  const {updateNodeData} = useReactFlow();
  const pushSnapshot = usePushSnapshot();
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const valueAtEditStart = useRef<string>('');

  const startEditing = useCallback(() => {
    if (isEditing || readOnly || locked) {
      return;
    }
    valueAtEditStart.current = value;
    setIsEditing(true);
    setTimeout(() => {
      if (editableRef.current) {
        editableRef.current.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  }, [isEditing, readOnly, locked, value]);

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    const element = editableRef.current;
    const newValue =
      (preserveNewlines ? element?.innerText : element?.textContent) ?? '';
    if (newValue !== valueAtEditStart.current) {
      pushSnapshot();
    }
    updateNodeData(id, {[field]: newValue});
  }, [id, field, preserveNewlines, pushSnapshot, updateNodeData]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isEditing) {
        return;
      }
      if (event.key === 'Escape') {
        if (editableRef.current) {
          editableRef.current.textContent = value;
        }
        setIsEditing(false);
        editableRef.current?.closest<HTMLElement>('.react-flow__node')?.focus();
      }
    },
    [value, isEditing]
  );

  return {isEditing, editableRef, startEditing, commitEdit, handleKeyDown};
}
