import {fitCertificateText, type TextMeasurer} from '../lib/fitting';

// Approximates real font metrics: character width and height scale with
// fontSize, matching how a real TextMetrics bounding box behaves.
function buildMeasurer(widthPerChar: number, heightRatio = 1.2): TextMeasurer {
  return (text, fontSize) => ({
    height: fontSize * heightRatio,
    width: Array.from(text).length * fontSize * widthPerChar,
  });
}

it('keeps short names at the template point size', () => {
  const fitted = fitCertificateText({
    boxHeight: 80,
    boxWidth: 900,
    fontSize: 68,
    measureText: buildMeasurer(0.45),
    text: 'Ada',
  });

  expect(fitted.lines).toEqual(['Ada']);
  expect(fitted.fontSize).toBe(68);
  expect(fitted.scale).toBe(1);
});

it('shrinks a name wider than the box but narrower than 3x the box, without wrapping', () => {
  const fitted = fitCertificateText({
    boxHeight: 80,
    boxWidth: 900,
    fontSize: 68,
    measureText: buildMeasurer(0.45),
    text: 'An Extremely Long Certificate Name',
  });

  expect(fitted.lines).toEqual(['An Extremely Long Certificate Name']);
  expect(fitted.scale).toBeLessThan(1);
  expect(fitted.fontSize).toBe(68 * fitted.scale);
});

it('wraps a name whose full width exceeds 3x the box', () => {
  const measureText = buildMeasurer(0.45);
  const fitted = fitCertificateText({
    boxHeight: 80,
    boxWidth: 900,
    fontSize: 68,
    measureText,
    text: 'An Extremely Long Certificate Name For Overflow Verification Testing Purposes And Additional Padding Words',
  });

  expect(fitted.lines.length).toBeGreaterThan(1);
  fitted.lines.forEach(line => {
    expect(measureText(line, 68).width).toBeLessThanOrEqual(900 * 3);
  });
});

it('wraps the golden 113-character name to two lines at box 900x80, pointsize 68', () => {
  const name =
    'Alexandria Catherine Montgomery the Third of the Intergalactic Science Fair and Computational Linguistics Society';
  const fitted = fitCertificateText({
    boxHeight: 80,
    boxWidth: 900,
    fontSize: 68,
    measureText: buildMeasurer(0.45),
    text: name,
  });

  expect(fitted.lines).toHaveLength(2);
  expect(fitted.lines.join(' ')).toBe(name);
  fitted.lines.forEach(line => expect(line.endsWith('…')).toBe(false));
});

it('ellipsizes a single unbreakable token wider than 3x the box', () => {
  const longToken = 'A'.repeat(200);
  const fitted = fitCertificateText({
    boxHeight: 80,
    boxWidth: 900,
    fontSize: 68,
    measureText: buildMeasurer(0.45),
    text: longToken,
  });

  expect(fitted.lines).toHaveLength(1);
  expect(fitted.lines[0].endsWith('…')).toBe(true);
  expect(fitted.lines[0].length).toBeLessThan(longToken.length);
});

it('wraps a name past the old height cap in full rather than ellipsizing (golden parity)', () => {
  // The golden ellipsize fixture shows production wrapping this length of
  // name whole; the client must never truncate what production renders.
  const name =
    'Alexandria Catherine Montgomery the Third of the Intergalactic Science Fair and Computational Linguistics Society Extended';
  const fitted = fitCertificateText({
    boxHeight: 40,
    boxWidth: 900,
    fontSize: 68,
    measureText: buildMeasurer(0.45),
    text: name,
  });

  expect(fitted.lines.join(' ')).toBe(name);
  fitted.lines.forEach(line => expect(line.endsWith('…')).toBe(false));
});

it('ellipsizes only past the wrapped-line guard, keeping every earlier word', () => {
  // ~470 chars -> more than MAX_WRAPPED_LINES lines at the 3x budget.
  const name = Array.from(
    {length: 40},
    (_, index) => `Wordnumber${index}`,
  ).join(' ');
  const fitted = fitCertificateText({
    boxHeight: 80,
    boxWidth: 900,
    fontSize: 68,
    measureText: buildMeasurer(0.45),
    text: name,
  });

  const rendered = fitted.lines.join(' ');
  expect(fitted.lines).toHaveLength(4);
  expect(fitted.lines.at(-1)?.endsWith('…')).toBe(true);
  // Every word up to the truncation point must survive; nothing is dropped
  // silently without the ellipsis marking the cut.
  expect(name.startsWith(rendered.replace(/…$/, '').trimEnd())).toBe(true);
});

it('does not shrink text for height alone when width already fits (width-gated)', () => {
  const fitted = fitCertificateText({
    boxHeight: 40,
    boxWidth: 1000,
    fontSize: 62,
    measureText: buildMeasurer(0.4, 1.5),
    text: 'Self-Paced Professional Learning',
  });

  expect(fitted.scale).toBe(1);
  expect(fitted.fontSize).toBe(62);
});

it('returns an empty payload for blank names', () => {
  expect(
    fitCertificateText({
      boxHeight: 80,
      boxWidth: 900,
      fontSize: 68,
      measureText: buildMeasurer(0.4),
      text: '   ',
    }),
  ).toEqual({
    fontSize: 68,
    lines: [],
    scale: 1,
  });
});
