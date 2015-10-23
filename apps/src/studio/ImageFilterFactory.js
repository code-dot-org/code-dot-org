/** @file Helper for getting or creating image filters by name (so we can
 *        specify them in plain level definitions or skins) */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var ImageFilter = require('./ImageFilter');

/**
 * Given a type name, constructs and returns a filter of the given type.
 * @param {!string} filterTypeName
 * @param {!SVGSVGElement} svg
 * @returns {ImageFilter} or null if the type name is not found.
 */
exports.makeFilterOfType = function (filterTypeName, svg) {
  if (filterTypeName === 'pulse') {
    return new ImageFilter.Pulse(svg);
  }

  if (filterTypeName === 'shine') {
    return new ImageFilter.Shine(svg);
  }

  if (filterTypeName === 'glow') {
    return new ImageFilter.Glow(svg);
  }

  return null;
};
