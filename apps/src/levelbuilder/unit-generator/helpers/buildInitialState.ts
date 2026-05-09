import {createUuid} from '@cdo/apps/utils';

import {ExistingUnitData, LessonSpec} from '../types';

export function buildInitialState(unit: ExistingUnitData): LessonSpec[] {
  const fromUnit = unit.lessons.map(l => ({
    reactKey: createUuid(),
    id: l.id,
    key: l.key,
    name: l.name,
    generateOutline: l.generateOutline ?? '',
    originalGenerateOutline: l.generateOutline ?? '',
    lessonEditPath: l.lessonEditPath,
    lessonGeneratePath: l.lessonGeneratePath,
    // No prompt on file means the lesson was created outside this tool
    // (or before we started saving prompts). The card surfaces a hint so
    // the user doesn't think it's a forgotten draft of theirs.
    createdSeparately: !l.generateOutline,
  }));
  // For a brand-new unit with no lessons yet, seed one blank card so the
  // user has somewhere to type without first hunting for "+ Add lesson".
  return fromUnit.length > 0 ? fromUnit : [newLessonSpec()];
}

export function newLessonSpec(): LessonSpec {
  return {
    reactKey: createUuid(),
    key: '',
    name: '',
    generateOutline: '',
  };
}

// Derive a kebab-case key from a display name. Used to auto-fill the key
// field on a new lesson card as the user types its name; the user can
// still override.
export function keyFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
