import {AiChatToolsAlertExemptCurriculumNames} from '@cdo/generated-scripts/sharedConstants';

/**
 * Temporary exemptions from the "this course requires AI chat tools" alerts.
 *
 * The list itself lives in lib/cdo/shared_constants.rb, since the alert that
 * fires on the teacher homepage is decided on the server, which has to read the
 * same names; see AI_CHAT_TOOLS_ALERT_EXEMPT_CURRICULUM_NAMES there for why any
 * name is on it.
 *
 * To revert: empty that list, then delete this file and the conditions that
 * call it, in CourseOverview, UnitOverview, and shouldShowAiChatEssentialAlert.
 */

/**
 * True when any of the given unit group or unit names is exempt. Undefined
 * names are ignored: a standalone unit has no unit group name, for instance.
 */
export default function isExemptFromAiChatToolsAlert(
  ...names: (string | undefined | null)[]
): boolean {
  const exempt = AiChatToolsAlertExemptCurriculumNames as readonly string[];
  return names.some(name => !!name && exempt.includes(name));
}
