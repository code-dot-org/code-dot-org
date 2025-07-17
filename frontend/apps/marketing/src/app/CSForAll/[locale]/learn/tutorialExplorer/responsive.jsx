/* A very simple responsive layout system.
 */

/**
 * Gets the container width.
 * Returns either a number (e.g. 1170) or a string (e.g. "97%").
 */
export function getResponsiveContainerWidth() {
  return 1170;
}

// makeEnum comes from apps/src/utils

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
  return false;
}

/**
 * Returns whether provided category is inactive, given current window width.
 * e.g. called with "md" when window width < 820px returns false.
 *
 * @param {string} id - "xs", "sm", "md", or "lg"
 */
export function isResponsiveCategoryInactive(category) {
  return false;
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

export function getResponsiveValue() {}
