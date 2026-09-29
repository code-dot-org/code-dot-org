// ANSI-formatted console system messages. Ported and trimmed from
// apps/src/codebridge/Console/MessageHelpers.ts.

// The banner is padded with '-' on both sides to this fixed width.
const TIMESTAMP_WIDTH = 32;

// The pixel box a rendered console image is displayed in.
const IMAGE_WIDTH = 600;
const IMAGE_HEIGHT = 600;

/**
 * Wrap a base64-encoded PNG in the iTerm2 inline-image escape sequence that
 * xterm's ImageAddon renders. Ported from MessageHelpers.getImageMessage — used
 * for matplotlib figures streamed from the pyodide worker.
 * See https://iterm2.com/documentation-images.html
 */
export function getImageMessage(base64Image: string) {
  const dataSize = atob(base64Image).length;
  return `\x1b]1337;File=inline=1;size=${dataSize};width=${IMAGE_WIDTH}px;height=${IMAGE_HEIGHT}px:${base64Image}\x1b\\`;
}

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
