import {LevelSpec} from '../types';

export function prefixedName(prefix: string, id: string): string {
  return prefix ? `${prefix}-${id}` : id;
}

export function existingLevelName(spec: LevelSpec): string | undefined {
  return spec.existing?.scriptLevel.levels[0]?.name || spec.existingName;
}

// Existing levels keep their own name; the prefix names only new levels.
export function levelNameFor(spec: LevelSpec, prefix: string): string {
  return existingLevelName(spec) ?? prefixedName(prefix, spec.id.trim());
}

export function sublevelNameFor(sub: LevelSpec, parentName: string): string {
  return existingLevelName(sub) ?? `${parentName}-${sub.id.trim()}`;
}
