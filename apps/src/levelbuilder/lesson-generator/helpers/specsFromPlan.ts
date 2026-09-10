import {DEFAULT_AICHAT_PRESET} from '../ai/aichat';
import {OutlineLevel, OutlineSublevel} from '../ai/outline';
import {LevelSpec} from '../types';

import {newLevelSpec} from './buildInitialState';

// Blank starter rows (the untouched "Add level" placeholder) make way for
// planned cards; anything typed in, existing, or unsupported stays.
export function appendPlannedSpecs(
  prev: LevelSpec[],
  planned: LevelSpec[]
): LevelSpec[] {
  const kept = prev.filter(
    s =>
      s.existing ||
      s.unsupportedType ||
      s.id.trim() ||
      s.description.trim() ||
      s.suppliedCode?.trim()
  );
  return [...kept, ...planned];
}

const toSpec = (level: OutlineSublevel): LevelSpec => ({
  ...newLevelSpec(),
  id: level.id,
  labType: level.labType,
  description: level.description,
  ...(level.labType === 'aichat'
    ? {aichatPreset: level.aichatPreset ?? DEFAULT_AICHAT_PRESET}
    : {}),
});

export function specsFromPlannedLevels(levels: OutlineLevel[]): LevelSpec[] {
  return levels.map(level => ({
    ...toSpec(level),
    ...(level.labType === 'weblab2' && level.templateGroup
      ? {templateGroup: level.templateGroup}
      : {}),
    ...(level.labType === 'bubbleChoice' && level.sublevels
      ? {sublevels: level.sublevels.map(toSpec)}
      : {}),
  }));
}
