import type {Node} from '@xyflow/react';

import type {
  ProjectSources,
  SketchlabReactFlowSource,
} from '@cdo/apps/lab2/types';

import type {FontSizeValue} from './elementToolbars/toolbarPalettes';

export type ShapeType = 'rectangle' | 'triangle' | 'circle' | 'diamond';

export type ReactFlowSketchLabSources = ProjectSources & {
  source: SketchlabReactFlowSource;
};

// Typed runtime data shapes for each custom node.
// `rotation` is in degrees, integer, normalized 0-359. Optional so existing
// saved sources without the field load as 0.
export type ShapeNodeData = {
  shapeType: ShapeType;
  label: string;
  backgroundColor?: string;
  strokeColor?: string;
  fontColor?: string;
  fontSize?: FontSizeValue;
  showHandles?: boolean;
  rotation?: number;
};

export type TextNodeData = {
  text: string;
  fontColor?: string;
  fontSize?: FontSizeValue;
  showHandles?: boolean;
  rotation?: number;
};

export type ImageNodeData = {
  src: string;
  altText: string;
  showHandles?: boolean;
  rotation?: number;
};

export type LineAnchorNodeData = {
  lineAnchorRole: 'source' | 'target';
};

export type AddNodeRequest =
  | {type: 'shape'; data: ShapeNodeData}
  | {type: 'text'; data: TextNodeData}
  | {type: 'image'; data: ImageNodeData}
  | {type: 'line'};

export type ShapeNodeType = Node<ShapeNodeData, 'shape'>;
export type TextNodeType = Node<TextNodeData, 'text'>;
export type ImageNodeType = Node<ImageNodeData, 'image'>;
export type LineAnchorNodeType = Node<LineAnchorNodeData, 'lineAnchor'>;
export type SketchLabNode =
  | ShapeNodeType
  | TextNodeType
  | ImageNodeType
  | LineAnchorNodeType;
