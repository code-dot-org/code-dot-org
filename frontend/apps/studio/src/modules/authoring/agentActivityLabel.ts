// Maps a curriculum MCP tool's short name (ClaudeAgentRunner strips the
// mcp__curriculum__ prefix before emitting it — see describeToolUse) to a
// short present-progressive label for the chat sidebar's live activity
// trail. An unlisted tool falls back to its own name — technical, but
// still readable — rather than a generic "Working…" that hides what's
// actually happening.
const TOOL_LABELS: Record<string, string> = {
  get_curriculum: 'Reading curriculum',
  get_lesson: 'Reading lesson',
  create_course: 'Creating course',
  create_unit: 'Creating unit',
  create_lesson: 'Creating lesson',
  update_lesson: 'Updating lesson',
  insert_content: 'Adding content',
  update_content: 'Updating content',
  move_experience: 'Reordering activities',
  remove_experience: 'Removing activity',
  search_existing_levels: 'Searching levels',
  attach_existing_level: 'Attaching level',
  create_widget: 'Creating widget',
  create_level: 'Creating level',
  update_level: 'Updating level',
  update_level_instructions: 'Updating instructions',
  set_adaptive_policy: 'Setting tutor guidance',
  get_level: 'Reading level',
  check_level: 'Checking level',
};

/**
 * Turns one 'tool' agent-status event's `detail` (from describeToolUse:
 * "toolName" or "toolName: hint") into a short human-readable activity
 * line, e.g. "search_existing_levels: bee puzzle" -> "Searching levels —
 * bee puzzle".
 */
export function describeAgentTool(detail: string): string {
  const separatorIndex = detail.indexOf(': ');
  const toolName = separatorIndex === -1 ? detail : detail.slice(0, separatorIndex);
  const hint = separatorIndex === -1 ? undefined : detail.slice(separatorIndex + 2);
  const label = TOOL_LABELS[toolName] ?? toolName;
  return hint ? `${label} — ${hint}` : `${label}…`;
}
