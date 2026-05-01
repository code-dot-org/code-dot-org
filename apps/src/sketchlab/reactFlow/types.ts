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

export type NodeDataBase = {
  showHandles?: boolean;
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
};

export type TextNodeData = NodeDataBase & {
  text: string;
  fontColor?: string;
  fontSize?: FontSizeValue;
};

export type ImageNodeData = NodeDataBase & {
  src: string;
  altText: string;
};

export type LineAnchorNodeData = {
  lineAnchorRole: 'source' | 'target';
  // TODO: this is not used yet, but is included for ease of typing.
  locked?: boolean;
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
