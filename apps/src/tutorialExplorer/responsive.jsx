/* A very simple responsive layout system.
 */
import $ from 'jquery';
import * as utils from '../utils';

/**
 * Gets the container width.
 * Returns either a number (e.g. 1170) or a string (e.g. "97%").
 */
export function getResponsiveContainerWidth() {
  const windowWidth = $(window).width();

  if (windowWidth >= 1200) {
    return 1170;
  } else {
    return "97%";
  }
}

// makeEnum comes from apps/src/utils
const ResponsiveSize = utils.makeEnum('lg', 'md', 'sm', 'xs');

// Window widths that are the starting points for each width category.
const responsiveWindowWidth = {
  [ResponsiveSize.lg]: 1024,
  [ResponsiveSize.md]: 820,
  [ResponsiveSize.sm]: 650,
  [ResponsiveSize.xs]: 0
};

/**
 * Returns the window width that is the starting point for a width category.
 *
 * @param {string} id - "xs", "sm", "md", or "lg"
 */
export function getResponsiveWindowWidth(category) {
  return responsiveWindowWidth[category];
}

/**
 * Returns whether provided category is active, given current window width.
 * e.g. called with "md" when window width >= 820px returns true.
 *
 * @param {string} id - "xs", "sm", "md", or "lg"
 */
export function isResponsiveCategoryActive(category) {
  return $(window).width() >= responsiveWindowWidth[category];
}

/**
 * Returns whether provided category is inactive, given current window width.
 * e.g. called with "md" when window width < 820px returns false.
 *
 * @param {string} id - "xs", "sm", "md", or "lg"
 */
export function isResponsiveCategoryInactive(category) {
  return $(window).width() < responsiveWindowWidth[category];
}

/**
 * From a set of values provided, returns the appropriate one for the current
 * window width.
 * Note that we default to the largest-provided value that is not for a width
 * that's greater than the current window width.  e.g. If the window width is
 * "md" then we use the provided "md" width, otherwise the provided "sm" width,
 * otherwise the provided "xs" width.
 * Note also that when the value being returned is a number, it's converted into
 * a percentage string.  e.g. 4 becomes "4%"
 *
 * @param {Object} values - A set of values from which we want one.
 * @param {number|string} values.xs - Value returned on extra-small layout.
 * @param {number|string} values.sm - Value returned on small layout.
 * @param {number|string} values.md - Value returned on medium layout.
 * @param {number|string} values.lg - Value returned on large layout.
 */

export function getResponsiveValue(values) {
  const windowWidth = $(window).width();

  let value;
  if (windowWidth >= responsiveWindowWidth[ResponsiveSize.lg]) {
    if (values.lg) {
      value = values.lg;
    } else if (values.md) {
       value = values.md;
    } else if (values.sm) {
       value = values.sm;
    } else {
      value = values.xs;
    }
  } else if (windowWidth >= responsiveWindowWidth[ResponsiveSize.md]) {
    if (values.md) {
       value = values.md;
    } else if (values.sm) {
       value = values.sm;
    } else {
      value = values.xs;
    }
  } else if (windowWidth >= responsiveWindowWidth[ResponsiveSize.sm]) {
    if (values.sm) {
       value = values.sm;
    } else {
      value = values.xs;
    }
  } else if (values.xs) {
    value = values.xs;
  }

  if (value) {
    if (typeof(value) === "number") {
      return `${value}%`;
    } else if (typeof(value) === "string") {
      return value;
    } else if (typeof(value) === "object") {
      return value;
    }
  }
}
