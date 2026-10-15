import {LevelSpec, takesSuppliedCode} from '../types';

// Lab-specific fields are dropped only when the new lab type cannot use them.
export function mergeSpecPatch(
  prev: LevelSpec,
  patch: Partial<LevelSpec>
): LevelSpec {
  const next = {...prev, ...patch};
  if (patch.labType === undefined || patch.labType === prev.labType) {
    return next;
  }
  if (!takesSuppliedCode(next.labType)) delete next.suppliedCode;
  if (next.labType !== 'weblab2') delete next.templateGroup;
  return next;
}
