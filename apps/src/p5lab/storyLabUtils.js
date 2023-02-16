import {APP_WIDTH} from './constants';

const OUTER_MARGIN = 50;
const LINE_HEIGHT = 50;

/**
 * Draw heading and subheading to canvas, if they exist.
 *
 * @param {P5} p5
 * @param {String} heading
 * @param {String} subheading
 */

export function drawHeadings(p5, text) {
  let yCursor = OUTER_MARGIN;
  if (text.heading) {
    const x = APP_WIDTH / 2;
    const y = yCursor;
    const size = getScaledFontSize(p5, text.heading, 50);
    drawLine(p5, text.heading, size, x, y);
    yCursor += LINE_HEIGHT / 2;
  }
  if (text.subheading) {
    const x = APP_WIDTH / 2;
    const y = yCursor;
    const size = getScaledFontSize(p5, text.subheading, 16);
    drawLine(p5, text.subheading, size, x, y);
  }
}

function drawLine(p5, text, size, x, y) {
  p5.textAlign(p5.CENTER);
  p5.fill('black');
  p5.textSize(size);
  p5.text(text, x, y);
}

function getScaledFontSize(p5, text, desiredSize) {
  p5.push();
  p5.textSize(desiredSize);
  const fullWidth = p5.textWidth(text);
  const scaledSize = Math.min(
    desiredSize,
    (desiredSize * (APP_WIDTH - OUTER_MARGIN)) / fullWidth
  );
  const maxLineHeight = 30;

  p5.pop();
  return Math.min(scaledSize, maxLineHeight);
}
