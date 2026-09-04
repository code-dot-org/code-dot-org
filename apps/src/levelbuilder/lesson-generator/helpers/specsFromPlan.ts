import {createUuid} from '@cdo/apps/utils';

import {DEFAULT_AICHAT_PRESET} from '../ai/aichat';
import {OutlineLevel} from '../ai/outline';
import {LevelSpec} from '../types';

// A planned level from either source: the outline AI or the
// planning-document import (which adds suppliedCode).
export type PlannedLevel = OutlineLevel & {suppliedCode?: string};

// Turn AI-planned levels into fresh level cards. Each card (and each
// bubbleChoice sublevel) gets its own client key; aichat levels default
// to the standard preset when the AI omits one so the dropdown lands on
// something valid.
export function specsFromPlannedLevels(levels: PlannedLevel[]): LevelSpec[] {
  return levels.map(level => ({
    key: createUuid(),
    id: level.id,
    labType: level.labType,
    description: level.description,
    generate: true,
    ...(level.labType === 'aichat'
      ? {aichatPreset: level.aichatPreset ?? DEFAULT_AICHAT_PRESET}
      : {}),
    ...(level.labType === 'weblab2' && level.templateGroup
      ? {templateGroup: level.templateGroup}
      : {}),
    ...((level.labType === 'weblab2' || level.labType === 'pythonlab') &&
    level.suppliedCode
      ? {suppliedCode: level.suppliedCode}
      : {}),
    ...(level.labType === 'bubbleChoice' && level.sublevels
      ? {
          sublevels: level.sublevels.map(sub => ({
            key: createUuid(),
            id: sub.id,
            labType: sub.labType,
            description: sub.description,
            generate: true,
            ...(sub.labType === 'aichat'
              ? {aichatPreset: sub.aichatPreset ?? DEFAULT_AICHAT_PRESET}
              : {}),
          })),
        }
      : {}),
  }));
}
