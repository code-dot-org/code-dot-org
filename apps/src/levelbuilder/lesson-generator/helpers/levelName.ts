import {LevelSpec} from '../types';

export function prefixedName(prefix: string, id: string): string {
  return prefix ? `${prefix}-${id}` : id;
}

// An existing level regenerates in place under its own name; the prefix
// names only levels this page creates.
export function levelNameFor(spec: LevelSpec, prefix: string): string {
  return (
    spec.existing?.scriptLevel.levels[0]?.name ||
    prefixedName(prefix, spec.id.trim())
  );
}
