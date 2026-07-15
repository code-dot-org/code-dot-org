export interface TextMeasurement {
  height: number;
  width: number;
}

export type TextMeasurer = (text: string, fontSize: number) => TextMeasurement;

export interface FittedText {
  fontSize: number;
  lineHeight: number;
  lines: string[];
  scale: number;
}

const ELLIPSIS = '…';

// Abuse guard, not a layout rule. Pango truncated once the wrapped block
// overflowed its 3x-height box, but the golden ellipsize fixture shows
// production wrapping a 113-char name in full — the client font (Noto Serif)
// is ~10% wider than the server's Nimbus Roman, so the same pixel cap would
// truncate names production renders whole. Whole names win: the width-gated
// shrink keeps any wrapped block inside the box, and only absurd-length
// input (roughly 150+ chars) hits this line cap and gets ellipsized.
const MAX_WRAPPED_LINES = 4;

function splitIntoGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    return Array.from(
      new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(text),
      segment => segment.segment,
    );
  }

  return Array.from(text);
}

function truncateWithEllipsis(
  text: string,
  maxWidth: number,
  fontSize: number,
  measureText: TextMeasurer,
): string {
  let truncated = '';

  for (const grapheme of splitIntoGraphemes(text)) {
    const candidate = `${truncated}${grapheme}${ELLIPSIS}`;
    if (measureText(candidate, fontSize).width > maxWidth) {
      break;
    }

    truncated += grapheme;
  }

  return `${truncated}${ELLIPSIS}`;
}

// Word-wraps at pango's layout width: 3x the target box (certificate_image.rb:78).
function wrapText({
  fontSize,
  maxWidth,
  measureText,
  text,
}: {
  fontSize: number;
  maxWidth: number;
  measureText: TextMeasurer;
  text: string;
}): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [''];
  }

  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (measureText(candidate, fontSize).width <= maxWidth) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    // An unbreakable token wider than the layout box on its own: ellipsize it standalone.
    currentLine =
      measureText(word, fontSize).width <= maxWidth
        ? word
        : truncateWithEllipsis(word, maxWidth, fontSize, measureText);
  });

  lines.push(currentLine);

  return lines;
}

export function fitCertificateText({
  boxHeight,
  boxWidth,
  fontSize,
  measureText,
  text,
}: {
  boxHeight: number;
  boxWidth: number;
  fontSize: number;
  measureText: TextMeasurer;
  text: string;
}): FittedText {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return {fontSize, lineHeight: 0, lines: [], scale: 1};
  }

  const maxWidth = boxWidth * 3;

  let lines = wrapText({fontSize, maxWidth, measureText, text: normalizedText});

  // Cut lines are always marked: never drop text with no visible indicator.
  if (lines.length > MAX_WRAPPED_LINES) {
    lines = lines.slice(0, MAX_WRAPPED_LINES);
    lines[MAX_WRAPPED_LINES - 1] = truncateWithEllipsis(
      lines[MAX_WRAPPED_LINES - 1],
      maxWidth,
      fontSize,
      measureText,
    );
  }

  const lineHeight = Math.max(
    ...lines.map(line => measureText(line, fontSize).height),
  );
  const blockHeight = lines.length * lineHeight;
  const blockWidth = Math.max(
    ...lines.map(line => measureText(line, fontSize).width),
  );

  // Width-gated proportional shrink, matching resize_to_fit! only firing
  // when the trimmed block is wider than the box (certificate_image.rb:87).
  const scale =
    blockWidth > boxWidth
      ? Math.min(boxWidth / blockWidth, boxHeight / blockHeight)
      : 1;

  return {
    fontSize: fontSize * scale,
    lineHeight: lineHeight * scale,
    lines,
    scale,
  };
}
