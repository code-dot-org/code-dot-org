import React, {FC, useEffect, useState} from 'react';
import {Image as KonvaImage} from 'react-konva';

import {CanvasStickerItem} from './canvasTextUtils';

interface CanvasStickerProps {
  item: CanvasStickerItem;
  editable: boolean;
  onSelect: () => void;
  onChange: (changes: Partial<CanvasStickerItem>) => void;
}

const CanvasSticker: FC<CanvasStickerProps> = ({
  item,
  editable,
  onSelect,
  onChange,
}) => {
  const [image, setImage] = useState<HTMLImageElement>();

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = item.src;
  }, [item.src]);

  // Rendered before the image arrives so the transformer can attach to it.
  return (
    <KonvaImage
      id={item.id}
      image={image}
      x={item.x}
      y={item.y}
      width={item.size}
      height={item.size}
      rotation={item.rotation}
      draggable={editable}
      onMouseDown={onSelect}
      onTouchStart={onSelect}
      onDragEnd={e => onChange({x: e.target.x(), y: e.target.y()})}
      // Scale folded into size, so the SVG is redrawn rather than stretched
      onTransformEnd={e => {
        const node = e.target;
        const size = item.size * node.scaleX();
        node.setAttrs({scaleX: 1, scaleY: 1, width: size, height: size});
        onChange({x: node.x(), y: node.y(), size, rotation: node.rotation()});
      }}
    />
  );
};

export default CanvasSticker;
