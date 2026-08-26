/**
 * Temporary exemptions from the "this course requires AI chat tools" alerts.
 *
 * A course or unit is reported as requiring AI chat tools when it contains any
 * Aichat or Weblab2 level; see Level.with_essential_ai_chat_tools in
 * dashboard/app/models/levels/level.rb. CS Discoveries 2026 trips that rule
 * because Unit 2 was rebuilt in Web Lab 2, but the CSD curriculum never asks
 * students to use AI Tutor, so teachers should not be told the course requires
 * AI chat tools to complete.
 *
 * This is a bandaid. The fix is for a level to be able to declare that its AI
 * Tutor is optional, so the dependency the backend reports is correct for every
 * consumer, not just these two alerts.
 *
 * To revert: delete this file and the two conditions that call it, in
 * CourseOverview and UnitOverview.
 */

/** Unit group and unit names, as they appear in a /courses or /s URL. */
const EXEMPT_COURSE_AND_UNIT_NAMES = ['csd-2026', 'csd2-2026'];

/**
 * True when any of the given unit group or unit names is exempt. Undefined
 * names are ignored: a standalone unit has no unit group name, for instance.
 */
export default function isExemptFromAiChatToolsAlert(
  ...names: (string | undefined | null)[]
): boolean {
  return names.some(
    name => !!name && EXEMPT_COURSE_AND_UNIT_NAMES.includes(name)
  );
}
