import {LevelProperty, updateLevelProperties} from '../levelApi';
import {LevelSpec, takesSuppliedCode} from '../types';

// True when the description or supplied code differs from the last save.
export function generatorInputsChanged(spec: LevelSpec): boolean {
  if (spec.lastGeneratedDescription === undefined) return true;
  if (spec.description.trim() !== spec.lastGeneratedDescription) return true;
  return (
    (spec.suppliedCode?.trim() ?? '') !== (spec.lastGeneratedSuppliedCode ?? '')
  );
}

// '' clears a stored value; Rails drops blank properties on save.  A blank
// this page never saw is not sent, so another author's code survives.
export function saveGeneratorPrompts(
  levelId: number,
  spec: LevelSpec
): Promise<void> {
  const properties: Partial<Record<LevelProperty, string>> = {
    generate_outline: spec.description.trim(),
  };
  if (takesSuppliedCode(spec.labType)) {
    const code = spec.suppliedCode?.trim() ?? '';
    if (code || spec.lastGeneratedSuppliedCode) {
      properties.generate_supplied_code = code;
    }
  }
  return updateLevelProperties(levelId, properties);
}
