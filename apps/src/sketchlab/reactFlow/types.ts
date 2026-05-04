import type {Node} from '@xyflow/react';

import type {
  ProjectSources,
  SketchlabReactFlowSource,
} from '@cdo/apps/lab2/types';

import type {
  FontSizeValue,
  TextAlignValue,
} from './elementToolbars/toolbarPalettes';

export type ShapeType = 'rectangle' | 'triangle' | 'circle' | 'diamond';

export type ReactFlowSketchLabSources = ProjectSources & {
  source: SketchlabReactFlowSource;
};

export type NodeDataBase = {
  showHandles?: boolean;
  // rotation is in degrees, normalized 0-359.
  rotation?: number;
  locked?: boolean;
};

// Typed runtime data shapes for each custom node.
export type ShapeNodeData = NodeDataBase & {
  shapeType: ShapeType;
  label: string;
  backgroundColor?: string;
  strokeColor?: string;
  fontColor?: string;
  fontSize?: FontSizeValue;
  textAlign?: TextAlignValue;
};

export type TextNodeData = NodeDataBase & {
  text: string;
  fontColor?: string;
  fontSize?: FontSizeValue;
  textAlign?: TextAlignValue;
};

export type ImageNodeData = NodeDataBase & {
  src: string;
  altText: string;
};

export type LineAnchorNodeData = NodeDataBase & {
  lineAnchorRole: 'source' | 'target';
};

export type AddNodeRequest =
  | {type: 'shape'; data: ShapeNodeData}
  | {type: 'text'; data: TextNodeData}
  | {type: 'image'; data: ImageNodeData}
  | {type: 'line'}
  | {type: 'arrow'};

export type ShapeNodeType = Node<ShapeNodeData, 'shape'>;
export type TextNodeType = Node<TextNodeData, 'text'>;
export type ImageNodeType = Node<ImageNodeData, 'image'>;
export type LineAnchorNodeType = Node<LineAnchorNodeData, 'lineAnchor'>;
export type SketchLabNode =
  | ShapeNodeType
  | TextNodeType
  | ImageNodeType
  | LineAnchorNodeType;
