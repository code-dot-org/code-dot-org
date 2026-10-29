import React from 'react';

import {CheckpointStatusMap} from '../../progress/model';
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
  /**
   * When set, the board fills the width at this multiple of that scale and
   * scrolls; otherwise it shrinks until it fits.
   */
  zoom?: number;
  /** Checkpoint a zoomed board first scrolls to the center of the view. */
  startId?: string;
  onSelect: (id: string) => void;
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
