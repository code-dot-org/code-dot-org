import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {usePushSnapshot, useSketchLabReadOnly} from '../context';
import {REACT_FLOW_SELECTOR} from '../reactFlowSelectors';

interface UseInlineTextEditingOptions {
  /** Node id whose data field this editor writes back to. */
  id: string;
  /** Node data key holding the editable string (e.g. 'text' or 'label'). */
  field: string;
  /** Current committed value, used to seed edits. */
  value: string;
  /** When the node is locked, editing is suppressed. */
  locked?: boolean;
}

/**
 * Drives in-place contentEditable editing for a node's text field. Owns the
 * editing flag, focuses and selects the editable element on entry, commits to
 * node data on blur, ctrl/cmd+enter, or esc (pushing an undo snapshot only on real change).
 * Returns the ref to attach to the editable element plus
 * the handlers its consumers spread onto it.
 */
export function useInlineTextEditing({
  id,
  field,
  value,
  locked,
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
    if (!isEditing) {
      return;
    }
    setIsEditing(false);
    // innerText preserves visible newlines from Shift+Enter; textContent
    // would flatten them.
    const newValue = editableRef.current?.innerText ?? '';
    if (newValue !== valueAtEditStart.current) {
      pushSnapshot();
    }
    updateNodeData(id, {[field]: newValue});
  }, [isEditing, updateNodeData, id, field, pushSnapshot]);

  // Editing starts on double-click or keyboard Enter (which focuses the
  // editable), not on a plain mousedown. On a plain mousedown, send focus
  // to the node wrapper, as a click anywhere else on the node would.
  useEffect(() => {
    const editable = editableRef.current;
    if (!editable) {
      return;
    }
    const suppressFocusFromMouse = (event: MouseEvent) => {
      if (isEditing) {
        return;
      }
      event.preventDefault();
      editable
        .closest<HTMLElement>(REACT_FLOW_SELECTOR.node)
        ?.focus({preventScroll: true});
    };
    editable.addEventListener('mousedown', suppressFocusFromMouse);
    return () =>
      editable.removeEventListener('mousedown', suppressFocusFromMouse);
  }, [isEditing]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isEditing) {
        return;
      }
      const isCommitEnter =
        event.key === 'Enter' && (event.metaKey || event.ctrlKey);
      if (event.key === 'Escape' || isCommitEnter) {
        event.preventDefault();
        // Moving focus to the node blurs the editable, which commits via onBlur.
        editableRef.current
          ?.closest<HTMLElement>(REACT_FLOW_SELECTOR.node)
          ?.focus();
      }
    },
    [isEditing]
  );

  return {isEditing, editableRef, startEditing, commitEdit, handleKeyDown};
}
