import {createUuid} from '@cdo/apps/utils';

import {
  BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES,
  ExistingLessonData,
  labTypeFromRailsType,
  LevelSpec,
  SerializedLevel,
  SerializedScriptLevel,
  SUPPORTED_LAB_TYPES,
} from '../types';

const newLevelSpec = (): LevelSpec => ({
  key: createUuid(),
  id: '',
  labType: SUPPORTED_LAB_TYPES[0],
  description: '',
  generate: true,
});

interface LessonLevelEntry {
  level: SerializedLevel;
  scriptLevel: SerializedScriptLevel;
  activityIndex: number;
  sectionIndex: number;
}

// Walk every level in the lesson in display order, yielding the level
// summary along with the activity/section it belongs to and the
// surrounding script_level (which we ship back verbatim on save).
function listLessonLevels(lesson: ExistingLessonData): LessonLevelEntry[] {
  const out: LessonLevelEntry[] = [];
  const activities = lesson.activities || [];
  for (let a = 0; a < activities.length; a++) {
    const sections = activities[a].activitySections || [];
    for (let s = 0; s < sections.length; s++) {
      const scriptLevels = sections[s].scriptLevels || [];
      for (const scriptLevel of scriptLevels) {
        // Each script_level can contain variant levels. The lesson edit
        // page treats the first level as the canonical one; mirror that.
        const level = (scriptLevel.levels || [])[0];
        if (!level) continue;
        out.push({level, scriptLevel, activityIndex: a, sectionIndex: s});
      }
    }
  }
  return out;
}

// Find the longest hyphen-bounded prefix shared by all level names. Used to
// split each existing level name into a prefix (shown in the prefix box at
// the top) and a short id (shown in the per-level row), so the user sees
// the same prefix/id breakdown they'd type by hand.
function inferPrefix(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) {
    const idx = names[0].lastIndexOf('-');
    return idx > 0 ? names[0].slice(0, idx) : '';
  }
  let prefix = names[0];
  for (let i = 1; i < names.length; i++) {
    while (!names[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return '';
    }
  }
  while (prefix.length > 0 && !prefix.endsWith('-')) {
    prefix = prefix.slice(0, -1);
  }
  return prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
}

export interface InitialState {
  prefix: string;
  specs: LevelSpec[];
}

export function buildInitialState(lesson: ExistingLessonData): InitialState {
  const entries = listLessonLevels(lesson);
  if (entries.length === 0) {
    return {prefix: '', specs: [newLevelSpec()]};
  }
  // Infer the shared prefix only from supported levels — unsupported
  // placeholders may have unrelated names (or names that share no prefix
  // with the supported ones) and would otherwise erode the inferred
  // prefix to the empty string.
  const supportedNames = entries
    .filter(e => labTypeFromRailsType(e.level.type) !== undefined)
    .map(e => e.level.name);
  const prefix = inferPrefix(supportedNames);
  const stripPrefix = (name: string) =>
    prefix && name.startsWith(prefix + '-')
      ? name.slice(prefix.length + 1)
      : name;
  const specs = entries.map(
    ({level, scriptLevel, activityIndex, sectionIndex}) => {
      const labType = labTypeFromRailsType(level.type);
      const description = level.generateOutline || '';
      const spec: LevelSpec = {
        key: createUuid(),
        id: stripPrefix(level.name),
        // Filler value when unsupported; the dropdown is hidden then.
        labType: labType ?? SUPPORTED_LAB_TYPES[0],
        description,
        lastGeneratedDescription: level.generateOutline
          ? level.generateOutline
          : undefined,
        generate: labType !== undefined && !level.generateOutline,
        existing: {activityIndex, sectionIndex, scriptLevel},
        unsupportedType: labType === undefined ? level.type : undefined,
      };
      if (labType === 'bubbleChoice' && Array.isArray(level.sublevels)) {
        const parentPrefix = level.name + '-';
        spec.sublevels = level.sublevels.map(sub => {
          const subLabType = labTypeFromRailsType(sub.type);
          // Restrict to the sublevel-allowed set. Sublevels whose Rails
          // type maps to a top-level LabType outside that set (e.g. an
          // older dance/spritelab sublevel) or doesn't map at all are
          // marked unsupported so the UI shows them read-only and the
          // generator skips them.
          const supportedSubLabType =
            subLabType &&
            (BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES as readonly string[]).includes(
              subLabType
            )
              ? subLabType
              : undefined;
          const subId = sub.name.startsWith(parentPrefix)
            ? sub.name.slice(parentPrefix.length)
            : sub.name;
          return {
            key: createUuid(),
            id: subId,
            labType: supportedSubLabType ?? BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES[0],
            description: sub.generateOutline || '',
            lastGeneratedDescription: sub.generateOutline || undefined,
            generate: supportedSubLabType !== undefined && !sub.generateOutline,
            unsupportedType:
              supportedSubLabType === undefined
                ? sub.type ?? '(unknown)'
                : undefined,
          };
        });
      }
      return spec;
    }
  );
  return {prefix, specs};
}

export {newLevelSpec};
