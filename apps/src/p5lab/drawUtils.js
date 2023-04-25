import {APP_HEIGHT, APP_WIDTH} from './constants';
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
 * Bubbles follow the sprite but not past the app canvas. Tails extend down towards the sprite.
 * The bubble has a fixed size, while the tail can shrink depending on the available space.
 *
 * @param {P5} p5
 * @param {Number} bubbleX - top left corner
 * @param {Number} bubbleY - top left corner
 * @param {Number} bubbleWidth
 * @param {Number} bubbleHeight
 * @param {Number} config.Width
 * @param {Number} config.Height
 * @param {Number} config.tailTipX
 * @param {Number} config.radius
 * @param {String} config.fill
 * @param {Number} config.strokeWeight
 * @param {Number} config.stroke
 * @param {String} bubbleType - 'say' or 'think'
 * @returns {Object}
 */
export function speechBubble(
  p5,
  bubbleX,
  bubbleY,
  bubbleWidth,
  bubbleHeight,
  spriteX,
  spriteY,
  {
    tailWidth = 10,
    tailHeight = 10,
    tailTipX = spriteX,
    radius = 8,
    fill = 'white',
    strokeWeight = 2,
    stroke = 'gray',
  } = {},
  bubbleType
) {
  // Shorten the tail if the sprite moves up past the bubble:
  if (bubbleY + bubbleHeight + tailHeight > spriteY) {
    // A minimum of one is used to prevent the tail from disappearing completely.
    tailHeight = Math.max(1, spriteY - (bubbleY + bubbleHeight));
  }
  // Keep the tail positioned near the sprite if the bubble is up against the sides.
  if (spriteX < bubbleWidth / 2) {
    tailTipX = Math.max(spriteX, radius + tailWidth);
  }
  if (spriteX > APP_WIDTH - bubbleWidth / 2) {
    tailTipX = Math.min(spriteX, APP_WIDTH - radius);
  }
  // The two ellipses that make up the tail can move in relation to the
  // speech bubble based upon the sprite's X position. We move the
  // bubbles from the expected center position to somewhere closer to the
  // sprite, if the sprite is near the side edges of the canvas.
  const tailTopY = bubbleY + bubbleHeight;
  const tailBottomY = Math.max(spriteY, bubbleY + bubbleHeight);
  // For thought bubbles, two circles are drawn to represent the tail.
  // Rather than placing these directly over the sprite, they are drawn
  // between the sprite and the center of the bubble.
  const bubbleCenterX = bubbleX + bubbleWidth / 2;
  // The first (top) circle is placed between the sprite and the center of the bubble.
  // The second (bottom) ciricle is placed between the sprite and the top bubble.
  const tailTopX = (tailTipX + bubbleCenterX) / 2;
  const tailBottomX = (tailTipX + tailTopX) / 2;
  p5.push();
  p5.stroke(stroke);
  p5.strokeWeight(strokeWeight);
  p5.fill(fill);
  switch (bubbleType) {
    case 'think':
      // Thought bubbles have more-rounded corners, and trailing circles.
      p5.rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, radius * 3);
      p5.ellipse(tailTopX, tailTopY, tailHeight);
      p5.ellipse(tailBottomX, tailBottomY, tailHeight / 2);
      break;
    case 'say':
    default:
      // Speech bubbles have less-rounded corners and a triangular tail.
      p5.rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, radius);
      p5.stroke(fill);
      p5.triangle(
        tailTipX - tailHeight,
        tailTopY,
        tailTipX,
        tailTopY,
        tailTipX,
        tailBottomY
      );
      p5.stroke(stroke);
      p5.line(tailTipX, tailTopY, tailTipX, tailBottomY);
      p5.line(tailTipX, tailBottomY, tailTipX - tailHeight - 1, tailTopY);
      break;
  }
  p5.pop();

  return {bubbleX, bubbleY};
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
  {barHeight = 10, x = 0, y = APP_HEIGHT - barHeight} = {}
) {
  const barColors = {
    fail: colors['dark_purple'],
    pass: colors['bright_green'],
    bonus: colors['neon_pink'],
  };
  p5.push();
  p5.fill(barColors[state]);
  p5.stroke(colors.white);
  p5.strokeWeight(1);
  p5.rect(x, y, width, barHeight);
  p5.pop();
}
