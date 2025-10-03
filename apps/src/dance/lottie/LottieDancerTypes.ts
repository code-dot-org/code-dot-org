// Minimal types for the subset of Lottie JSON we mutate. These are intentionally
// partial: we only model the fields this renderer reads/writes.

export type CanvasAnimConfig = {
  renderer: 'canvas';
  loop?: boolean;
  autoplay?: boolean;
  animationData: unknown;
  rendererSettings: {
    context: CanvasRenderingContext2D;
    clearCanvas?: boolean;
    preserveAspectRatio?: string;
  };
};

export type RGBA = [number, number, number, number];

type ColorKeyframe = {s: [number, number, number, number]};
// “Animatable color” node — can be a direct value or keyframed array.
export type LottieColorNode =
  | {a: 0; k: [number, number, number, number]; x?: unknown}
  | {a: 1; k: ColorKeyframe[]; x?: unknown};

export type LottieShapeFillOrStroke = {
  ty: 'fl' | 'st';
  nm?: string;
  c?: LottieColorNode;
};

export type LottieShapeGroup = {
  ty: 'gr';
  nm?: string;
  it?: Array<LottieShapeAny>;
};

export type LottieShapeAny =
  | LottieShapeGroup
  | LottieShapeFillOrStroke
  | Record<string, unknown>;

export type LottieLayerCommon = {
  nm?: string;
  ind?: number;
  hd?: boolean;
  ks?: {
    o?: {a: 0 | 1; k: number};
    r?: {a: 0 | 1; k: number};
    p?: {a: 0 | 1; k: [number, number, number]};
    a?: {a: 0 | 1; k: [number, number, number]};
    s?: {a: 0 | 1; k: [number, number, number]};
  };
  ip?: number;
  op?: number;
  st?: number;
  bm?: number;
  sr?: number;
  ao?: number;
};

type LottieLayerBase = {
  ddd?: number; // 0=2D, 1=3D
  ind?: number; // layer index
  nm?: string; // layer name
  ao?: number;
  ip?: number; // in point
  op?: number; // out point
  st?: number; // start time
  bm?: number; // blend mode
  hd?: boolean; // hidden
  sr?: number; // stretch ratio
  ks?: {
    o?: {a: 0 | 1; k: number};
    r?: {a: 0 | 1; k: number};
    p?: {a: 0 | 1; k: [number, number, number]};
    a?: {a: 0 | 1; k: [number, number, number]};
    s?: {a: 0 | 1; k: [number, number, number]};
  };
};

export type LottieImageLayer = LottieLayerBase & {
  ty: 2; // image layer
  refId: string;
  shapes?: Array<LottieShapeAny>;
};

export type LottieVectorLayer = LottieLayerBase & {
  ty: 4; // shape/vector
  shapes?: Array<LottieShapeAny>;
};

export type LottiePrecompLayer = LottieLayerBase & {
  ty: 0; // precomp
  refId?: string;
  shapes?: Array<LottieShapeAny>;
};

export type LottieLayer =
  | LottiePrecompLayer
  | LottieVectorLayer
  | LottieImageLayer;

export type LottieAssetImage = {
  id: string;
  w: number;
  h: number;
  u: string;
  p: string; // url or data url
  e?: 0 | 1; // 1 => embedded
};

export type LottieAssetPrecomp = {
  id: string;
  w?: number;
  h?: number;
  layers?: Array<LottieLayer>;
};

export type LottieJSON = {
  ip?: number;
  op?: number;
  w?: number;
  h?: number;
  layers?: Array<LottieLayer>;
  assets?: Array<LottieAssetImage | LottieAssetPrecomp>;
};

export type HeadImageInfo = {
  dataUrl: string;
  width: number;
  height: number;
};

export type Palette = {
  primary: RGBA | null;
  secondary: RGBA | null;
  tertiary: RGBA | null;
};

export type Canvas2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export type DanceMoves =
  | 'rest'
  | 'clap_high'
  | 'clown'
  | 'dab'
  | 'double_jam'
  | 'drop'
  | 'floss'
  | 'fresh'
  | 'kick'
  | 'roll'
  | 'this_or_that'
  | 'thriller'
  | 'xarmsside'
  | 'xarmsup'
  | 'xjump'
  | 'xclapside'
  | 'xheadhips'
  | 'xhighkick'
  | 'xbend'
  | 'xfever'
  | 'xhop'
  | 'xknee'
  | 'xkneel'
  | 'xole'
  | 'xslide';

export interface DancerMetadata {
  body_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  [k: string]: unknown;
}
