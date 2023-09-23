import color from '../util/color';
import * as evalUtils from './evalUtils';
import EvalImage from './evalImage';
import EvalCircle from './evalCircle';
import EvalTriangle from './evalTriangle';
import EvalMulti from './evalMulti';
import EvalRect from './evalRect';
import EvalEllipse from './evalEllipse';
import EvalText from './evalText';
import EvalStar from './evalStar';
import EvalPolygon from './evalPolygon';

// We don't use blockId at all in Eval since everything is evaluated at once.

export const display = function (object) {
  if (object === undefined) {
    object = '';
  }

  // call tolocaleString on numbers so that we get commas for large numbers
  if (typeof object === 'number' && object.toLocaleString) {
    object = object.toLocaleString();
  }

  if (!object.draw) {
    object = new EvalText(object.toString(), 12, color.black);
  }
  Eval.displayedObject = object;
};

export const circle = function (size, style, color) {
  return new EvalCircle(size, style, color);
};

export const triangle = function (size, style, color) {
  return new EvalTriangle(size, style, color);
};

export const overlay = function (top, bottom) {
  return new EvalMulti(top, bottom);
};

export const underlay = function (bottom, top) {
  return new EvalMulti(top, bottom);
};

export const square = function (size, style, color) {
  return new EvalRect(size, size, style, color);
};

export const rectangle = function (width, height, style, color) {
  return new EvalRect(width, height, style, color);
};

export const ellipse = function (width, height, style, color) {
  return new EvalEllipse(width, height, style, color);
};

export const text = function (text, fontSize, color) {
  return new EvalText(text, fontSize, color);
};

export const star = function (radius, style, color) {
  var innerRadius = ((3 - Math.sqrt(5)) / 2) * radius;
  return new EvalStar(5, innerRadius, radius, style, color);
};

export const radialStar = function (points, inner, outer, style, color) {
  return new EvalStar(points, inner, outer, style, color);
};

export const polygon = function (points, length, style, color) {
  return new EvalPolygon(points, length, style, color);
};

export const placeImage = function (x, y, image) {
  evalUtils.ensureNumber(x);
  evalUtils.ensureNumber(y);
  evalUtils.ensureType(image, EvalImage);

  // origin at center
  x = x + Eval.CANVAS_WIDTH / 2;
  y = y + Eval.CANVAS_HEIGHT / 2;

  // User inputs y in cartesian space. Convert to pixel space before sending
  // to our EvalImage.
  y = evalUtils.cartesianToPixel(y);

  // relative to center of workspace
  image.place(x, y);
  return image;
};

export const offset = function (x, y, image) {
  evalUtils.ensureNumber(x);
  evalUtils.ensureNumber(y);
  evalUtils.ensureType(image, EvalImage);

  x = image.x_ + x;
  y = image.y_ - y;

  image.place(x, y);
  return image;
};

export const rotateImage = function (degrees, image) {
  evalUtils.ensureNumber(degrees);

  image.rotate(degrees);
  return image;
};

export const scaleImage = function (factor, image) {
  image.scale(factor, factor);
  return image;
};

export const stringAppend = function (first, second) {
  evalUtils.ensureString(first);
  evalUtils.ensureString(second);

  return first + second;
};

// polling for values
export const stringLength = function (str) {
  evalUtils.ensureString(str);

  return str.length;
};
