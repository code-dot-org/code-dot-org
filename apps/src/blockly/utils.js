export const INFINITE_LOOP_TRAP =
  '  executionInfo.checkTimeout(); if (executionInfo.isTerminated()){return;}\n';

const LOOP_HIGHLIGHT = 'loopHighlight();\n';
const LOOP_HIGHLIGHT_RE = new RegExp(
  LOOP_HIGHLIGHT.replace(/\(.*\)/, '\\(.*\\)') + '\\s*',
  'g'
);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract the user's code as raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
export function strip(code) {
  return (
    code
      // Strip out serial numbers.
      .replace(/(,\s*)?'block_id_\d+'\)/g, ')')
      // Remove timeouts.
      .replace(new RegExp(escapeRegExp(INFINITE_LOOP_TRAP), 'g'), '')
      // Strip out loop highlight
      .replace(LOOP_HIGHLIGHT_RE, '')
      // Strip out class namespaces.
      .replace(/(StudioApp|Maze|Turtle)\./g, '')
      // Strip out particular helper functions.
      .replace(/^function (colour_random)[\s\S]*?^}/gm, '')
      // Collapse consecutive blank lines.
      .replace(/\n\n+/gm, '\n\n')
      // Trim.
      .replace(/^\s+|\s+$/g, '')
  );
}
