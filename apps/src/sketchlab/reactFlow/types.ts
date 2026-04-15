import {Edge, Node, Viewport} from '@xyflow/react';

import {ProjectSources} from '@cdo/apps/lab2/types';

export type ShapeType = 'rectangle' | 'triangle' | 'circle';

// Index signatures are required to satisfy @xyflow/react's
// `NodeData extends Record<string, unknown>` generic constraint.
export interface ShapeNodeData {
  shapeType: ShapeType;
  label: string;
  fillColor: string;
  [key: string]: unknown;
}

export interface ImageNodeData {
  // S3 URL, e.g. /v3/assets/{channelId}/{filename}
  src: string;
  altText: string;
  [key: string]: unknown;
}

export interface TextNodeData {
  text: string;
  [key: string]: unknown;
}

// Index signature makes this assignable to BlocklySource ({[key: string]: unknown})
// so it fits within the ProjectSources.source union type.
export interface ReactFlowSketchLabSource {
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
  [key: string]: unknown;
}

export interface ReactFlowSketchLabSources extends ProjectSources {
  source: ReactFlowSketchLabSource;
}
