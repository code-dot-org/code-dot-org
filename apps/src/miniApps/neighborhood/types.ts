import {NeighborhoodSignalType} from './constants';

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
