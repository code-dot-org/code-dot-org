import {LevelContext} from '@cdo/apps/levelbuilder/curriculum-generator/ai/context';

import {LevelSpec, takesSuppliedCode} from '../types';

export type LevelContextBase = Omit<
  LevelContext,
  'levelName' | 'levelDescription' | 'suppliedCode'
>;

export function levelContextFor(
  spec: LevelSpec,
  levelName: string,
  base: LevelContextBase
): LevelContext {
  return {
    ...base,
    levelName,
    levelDescription: spec.description.trim(),
    suppliedCode: takesSuppliedCode(spec.labType)
      ? spec.suppliedCode?.trim() || undefined
      : undefined,
  };
}
