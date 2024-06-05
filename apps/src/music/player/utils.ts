import {Effects} from './interfaces/Effects';

export function generateEffectsKeyString(effects: Effects) {
  const keyStrings: string[] = [];
  if (effects.filter === 'medium') {
    keyStrings.push('filter_medium');
  }
  if (effects.filter === 'low') {
    keyStrings.push('filter_low');
  }
  if (effects.delay === 'medium') {
    keyStrings.push('delay_medium');
  }
  if (effects.delay === 'low') {
    keyStrings.push('delay_low');
  }
  return keyStrings.join('-');
}
