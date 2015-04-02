/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
/* global $ */
'use strict';

var _ = require('../utils').getLodash();
var i18n = require('../../locale/current/netsim');
var netsimConstants = require('./netsimConstants');

var EncodingType = netsimConstants.EncodingType;

/**
 * Make a new SVG element, appropriately namespaced, wrapped in a jQuery
 * object for (semi-)easy manipulation.
 * @param {string} type - the tagname for the svg element.
 * @returns {jQuery}
 */
exports.jQuerySvgElement = function (type) {
  var newElement = $(document.createElementNS('http://www.w3.org/2000/svg', type));

  /**
   * Override addClass since jQuery addClass doesn't work on svg.
   * @param {string} className
   */
  newElement.addClass = function (className) {
    var oldClasses = newElement.attr('class');
    if (!oldClasses) {
      newElement.attr('class', className);
    } else if (!oldClasses.split(/\s+/g).some(function (existingClass) {
          return existingClass === className;
        })) {
      newElement.attr('class', oldClasses + ' ' + className);
    }
    // Return element for chaining
    return newElement;
  };

  return newElement;
};

/**
 * Checks configuration against tab type to decide whether tab
 * of type should be shown.
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSimTabType} tabType
 */
exports.shouldShowTab = function (levelConfig, tabType) {
  return levelConfig.showTabs.indexOf(tabType) > -1;
};

/**
 * Get the localized string for the given encoding type.
 * @param {EncodingType} encodingType
 * @returns {string} localized encoding name
 */
exports.getEncodingLabel = function (encodingType) {
  if (encodingType === EncodingType.ASCII) {
    return i18n.ascii();
  } else if (encodingType === EncodingType.DECIMAL) {
    return i18n.decimal();
  } else if (encodingType === EncodingType.HEXADECIMAL) {
    return i18n.hex();
  } else if (encodingType === EncodingType.BINARY) {
    return i18n.binary();
  } else if (encodingType === EncodingType.A_AND_B) {
    return i18n.a_and_b();
  }
  return '';
};

/**
 * @param {Object} enumObj - Technically any object, but should be used with
 *        an enum like those found in netsimConstants
 * @param {function} func - A function to call for each value in the enum,
 *        which gets passed the enum value.
 */
exports.forEachEnumValue = function (enumObj, func) {
  for (var enumKey in enumObj) {
    if (enumObj.hasOwnProperty(enumKey)) {
      func(enumObj[enumKey]);
    }
  }
};

/**
 * Rules used by serializeNumber and deserializeNumber to map unsupported
 * JavaScript values into JSON and back.
 * @type {{jsVal: number, jsonVal: string}[]}
 * @readonly
 */
var NUMBER_SERIALIZATION_RULES = [
  { jsVal: Infinity, jsonVal: 'Infinity' },
  { jsVal: -Infinity, jsonVal: '-Infinity' },
  { jsVal: NaN, jsonVal: 'NaN' },
  { jsVal: undefined, jsonVal: 'undefined' }
];

/**
 * Checks that the provided value is actually the special value NaN, unlike
 * standard isNaN which returns true for anything that's not a number.
 * @param {*} val - any value
 * @returns {boolean}
 */
var isExactlyNaN = function (val) {
  // NaN is the only value in JavaScript that is not exactly equal to itself.
  // Therefore, if val !== val, then val must be NaN.
  return val !== val;
};

/**
 * Because JSON doesn't support the values Infinity, NaN, or undefined, you can
 * use this method to store those values in JSON as strings.
 * @param {number|NaN} num
 * @returns {number|string}
 */
exports.serializeNumber = function (num) {
  var applicableRule = _.find(NUMBER_SERIALIZATION_RULES, function (rule) {
    return rule.jsVal === num || (isExactlyNaN(rule.jsVal) && isExactlyNaN(num));
  });
  return applicableRule ? applicableRule.jsonVal : num;
};

/**
 * Because JSON doesn't support the values Infinity, NaN, or undefined, you can
 * use this method to retrieve a value from JSON that is either a number or one
 * of those values.
 * @param {number|string} storedNum
 * @returns {number|NaN}
 */
exports.deserializeNumber = function (storedNum) {
  var applicableRule = _.find(NUMBER_SERIALIZATION_RULES, function (rule) {
    return rule.jsonVal === storedNum;
  });
  return applicableRule ? applicableRule.jsVal : storedNum;
};

/**
 * @param {netsimLevelConfiguration} levelConfig
 * @returns {netsimLevelConfiguration} same thing, but with certain values
 *          converted or cleaned.
 * @private
 */
exports.scrubLevelConfiguration_ = function (levelConfig) {
  var scrubbedLevel = _.clone(levelConfig, true);

  // Read string "Infinity" as Infinity
  scrubbedLevel.defaultPacketSizeLimit = exports.deserializeNumber(
      scrubbedLevel.defaultPacketSizeLimit);
  scrubbedLevel.defaultRouterBandwidth = exports.deserializeNumber(
      scrubbedLevel.defaultRouterBandwidth);
  scrubbedLevel.defaultRouterMemory = exports.deserializeNumber(
      scrubbedLevel.defaultRouterMemory);

  return scrubbedLevel;
};

/**
 * Converts a number of bits into a localized representation of that data
 * size in bytes, kilobytes, megabytes, gigabytes.
 * @param {number} bits
 * @returns {string} - localized string representation of size in bytes
 */
exports.bitsToLocalizedRoundedBytesize = function (bits) {
  if (bits === Infinity) {
    return i18n.unlimited();
  }

  var gbytes = Math.floor(bits / netsimConstants.BITS_PER_GIGABYTE);
  if (gbytes > 0) {
    return i18n.x_GBytes({ x: gbytes });
  }

  var mbytes = Math.floor(bits / netsimConstants.BITS_PER_MEGABYTE);
  if (mbytes > 0) {
    return i18n.x_MBytes({ x: mbytes });
  }

  var kbytes = Math.floor(bits / netsimConstants.BITS_PER_KILOBYTE);
  if (kbytes > 0) {
    return i18n.x_KBytes({ x: kbytes });
  }

  var bytes = Math.floor(bits / netsimConstants.BITS_PER_BYTE);
  if (bytes > 0) {
    return i18n.x_Bytes({ x: bytes });
  }

  return i18n.x_bits({ x: bits });
};

/**
 * Converts a bitrate into a localized representation of that data
 * size in bits/sec, kilobits, megabits, gigabits.
 * @param {number} bitsPerSecond
 * @returns {string} - localized string representation of speed in bits
 */
exports.bitrateToLocalizedRoundedBitrate = function (bitsPerSecond) {
  if (bitsPerSecond === Infinity) {
    return i18n.unlimited();
  }

  var gbps = Math.floor(bitsPerSecond / netsimConstants.BITS_PER_GIGABIT);
  if (gbps > 0) {
    return i18n.x_Gbps({ x: gbps });
  }

  var mbps = Math.floor(bitsPerSecond / netsimConstants.BITS_PER_MEGABIT);
  if (mbps > 0) {
    return i18n.x_Mbps({ x: mbps });
  }

  var kbps = Math.floor(bitsPerSecond / netsimConstants.BITS_PER_KILOBIT);
  if (kbps > 0) {
    return i18n.x_Kbps({ x: kbps });
  }

  return i18n.x_bps({ x: bitsPerSecond });
};

exports.zeroPadLeft = function (string, desiredWidth) {
  var padding = '0'.repeat(desiredWidth);
  return (padding + string).slice(-desiredWidth);
};

exports.zeroPadRight = function (string, desiredWidth) {
  var padding = '0'.repeat(desiredWidth);
  return (string + padding).substr(0, desiredWidth);
};

