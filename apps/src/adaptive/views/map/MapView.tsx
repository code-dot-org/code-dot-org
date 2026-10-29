import React from 'react';

import {CheckpointStatusMap} from '../../progress';
import {Pathway} from '../../types';

import DestinationsMap from './DestinationsMap';
import {MapSettings} from './mapSettings';
import TreeMap from './TreeMap';

/** What every map layout takes. */
export interface MapProps {
  pathway: Pathway;
  statusMap: CheckpointStatusMap;
  /** Checkpoint the map is zoomed onto, if any. */
  focusId?: string;
  onSelect: (id: string) => void;
  /** IDs to compute a tour-zoom centroid from; active only during the tour. */
  tourFocusIds?: string[];
}

interface MapViewProps extends MapProps {
  settings: MapSettings;
}

/** The pathway's map, drawn by whichever layout the settings ask for. */
const MapView: React.FunctionComponent<MapViewProps> = ({settings, ...props}) =>
  settings.layout === 'destinations' ? (
    <DestinationsMap {...props} turns={settings.turns} />
  ) : (
    <TreeMap {...props} />
  );

export default MapView;
