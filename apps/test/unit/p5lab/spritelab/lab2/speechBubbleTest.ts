import {
  capHeight,
  layoutSpeechBubble,
  MARGIN,
  MAX_TEXT_LENGTH,
  RADIUS,
  TAIL_HEIGHT,
  TAIL_LEAD,
  wrapText,
} from '@cdo/apps/p5lab/spritelab/lab2/speechBubble';

// Half the size per character, like a plain sans-serif.
const measure = (text: string, size: number) => text.length * size * 0.5;

describe('wrapText', () => {
  it('breaks at spaces, and inside a word too wide to fit', () => {
    expect(wrapText(measure, 'We did it!', 20, 240)).toEqual(['We did it!']);
    expect(wrapText(measure, 'one two three four five six', 20, 100)).toEqual([
      'one two',
      'three four',
      'five six',
    ]);
    expect(wrapText(measure, 'abcdefghijklmnop', 20, 60)).toEqual([
      'abcdef',
      'ghijkl',
      'mnop',
    ]);
    expect(wrapText(measure, '', 20, 100)).toEqual(['']);
  });

  it('keeps a joined emoji whole when it breaks inside a word', () => {
    const family = '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}';
    expect(wrapText(measure, `ab${family}cd`, 20, 30)).toEqual([
      'ab',
      family,
      'cd',
    ]);
  });
});

describe('layoutSpeechBubble', () => {
  it('sits centered above a sprite, the tail straight-edged on its left and leading right', () => {
    const b = layoutSpeechBubble(measure, 'We did it!', 200, 300);
    expect(b.textSize).toBe(20);
    expect(b.lines).toEqual(['We did it!']);
    expect(b.x + b.width / 2).toBe(200);
    expect(b.y + b.height + TAIL_HEIGHT).toBe(300);
    expect(b.tail.tipX).toBe(200 + TAIL_LEAD);
    expect(b.tail.tipY).toBe(300);
    expect(b.tail.baseLeft).toBe(b.tail.tipX);
    expect(b.tail.baseRight).toBeGreaterThan(b.tail.tipX);
  });

  it('keeps inside the view by a margin, the tail sliding to the sprite', () => {
    const left = layoutSpeechBubble(measure, 'We did it!', 5, 300);
    expect(left.x).toBe(MARGIN);
    // The tip stops at the bottom edge's straight run.
    expect(left.tail.tipX).toBe(left.x + RADIUS);
    // The speaker far to the left: the tail's left edge stands straight.
    expect(left.tail.baseLeft).toBeCloseTo(left.tail.tipX);
    const right = layoutSpeechBubble(measure, 'We did it!', 395, 300);
    expect(right.x + right.width).toBe(400 - MARGIN);
    expect(right.tail.tipX).toBe(right.x + right.width - RADIUS);
    expect(right.tail.baseRight).toBeCloseTo(right.tail.tipX);
    // A speaker inside the run keeps the tip just right of itself.
    expect(layoutSpeechBubble(measure, 'We did it!', 20, 300).tail.tipX).toBe(
      20 + TAIL_LEAD
    );
  });

  it('keeps inside the part of the world the camera shows', () => {
    const view = {x: 200, y: 200, width: 200, height: 200};
    const b = layoutSpeechBubble(measure, 'We did it!', 215, 300, view);
    expect(b.x).toBe(view.x + MARGIN);
    const low = layoutSpeechBubble(measure, 'Hi', 300, 900, view);
    expect(low.y + low.height).toBe(view.y + view.height - MARGIN);
    // The tail stops just past the bubble rather than following a sprite
    // that has fallen out of view.
    expect(low.tail.tipY).toBe(low.y + low.height + 1);
  });

  it('lays the box out in whole pixels', () => {
    const b = layoutSpeechBubble(measure, 'Odd', 200.4, 300.6);
    [b.x, b.y, b.width, b.height, b.tail.tipX, b.tail.tipY].forEach(n =>
      expect(Number.isInteger(n)).toBe(true)
    );
    expect(b.paddingY).toBe(10);
  });

  it('mirrors the tail once the bubble is pushed left of the speaker', () => {
    const b = layoutSpeechBubble(
      measure,
      'A fairly long line of talk',
      330,
      300
    );
    expect(b.x + b.width).toBe(400 - MARGIN);
    expect(b.tail.tipX).toBe(330 - TAIL_LEAD);
    expect(b.tail.baseRight).toBe(b.tail.tipX);
    expect(b.tail.baseLeft).toBeLessThan(b.tail.tipX);
  });

  it('stays under the top edge, the tail shortened to a sprite come up into it', () => {
    const b = layoutSpeechBubble(measure, 'Hi', 200, 10);
    expect(b.y).toBe(MARGIN);
    expect(b.tail.tipY).toBe(b.y + b.height + 1);
  });

  it('steps the text down in size as it wraps to more lines, and cuts it off', () => {
    const short = layoutSpeechBubble(measure, 'Twelve words of text', 200, 300);
    expect(short.textSize).toBe(20);
    const medium = layoutSpeechBubble(
      measure,
      'A longer sentence that needs more than two lines to say at twenty',
      200,
      300
    );
    expect(medium.textSize).toBe(16);
    expect(medium.lines.length).toBeLessThanOrEqual(4);
    const long = layoutSpeechBubble(measure, 'word '.repeat(60), 200, 300);
    expect(long.textSize).toBe(13);
    expect(long.lines.join(' ').length).toBeLessThanOrEqual(MAX_TEXT_LENGTH);
    expect(long.lines[long.lines.length - 1].endsWith('...')).toBe(true);
  });
});

describe('capHeight', () => {
  it('measures a capital from the canvas, once per font and size', () => {
    const measureText = jest.fn(() => ({actualBoundingBoxAscent: 14.2}));
    const p5 = {drawingContext: {measureText}};
    expect(capHeight(p5, 'Geist', 20)).toBe(14.2);
    expect(capHeight(p5, 'Geist', 20)).toBe(14.2);
    expect(measureText).toHaveBeenCalledTimes(1);
  });

  it('falls back to a share of the size where the canvas has no metric', () => {
    const p5 = {drawingContext: {measureText: () => ({})}};
    expect(capHeight(p5, 'Nothing', 20)).toBe(14);
    expect(capHeight({}, 'Nothing', 10)).toBe(7);
  });
});
