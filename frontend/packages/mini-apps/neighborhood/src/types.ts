import {
  ConsoleSignalTypes,
  NeighborhoodSignalTypes,
  NeighborhoodExceptionTypes,
} from './constants';

export type ConsoleSignalType =
  (typeof ConsoleSignalTypes)[keyof typeof ConsoleSignalTypes];
export type NeighborhoodExceptionType =
  (typeof NeighborhoodExceptionTypes)[keyof typeof NeighborhoodExceptionTypes];
export type NeighborhoodSignalType =
  (typeof NeighborhoodSignalTypes)[keyof typeof NeighborhoodSignalTypes];

export interface NeighborhoodSignal {
  value: NeighborhoodSignalType;
  detail?: {
    id: number;
    color?: string;
    direction?: string;
    x?: string;
    y?: string;
    paint?: number;
  };
}

export interface ConsoleSignal {
  value: ConsoleSignalType;
  detail: string;
}
