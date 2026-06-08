import {SerializedActivity, SerializedScriptLevel} from '../types';

export interface Placement {
  scriptLevel: SerializedScriptLevel;
  // -1 means "place at the tail of the last activity section". Used for
  // brand-new levels that don't already live anywhere in the lesson.
  activityIndex: number;
  sectionIndex: number;
}

function blankSection(position: number) {
  return {
    position,
    name: '',
    description: '',
    duration: 0,
    remarks: '',
    progressionName: '',
    tips: [],
    scriptLevels: [],
  };
}

function blankActivity(position: number): SerializedActivity {
  return {
    position,
    name: '',
    duration: 0,
    activitySections: [blankSection(1)],
  };
}

// Rebuild the lesson's activities array from a fresh list of placements.
// We clone the original tree, empty every section's scriptLevels, then
// drop each placement back into its target section (or the last section
// for placements with index -1) in the order the caller provides. The
// server's update_activities pipeline diffs against the existing rows by
// id, so existing script_levels keep their ids and just get repositioned.
export function rebuildActivities(
  originalActivities: SerializedActivity[],
  placements: Placement[]
): SerializedActivity[] {
  const cloned: SerializedActivity[] = JSON.parse(
    JSON.stringify(originalActivities)
  );

  for (const a of cloned) {
    a.activitySections = a.activitySections || [];
    for (const s of a.activitySections) {
      s.scriptLevels = [];
    }
  }
  if (cloned.length === 0) cloned.push(blankActivity(1));
  const lastActivity = cloned[cloned.length - 1];
  if (lastActivity.activitySections.length === 0) {
    lastActivity.activitySections.push(blankSection(1));
  }
  const lastSection =
    lastActivity.activitySections[lastActivity.activitySections.length - 1];

  for (const p of placements) {
    let section = lastSection;
    if (p.activityIndex >= 0 && cloned[p.activityIndex]) {
      const sections = cloned[p.activityIndex].activitySections || [];
      section = sections[p.sectionIndex] || section;
    }
    section.scriptLevels.push({
      ...p.scriptLevel,
      activitySectionPosition: section.scriptLevels.length + 1,
    });
  }
  return cloned;
}
