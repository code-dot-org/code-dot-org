import type {Node} from '@xyflow/react';

import {ProjectSources, SketchlabReactFlowSource} from '@cdo/apps/lab2/types';

import {FontSizeValue} from './nodes/nodeToolbars/toolbarPalettes';

export type ShapeType = 'rectangle' | 'triangle' | 'circle';

export type ReactFlowSketchLabSources = ProjectSources & {
  source: SketchlabReactFlowSource;
};

// Typed runtime data shapes for each custom node.
export type ShapeNodeData = {
  shapeType: ShapeType;
  label: string;
  backgroundColor?: string;
  strokeColor?: string;
  fontColor?: string;
  fontSize?: FontSizeValue;
  showHandles?: boolean;
};

export type TextNodeData = {
  text: string;
  fontColor?: string;
  fontSize?: FontSizeValue;
  showHandles?: boolean;
};

export type ImageNodeData = {
  src: string;
  altText: string;
  showHandles?: boolean;
};

export type ShapeNodeType = Node<ShapeNodeData, 'shape'>;
export type TextNodeType = Node<TextNodeData, 'text'>;
export type ImageNodeType = Node<ImageNodeData, 'image'>;

export type SketchLabNode = ShapeNodeType | TextNodeType | ImageNodeType;
