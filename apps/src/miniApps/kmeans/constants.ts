export enum KMeansSignalType {
  ADD_POINT = 'ADD_POINT',
  READY = 'READY',
  DONE = 'DONE',
}

export const CLUSTER_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
];

export const UNASSIGNED_COLOR = '#cccccc';
export const CENTROID_SIZE = 12;
export const POINT_RADIUS = 6;

// Animation durations in ms
export const ASSIGN_ANIMATION_MS = 400;
export const CENTROID_MOVE_ANIMATION_MS = 500;
export const STEP_PAUSE_MS = 500;
export const MAX_ITERATIONS = 20;
export const SIGNAL_CHECK_TIME = 200;
