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
  const w = p5.textWidth(text);
  p5.pop();

  return w;
}

/**
 * Draw a speech bubble - a P5 shape comprised of a rectangle
 * with a triangle at the bottom. The x/y values will be the
 * tip of the triangle, and the bubble body will be centered above
 * the triangle.
 *
 * Note: A minimum bubble width should be configured based on triangleSize
 * config to avoid overlap when bubble is very narrow.
 *
 * @param {P5} p5
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @param {Number} config.triangleSize
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
  {triangleSize = 10, fill = 'white', strokeWeight = 2, stroke = 'black'} = {}
) {
  const minX = x - width / 2;
  const minY = y - height - triangleSize;
  const maxY = y - triangleSize;

  p5.push();
  p5.stroke(stroke);
  p5.strokeWeight(strokeWeight);
  p5.fill(fill);
  p5.beginShape();
  p5.rect(minX, minY, width, height, 8);
  p5.stroke(fill);
  p5.triangle(x - triangleSize, maxY, x, maxY, x, y);
  p5.stroke(stroke);
  p5.line(x, maxY, x, y);
  p5.line(x, y, x - triangleSize - 1, maxY);
  p5.endShape(p5.CLOSE);
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
  {color = 'black', horizontalAlign = 'left', verticalAlign = 'top'} = {}
) {
  p5.push();
  p5.textSize(size);
  p5.textAlign(horizontalAlign, verticalAlign);
  p5.fill(color);
  lines.forEach((line, i) => p5.text(line, x, y + i * size));
  p5.pop();
}
