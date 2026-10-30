import {
  contrastColor,
  MIN_FONT_SIZE,
  MIN_TEXT_WIDTH,
  resizeText,
  textStyleAttrs,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/canvasTextUtils';

describe('contrastColor', () => {
  it('pairs light colors with black and dark colors with white', () => {
    expect(contrastColor('#ffffff')).toBe('#000000');
    expect(contrastColor('#f2b807')).toBe('#000000');
    expect(contrastColor('#000000')).toBe('#ffffff');
    expect(contrastColor('#2b6cb0')).toBe('#ffffff');
  });
});

describe('textStyleAttrs', () => {
  const color = '#2b6cb0';
  const fontSize = 40;

  it('Normal fills the text with the color and leaves no box', () => {
    expect(textStyleAttrs('Normal', color, fontSize)).toEqual({
      text: {fill: color, padding: 10},
      tag: {},
    });
  });

  it('Outline strokes the colored text in the contrasting color', () => {
    const {text, tag} = textStyleAttrs('Outline', color, fontSize);
    expect(text).toMatchObject({
      fill: color,
      stroke: '#ffffff',
      fillAfterStrokeEnabled: true,
    });
    expect(text.strokeWidth).toBeCloseTo(4.8);
    expect(tag).toEqual({});
  });

  it('Fill puts contrasting text on a box of the color', () => {
    expect(textStyleAttrs('Fill', color, fontSize)).toEqual({
      text: {fill: '#ffffff', padding: 10},
      tag: {fill: color, cornerRadius: 10},
    });
  });

  it('Glow haloes the text in its own color', () => {
    const {text, tag} = textStyleAttrs('Glow', color, fontSize);
    expect(text).toMatchObject({
      fill: color,
      shadowColor: color,
      shadowBlur: 20,
      shadowOpacity: 1,
    });
    expect(tag).toEqual({});
  });
});

describe('resizeText', () => {
  const item = {width: 200, fontSize: 40};

  it('scales the font with the box on a corner drag', () => {
    expect(resizeText(item, 'bottom-right', 1.5)).toEqual({
      width: 300,
      fontSize: 60,
    });
  });

  it('only rewraps on a side drag', () => {
    expect(resizeText(item, 'middle-left', 0.5)).toEqual({
      width: 100,
      fontSize: 40,
    });
  });

  it('clamps a corner drag at the smallest font, keeping proportions', () => {
    const {width, fontSize} = resizeText(item, 'top-left', 0.1);
    expect(fontSize).toBe(MIN_FONT_SIZE);
    expect(width / fontSize).toBeCloseTo(item.width / item.fontSize);
  });

  it('clamps a side drag at the narrowest width', () => {
    expect(resizeText(item, 'middle-right', 0.01).width).toBe(MIN_TEXT_WIDTH);
  });
});
