import {PanelData, LabPanelsData} from '../types';

/**
 * Parses a level config to produce the level data we need to supply to
 * the level component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(config: {[key: string]: any}): LabPanelsData {
  return {
    panels: (config.properties?.panels || []) as PanelData[],
  };
}

export default load;
