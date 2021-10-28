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
 * tip of the triangle.
 * @param {P5} p5
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @param {Number} config.triangleSize
 * @param {String} config.fillColor
 * @param {Number} config.strokeWeight
 */
export function speechBubble(
  p5,
  x,
  y,
  width,
  height,
  {triangleSize = 10, fillColor = 'white', strokeWeight = 2}
) {
  const minX = x - width / 2;
  const maxX = x + width / 2;
  const minY = y - height;
  const maxY = y - triangleSize;

  p5.push();
  p5.strokeWeight(strokeWeight);
  p5.strokeJoin(p5.ROUND);
  p5.fill(fillColor);
  p5.beginShape();
  p5.vertex(minX, minY);
  p5.vertex(maxX, minY);
  p5.vertex(maxX, maxY);
  p5.vertex(x, y - triangleSize);
  p5.vertex(x, y);
  p5.vertex(x - triangleSize, y - triangleSize);
  p5.vertex(minX, maxY);
  p5.endShape(p5.CLOSE);
  p5.pop();
}

/**
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
  {color = 'black', horizontalAlign = 'left', verticalAlign = 'top'}
) {
  p5.push();
  p5.textSize(size);
  p5.textAlign(horizontalAlign, verticalAlign);
  p5.fill(color);
  lines.forEach((line, i) => p5.text(line, x, y + i * size));
  p5.pop();
}
