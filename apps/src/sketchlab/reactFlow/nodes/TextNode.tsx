import {type NodeProps} from '@xyflow/react';
import classNames from 'classnames';
import React, {memo, useMemo} from 'react';

import {DEFAULT_ROTATION, MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {
  fontFamilyCss,
  fontSizePx,
  DEFAULT_TEXT_ALIGN,
} from '../elementToolbars/toolbarPalettes';
import {useConnectionHandleVisibility} from '../hooks/useConnectionHandleVisibility';
import {useInlineTextEditing} from '../hooks/useInlineTextEditing';
import {REACT_FLOW_INTERACTION_CLASS} from '../reactFlowSelectors';
import {TextNodeType} from '../types';

import ConnectionHandles from './ConnectionHandles';
import RotatedNodeResizer from './RotatedNodeResizer';

import styles from './text-node.module.scss';

function TextNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<TextNodeType>) {
  const {showHandles, hoverHandlers} = useConnectionHandleVisibility(
    selected,
    isConnectable
  );
  const {text} = data;

  const {isEditing, editableRef, startEditing, commitEdit, handleKeyDown} =
    useInlineTextEditing({
      id,
      field: 'text',
      value: text,
      locked: data.locked,
    });

  const textStyle: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {};
    if (data.fontColor) {
      style.color = data.fontColor;
    }
    style.fontSize = fontSizePx(data.fontSize);
    style.fontFamily = fontFamilyCss(data.fontFamily);
    style.textAlign = data.textAlign ?? DEFAULT_TEXT_ALIGN;
    return style;
  }, [data.fontColor, data.fontSize, data.fontFamily, data.textAlign]);

  const rotation = data.rotation ?? DEFAULT_ROTATION;
  const rotatableStyle: React.CSSProperties = useMemo(
    () => ({transform: `rotate(${rotation}deg)`}),
    [rotation]
  );

  return (
    <div
      className={styles.textNode}
      aria-label={`Text: ${text}`}
      onDoubleClick={startEditing}
      {...hoverHandlers}
    >
      <div className={styles.rotatable} style={rotatableStyle}>
        <div
          ref={editableRef}
          className={classNames(
            styles.text,
            isEditing && REACT_FLOW_INTERACTION_CLASS.noDrag,
            isEditing && REACT_FLOW_INTERACTION_CLASS.noPan
          )}
          style={textStyle}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onFocus={startEditing}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="textbox"
          aria-multiline={true}
          aria-label={`Text content${isEditing ? ' (editing)' : ''}`}
        >
          {text}
        </div>

        <RotatedNodeResizer
          isVisible={selected && !data.locked}
          rotation={rotation}
          minWidth={MIN_NODE_WIDTH}
          minHeight={MIN_NODE_HEIGHT}
        />
      </div>

      <ConnectionHandles visible={showHandles} isConnectable={isConnectable} />
    </div>
  );
}

export default memo(TextNode);
