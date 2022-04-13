import {APP_HEIGHT} from './constants';
import * as colors from '@cdo/apps/util/color';

/**
 * A set of P5 helpers for drawing.
 */

/**
 * Get the rendered width of a string at a certain text size.
 *
 * @param {P5} p5
 * @param {String} text
 * @param {Number} size
 * @returns {Number}
 */
export function getTextWidth(p5, text, size) {
  p5.push();
  p5.textSize(size);
  const width = p5.textWidth(text);
  p5.pop();

  return width;
}

/**
 * Draw a speech bubble - a P5 shape comprised of a rectangle
 * with a tail at the bottom. The x/y values will be the
 * bottom center of the bubble body, including the height added
 * by the tail. With the default config values, the tail
 * will have a size of 10 and align to the center of the bubble body.
 * Other passed config values allow the tail to be adjusted,
 * such as when a sprite is close to the edge of the app canvas.
 *
 * Note: The bubble body and tail stroke outlines will overlap if the width:tailSize
 * ratio is too low (e.g., the width is too narrow and tail is too large). Consider
 * setting a minimum width or calculating a ratio greater than 5:1 (not exact; just a starting
 * point).
 *
 * @param {P5} p5
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @param {Number} config.tailSize
 * @param {Number} config.tailTipX
 * @param {Number} config.padding
 * @param {String} config.fill
 * @param {Number} config.strokeWeight
 * @param {Number} config.stroke
 * @returns {Object}
 */
export function speechBubble(
  p5,
  x,
  y,
  width,
  height,
  {
    tailSize = 10,
    tailTipX = x,
    padding = 8,
    fill = 'white',
    strokeWeight = 2,
    stroke = 'gray'
  } = {},
  style
) {
  const minX = x - width / 2;
  const minY = y - height - tailSize;
  const maxY = y - tailSize;
  const tailMidX = (tailTipX + (minX + width / 2)) / 2;
  const tailBottomX = (tailTipX + tailMidX) / 2;

  p5.push();
  p5.stroke(stroke);
  p5.strokeWeight(strokeWeight);
  p5.fill(fill);
  switch (style) {
    case 'think':
      // Thought bubbles have more-rounded corners, and trailing bubbles.
      p5.rect(minX, minY, width, height, padding * 3);
      p5.stroke(fill);
      p5.ellipse(tailMidX, maxY, tailSize);
      p5.stroke(stroke);
      p5.arc(tailMidX, maxY, tailSize, tailSize, 0, 180);
      p5.ellipse(tailBottomX, maxY + tailSize, tailSize / 2);
      break;
    case 'say':
    default:
      // Speech bubbles have less-rounded corners and triangular tails.
      p5.rect(minX, minY, width, height, padding);
      p5.stroke(fill);
      p5.triangle(tailTipX - tailSize, maxY, tailTipX, maxY, tailTipX, y);
      p5.stroke(stroke);
      p5.line(tailTipX, maxY, tailTipX, y);
      p5.line(tailTipX, y, tailTipX - tailSize - 1, maxY);
      break;
  }
  p5.pop();

  return {minX, minY};
}

/**
 * Draw an array of text strings at a certain text size.
 *
 * @param {P5} p5
 * @param {Array<String>} lines
 * @param {Number} x
 * @param {Number} y
 * @param {Number} size
 * @param {String} config.color
 * @param {String} config.horizontalAlign
 * @param {String} config.verticalAlign
 */
export function multilineText(
  p5,
  lines,
  x,
  y,
  size,
  {color = colors.black, horizontalAlign = 'left', verticalAlign = 'top'} = {}
) {
  p5.push();
  p5.textSize(size);
  p5.textAlign(horizontalAlign, verticalAlign);
  p5.fill(color);
  lines.forEach((line, i) => p5.text(line, x, y + i * size));
  p5.pop();
}

/**
 * Draw a validation bar - a P5 shape comprised of a rectangle
 * at the bottom of the canvas.
 *
 * @param {P5} p5
 * @param {Number} width
 * @param {String} state
 * @returns {Object}
 */
export function validationBar(
  p5,
  width,
  state,
  {x = 0, y = APP_HEIGHT - 10, height = 10} = {}
) {
  let color = colors.black;
  switch (state) {
    case 'fail':
      color = colors.purple;
      break;
    case 'pass':
    case 'bonus':
      color = colors.teal;
      break;
  }
  p5.push();
  p5.noStroke();
  p5.fill(color);
  p5.rect(x, y, width, height);
  p5.pop();
}
