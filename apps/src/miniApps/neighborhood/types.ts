export interface NeighborhoodSignal {
  // TODO: improve value type, it should be the values of NeighborhoodSignalType
  value: string;
  detail?: {
    id: number;
    color?: string;
    direction?: string;
    x?: string;
    y?: string;
  };
}
