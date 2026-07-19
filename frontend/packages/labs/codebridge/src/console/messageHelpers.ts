// ANSI-formatted console system messages. Ported and trimmed from
// apps/src/codebridge/Console/MessageHelpers.ts — only the run timestamp banner
// is needed here (the test/validation run types are deferred).

// The banner is padded with '-' on both sides to this fixed width.
const TIMESTAMP_WIDTH = 32;

/** Wrap a message in an ANSI color code, resetting to the default afterward. */
function withColor(message: string, ansiColor: number) {
  return `\x1b[${ansiColor}m${message}\x1b[0m`;
}

/**
 * A gray, dash-padded "RUN AT hh:mm PM" banner written to the console when a
 * program starts, e.g. "---------RUN AT 02:51 PM---------". The date is a
 * parameter so callers (and tests) can supply a fixed time.
 */
export function getRunTimestampMessage(date: Date = new Date()) {
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const label = `RUN AT ${time}`;
  const leftPad = Math.max(Math.floor((TIMESTAMP_WIDTH - label.length) / 2), 0);
  const rightPad = Math.max(TIMESTAMP_WIDTH - label.length - leftPad, 0);
  const banner = '-'.repeat(leftPad) + label + '-'.repeat(rightPad);
  // 90 = "bright black" (gray); consoleThemes maps this to a light gray.
  return withColor(banner, 90);
}
