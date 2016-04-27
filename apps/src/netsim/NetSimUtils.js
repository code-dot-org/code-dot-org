/**
 * @overview Static helper methods for NetSim.
 */
'use strict';

var utils = require('../utils'); // Provides String.prototype.repeat
var _ = require('../lodash');
var i18n = require('./locale');
var NetSimConstants = require('./NetSimConstants');
var NetSimGlobals = require('./NetSimGlobals');

var logger = require('./NetSimLogger').getSingleton();

var EncodingType = NetSimConstants.EncodingType;

/**
 * Make a new SVG element, appropriately namespaced, wrapped in a jQuery
 * object for (semi-)easy manipulation.
 * @param {string} type - the tagname for the svg element.
 * @returns {jQuery} for chaining
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
    } else if (!newElement.hasClass(className)) {
      newElement.attr('class', oldClasses + ' ' + className);
    }
    return newElement;
  };

  /**
   * Override removeClass since jQuery removeClass doesn't work on svg.
   * Removes the given classname if it exists on the element.
   * @param {string} className
   * @returns {jQuery} for chaining
   */
  newElement.removeClass = function (className) {
    var oldClasses = newElement.attr('class');
    if (oldClasses) {
      var newClasses = oldClasses
          .split(/\s+/g)
          .filter(function (word) {
            return word !== className;
          })
          .join(' ');
      newElement.attr('class', newClasses);
    }
    return newElement;
  };

  /**
   * Override hasClass since jQuery hasClass doesn't work on svg.
   * Checks whether the element has the given class.
   * @param {string} className
   * @returns {boolean}
   */
  newElement.hasClass = function (className) {
    var oldClasses = newElement.attr('class');
    return oldClasses && oldClasses.split(/\s+/g)
        .some(function (existingClass) {
          return existingClass === className;
        });
  };

  /**
   * Override toggleClass since jQuery toggleClass doesn't work on svg.
   *
   * Two versions:
   *
   * toggleClass(className) reverses the state of the class on the element;
   *   if it has the class it gets removed, if it doesn't have the class it
   *   gets added.
   *
   * toggleClass(className, shouldHaveClass) adds or removes the class on the
   *   element depending on the value of the second argument.
   *
   *
   * @param {string} className
   * @param {boolean} [shouldHaveClass]
   * @returns {jQuery} for chaining
   */
  newElement.toggleClass = function (className, shouldHaveClass) {
    // Default second argument - if not provided, we flip the current state
    shouldHaveClass = utils.valueOr(shouldHaveClass, !newElement.hasClass(className));

    if (shouldHaveClass) {
      newElement.addClass(className);
    } else {
      newElement.removeClass(className);
    }
    return newElement;
  };

  return newElement;
};

/**
 * Checks configuration against tab type to decide whether tab
 * of type should be shown.
 * @param {NetSimLevelConfiguration} levelConfig
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
 *        an enum like those found in NetSimConstants
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
 * Helper for converting from an older header-spec format to a new, simpler one.
 * Old format: {key:{string}, bits:{number}}[]
 * New format: string[]
 * If we detect the old format, we return a spec in the new format.
 * @param {Array} spec
 * @returns {Array}
 */
exports.scrubHeaderSpecForBackwardsCompatibility = function (spec) {
  var foundOldFormat = false;
  var scrubbedSpec = [];
  spec.forEach(function (specEntry) {
    if (typeof specEntry === 'string') {
      // This is new new format, we can just copy it over.
      scrubbedSpec.push(specEntry);
    } else if (specEntry !== null && typeof specEntry === 'object') {
      // This is the old {key:'', bits:0} format.  We just want the key.
      scrubbedSpec.push(specEntry.key);
      foundOldFormat = true;
    }
  });

  // Issue a warning if an old format got converted, so we know to update
  // the level.
  if (foundOldFormat) {
    logger.warn("Converting old header specification format to new format." +
        " This level should be updated to use the new format.");
  }

  return scrubbedSpec;
};

/**
 * @param {NetSimLevelConfiguration} levelConfig
 * @returns {NetSimLevelConfiguration} same thing, but with certain values
 *          converted or cleaned.
 * @private
 */
exports.scrubLevelConfiguration_ = function (levelConfig) {
  var scrubbedLevel = _.clone(levelConfig, true);

  // Convert old header spec format to new header spec format
  scrubbedLevel.routerExpectsPacketHeader =
      exports.scrubHeaderSpecForBackwardsCompatibility(
          scrubbedLevel.routerExpectsPacketHeader);
  scrubbedLevel.clientInitialPacketHeader =
      exports.scrubHeaderSpecForBackwardsCompatibility(
          scrubbedLevel.clientInitialPacketHeader);

  // Coerce certain values to string that might have been mistaken for numbers
  scrubbedLevel.addressFormat = scrubbedLevel.addressFormat.toString();

  // Explicitly list fields that we suspect may have a string value that
  // needs to be converted to a number, like "Infinity"
  scrubbedLevel.defaultPacketSizeLimit = exports.deserializeNumber(
      scrubbedLevel.defaultPacketSizeLimit);

  // Packet Size cannot be infinity; defaults to 8kb
  if (scrubbedLevel.defaultPacketSizeLimit === Infinity) {
    scrubbedLevel.defaultPacketSizeLimit = 8192;
  }

  scrubbedLevel.defaultBitRateBitsPerSecond = exports.deserializeNumber(
      scrubbedLevel.defaultBitRateBitsPerSecond);
  scrubbedLevel.defaultChunkSizeBits = exports.deserializeNumber(
      scrubbedLevel.defaultChunkSizeBits);
  scrubbedLevel.defaultRouterBandwidth = exports.deserializeNumber(
      scrubbedLevel.defaultRouterBandwidth);
  scrubbedLevel.defaultRouterMemory = exports.deserializeNumber(
      scrubbedLevel.defaultRouterMemory);

  // Generate a warning if we see a possible missed string-to-number conversion
  Object.keys(scrubbedLevel).filter(function (key) {
    // Ignore level params with underscores, they are the dashboard versions
    // of the camelCase parameters that the app actually uses.
    return !/_/.test(key);
  }).forEach(function (key) {
    var unconvertedValue = NUMBER_SERIALIZATION_RULES.some(function (rule) {
      return scrubbedLevel[key] === rule.jsonVal;
    });
    if (unconvertedValue) {
      logger.warn("Level option '" + key +
      "' has unconverted string value '" + scrubbedLevel[key] + "'");
    }
  });

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

  var gbytes = Math.floor(bits / NetSimConstants.BITS_PER_GIGABYTE);
  if (gbytes > 0) {
    return i18n.x_GBytes({ x: gbytes });
  }

  var mbytes = Math.floor(bits / NetSimConstants.BITS_PER_MEGABYTE);
  if (mbytes > 0) {
    return i18n.x_MBytes({ x: mbytes });
  }

  var kbytes = Math.floor(bits / NetSimConstants.BITS_PER_KILOBYTE);
  if (kbytes > 0) {
    return i18n.x_KBytes({ x: kbytes });
  }

  var bytes = Math.floor(bits / NetSimConstants.BITS_PER_BYTE);
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

  var gbps = Math.floor(bitsPerSecond / NetSimConstants.BITS_PER_GIGABIT);
  if (gbps > 0) {
    return i18n.x_Gbps({ x: gbps });
  }

  var mbps = Math.floor(bitsPerSecond / NetSimConstants.BITS_PER_MEGABIT);
  if (mbps > 0) {
    return i18n.x_Mbps({ x: mbps });
  }

  var kbps = Math.floor(bitsPerSecond / NetSimConstants.BITS_PER_KILOBIT);
  if (kbps > 0) {
    return i18n.x_Kbps({ x: kbps });
  }

  var bps = Math.floor(bitsPerSecond * 100) / 100;
  return i18n.x_bps({ x: bps });
};

exports.zeroPadLeft = function (string, desiredWidth) {
  var padding = '0'.repeat(desiredWidth);
  return (padding + string).slice(-desiredWidth);
};

exports.zeroPadRight = function (string, desiredWidth) {
  var padding = '0'.repeat(desiredWidth);
  return (string + padding).substr(0, desiredWidth);
};

/**
 * Creates a Continue/Finish button on the given NetSimPanel (in its header).
 * @param {NetSimPanel} onPanel
 * @static
 */
exports.makeContinueButton = function (onPanel) {
  onPanel.addButton(
      i18n.continueButton({ caret: '<i class="fa fa-caret-right"></i>' }),
      function (jQueryEvent) {
        if (!$(jQueryEvent.target).is(':disabled')) {
          NetSimGlobals.completeLevelAndContinue();
        }
      },
      {
        secondary: false,
        classes: ['submitButton']
      });
};
