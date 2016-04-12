/** @file Helper for getting or creating image filters by name (so we can
 *        specify them in plain level definitions or skins) */
'use strict';

var GlowFilter = require('./GlowFilter');
var PulseFilter = require('./PulseFilter');
var ShineFilter = require('./ShineFilter');

/**
 * Given a type name, constructs and returns a filter of the given type.
 * @param {!string} filterTypeName
 * @param {!SVGSVGElement} svg
 * @returns {ImageFilter} or null if the type name is not found.
 */
exports.makeFilterOfType = function (filterTypeName, svg) {
  if (filterTypeName === 'pulse') {
    return new PulseFilter(svg);
  }

  if (filterTypeName === 'shine') {
    return new ShineFilter(svg);
  }

  if (filterTypeName === 'glow') {
    return new GlowFilter(svg);
  }

  return null;
};
