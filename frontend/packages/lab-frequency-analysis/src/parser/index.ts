import {FrequencyLevelData, FrequencyMessageData} from '../types';

/**
 * Parses a level config to produce the level data we need to supply to
 * the level component.
 */
function load(config: {[key: string]: any}, _xml?: Element): FrequencyLevelData {
  return {
    mode: config.properties?.cipher || 'caesar',
    messages: JSON.parse(config.properties?.texts || '[]') as FrequencyMessageData[],
  };
}

export default load;
