import {type NodeProps} from '@xyflow/react';
import classNames from 'classnames';
import React, {memo, useMemo} from 'react';

import {
  DEFAULT_ROTATION,
  ELEMENT_BORDER_PX,
  MIN_NODE_WIDTH,
  MIN_TEXT_NODE_HEIGHT,
} from '../constants';
import {
  fontFamilyCss,
  fontSizePx,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_TEXT_BORDER_COLOR,
} from '../elementToolbars/toolbarPalettes';
import {useConnectionHandleVisibility} from '../hooks/useConnectionHandleVisibility';
import {useInlineTextEditing} from '../hooks/useInlineTextEditing';
import {useRotatedHandleInternals} from '../hooks/useRotatedHandleInternals';
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
  const strokeColor = data.strokeColor ?? DEFAULT_TEXT_BORDER_COLOR;
  const rotatableStyle: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {transform: `rotate(${rotation}deg)`};
    // Only a chosen color gets inline border styles; when clear, the
    // stylesheet's transparent border (and its hover highlight) stays active.
    if (strokeColor !== 'transparent') {
      style.borderColor = strokeColor;
      style.borderWidth = ELEMENT_BORDER_PX;
    }
    return style;
  }, [rotation, strokeColor]);
  useRotatedHandleInternals(rotation);

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
          minHeight={MIN_TEXT_NODE_HEIGHT}
        />

        <ConnectionHandles
          visible={showHandles}
          isConnectable={isConnectable}
        />
      </div>
    </div>
  );
}

export default memo(TextNode);
