import {LabFrequencyAnalysisData, FrequencyMessageData} from '../types';

/**
 * Parses a level config to produce the level data we need to supply to
 * the level component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(config: {[key: string]: any}): LabFrequencyAnalysisData {
  return {
    mode: config.properties?.cipher || 'caesar',
    messages: JSON.parse(config.properties?.texts || '[]') as FrequencyMessageData[],
  };
}

export default load;
