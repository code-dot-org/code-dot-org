import {KMeansSignalType} from './constants';

export interface KMeansSignal {
  value: KMeansSignalType;
  detail?: {
    x?: number;
    y?: number;
    id?: number;
    k?: number;
  };
}

export interface Point {
  id: number;
  x: number;
  y: number;
}

export interface Centroid {
  id: number;
  x: number;
  y: number;
}

export interface KMeansVisualizationState {
  points: Point[];
  centroids: Centroid[];
  assignments: Map<number, number>; // point_id -> cluster_id
  converged: boolean;
  iteration: number;
  isReady: boolean;
  isAnimating: boolean;
}

export interface KMeansCallbacks {
  setIsRunning: (isRunning: boolean) => void;
  onAddPoint: (point: Point) => void;
  onReady: (k: number) => void;
  onReset: () => void;
  onCentroidsInitialized: (centroids: Centroid[]) => void;
  onAssigned: (assignments: [number, number][]) => void;
  onCentroidsUpdated: (centroids: Centroid[]) => void;
  onConverged: () => void;
  onAnimationStart: () => void;
  onAnimationEnd: () => void;
}
