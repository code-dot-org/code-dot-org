import type {ImportedLevelCheckResult} from '../levels/importedLevelCheck.js';

const REASON_MAX = 200;

/**
 * The auto-narrate line the runner appends to a level-mutating tool's
 * result (Author Mode WOW plan §5 item 2 / §7 risk 6): one line, one
 * reason — never the full reasons list, never the grid — so a turn that
 * edits several levels doesn't pile up verdict payloads in context. The
 * agent is expected to relay this verdict honestly (simulated vs.
 * palette-only), not just report "done".
 */
export function oneLineCheckVerdict(result: ImportedLevelCheckResult): string {
  if (!result.ok) {
    return `check: FAILED (${result.mode}) — ${truncate(result.reasons[0] ?? 'unknown reason')}`;
  }
  return result.mode === 'palette'
    ? 'check: OK (palette only — full simulation not attempted)'
    : 'check: OK (simulated)';
}

function truncate(text: string): string {
  return text.length > REASON_MAX ? `${text.slice(0, REASON_MAX - 1)}…` : text;
}
