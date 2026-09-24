import React, {FC, RefObject, useRef} from 'react';
import {Label, Tag, Text, Transformer} from 'react-konva';

import {
  CanvasTextItem,
  resizeText,
  TEXT_FONT_FAMILY,
  TEXT_FONT_STYLE,
  textStyleAttrs,
} from './canvasTextUtils';

type LabelNode = React.ElementRef<typeof Label>;
type TextNode = React.ElementRef<typeof Text>;
type TagNode = React.ElementRef<typeof Tag>;
export type TransformerNode = React.ElementRef<typeof Transformer>;

interface CanvasTextProps {
  item: CanvasTextItem;
  editable: boolean;
  transformerRef: RefObject<TransformerNode>;
  onSelect: () => void;
  onChange: (changes: Partial<CanvasTextItem>) => void;
}

const CanvasText: FC<CanvasTextProps> = ({
  item,
  editable,
  transformerRef,
  onSelect,
  onChange,
}) => {
  const labelRef = useRef<LabelNode>(null);
  const {text: textAttrs, tag: tagAttrs} = textStyleAttrs(
    item.style,
    item.color,
    item.fontSize
  );

  // Convert the transformer's scale into width and font size so text reflows
  // instead of stretching. forceUpdate: it can't see changes inside a group.
  const handleTransform = () => {
    const label = labelRef.current;
    const transformer = transformerRef.current;
    if (!label || !transformer) return;

    const {width, fontSize} = resizeText(
      item,
      transformer.getActiveAnchor(),
      label.scaleX()
    );
    const styled = textStyleAttrs(item.style, item.color, fontSize);
    label.scale({x: 1, y: 1});
    label
      .findOne<TextNode>('Text')
      ?.setAttrs({...styled.text, width, fontSize});
    label.findOne<TagNode>('Tag')?.setAttrs(styled.tag);
    transformer.forceUpdate();

    onChange({x: label.x(), y: label.y(), width, fontSize});
  };

  return (
    <Label
      ref={labelRef}
      id={item.id}
      x={item.x}
      y={item.y}
      draggable={editable}
      onMouseDown={onSelect}
      onTouchStart={onSelect}
      onDragEnd={e => onChange({x: e.target.x(), y: e.target.y()})}
      onTransform={handleTransform}
    >
      <Tag {...tagAttrs} />
      <Text
        {...textAttrs}
        text={item.text}
        width={item.width}
        fontSize={item.fontSize}
        fontFamily={TEXT_FONT_FAMILY}
        fontStyle={TEXT_FONT_STYLE}
        align="center"
      />
    </Label>
  );
};

export default CanvasText;
