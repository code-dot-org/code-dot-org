(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["tutorialExplorer"],{

/***/ "../dashboard/app/assets/images/blank_sharing_drawing.png":
/*!****************************************************************!*\
  !*** ../dashboard/app/assets/images/blank_sharing_drawing.png ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "blank_sharing_drawingwpae53b62a1609cbbb425574e45b37b837.png";

/***/ }),

/***/ "./node_modules/crypto-js/core.js":
/*!****************************************!*\
  !*** ./node_modules/crypto-js/core.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

;(function (root, factory) {
	if (true) {
		// CommonJS
		module.exports = exports = factory();
	}
	else {}
}(this, function () {

	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function (Math, undefined) {
	    /*
	     * Local polyfil of Object.create
	     */
	    var create = Object.create || (function () {
	        function F() {};

	        return function (obj) {
	            var subtype;

	            F.prototype = obj;

	            subtype = new F();

	            F.prototype = null;

	            return subtype;
	        };
	    }())

	    /**
	     * CryptoJS namespace.
	     */
	    var C = {};

	    /**
	     * Library namespace.
	     */
	    var C_lib = C.lib = {};

	    /**
	     * Base object for prototypal inheritance.
	     */
	    var Base = C_lib.Base = (function () {


	        return {
	            /**
	             * Creates a new object that inherits from this object.
	             *
	             * @param {Object} overrides Properties to copy into the new object.
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         field: 'value',
	             *
	             *         method: function () {
	             *         }
	             *     });
	             */
	            extend: function (overrides) {
	                // Spawn
	                var subtype = create(this);

	                // Augment
	                if (overrides) {
	                    subtype.mixIn(overrides);
	                }

	                // Create default initializer
	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
	                    subtype.init = function () {
	                        subtype.$super.init.apply(this, arguments);
	                    };
	                }

	                // Initializer's prototype is the subtype object
	                subtype.init.prototype = subtype;

	                // Reference supertype
	                subtype.$super = this;

	                return subtype;
	            },

	            /**
	             * Extends this object and runs the init method.
	             * Arguments to create() will be passed to init().
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var instance = MyType.create();
	             */
	            create: function () {
	                var instance = this.extend();
	                instance.init.apply(instance, arguments);

	                return instance;
	            },

	            /**
	             * Initializes a newly created object.
	             * Override this method to add some logic when your objects are created.
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         init: function () {
	             *             // ...
	             *         }
	             *     });
	             */
	            init: function () {
	            },

	            /**
	             * Copies properties into this object.
	             *
	             * @param {Object} properties The properties to mix in.
	             *
	             * @example
	             *
	             *     MyType.mixIn({
	             *         field: 'value'
	             *     });
	             */
	            mixIn: function (properties) {
	                for (var propertyName in properties) {
	                    if (properties.hasOwnProperty(propertyName)) {
	                        this[propertyName] = properties[propertyName];
	                    }
	                }

	                // IE won't copy toString using the loop above
	                if (properties.hasOwnProperty('toString')) {
	                    this.toString = properties.toString;
	                }
	            },

	            /**
	             * Creates a copy of this object.
	             *
	             * @return {Object} The clone.
	             *
	             * @example
	             *
	             *     var clone = instance.clone();
	             */
	            clone: function () {
	                return this.init.prototype.extend(this);
	            }
	        };
	    }());

	    /**
	     * An array of 32-bit words.
	     *
	     * @property {Array} words The array of 32-bit words.
	     * @property {number} sigBytes The number of significant bytes in this word array.
	     */
	    var WordArray = C_lib.WordArray = Base.extend({
	        /**
	         * Initializes a newly created word array.
	         *
	         * @param {Array} words (Optional) An array of 32-bit words.
	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.create();
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
	         */
	        init: function (words, sigBytes) {
	            words = this.words = words || [];

	            if (sigBytes != undefined) {
	                this.sigBytes = sigBytes;
	            } else {
	                this.sigBytes = words.length * 4;
	            }
	        },

	        /**
	         * Converts this word array to a string.
	         *
	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	         *
	         * @return {string} The stringified word array.
	         *
	         * @example
	         *
	         *     var string = wordArray + '';
	         *     var string = wordArray.toString();
	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
	         */
	        toString: function (encoder) {
	            return (encoder || Hex).stringify(this);
	        },

	        /**
	         * Concatenates a word array to this word array.
	         *
	         * @param {WordArray} wordArray The word array to append.
	         *
	         * @return {WordArray} This word array.
	         *
	         * @example
	         *
	         *     wordArray1.concat(wordArray2);
	         */
	        concat: function (wordArray) {
	            // Shortcuts
	            var thisWords = this.words;
	            var thatWords = wordArray.words;
	            var thisSigBytes = this.sigBytes;
	            var thatSigBytes = wordArray.sigBytes;

	            // Clamp excess bits
	            this.clamp();

	            // Concat
	            if (thisSigBytes % 4) {
	                // Copy one byte at a time
	                for (var i = 0; i < thatSigBytes; i++) {
	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
	                }
	            } else {
	                // Copy one word at a time
	                for (var i = 0; i < thatSigBytes; i += 4) {
	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
	                }
	            }
	            this.sigBytes += thatSigBytes;

	            // Chainable
	            return this;
	        },

	        /**
	         * Removes insignificant bits.
	         *
	         * @example
	         *
	         *     wordArray.clamp();
	         */
	        clamp: function () {
	            // Shortcuts
	            var words = this.words;
	            var sigBytes = this.sigBytes;

	            // Clamp
	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
	            words.length = Math.ceil(sigBytes / 4);
	        },

	        /**
	         * Creates a copy of this word array.
	         *
	         * @return {WordArray} The clone.
	         *
	         * @example
	         *
	         *     var clone = wordArray.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone.words = this.words.slice(0);

	            return clone;
	        },

	        /**
	         * Creates a word array filled with random bytes.
	         *
	         * @param {number} nBytes The number of random bytes to generate.
	         *
	         * @return {WordArray} The random word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
	         */
	        random: function (nBytes) {
	            var words = [];

	            var r = (function (m_w) {
	                var m_w = m_w;
	                var m_z = 0x3ade68b1;
	                var mask = 0xffffffff;

	                return function () {
	                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
	                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
	                    var result = ((m_z << 0x10) + m_w) & mask;
	                    result /= 0x100000000;
	                    result += 0.5;
	                    return result * (Math.random() > .5 ? 1 : -1);
	                }
	            });

	            for (var i = 0, rcache; i < nBytes; i += 4) {
	                var _r = r((rcache || Math.random()) * 0x100000000);

	                rcache = _r() * 0x3ade67b7;
	                words.push((_r() * 0x100000000) | 0);
	            }

	            return new WordArray.init(words, nBytes);
	        }
	    });

	    /**
	     * Encoder namespace.
	     */
	    var C_enc = C.enc = {};

	    /**
	     * Hex encoding strategy.
	     */
	    var Hex = C_enc.Hex = {
	        /**
	         * Converts a word array to a hex string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The hex string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var hexChars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                hexChars.push((bite >>> 4).toString(16));
	                hexChars.push((bite & 0x0f).toString(16));
	            }

	            return hexChars.join('');
	        },

	        /**
	         * Converts a hex string to a word array.
	         *
	         * @param {string} hexStr The hex string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
	         */
	        parse: function (hexStr) {
	            // Shortcut
	            var hexStrLength = hexStr.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < hexStrLength; i += 2) {
	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
	            }

	            return new WordArray.init(words, hexStrLength / 2);
	        }
	    };

	    /**
	     * Latin1 encoding strategy.
	     */
	    var Latin1 = C_enc.Latin1 = {
	        /**
	         * Converts a word array to a Latin1 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Latin1 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var latin1Chars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                latin1Chars.push(String.fromCharCode(bite));
	            }

	            return latin1Chars.join('');
	        },

	        /**
	         * Converts a Latin1 string to a word array.
	         *
	         * @param {string} latin1Str The Latin1 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	         */
	        parse: function (latin1Str) {
	            // Shortcut
	            var latin1StrLength = latin1Str.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < latin1StrLength; i++) {
	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
	            }

	            return new WordArray.init(words, latin1StrLength);
	        }
	    };

	    /**
	     * UTF-8 encoding strategy.
	     */
	    var Utf8 = C_enc.Utf8 = {
	        /**
	         * Converts a word array to a UTF-8 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The UTF-8 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            try {
	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
	            } catch (e) {
	                throw new Error('Malformed UTF-8 data');
	            }
	        },

	        /**
	         * Converts a UTF-8 string to a word array.
	         *
	         * @param {string} utf8Str The UTF-8 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	         */
	        parse: function (utf8Str) {
	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
	        }
	    };

	    /**
	     * Abstract buffered block algorithm template.
	     *
	     * The property blockSize must be implemented in a concrete subtype.
	     *
	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
	     */
	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
	        /**
	         * Resets this block algorithm's data buffer to its initial state.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm.reset();
	         */
	        reset: function () {
	            // Initial values
	            this._data = new WordArray.init();
	            this._nDataBytes = 0;
	        },

	        /**
	         * Adds new data to this block algorithm's buffer.
	         *
	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm._append('data');
	         *     bufferedBlockAlgorithm._append(wordArray);
	         */
	        _append: function (data) {
	            // Convert string to WordArray, else assume WordArray already
	            if (typeof data == 'string') {
	                data = Utf8.parse(data);
	            }

	            // Append
	            this._data.concat(data);
	            this._nDataBytes += data.sigBytes;
	        },

	        /**
	         * Processes available data blocks.
	         *
	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	         *
	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
	         *
	         * @return {WordArray} The processed data.
	         *
	         * @example
	         *
	         *     var processedData = bufferedBlockAlgorithm._process();
	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
	         */
	        _process: function (doFlush) {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;
	            var dataSigBytes = data.sigBytes;
	            var blockSize = this.blockSize;
	            var blockSizeBytes = blockSize * 4;

	            // Count blocks ready
	            var nBlocksReady = dataSigBytes / blockSizeBytes;
	            if (doFlush) {
	                // Round up to include partial blocks
	                nBlocksReady = Math.ceil(nBlocksReady);
	            } else {
	                // Round down to include only full blocks,
	                // less the number of blocks that must remain in the buffer
	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
	            }

	            // Count words ready
	            var nWordsReady = nBlocksReady * blockSize;

	            // Count bytes ready
	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

	            // Process blocks
	            if (nWordsReady) {
	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
	                    // Perform concrete-algorithm logic
	                    this._doProcessBlock(dataWords, offset);
	                }

	                // Remove processed words
	                var processedWords = dataWords.splice(0, nWordsReady);
	                data.sigBytes -= nBytesReady;
	            }

	            // Return processed words
	            return new WordArray.init(processedWords, nBytesReady);
	        },

	        /**
	         * Creates a copy of this object.
	         *
	         * @return {Object} The clone.
	         *
	         * @example
	         *
	         *     var clone = bufferedBlockAlgorithm.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone._data = this._data.clone();

	            return clone;
	        },

	        _minBufferSize: 0
	    });

	    /**
	     * Abstract hasher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
	     */
	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
	        /**
	         * Configuration options.
	         */
	        cfg: Base.extend(),

	        /**
	         * Initializes a newly created hasher.
	         *
	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
	         *
	         * @example
	         *
	         *     var hasher = CryptoJS.algo.SHA256.create();
	         */
	        init: function (cfg) {
	            // Apply config defaults
	            this.cfg = this.cfg.extend(cfg);

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this hasher to its initial state.
	         *
	         * @example
	         *
	         *     hasher.reset();
	         */
	        reset: function () {
	            // Reset data buffer
	            BufferedBlockAlgorithm.reset.call(this);

	            // Perform concrete-hasher logic
	            this._doReset();
	        },

	        /**
	         * Updates this hasher with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {Hasher} This hasher.
	         *
	         * @example
	         *
	         *     hasher.update('message');
	         *     hasher.update(wordArray);
	         */
	        update: function (messageUpdate) {
	            // Append
	            this._append(messageUpdate);

	            // Update the hash
	            this._process();

	            // Chainable
	            return this;
	        },

	        /**
	         * Finalizes the hash computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The hash.
	         *
	         * @example
	         *
	         *     var hash = hasher.finalize();
	         *     var hash = hasher.finalize('message');
	         *     var hash = hasher.finalize(wordArray);
	         */
	        finalize: function (messageUpdate) {
	            // Final message update
	            if (messageUpdate) {
	                this._append(messageUpdate);
	            }

	            // Perform concrete-hasher logic
	            var hash = this._doFinalize();

	            return hash;
	        },

	        blockSize: 512/32,

	        /**
	         * Creates a shortcut function to a hasher's object interface.
	         *
	         * @param {Hasher} hasher The hasher to create a helper for.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
	         */
	        _createHelper: function (hasher) {
	            return function (message, cfg) {
	                return new hasher.init(cfg).finalize(message);
	            };
	        },

	        /**
	         * Creates a shortcut function to the HMAC's object interface.
	         *
	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	         */
	        _createHmacHelper: function (hasher) {
	            return function (message, key) {
	                return new C_algo.HMAC.init(hasher, key).finalize(message);
	            };
	        }
	    });

	    /**
	     * Algorithm namespace.
	     */
	    var C_algo = C.algo = {};

	    return C;
	}(Math));


	return CryptoJS;

}));

/***/ }),

/***/ "./node_modules/crypto-js/md5.js":
/*!***************************************!*\
  !*** ./node_modules/crypto-js/md5.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

;(function (root, factory) {
	if (true) {
		// CommonJS
		module.exports = exports = factory(__webpack_require__(/*! ./core */ "./node_modules/crypto-js/core.js"));
	}
	else {}
}(this, function (CryptoJS) {

	(function (Math) {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var WordArray = C_lib.WordArray;
	    var Hasher = C_lib.Hasher;
	    var C_algo = C.algo;

	    // Constants table
	    var T = [];

	    // Compute constants
	    (function () {
	        for (var i = 0; i < 64; i++) {
	            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
	        }
	    }());

	    /**
	     * MD5 hash algorithm.
	     */
	    var MD5 = C_algo.MD5 = Hasher.extend({
	        _doReset: function () {
	            this._hash = new WordArray.init([
	                0x67452301, 0xefcdab89,
	                0x98badcfe, 0x10325476
	            ]);
	        },

	        _doProcessBlock: function (M, offset) {
	            // Swap endian
	            for (var i = 0; i < 16; i++) {
	                // Shortcuts
	                var offset_i = offset + i;
	                var M_offset_i = M[offset_i];

	                M[offset_i] = (
	                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	                );
	            }

	            // Shortcuts
	            var H = this._hash.words;

	            var M_offset_0  = M[offset + 0];
	            var M_offset_1  = M[offset + 1];
	            var M_offset_2  = M[offset + 2];
	            var M_offset_3  = M[offset + 3];
	            var M_offset_4  = M[offset + 4];
	            var M_offset_5  = M[offset + 5];
	            var M_offset_6  = M[offset + 6];
	            var M_offset_7  = M[offset + 7];
	            var M_offset_8  = M[offset + 8];
	            var M_offset_9  = M[offset + 9];
	            var M_offset_10 = M[offset + 10];
	            var M_offset_11 = M[offset + 11];
	            var M_offset_12 = M[offset + 12];
	            var M_offset_13 = M[offset + 13];
	            var M_offset_14 = M[offset + 14];
	            var M_offset_15 = M[offset + 15];

	            // Working varialbes
	            var a = H[0];
	            var b = H[1];
	            var c = H[2];
	            var d = H[3];

	            // Computation
	            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
	            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
	            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
	            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
	            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
	            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
	            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
	            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
	            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
	            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
	            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
	            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
	            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
	            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
	            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
	            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

	            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
	            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
	            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
	            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
	            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
	            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
	            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
	            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
	            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
	            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
	            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
	            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
	            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
	            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
	            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
	            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

	            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
	            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
	            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
	            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
	            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
	            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
	            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
	            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
	            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
	            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
	            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
	            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
	            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
	            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
	            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
	            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

	            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
	            d = II(d, a, b, c, M_offset_7,  10, T[49]);
	            c = II(c, d, a, b, M_offset_14, 15, T[50]);
	            b = II(b, c, d, a, M_offset_5,  21, T[51]);
	            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
	            d = II(d, a, b, c, M_offset_3,  10, T[53]);
	            c = II(c, d, a, b, M_offset_10, 15, T[54]);
	            b = II(b, c, d, a, M_offset_1,  21, T[55]);
	            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
	            d = II(d, a, b, c, M_offset_15, 10, T[57]);
	            c = II(c, d, a, b, M_offset_6,  15, T[58]);
	            b = II(b, c, d, a, M_offset_13, 21, T[59]);
	            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
	            d = II(d, a, b, c, M_offset_11, 10, T[61]);
	            c = II(c, d, a, b, M_offset_2,  15, T[62]);
	            b = II(b, c, d, a, M_offset_9,  21, T[63]);

	            // Intermediate hash value
	            H[0] = (H[0] + a) | 0;
	            H[1] = (H[1] + b) | 0;
	            H[2] = (H[2] + c) | 0;
	            H[3] = (H[3] + d) | 0;
	        },

	        _doFinalize: function () {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;

	            var nBitsTotal = this._nDataBytes * 8;
	            var nBitsLeft = data.sigBytes * 8;

	            // Add padding
	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

	            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
	            var nBitsTotalL = nBitsTotal;
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
	                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
	                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
	            );
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
	                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
	            );

	            data.sigBytes = (dataWords.length + 1) * 4;

	            // Hash final blocks
	            this._process();

	            // Shortcuts
	            var hash = this._hash;
	            var H = hash.words;

	            // Swap endian
	            for (var i = 0; i < 4; i++) {
	                // Shortcut
	                var H_i = H[i];

	                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	            }

	            // Return final computed hash
	            return hash;
	        },

	        clone: function () {
	            var clone = Hasher.clone.call(this);
	            clone._hash = this._hash.clone();

	            return clone;
	        }
	    });

	    function FF(a, b, c, d, x, s, t) {
	        var n = a + ((b & c) | (~b & d)) + x + t;
	        return ((n << s) | (n >>> (32 - s))) + b;
	    }

	    function GG(a, b, c, d, x, s, t) {
	        var n = a + ((b & d) | (c & ~d)) + x + t;
	        return ((n << s) | (n >>> (32 - s))) + b;
	    }

	    function HH(a, b, c, d, x, s, t) {
	        var n = a + (b ^ c ^ d) + x + t;
	        return ((n << s) | (n >>> (32 - s))) + b;
	    }

	    function II(a, b, c, d, x, s, t) {
	        var n = a + (c ^ (b | ~d)) + x + t;
	        return ((n << s) | (n >>> (32 - s))) + b;
	    }

	    /**
	     * Shortcut function to the hasher's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     *
	     * @return {WordArray} The hash.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hash = CryptoJS.MD5('message');
	     *     var hash = CryptoJS.MD5(wordArray);
	     */
	    C.MD5 = Hasher._createHelper(MD5);

	    /**
	     * Shortcut function to the HMAC's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     * @param {WordArray|string} key The secret key.
	     *
	     * @return {WordArray} The HMAC.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hmac = CryptoJS.HmacMD5(message, key);
	     */
	    C.HmacMD5 = Hasher._createHmacHelper(MD5);
	}(Math));


	return CryptoJS.MD5;

}));

/***/ }),

/***/ "./node_modules/eventlistener/eventlistener.js":
/*!*****************************************************!*\
  !*** ./node_modules/eventlistener/eventlistener.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root,factory){
    if (true) {
        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function () {
	function wrap(standard, fallback) {
		return function (el, evtName, listener, useCapture) {
			if (el[standard]) {
				el[standard](evtName, listener, useCapture);
			} else if (el[fallback]) {
				el[fallback]('on' + evtName, listener);
			}
		}
	}

    return {
		add: wrap('addEventListener', 'attachEvent'),
		remove: wrap('removeEventListener', 'detachEvent')
	};
}));

/***/ }),

/***/ "./node_modules/js-cookie/src/js.cookie.js":
/*!*************************************************!*\
  !*** ./node_modules/js-cookie/src/js.cookie.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.1.3
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		registeredInModuleLoader = true;
	}
	if (true) {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires ? '; expires=' + attributes.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					attributes.path ? '; path=' + attributes.path : '',
					attributes.domain ? '; domain=' + attributes.domain : '',
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));


/***/ }),

/***/ "./node_modules/lodash.debounce/index.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash.debounce/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/lodash.throttle/index.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash.throttle/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/object-assign/index.js":
/*!*********************************************!*\
  !*** ./node_modules/object-assign/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),

/***/ "./node_modules/performance-now/lib/performance-now.js":
/*!*************************************************************!*\
  !*** ./node_modules/performance-now/lib/performance-now.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

//# sourceMappingURL=performance-now.js.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/prop-types/checkPropTypes.js":
/*!***************************************************!*\
  !*** ./node_modules/prop-types/checkPropTypes.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var printWarning = function() {};

if (true) {
  var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "./node_modules/prop-types/lib/ReactPropTypesSecret.js");
  var loggedTypeFailures = {};

  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (true) {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error(
              (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
              'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
            );
            err.name = 'Invariant Violation';
            throw err;
          }
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          printWarning(
            (componentName || 'React class') + ': type specification of ' +
            location + ' `' + typeSpecName + '` is invalid; the type checker ' +
            'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
            'You may have forgotten to pass an argument to the type checker ' +
            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
            'shape all require an argument).'
          )

        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          printWarning(
            'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
          );
        }
      }
    }
  }
}

module.exports = checkPropTypes;


/***/ }),

/***/ "./node_modules/prop-types/factoryWithTypeCheckers.js":
/*!************************************************************!*\
  !*** ./node_modules/prop-types/factoryWithTypeCheckers.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var assign = __webpack_require__(/*! object-assign */ "./node_modules/object-assign/index.js");

var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "./node_modules/prop-types/lib/ReactPropTypesSecret.js");
var checkPropTypes = __webpack_require__(/*! ./checkPropTypes */ "./node_modules/prop-types/checkPropTypes.js");

var printWarning = function() {};

if (true) {
  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

function emptyFunctionThatReturnsNull() {
  return null;
}

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker,
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (true) {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          var err = new Error(
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
          err.name = 'Invariant Violation';
          throw err;
        } else if ( true && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            printWarning(
              'You are manually calling a React.PropTypes validation ' +
              'function for the `' + propFullName + '` prop on `' + componentName  + '`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.'
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
       true ? printWarning('Invalid argument supplied to oneOf, expected an instance of array.') : undefined;
      return emptyFunctionThatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
       true ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : undefined;
      return emptyFunctionThatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        printWarning(
          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
          'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.'
        );
        return emptyFunctionThatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      // We need to check all keys in case some are required but missing from
      // props.
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (!checker) {
          return new PropTypeError(
            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),

/***/ "./node_modules/prop-types/index.js":
/*!******************************************!*\
  !*** ./node_modules/prop-types/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (true) {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(/*! ./factoryWithTypeCheckers */ "./node_modules/prop-types/factoryWithTypeCheckers.js")(isValidElement, throwOnDirectAccess);
} else {}


/***/ }),

/***/ "./node_modules/prop-types/lib/ReactPropTypesSecret.js":
/*!*************************************************************!*\
  !*** ./node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),

/***/ "./node_modules/query-string/index.js":
/*!********************************************!*\
  !*** ./node_modules/query-string/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strictUriEncode = __webpack_require__(/*! strict-uri-encode */ "./node_modules/strict-uri-encode/index.js");

function encode(value, strict) {
	return strict ? strictUriEncode(value) : encodeURIComponent(value);
}

exports.extract = function (str) {
	return str.split('?')[1] || '';
};

exports.parse = function (str) {
	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		key = decodeURIComponent(key);

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		if (ret[key] === undefined) {
			ret[key] = val;
		} else if (Array.isArray(ret[key])) {
			ret[key].push(val);
		} else {
			ret[key] = [ret[key], val];
		}
	});

	return ret;
};

exports.stringify = function (obj, opts) {
	opts = opts || {};

	var strict = opts.strict !== false;

	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return key;
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().sort().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				if (val2 === null) {
					result.push(encode(key, strict));
				} else {
					result.push(encode(key, strict) + '=' + encode(val2, strict));
				}
			});

			return result.join('&');
		}

		return encode(key, strict) + '=' + encode(val, strict);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};


/***/ }),

/***/ "./node_modules/raf/index.js":
/*!***********************************!*\
  !*** ./node_modules/raf/index.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var now = __webpack_require__(/*! performance-now */ "./node_modules/performance-now/lib/performance-now.js")
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/react-lazy-load/lib/LazyLoad.js":
/*!******************************************************!*\
  !*** ./node_modules/react-lazy-load/lib/LazyLoad.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactDom = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");

var _eventlistener = __webpack_require__(/*! eventlistener */ "./node_modules/eventlistener/eventlistener.js");

var _lodash = __webpack_require__(/*! lodash.debounce */ "./node_modules/lodash.debounce/index.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = __webpack_require__(/*! lodash.throttle */ "./node_modules/lodash.throttle/index.js");

var _lodash4 = _interopRequireDefault(_lodash3);

var _parentScroll = __webpack_require__(/*! ./utils/parentScroll */ "./node_modules/react-lazy-load/lib/utils/parentScroll.js");

var _parentScroll2 = _interopRequireDefault(_parentScroll);

var _inViewport = __webpack_require__(/*! ./utils/inViewport */ "./node_modules/react-lazy-load/lib/utils/inViewport.js");

var _inViewport2 = _interopRequireDefault(_inViewport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LazyLoad = function (_Component) {
  _inherits(LazyLoad, _Component);

  function LazyLoad(props) {
    _classCallCheck(this, LazyLoad);

    var _this = _possibleConstructorReturn(this, (LazyLoad.__proto__ || Object.getPrototypeOf(LazyLoad)).call(this, props));

    _this.lazyLoadHandler = _this.lazyLoadHandler.bind(_this);

    if (props.throttle > 0) {
      if (props.debounce) {
        _this.lazyLoadHandler = (0, _lodash2.default)(_this.lazyLoadHandler, props.throttle);
      } else {
        _this.lazyLoadHandler = (0, _lodash4.default)(_this.lazyLoadHandler, props.throttle);
      }
    }

    _this.state = { visible: false };
    return _this;
  }

  _createClass(LazyLoad, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._mounted = true;
      var eventNode = this.getEventNode();

      this.lazyLoadHandler();

      if (this.lazyLoadHandler.flush) {
        this.lazyLoadHandler.flush();
      }

      (0, _eventlistener.add)(window, 'resize', this.lazyLoadHandler);
      (0, _eventlistener.add)(eventNode, 'scroll', this.lazyLoadHandler);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps() {
      if (!this.state.visible) {
        this.lazyLoadHandler();
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(_nextProps, nextState) {
      return nextState.visible;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._mounted = false;
      if (this.lazyLoadHandler.cancel) {
        this.lazyLoadHandler.cancel();
      }

      this.detachListeners();
    }
  }, {
    key: 'getEventNode',
    value: function getEventNode() {
      return (0, _parentScroll2.default)((0, _reactDom.findDOMNode)(this));
    }
  }, {
    key: 'getOffset',
    value: function getOffset() {
      var _props = this.props,
          offset = _props.offset,
          offsetVertical = _props.offsetVertical,
          offsetHorizontal = _props.offsetHorizontal,
          offsetTop = _props.offsetTop,
          offsetBottom = _props.offsetBottom,
          offsetLeft = _props.offsetLeft,
          offsetRight = _props.offsetRight,
          threshold = _props.threshold;


      var _offsetAll = threshold || offset;
      var _offsetVertical = offsetVertical || _offsetAll;
      var _offsetHorizontal = offsetHorizontal || _offsetAll;

      return {
        top: offsetTop || _offsetVertical,
        bottom: offsetBottom || _offsetVertical,
        left: offsetLeft || _offsetHorizontal,
        right: offsetRight || _offsetHorizontal
      };
    }
  }, {
    key: 'lazyLoadHandler',
    value: function lazyLoadHandler() {
      if (!this._mounted) {
        return;
      }
      var offset = this.getOffset();
      var node = (0, _reactDom.findDOMNode)(this);
      var eventNode = this.getEventNode();

      if ((0, _inViewport2.default)(node, eventNode, offset)) {
        var onContentVisible = this.props.onContentVisible;


        this.setState({ visible: true }, function () {
          if (onContentVisible) {
            onContentVisible();
          }
        });
        this.detachListeners();
      }
    }
  }, {
    key: 'detachListeners',
    value: function detachListeners() {
      var eventNode = this.getEventNode();

      (0, _eventlistener.remove)(window, 'resize', this.lazyLoadHandler);
      (0, _eventlistener.remove)(eventNode, 'scroll', this.lazyLoadHandler);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          children = _props2.children,
          className = _props2.className,
          height = _props2.height,
          width = _props2.width;
      var visible = this.state.visible;


      var elStyles = { height: height, width: width };
      var elClasses = 'LazyLoad' + (visible ? ' is-visible' : '') + (className ? ' ' + className : '');

      return _react2.default.createElement(this.props.elementType, {
        className: elClasses,
        style: elStyles
      }, visible && _react.Children.only(children));
    }
  }]);

  return LazyLoad;
}(_react.Component);

exports.default = LazyLoad;


LazyLoad.propTypes = {
  children: _propTypes2.default.node.isRequired,
  className: _propTypes2.default.string,
  debounce: _propTypes2.default.bool,
  elementType: _propTypes2.default.string,
  height: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
  offset: _propTypes2.default.number,
  offsetBottom: _propTypes2.default.number,
  offsetHorizontal: _propTypes2.default.number,
  offsetLeft: _propTypes2.default.number,
  offsetRight: _propTypes2.default.number,
  offsetTop: _propTypes2.default.number,
  offsetVertical: _propTypes2.default.number,
  threshold: _propTypes2.default.number,
  throttle: _propTypes2.default.number,
  width: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
  onContentVisible: _propTypes2.default.func
};

LazyLoad.defaultProps = {
  elementType: 'div',
  debounce: true,
  offset: 0,
  offsetBottom: 0,
  offsetHorizontal: 0,
  offsetLeft: 0,
  offsetRight: 0,
  offsetTop: 0,
  offsetVertical: 0,
  throttle: 250
};

/***/ }),

/***/ "./node_modules/react-lazy-load/lib/utils/getElementPosition.js":
/*!**********************************************************************!*\
  !*** ./node_modules/react-lazy-load/lib/utils/getElementPosition.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getElementPosition;
/*
* Finds element's position relative to the whole document,
* rather than to the viewport as it is the case with .getBoundingClientRect().
*/
function getElementPosition(element) {
  var rect = element.getBoundingClientRect();

  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset
  };
}

/***/ }),

/***/ "./node_modules/react-lazy-load/lib/utils/inViewport.js":
/*!**************************************************************!*\
  !*** ./node_modules/react-lazy-load/lib/utils/inViewport.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inViewport;

var _getElementPosition = __webpack_require__(/*! ./getElementPosition */ "./node_modules/react-lazy-load/lib/utils/getElementPosition.js");

var _getElementPosition2 = _interopRequireDefault(_getElementPosition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isHidden = function isHidden(element) {
  return element.offsetParent === null;
};

function inViewport(element, container, customOffset) {
  if (isHidden(element)) {
    return false;
  }

  var top = void 0;
  var bottom = void 0;
  var left = void 0;
  var right = void 0;

  if (typeof container === 'undefined' || container === window) {
    top = window.pageYOffset;
    left = window.pageXOffset;
    bottom = top + window.innerHeight;
    right = left + window.innerWidth;
  } else {
    var containerPosition = (0, _getElementPosition2.default)(container);

    top = containerPosition.top;
    left = containerPosition.left;
    bottom = top + container.offsetHeight;
    right = left + container.offsetWidth;
  }

  var elementPosition = (0, _getElementPosition2.default)(element);

  return top <= elementPosition.top + element.offsetHeight + customOffset.top && bottom >= elementPosition.top - customOffset.bottom && left <= elementPosition.left + element.offsetWidth + customOffset.left && right >= elementPosition.left - customOffset.right;
}

/***/ }),

/***/ "./node_modules/react-lazy-load/lib/utils/parentScroll.js":
/*!****************************************************************!*\
  !*** ./node_modules/react-lazy-load/lib/utils/parentScroll.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var style = function style(element, prop) {
  return typeof getComputedStyle !== 'undefined' ? getComputedStyle(element, null).getPropertyValue(prop) : element.style[prop];
};

var overflow = function overflow(element) {
  return style(element, 'overflow') + style(element, 'overflow-y') + style(element, 'overflow-x');
};

var scrollParent = function scrollParent(element) {
  if (!(element instanceof HTMLElement)) {
    return window;
  }

  var parent = element;

  while (parent) {
    if (parent === document.body || parent === document.documentElement) {
      break;
    }

    if (!parent.parentNode) {
      break;
    }

    if (/(scroll|auto)/.test(overflow(parent))) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return window;
};

exports.default = scrollParent;

/***/ }),

/***/ "./node_modules/react-sticky/lib/Container.js":
/*!****************************************************!*\
  !*** ./node_modules/react-sticky/lib/Container.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _raf = __webpack_require__(/*! raf */ "./node_modules/raf/index.js");

var _raf2 = _interopRequireDefault(_raf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Container = function (_PureComponent) {
  _inherits(Container, _PureComponent);

  function Container() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Container);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Container.__proto__ || Object.getPrototypeOf(Container)).call.apply(_ref, [this].concat(args))), _this), _this.events = ["resize", "scroll", "touchstart", "touchmove", "touchend", "pageshow", "load"], _this.subscribers = [], _this.rafHandle = null, _this.subscribe = function (handler) {
      _this.subscribers = _this.subscribers.concat(handler);
    }, _this.unsubscribe = function (handler) {
      _this.subscribers = _this.subscribers.filter(function (current) {
        return current !== handler;
      });
    }, _this.notifySubscribers = function (evt) {
      if (!_this.framePending) {
        var currentTarget = evt.currentTarget;


        _this.rafHandle = (0, _raf2.default)(function () {
          _this.framePending = false;

          var _this$node$getBoundin = _this.node.getBoundingClientRect(),
              top = _this$node$getBoundin.top,
              bottom = _this$node$getBoundin.bottom;

          _this.subscribers.forEach(function (handler) {
            return handler({
              distanceFromTop: top,
              distanceFromBottom: bottom,
              eventSource: currentTarget === window ? document.body : _this.node
            });
          });
        });
        _this.framePending = true;
      }
    }, _this.getParent = function () {
      return _this.node;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Container, [{
    key: "getChildContext",
    value: function getChildContext() {
      return {
        subscribe: this.subscribe,
        unsubscribe: this.unsubscribe,
        getParent: this.getParent
      };
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      this.events.forEach(function (event) {
        return window.addEventListener(event, _this2.notifySubscribers);
      });
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _this3 = this;

      if (this.rafHandle) {
        _raf2.default.cancel(this.rafHandle);
        this.rafHandle = null;
      }

      this.events.forEach(function (event) {
        return window.removeEventListener(event, _this3.notifySubscribers);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      return _react2.default.createElement("div", _extends({}, this.props, {
        ref: function ref(node) {
          return _this4.node = node;
        },
        onScroll: this.notifySubscribers,
        onTouchStart: this.notifySubscribers,
        onTouchMove: this.notifySubscribers,
        onTouchEnd: this.notifySubscribers
      }));
    }
  }]);

  return Container;
}(_react.PureComponent);

Container.childContextTypes = {
  subscribe: _propTypes2.default.func,
  unsubscribe: _propTypes2.default.func,
  getParent: _propTypes2.default.func
};
exports.default = Container;

/***/ }),

/***/ "./node_modules/react-sticky/lib/Sticky.js":
/*!*************************************************!*\
  !*** ./node_modules/react-sticky/lib/Sticky.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sticky = function (_Component) {
  _inherits(Sticky, _Component);

  function Sticky() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Sticky);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Sticky.__proto__ || Object.getPrototypeOf(Sticky)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      isSticky: false,
      wasSticky: false,
      style: {}
    }, _this.handleContainerEvent = function (_ref2) {
      var distanceFromTop = _ref2.distanceFromTop,
          distanceFromBottom = _ref2.distanceFromBottom,
          eventSource = _ref2.eventSource;

      var parent = _this.context.getParent();

      var preventingStickyStateChanges = false;
      if (_this.props.relative) {
        preventingStickyStateChanges = eventSource !== parent;
        distanceFromTop = -(eventSource.scrollTop + eventSource.offsetTop) + _this.placeholder.offsetTop;
      }

      var placeholderClientRect = _this.placeholder.getBoundingClientRect();
      var contentClientRect = _this.content.getBoundingClientRect();
      var calculatedHeight = contentClientRect.height;

      var bottomDifference = distanceFromBottom - _this.props.bottomOffset - calculatedHeight;

      var wasSticky = !!_this.state.isSticky;
      var isSticky = preventingStickyStateChanges ? wasSticky : distanceFromTop <= -_this.props.topOffset && distanceFromBottom > -_this.props.bottomOffset;

      distanceFromBottom = (_this.props.relative ? parent.scrollHeight - parent.scrollTop : distanceFromBottom) - calculatedHeight;

      var style = !isSticky ? {} : {
        position: "fixed",
        top: bottomDifference > 0 ? _this.props.relative ? parent.offsetTop - parent.offsetParent.scrollTop : 0 : bottomDifference,
        left: placeholderClientRect.left,
        width: placeholderClientRect.width
      };

      if (!_this.props.disableHardwareAcceleration) {
        style.transform = "translateZ(0)";
      }

      _this.setState({
        isSticky: isSticky,
        wasSticky: wasSticky,
        distanceFromTop: distanceFromTop,
        distanceFromBottom: distanceFromBottom,
        calculatedHeight: calculatedHeight,
        style: style
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Sticky, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      if (!this.context.subscribe) throw new TypeError("Expected Sticky to be mounted within StickyContainer");

      this.context.subscribe(this.handleContainerEvent);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.context.unsubscribe(this.handleContainerEvent);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.placeholder.style.paddingBottom = this.props.disableCompensation ? 0 : (this.state.isSticky ? this.state.calculatedHeight : 0) + "px";
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var element = _react2.default.cloneElement(this.props.children({
        isSticky: this.state.isSticky,
        wasSticky: this.state.wasSticky,
        distanceFromTop: this.state.distanceFromTop,
        distanceFromBottom: this.state.distanceFromBottom,
        calculatedHeight: this.state.calculatedHeight,
        style: this.state.style
      }), {
        ref: function ref(content) {
          _this2.content = _reactDom2.default.findDOMNode(content);
        }
      });

      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement("div", { ref: function ref(placeholder) {
            return _this2.placeholder = placeholder;
          } }),
        element
      );
    }
  }]);

  return Sticky;
}(_react.Component);

Sticky.propTypes = {
  topOffset: _propTypes2.default.number,
  bottomOffset: _propTypes2.default.number,
  relative: _propTypes2.default.bool,
  children: _propTypes2.default.func.isRequired
};
Sticky.defaultProps = {
  relative: false,
  topOffset: 0,
  bottomOffset: 0,
  disableCompensation: false,
  disableHardwareAcceleration: false
};
Sticky.contextTypes = {
  subscribe: _propTypes2.default.func,
  unsubscribe: _propTypes2.default.func,
  getParent: _propTypes2.default.func
};
exports.default = Sticky;

/***/ }),

/***/ "./node_modules/react-sticky/lib/index.js":
/*!************************************************!*\
  !*** ./node_modules/react-sticky/lib/index.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StickyContainer = exports.Sticky = undefined;

var _Sticky = __webpack_require__(/*! ./Sticky */ "./node_modules/react-sticky/lib/Sticky.js");

var _Sticky2 = _interopRequireDefault(_Sticky);

var _Container = __webpack_require__(/*! ./Container */ "./node_modules/react-sticky/lib/Container.js");

var _Container2 = _interopRequireDefault(_Container);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Sticky = _Sticky2.default;
exports.StickyContainer = _Container2.default;
exports.default = _Sticky2.default;

/***/ }),

/***/ "./node_modules/rgbcolor/index.js":
/*!****************************************!*\
  !*** ./node_modules/rgbcolor/index.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
	Based on rgbcolor.js by Stoyan Stefanov <sstoo@gmail.com>
	http://www.phpied.com/rgb-color-parser-in-javascript/
*/

module.exports = function(color_string) {
    this.ok = false;
    this.alpha = 1.0;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    color_string = simple_colors[color_string] || color_string;
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*((?:\d?\.)?\d)\)$/,
            example: ['rgba(123, 234, 45, 0.8)', 'rgba(255,234,245,1.0)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3]),
                    parseFloat(bits[4])
                ];
            }
        },
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            var channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            if (channels.length > 3) {
                this.alpha = channels[3];
            }
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
    this.alpha = (this.alpha < 0) ? 0 : ((this.alpha > 1.0 || isNaN(this.alpha)) ? 1.0 : this.alpha);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toRGBA = function () {
        return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.alpha + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }

    // help
    this.getHelpXML = function () {

        var examples = new Array();
        // add regexps
        for (var i = 0; i < color_defs.length; i++) {
            var example = color_defs[i].example;
            for (var j = 0; j < example.length; j++) {
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for (var sc in simple_colors) {
            examples[examples.length] = sc;
        }

        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for (var i = 0; i < examples.length; i++) {
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText =
                        'margin: 3px; '
                        + 'border: 1px solid black; '
                        + 'background:' + list_color.toHex() + '; '
                        + 'color:' + list_color.toHex()
                ;
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(
                    ' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex()
                );
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);

            } catch(e){}
        }
        return xml;

    }

}


/***/ }),

/***/ "./node_modules/strict-uri-encode/index.js":
/*!*************************************************!*\
  !*** ./node_modules/strict-uri-encode/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./node_modules/whatwg-fetch/fetch.js":
/*!********************************************!*\
  !*** ./node_modules/whatwg-fetch/fetch.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);


/***/ }),

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BlocklyVersion = exports.NOTIFICATION_ALERT_TYPE = exports.PROFANITY_FOUND = exports.TOOLBOX_EDIT_MODE = exports.BASE_DIALOG_WIDTH = exports.EXPO_SESSION_SECRET = exports.CIPHER = exports.ALPHABET = exports.SVG_NS = exports.Position = exports.KeyCodes = exports.HarvesterTerminationValue = exports.BeeTerminationValue = exports.TestResults = exports.ResultType = void 0;

/**
 * @fileoverview Constants used in production code and tests.
 */

/**
 * Enumeration of user program execution outcomes.
 * These are determined by each app.
 */
var ResultType = {
  UNSET: 0,
  // The result has not yet been computed.
  SUCCESS: 1,
  // The program completed successfully, achieving the goal.
  FAILURE: -1,
  // The program ran without error but did not achieve goal.
  TIMEOUT: 2,
  // The program did not complete (likely infinite loop).
  ERROR: -2 // The program generated an error.

};
/**
 * @typedef {number} TestResult
 */

/**
 * Enumeration of test results.
 * EMPTY_BLOCK_FAIL and EMPTY_FUNCTION_BLOCK_FAIL can only occur if
 * StudioApp.checkForEmptyBlocks_ is true.
 * A number of these results are enumerated on the dashboard side in
 * activity_constants.rb, and it's important that these two files are kept in
 * sync.
 * NOTE: We store the results for user attempts in our db, so changing these
 * values would necessitate a migration
 *
 * @enum {number}
 */

exports.ResultType = ResultType;
var TestResults = {
  // Default value before any tests are run.
  NO_TESTS_RUN: -1,
  // The level was not solved.
  GENERIC_FAIL: 0,
  // Used by DSL defined levels.
  EMPTY_BLOCK_FAIL: 1,
  // An "if" or "repeat" block was empty.
  TOO_FEW_BLOCKS_FAIL: 2,
  // Fewer than the ideal number of blocks used.
  LEVEL_INCOMPLETE_FAIL: 3,
  // Default failure to complete a level.
  MISSING_BLOCK_UNFINISHED: 4,
  // A required block was not used.
  EXTRA_TOP_BLOCKS_FAIL: 5,
  // There was more than one top-level block.
  RUNTIME_ERROR_FAIL: 6,
  // There was a runtime error in the program.
  SYNTAX_ERROR_FAIL: 7,
  // There was a syntax error in the program.
  MISSING_BLOCK_FINISHED: 10,
  // The level was solved without required block.
  APP_SPECIFIC_FAIL: 11,
  // Application-specific failure.
  EMPTY_FUNCTION_BLOCK_FAIL: 12,
  // A "function" block was empty
  UNUSED_PARAM: 13,
  // Param declared but not used in function.
  UNUSED_FUNCTION: 14,
  // Function declared but not used in workspace.
  PARAM_INPUT_UNATTACHED: 15,
  // Function not called with enough params.
  INCOMPLETE_BLOCK_IN_FUNCTION: 16,
  // Incomplete block inside a function.
  QUESTION_MARKS_IN_NUMBER_FIELD: 17,
  // Block has ??? instead of a value.
  EMPTY_FUNCTIONAL_BLOCK: 18,
  // There's a functional block with an open input
  EXAMPLE_FAILED: 19,
  // One of our examples didn't match the definition
  // start using negative values, since we consider >= 20 to be "solved"
  NESTED_FOR_SAME_VARIABLE: -2,
  // We have nested for loops each using the same counter variable
  // NOTE: for smoe period of time, this was -1 and conflicted with NO_TESTS_RUN
  EMPTY_FUNCTION_NAME: -3,
  // We have a variable or function with the name ""
  MISSING_RECOMMENDED_BLOCK_UNFINISHED: -4,
  // The level was attempted but not solved without a recommended block
  EXTRA_FUNCTION_FAIL: -5,
  // The program contains a JavaScript function when it should not
  LOCAL_FUNCTION_FAIL: -6,
  // The program contains an unexpected JavaScript local function
  GENERIC_LINT_FAIL: -7,
  // The program contains a lint error
  LOG_CONDITION_FAIL: -8,
  // The program execution log did not pass a required condition
  BLOCK_LIMIT_FAIL: -9,
  // Puzzle was solved using more than the toolbox limit of a block
  FREE_PLAY_UNCHANGED_FAIL: -10,
  // The code was not changed when the finish button was clicked
  // Codes for unvalidated levels.
  UNSUBMITTED_ATTEMPT: -50,
  // Progress was saved without submitting for review, or was unsubmitted.
  SKIPPED: -100,
  // Skipped, e.g. they used the skip button on a challenge level
  // The teacher has triggered a reset of progress through leaving "Keep working" feedback.
  // TEACHER_FEEDBACK_KEEP_WORKING is only set by the back-end
  TEACHER_FEEDBACK_KEEP_WORKING: -110,
  LEVEL_STARTED: -150,
  // The user has triggered the reset action at least once (ex: by clicking the reset button)
  // Numbers below 20 are generally considered some form of failure.
  // Numbers >= 20 generally indicate some form of success (although again there
  // are values like REVIEW_REJECTED_RESULT that don't seem to quite meet that restriction.
  MINIMUM_PASS_RESULT: 20,
  // The level was solved in a non-optimal way.  User may advance or retry.
  TOO_MANY_BLOCKS_FAIL: 20,
  // More than the ideal number of blocks were used.
  APP_SPECIFIC_ACCEPTABLE_FAIL: 21,
  // Application-specific acceptable failure.
  MISSING_RECOMMENDED_BLOCK_FINISHED: 22,
  // The level was solved without a recommended block
  // Numbers >= 30, are considered to be "perfectly" solved, i.e. those in the range
  // of 20-30 have correct but not optimal solutions
  MINIMUM_OPTIMAL_RESULT: 30,
  // The level was solved in an optimal way.
  FREE_PLAY: 30,
  // The user is in free-play mode.
  PASS_WITH_EXTRA_TOP_BLOCKS: 31,
  // There was more than one top-level block.
  APP_SPECIFIC_IMPERFECT_PASS: 32,
  // The level was passed in some optimal but not necessarily perfect way
  EDIT_BLOCKS: 70,
  // The user is creating/editing a new level.
  MANUAL_PASS: 90,
  // The level was manually set as perfected internally.
  // The level was solved in the ideal manner.
  ALL_PASS: 100,
  // Contained level result. Not validated, but should be treated as a success
  CONTAINED_LEVEL_RESULT: 101,
  // The level was solved with fewer blocks than the recommended number of blocks.
  BETTER_THAN_IDEAL: 102,
  SUBMITTED_RESULT: 1000,
  REVIEW_REJECTED_RESULT: 1500,
  REVIEW_ACCEPTED_RESULT: 2000
};
exports.TestResults = TestResults;
var BeeTerminationValue = {
  FAILURE: false,
  SUCCESS: true,
  INFINITE_LOOP: Infinity,
  NOT_AT_FLOWER: 1,
  // Tried to get nectar when not at flower.
  FLOWER_EMPTY: 2,
  // Tried to get nectar when flower empty.
  NOT_AT_HONEYCOMB: 3,
  // Tried to make honey when not at honeycomb.
  HONEYCOMB_FULL: 4,
  // Tried to make honey, but no room at honeycomb.
  UNCHECKED_CLOUD: 5,
  // Finished puzzle, but didn't check every clouded item
  UNCHECKED_PURPLE: 6,
  // Finished puzzle, but didn't check every purple flower
  INSUFFICIENT_NECTAR: 7,
  // Didn't collect all nectar by finish
  INSUFFICIENT_HONEY: 8,
  // Didn't make all honey by finish
  DID_NOT_COLLECT_EVERYTHING: 9 // For quantum levels, didn't try to collect all available honey/nectar

};
exports.BeeTerminationValue = BeeTerminationValue;
var HarvesterTerminationValue = {
  WRONG_CROP: 1,
  EMPTY_CROP: 2,
  DID_NOT_COLLECT_EVERYTHING: 3
};
exports.HarvesterTerminationValue = HarvesterTerminationValue;
var KeyCodes = {
  BACKSPACE: 8,
  ENTER: 13,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  COPY: 67,
  PASTE: 86,
  DELETE: 127
};
exports.KeyCodes = KeyCodes;
var Position = {
  OUTTOPOUTLEFT: 1,
  OUTTOPLEFT: 2,
  OUTTOPCENTER: 3,
  OUTTOPRIGHT: 4,
  OUTTOPOUTRIGHT: 5,
  TOPOUTLEFT: 6,
  TOPLEFT: 7,
  TOPCENTER: 8,
  TOPRIGHT: 9,
  TOPOUTRIGHT: 10,
  MIDDLEOUTLEFT: 11,
  MIDDLELEFT: 12,
  MIDDLECENTER: 13,
  MIDDLERIGHT: 14,
  MIDDLEOUTRIGHT: 15,
  BOTTOMOUTLEFT: 16,
  BOTTOMLEFT: 17,
  BOTTOMCENTER: 18,
  BOTTOMRIGHT: 19,
  BOTTOMOUTRIGHT: 20,
  OUTBOTTOMOUTLEFT: 21,
  OUTBOTTOMLEFT: 22,
  OUTBOTTOMCENTER: 23,
  OUTBOTTOMRIGHT: 24,
  OUTBOTTOMOUTRIGHT: 25
};
/** @const {string} SVG element namespace */

exports.Position = Position;
var SVG_NS = 'http://www.w3.org/2000/svg';
exports.SVG_NS = SVG_NS;
var ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
exports.ALPHABET = ALPHABET;
var CIPHER = 'Iq61F8kiaUHPGcsY7DgX4yAu3LwtWhnCmeR5pVrJoKfQZMx0BSdlOjEv2TbN9z';
exports.CIPHER = CIPHER;
var EXPO_SESSION_SECRET = '{"id":"fakefake-67ec-4314-a438-60589b9c0fa2","version":1,"expires_at":2000000000000}';
exports.EXPO_SESSION_SECRET = EXPO_SESSION_SECRET;
var BASE_DIALOG_WIDTH = 700;
exports.BASE_DIALOG_WIDTH = BASE_DIALOG_WIDTH;
var TOOLBOX_EDIT_MODE = 'toolbox_blocks';
exports.TOOLBOX_EDIT_MODE = TOOLBOX_EDIT_MODE;
var PROFANITY_FOUND = 'profanity_found';
exports.PROFANITY_FOUND = PROFANITY_FOUND;
var NOTIFICATION_ALERT_TYPE = 'notification';
exports.NOTIFICATION_ALERT_TYPE = NOTIFICATION_ALERT_TYPE;
var BlocklyVersion = {
  CDO: 'CDO',
  GOOGLE: 'Google'
};
exports.BlocklyVersion = BlocklyVersion;

/***/ }),

/***/ "./src/imageUtils.js":
/*!***************************!*\
  !*** ./src/imageUtils.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchURLAsBlob = fetchURLAsBlob;
exports.blobToDataURI = blobToDataURI;
exports.dataURIToSourceSize = dataURIToSourceSize;
exports.dataURIFromURI = dataURIFromURI;
exports.URIFromImageData = URIFromImageData;
exports.dataURIToFramedBlob = dataURIToFramedBlob;
exports.svgToDataURI = svgToDataURI;
exports.canvasToBlob = canvasToBlob;
exports.dataURIToBlob = dataURIToBlob;
exports.toImage = toImage;
exports.toCanvas = toCanvas;
exports.toImageData = toImageData;
exports.downloadBlobAsPng = downloadBlobAsPng;

var _blank_sharing_drawing = _interopRequireDefault(__webpack_require__(/*! ../static/turtle/blank_sharing_drawing.png */ "../dashboard/app/assets/images/blank_sharing_drawing.png"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function fetchURLAsBlob(url, onComplete) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';

  xhr.onload = function (e) {
    if (e.target.status === 200) {
      onComplete(null, e.target.response);
    } else {
      onComplete(new Error("URL ".concat(url, " responded with code ").concat(e.target.status)));
    }
  };

  xhr.onerror = function (e) {
    return onComplete(new Error("Error ".concat(e.target.status, " occurred while receiving the document.")));
  };

  xhr.send();
}

function blobToDataURI(blob, onComplete) {
  var fileReader = new FileReader();

  fileReader.onload = function (e) {
    return onComplete(e.target.result);
  };

  fileReader.readAsDataURL(blob);
}

function dataURIToSourceSize(dataURI) {
  return toImage(dataURI).then(function (image) {
    return {
      x: image.width,
      y: image.height
    };
  });
}

function dataURIFromURI(uri) {
  var canvas;
  return regeneratorRuntime.async(function dataURIFromURI$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(toCanvas(uri));

        case 2:
          canvas = _context.sent;
          return _context.abrupt("return", canvas.toDataURL());

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}

function URIFromImageData(imageData) {
  var canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  var context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

function dataURIToFramedBlob(dataURI, callback) {
  var frame = new Image();
  var imageData = new Image();
  imageData.src = dataURI;

  frame.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(frame, 0, 0);
    ctx.drawImage(imageData, 175, 52, 154, 154);

    if (canvas.toBlob) {
      canvas.toBlob(callback);
    }
  };

  frame.src = _blank_sharing_drawing["default"];
}

function svgToDataURI(svg) {
  var imageType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'image/png';
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return new Promise(function (resolve) {
    // Use lazy-loading to keep canvg (60KB) out of the initial download.
    __webpack_require__.e(/*! import() */ 3).then(__webpack_require__.t.bind(null, /*! ./util/svgelement-polyfill */ "./src/util/svgelement-polyfill.js", 7)).then(function () {
      svg.toDataURL(imageType, _objectSpread({}, options, {
        callback: resolve
      }));
    });
  });
}

function canvasToBlob(canvas) {
  return new Promise(function (resolve) {
    canvas.toBlob(resolve);
  });
}

function dataURIToBlob(uri) {
  var canvas;
  return regeneratorRuntime.async(function dataURIToBlob$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(toCanvas(uri));

        case 2:
          canvas = _context2.sent;
          _context2.next = 5;
          return regeneratorRuntime.awrap(canvasToBlob(canvas));

        case 5:
          return _context2.abrupt("return", _context2.sent);

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
}
/**
 * @typedef {string} ImageURI
 * A string in the form of an image URI or data URI; anything you might
 * assign to an <image>'s `src` attribute.  Examples:
 * "https://example.com/example.png"
 * "data:image/svg+xml,<svg..."
 * "data:image/png;base64,iVBOR..."
 */

/**
 * Given an input of a supported type, converts it to an HTMLImageElement.
 *
 * @param {Blob|HTMLImageElement|ImageURI} input
 * @returns {Promise<HTMLImageElement>}
 */


function toImage(input) {
  var src, cleanup;
  return regeneratorRuntime.async(function toImage$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!(input instanceof HTMLImageElement)) {
            _context3.next = 2;
            break;
          }

          return _context3.abrupt("return", input);

        case 2:
          cleanup = function cleanup() {};

          if (!(input instanceof Blob)) {
            _context3.next = 8;
            break;
          }

          src = URL.createObjectURL(input);

          cleanup = function cleanup() {
            return URL.revokeObjectURL(input);
          };

          _context3.next = 13;
          break;

        case 8:
          if (!(typeof input === 'string')) {
            _context3.next = 12;
            break;
          }

          src = input;
          _context3.next = 13;
          break;

        case 12:
          throw new Error('Unable to convert input to image');

        case 13:
          return _context3.abrupt("return", new Promise(function (resolve, reject) {
            var image = new Image();

            image.onload = function () {
              cleanup();
              resolve(image);
            };

            image.onerror = function (err) {
              cleanup();
              reject(err);
            };

            image.src = src;
          }));

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  });
}
/**
 * Given an input of a supported type, converts it to an HTMLCanvasElement.
 *
 * @param {Blob|HTMLCanvasElement|HTMLImageElement|ImageURI} input
 * @returns {Promise<HTMLCanvasElement>}
 */


function toCanvas(input) {
  var image, canvas, context;
  return regeneratorRuntime.async(function toCanvas$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!(input instanceof HTMLCanvasElement)) {
            _context4.next = 2;
            break;
          }

          return _context4.abrupt("return", input);

        case 2:
          _context4.prev = 2;
          _context4.next = 5;
          return regeneratorRuntime.awrap(toImage(input));

        case 5:
          image = _context4.sent;
          canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          return _context4.abrupt("return", canvas);

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](2);
          throw new Error('Unable to convert input to canvas: ' + _context4.t0);

        case 17:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[2, 14]]);
}
/**
 * Given an input of a supported type, converts it to an ImageData object.
 *
 * @param {Blob|HTMLCanvasElement|HTMLImageElement|ImageData|ImageURI} input
 * @returns {Promise<ImageData>}
 */


function toImageData(input) {
  var canvas;
  return regeneratorRuntime.async(function toImageData$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          if (!(input instanceof ImageData)) {
            _context5.next = 2;
            break;
          }

          return _context5.abrupt("return", input);

        case 2:
          _context5.prev = 2;
          _context5.next = 5;
          return regeneratorRuntime.awrap(toCanvas(input));

        case 5:
          canvas = _context5.sent;
          return _context5.abrupt("return", canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));

        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](2);
          throw new Error('Unable to convert input to ImageData: ' + _context5.t0);

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[2, 9]]);
}
/**
 * @param {Blob}
 */


function downloadBlobAsPng(blob) {
  var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'image.png';
  var download = document.createElement('a');
  download.href = URL.createObjectURL(blob);
  download.download = filename;
  download.click();
}

/***/ }),

/***/ "./src/polyfills.js":
/*!**************************!*\
  !*** ./src/polyfills.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _wgxpath = _interopRequireDefault(__webpack_require__(/*! wgxpath */ "./node_modules/wgxpath/wgxpath.install.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * A low-performance polyfill for toBlob based on toDataURL. Adapted from:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
 */
if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function value(callback, type, quality) {
      var binStr = atob(this.toDataURL(type, quality).split(',')[1]);
      var arr = new Uint8Array(binStr.length);

      for (var i = 0; i < binStr.length; i++) {
        arr[i] = binStr.charCodeAt(i);
      }

      var blob = new Blob([arr], {
        type: type || 'image/png'
      });
      callback(blob);
    }
  });
}
/**
 * Polyfill for svg.getElementsByClassName for IE11
 * From https://github.com/clientIO/joint/issues/117#issuecomment-194699222
 */


if (SVGElement.prototype.getElementsByClassName === undefined) {
  SVGElement.prototype.getElementsByClassName = function (className) {
    return this.querySelectorAll('.' + className);
  };
}
/**
 * Polyfill for document.evaluate for IE
 */


if (!document.evaluate) {
  _wgxpath["default"].install(window);
}

/***/ }),

/***/ "./src/templates/SearchBar.jsx":
/*!*************************************!*\
  !*** ./src/templates/SearchBar.jsx ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _color = _interopRequireDefault(__webpack_require__(/*! @cdo/apps/util/color */ "./src/util/color.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SearchBar =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(SearchBar, _React$Component);

  function SearchBar() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = SearchBar.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this.searchBox.focus();
  };

  _proto.render = function render() {
    var _this = this;

    return _react["default"].createElement("div", {
      style: styles.searchArea
    }, _react["default"].createElement("span", {
      className: "fa fa-search",
      style: styles.icon
    }), _react["default"].createElement("input", {
      style: styles.input,
      placeholder: this.props.placeholderText,
      onChange: this.props.onChange,
      ref: function ref(input) {
        _this.searchBox = input;
      }
    }), this.props.clearButton && _react["default"].createElement("span", {
      className: "fa fa-close",
      style: styles.clearIcon,
      onClick: function onClick() {
        _this.searchBox.value = '';

        _this.props.onChange();
      }
    }));
  };

  return SearchBar;
}(_react["default"].Component);

exports["default"] = SearchBar;

_defineProperty(SearchBar, "propTypes", {
  placeholderText: _propTypes["default"].string.isRequired,
  onChange: _propTypes["default"].func.isRequired,
  clearButton: _propTypes["default"].bool
});

var BORDER_WIDTH = 1;
var BORDER_COLOR = _color["default"].light_gray;
var BORDER_RADIUS = 4; // We have side-by-side elements that should format sort of like one element

var styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '3px 7px',
    margin: 0,
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderRadius: BORDER_RADIUS,
    textIndent: 22
  },
  icon: {
    position: 'absolute',
    top: 6,
    left: 5,
    fontSize: 16,
    color: _color["default"].light_gray
  },
  clearIcon: {
    position: 'absolute',
    top: 6,
    right: 5,
    fontSize: 16,
    color: _color["default"].light_gray,
    cursor: 'pointer'
  },
  searchArea: {
    position: 'relative',
    margin: '10px 0'
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/backButton.jsx":
/*!*********************************************!*\
  !*** ./src/tutorialExplorer/backButton.jsx ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* BackButton: A button shown above the filters that goes back to /learn.
 */
var styles = {
  backButton: {
    marginTop: 7,
    marginBottom: 13
  }
};

var BackButton = function BackButton(props) {
  return _react["default"].createElement("a", {
    href: "./index.html"
  }, _react["default"].createElement("button", {
    type: "button",
    style: styles.backButton
  }, _react["default"].createElement("i", {
    className: "fa fa-arrow-left",
    "aria-hidden": true
  }), "\xA0", _locale["default"].backButtonBack()));
};

var _default = BackButton;
exports["default"] = _default;
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/filterChoice.jsx":
/*!***********************************************!*\
  !*** ./src/tutorialExplorer/filterChoice.jsx ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FilterChoice =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(FilterChoice, _React$Component);

  function FilterChoice() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "handleChange", function (event) {
      _this.props.onUserInput(_this.props.groupName, _this.props.name, event.target.checked);
    });

    return _this;
  }

  var _proto = FilterChoice.prototype;

  _proto.render = function render() {
    var type = this.props.singleEntry ? 'radio' : 'checkbox';
    return _react["default"].createElement("div", {
      style: styles.filterChoiceOuter
    }, _react["default"].createElement("label", {
      style: styles.filterChoiceLabel
    }, _react["default"].createElement("input", {
      type: type,
      checked: this.props.selected,
      onChange: this.handleChange,
      style: styles.filterChoiceInput
    }), this.props.text));
  };

  return FilterChoice;
}(_react["default"].Component);

exports["default"] = FilterChoice;

_defineProperty(FilterChoice, "propTypes", {
  onUserInput: _propTypes["default"].func.isRequired,
  groupName: _propTypes["default"].string.isRequired,
  name: _propTypes["default"].string.isRequired,
  selected: _propTypes["default"].bool.isRequired,
  text: _propTypes["default"].string.isRequired,
  singleEntry: _propTypes["default"].bool.isRequired
});

var styles = {
  filterChoiceOuter: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    MsUserSelect: 'none'
  },
  filterChoiceLabel: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 13,
    paddingBottom: 0,
    marginBottom: 0,
    cursor: 'pointer'
  },
  filterChoiceInput: {
    marginRight: 5
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/filterGroup.jsx":
/*!**********************************************!*\
  !*** ./src/tutorialExplorer/filterGroup.jsx ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _filterGroupContainer = _interopRequireDefault(__webpack_require__(/*! ./filterGroupContainer */ "./src/tutorialExplorer/filterGroupContainer.jsx"));

var _filterChoice = _interopRequireDefault(__webpack_require__(/*! ./filterChoice */ "./src/tutorialExplorer/filterChoice.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FilterGroup =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(FilterGroup, _React$Component);

  function FilterGroup() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = FilterGroup.prototype;

  _proto.render = function render() {
    var _this = this;

    return _react["default"].createElement(_filterGroupContainer["default"], {
      text: this.props.text
    }, this.props.filterEntries.map(function (item) {
      return _react["default"].createElement(_filterChoice["default"], {
        groupName: _this.props.name,
        name: item.name,
        text: item.text,
        selected: _this.props.selection && _this.props.selection.indexOf(item.name) !== -1,
        onUserInput: _this.props.onUserInput,
        singleEntry: _this.props.singleEntry,
        key: item.name
      });
    }));
  };

  return FilterGroup;
}(_react["default"].Component);

exports["default"] = FilterGroup;

_defineProperty(FilterGroup, "propTypes", {
  name: _propTypes["default"].string.isRequired,
  text: _propTypes["default"].string.isRequired,
  filterEntries: _propTypes["default"].array.isRequired,
  selection: _propTypes["default"].array.isRequired,
  onUserInput: _propTypes["default"].func.isRequired,
  singleEntry: _propTypes["default"].bool.isRequired
});

module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/filterGroupContainer.jsx":
/*!*******************************************************!*\
  !*** ./src/tutorialExplorer/filterGroupContainer.jsx ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _responsive = __webpack_require__(/*! ./responsive */ "./src/tutorialExplorer/responsive.jsx");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FilterGroupContainer =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(FilterGroupContainer, _React$Component);

  function FilterGroupContainer() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = FilterGroupContainer.prototype;

  _proto.render = function render() {
    var filterGroupOuterStyle = _objectSpread({}, styles.filterGroupOuter, {
      width: (0, _responsive.getResponsiveValue)({
        xs: 100,
        sm: 50,
        md: 100
      })
    });

    return _react["default"].createElement("div", {
      style: filterGroupOuterStyle
    }, _react["default"].createElement("div", {
      style: styles.filterGroupText
    }, this.props.text), this.props.children);
  };

  return FilterGroupContainer;
}(_react["default"].Component);

exports["default"] = FilterGroupContainer;

_defineProperty(FilterGroupContainer, "propTypes", {
  text: _propTypes["default"].string.isRequired,
  children: _propTypes["default"].node.isRequired
});

var styles = {
  filterGroupOuter: {
    "float": 'left',
    paddingBottom: 20,
    paddingRight: 40,
    paddingLeft: 10
  },
  filterGroupText: {
    fontFamily: '"Gotham 5r", sans-serif',
    borderBottom: 'solid grey 1px'
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/filterGroupHeaderSelection.jsx":
/*!*************************************************************!*\
  !*** ./src/tutorialExplorer/filterGroupHeaderSelection.jsx ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FilterGroupHeaderSelection =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(FilterGroupHeaderSelection, _React$Component);

  function FilterGroupHeaderSelection() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "handleChange", function (value) {
      _this.props.onUserInput(_this.props.filterGroup.name, value, true);
    });

    return _this;
  }

  var _proto = FilterGroupHeaderSelection.prototype;

  _proto.itemStyle = function itemStyle(index) {
    var value = this.props.selection[0];
    var selectedIndex = this.props.filterGroup.entries.findIndex(function (item) {
      return item.name === value;
    }); // When we have two unselected items next to each other, we want to draw a grey
    // vertical divider between them, and that's done by rendering a border-left
    // of the item on the right.

    if (index === selectedIndex) {
      // The selected item.
      return styles.select;
    } else if (index === 0) {
      // The first item.
      return {};
    } else if (index - 1 !== selectedIndex) {
      // An item that is not immediately to the right of the selected item.
      return styles.borderOnLeft;
    } else {
      // An item immediately to the right of the selected item.
      return {};
    }
  };

  _proto.render = function render() {
    var _this2 = this;

    return _react["default"].createElement("div", {
      style: _objectSpread({}, styles.container, this.props.containerStyle)
    }, _react["default"].createElement("div", {
      style: styles.flexContainer
    }, this.props.filterGroup.entries.map(function (item, index) {
      return _react["default"].createElement("div", {
        key: item.name,
        onClick: _this2.handleChange.bind(_this2, item.name),
        style: _objectSpread({}, styles.item, _this2.itemStyle(index))
      }, item.text);
    })));
  };

  return FilterGroupHeaderSelection;
}(_react["default"].Component);

exports["default"] = FilterGroupHeaderSelection;

_defineProperty(FilterGroupHeaderSelection, "propTypes", {
  containerStyle: _propTypes["default"].object.isRequired,
  filterGroup: _propTypes["default"].object.isRequired,
  selection: _propTypes["default"].array.isRequired,
  onUserInput: _propTypes["default"].func.isRequired
});

var styles = {
  container: {
    display: 'inline-block',
    marginTop: 6,
    overflow: 'hidden',
    height: 34,
    lineHeight: '34px',
    border: 'solid 1px #a2a2a2',
    borderRadius: 5
  },
  flexContainer: {
    display: 'flex',
    flexWrap: 'nowrap'
  },
  item: {
    backgroundColor: 'white',
    color: 'dimgrey',
    fontFamily: "'Gotham 4r', sans-serif",
    fontSize: 15,
    cursor: 'pointer',
    "float": 'left',
    textAlign: 'center',
    flex: 1,
    userSelect: 'none',
    boxSizing: 'border-box',
    borderLeft: 'solid 1px white'
  },
  select: {
    backgroundColor: '#2799a4',
    color: 'white',
    borderLeft: 'solid 1px #2799a4'
  },
  borderOnLeft: {
    borderLeft: 'solid 1px #a2a2a2'
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/filterGroupOrgNames.jsx":
/*!******************************************************!*\
  !*** ./src/tutorialExplorer/filterGroupOrgNames.jsx ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _filterGroupContainer = _interopRequireDefault(__webpack_require__(/*! ./filterGroupContainer */ "./src/tutorialExplorer/filterGroupContainer.jsx"));

var _util = __webpack_require__(/*! ./util */ "./src/tutorialExplorer/util.jsx");

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FilterGroupOrgNames =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(FilterGroupOrgNames, _React$Component);

  function FilterGroupOrgNames() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "handleChangeOrgName", function (event) {
      _this.props.onUserInput(event.target.value);
    });

    return _this;
  }

  var _proto = FilterGroupOrgNames.prototype;

  _proto.truncateOrgName = function truncateOrgName(orgName) {
    // Truncate and ellipsis organization name to limit length in dropdown.
    var maxOrgNameChars = 25;

    if (orgName.length > maxOrgNameChars) {
      return orgName.substring(0, maxOrgNameChars) + '...';
    } else {
      return orgName;
    }
  };

  _proto.render = function render() {
    var _this2 = this;

    return _react["default"].createElement(_filterGroupContainer["default"], {
      text: _locale["default"].filterOrgNames()
    }, _react["default"].createElement("label", {
      htmlFor: "filter-org-names-dropdown",
      className: "hidden-label"
    }, _locale["default"].filterOrgNames()), _react["default"].createElement("select", {
      id: "filter-org-names-dropdown",
      value: this.props.orgName,
      onChange: this.handleChangeOrgName,
      style: styles.select,
      className: "noFocusButton"
    }, _react["default"].createElement("option", {
      key: _util.TutorialsOrgName.all,
      value: _util.TutorialsOrgName.all
    }, _locale["default"].filterOrgNamesAll()), this.props.uniqueOrgNames.map(function (item) {
      return _react["default"].createElement("option", {
        key: item,
        value: item
      }, _this2.truncateOrgName(item));
    })));
  };

  return FilterGroupOrgNames;
}(_react["default"].Component);

exports["default"] = FilterGroupOrgNames;

_defineProperty(FilterGroupOrgNames, "propTypes", {
  orgName: _propTypes["default"].string.isRequired,
  uniqueOrgNames: _propTypes["default"].arrayOf(_propTypes["default"].string).isRequired,
  onUserInput: _propTypes["default"].func.isRequired
});

var styles = {
  select: {
    width: '100%',
    marginTop: 10,
    height: 26,
    fontSize: 13
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/filterGroupSortBy.jsx":
/*!****************************************************!*\
  !*** ./src/tutorialExplorer/filterGroupSortBy.jsx ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _filterGroupContainer = _interopRequireDefault(__webpack_require__(/*! ./filterGroupContainer */ "./src/tutorialExplorer/filterGroupContainer.jsx"));

var _util = __webpack_require__(/*! ./util */ "./src/tutorialExplorer/util.jsx");

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FilterGroupSortBy =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(FilterGroupSortBy, _React$Component);

  function FilterGroupSortBy() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "handleChangeSort", function (event) {
      _this.props.onUserInput(event.target.value);
    });

    return _this;
  }

  var _proto = FilterGroupSortBy.prototype;

  _proto.render = function render() {
    // Show the default sort criteria first.  That way, when the dropdown that
    // shows "Sort" is opened to show the two possible options, the default
    // will be first and will get the checkmark that seems to be always shown
    // next to the first option.
    var sortOptions;

    if (this.props.defaultSortBy === _util.TutorialsSortByOptions.popularityrank) {
      sortOptions = [{
        value: 'popularityrank',
        text: _locale["default"].filterSortByPopularityRank()
      }, {
        value: 'displayweight',
        text: _locale["default"].filterSortByDisplayWeight()
      }];
    } else {
      sortOptions = [{
        value: 'displayweight',
        text: _locale["default"].filterSortByDisplayWeight()
      }, {
        value: 'popularityrank',
        text: _locale["default"].filterSortByPopularityRank()
      }];
    }

    return _react["default"].createElement(_filterGroupContainer["default"], {
      text: _locale["default"].filterSortBy()
    }, _react["default"].createElement("label", {
      htmlFor: "filter-sort-by-dropdown",
      className: "hidden-label"
    }, _locale["default"].filterSortBy()), _react["default"].createElement("select", {
      id: "filter-sort-by-dropdown",
      value: this.props.sortBy,
      onChange: this.handleChangeSort,
      style: styles.select,
      className: "noFocusButton"
    }, _react["default"].createElement("option", {
      value: sortOptions[0].value
    }, sortOptions[0].text), _react["default"].createElement("option", {
      value: sortOptions[1].value
    }, sortOptions[1].text)));
  };

  return FilterGroupSortBy;
}(_react["default"].Component);

exports["default"] = FilterGroupSortBy;

_defineProperty(FilterGroupSortBy, "propTypes", {
  defaultSortBy: _propTypes["default"].oneOf(Object.keys(_util.TutorialsSortByOptions)).isRequired,
  sortBy: _propTypes["default"].oneOf(Object.keys(_util.TutorialsSortByOptions)).isRequired,
  onUserInput: _propTypes["default"].func.isRequired
});

var styles = {
  select: {
    width: '100%',
    marginTop: 10,
    height: 26,
    fontSize: 13
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/filterHeader.jsx":
/*!***********************************************!*\
  !*** ./src/tutorialExplorer/filterHeader.jsx ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _backButton = _interopRequireDefault(__webpack_require__(/*! ./backButton */ "./src/tutorialExplorer/backButton.jsx"));

var _filterGroupHeaderSelection = _interopRequireDefault(__webpack_require__(/*! ./filterGroupHeaderSelection */ "./src/tutorialExplorer/filterGroupHeaderSelection.jsx"));

var _responsive = __webpack_require__(/*! ./responsive */ "./src/tutorialExplorer/responsive.jsx");

var _reactSticky = __webpack_require__(/*! react-sticky */ "./node_modules/react-sticky/lib/index.js");

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FilterHeader =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(FilterHeader, _React$Component);

  function FilterHeader() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = FilterHeader.prototype;

  _proto.shouldShowOpenFiltersButton = function shouldShowOpenFiltersButton() {
    return this.props.mobileLayout && !this.props.showingModalFilters;
  };

  _proto.shouldShowCloseFiltersButton = function shouldShowCloseFiltersButton() {
    return this.props.mobileLayout && this.props.showingModalFilters;
  };

  _proto.render = function render() {
    var _this = this;

    var tutorialCount = this.props.filteredTutorialsCount;
    var tutorialCountString = tutorialCount === 1 ? _locale["default"].filterHeaderTutorialCountSingle() : _locale["default"].filterHeaderTutorialCountPlural({
      tutorial_count: tutorialCount
    }); // There are two filters which can appear in this header at desktop width.
    // Check explicitly for each.

    var filterGroupGrade = null;
    var filterGroupHeaderStudentExperience = null;

    if (!this.props.mobileLayout) {
      filterGroupGrade = this.props.filterGroups.find(function (item) {
        return item.name === 'grade';
      });
      filterGroupHeaderStudentExperience = this.props.filterGroups.find(function (item) {
        return item.name === 'student_experience';
      });
    }

    return _react["default"].createElement("div", {
      style: styles.header
    }, this.props.backButton && _react["default"].createElement(_backButton["default"], null), _react["default"].createElement(_reactSticky.Sticky, null, function (_ref) {
      var style = _ref.style;
      return _react["default"].createElement("div", {
        style: _objectSpread({}, style, {
          zIndex: 1
        }, (0, _responsive.getResponsiveValue)({
          xs: styles.barMobile,
          md: styles.barDesktop
        }))
      }, !_this.props.mobileLayout && _react["default"].createElement("div", {
        style: styles.full
      }, filterGroupGrade && _react["default"].createElement(_filterGroupHeaderSelection["default"], {
        containerStyle: styles.filterGroupGradeContainer,
        filterGroup: filterGroupGrade,
        selection: _this.props.selection['grade'],
        onUserInput: _this.props.onUserInputFilter
      }), filterGroupHeaderStudentExperience && _react["default"].createElement(_filterGroupHeaderSelection["default"], {
        containerStyle: styles.filterGroupStudentExperienceContainer,
        filterGroup: filterGroupHeaderStudentExperience,
        selection: _this.props.selection['student_experience'],
        onUserInput: _this.props.onUserInputFilter
      })), _this.props.mobileLayout && _react["default"].createElement("div", null, _react["default"].createElement("div", {
        style: styles.left
      }, _react["default"].createElement("span", {
        style: styles.mobileCount
      }, tutorialCountString)), _react["default"].createElement("div", {
        style: styles.right
      }, _this.shouldShowOpenFiltersButton() && _react["default"].createElement("span", null, _react["default"].createElement("button", {
        type: "button",
        onClick: _this.props.showModalFilters,
        style: styles.button,
        className: "noFocusButton"
      }, _locale["default"].filterHeaderShowFilters())), _this.shouldShowCloseFiltersButton() && _react["default"].createElement("span", null, _react["default"].createElement("button", {
        type: "button",
        onClick: _this.props.hideModalFilters,
        style: styles.button,
        className: "noFocusButton"
      }, _locale["default"].filterHeaderHideFilters())))));
    }));
  };

  return FilterHeader;
}(_react["default"].Component);

exports["default"] = FilterHeader;

_defineProperty(FilterHeader, "propTypes", {
  mobileLayout: _propTypes["default"].bool.isRequired,
  filterGroups: _propTypes["default"].array.isRequired,
  selection: _propTypes["default"].objectOf(_propTypes["default"].arrayOf(_propTypes["default"].string)).isRequired,
  onUserInputFilter: _propTypes["default"].func.isRequired,
  backButton: _propTypes["default"].bool,
  filteredTutorialsCount: _propTypes["default"].number.isRequired,
  showingModalFilters: _propTypes["default"].bool.isRequired,
  showModalFilters: _propTypes["default"].func.isRequired,
  hideModalFilters: _propTypes["default"].func.isRequired
});

var styles = {
  header: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 7,
    paddingRight: 7,
    backgroundColor: 'white'
  },
  barDesktop: {
    color: 'dimgrey',
    height: 46,
    overflow: 'hidden',
    backgroundColor: 'white'
  },
  barMobile: {
    color: 'white',
    height: 46,
    overflow: 'hidden',
    backgroundColor: 'white'
  },
  button: {
    backgroundColor: '#2799a4',
    color: 'white',
    borderColor: 'white',
    height: 34
  },
  full: {
    "float": 'left',
    width: '100%'
  },
  left: {
    "float": 'left',
    marginLeft: 6
  },
  right: {
    "float": 'right',
    marginTop: 6,
    marginRight: 6
  },
  mobileCount: {
    lineHeight: '46px',
    paddingLeft: 6,
    color: 'dimgrey'
  },
  filterGroupGradeContainer: {
    width: '68%',
    "float": 'left'
  },
  filterGroupStudentExperienceContainer: {
    width: '28%',
    "float": 'right'
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/filterSet.jsx":
/*!********************************************!*\
  !*** ./src/tutorialExplorer/filterSet.jsx ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _filterGroup = _interopRequireDefault(__webpack_require__(/*! ./filterGroup */ "./src/tutorialExplorer/filterGroup.jsx"));

var _roboticsButton = _interopRequireDefault(__webpack_require__(/*! ./roboticsButton */ "./src/tutorialExplorer/roboticsButton.jsx"));

var _filterGroupSortBy = _interopRequireDefault(__webpack_require__(/*! ./filterGroupSortBy */ "./src/tutorialExplorer/filterGroupSortBy.jsx"));

var _filterGroupOrgNames = _interopRequireDefault(__webpack_require__(/*! ./filterGroupOrgNames */ "./src/tutorialExplorer/filterGroupOrgNames.jsx"));

var _util = __webpack_require__(/*! ./util */ "./src/tutorialExplorer/util.jsx");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FilterSet =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(FilterSet, _React$Component);

  function FilterSet() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "displayItem", function (item) {
      // Ensure that item isn't forced hidden, and that it's not hidden due to being
      // desktop layout.
      return item.display !== false && (_this.props.mobileLayout || !_this.props.mobileLayout && !item.headerOnDesktop);
    });

    return _this;
  }

  var _proto = FilterSet.prototype;

  _proto.render = function render() {
    var _this2 = this;

    return _react["default"].createElement("div", null, this.props.showSortDropdown && _react["default"].createElement(_filterGroupSortBy["default"], {
      defaultSortBy: this.props.defaultSortBy,
      sortBy: this.props.sortBy,
      onUserInput: this.props.onUserInputSortBy
    }), _react["default"].createElement(_filterGroupOrgNames["default"], {
      orgName: this.props.orgName,
      uniqueOrgNames: this.props.uniqueOrgNames,
      onUserInput: this.props.onUserInputOrgName
    }), this.props.filterGroups.map(function (item) {
      return _this2.displayItem(item) && _react["default"].createElement(_filterGroup["default"], {
        name: item.name,
        text: item.text,
        filterEntries: item.entries,
        onUserInput: _this2.props.onUserInputFilter,
        selection: _this2.props.selection[item.name],
        singleEntry: item.singleEntry || false,
        key: item.name
      });
    }), this.props.roboticsButtonUrl && _react["default"].createElement(_roboticsButton["default"], {
      url: this.props.roboticsButtonUrl
    }));
  };

  return FilterSet;
}(_react["default"].Component);

exports["default"] = FilterSet;

_defineProperty(FilterSet, "propTypes", {
  mobileLayout: _propTypes["default"].bool.isRequired,
  uniqueOrgNames: _propTypes["default"].arrayOf(_propTypes["default"].string).isRequired,
  orgName: _propTypes["default"].string,
  showSortDropdown: _propTypes["default"].bool.isRequired,
  defaultSortBy: _propTypes["default"].oneOf(Object.keys(_util.TutorialsSortByOptions)).isRequired,
  sortBy: _propTypes["default"].oneOf(Object.keys(_util.TutorialsSortByOptions)).isRequired,
  filterGroups: _propTypes["default"].array.isRequired,
  selection: _propTypes["default"].objectOf(_propTypes["default"].arrayOf(_propTypes["default"].string)).isRequired,
  onUserInputFilter: _propTypes["default"].func.isRequired,
  onUserInputOrgName: _propTypes["default"].func.isRequired,
  onUserInputSortBy: _propTypes["default"].func.isRequired,
  roboticsButtonUrl: _propTypes["default"].string
});

module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/image.jsx":
/*!****************************************!*\
  !*** ./src/tutorialExplorer/image.jsx ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _reactDom = _interopRequireDefault(__webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Image =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Image, _React$Component);

  function Image() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "state", {
      loaded: false
    });

    _defineProperty(_assertThisInitialized(_this), "onImageLoad", function () {
      return _this.setState({
        loaded: true
      });
    });

    return _this;
  }

  var _proto = Image.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var imgTag = _reactDom["default"].findDOMNode(this.refs.img);

    var imgSrc = imgTag.getAttribute('src');
    var img = new window.Image();
    img.src = imgSrc;
  };

  _proto.render = function render() {
    var style;

    if (this.state.loaded) {
      style = {
        opacity: 1,
        transition: 'opacity 200ms ease-in'
      };
    } else {
      style = {
        opacity: 0.1
      };
    }

    return _react["default"].createElement("img", _extends({
      ref: "img"
    }, this.props, {
      style: _objectSpread({}, this.props.style, style),
      onLoad: this.onImageLoad
    }));
  };

  return Image;
}(_react["default"].Component);

exports["default"] = Image;

_defineProperty(Image, "propTypes", {
  style: _propTypes["default"].object.isRequired
});

module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/locale-do-not-import.js":
/*!******************************************************!*\
  !*** ./src/tutorialExplorer/locale-do-not-import.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _safeLoadLocale = _interopRequireDefault(__webpack_require__(/*! @cdo/apps/util/safeLoadLocale */ "./src/util/safeLoadLocale.js"));

var _i18nStringTracker = _interopRequireDefault(__webpack_require__(/*! @cdo/apps/util/i18nStringTracker */ "./src/util/i18nStringTracker.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/tutorialExplorer/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
var locale = (0, _safeLoadLocale["default"])('tutorialExplorer_locale');
locale = (0, _i18nStringTracker["default"])(locale, 'tutorialExplorer');
module.exports = locale;

/***/ }),

/***/ "./src/tutorialExplorer/responsive.jsx":
/*!*********************************************!*\
  !*** ./src/tutorialExplorer/responsive.jsx ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResponsiveContainerWidth = getResponsiveContainerWidth;
exports.getResponsiveWindowWidth = getResponsiveWindowWidth;
exports.isResponsiveCategoryActive = isResponsiveCategoryActive;
exports.isResponsiveCategoryInactive = isResponsiveCategoryInactive;
exports.getResponsiveValue = getResponsiveValue;

var _jquery = _interopRequireDefault(__webpack_require__(/*! jquery */ "jquery"));

var utils = _interopRequireWildcard(__webpack_require__(/*! ../utils */ "./src/utils.js"));

var _responsiveWindowWidt;

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Gets the container width.
 * Returns either a number (e.g. 1170) or a string (e.g. "97%").
 */
function getResponsiveContainerWidth() {
  var windowWidth = (0, _jquery["default"])(window).width();

  if (windowWidth >= 1200) {
    return 1170;
  } else {
    return '97%';
  }
} // makeEnum comes from apps/src/utils


var ResponsiveSize = utils.makeEnum('lg', 'md', 'sm', 'xs'); // Window widths that are the starting points for each width category.

var responsiveWindowWidth = (_responsiveWindowWidt = {}, _defineProperty(_responsiveWindowWidt, ResponsiveSize.lg, 1024), _defineProperty(_responsiveWindowWidt, ResponsiveSize.md, 820), _defineProperty(_responsiveWindowWidt, ResponsiveSize.sm, 650), _defineProperty(_responsiveWindowWidt, ResponsiveSize.xs, 0), _responsiveWindowWidt);
/**
 * Returns the window width that is the starting point for a width category.
 *
 * @param {string} id - "xs", "sm", "md", or "lg"
 */

function getResponsiveWindowWidth(category) {
  return responsiveWindowWidth[category];
}
/**
 * Returns whether provided category is active, given current window width.
 * e.g. called with "md" when window width >= 820px returns true.
 *
 * @param {string} id - "xs", "sm", "md", or "lg"
 */


function isResponsiveCategoryActive(category) {
  return (0, _jquery["default"])(window).width() >= responsiveWindowWidth[category];
}
/**
 * Returns whether provided category is inactive, given current window width.
 * e.g. called with "md" when window width < 820px returns false.
 *
 * @param {string} id - "xs", "sm", "md", or "lg"
 */


function isResponsiveCategoryInactive(category) {
  return (0, _jquery["default"])(window).width() < responsiveWindowWidth[category];
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


function getResponsiveValue(values) {
  var windowWidth = (0, _jquery["default"])(window).width();
  var value;

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
    if (typeof value === 'number') {
      return "".concat(value, "%");
    } else if (typeof value === 'string') {
      return value;
    } else if (_typeof(value) === 'object') {
      return value;
    }
  }
}

/***/ }),

/***/ "./src/tutorialExplorer/roboticsButton.jsx":
/*!*************************************************!*\
  !*** ./src/tutorialExplorer/roboticsButton.jsx ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _responsive = __webpack_require__(/*! ./responsive */ "./src/tutorialExplorer/responsive.jsx");

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RoboticsButton =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(RoboticsButton, _React$Component);

  function RoboticsButton() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = RoboticsButton.prototype;

  _proto.render = function render() {
    var roboticsTextStyle = _objectSpread({}, styles.roboticsText, {
      display: (0, _responsive.getResponsiveValue)({
        xs: 'block',
        md: 'none'
      })
    });

    return _react["default"].createElement("div", null, _react["default"].createElement("div", {
      style: {
        display: (0, _responsive.getResponsiveValue)({
          md: 'block',
          xs: 'none'
        })
      }
    }, _react["default"].createElement("div", {
      style: styles.button
    }, _react["default"].createElement("a", {
      href: this.props.url
    }, _react["default"].createElement("div", {
      style: styles.container
    }, _react["default"].createElement("img", {
      src: "learn_files/robotics-link.png",
      style: styles.roboticsButtonImage,
      alt: ""
    }), _react["default"].createElement("div", {
      style: styles.roboticsButtonText
    }, _locale["default"].roboticsButtonText(), "\xA0", _react["default"].createElement("i", {
      className: "fa fa-arrow-right",
      "aria-hidden": true
    })))))), _react["default"].createElement("div", {
      style: roboticsTextStyle
    }, _react["default"].createElement("a", {
      href: this.props.url
    }, _locale["default"].roboticsText())));
  };

  return RoboticsButton;
}(_react["default"].Component);

exports["default"] = RoboticsButton;

_defineProperty(RoboticsButton, "propTypes", {
  url: _propTypes["default"].string
});

var styles = {
  button: {
    "float": 'left',
    width: '100%',
    paddingLeft: 10,
    paddingRight: 40
  },
  container: {
    position: 'relative'
  },
  roboticsButtonImage: {
    marginTop: 10,
    marginBottom: 20,
    width: '100%'
  },
  roboticsButtonText: {
    fontFamily: "'Gotham 4r', sans-serif",
    position: 'absolute',
    top: 0,
    left: 0,
    margin: '25px 15px 15px 15px',
    color: 'white',
    textAlign: 'center',
    fontSize: 16
  },
  roboticsText: {
    "float": 'left',
    margin: 5,
    padding: 5,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#eee'
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/search.jsx":
/*!*****************************************!*\
  !*** ./src/tutorialExplorer/search.jsx ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _filterGroupContainer = _interopRequireDefault(__webpack_require__(/*! ./filterGroupContainer */ "./src/tutorialExplorer/filterGroupContainer.jsx"));

var _SearchBar = _interopRequireDefault(__webpack_require__(/*! ../templates/SearchBar */ "./src/templates/SearchBar.jsx"));

var _debounce = _interopRequireDefault(__webpack_require__(/*! lodash/debounce */ "./node_modules/lodash/debounce.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Search =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Search, _React$Component);

  function Search() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "debouncedOnChange", (0, _debounce["default"])(_this.props.onChange, 300));

    _defineProperty(_assertThisInitialized(_this), "handleChange", function (e) {
      var value = e ? e.target.value : '';

      _this.debouncedOnChange(value);
    });

    return _this;
  }

  var _proto = Search.prototype;

  _proto.render = function render() {
    return _react["default"].createElement(_filterGroupContainer["default"], {
      text: "Search"
    }, _react["default"].createElement(_SearchBar["default"], {
      clearButton: this.props.showClearIcon,
      onChange: this.handleChange,
      placeholderText: ""
    }));
  };

  return Search;
}(_react["default"].Component);

exports["default"] = Search;

_defineProperty(Search, "propTypes", {
  onChange: _propTypes["default"].func.isRequired,
  showClearIcon: _propTypes["default"].bool
});

module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/shapes.jsx":
/*!*****************************************!*\
  !*** ./src/tutorialExplorer/shapes.jsx ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* Common shapes used for React prop validation.
 */
var shapes = {
  tutorial: _propTypes["default"].shape({
    tags_length: _propTypes["default"].string,
    tags_subject: _propTypes["default"].string,
    tags_student_experience: _propTypes["default"].string,
    tags_activity_type: _propTypes["default"].string,
    tags_international_languages: _propTypes["default"].string,
    tags_grade: _propTypes["default"].string,
    tags_programming_language: _propTypes["default"].string
  })
};
var _default = shapes;
exports["default"] = _default;
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/toggleAllTutorialsButton.jsx":
/*!***********************************************************!*\
  !*** ./src/tutorialExplorer/toggleAllTutorialsButton.jsx ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ToggleAllTutorialsButton =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(ToggleAllTutorialsButton, _React$Component);

  function ToggleAllTutorialsButton() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = ToggleAllTutorialsButton.prototype;

  _proto.render = function render() {
    return _react["default"].createElement("div", {
      style: styles.toggleAllTutorialsBlock
    }, !this.props.showingAllTutorials && _react["default"].createElement("button", {
      type: "button",
      onClick: this.props.showAllTutorials
    }, _locale["default"].showAllTutorialsButton(), "\xA0", _react["default"].createElement("i", {
      className: "fa fa-caret-down",
      "aria-hidden": true
    })), this.props.showingAllTutorials && _react["default"].createElement("button", {
      type: "button",
      onClick: this.props.hideAllTutorials
    }, _locale["default"].hideAllTutorialsButton(), "\xA0", _react["default"].createElement("i", {
      className: "fa fa-caret-up",
      "aria-hidden": true
    })));
  };

  return ToggleAllTutorialsButton;
}(_react["default"].Component);

exports["default"] = ToggleAllTutorialsButton;

_defineProperty(ToggleAllTutorialsButton, "propTypes", {
  showAllTutorials: _propTypes["default"].func.isRequired,
  hideAllTutorials: _propTypes["default"].func.isRequired,
  showingAllTutorials: _propTypes["default"].bool
});

var styles = {
  toggleAllTutorialsBlock: {
    width: '100%',
    clear: 'both',
    textAlign: 'center',
    paddingTop: 30,
    paddingBottom: 30
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/tutorial.jsx":
/*!*******************************************!*\
  !*** ./src/tutorialExplorer/tutorial.jsx ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _shapes = _interopRequireDefault(__webpack_require__(/*! ./shapes */ "./src/tutorialExplorer/shapes.jsx"));

var _util = __webpack_require__(/*! ./util */ "./src/tutorialExplorer/util.jsx");

var _responsive = __webpack_require__(/*! ./responsive */ "./src/tutorialExplorer/responsive.jsx");

var _image = _interopRequireDefault(__webpack_require__(/*! ./image */ "./src/tutorialExplorer/image.jsx"));

var _reactLazyLoad = _interopRequireDefault(__webpack_require__(/*! react-lazy-load */ "./node_modules/react-lazy-load/lib/LazyLoad.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Tutorial =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Tutorial, _React$Component);

  function Tutorial() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "keyboardSelectTutorial", function (event) {
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.preventDefault();

        _this.props.tutorialClicked();
      }
    });

    return _this;
  }

  var _proto = Tutorial.prototype;

  _proto.render = function render() {
    var tutorialOuterStyle = _objectSpread({}, styles.tutorialOuter, {
      width: (0, _responsive.getResponsiveValue)({
        lg: 33.3333333,
        sm: 50,
        xs: 100
      })
    });

    var imageSrc = this.props.item.image.replace('.png', '.jpg');
    return _react["default"].createElement("div", {
      style: tutorialOuterStyle,
      onClick: this.props.tutorialClicked,
      onKeyDown: this.keyboardSelectTutorial,
      tabIndex: "0",
      role: "button"
    }, _react["default"].createElement("div", {
      style: styles.tutorialImageContainer
    }, _react["default"].createElement("div", {
      style: styles.tutorialImageBackground
    }), _react["default"].createElement(_reactLazyLoad["default"], {
      offset: 1000
    }, _react["default"].createElement(_image["default"], {
      src: imageSrc,
      style: styles.tutorialImage,
      alt: ""
    }))), _react["default"].createElement("div", {
      style: styles.tutorialName
    }, this.props.item.name), _react["default"].createElement("div", {
      style: styles.tutorialSub
    }, (0, _util.getTutorialDetailString)(this.props.item)));
  };

  return Tutorial;
}(_react["default"].Component);

exports["default"] = Tutorial;

_defineProperty(Tutorial, "propTypes", {
  item: _shapes["default"].tutorial.isRequired,
  tutorialClicked: _propTypes["default"].func.isRequired
});

var styles = {
  tutorialOuter: {
    "float": 'left',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 7,
    paddingRight: 7,
    cursor: 'pointer'
  },
  tutorialImageContainer: {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingTop: '75%'
  },
  tutorialImageBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#f1f1f1',
    border: 'solid 1px #cecece'
  },
  tutorialImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  tutorialName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 15,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  tutorialSub: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 12,
    lineHeight: '16px',
    height: 40
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/tutorialDetail.jsx":
/*!*************************************************!*\
  !*** ./src/tutorialExplorer/tutorialDetail.jsx ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _shapes = _interopRequireDefault(__webpack_require__(/*! ./shapes */ "./src/tutorialExplorer/shapes.jsx"));

var _util = __webpack_require__(/*! ./util */ "./src/tutorialExplorer/util.jsx");

var _image = _interopRequireDefault(__webpack_require__(/*! ./image */ "./src/tutorialExplorer/image.jsx"));

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* global ga */
var TutorialDetail =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(TutorialDetail, _React$Component);

  function TutorialDetail() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "onKeyDown", function (_ref) {
      var keyCode = _ref.keyCode;

      if (!_this.props.showing) {
        return;
      }

      if (keyCode === 27) {
        _this.props.closeClicked();
      } else if (keyCode === 37) {
        _this.props.changeTutorial(-1);
      } else if (keyCode === 39) {
        _this.props.changeTutorial(1);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "startTutorialClicked", function () {
      var shortCode = _this.props.item.short_code;
      ga('send', 'event', 'learn', 'start', shortCode);
      ga('send', 'event', 'learn', "start-".concat(_this.props.grade), shortCode);
    });

    return _this;
  }

  var _proto = TutorialDetail.prototype;

  _proto.componentDidMount = function componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  };

  _proto.render = function render() {
    if (!this.props.showing) {
      // Enable body scrolling.
      $('body').css('overflow', 'auto');
      return null;
    } // Disable body scrolling.


    $('body').css('overflow', 'hidden');
    var tableEntries = [// Reserve key 0 for the optional teachers notes.
    // Reserve key 1 for the optional short link.
    {
      key: 2,
      title: _locale["default"].filterStudentExperience(),
      body: (0, _util.getTagString)('student_experience', this.props.item.tags_student_experience)
    }, {
      key: 3,
      title: _locale["default"].filterPlatform(),
      body: this.props.item.string_platforms
    }, {
      key: 4,
      title: _locale["default"].filterTopics(),
      body: (0, _util.getTagString)('subject', this.props.item.tags_subject)
    }, {
      key: 5,
      title: _locale["default"].filterActivityType(),
      body: (0, _util.getTagString)('activity_type', this.props.item.tags_activity_type)
    }, {
      key: 6,
      title: _locale["default"].filterLength(),
      body: (0, _util.getTagString)('length', this.props.item.tags_length)
    }, {
      key: 7,
      title: _locale["default"].tutorialDetailInternationalLanguages(),
      body: this.props.item.language
    } // Reserve key 8 for the optional standards.
    ];
    var imageSrc = this.props.item.image.replace('.png', '.jpg');

    var imageComponent = _react["default"].createElement("div", {
      style: styles.tutorialDetailImageOuterContainer,
      className: "col-xs-12 col-sm-6"
    }, _react["default"].createElement("div", {
      style: styles.tutorialDetailImageContainer
    }, _react["default"].createElement("div", {
      style: styles.tutorialDetailImageBackground
    }), _react["default"].createElement(_image["default"], {
      style: styles.tutorialDetailImage,
      src: imageSrc
    })));

    return _react["default"].createElement("div", {
      id: "tutorialPopupFullWidth",
      style: styles.popupFullWidth
    }, _react["default"].createElement("div", {
      className: "modal",
      id: "tutorialPopup",
      style: {
        display: 'block'
      },
      onClick: this.props.closeClicked
    }, _react["default"].createElement("div", {
      className: "modal-dialog modal-lg",
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }, _react["default"].createElement("div", {
      className: "modal-content"
    }, _react["default"].createElement("div", {
      className: "modal-header",
      style: styles.tutorialDetailModalHeader
    }, _react["default"].createElement("button", {
      className: "close",
      "data-dismiss": "modal",
      style: {
        height: 48
      },
      type: "button",
      onClick: this.props.closeClicked
    }, _react["default"].createElement("span", {
      "aria-hidden": "true",
      style: {
        fontSize: 48
      }
    }, "\xD7"), _react["default"].createElement("span", {
      className: "sr-only"
    }, "Close")), _react["default"].createElement("div", {
      style: {
        clear: 'both'
      }
    })), _react["default"].createElement("div", {
      className: "modal-body",
      style: styles.tutorialDetailModalBody
    }, !this.props.disabledTutorial && _react["default"].createElement("a", {
      href: this.props.item.url,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: this.startTutorialClicked
    }, imageComponent), this.props.disabledTutorial && imageComponent, _react["default"].createElement("div", {
      style: styles.tutorialDetailInfoContainer,
      className: "col-xs-12 col-sm-6"
    }, _react["default"].createElement("div", {
      style: styles.tutorialDetailName
    }, this.props.item.name), this.props.item.orgname !== _util.DoNotShow && _react["default"].createElement("div", {
      style: styles.tutorialDetailPublisher
    }, this.props.item.orgname), _react["default"].createElement("div", {
      style: styles.tutorialDetailSub
    }, (0, _util.getTutorialDetailString)(this.props.item)), _react["default"].createElement("div", {
      style: styles.tutorialDetailDescription
    }, this.props.item.longdescription), this.props.disabledTutorial && _react["default"].createElement("div", {
      style: styles.tutorialDetailDisabled
    }, _react["default"].createElement("i", {
      className: "fa fa-warning warning-sign",
      style: styles.tutorialDetailDisabledIcon
    }), "\xA0", _locale["default"].tutorialDetailDisabled()), !this.props.disabledTutorial && _react["default"].createElement("a", {
      href: this.props.item.url,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: this.startTutorialClicked
    }, _react["default"].createElement("button", {
      type: "button",
      style: {
        marginTop: 20
      }
    }, _locale["default"].startButton()))), _react["default"].createElement("div", {
      style: {
        clear: 'both'
      }
    }), _react["default"].createElement("table", {
      style: styles.tutorialDetailsTable
    }, _react["default"].createElement("tbody", null, this.props.item.teachers_notes && _react["default"].createElement("tr", {
      key: 0
    }, _react["default"].createElement("td", {
      style: styles.tutorialDetailsTableTitle
    }, _locale["default"].tutorialDetailsMoreResources()), _react["default"].createElement("td", {
      style: styles.tutorialDetailsTableBody
    }, _react["default"].createElement("a", {
      href: this.props.item.teachers_notes,
      target: "_blank",
      rel: "noopener noreferrer"
    }, _react["default"].createElement("i", {
      className: "fa fa-external-link",
      "aria-hidden": true
    }), "\xA0", _locale["default"].tutorialDetailsTeacherNotes()))), tableEntries.map(function (item) {
      return _react["default"].createElement("tr", {
        key: item.key
      }, _react["default"].createElement("td", {
        style: styles.tutorialDetailsTableTitle
      }, item.title), _react["default"].createElement("td", {
        style: styles.tutorialDetailsTableBody
      }, item.body));
    }), this.props.localeEnglish && this.props.item.string_standards && _react["default"].createElement("tr", {
      key: 8
    }, _react["default"].createElement("td", {
      style: styles.tutorialDetailsTableTitle
    }, _locale["default"].tutorialDetailStandards()), _react["default"].createElement("td", {
      style: styles.tutorialDetailsTableBodyNoWrap
    }, this.props.item.string_standards)))))))));
  };

  return TutorialDetail;
}(_react["default"].Component);

exports["default"] = TutorialDetail;

_defineProperty(TutorialDetail, "propTypes", {
  showing: _propTypes["default"].bool.isRequired,
  item: _shapes["default"].tutorial,
  closeClicked: _propTypes["default"].func.isRequired,
  changeTutorial: _propTypes["default"].func.isRequired,
  localeEnglish: _propTypes["default"].bool.isRequired,
  disabledTutorial: _propTypes["default"].bool.isRequired,
  grade: _propTypes["default"].string.isRequired
});

var styles = {
  tutorialDetailModalHeader: {
    borderBottomWidth: 0,
    paddingTop: 0,
    paddingBottom: 4,
    height: 48
  },
  tutorialDetailModalBody: {
    paddingTop: 0,
    overflow: 'hidden',
    textAlign: 'left',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto'
  },
  popupFullWidth: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%'
  },
  tutorialDetailImageOuterContainer: {
    "float": 'left',
    paddingBottom: 10
  },
  tutorialDetailImageContainer: {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingTop: '75%'
  },
  tutorialDetailImageBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#f1f1f1',
    border: 'solid 1px #cecece'
  },
  tutorialDetailImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  tutorialDetailInfoContainer: {
    "float": 'left',
    paddingLeft: 20
  },
  tutorialDetailName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 22,
    paddingBottom: 4
  },
  tutorialDetailPublisher: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 16
  },
  tutorialDetailSub: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 12,
    paddingBottom: 20
  },
  tutorialDetailDescription: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 14
  },
  tutorialDetailDisabled: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 16,
    paddingTop: 40
  },
  tutorialDetailDisabledIcon: {
    color: '#d9534f'
  },
  tutorialDetailsTable: {
    marginTop: 20,
    width: '100%'
  },
  tutorialDetailsTableTitle: {
    padding: 5,
    width: '40%',
    fontFamily: '"Gotham 5r", sans-serif',
    border: '1px solid lightgrey'
  },
  tutorialDetailsTableBody: {
    padding: 5,
    border: '1px solid lightgrey'
  },
  tutorialDetailsTableBodyNoWrap: {
    padding: 5,
    border: '1px solid lightgrey',
    whiteSpace: 'pre-wrap'
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/tutorialExplorer.js":
/*!**************************************************!*\
  !*** ./src/tutorialExplorer/tutorialExplorer.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _reactDom = _interopRequireDefault(__webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js"));

var _immutable = _interopRequireDefault(__webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.js"));

var _filterHeader = _interopRequireDefault(__webpack_require__(/*! ./filterHeader */ "./src/tutorialExplorer/filterHeader.jsx"));

var _filterSet = _interopRequireDefault(__webpack_require__(/*! ./filterSet */ "./src/tutorialExplorer/filterSet.jsx"));

var _tutorialSet = _interopRequireDefault(__webpack_require__(/*! ./tutorialSet */ "./src/tutorialExplorer/tutorialSet.jsx"));

var _toggleAllTutorialsButton = _interopRequireDefault(__webpack_require__(/*! ./toggleAllTutorialsButton */ "./src/tutorialExplorer/toggleAllTutorialsButton.jsx"));

var _search = _interopRequireDefault(__webpack_require__(/*! ./search */ "./src/tutorialExplorer/search.jsx"));

var _util = __webpack_require__(/*! ./util */ "./src/tutorialExplorer/util.jsx");

var _responsive = __webpack_require__(/*! ./responsive */ "./src/tutorialExplorer/responsive.jsx");

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

var _lodash = _interopRequireDefault(__webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js"));

var _queryString = _interopRequireDefault(__webpack_require__(/*! query-string */ "./node_modules/query-string/index.js"));

var _reactSticky = __webpack_require__(/*! react-sticky */ "./node_modules/react-sticky/lib/index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TutorialExplorer =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(TutorialExplorer, _React$Component);

  function TutorialExplorer(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;

    _defineProperty(_assertThisInitialized(_this), "handleSearchTerm", function (searchTerm) {
      var filteredTutorials = _this.filterTutorialSet(_this.state.filters, _this.state.sortBy, _this.state.orgName, searchTerm);

      _this.setState({
        searchTerm: searchTerm,
        filteredTutorials: filteredTutorials,
        filteredTutorialsCount: filteredTutorials.length
      });
    });

    _defineProperty(_assertThisInitialized(_this), "handleUserInputFilter", function (filterGroup, filterEntry, value) {
      var state = _immutable["default"].fromJS(_this.state);

      var newState = {};

      if (_this.props.filterGroups.find(function (item) {
        return item.name === filterGroup;
      }).singleEntry) {
        newState = state.updateIn(['filters', filterGroup], function (arr) {
          return [filterEntry];
        });
      } else if (value) {
        // Add value to end of array.
        newState = state.updateIn(['filters', filterGroup], function (arr) {
          return arr.push(filterEntry);
        });
      } else {
        // Find and remove specific value from array.
        var itemIndex = _this.state.filters[filterGroup].indexOf(filterEntry);

        newState = state.updateIn(['filters', filterGroup], function (arr) {
          return arr.splice(itemIndex, 1);
        });
      }

      newState = newState.toJS();

      var filteredTutorials = _this.filterTutorialSet(newState.filters, _this.state.sortBy, _this.state.orgName, _this.state.searchTerm);

      _this.setState(_objectSpread({}, newState, {
        filteredTutorials: filteredTutorials,
        filteredTutorialsCount: filteredTutorials.length
      }));
    });

    _defineProperty(_assertThisInitialized(_this), "handleUserInputSortBy", function (value) {
      var filteredTutorials = _this.filterTutorialSet(_this.state.filters, value, _this.state.orgName, _this.state.searchTerm);

      _this.setState({
        filteredTutorials: filteredTutorials,
        filteredTutorialsCount: filteredTutorials.length,
        sortBy: value
      });

      _this.scrollToTop();
    });

    _defineProperty(_assertThisInitialized(_this), "handleUserInputOrgName", function (value) {
      var filteredTutorials = _this.filterTutorialSet(_this.state.filters, _this.state.sortBy, value, _this.state.searchTerm);

      _this.setState({
        filteredTutorials: filteredTutorials,
        filteredTutorialsCount: filteredTutorials.length,
        orgName: value
      });

      _this.scrollToTop();
    });

    _defineProperty(_assertThisInitialized(_this), "showModalFilters", function () {
      _this.setState({
        showingModalFilters: true
      });

      if (_this.state.mobileLayout) {
        _this.scrollToTop();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "hideModalFilters", function () {
      _this.setState({
        showingModalFilters: false
      });

      if (_this.state.mobileLayout) {
        _this.scrollToTop();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "showAllTutorials", function () {
      _this.setState({
        showingAllTutorials: true
      });
    });

    _defineProperty(_assertThisInitialized(_this), "hideAllTutorials", function () {
      _this.setState({
        showingAllTutorials: false
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onResize", function () {
      var windowWidth = $(window).width();
      var windowHeight = $(window).height(); // We fire window resize events when the grippy is dragged so that non-React
      // controlled components are able to rerender the editor. If width/height
      // didn't change, we don't need to do anything else here

      if (windowWidth === _this.state.windowWidth && windowHeight === _this.state.windowHeight) {
        return;
      }

      _this.setState({
        windowWidth: $(window).width(),
        windowHeight: $(window).height()
      });

      _this.setState({
        mobileLayout: (0, _responsive.isResponsiveCategoryInactive)('md')
      });
    });

    _this.shouldScrollToTop = false;
    var filters = {};

    for (var filterGroupName in props.filterGroups) {
      var filterGroup = props.filterGroups[filterGroupName];
      filters[filterGroup.name] = [];
      var initialFiltersForGroup = props.initialFilters[filterGroup.name];

      if (initialFiltersForGroup) {
        filters[filterGroup.name] = initialFiltersForGroup;
      }
    }

    var sortBy = props.defaultSortBy;
    var orgName = _util.TutorialsOrgName.all;
    var defaultSearchTerm = '';

    var _filteredTutorials = _this.filterTutorialSet(filters, sortBy, orgName, defaultSearchTerm);

    var filteredTutorialsForLocale = _this.filterTutorialSetForLocale();

    var showingAllTutorials = _this.isLocaleEnglish();

    _this.state = {
      filters: filters,
      filteredTutorials: _filteredTutorials,
      filteredTutorialsCount: _filteredTutorials.length,
      filteredTutorialsForLocale: filteredTutorialsForLocale,
      windowWidth: $(window).width(),
      windowHeight: $(window).height(),
      mobileLayout: (0, _responsive.isResponsiveCategoryInactive)('md'),
      showingModalFilters: false,
      sortBy: sortBy,
      orgName: orgName,
      showingAllTutorials: showingAllTutorials,
      searchTerm: defaultSearchTerm
    };
    return _this;
  }

  var _proto = TutorialExplorer.prototype;

  /*
   * Now that we've re-rendered changes, check to see if there's a pending
   * scroll to the top of all tutorials.
   * jQuery is used to do the scrolling, which is a little unusual, but
   * ensures a smooth, well-eased movement.
   */
  _proto.componentDidUpdate = function componentDidUpdate() {
    if (this.shouldScrollToTop) {
      $('html, body').animate({
        scrollTop: $(this.allTutorials).offset().top
      });
      this.shouldScrollToTop = false;
    }
  }
  /**
   * Set up a smooth scroll to the top of all tutorials once we've re-rendered the
   * relevant changes.
   * Note that if that next render never comes, we won't actually do the scroll.
   */
  ;

  _proto.scrollToTop = function scrollToTop() {
    this.shouldScrollToTop = true;
  }
  /**
   * Given a sort by choice (popularityrank or displayweight) and a grade range,
   * return the field name from the tutorials data that should used for sorting.
   */
  ;

  _proto.getSortByFieldName = function getSortByFieldName(sortBy, grade) {
    var sortByFieldName;
    var gradeToDisplayWeightSortByFieldName = {
      all: _util.TutorialsSortByFieldNames.displayweight,
      pre: _util.TutorialsSortByFieldNames.displayweight_pre,
      '2-5': _util.TutorialsSortByFieldNames.displayweight_25,
      '6-8': _util.TutorialsSortByFieldNames.displayweight_middle,
      '9+': _util.TutorialsSortByFieldNames.displayweight_high
    };
    var gradeToPopularityRankSortByFieldName = {
      all: _util.TutorialsSortByFieldNames.popularityrank,
      pre: _util.TutorialsSortByFieldNames.popularityrank_pre,
      '2-5': _util.TutorialsSortByFieldNames.popularityrank_25,
      '6-8': _util.TutorialsSortByFieldNames.popularityrank_middle,
      '9+': _util.TutorialsSortByFieldNames.popularityrank_high
    }; // If we're sorting by recommendation (a.k.a. displayweight) then find the
    // right set of data to match the currently-selected grade.

    if (sortBy === _util.TutorialsSortByOptions.displayweight) {
      sortByFieldName = gradeToDisplayWeightSortByFieldName[grade];
    } else {
      sortByFieldName = gradeToPopularityRankSortByFieldName[grade];
    }

    return sortByFieldName;
  }
  /*
   * The main tutorial set is returned with the given filters and sort order.
   *
   * Whether en or non-en user, this filters as though the user is of "en-US" locale.
   */
  ;

  _proto.filterTutorialSet = function filterTutorialSet(filters, sortBy, orgName, searchTerm) {
    var grade = filters.grade[0];
    var filterProps = {
      filters: filters,
      hideFilters: this.props.hideFilters,
      locale: 'en-US',
      orgName: orgName,
      sortByFieldName: this.getSortByFieldName(sortBy, grade),
      searchTerm: searchTerm
    };
    return TutorialExplorer.filterTutorials(this.props.tutorials, filterProps);
  }
  /*
   * The extra set of tutorials for a specific locale, shown at top for non-en user
   * with no filter options.
   * If not robotics page, show all tutorials including robotics.  If robotics page,
   * then use that filter.
   */
  ;

  _proto.filterTutorialSetForLocale = function filterTutorialSetForLocale() {
    var filterProps = {
      sortByFieldName: this.props.defaultSortBy
    };

    if (this.isRobotics()) {
      filterProps.filters = {
        activity_type: ['robotics']
      };
    }

    filterProps.specificLocale = true;
    filterProps.locale = this.props.locale;
    return TutorialExplorer.filterTutorials(this.props.tutorials, filterProps);
  };

  _proto.getUniqueOrgNames = function getUniqueOrgNames() {
    return TutorialExplorer.getUniqueOrgNamesFromTutorials(this.props.tutorials, this.isRobotics());
  };

  _proto.componentDidMount = function componentDidMount() {
    window.addEventListener('resize', _lodash["default"].debounce(this.onResize, 100));
  };

  _proto.shouldShowFilters = function shouldShowFilters() {
    return !this.state.mobileLayout || this.state.showingModalFilters;
  };

  _proto.shouldShowTutorials = function shouldShowTutorials() {
    return !this.state.mobileLayout || !this.state.showingModalFilters;
  };

  _proto.shouldShowTutorialsForLocale = function shouldShowTutorialsForLocale() {
    return !this.isLocaleEnglish();
  };

  _proto.shouldShowAllTutorialsToggleButton = function shouldShowAllTutorialsToggleButton() {
    return !this.isLocaleEnglish();
  };

  _proto.isLocaleEnglish = function isLocaleEnglish() {
    return this.props.locale.substring(0, 2) === 'en';
  };

  _proto.isRobotics = function isRobotics() {
    return !this.props.roboticsButtonUrl;
  }
  /**
   * Called when the window resizes. Look to see if width/height changed, then
   * call adjustTopPaneHeight as our maxHeight may need adjusting.
   */
  ;

  /**
   * Filters a given array of tutorials by the given filter props.
   *
   * It goes through all active filter categories.  If no filters are set for
   * a filter group, then that item will default to showing, so long as no other
   * filter group prevents it from showing.
   * hideFilters is an explicit list of filters that we actually hide if matched.
   * But if we do have a filter set for a filter group, and the tutorial is tagged
   * for that filter group, then at least one of the active filters must match a tag.
   * e.g. If the user chooses two platforms, then at least one of the platforms
   * must match a platform tag on the tutorial.
   * A similar check for language is done first.
   * In the case that filterProps.specificLocale is true, we do something slightly
   * different.  We don't show tutorials that don't have any language tags, and we
   * reject tutorials that don't have the current locale explicitly listed.  This
   * allows us to return a set of tutorials that have explicit support for the
   * current locale.
   *
   * @param {Array} tutorials - Array of tutorials.  Each contains a variety of
   *   strings, each of which is a list of tags separated by commas, no spaces.
   * @param {object} filterProps - Object containing filter properties.
   * @param {string} filterProps.locale - The current locale.
   * @param {bool} filterProps.specificLocale - Whether we filter to only allow
   *   through tutorials matching the current locale.
   * @param {object} filterProps.filters - Contains arrays of strings identifying
   *   the currently active filters.  Each array is named for its filter group.
   */
  TutorialExplorer.filterTutorials = function filterTutorials(tutorials, filterProps) {
    var _searchTerm$toLowerCa;

    var locale = filterProps.locale,
        specificLocale = filterProps.specificLocale,
        orgName = filterProps.orgName,
        filters = filterProps.filters,
        hideFilters = filterProps.hideFilters,
        sortByFieldName = filterProps.sortByFieldName,
        searchTerm = filterProps.searchTerm;
    var cleanSearchTerm = searchTerm === null || searchTerm === void 0 ? void 0 : (_searchTerm$toLowerCa = searchTerm.toLowerCase()) === null || _searchTerm$toLowerCa === void 0 ? void 0 : _searchTerm$toLowerCa.trim();
    var filteredTutorials = tutorials.filter(function (tutorial) {
      var _tutorial$name, _tutorial$longdescrip;

      // Check that the tutorial isn't marked as DoNotShow.  If it does,
      // it's hidden.
      if (tutorial.tags.split(',').indexOf(_util.DoNotShow) !== -1) {
        return false;
      } // First check that the tutorial language doesn't exclude it immediately.
      // If the tags contain some languages, and we don't have a match, then
      // hide the tutorial.


      if (locale && tutorial.languages_supported) {
        var languageTags = tutorial.languages_supported.split(',');

        if (languageTags.length > 0 && languageTags.indexOf(locale) === -1 && languageTags.indexOf(locale.substring(0, 2)) === -1) {
          return false;
        }
      } else if (specificLocale) {
        // If the tutorial doesn't have language tags, but we're only looking
        // for specific matches to our current locale, then don't show this
        // tutorial.  i.e. don't let non-locale-specific tutorials through.
        return false;
      } // If we are showing an explicit orgname, then filter if it doesn't
      // match.  Make an exception for Minecraft so that it shows when
      // Code.org is selected.


      if (orgName && orgName !== _util.TutorialsOrgName.all && tutorial.orgname !== orgName && !(orgName === _util.orgNameCodeOrg && tutorial.orgname === _util.orgNameMinecraft)) {
        return false;
      }

      if (searchTerm && !((_tutorial$name = tutorial.name) !== null && _tutorial$name !== void 0 && _tutorial$name.toLowerCase().includes(cleanSearchTerm) || (_tutorial$longdescrip = tutorial.longdescription) !== null && _tutorial$longdescrip !== void 0 && _tutorial$longdescrip.toLowerCase().includes(cleanSearchTerm))) {
        return false;
      } // If we are explicitly hiding a matching filter, then don't show the
      // tutorial.


      for (var filterGroupName in hideFilters) {
        var tutorialTags = tutorial['tags_' + filterGroupName];
        var filterGroup = hideFilters[filterGroupName];

        if (filterGroup.length !== 0 && tutorialTags && tutorialTags.length > 0 && TutorialExplorer.findMatchingTag(filterGroup, tutorialTags)) {
          return false;
        }
      } // If we miss any active filter group, then we don't show the tutorial.


      var filterGroupsSatisfied = true;

      for (var _filterGroupName in filters) {
        var _tutorialTags = tutorial['tags_' + _filterGroupName];
        var _filterGroup = filters[_filterGroupName];

        if (_filterGroup.length !== 0 && _tutorialTags && _tutorialTags.length > 0 && !TutorialExplorer.findMatchingTag(_filterGroup, _tutorialTags)) {
          filterGroupsSatisfied = false;
        }
      }

      return filterGroupsSatisfied;
    }).sort(function (tutorial1, tutorial2) {
      if ((0, _util.isTutorialSortByFieldNamePopularity)(sortByFieldName)) {
        return tutorial1[sortByFieldName] - tutorial2[sortByFieldName];
      } else {
        return tutorial2[sortByFieldName] - tutorial1[sortByFieldName];
      }
    });
    return filteredTutorials;
  }
  /* Given a filter group, and the tutorial's relevant tags for that filter group,
   * see if there's at least a single match.
   * @param {Array} filterGroup - Array of strings, each of which is a selected filter
   *   for the group.  e.g. ["beginner", "experienced"].
   * @param {string} tutorialTags - Comma-separated tags for a tutorial.
   *   e.g. "beginner,experienced".
   * @return {bool} - true if the tutorial had at least one tag matching at least
   *   one of the filterGroup's values.
   */
  ;

  TutorialExplorer.findMatchingTag = function findMatchingTag(filterGroup, tutorialTags) {
    return filterGroup.some(function (filterName) {
      return tutorialTags.split(',').indexOf(filterName) !== -1;
    });
  }
  /* Returns an array of unique organization names from the set of tutorials,
   * sorted alphabetically.
   *
   * @param {Array} tutorials - Array of tutorials.
   * @param {bool} robotics - Whether the page is for robotics.
   * @return {Array} - Array of strings.
   */
  ;

  TutorialExplorer.getUniqueOrgNamesFromTutorials = function getUniqueOrgNamesFromTutorials(tutorials, robotics) {
    // Filter out tutorials with DoNotShow as either tag or organization name.
    var availableTutorials = tutorials.filter(function (t) {
      return t.tags.split(',').indexOf(_util.DoNotShow) === -1 && t.orgname !== _util.DoNotShow;
    }); // Ensure robotics tag is either present or absent, depending whether we
    // are on robotics variant of the page or not.

    availableTutorials = availableTutorials.filter(function (t) {
      if (robotics) {
        return t.tags_activity_type.split(',').indexOf('robotics') !== -1;
      } else {
        return t.tags_activity_type.split(',').indexOf('robotics') === -1;
      }
    }); // Construct array of unique org names from the tutorials.

    var uniqueOrgNames = _lodash["default"].uniq(availableTutorials.map(function (t) {
      return t.orgname;
    })); // Sort the unique org names alphabetically, case-insensitive.


    uniqueOrgNames.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    return uniqueOrgNames;
  };

  _proto.render = function render() {
    var _this2 = this;

    var bottomLinksContainerStyle = _objectSpread({}, styles.bottomLinksContainer, {
      textAlign: (0, _responsive.getResponsiveValue)({
        xs: 'left',
        md: 'right'
      }),
      visibility: this.shouldShowTutorials() ? 'visible' : 'hidden'
    });

    var grade = this.state.filters.grade[0];
    return _react["default"].createElement("div", {
      style: {
        width: (0, _responsive.getResponsiveContainerWidth)(),
        margin: '0 auto',
        paddingBottom: 0
      }
    }, this.shouldShowTutorialsForLocale() && _react["default"].createElement("div", null, _react["default"].createElement("h1", null, _locale["default"].headingTutorialsYourLanguage()), this.state.filteredTutorialsForLocale.length === 0 && _locale["default"].noTutorialsYourLanguage(), this.state.filteredTutorialsForLocale.length > 0 && _react["default"].createElement(_tutorialSet["default"], {
      tutorials: this.state.filteredTutorialsForLocale,
      specificLocale: true,
      localeEnglish: false,
      disabledTutorials: this.props.disabledTutorials,
      grade: grade
    })), this.shouldShowAllTutorialsToggleButton() && _react["default"].createElement(_toggleAllTutorialsButton["default"], {
      showAllTutorials: this.showAllTutorials,
      hideAllTutorials: this.hideAllTutorials,
      showingAllTutorials: this.state.showingAllTutorials
    }), this.state.showingAllTutorials && _react["default"].createElement(_reactSticky.StickyContainer, null, _react["default"].createElement("div", {
      ref: function ref(allTutorials) {
        return _this2.allTutorials = allTutorials;
      }
    }, _react["default"].createElement(_filterHeader["default"], {
      mobileLayout: this.state.mobileLayout,
      filterGroups: this.props.filterGroups,
      selection: this.state.filters,
      onUserInputFilter: this.handleUserInputFilter,
      backButton: this.props.backButton,
      filteredTutorialsCount: this.state.filteredTutorialsCount,
      showingModalFilters: this.state.showingModalFilters,
      showModalFilters: this.showModalFilters,
      hideModalFilters: this.hideModalFilters
    }), _react["default"].createElement("div", {
      style: {
        clear: 'both'
      }
    }), this.shouldShowFilters() && _react["default"].createElement("div", {
      style: {
        "float": 'left',
        width: (0, _responsive.getResponsiveValue)({
          xs: 100,
          md: 20
        })
      }
    }, _react["default"].createElement(_search["default"], {
      onChange: this.handleSearchTerm,
      showClearIcon: this.state.searchTerm !== ''
    }), _react["default"].createElement(_filterSet["default"], {
      mobileLayout: this.state.mobileLayout,
      uniqueOrgNames: this.getUniqueOrgNames(),
      orgName: this.state.orgName,
      showSortDropdown: this.props.showSortDropdown,
      defaultSortBy: this.props.defaultSortBy,
      sortBy: this.state.sortBy,
      filterGroups: this.props.filterGroups,
      selection: this.state.filters,
      onUserInputFilter: this.handleUserInputFilter,
      onUserInputOrgName: this.handleUserInputOrgName,
      onUserInputSortBy: this.handleUserInputSortBy,
      roboticsButtonUrl: this.props.roboticsButtonUrl
    })), _react["default"].createElement("div", {
      style: {
        "float": 'left',
        width: (0, _responsive.getResponsiveValue)({
          xs: 100,
          md: 80
        })
      }
    }, this.shouldShowTutorials() && _react["default"].createElement(_tutorialSet["default"], {
      tutorials: this.state.filteredTutorials,
      localeEnglish: this.isLocaleEnglish(),
      disabledTutorials: this.props.disabledTutorials,
      grade: grade
    })))));
  };

  return TutorialExplorer;
}(_react["default"].Component);

exports["default"] = TutorialExplorer;

_defineProperty(TutorialExplorer, "propTypes", {
  tutorials: _propTypes["default"].array.isRequired,
  filterGroups: _propTypes["default"].array.isRequired,
  initialFilters: _propTypes["default"].objectOf(_propTypes["default"].arrayOf(_propTypes["default"].string)).isRequired,
  hideFilters: _propTypes["default"].objectOf(_propTypes["default"].arrayOf(_propTypes["default"].string)),
  locale: _propTypes["default"].string.isRequired,
  backButton: _propTypes["default"].bool,
  roboticsButtonUrl: _propTypes["default"].string,
  showSortDropdown: _propTypes["default"].bool.isRequired,
  disabledTutorials: _propTypes["default"].arrayOf(_propTypes["default"].string).isRequired,
  defaultSortBy: _propTypes["default"].oneOf(Object.keys(_util.TutorialsSortByOptions)).isRequired
});

var styles = {
  bottomLinksContainer: {
    padding: '10px 7px 40px 7px',
    fontSize: 13,
    lineHeight: '17px',
    clear: 'both'
  },
  bottomLinksLink: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  bottomLinksLinkFirst: {
    paddingBottom: 10
  }
};

function getFilters(_ref) {
  var robotics = _ref.robotics,
      mobile = _ref.mobile;
  var filters = [{
    name: 'grade',
    text: _locale["default"].filterGrades(),
    headerOnDesktop: true,
    singleEntry: true,
    entries: [{
      name: 'all',
      text: _locale["default"].filterGradesAll()
    }, {
      name: 'pre',
      text: _locale["default"].filterGradesPre()
    }, {
      name: '2-5',
      text: _locale["default"].filterGrades25()
    }, {
      name: '6-8',
      text: _locale["default"].filterGrades68()
    }, {
      name: '9+',
      text: _locale["default"].filterGrades9()
    }]
  }, {
    name: 'student_experience',
    text: _locale["default"].filterStudentExperience(),
    headerOnDesktop: true,
    singleEntry: true,
    entries: [{
      name: 'beginner',
      text: _locale["default"].filterStudentExperienceBeginner()
    }, {
      name: 'comfortable',
      text: _locale["default"].filterStudentExperienceComfortable()
    }]
  }, {
    name: 'platform',
    text: _locale["default"].filterPlatform(),
    entries: [{
      name: 'computers',
      text: _locale["default"].filterPlatformComputers()
    }, {
      name: 'android',
      text: _locale["default"].filterPlatformAndroid()
    }, {
      name: 'ios',
      text: _locale["default"].filterPlatformIos()
    }, {
      name: 'screenreader',
      text: _locale["default"].filterPlatformScreenReader()
    }, {
      name: 'no-internet',
      text: _locale["default"].filterPlatformNoInternet()
    }, {
      name: 'no-computers',
      text: _locale["default"].filterPlatformNoComputers()
    }]
  }, {
    name: 'subject',
    text: _locale["default"].filterTopics(),
    entries: [{
      name: 'science',
      text: _locale["default"].filterTopicsScience()
    }, {
      name: 'math',
      text: _locale["default"].filterTopicsMath()
    }, {
      name: 'history',
      text: _locale["default"].filterTopicsHistory()
    }, {
      name: 'la',
      text: _locale["default"].filterTopicsLa()
    }, {
      name: 'art',
      text: _locale["default"].filterTopicsArt()
    }, {
      name: 'cs-only',
      text: _locale["default"].filterTopicsCsOnly()
    }]
  }, {
    name: 'activity_type',
    text: _locale["default"].filterActivityType(),
    entries: [{
      name: 'online-tutorial',
      text: _locale["default"].filterActivityTypeOnlineTutorial()
    }, {
      name: 'lesson-plan',
      text: _locale["default"].filterActivityTypeLessonPlan()
    }]
  }, {
    name: 'length',
    text: _locale["default"].filterLength(),
    entries: [{
      name: '1hour',
      text: _locale["default"].filterLength1Hour()
    }, {
      name: '1hour-follow',
      text: _locale["default"].filterLength1HourFollow()
    }, {
      name: 'few-hours',
      text: _locale["default"].filterLengthFewHours()
    }]
  }, {
    name: 'programming_language',
    text: _locale["default"].filterProgrammingLanguage(),
    entries: [{
      name: 'blocks',
      text: _locale["default"].filterProgrammingLanguageBlocks()
    }, {
      name: 'typing',
      text: _locale["default"].filterProgrammingLanguageTyping()
    }, {
      name: 'other',
      text: _locale["default"].filterProgrammingLanguageOther()
    }]
  }];
  var initialFilters = {
    student_experience: ['beginner'],
    grade: ['all']
  };
  var hideFilters = {
    activity_type: ['robotics']
  };

  if (robotics) {
    filters.forEach(function (filterGroup) {
      if (filterGroup.name === 'activity_type') {
        filterGroup.entries = [{
          name: 'robotics',
          text: _locale["default"].filterActivityTypeRobotics()
        }];
        filterGroup.display = false;
      }
    });
    initialFilters.activity_type = ['robotics'];
    hideFilters.activity_type = [];
  }

  if (mobile) {
    initialFilters.platform = ['android', 'ios'];
  }

  return {
    filters: filters,
    initialFilters: initialFilters,
    hideFilters: hideFilters
  };
}
/*
 * Parse URL parameters to retrieve an override of initialFilters.
 *
 * @param {Array} filters - Array of filterGroup objects.
 * @param {bool} robotics - whether on the robotics page.
 *
 * @return {object} - Returns an object containing arrays of strings.  Each
 *   array is named for a filterGroup name, and each string inside is named
 *   for a filter entry.  Note that this is not currently white-listed against
 *   our known name of filterGroups/entries, but invalid entries should be
 *   ignored in the filtering user experience.
 */


function getUrlParameters(filters, robotics) {
  // Create a result object that has a __proto__ so that React validation will work
  // properly.
  var parametersObject = {};

  var parameters = _queryString["default"].parse(location.search);

  var _loop = function _loop(name) {
    var filterGroup = filters.find(function (item) {
      return item.name === name;
    }); // Validate filterGroup name.

    if (filterGroup) {
      var entryNames = [];

      if (typeof parameters[name] === 'string') {
        // Convert item with single filter entry into array containing the string.
        entryNames = [parameters[name]];
      } else {
        entryNames = parameters[name];
      }

      var _loop2 = function _loop2(entry) {
        var entryName = entryNames[entry]; // Validate entry name.

        if (filterGroup.entries.find(function (item) {
          return item.name === entryName;
        })) {
          if (!parametersObject[name]) {
            parametersObject[name] = [];
          }

          parametersObject[name].push(entryName);
        }
      };

      for (var entry in entryNames) {
        _loop2(entry);
      }
    }
  };

  for (var name in parameters) {
    _loop(name);
  }

  if (robotics) {
    // The robotics page remains dedicated to robotics activities.
    parametersObject.activity_type = ['robotics'];
    parametersObject.student_experience = ['beginner'];
    parametersObject.grade = ['all'];
  }

  return parametersObject;
}

window.TutorialExplorerManager = function (options) {
  options.mobile = (0, _util.mobileCheck)();

  var _getFilters = getFilters(options),
      filters = _getFilters.filters,
      initialFilters = _getFilters.initialFilters,
      hideFilters = _getFilters.hideFilters;

  var robotics = !options.roboticsButtonUrl; // Check for URL-based override of initialFilters.

  var providedParameters = getUrlParameters(filters, robotics);

  if (!_lodash["default"].isEmpty(providedParameters)) {
    initialFilters = providedParameters;
  } // The caller can provide defaultSortByPopularity, and when true, the default sort will
  // be by popularity.  Otherwise, the default sort will be by display weight.


  var defaultSortBy = options.defaultSortByPopularity ? _util.TutorialsSortByOptions.popularityrank : _util.TutorialsSortByOptions.displayweight;

  this.renderToElement = function (element) {
    _reactDom["default"].render(_react["default"].createElement(TutorialExplorer, {
      tutorials: options.tutorials,
      filterGroups: filters,
      initialFilters: initialFilters,
      hideFilters: hideFilters,
      locale: options.locale,
      backButton: options.backButton,
      roboticsButtonUrl: options.roboticsButtonUrl,
      showSortDropdown: options.showSortDropdown,
      disabledTutorials: options.disabledTutorials,
      defaultSortBy: defaultSortBy
    }), element);
  };
};

module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/tutorialSet.jsx":
/*!**********************************************!*\
  !*** ./src/tutorialExplorer/tutorialSet.jsx ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "./node_modules/react/index.js"));

var _tutorial = _interopRequireDefault(__webpack_require__(/*! ./tutorial */ "./src/tutorialExplorer/tutorial.jsx"));

var _tutorialDetail = _interopRequireDefault(__webpack_require__(/*! ./tutorialDetail */ "./src/tutorialExplorer/tutorialDetail.jsx"));

var _shapes = _interopRequireDefault(__webpack_require__(/*! ./shapes */ "./src/tutorialExplorer/shapes.jsx"));

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TutorialSet =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(TutorialSet, _React$Component);

  function TutorialSet() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "state", {
      showingDetail: false,
      chosenItem: null
    });

    _defineProperty(_assertThisInitialized(_this), "tutorialClicked", function (item) {
      return _this.setState({
        showingDetail: true,
        chosenItem: item
      });
    });

    _defineProperty(_assertThisInitialized(_this), "tutorialDetailClosed", function () {
      return _this.setState({
        showingDetail: false,
        chosenItem: null
      });
    });

    _defineProperty(_assertThisInitialized(_this), "changeTutorial", function (delta) {
      var index = _this.props.tutorials.indexOf(_this.state.chosenItem);

      var nextItem = _this.props.tutorials[index + delta];

      if (nextItem) {
        _this.setState({
          showingDetail: true,
          chosenItem: nextItem
        });
      }
    });

    return _this;
  }

  var _proto = TutorialSet.prototype;

  _proto.render = function render() {
    var _this2 = this;

    var disabledTutorial = this.state.showingDetail && this.props.disabledTutorials.indexOf(this.state.chosenItem.short_code) !== -1;
    return _react["default"].createElement("div", null, _react["default"].createElement(_tutorialDetail["default"], {
      showing: this.state.showingDetail,
      item: this.state.chosenItem,
      closeClicked: this.tutorialDetailClosed,
      localeEnglish: this.props.localeEnglish,
      disabledTutorial: disabledTutorial,
      changeTutorial: this.changeTutorial,
      grade: this.props.grade
    }), this.props.tutorials.map(function (item) {
      return _react["default"].createElement(_tutorial["default"], {
        item: item,
        key: item.code,
        tutorialClicked: _this2.tutorialClicked.bind(_this2, item)
      });
    }), this.props.tutorials.length === 0 && _react["default"].createElement("div", {
      style: styles.tutorialSetNoTutorials
    }, _locale["default"].tutorialSetNoTutorials()));
  };

  return TutorialSet;
}(_react["default"].Component);

exports["default"] = TutorialSet;

_defineProperty(TutorialSet, "propTypes", {
  tutorials: _propTypes["default"].arrayOf(_shapes["default"].tutorial.isRequired).isRequired,
  localeEnglish: _propTypes["default"].bool.isRequired,
  disabledTutorials: _propTypes["default"].arrayOf(_propTypes["default"].string).isRequired,
  grade: _propTypes["default"].string.isRequired
});

var styles = {
  tutorialSetNoTutorials: {
    backgroundColor: '#d6d6d6',
    padding: 20,
    margin: 60,
    whiteSpace: 'pre-wrap'
  }
};
module.exports = exports["default"];

/***/ }),

/***/ "./src/tutorialExplorer/util.jsx":
/*!***************************************!*\
  !*** ./src/tutorialExplorer/util.jsx ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isTutorialSortByFieldNamePopularity = isTutorialSortByFieldNamePopularity;
exports.getTagString = getTagString;
exports.getTutorialDetailString = getTutorialDetailString;
exports.mobileCheck = mobileCheck;
exports.orgNameMinecraft = exports.orgNameCodeOrg = exports.DoNotShow = exports.TutorialsOrgName = exports.TutorialsSortByFieldNames = exports.TutorialsSortByOptions = void 0;

var _locale = _interopRequireDefault(__webpack_require__(/*! @cdo/tutorialExplorer/locale */ "./src/tutorialExplorer/locale-do-not-import.js"));

var utils = _interopRequireWildcard(__webpack_require__(/*! ../utils */ "./src/utils.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Sort By dropdown choices for tutorials.
var TutorialsSortByOptions = utils.makeEnum('popularityrank', 'displayweight'); // Sort By source data field names (from gsheet) for tutorials.

exports.TutorialsSortByOptions = TutorialsSortByOptions;
var TutorialsSortByFieldNames = utils.makeEnum('popularityrank', 'popularityrank_pre', 'popularityrank_25', 'popularityrank_middle', 'popularityrank_high', 'displayweight', 'displayweight_pre', 'displayweight_25', 'displayweight_middle', 'displayweight_high');
exports.TutorialsSortByFieldNames = TutorialsSortByFieldNames;

function isTutorialSortByFieldNamePopularity(sortByFieldName) {
  return sortByFieldName === 'popularityrank' || sortByFieldName === 'popularityrank_pre' || sortByFieldName === 'popularityrank_25' || sortByFieldName === 'popularityrank_middle' || sortByFieldName === 'popularityrank_high';
} // Orgname value.


var TutorialsOrgName = utils.makeEnum('all'); // "do-not-show" string used in the source data as both a tag and in place of an
// organization name.

exports.TutorialsOrgName = TutorialsOrgName;
var DoNotShow = 'do-not-show'; // Code.org's organization name.

exports.DoNotShow = DoNotShow;
var orgNameCodeOrg = 'Code.org'; // Minecraft's organization name.

exports.orgNameCodeOrg = orgNameCodeOrg;
var orgNameMinecraft = 'Mojang, Microsoft and Code.org';
/**
 * For a comma-separated string of tags, generate a comma-separated string of their friendly
 * names.
 * e.g. Given a prefix of "subject_" and a string of tags of "history,science",
 * generate the readable string "Social Studies, Science".  These friendly strings are
 * stored in the string table as "subject_history" and "subject_science".
 *
 * @param {string} prefix - The prefix applied to the tag in the string table.
 * @param {string} tagString - Comma-separated tags, no spaces.
 */

exports.orgNameMinecraft = orgNameMinecraft;

function getTagString(prefix, tagString) {
  if (!tagString) {
    return '';
  }

  var tagToString = {
    length_1hour: _locale["default"].filterLength1Hour(),
    'length_1hour-follow': _locale["default"].filterLength1HourFollow(),
    'length_few-hours': _locale["default"].filterLengthFewHours(),
    subject_science: _locale["default"].filterTopicsScience(),
    subject_math: _locale["default"].filterTopicsMath(),
    subject_history: _locale["default"].filterTopicsHistory(),
    subject_la: _locale["default"].filterTopicsLa(),
    subject_art: _locale["default"].filterTopicsArt(),
    'subject_cs-only': _locale["default"].filterTopicsCsOnly(),
    student_experience_beginner: _locale["default"].filterStudentExperienceBeginner(),
    student_experience_comfortable: _locale["default"].filterStudentExperienceComfortable(),
    'activity_type_online-tutorial': _locale["default"].filterActivityTypeOnlineTutorial(),
    'activity_type_lesson-plan': _locale["default"].filterActivityTypeLessonPlan(),
    activity_type_robotics: _locale["default"].filterActivityTypeRobotics()
  };
  return tagString.split(',').map(function (tag) {
    return tagToString["".concat(prefix, "_").concat(tag)];
  }).filter(function (str) {
    return !!str;
  }).join(', ');
}
/**
 * Given a tutorial item, return the string to render for its details.
 * @param {object} item - A tutorial item.
 * @return {string} - The detail string, e.g. "Grade 4 | C++ | Web" or "Grade 4 | C++".
 */


function getTutorialDetailString(item) {
  var grades = item.string_detail_grades;
  var programming_languages = item.string_detail_programming_languages;
  var platforms = item.string_detail_platforms;
  var result = "".concat(grades, " | ").concat(programming_languages);

  if (platforms) {
    result = result + " | ".concat(platforms);
  }

  return result;
}
/**
 * Returns whether it detects that it's running on a mobile device.
 */


function mobileCheck() {
  // Adapted from http://detectmobilebrowsers.com/ with the addition of |android|ipad|playbook|silk as
  // it suggests at http://detectmobilebrowsers.com/about
  // Note that there are two regular expressions in the blob.  The first tests against variable a (the entire
  // user agent) while the second tests against just the first four characters in it.
  var check = false;

  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);

  return check;
}

/***/ }),

/***/ "./src/util/color.js":
/*!***************************!*\
  !*** ./src/util/color.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* eslint-disable */
// apps/src/util/color.js
// GENERATED FILE: DO NOT MODIFY DIRECTLY
// This generated file exports all variables defined in shared/css/color.scss
// for use in JavaScript. The generator script is convert-scss-variables.js
module.exports = {
  "black": "#000",
  "darkest_gray": "#272822",
  "dark_slate_gray": "#282c34",
  "dark_charcoal": "#4d575f",
  "charcoal": "#5b6770",
  "light_gray": "#949ca2",
  "lighter_gray": "#c6cacd",
  "lightest_gray": "#e7e8ea",
  "background_gray": "#f2f2f2",
  "dimgray": "#696969",
  "white": "#fff",
  "default_blue": "#3670b3",
  "dark_teal": "#0094a3",
  "teal": "#00adbc",
  "applab_button_teal": "#1abc9c",
  "light_teal": "#59cad3",
  "lightish_teal": "#80d6de",
  "lighter_teal": "#a6e3e8",
  "lightest_teal": "#d9f3f5",
  "purple": "#7665a0",
  "light_purple": "#a69bc1",
  "lighter_purple": "#cfc9de",
  "lightest_purple": "#ebe8f1",
  "cyan": "#0094ca",
  "light_cyan": "#59b9dc",
  "lighter_cyan": "#a6daed",
  "lightest_cyan": "#d9eff7",
  "almost_white_cyan": "#f5fcff",
  "orange": "#ffa400",
  "light_orange": "#ffc459",
  "lighter_orange": "#ffe0a6",
  "lightest_orange": "#fff2d9",
  "dark_orange": "#ff8600",
  "green": "#b9bf15",
  "light_green": "#d1d567",
  "lighter_green": "#e7e9ad",
  "lightest_green": "#f5f5dc",
  "highlight_green": "#8afc9b",
  "yellow": "#ffb81d",
  "light_yellow": "#ffdb74",
  "lighter_yellow": "#ffebb5",
  "lightest_yellow": "#fff7df",
  "goldenrod": "#daa520",
  "header_text": "#fff",
  "bkgnd_color": "#00adbc",
  "inset_color": "#c6cacd",
  "dark_color": "#7665a0",
  "hdr_color": "#7665a0",
  "red": "#c00",
  "lightest_red": "#fcc",
  "dark_red": "#d62911",
  "realgreen": "#008000",
  "realyellow": "#ff0",
  "mustardyellow": "#efcd1c",
  "twitter_blue": "#00aced",
  "facebook_blue": "#3b5998",
  "google_red": "#a5201a",
  "microsoft_blue": "#2a5cb2",
  "dark_blue": "#00647f",
  "blockly_flyout_gray": "#ddd",
  "default_text": "#333",
  "border_gray": "#bbb",
  "border_light_gray": "#d8d8d8",
  "table_header": "#ececec",
  "table_light_row": "#fcfcfc",
  "table_dark_row": "#f4f4f4",
  "level_submitted": "#7665a0",
  "level_perfect": "rgb(14, 190, 14)",
  "level_passed": "rgb(159, 212, 159)",
  "level_attempted": "#ff0",
  "level_not_tried": "#fefefe",
  "level_current": "#ffa400",
  "level_review_rejected": "#c00",
  "level_review_accepted": "rgb(11, 142, 11)",
  "assessment": "#0094ca",
  "workspace_running_background": "#e5e5e5",
  "link_color": "#0596CE",
  "shadow": "rgba(0, 0, 0, 0.3)",
  "bootstrap_button_blue": "#337ab7",
  "bootstrap_button_red": "#d9534f",
  "bootstrap_error_background": "#f2dede",
  "bootstrap_error_text": "#b94a48",
  "bootstrap_error_border": "#ebccd1",
  "bootstrap_warning_background": "#fcf8e3",
  "bootstrap_warning_text": "#c09853",
  "bootstrap_warning_border": "#faebcc",
  "bootstrap_border_color": "#cccccc",
  "bootstrap_success_background": "#dff0d8",
  "bootstrap_success_text": "#468847",
  "bootstrap_success_border": "#d6e9c6",
  "droplet_light_green": "#d3e965",
  "droplet_blue": "#64b5f6",
  "droplet_bright_blue": "#19c3e1",
  "droplet_yellow": "#fff176",
  "droplet_orange": "#ffb74d",
  "droplet_red": "#f78183",
  "droplet_cyan": "#4dd0e1",
  "droplet_pink": "#f57ac6",
  "droplet_purple": "#bb77c7",
  "droplet_green": "#68d995",
  "droplet_white": "#fff",
  "oceans_deep_blue": "rgb(2, 0, 28)"
};

/***/ }),

/***/ "./src/util/experiments.js":
/*!*********************************!*\
  !*** ./src/util/experiments.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _utils = __webpack_require__(/*! ../utils */ "./src/utils.js");

var _jsCookie = _interopRequireDefault(__webpack_require__(/*! js-cookie */ "./node_modules/js-cookie/src/js.cookie.js"));

var _trackEvent = _interopRequireDefault(__webpack_require__(/*! ./trackEvent */ "./src/util/trackEvent.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiments=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiments=experimentOne,experimentTwo
 * Experiment state is persisted across page loads using local storage.  Note
 * that it's only written when isEnabled is called for the key in question.
 */
var queryString = __webpack_require__(/*! query-string */ "./node_modules/query-string/index.js");

var experiments = module.exports;
var STORAGE_KEY = 'experimentsList';
var GA_EVENT = 'experiments';
var EXPERIMENT_LIFESPAN_HOURS = 12; // Specific experiment names

experiments.REDUX_LOGGING = 'reduxLogging';
experiments.SCHOOL_AUTOCOMPLETE_DROPDOWN_NEW_SEARCH = 'schoolAutocompleteDropdownNewSearch';
experiments.SHOW_UNPUBLISHED_FIREBASE_TABLES = 'showUnpublishedFirebaseTables';
experiments.MICROBIT = 'microbit';
experiments.TEACHER_DASHBOARD_SECTION_BUTTONS = 'teacher-dashboard-section-buttons';
experiments.TEACHER_DASHBOARD_SECTION_BUTTONS_ALTERNATE_TEXT = 'teacher-dashboard-section-buttons-alternate-text';
experiments.FINISH_DIALOG_METRICS = 'finish-dialog-metrics';
experiments.I18N_TRACKING = 'i18n-tracking';
experiments.TIME_SPENT = 'time-spent';
experiments.BYPASS_DIALOG_POPUP = 'bypass-dialog-popup';
experiments.SPECIAL_TOPIC = 'special-topic';
experiments.CLEARER_SIGN_UP_USER_TYPE = 'clearerSignUpUserType';
experiments.OPT_IN_EMAIL_REG_PARTNER = 'optInEmailRegPartner';
experiments.CODE_REVIEW_GROUPS = 'codeReviewGroups';
experiments.JAVALAB_UNIT_TESTS = 'javalabUnitTests';
/**
 * This was a gamified version of the finish dialog, built in 2018,
 * but never fully shipped.
 * See github.com/code-dot-org/code-dot-org/pull/19557
 */

experiments.BUBBLE_DIALOG = 'bubbleDialog';
/**
 * Get our query string. Provided as a method so that tests can mock this.
 */

experiments.getQueryString_ = function () {
  return window.location.search;
};

experiments.getStoredExperiments_ = function () {
  // Get experiments on current user from experiments cookie
  var experimentsCookie = _jsCookie["default"].get('_experiments' + window.cookieEnvSuffix);

  var userExperiments = experimentsCookie ? JSON.parse(decodeURIComponent(experimentsCookie)).map(function (name) {
    return {
      key: name
    };
  }) : []; // Get experiments stored in local storage.

  try {
    var jsonList = localStorage.getItem(STORAGE_KEY);
    var storedExperiments = jsonList ? JSON.parse(jsonList) : [];
    var now = Date.now();
    var enabledExperiments = storedExperiments.filter(function (experiment) {
      return experiment.key && (experiment.expiration === undefined || experiment.expiration > now);
    });

    if (enabledExperiments.length < storedExperiments.length) {
      (0, _utils.trySetLocalStorage)(STORAGE_KEY, JSON.stringify(enabledExperiments));
    }

    return userExperiments.concat(enabledExperiments);
  } catch (e) {
    return userExperiments;
  }
};

experiments.getEnabledExperiments = function () {
  return this.getStoredExperiments_().map(function (experiment) {
    return experiment.key;
  });
};

experiments.setEnabled = function (key, shouldEnable) {
  var expiration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var allEnabled = this.getStoredExperiments_();
  var experimentIndex = allEnabled.findIndex(function (experiment) {
    return experiment.key === key;
  });

  if (shouldEnable) {
    if (experimentIndex < 0) {
      allEnabled.push({
        key: key,
        expiration: expiration
      });
      (0, _trackEvent["default"])(GA_EVENT, 'enable', key);
    } else {
      allEnabled[experimentIndex].expiration = expiration;
    }
  } else if (experimentIndex >= 0) {
    allEnabled.splice(experimentIndex, 1);
    (0, _trackEvent["default"])(GA_EVENT, 'disable', key);
  } else {
    return;
  }

  (0, _utils.trySetLocalStorage)(STORAGE_KEY, JSON.stringify(allEnabled));
};
/**
 * Checks whether provided experiment is enabled or not
 * @param {string} key - Name of experiment in question
 * @returns {bool}
 */


experiments.isEnabled = function (key) {
  var storedExperiments = this.getStoredExperiments_();
  var enabled = storedExperiments.some(function (experiment) {
    return experiment.key === key;
  }) || !!(window.appOptions && window.appOptions.experiments && window.appOptions.experiments.includes(key));
  var query = queryString.parse(this.getQueryString_());
  var enableQuery = query['enableExperiments'];
  var disableQuery = query['disableExperiments'];
  var tempEnableQuery = query['tempEnableExperiments'];

  if (enableQuery) {
    var experimentsToEnable = enableQuery.split(',');

    if (experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      this.setEnabled(key, true);
    }
  }

  if (disableQuery) {
    var experimentsToDisable = disableQuery.split(',');

    if (experimentsToDisable.indexOf(key) >= 0) {
      enabled = false;
      this.setEnabled(key, false);
    }
  }

  if (tempEnableQuery) {
    var expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + EXPERIMENT_LIFESPAN_HOURS);
    var expiration = expirationDate.getTime();

    var _experimentsToEnable = tempEnableQuery.split(',');

    if (_experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      this.setEnabled(key, true, expiration);
    }
  }

  return enabled;
};

/***/ }),

/***/ "./src/util/i18nStringTracker.js":
/*!***************************************!*\
  !*** ./src/util/i18nStringTracker.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = localeWithI18nStringTracker;

var _experiments = _interopRequireDefault(__webpack_require__(/*! @cdo/apps/util/experiments */ "./src/util/experiments.js"));

var _i18nStringTrackerWorker = __webpack_require__(/*! @cdo/apps/util/i18nStringTrackerWorker */ "./src/util/i18nStringTrackerWorker.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function localeWithI18nStringTracker(locale, source) {
  if (!_experiments["default"].isEnabled(_experiments["default"].I18N_TRACKING)) {
    return locale;
  }

  var localeWithTracker = {}; // Iterates each function in the given locale object and creates a wrapper function.

  Object.keys(locale).forEach(function (stringKey, index) {
    localeWithTracker[stringKey] = function (d) {
      var value = locale[stringKey](d);
      log(stringKey, source);
      return value;
    };
  });
  return localeWithTracker;
} // Records the usage of the given i18n string key from the given source file.
// @param {string} stringKey  The string key used to look up the i18n value e.g. 'home.banner_text'
// @param {string} source Context for where the given string key came from e.g. 'maze', 'dance', etc.


function log(stringKey, source) {
  if (!stringKey || !source) {
    return;
  } // Send the usage data to a background worker thread to be buffered and sent.


  (0, _i18nStringTrackerWorker.getI18nStringTrackerWorker)().log(stringKey, source);
}

module.exports = exports["default"];

/***/ }),

/***/ "./src/util/i18nStringTrackerWorker.js":
/*!*********************************************!*\
  !*** ./src/util/i18nStringTrackerWorker.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getI18nStringTrackerWorker = getI18nStringTrackerWorker;

__webpack_require__(/*! whatwg-fetch */ "./node_modules/whatwg-fetch/fetch.js");

/**
 * Gets the singleton instance of an I18nStringTrackerWorker
 * @returns {I18nStringTrackerWorker}
 */
function getI18nStringTrackerWorker() {
  return new I18nStringTrackerWorker();
}
/**
 * A singleton class which buffers i18n string usage data and sends it in batches to the '/i18n/track_string_usage' API.
 */


var I18nStringTrackerWorker =
/*#__PURE__*/
function () {
  function I18nStringTrackerWorker() {
    // Check if there is already a singleton instance.
    var instance = this.constructor.instance;

    if (instance) {
      return instance;
    } // Set the singleton instance to this instance if it doesn't exist already.


    this.constructor.instance = this;
    /**
     * A buffer of records to be sent in batches. Each key is the `source` file of the string and the values are the
     * i18n `stringKey`s used to lookup the translated string.
     * @typedef {Object.<string, Set>} I18nRecords
     * Example:
     * {
     *   'common_locale': [ 'curriculum', 'teacherForum', 'professionalLearning', ...],
     *   'fish_locale': ...
     * }
     */

    this.buffer = {};
  }
  /**
   * Buffers the given i18n string usage data to be sent later.
   * @param {string} stringKey The key used to look up the i18n string value e.g. 'curriculum'
   * @param {string} source Context about the file i18n value was looked up in e.g. 'common_locale'
   */


  var _proto = I18nStringTrackerWorker.prototype;

  _proto.log = function log(stringKey, source) {
    var _this = this;

    if (!stringKey || !source) {
      return;
    }

    this.buffer[source] = this.buffer[source] || new Set();
    this.buffer[source].add("".concat(source, ".").concat(stringKey)); // schedule a buffer flush if there isn't already one.

    if (!this.pendingFlush) {
      this.pendingFlush = setTimeout(function () {
        return _this.flush();
      }, 3000);
    }
  } // Sends all the buffered records
  ;

  _proto.flush = function flush() {
    // Do nothing if there are no records to record.
    if (Object.keys(this.buffer).length === 0) {
      return;
    } // Grab the contents of the current buffer and clear the buffer.


    var records = this.buffer;
    this.buffer = {};
    this.pendingFlush = null; // RNG to send only 1% of the time

    if (Math.floor(Math.random() * 100) === 0) {
      // Record the i18n string usage data.
      sendRecords(records);
    }
  };

  return I18nStringTrackerWorker;
}(); // The max number of records which can be sent at once to the '/i18n/track_string_usage' API


var RECORD_LIMIT = 500;
/**
 * Asynchronously send the given records to the `/i18n/track_string_usage` API
 * @param {I18nRecords} records The records of i18n string usage information to be sent.
 */

function sendRecords(records) {
  var url = window.location.origin + window.location.pathname; //strip the query string from the URL

  Object.keys(records).forEach(function (source) {
    var stringKeys = Array.from(records[source]); // Break the keys up into smaller batches because the API has a maximum limit.

    for (var i = 0; i < stringKeys.length; i += RECORD_LIMIT) {
      var stringKeyBatch = stringKeys.slice(i, RECORD_LIMIT);
      fetch('/i18n/track_string_usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          source: source,
          string_keys: stringKeyBatch
        })
      });
    }
  });
}

/***/ }),

/***/ "./src/util/locale-do-not-import.js":
/*!******************************************!*\
  !*** ./src/util/locale-do-not-import.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _safeLoadLocale = _interopRequireDefault(__webpack_require__(/*! @cdo/apps/util/safeLoadLocale */ "./src/util/safeLoadLocale.js"));

var _i18nStringTracker = _interopRequireDefault(__webpack_require__(/*! @cdo/apps/util/i18nStringTracker */ "./src/util/i18nStringTracker.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seemlessly in tests.
 */
// base locale
var locale = (0, _safeLoadLocale["default"])('common_locale');
locale = (0, _i18nStringTracker["default"])(locale, 'common');
module.exports = locale;

/***/ }),

/***/ "./src/util/safeLoadLocale.js":
/*!************************************!*\
  !*** ./src/util/safeLoadLocale.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = safeLoadLocale;

/**
 * Helper method for loading the locale from the global scope, which will detect if
 * translations are not present in the environment and fall back to an empty locale
 * object.
 *
 * @param localeKey {String} The name of the locale on the global blockly
 *     object. Usually something like "common_locale", "studio_locale",
 *     "applab_locale", etc.
 */
function safeLoadLocale(localeKey) {
  if (window.locales && window.locales[localeKey]) {
    return window.locales[localeKey];
  } else {
    console.warn('Translations must be loaded into the global scope before access. ' + 'Falling back on an empty translation object. This page may break due to missing translations.'); // Return an empty object, so i18n methods throw where they are called and
    // generate more useful stack traces.

    return {};
  }
}

module.exports = exports["default"];

/***/ }),

/***/ "./src/util/trackEvent.js":
/*!********************************!*\
  !*** ./src/util/trackEvent.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = trackEvent;

/* global window */

/**
 * Report an event to Google Analytics.
 * trackEvent is provided by _analytics.html.haml in most cases.
 * In those where it isn't, we want this call to be a simple no-op.
 */
function trackEvent() {
  var _window;

  if (false) {}

  (_window = window).trackEvent.apply(_window, arguments);
}

module.exports = exports["default"];

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isSubsequence = isSubsequence;
exports.shallowCopy = shallowCopy;
exports.cloneWithoutFunctions = cloneWithoutFunctions;
exports.quote = quote;
exports.stringToChunks = stringToChunks;
exports.extend = extend;
exports.escapeHtml = escapeHtml;
exports.mod = mod;
exports.range = range;
exports.executeIfConditional = executeIfConditional;
exports.stripQuotes = stripQuotes;
exports.wrapNumberValidatorsForLevelBuilder = wrapNumberValidatorsForLevelBuilder;
exports.randomValue = randomValue;
exports.randomKey = randomKey;
exports.createUuid = createUuid;
exports.fireResizeEvent = fireResizeEvent;
exports.valueOr = valueOr;
exports.isInfiniteRecursionError = isInfiniteRecursionError;
exports.unescapeText = unescapeText;
exports.escapeText = escapeText;
exports.showGenericQtip = showGenericQtip;
exports.showUnusedBlockQtip = showUnusedBlockQtip;
exports.tryGetLocalStorage = tryGetLocalStorage;
exports.trySetLocalStorage = trySetLocalStorage;
exports.tryGetSessionStorage = tryGetSessionStorage;
exports.trySetSessionStorage = trySetSessionStorage;
exports.makeEnum = makeEnum;
exports.ellipsify = ellipsify;
exports.deepMergeConcatArrays = deepMergeConcatArrays;
exports.createEvent = createEvent;
exports.normalize = normalize;
exports.xFromPosition = xFromPosition;
exports.yFromPosition = yFromPosition;
exports.levenshtein = levenshtein;
exports.bisect = bisect;
exports.flatten = flatten;
exports.reload = reload;
exports.currentLocation = currentLocation;
exports.windowOpen = windowOpen;
exports.navigateToHref = navigateToHref;
exports.stringifyQueryParams = stringifyQueryParams;
exports.linkWithQueryParams = linkWithQueryParams;
exports.resetAniGif = resetAniGif;
exports.interpolateColors = interpolateColors;
exports.getTabId = getTabId;
exports.createHiddenPrintWindow = createHiddenPrintWindow;
exports.calculateOffsetCoordinates = calculateOffsetCoordinates;
exports.hashString = hashString;
exports.tooltipifyVocabulary = tooltipifyVocabulary;
exports.containsAtLeastOneAlphaNumeric = containsAtLeastOneAlphaNumeric;
exports.findProfanity = void 0;

var _jquery = _interopRequireDefault(__webpack_require__(/*! jquery */ "jquery"));

var _immutable = _interopRequireDefault(__webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.js"));

var _md = _interopRequireDefault(__webpack_require__(/*! crypto-js/md5 */ "./node_modules/crypto-js/md5.js"));

var _rgbcolor = _interopRequireDefault(__webpack_require__(/*! rgbcolor */ "./node_modules/rgbcolor/index.js"));

var _constants = __webpack_require__(/*! ./constants */ "./src/constants.js");

var _imageUtils = __webpack_require__(/*! ./imageUtils */ "./src/imageUtils.js");

__webpack_require__(/*! ./polyfills */ "./src/polyfills.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Checks whether the given subsequence is truly a subsequence of the given sequence,
 * and whether the elements appear in the same order as the sequence.
 *
 * @param sequence Array - The sequence that the subsequence should be a subsequence of.
 * @param subsequence Array - A subsequence of the given sequence.
 * @returns boolean - whether or not subsequence is really a subsequence of sequence.
 */
function isSubsequence(sequence, subsequence) {
  var superIndex = 0,
      subIndex = 0;

  while (subIndex < subsequence.length) {
    while (superIndex < sequence.length && subsequence[subIndex] !== sequence[superIndex]) {
      superIndex++;
    }

    if (superIndex >= sequence.length) {
      // we went off the end while searching
      return false;
    }

    subIndex++;
    superIndex++;
  }

  return true;
}

function shallowCopy(source) {
  var result = {};

  for (var prop in source) {
    result[prop] = source[prop];
  }

  return result;
}
/**
 * Returns a clone of the object, stripping any functions on it.
 */


function cloneWithoutFunctions(object) {
  return JSON.parse(JSON.stringify(object));
}
/**
 * Returns a string with a double quote before and after.
 */


function quote(str) {
  return '"' + str + '"';
}
/**
 * Splits a string into chunks of a certain length.
 *
 * @param {String} str
 * @param {Number} maxLength Max length of each chunk.
 * @param {String} delimiter
 * @returns Array<String>
 */


function stringToChunks(str, maxLength) {
  var delimiter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ' ';
  return str.split(delimiter).reduce(function (acc, val) {
    var lastVal = '';

    if (acc[acc.length - 1].length + val.length < maxLength) {
      lastVal = acc.pop() + delimiter;
    }

    lastVal += val;
    acc.push(lastVal.trim());
    return acc;
  }, ['']);
}
/**
 * Returns a new object with the properties from defaults overridden by any
 * properties in options. Leaves defaults and options unchanged.
 * NOTE: For new code, use Object.assign({}, defaults, options) instead
 */


function extend(defaults, options) {
  var finalOptions = exports.shallowCopy(defaults);

  for (var prop in options) {
    finalOptions[prop] = options[prop];
  }

  return finalOptions;
}
/**
 * Replaces special characters in string by HTML entities.
 * List of special characters is taken from
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html.
 * @param {string} unsafe - The string to escape.
 * @returns {string} Escaped string. Returns an empty string if input is null or undefined.
 */


function escapeHtml(unsafe) {
  return unsafe ? unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\//g, '&#47;') : '';
}
/**
 * Version of modulo which, unlike javascript's `%` operator,
 * will always return a positive remainder.
 * @param number
 * @param mod
 */


function mod(number, mod) {
  return (number % mod + mod) % mod;
}
/**
 * Generates an array of integers from start to end inclusive
 */


function range(start, end) {
  var ints = [];

  for (var i = start; i <= end; i++) {
    ints.push(i);
  }

  return ints;
}
/**
 * Given two functions, generates a function that returns the result of the
 * second function if and only if the first function returns true
 */


function executeIfConditional(conditional, fn) {
  return function () {
    if (conditional()) {
      return fn.apply(this, arguments);
    }
  };
}
/**
 * Removes all single and double quotes from a string
 * @param inputString
 * @returns {string} string without quotes
 */


function stripQuotes(inputString) {
  return inputString.replace(/["']/g, '');
}
/**
 * Defines an inheritance relationship between parent class and this class.
 */


Function.prototype.inherits = function (parent) {
  this.prototype = Object.create(parent.prototype);
  this.prototype.constructor = this;
  this.superPrototype = parent.prototype;
};
/**
 * Wrap a couple of our Blockly number validators to allow for ???.  This is
 * done so that level builders can specify required blocks with wildcard fields.
 */


function wrapNumberValidatorsForLevelBuilder() {
  var nonNeg = Blockly.FieldTextInput.nonnegativeIntegerValidator;
  var numVal = Blockly.FieldTextInput.numberValidator;

  Blockly.FieldTextInput.nonnegativeIntegerValidator = function (text) {
    if (text === '???') {
      return text;
    }

    return nonNeg(text);
  };

  Blockly.FieldTextInput.numberValidator = function (text) {
    if (text === '???') {
      return text;
    }

    return numVal(text);
  };
}
/**
 * Return a random value from an array
 */


function randomValue(values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
}
/**
 * Return a random key name from an object.
 */


function randomKey(obj) {
  return randomValue(Object.keys(obj));
}
/**
 * Generate a random identifier in a format matching the RFC-4122 specification.
 *
 * Taken from
 * {@link http://byronsalau.com/blog/how-to-create-a-guid-uuid-in-javascript/}
 *
 * @see RFC-4122 standard {@link http://www.ietf.org/rfc/rfc4122.txt}
 *
 * @returns {string} RFC4122-compliant UUID
 */


function createUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

function fireResizeEvent() {
  var ev = document.createEvent('Event');
  ev.initEvent('resize', true, true);
  window.dispatchEvent(ev);
}
/**
 * Similar to val || defaultVal, except it's gated on whether or not val is
 * undefined instead of whether val is falsey.
 * @returns {*} val if not undefined, otherwise defaultVal
 */


function valueOr(val, defaultVal) {
  return val === undefined ? defaultVal : val;
}
/**
 * Attempts to analyze whether or not err represents infinite recursion having
 * occurred. This error differs per browser, and it's possible that we don't
 * properly discover all cases.
 * Note: Other languages probably have localized messages, meaning we won't
 * catch them.
 */


function isInfiniteRecursionError(err) {
  // Chrome/Safari: message ends in a period in Safari, not in Chrome
  if (err instanceof RangeError && /^Maximum call stack size exceeded/.test(err.message)) {
    return true;
  } // Firefox

  /*eslint-disable */
  // Linter doesn't like our use of InternalError, even though we gate on its
  // existence.


  if (typeof InternalError !== 'undefined' && err instanceof InternalError && err.message === 'too much recursion') {
    return true;
  }
  /*eslint-enable */
  // IE


  if (err instanceof Error && err.message === 'Out of stack space') {
    return true;
  }

  return false;
}
/**
 * Remove escaped characters and HTML to convert some rendered text to what should appear in user-edited controls
 * @param text
 * @returns String that has no more escape characters and multiple divs converted to newlines
 */


function unescapeText(text) {
  var cleanedText = text; // Handling of line breaks:
  // In multiline text it's possible for the first line to render wrapped or unwrapped.
  //     Line 1
  //     Line 2
  //   Can render as any of:
  //     Line 1<div>Line 2</div>
  //     Line 1<br><div>Line 2</div>
  //     <div>Line 1</div><div>Line 2</div>
  //
  // Most blank lines are rendered as <div><br></div>
  //     Line 1
  //
  //     Line 3
  //   Can render as any of:
  //     Line 1<div><br></div><div>Line 3</div>
  //     Line 1<br><div><br></div><div>Line 3</div>
  //     <div>Line 1</div><div><br></div><div>Line 3</div>
  //
  // Leading blank lines render wrapped or as placeholder breaks and should be preserved
  //
  //     Line 2
  //   Renders as any of:
  //    <br><div>Line 2</div>
  //    <div><br></div><div>Line 2</div>
  // First, convert every <div> tag that isn't at the very beginning of the string
  // to a newline.  This avoids generating an incorrect blank line at the start
  // if the first line is wrapped in a <div>.

  cleanedText = cleanedText.replace(/(?!^)<div[^>]*>/gi, '\n');
  cleanedText = cleanedText.replace(/<[^>]+>/gi, ''); // Strip all other tags

  cleanedText = cleanedText.replace(/&nbsp;/gi, ' '); // Unescape nonbreaking spaces

  cleanedText = cleanedText.replace(/&gt;/gi, '>'); // Unescape >

  cleanedText = cleanedText.replace(/&lt;/gi, '<'); // Unescape <

  cleanedText = cleanedText.replace(/&amp;/gi, '&'); // Unescape & (must happen last!)

  return cleanedText;
}
/**
 * Escape special characters in a piece of text, and convert newlines to seperate divs
 * @param text
 * @returns String with special characters escaped and newlines converted divs
 */


function escapeText(text) {
  var escapedText = text.toString();
  escapedText = escapedText.replace(/&/g, '&amp;'); // Escape & (must happen first!)

  escapedText = escapedText.replace(/</g, '&lt;'); // Escape <

  escapedText = escapedText.replace(/>/g, '&gt;'); // Escape >

  escapedText = escapedText.replace(/ {2}/g, ' &nbsp;'); // Escape doubled spaces
  // Now wrap each line except the first line in a <div>,
  // replacing blank lines with <div><br><div>

  var lines = escapedText.split('\n');
  var first = lines[0];
  var rest = lines.slice(1); // If first line is blank and not the only line, convert it to a <br> tag:

  if (first.length === 0 && lines.length > 1) {
    first = '<br>';
  } // Wrap the rest of the lines


  return first + rest.map(function (line) {
    return '<div>' + (line.length ? line : '<br>') + '</div>';
  }).join('');
}

function showGenericQtip(targetElement, title, message, position) {
  (0, _jquery["default"])(targetElement).qtip({
    content: {
      text: "\n        <h4>".concat(title, "</h4>\n        <p>").concat(message, "</p>\n      "),
      title: {
        button: (0, _jquery["default"])('<div class="tooltip-x-close"/>')
      }
    },
    position: position,
    style: {
      classes: 'cdo-qtips',
      tip: {
        width: 20,
        height: 20
      }
    },
    hide: {
      event: 'unfocus'
    },
    show: false // don't show on mouseover

  }).qtip('show');
}

function showUnusedBlockQtip(targetElement) {
  var msg = __webpack_require__(/*! @cdo/locale */ "./src/util/locale-do-not-import.js");

  var title = msg.unattachedBlockTipTitle();
  var message = msg.unattachedBlockTipBody();
  var position = {
    my: 'bottom left',
    at: 'top right'
  };
  showGenericQtip(targetElement, title, message, position);
}
/**
 * @param {string} key
 * @param {string} defaultValue
 * @return {string}
 */


function tryGetLocalStorage(key, defaultValue) {
  if (defaultValue === undefined) {
    throw 'tryGetLocalStorage requires defaultValue';
  }

  var returnValue = defaultValue;

  try {
    returnValue = localStorage.getItem(key);
  } catch (e) {// Ignore, return default
  }

  return returnValue;
}
/**
 * Simple wrapper around localStorage.setItem that catches any exceptions (for
 * example when we call setItem in Safari's private mode)
 * @param {string} item
 * @param {string} value
 * @return {boolean} True if we set successfully
 */


function trySetLocalStorage(item, value) {
  try {
    localStorage.setItem(item, value);
    return true;
  } catch (e) {
    return false;
  }
}

function tryGetSessionStorage(key, defaultValue) {
  if (defaultValue === undefined) {
    throw 'tryGetSessionStorage requires defaultValue';
  }

  var returnValue = defaultValue;

  try {
    returnValue = sessionStorage.getItem(key);
  } catch (e) {// Ignore, return default
  }

  return returnValue;
}
/**
 * Simple wrapper around sessionStorage.setItem that catches the quota exceeded
 * exceptions we get when we call setItem in Safari's private mode.
 * @param {string} item
 * @param {string} value
 * @return {boolean} True if we set successfully
 */


function trySetSessionStorage(item, value) {
  try {
    sessionStorage.setItem(item, value);
    return true;
  } catch (e) {
    if (e.name !== 'QuotaExceededError') {
      throw e;
    }

    return false;
  }
}
/**
 * Generates a simple enum object
 * @return {Object<String, String>}
 * @example
 *   var Seasons = enum('SPRING', 'SUMMER', 'FALL', 'WINTER');
 *   Seasons.SPRING === 'SPRING';
 *   Seasons.SUMMER === 'SUMMER';
 *   // etc...
 */


function makeEnum() {
  var result = {},
      key;

  for (var i = 0; i < arguments.length; i++) {
    key = String(arguments[i]);

    if (result[key]) {
      throw new Error('Key "' + key + '" occurred twice while constructing enum');
    }

    result[key] = key;
  }

  if (Object.freeze) {
    Object.freeze(result);
  }

  return result;
}
/**
 * If the string is too long, truncate it and append an ellipsis.
 * @param {string} inputText
 * @param {number} maxLength
 * @returns {string}
 */


function ellipsify(inputText, maxLength) {
  if (inputText && inputText.length > maxLength) {
    return inputText.substr(0, maxLength - 3) + '...';
  }

  return inputText || '';
}
/**
 * Returns deep merge of two objects, concatenating rather than overwriting
 * array properites. Does not mutate either object.
 *
 * Note: new properties in overrides are always added to end, not in-order.
 *
 * TODO(bjordan): Replace with _.mergeWith when lodash upgraded to 4.x.
 *
 * Note: may become default behavior of mergeDeep in future immutable versions.
 *   @see https://github.com/facebook/immutable-js/issues/406
 *
 * @param {Object} baseObject
 * @param {Object} overrides
 * @returns {Object} original object (now modified in-place)
 */


function deepMergeConcatArrays(baseObject, overrides) {
  function deepConcatMerger(a, b) {
    var isList = _immutable["default"].List.isList;

    if (isList(a) && isList(b)) {
      return a.concat(b);
    }

    if (a && a.mergeWith) {
      return a.mergeWith(deepConcatMerger, b);
    }

    return b;
  }

  var baseImmutable = _immutable["default"].fromJS(baseObject);

  return baseImmutable.mergeWith(deepConcatMerger, overrides).toJS();
}
/**
 * Creates a new event in a cross-browswer-compatible way.
 *
 * createEvent functionality is officially deprecated in favor of
 * the Event constructor, but some older browsers do not yet support
 * event constructors. Attempt to use the new functionality, fall
 * back to the old if it fails.
 *
 * @param {String} type
 * @param {boolean} [bubbles=false]
 * @param {boolean} [cancelable=false]
 */


function createEvent(type) {
  var bubbles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var cancelable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var customEvent;

  try {
    customEvent = new Event(type, {
      bubbles: bubbles,
      cancelable: cancelable
    });
  } catch (e) {
    customEvent = document.createEvent('Event');
    customEvent.initEvent(type, bubbles, cancelable);
  }

  return customEvent;
}
/**
 * @param {Object} vector with x and y coordinates
 * @returns {Object} vector with x and y coordinates and length 1 (or 0 if
 *   the argument also had length 0)
 */


function normalize(vector) {
  var mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (mag === 0) {
    return vector;
  }

  return {
    x: vector.x / mag,
    y: vector.y / mag
  };
}
/**
 * @param {number} position selected from constants.Position
 * @param {number} containerWidth width of the element we are
 *        positioning within
 * @param {number} spriteWidth width of the element being positioned
 * @returns {number} left-most point of sprite given position constant
 */


function xFromPosition(position) {
  var containerWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var spriteWidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  switch (position) {
    case _constants.Position.OUTTOPOUTLEFT:
    case _constants.Position.TOPOUTLEFT:
    case _constants.Position.MIDDLEOUTLEFT:
    case _constants.Position.BOTTOMOUTLEFT:
    case _constants.Position.OUTBOTTOMOUTLEFT:
      return -spriteWidth;

    case _constants.Position.OUTTOPLEFT:
    case _constants.Position.TOPLEFT:
    case _constants.Position.MIDDLELEFT:
    case _constants.Position.BOTTOMLEFT:
    case _constants.Position.OUTBOTTOMLEFT:
      return 0;

    case _constants.Position.OUTTOPCENTER:
    case _constants.Position.TOPCENTER:
    case _constants.Position.MIDDLECENTER:
    case _constants.Position.BOTTOMCENTER:
    case _constants.Position.OUTBOTTOMCENTER:
      return (containerWidth - spriteWidth) / 2;

    case _constants.Position.OUTTOPRIGHT:
    case _constants.Position.TOPRIGHT:
    case _constants.Position.MIDDLERIGHT:
    case _constants.Position.BOTTOMRIGHT:
    case _constants.Position.OUTBOTTOMRIGHT:
      return containerWidth - spriteWidth;

    case _constants.Position.OUTTOPOUTRIGHT:
    case _constants.Position.TOPOUTRIGHT:
    case _constants.Position.MIDDLEOUTRIGHT:
    case _constants.Position.BOTTOMOUTRIGHT:
    case _constants.Position.OUTBOTTOMOUTRIGHT:
      return containerWidth;
  }
}
/**
 * @param {number} position selected from constants.Position
 * @param {number} containerHeight height of the element we are
 *        positioning within
 * @param {number} spriteHeight height of the element being positioned
 * @returns {number} top-most point of sprite given position constant
 */


function yFromPosition(position) {
  var containerHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var spriteHeight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  switch (position) {
    case _constants.Position.OUTTOPOUTLEFT:
    case _constants.Position.OUTTOPLEFT:
    case _constants.Position.OUTTOPCENTER:
    case _constants.Position.OUTTOPRIGHT:
    case _constants.Position.OUTTOPOUTRIGHT:
      return -spriteHeight;

    case _constants.Position.TOPOUTLEFT:
    case _constants.Position.TOPLEFT:
    case _constants.Position.TOPCENTER:
    case _constants.Position.TOPRIGHT:
    case _constants.Position.TOPOUTRIGHT:
      return 0;

    case _constants.Position.MIDDLEOUTLEFT:
    case _constants.Position.MIDDLELEFT:
    case _constants.Position.MIDDLECENTER:
    case _constants.Position.MIDDLERIGHT:
    case _constants.Position.MIDDLEOUTRIGHT:
      return (containerHeight - spriteHeight) / 2;

    case _constants.Position.BOTTOMOUTLEFT:
    case _constants.Position.BOTTOMLEFT:
    case _constants.Position.BOTTOMCENTER:
    case _constants.Position.BOTTOMRIGHT:
    case _constants.Position.BOTTOMOUTRIGHT:
      return containerHeight - spriteHeight;

    case _constants.Position.OUTBOTTOMOUTLEFT:
    case _constants.Position.OUTBOTTOMLEFT:
    case _constants.Position.OUTBOTTOMCENTER:
    case _constants.Position.OUTBOTTOMRIGHT:
    case _constants.Position.OUTBOTTOMOUTRIGHT:
      return containerHeight;
  }
}
/**
 * Calculate the Levenshtein distance between two strings
 * @param {string} a
 * @param {string} b
 * @return {number} distance
 */


function levenshtein(a, b) {
  if (!a || !b) {
    return (a || b).length;
  }

  var matrix = [];

  for (var i = 0; i <= b.length; i++) {
    matrix[i] = [i];

    if (i === 0) {
      continue;
    }

    for (var j = 0; j <= a.length; j++) {
      matrix[0][j] = j;

      if (j === 0) {
        continue;
      }

      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1) ? matrix[i - 1][j - 1] : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }

  return matrix[b.length][a.length];
}
/**
 * Bisects the given array based on the given conditional
 * @param {Array} array
 * @param {Function} conditional
 * @return {Array.<Array>} an array with two elements; the first is an
 *         array containing those values for which the given conditional
 *         function is true and the second is an array containing those
 *         values for which it is false
 */


function bisect(array, conditional) {
  var positive = array.filter(function (x) {
    return conditional(x);
  });
  var negative = array.filter(function (x) {
    return !conditional(x);
  });
  return [positive, negative];
}
/**
 * Recursively flatten the given array
 * from https://stackoverflow.com/a/15030117/1810460
 */


function flatten(array) {
  return array.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
/**
 * Helper function that wraps window.location.reload, which we cannot stub
 * in unit tests if we're running them in Chrome.
 */


function reload() {
  window.location.reload();
}

function currentLocation() {
  return window.location;
}
/**
 * Helper that wraps window.open, for stubbing in unit tests.
 */


function windowOpen() {
  var _window;

  return (_window = window).open.apply(_window, arguments);
}
/**
 * Wrapper for window.location.href which we can stub in unit tests.
 * @param {string} href Location to navigate to.
 */


function navigateToHref(href) {
  if (true) {
    window.location.href = href;
  }
}
/**
 * Takes a simple object and returns it represented as a chain of url query
 * params, including ? and & as necessary. Does not perform escaping. Examples:
 * {} -> ''
 * {a: 1} -> '?a=1'
 * {a: 1, b: 'c'} -> '?a=1&b=c'
 *
 * @param {Object} params Object to stringify.
 */


function stringifyQueryParams(params) {
  if (!params) {
    return '';
  }

  var keys = Object.keys(params);

  if (!keys.length) {
    return '';
  }

  return '?' + keys.map(function (key) {
    return "".concat(key, "=").concat(params[key]);
  }).join('&');
}
/**
 * Takes a link, looks for params already in the current URL
 * and generates a new link with those params
 */


function linkWithQueryParams(link) {
  var queryParams = window.location.search || '';
  return link + queryParams;
}
/**
 * Resets the animation of an aniGif by unsetting and setting the src
 * @param {Element} element the <img> element that needs to be reset
 */


function resetAniGif(element) {
  if (!element) {
    return;
  }

  var src = element.src;
  element.src = '#';
  setTimeout(function () {
    return element.src = src;
  }, 0);
}
/**
 * Compute a color an arbitrary distance between from and to, useful for
 * react-motion based color transitions.
 *
 * @param {string} from a hex color string
 * @param {string} to another hex color string
 * @param {number} value A number between 0 and 1, expressing how far along
 *   the way from 'from' to 'to' the returned color should be
 * @returns {string} a color between from and to
 */


function interpolateColors(from, to, value) {
  var fromRGB = new _rgbcolor["default"](from);
  var toRGB = new _rgbcolor["default"](to);
  var r = fromRGB.r * (1 - value) + toRGB.r * value;
  var g = fromRGB.g * (1 - value) + toRGB.g * value;
  var b = fromRGB.b * (1 - value) + toRGB.b * value;
  return "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")");
}
/**
 * Return a random id which will be consistent for this browser tab or window as long as it remains
 * open, including if this page is reloaded or if we navigate away and then back to it. The id will
 * be different for other tabs, including tabs in other browsers or on other machines. Unfortunately,
 * duplicating a browser tab will result in two tabs with the same id, but this is not common.
 *
 * @returns {string} A string representing a float between 0 and 1.
 */


function getTabId() {
  var tabId = tryGetSessionStorage('tabId', false);

  if (tabId) {
    return tabId;
  }

  trySetSessionStorage('tabId', Math.random() + '');
  return tryGetSessionStorage('tabId', false);
}

function createHiddenPrintWindow(src) {
  (0, _imageUtils.dataURIFromURI)(src).then(function (data) {
    var iframe = (0, _jquery["default"])('<iframe style="position: absolute; visibility: hidden;"></iframe>'); // Created a hidden iframe with just the desired image as its contents

    iframe.appendTo('body');
    iframe[0].contentWindow.document.write("<img src=\"".concat(data, "\" style=\"border: 1px solid #000;\" onload=\"if (document.execCommand('print', false, null)) {  } else { window.print(); }\"/>"));
  });
}

function calculateOffsetCoordinates(element, clientX, clientY) {
  var rect = element.getBoundingClientRect();
  return {
    x: Math.round((clientX - rect.left) * element.offsetWidth / rect.width),
    y: Math.round((clientY - rect.top) * element.offsetHeight / rect.height)
  };
}
/**
 * Detects profanity in a string.
 * @param {string} text
 * @param {string} locale Optional.
 * @param {string} authenticityToken Rails authenticity token. Optional.
 * @returns {Array<string>|null} Array of profane words.
 */


var findProfanity = function findProfanity(text, locale) {
  var authenticityToken = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var request = {
    url: '/profanity/find',
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify({
      text: text,
      locale: locale
    })
  };

  if (authenticityToken) {
    request.headers = {
      'X-CSRF-Token': authenticityToken
    };
  }

  return _jquery["default"].ajax(request);
};
/**
 * Convert a string to an MD5 hash.
 * @param {string} str
 * @returns {string} A string representing an MD5 hash.
 */


exports.findProfanity = findProfanity;

function hashString(str) {
  return (0, _md["default"])(str).toString();
}
/*
 * Add tooltip toggles to vocabulary definitions, as generated by the
 * MarkdownPreprocessor
 * @see https://getbootstrap.com/2.3.2/javascript.html#tooltips
 */


function tooltipifyVocabulary() {
  (0, _jquery["default"])('.vocab').each(function () {
    (0, _jquery["default"])(this).tooltip({
      placement: 'bottom'
    });
  });
}

function containsAtLeastOneAlphaNumeric(string) {
  return /^.*[a-zA-Z0-9èàùìòÈÀÒÙÌéáúíóÉÁÚÍÓëäüïöËÄÜÏÖêâûîôÊÂÛÎÔç'-]+.*$/.test(string);
}

/***/ }),

/***/ 134:
/*!************************************************************************************************!*\
  !*** multi @babel/polyfill/noConflict whatwg-fetch ./src/tutorialExplorer/tutorialExplorer.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! @babel/polyfill/noConflict */"./node_modules/@babel/polyfill/noConflict.js");
__webpack_require__(/*! whatwg-fetch */"./node_modules/whatwg-fetch/fetch.js");
module.exports = __webpack_require__(/*! ./src/tutorialExplorer/tutorialExplorer.js */"./src/tutorialExplorer/tutorialExplorer.js");


/***/ }),

/***/ "jquery":
/*!********************!*\
  !*** external "$" ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = $;

/***/ })

},[[134,"webpack-runtime","vendors"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHV0b3JpYWxFeHBsb3Jlci5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uLi9kYXNoYm9hcmQvYXBwL2Fzc2V0cy9pbWFnZXMvYmxhbmtfc2hhcmluZ19kcmF3aW5nLnBuZyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY3J5cHRvLWpzL2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NyeXB0by1qcy9tZDUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2V2ZW50bGlzdGVuZXIvZXZlbnRsaXN0ZW5lci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvZGFzaC5kZWJvdW5jZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wZXJmb3JtYW5jZS1ub3cvbGliL3BlcmZvcm1hbmNlLW5vdy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9wLXR5cGVzL2NoZWNrUHJvcFR5cGVzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVHlwZUNoZWNrZXJzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9wLXR5cGVzL2xpYi9SZWFjdFByb3BUeXBlc1NlY3JldC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcXVlcnktc3RyaW5nL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9yYWYvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWxhenktbG9hZC9saWIvTGF6eUxvYWQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWxhenktbG9hZC9saWIvdXRpbHMvZ2V0RWxlbWVudFBvc2l0aW9uLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9yZWFjdC1sYXp5LWxvYWQvbGliL3V0aWxzL2luVmlld3BvcnQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWxhenktbG9hZC9saWIvdXRpbHMvcGFyZW50U2Nyb2xsLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9yZWFjdC1zdGlja3kvbGliL0NvbnRhaW5lci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcmVhY3Qtc3RpY2t5L2xpYi9TdGlja3kuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3JlYWN0LXN0aWNreS9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3JnYmNvbG9yL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHJpY3QtdXJpLWVuY29kZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29uc3RhbnRzLmpzIiwid2VicGFjazovLy8uL3NyYy9pbWFnZVV0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9wb2x5ZmlsbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RlbXBsYXRlcy9TZWFyY2hCYXIuanN4Iiwid2VicGFjazovLy8uL3NyYy90dXRvcmlhbEV4cGxvcmVyL2JhY2tCdXR0b24uanN4Iiwid2VicGFjazovLy8uL3NyYy90dXRvcmlhbEV4cGxvcmVyL2ZpbHRlckNob2ljZS5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvZmlsdGVyR3JvdXAuanN4Iiwid2VicGFjazovLy8uL3NyYy90dXRvcmlhbEV4cGxvcmVyL2ZpbHRlckdyb3VwQ29udGFpbmVyLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvdHV0b3JpYWxFeHBsb3Jlci9maWx0ZXJHcm91cEhlYWRlclNlbGVjdGlvbi5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvZmlsdGVyR3JvdXBPcmdOYW1lcy5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvZmlsdGVyR3JvdXBTb3J0QnkuanN4Iiwid2VicGFjazovLy8uL3NyYy90dXRvcmlhbEV4cGxvcmVyL2ZpbHRlckhlYWRlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvZmlsdGVyU2V0LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvdHV0b3JpYWxFeHBsb3Jlci9pbWFnZS5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvbG9jYWxlLWRvLW5vdC1pbXBvcnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvcmVzcG9uc2l2ZS5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvcm9ib3RpY3NCdXR0b24uanN4Iiwid2VicGFjazovLy8uL3NyYy90dXRvcmlhbEV4cGxvcmVyL3NlYXJjaC5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvc2hhcGVzLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvdHV0b3JpYWxFeHBsb3Jlci90b2dnbGVBbGxUdXRvcmlhbHNCdXR0b24uanN4Iiwid2VicGFjazovLy8uL3NyYy90dXRvcmlhbEV4cGxvcmVyL3R1dG9yaWFsLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvdHV0b3JpYWxFeHBsb3Jlci90dXRvcmlhbERldGFpbC5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvdHV0b3JpYWxFeHBsb3Jlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdHV0b3JpYWxFeHBsb3Jlci90dXRvcmlhbFNldC5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3R1dG9yaWFsRXhwbG9yZXIvdXRpbC5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvY29sb3IuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvZXhwZXJpbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvaTE4blN0cmluZ1RyYWNrZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvaTE4blN0cmluZ1RyYWNrZXJXb3JrZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvbG9jYWxlLWRvLW5vdC1pbXBvcnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvc2FmZUxvYWRMb2NhbGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvdHJhY2tFdmVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYmxhbmtfc2hhcmluZ19kcmF3aW5nd3BhZTUzYjYyYTE2MDljYmJiNDI1NTc0ZTQ1YjM3YjgzNy5wbmdcIjsiLCI7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZmFjdG9yeSgpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0fVxuXHRlbHNlIHtcblx0XHQvLyBHbG9iYWwgKGJyb3dzZXIpXG5cdFx0cm9vdC5DcnlwdG9KUyA9IGZhY3RvcnkoKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cblx0LyoqXG5cdCAqIENyeXB0b0pTIGNvcmUgY29tcG9uZW50cy5cblx0ICovXG5cdHZhciBDcnlwdG9KUyA9IENyeXB0b0pTIHx8IChmdW5jdGlvbiAoTWF0aCwgdW5kZWZpbmVkKSB7XG5cdCAgICAvKlxuXHQgICAgICogTG9jYWwgcG9seWZpbCBvZiBPYmplY3QuY3JlYXRlXG5cdCAgICAgKi9cblx0ICAgIHZhciBjcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IChmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgZnVuY3Rpb24gRigpIHt9O1xuXG5cdCAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcblx0ICAgICAgICAgICAgdmFyIHN1YnR5cGU7XG5cblx0ICAgICAgICAgICAgRi5wcm90b3R5cGUgPSBvYmo7XG5cblx0ICAgICAgICAgICAgc3VidHlwZSA9IG5ldyBGKCk7XG5cblx0ICAgICAgICAgICAgRi5wcm90b3R5cGUgPSBudWxsO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBzdWJ0eXBlO1xuXHQgICAgICAgIH07XG5cdCAgICB9KCkpXG5cblx0ICAgIC8qKlxuXHQgICAgICogQ3J5cHRvSlMgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQyA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIExpYnJhcnkgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19saWIgPSBDLmxpYiA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEJhc2Ugb2JqZWN0IGZvciBwcm90b3R5cGFsIGluaGVyaXRhbmNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQmFzZSA9IENfbGliLkJhc2UgPSAoZnVuY3Rpb24gKCkge1xuXG5cblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3ZlcnJpZGVzIFByb3BlcnRpZXMgdG8gY29weSBpbnRvIHRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgTXlUeXBlID0gQ3J5cHRvSlMubGliLkJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBmaWVsZDogJ3ZhbHVlJyxcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgICAgICBtZXRob2Q6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICogICAgICAgICB9XG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGV4dGVuZDogZnVuY3Rpb24gKG92ZXJyaWRlcykge1xuXHQgICAgICAgICAgICAgICAgLy8gU3Bhd25cblx0ICAgICAgICAgICAgICAgIHZhciBzdWJ0eXBlID0gY3JlYXRlKHRoaXMpO1xuXG5cdCAgICAgICAgICAgICAgICAvLyBBdWdtZW50XG5cdCAgICAgICAgICAgICAgICBpZiAob3ZlcnJpZGVzKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc3VidHlwZS5taXhJbihvdmVycmlkZXMpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZGVmYXVsdCBpbml0aWFsaXplclxuXHQgICAgICAgICAgICAgICAgaWYgKCFzdWJ0eXBlLmhhc093blByb3BlcnR5KCdpbml0JykgfHwgdGhpcy5pbml0ID09PSBzdWJ0eXBlLmluaXQpIHtcblx0ICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUuJHN1cGVyLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0ICAgICAgICAgICAgICAgICAgICB9O1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplcidzIHByb3RvdHlwZSBpcyB0aGUgc3VidHlwZSBvYmplY3Rcblx0ICAgICAgICAgICAgICAgIHN1YnR5cGUuaW5pdC5wcm90b3R5cGUgPSBzdWJ0eXBlO1xuXG5cdCAgICAgICAgICAgICAgICAvLyBSZWZlcmVuY2Ugc3VwZXJ0eXBlXG5cdCAgICAgICAgICAgICAgICBzdWJ0eXBlLiRzdXBlciA9IHRoaXM7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBzdWJ0eXBlO1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBFeHRlbmRzIHRoaXMgb2JqZWN0IGFuZCBydW5zIHRoZSBpbml0IG1ldGhvZC5cblx0ICAgICAgICAgICAgICogQXJndW1lbnRzIHRvIGNyZWF0ZSgpIHdpbGwgYmUgcGFzc2VkIHRvIGluaXQoKS5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIGluc3RhbmNlID0gTXlUeXBlLmNyZWF0ZSgpO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLmV4dGVuZCgpO1xuXHQgICAgICAgICAgICAgICAgaW5zdGFuY2UuaW5pdC5hcHBseShpbnN0YW5jZSwgYXJndW1lbnRzKTtcblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKiBPdmVycmlkZSB0aGlzIG1ldGhvZCB0byBhZGQgc29tZSBsb2dpYyB3aGVuIHlvdXIgb2JqZWN0cyBhcmUgY3JlYXRlZC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBNeVR5cGUgPSBDcnlwdG9KUy5saWIuQmFzZS5leHRlbmQoe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICogICAgICAgICAgICAgLy8gLi4uXG5cdCAgICAgICAgICAgICAqICAgICAgICAgfVxuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENvcGllcyBwcm9wZXJ0aWVzIGludG8gdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzIFRoZSBwcm9wZXJ0aWVzIHRvIG1peCBpbi5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIE15VHlwZS5taXhJbih7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgZmllbGQ6ICd2YWx1ZSdcblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgbWl4SW46IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xuXHQgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BlcnR5TmFtZSkpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1twcm9wZXJ0eU5hbWVdID0gcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gSUUgd29uJ3QgY29weSB0b1N0cmluZyB1c2luZyB0aGUgbG9vcCBhYm92ZVxuXHQgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoJ3RvU3RyaW5nJykpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLnRvU3RyaW5nID0gcHJvcGVydGllcy50b1N0cmluZztcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNsb25lLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gaW5zdGFuY2UuY2xvbmUoKTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbml0LnByb3RvdHlwZS5leHRlbmQodGhpcyk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9O1xuXHQgICAgfSgpKTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBbiBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtBcnJheX0gd29yZHMgVGhlIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBzaWdCeXRlcyBUaGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGJ5dGVzIGluIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAqL1xuXHQgICAgdmFyIFdvcmRBcnJheSA9IENfbGliLldvcmRBcnJheSA9IEJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIChPcHRpb25hbCkgQW4gYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaWdCeXRlcyAoT3B0aW9uYWwpIFRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgYnl0ZXMgaW4gdGhlIHdvcmRzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKFsweDAwMDEwMjAzLCAweDA0MDUwNjA3XSk7XG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZShbMHgwMDAxMDIwMywgMHgwNDA1MDYwN10sIDYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGluaXQ6IGZ1bmN0aW9uICh3b3Jkcywgc2lnQnl0ZXMpIHtcblx0ICAgICAgICAgICAgd29yZHMgPSB0aGlzLndvcmRzID0gd29yZHMgfHwgW107XG5cblx0ICAgICAgICAgICAgaWYgKHNpZ0J5dGVzICE9IHVuZGVmaW5lZCkge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyA9IHNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyA9IHdvcmRzLmxlbmd0aCAqIDQ7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgdGhpcyB3b3JkIGFycmF5IHRvIGEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtFbmNvZGVyfSBlbmNvZGVyIChPcHRpb25hbCkgVGhlIGVuY29kaW5nIHN0cmF0ZWd5IHRvIHVzZS4gRGVmYXVsdDogQ3J5cHRvSlMuZW5jLkhleFxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5naWZpZWQgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheSArICcnO1xuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5LnRvU3RyaW5nKCk7XG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkudG9TdHJpbmcoQ3J5cHRvSlMuZW5jLlV0ZjgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoZW5jb2Rlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gKGVuY29kZXIgfHwgSGV4KS5zdHJpbmdpZnkodGhpcyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbmNhdGVuYXRlcyBhIHdvcmQgYXJyYXkgdG8gdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheSB0byBhcHBlbmQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgd29yZEFycmF5MS5jb25jYXQod29yZEFycmF5Mik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY29uY2F0OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgdGhpc1dvcmRzID0gdGhpcy53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHRoYXRXb3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHRoaXNTaWdCeXRlcyA9IHRoaXMuc2lnQnl0ZXM7XG5cdCAgICAgICAgICAgIHZhciB0aGF0U2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2xhbXAgZXhjZXNzIGJpdHNcblx0ICAgICAgICAgICAgdGhpcy5jbGFtcCgpO1xuXG5cdCAgICAgICAgICAgIC8vIENvbmNhdFxuXHQgICAgICAgICAgICBpZiAodGhpc1NpZ0J5dGVzICUgNCkge1xuXHQgICAgICAgICAgICAgICAgLy8gQ29weSBvbmUgYnl0ZSBhdCBhIHRpbWVcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhhdFNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgdGhhdEJ5dGUgPSAodGhhdFdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzV29yZHNbKHRoaXNTaWdCeXRlcyArIGkpID4+PiAyXSB8PSB0aGF0Qnl0ZSA8PCAoMjQgLSAoKHRoaXNTaWdCeXRlcyArIGkpICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIC8vIENvcHkgb25lIHdvcmQgYXQgYSB0aW1lXG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoYXRTaWdCeXRlczsgaSArPSA0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpc1dvcmRzWyh0aGlzU2lnQnl0ZXMgKyBpKSA+Pj4gMl0gPSB0aGF0V29yZHNbaSA+Pj4gMl07XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyArPSB0aGF0U2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2hhaW5hYmxlXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZW1vdmVzIGluc2lnbmlmaWNhbnQgYml0cy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgd29yZEFycmF5LmNsYW1wKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xhbXA6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHRoaXMud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHRoaXMuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2xhbXBcblx0ICAgICAgICAgICAgd29yZHNbc2lnQnl0ZXMgPj4+IDJdICY9IDB4ZmZmZmZmZmYgPDwgKDMyIC0gKHNpZ0J5dGVzICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgd29yZHMubGVuZ3RoID0gTWF0aC5jZWlsKHNpZ0J5dGVzIC8gNCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGNsb25lLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSB3b3JkQXJyYXkuY2xvbmUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBCYXNlLmNsb25lLmNhbGwodGhpcyk7XG5cdCAgICAgICAgICAgIGNsb25lLndvcmRzID0gdGhpcy53b3Jkcy5zbGljZSgwKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSB3b3JkIGFycmF5IGZpbGxlZCB3aXRoIHJhbmRvbSBieXRlcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuQnl0ZXMgVGhlIG51bWJlciBvZiByYW5kb20gYnl0ZXMgdG8gZ2VuZXJhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSByYW5kb20gd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkucmFuZG9tKDE2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByYW5kb206IGZ1bmN0aW9uIChuQnl0ZXMpIHtcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cblx0ICAgICAgICAgICAgdmFyIHIgPSAoZnVuY3Rpb24gKG1fdykge1xuXHQgICAgICAgICAgICAgICAgdmFyIG1fdyA9IG1fdztcblx0ICAgICAgICAgICAgICAgIHZhciBtX3ogPSAweDNhZGU2OGIxO1xuXHQgICAgICAgICAgICAgICAgdmFyIG1hc2sgPSAweGZmZmZmZmZmO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgIG1feiA9ICgweDkwNjkgKiAobV96ICYgMHhGRkZGKSArIChtX3ogPj4gMHgxMCkpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICBtX3cgPSAoMHg0NjUwICogKG1fdyAmIDB4RkZGRikgKyAobV93ID4+IDB4MTApKSAmIG1hc2s7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICgobV96IDw8IDB4MTApICsgbV93KSAmIG1hc2s7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzdWx0IC89IDB4MTAwMDAwMDAwO1xuXHQgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSAwLjU7XG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCAqIChNYXRoLnJhbmRvbSgpID4gLjUgPyAxIDogLTEpO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgcmNhY2hlOyBpIDwgbkJ5dGVzOyBpICs9IDQpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBfciA9IHIoKHJjYWNoZSB8fCBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMDAwKTtcblxuXHQgICAgICAgICAgICAgICAgcmNhY2hlID0gX3IoKSAqIDB4M2FkZTY3Yjc7XG5cdCAgICAgICAgICAgICAgICB3b3Jkcy5wdXNoKChfcigpICogMHgxMDAwMDAwMDApIHwgMCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBuQnl0ZXMpO1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEVuY29kZXIgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19lbmMgPSBDLmVuYyA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEhleCBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEhleCA9IENfZW5jLkhleCA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoZXhTdHJpbmcgPSBDcnlwdG9KUy5lbmMuSGV4LnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgaGV4Q2hhcnMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgYml0ZSA9ICh3b3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICBoZXhDaGFycy5wdXNoKChiaXRlID4+PiA0KS50b1N0cmluZygxNikpO1xuXHQgICAgICAgICAgICAgICAgaGV4Q2hhcnMucHVzaCgoYml0ZSAmIDB4MGYpLnRvU3RyaW5nKDE2KSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gaGV4Q2hhcnMuam9pbignJyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgaGV4IHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaGV4U3RyIFRoZSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5IZXgucGFyc2UoaGV4U3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKGhleFN0cikge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgaGV4U3RyTGVuZ3RoID0gaGV4U3RyLmxlbmd0aDtcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhleFN0ckxlbmd0aDsgaSArPSAyKSB7XG5cdCAgICAgICAgICAgICAgICB3b3Jkc1tpID4+PiAzXSB8PSBwYXJzZUludChoZXhTdHIuc3Vic3RyKGksIDIpLCAxNikgPDwgKDI0IC0gKGkgJSA4KSAqIDQpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgaGV4U3RyTGVuZ3RoIC8gMik7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBMYXRpbjEgZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBMYXRpbjEgPSBDX2VuYy5MYXRpbjEgPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgbGF0aW4xU3RyaW5nID0gQ3J5cHRvSlMuZW5jLkxhdGluMS5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIGxhdGluMUNoYXJzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgdmFyIGJpdGUgPSAod29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgbGF0aW4xQ2hhcnMucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGJpdGUpKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBsYXRpbjFDaGFycy5qb2luKCcnKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBMYXRpbjEgc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYXRpbjFTdHIgVGhlIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLkxhdGluMS5wYXJzZShsYXRpbjFTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAobGF0aW4xU3RyKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBsYXRpbjFTdHJMZW5ndGggPSBsYXRpbjFTdHIubGVuZ3RoO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF0aW4xU3RyTGVuZ3RoOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHdvcmRzW2kgPj4+IDJdIHw9IChsYXRpbjFTdHIuY2hhckNvZGVBdChpKSAmIDB4ZmYpIDw8ICgyNCAtIChpICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIGxhdGluMVN0ckxlbmd0aCk7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBVVEYtOCBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIFV0ZjggPSBDX2VuYy5VdGY4ID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB1dGY4U3RyaW5nID0gQ3J5cHRvSlMuZW5jLlV0Zjguc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIHRyeSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShMYXRpbjEuc3RyaW5naWZ5KHdvcmRBcnJheSkpKTtcblx0ICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYWxmb3JtZWQgVVRGLTggZGF0YScpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgVVRGLTggc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1dGY4U3RyIFRoZSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLlV0ZjgucGFyc2UodXRmOFN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh1dGY4U3RyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBMYXRpbjEucGFyc2UodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHV0ZjhTdHIpKSk7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBYnN0cmFjdCBidWZmZXJlZCBibG9jayBhbGdvcml0aG0gdGVtcGxhdGUuXG5cdCAgICAgKlxuXHQgICAgICogVGhlIHByb3BlcnR5IGJsb2NrU2l6ZSBtdXN0IGJlIGltcGxlbWVudGVkIGluIGEgY29uY3JldGUgc3VidHlwZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gX21pbkJ1ZmZlclNpemUgVGhlIG51bWJlciBvZiBibG9ja3MgdGhhdCBzaG91bGQgYmUga2VwdCB1bnByb2Nlc3NlZCBpbiB0aGUgYnVmZmVyLiBEZWZhdWx0OiAwXG5cdCAgICAgKi9cblx0ICAgIHZhciBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtID0gQ19saWIuQnVmZmVyZWRCbG9ja0FsZ29yaXRobSA9IEJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZXNldHMgdGhpcyBibG9jayBhbGdvcml0aG0ncyBkYXRhIGJ1ZmZlciB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5yZXNldCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIEluaXRpYWwgdmFsdWVzXG5cdCAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBuZXcgV29yZEFycmF5LmluaXQoKTtcblx0ICAgICAgICAgICAgdGhpcy5fbkRhdGFCeXRlcyA9IDA7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEFkZHMgbmV3IGRhdGEgdG8gdGhpcyBibG9jayBhbGdvcml0aG0ncyBidWZmZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYXBwZW5kLiBTdHJpbmdzIGFyZSBjb252ZXJ0ZWQgdG8gYSBXb3JkQXJyYXkgdXNpbmcgVVRGLTguXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX2FwcGVuZCgnZGF0YScpO1xuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9hcHBlbmQod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfYXBwZW5kOiBmdW5jdGlvbiAoZGF0YSkge1xuXHQgICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBXb3JkQXJyYXksIGVsc2UgYXNzdW1lIFdvcmRBcnJheSBhbHJlYWR5XG5cdCAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJykge1xuXHQgICAgICAgICAgICAgICAgZGF0YSA9IFV0ZjgucGFyc2UoZGF0YSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBBcHBlbmRcblx0ICAgICAgICAgICAgdGhpcy5fZGF0YS5jb25jYXQoZGF0YSk7XG5cdCAgICAgICAgICAgIHRoaXMuX25EYXRhQnl0ZXMgKz0gZGF0YS5zaWdCeXRlcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUHJvY2Vzc2VzIGF2YWlsYWJsZSBkYXRhIGJsb2Nrcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIFRoaXMgbWV0aG9kIGludm9rZXMgX2RvUHJvY2Vzc0Jsb2NrKG9mZnNldCksIHdoaWNoIG11c3QgYmUgaW1wbGVtZW50ZWQgYnkgYSBjb25jcmV0ZSBzdWJ0eXBlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBkb0ZsdXNoIFdoZXRoZXIgYWxsIGJsb2NrcyBhbmQgcGFydGlhbCBibG9ja3Mgc2hvdWxkIGJlIHByb2Nlc3NlZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHByb2Nlc3NlZCBkYXRhLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgcHJvY2Vzc2VkRGF0YSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX3Byb2Nlc3MoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHByb2Nlc3NlZERhdGEgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9wcm9jZXNzKCEhJ2ZsdXNoJyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX3Byb2Nlc3M6IGZ1bmN0aW9uIChkb0ZsdXNoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2RhdGE7XG5cdCAgICAgICAgICAgIHZhciBkYXRhV29yZHMgPSBkYXRhLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgZGF0YVNpZ0J5dGVzID0gZGF0YS5zaWdCeXRlcztcblx0ICAgICAgICAgICAgdmFyIGJsb2NrU2l6ZSA9IHRoaXMuYmxvY2tTaXplO1xuXHQgICAgICAgICAgICB2YXIgYmxvY2tTaXplQnl0ZXMgPSBibG9ja1NpemUgKiA0O1xuXG5cdCAgICAgICAgICAgIC8vIENvdW50IGJsb2NrcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbkJsb2Nrc1JlYWR5ID0gZGF0YVNpZ0J5dGVzIC8gYmxvY2tTaXplQnl0ZXM7XG5cdCAgICAgICAgICAgIGlmIChkb0ZsdXNoKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBSb3VuZCB1cCB0byBpbmNsdWRlIHBhcnRpYWwgYmxvY2tzXG5cdCAgICAgICAgICAgICAgICBuQmxvY2tzUmVhZHkgPSBNYXRoLmNlaWwobkJsb2Nrc1JlYWR5KTtcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIC8vIFJvdW5kIGRvd24gdG8gaW5jbHVkZSBvbmx5IGZ1bGwgYmxvY2tzLFxuXHQgICAgICAgICAgICAgICAgLy8gbGVzcyB0aGUgbnVtYmVyIG9mIGJsb2NrcyB0aGF0IG11c3QgcmVtYWluIGluIHRoZSBidWZmZXJcblx0ICAgICAgICAgICAgICAgIG5CbG9ja3NSZWFkeSA9IE1hdGgubWF4KChuQmxvY2tzUmVhZHkgfCAwKSAtIHRoaXMuX21pbkJ1ZmZlclNpemUsIDApO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgd29yZHMgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5Xb3Jkc1JlYWR5ID0gbkJsb2Nrc1JlYWR5ICogYmxvY2tTaXplO1xuXG5cdCAgICAgICAgICAgIC8vIENvdW50IGJ5dGVzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuQnl0ZXNSZWFkeSA9IE1hdGgubWluKG5Xb3Jkc1JlYWR5ICogNCwgZGF0YVNpZ0J5dGVzKTtcblxuXHQgICAgICAgICAgICAvLyBQcm9jZXNzIGJsb2Nrc1xuXHQgICAgICAgICAgICBpZiAobldvcmRzUmVhZHkpIHtcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IG5Xb3Jkc1JlYWR5OyBvZmZzZXQgKz0gYmxvY2tTaXplKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1hbGdvcml0aG0gbG9naWNcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLl9kb1Byb2Nlc3NCbG9jayhkYXRhV29yZHMsIG9mZnNldCk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBwcm9jZXNzZWQgd29yZHNcblx0ICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzZWRXb3JkcyA9IGRhdGFXb3Jkcy5zcGxpY2UoMCwgbldvcmRzUmVhZHkpO1xuXHQgICAgICAgICAgICAgICAgZGF0YS5zaWdCeXRlcyAtPSBuQnl0ZXNSZWFkeTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIFJldHVybiBwcm9jZXNzZWQgd29yZHNcblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdChwcm9jZXNzZWRXb3JkcywgbkJ5dGVzUmVhZHkpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNsb25lLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLmNsb25lKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGNsb25lID0gQmFzZS5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS5fZGF0YSA9IHRoaXMuX2RhdGEuY2xvbmUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9taW5CdWZmZXJTaXplOiAwXG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBYnN0cmFjdCBoYXNoZXIgdGVtcGxhdGUuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGJsb2NrU2l6ZSBUaGUgbnVtYmVyIG9mIDMyLWJpdCB3b3JkcyB0aGlzIGhhc2hlciBvcGVyYXRlcyBvbi4gRGVmYXVsdDogMTYgKDUxMiBiaXRzKVxuXHQgICAgICovXG5cdCAgICB2YXIgSGFzaGVyID0gQ19saWIuSGFzaGVyID0gQnVmZmVyZWRCbG9ja0FsZ29yaXRobS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucy5cblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjZmc6IEJhc2UuZXh0ZW5kKCksXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgaGFzaGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGNmZyAoT3B0aW9uYWwpIFRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgdG8gdXNlIGZvciB0aGlzIGhhc2ggY29tcHV0YXRpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoYXNoZXIgPSBDcnlwdG9KUy5hbGdvLlNIQTI1Ni5jcmVhdGUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBpbml0OiBmdW5jdGlvbiAoY2ZnKSB7XG5cdCAgICAgICAgICAgIC8vIEFwcGx5IGNvbmZpZyBkZWZhdWx0c1xuXHQgICAgICAgICAgICB0aGlzLmNmZyA9IHRoaXMuY2ZnLmV4dGVuZChjZmcpO1xuXG5cdCAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIHZhbHVlc1xuXHQgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlc2V0cyB0aGlzIGhhc2hlciB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnJlc2V0KCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gUmVzZXQgZGF0YSBidWZmZXJcblx0ICAgICAgICAgICAgQnVmZmVyZWRCbG9ja0FsZ29yaXRobS5yZXNldC5jYWxsKHRoaXMpO1xuXG5cdCAgICAgICAgICAgIC8vIFBlcmZvcm0gY29uY3JldGUtaGFzaGVyIGxvZ2ljXG5cdCAgICAgICAgICAgIHRoaXMuX2RvUmVzZXQoKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogVXBkYXRlcyB0aGlzIGhhc2hlciB3aXRoIGEgbWVzc2FnZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZVVwZGF0ZSBUaGUgbWVzc2FnZSB0byBhcHBlbmQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtIYXNoZXJ9IFRoaXMgaGFzaGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBoYXNoZXIudXBkYXRlKCdtZXNzYWdlJyk7XG5cdCAgICAgICAgICogICAgIGhhc2hlci51cGRhdGUod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgIC8vIEFwcGVuZFxuXHQgICAgICAgICAgICB0aGlzLl9hcHBlbmQobWVzc2FnZVVwZGF0ZSk7XG5cblx0ICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBoYXNoXG5cdCAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3MoKTtcblxuXHQgICAgICAgICAgICAvLyBDaGFpbmFibGVcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEZpbmFsaXplcyB0aGUgaGFzaCBjb21wdXRhdGlvbi5cblx0ICAgICAgICAgKiBOb3RlIHRoYXQgdGhlIGZpbmFsaXplIG9wZXJhdGlvbiBpcyBlZmZlY3RpdmVseSBhIGRlc3RydWN0aXZlLCByZWFkLW9uY2Ugb3BlcmF0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlVXBkYXRlIChPcHRpb25hbCkgQSBmaW5hbCBtZXNzYWdlIHVwZGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGhhc2guXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKCk7XG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKCdtZXNzYWdlJyk7XG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgZmluYWxpemU6IGZ1bmN0aW9uIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgIC8vIEZpbmFsIG1lc3NhZ2UgdXBkYXRlXG5cdCAgICAgICAgICAgIGlmIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLl9hcHBlbmQobWVzc2FnZVVwZGF0ZSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWhhc2hlciBsb2dpY1xuXHQgICAgICAgICAgICB2YXIgaGFzaCA9IHRoaXMuX2RvRmluYWxpemUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gaGFzaDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgYmxvY2tTaXplOiA1MTIvMzIsXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgc2hvcnRjdXQgZnVuY3Rpb24gdG8gYSBoYXNoZXIncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtIYXNoZXJ9IGhhc2hlciBUaGUgaGFzaGVyIHRvIGNyZWF0ZSBhIGhlbHBlciBmb3IuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIHNob3J0Y3V0IGZ1bmN0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgU0hBMjU2ID0gQ3J5cHRvSlMubGliLkhhc2hlci5fY3JlYXRlSGVscGVyKENyeXB0b0pTLmFsZ28uU0hBMjU2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfY3JlYXRlSGVscGVyOiBmdW5jdGlvbiAoaGFzaGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAobWVzc2FnZSwgY2ZnKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGhhc2hlci5pbml0KGNmZykuZmluYWxpemUobWVzc2FnZSk7XG5cdCAgICAgICAgICAgIH07XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBzaG9ydGN1dCBmdW5jdGlvbiB0byB0aGUgSE1BQydzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0hhc2hlcn0gaGFzaGVyIFRoZSBoYXNoZXIgdG8gdXNlIGluIHRoaXMgSE1BQyBoZWxwZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIHNob3J0Y3V0IGZ1bmN0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgSG1hY1NIQTI1NiA9IENyeXB0b0pTLmxpYi5IYXNoZXIuX2NyZWF0ZUhtYWNIZWxwZXIoQ3J5cHRvSlMuYWxnby5TSEEyNTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9jcmVhdGVIbWFjSGVscGVyOiBmdW5jdGlvbiAoaGFzaGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAobWVzc2FnZSwga2V5KSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENfYWxnby5ITUFDLmluaXQoaGFzaGVyLCBrZXkpLmZpbmFsaXplKG1lc3NhZ2UpO1xuXHQgICAgICAgICAgICB9O1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFsZ29yaXRobSBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2FsZ28gPSBDLmFsZ28gPSB7fTtcblxuXHQgICAgcmV0dXJuIEM7XG5cdH0oTWF0aCkpO1xuXG5cblx0cmV0dXJuIENyeXB0b0pTO1xuXG59KSk7IiwiOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcblx0XHQvLyBDb21tb25KU1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcIi4vY29yZVwiKSk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTURcblx0XHRkZWZpbmUoW1wiLi9jb3JlXCJdLCBmYWN0b3J5KTtcblx0fVxuXHRlbHNlIHtcblx0XHQvLyBHbG9iYWwgKGJyb3dzZXIpXG5cdFx0ZmFjdG9yeShyb290LkNyeXB0b0pTKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbiAoQ3J5cHRvSlMpIHtcblxuXHQoZnVuY3Rpb24gKE1hdGgpIHtcblx0ICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgdmFyIEMgPSBDcnlwdG9KUztcblx0ICAgIHZhciBDX2xpYiA9IEMubGliO1xuXHQgICAgdmFyIFdvcmRBcnJheSA9IENfbGliLldvcmRBcnJheTtcblx0ICAgIHZhciBIYXNoZXIgPSBDX2xpYi5IYXNoZXI7XG5cdCAgICB2YXIgQ19hbGdvID0gQy5hbGdvO1xuXG5cdCAgICAvLyBDb25zdGFudHMgdGFibGVcblx0ICAgIHZhciBUID0gW107XG5cblx0ICAgIC8vIENvbXB1dGUgY29uc3RhbnRzXG5cdCAgICAoZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKykge1xuXHQgICAgICAgICAgICBUW2ldID0gKE1hdGguYWJzKE1hdGguc2luKGkgKyAxKSkgKiAweDEwMDAwMDAwMCkgfCAwO1xuXHQgICAgICAgIH1cblx0ICAgIH0oKSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogTUQ1IGhhc2ggYWxnb3JpdGhtLlxuXHQgICAgICovXG5cdCAgICB2YXIgTUQ1ID0gQ19hbGdvLk1ENSA9IEhhc2hlci5leHRlbmQoe1xuXHQgICAgICAgIF9kb1Jlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHRoaXMuX2hhc2ggPSBuZXcgV29yZEFycmF5LmluaXQoW1xuXHQgICAgICAgICAgICAgICAgMHg2NzQ1MjMwMSwgMHhlZmNkYWI4OSxcblx0ICAgICAgICAgICAgICAgIDB4OThiYWRjZmUsIDB4MTAzMjU0NzZcblx0ICAgICAgICAgICAgXSk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9kb1Byb2Nlc3NCbG9jazogZnVuY3Rpb24gKE0sIG9mZnNldCkge1xuXHQgICAgICAgICAgICAvLyBTd2FwIGVuZGlhblxuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICAgICAgdmFyIG9mZnNldF9pID0gb2Zmc2V0ICsgaTtcblx0ICAgICAgICAgICAgICAgIHZhciBNX29mZnNldF9pID0gTVtvZmZzZXRfaV07XG5cblx0ICAgICAgICAgICAgICAgIE1bb2Zmc2V0X2ldID0gKFxuXHQgICAgICAgICAgICAgICAgICAgICgoKE1fb2Zmc2V0X2kgPDwgOCkgIHwgKE1fb2Zmc2V0X2kgPj4+IDI0KSkgJiAweDAwZmYwMGZmKSB8XG5cdCAgICAgICAgICAgICAgICAgICAgKCgoTV9vZmZzZXRfaSA8PCAyNCkgfCAoTV9vZmZzZXRfaSA+Pj4gOCkpICAmIDB4ZmYwMGZmMDApXG5cdCAgICAgICAgICAgICAgICApO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBIID0gdGhpcy5faGFzaC53b3JkcztcblxuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfMCAgPSBNW29mZnNldCArIDBdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfMSAgPSBNW29mZnNldCArIDFdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfMiAgPSBNW29mZnNldCArIDJdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfMyAgPSBNW29mZnNldCArIDNdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfNCAgPSBNW29mZnNldCArIDRdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfNSAgPSBNW29mZnNldCArIDVdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfNiAgPSBNW29mZnNldCArIDZdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfNyAgPSBNW29mZnNldCArIDddO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfOCAgPSBNW29mZnNldCArIDhdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfOSAgPSBNW29mZnNldCArIDldO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfMTAgPSBNW29mZnNldCArIDEwXTtcblx0ICAgICAgICAgICAgdmFyIE1fb2Zmc2V0XzExID0gTVtvZmZzZXQgKyAxMV07XG5cdCAgICAgICAgICAgIHZhciBNX29mZnNldF8xMiA9IE1bb2Zmc2V0ICsgMTJdO1xuXHQgICAgICAgICAgICB2YXIgTV9vZmZzZXRfMTMgPSBNW29mZnNldCArIDEzXTtcblx0ICAgICAgICAgICAgdmFyIE1fb2Zmc2V0XzE0ID0gTVtvZmZzZXQgKyAxNF07XG5cdCAgICAgICAgICAgIHZhciBNX29mZnNldF8xNSA9IE1bb2Zmc2V0ICsgMTVdO1xuXG5cdCAgICAgICAgICAgIC8vIFdvcmtpbmcgdmFyaWFsYmVzXG5cdCAgICAgICAgICAgIHZhciBhID0gSFswXTtcblx0ICAgICAgICAgICAgdmFyIGIgPSBIWzFdO1xuXHQgICAgICAgICAgICB2YXIgYyA9IEhbMl07XG5cdCAgICAgICAgICAgIHZhciBkID0gSFszXTtcblxuXHQgICAgICAgICAgICAvLyBDb21wdXRhdGlvblxuXHQgICAgICAgICAgICBhID0gRkYoYSwgYiwgYywgZCwgTV9vZmZzZXRfMCwgIDcsICBUWzBdKTtcblx0ICAgICAgICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIE1fb2Zmc2V0XzEsICAxMiwgVFsxXSk7XG5cdCAgICAgICAgICAgIGMgPSBGRihjLCBkLCBhLCBiLCBNX29mZnNldF8yLCAgMTcsIFRbMl0pO1xuXHQgICAgICAgICAgICBiID0gRkYoYiwgYywgZCwgYSwgTV9vZmZzZXRfMywgIDIyLCBUWzNdKTtcblx0ICAgICAgICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIE1fb2Zmc2V0XzQsICA3LCAgVFs0XSk7XG5cdCAgICAgICAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBNX29mZnNldF81LCAgMTIsIFRbNV0pO1xuXHQgICAgICAgICAgICBjID0gRkYoYywgZCwgYSwgYiwgTV9vZmZzZXRfNiwgIDE3LCBUWzZdKTtcblx0ICAgICAgICAgICAgYiA9IEZGKGIsIGMsIGQsIGEsIE1fb2Zmc2V0XzcsICAyMiwgVFs3XSk7XG5cdCAgICAgICAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBNX29mZnNldF84LCAgNywgIFRbOF0pO1xuXHQgICAgICAgICAgICBkID0gRkYoZCwgYSwgYiwgYywgTV9vZmZzZXRfOSwgIDEyLCBUWzldKTtcblx0ICAgICAgICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIE1fb2Zmc2V0XzEwLCAxNywgVFsxMF0pO1xuXHQgICAgICAgICAgICBiID0gRkYoYiwgYywgZCwgYSwgTV9vZmZzZXRfMTEsIDIyLCBUWzExXSk7XG5cdCAgICAgICAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBNX29mZnNldF8xMiwgNywgIFRbMTJdKTtcblx0ICAgICAgICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIE1fb2Zmc2V0XzEzLCAxMiwgVFsxM10pO1xuXHQgICAgICAgICAgICBjID0gRkYoYywgZCwgYSwgYiwgTV9vZmZzZXRfMTQsIDE3LCBUWzE0XSk7XG5cdCAgICAgICAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBNX29mZnNldF8xNSwgMjIsIFRbMTVdKTtcblxuXHQgICAgICAgICAgICBhID0gR0coYSwgYiwgYywgZCwgTV9vZmZzZXRfMSwgIDUsICBUWzE2XSk7XG5cdCAgICAgICAgICAgIGQgPSBHRyhkLCBhLCBiLCBjLCBNX29mZnNldF82LCAgOSwgIFRbMTddKTtcblx0ICAgICAgICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIE1fb2Zmc2V0XzExLCAxNCwgVFsxOF0pO1xuXHQgICAgICAgICAgICBiID0gR0coYiwgYywgZCwgYSwgTV9vZmZzZXRfMCwgIDIwLCBUWzE5XSk7XG5cdCAgICAgICAgICAgIGEgPSBHRyhhLCBiLCBjLCBkLCBNX29mZnNldF81LCAgNSwgIFRbMjBdKTtcblx0ICAgICAgICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIE1fb2Zmc2V0XzEwLCA5LCAgVFsyMV0pO1xuXHQgICAgICAgICAgICBjID0gR0coYywgZCwgYSwgYiwgTV9vZmZzZXRfMTUsIDE0LCBUWzIyXSk7XG5cdCAgICAgICAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBNX29mZnNldF80LCAgMjAsIFRbMjNdKTtcblx0ICAgICAgICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIE1fb2Zmc2V0XzksICA1LCAgVFsyNF0pO1xuXHQgICAgICAgICAgICBkID0gR0coZCwgYSwgYiwgYywgTV9vZmZzZXRfMTQsIDksICBUWzI1XSk7XG5cdCAgICAgICAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBNX29mZnNldF8zLCAgMTQsIFRbMjZdKTtcblx0ICAgICAgICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIE1fb2Zmc2V0XzgsICAyMCwgVFsyN10pO1xuXHQgICAgICAgICAgICBhID0gR0coYSwgYiwgYywgZCwgTV9vZmZzZXRfMTMsIDUsICBUWzI4XSk7XG5cdCAgICAgICAgICAgIGQgPSBHRyhkLCBhLCBiLCBjLCBNX29mZnNldF8yLCAgOSwgIFRbMjldKTtcblx0ICAgICAgICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIE1fb2Zmc2V0XzcsICAxNCwgVFszMF0pO1xuXHQgICAgICAgICAgICBiID0gR0coYiwgYywgZCwgYSwgTV9vZmZzZXRfMTIsIDIwLCBUWzMxXSk7XG5cblx0ICAgICAgICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIE1fb2Zmc2V0XzUsICA0LCAgVFszMl0pO1xuXHQgICAgICAgICAgICBkID0gSEgoZCwgYSwgYiwgYywgTV9vZmZzZXRfOCwgIDExLCBUWzMzXSk7XG5cdCAgICAgICAgICAgIGMgPSBISChjLCBkLCBhLCBiLCBNX29mZnNldF8xMSwgMTYsIFRbMzRdKTtcblx0ICAgICAgICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIE1fb2Zmc2V0XzE0LCAyMywgVFszNV0pO1xuXHQgICAgICAgICAgICBhID0gSEgoYSwgYiwgYywgZCwgTV9vZmZzZXRfMSwgIDQsICBUWzM2XSk7XG5cdCAgICAgICAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBNX29mZnNldF80LCAgMTEsIFRbMzddKTtcblx0ICAgICAgICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIE1fb2Zmc2V0XzcsICAxNiwgVFszOF0pO1xuXHQgICAgICAgICAgICBiID0gSEgoYiwgYywgZCwgYSwgTV9vZmZzZXRfMTAsIDIzLCBUWzM5XSk7XG5cdCAgICAgICAgICAgIGEgPSBISChhLCBiLCBjLCBkLCBNX29mZnNldF8xMywgNCwgIFRbNDBdKTtcblx0ICAgICAgICAgICAgZCA9IEhIKGQsIGEsIGIsIGMsIE1fb2Zmc2V0XzAsICAxMSwgVFs0MV0pO1xuXHQgICAgICAgICAgICBjID0gSEgoYywgZCwgYSwgYiwgTV9vZmZzZXRfMywgIDE2LCBUWzQyXSk7XG5cdCAgICAgICAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBNX29mZnNldF82LCAgMjMsIFRbNDNdKTtcblx0ICAgICAgICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIE1fb2Zmc2V0XzksICA0LCAgVFs0NF0pO1xuXHQgICAgICAgICAgICBkID0gSEgoZCwgYSwgYiwgYywgTV9vZmZzZXRfMTIsIDExLCBUWzQ1XSk7XG5cdCAgICAgICAgICAgIGMgPSBISChjLCBkLCBhLCBiLCBNX29mZnNldF8xNSwgMTYsIFRbNDZdKTtcblx0ICAgICAgICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIE1fb2Zmc2V0XzIsICAyMywgVFs0N10pO1xuXG5cdCAgICAgICAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBNX29mZnNldF8wLCAgNiwgIFRbNDhdKTtcblx0ICAgICAgICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIE1fb2Zmc2V0XzcsICAxMCwgVFs0OV0pO1xuXHQgICAgICAgICAgICBjID0gSUkoYywgZCwgYSwgYiwgTV9vZmZzZXRfMTQsIDE1LCBUWzUwXSk7XG5cdCAgICAgICAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBNX29mZnNldF81LCAgMjEsIFRbNTFdKTtcblx0ICAgICAgICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIE1fb2Zmc2V0XzEyLCA2LCAgVFs1Ml0pO1xuXHQgICAgICAgICAgICBkID0gSUkoZCwgYSwgYiwgYywgTV9vZmZzZXRfMywgIDEwLCBUWzUzXSk7XG5cdCAgICAgICAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBNX29mZnNldF8xMCwgMTUsIFRbNTRdKTtcblx0ICAgICAgICAgICAgYiA9IElJKGIsIGMsIGQsIGEsIE1fb2Zmc2V0XzEsICAyMSwgVFs1NV0pO1xuXHQgICAgICAgICAgICBhID0gSUkoYSwgYiwgYywgZCwgTV9vZmZzZXRfOCwgIDYsICBUWzU2XSk7XG5cdCAgICAgICAgICAgIGQgPSBJSShkLCBhLCBiLCBjLCBNX29mZnNldF8xNSwgMTAsIFRbNTddKTtcblx0ICAgICAgICAgICAgYyA9IElJKGMsIGQsIGEsIGIsIE1fb2Zmc2V0XzYsICAxNSwgVFs1OF0pO1xuXHQgICAgICAgICAgICBiID0gSUkoYiwgYywgZCwgYSwgTV9vZmZzZXRfMTMsIDIxLCBUWzU5XSk7XG5cdCAgICAgICAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBNX29mZnNldF80LCAgNiwgIFRbNjBdKTtcblx0ICAgICAgICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIE1fb2Zmc2V0XzExLCAxMCwgVFs2MV0pO1xuXHQgICAgICAgICAgICBjID0gSUkoYywgZCwgYSwgYiwgTV9vZmZzZXRfMiwgIDE1LCBUWzYyXSk7XG5cdCAgICAgICAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBNX29mZnNldF85LCAgMjEsIFRbNjNdKTtcblxuXHQgICAgICAgICAgICAvLyBJbnRlcm1lZGlhdGUgaGFzaCB2YWx1ZVxuXHQgICAgICAgICAgICBIWzBdID0gKEhbMF0gKyBhKSB8IDA7XG5cdCAgICAgICAgICAgIEhbMV0gPSAoSFsxXSArIGIpIHwgMDtcblx0ICAgICAgICAgICAgSFsyXSA9IChIWzJdICsgYykgfCAwO1xuXHQgICAgICAgICAgICBIWzNdID0gKEhbM10gKyBkKSB8IDA7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9kb0ZpbmFsaXplOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2RhdGE7XG5cdCAgICAgICAgICAgIHZhciBkYXRhV29yZHMgPSBkYXRhLndvcmRzO1xuXG5cdCAgICAgICAgICAgIHZhciBuQml0c1RvdGFsID0gdGhpcy5fbkRhdGFCeXRlcyAqIDg7XG5cdCAgICAgICAgICAgIHZhciBuQml0c0xlZnQgPSBkYXRhLnNpZ0J5dGVzICogODtcblxuXHQgICAgICAgICAgICAvLyBBZGQgcGFkZGluZ1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbbkJpdHNMZWZ0ID4+PiA1XSB8PSAweDgwIDw8ICgyNCAtIG5CaXRzTGVmdCAlIDMyKTtcblxuXHQgICAgICAgICAgICB2YXIgbkJpdHNUb3RhbEggPSBNYXRoLmZsb29yKG5CaXRzVG90YWwgLyAweDEwMDAwMDAwMCk7XG5cdCAgICAgICAgICAgIHZhciBuQml0c1RvdGFsTCA9IG5CaXRzVG90YWw7XG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1soKChuQml0c0xlZnQgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTVdID0gKFxuXHQgICAgICAgICAgICAgICAgKCgobkJpdHNUb3RhbEggPDwgOCkgIHwgKG5CaXRzVG90YWxIID4+PiAyNCkpICYgMHgwMGZmMDBmZikgfFxuXHQgICAgICAgICAgICAgICAgKCgobkJpdHNUb3RhbEggPDwgMjQpIHwgKG5CaXRzVG90YWxIID4+PiA4KSkgICYgMHhmZjAwZmYwMClcblx0ICAgICAgICAgICAgKTtcblx0ICAgICAgICAgICAgZGF0YVdvcmRzWygoKG5CaXRzTGVmdCArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSAoXG5cdCAgICAgICAgICAgICAgICAoKChuQml0c1RvdGFsTCA8PCA4KSAgfCAobkJpdHNUb3RhbEwgPj4+IDI0KSkgJiAweDAwZmYwMGZmKSB8XG5cdCAgICAgICAgICAgICAgICAoKChuQml0c1RvdGFsTCA8PCAyNCkgfCAobkJpdHNUb3RhbEwgPj4+IDgpKSAgJiAweGZmMDBmZjAwKVxuXHQgICAgICAgICAgICApO1xuXG5cdCAgICAgICAgICAgIGRhdGEuc2lnQnl0ZXMgPSAoZGF0YVdvcmRzLmxlbmd0aCArIDEpICogNDtcblxuXHQgICAgICAgICAgICAvLyBIYXNoIGZpbmFsIGJsb2Nrc1xuXHQgICAgICAgICAgICB0aGlzLl9wcm9jZXNzKCk7XG5cblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBoYXNoID0gdGhpcy5faGFzaDtcblx0ICAgICAgICAgICAgdmFyIEggPSBoYXNoLndvcmRzO1xuXG5cdCAgICAgICAgICAgIC8vIFN3YXAgZW5kaWFuXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICAgICAgdmFyIEhfaSA9IEhbaV07XG5cblx0ICAgICAgICAgICAgICAgIEhbaV0gPSAoKChIX2kgPDwgOCkgIHwgKEhfaSA+Pj4gMjQpKSAmIDB4MDBmZjAwZmYpIHxcblx0ICAgICAgICAgICAgICAgICAgICAgICAoKChIX2kgPDwgMjQpIHwgKEhfaSA+Pj4gOCkpICAmIDB4ZmYwMGZmMDApO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gUmV0dXJuIGZpbmFsIGNvbXB1dGVkIGhhc2hcblx0ICAgICAgICAgICAgcmV0dXJuIGhhc2g7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEhhc2hlci5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS5faGFzaCA9IHRoaXMuX2hhc2guY2xvbmUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIGZ1bmN0aW9uIEZGKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcblx0ICAgICAgICB2YXIgbiA9IGEgKyAoKGIgJiBjKSB8ICh+YiAmIGQpKSArIHggKyB0O1xuXHQgICAgICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIEdHKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcblx0ICAgICAgICB2YXIgbiA9IGEgKyAoKGIgJiBkKSB8IChjICYgfmQpKSArIHggKyB0O1xuXHQgICAgICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIEhIKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcblx0ICAgICAgICB2YXIgbiA9IGEgKyAoYiBeIGMgXiBkKSArIHggKyB0O1xuXHQgICAgICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIElJKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcblx0ICAgICAgICB2YXIgbiA9IGEgKyAoYyBeIChiIHwgfmQpKSArIHggKyB0O1xuXHQgICAgICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XG5cdCAgICB9XG5cblx0ICAgIC8qKlxuXHQgICAgICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIGhhc2hlcidzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgKlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGhhc2guXG5cdCAgICAgKlxuXHQgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgaGFzaC5cblx0ICAgICAqXG5cdCAgICAgKiBAc3RhdGljXG5cdCAgICAgKlxuXHQgICAgICogQGV4YW1wbGVcblx0ICAgICAqXG5cdCAgICAgKiAgICAgdmFyIGhhc2ggPSBDcnlwdG9KUy5NRDUoJ21lc3NhZ2UnKTtcblx0ICAgICAqICAgICB2YXIgaGFzaCA9IENyeXB0b0pTLk1ENSh3b3JkQXJyYXkpO1xuXHQgICAgICovXG5cdCAgICBDLk1ENSA9IEhhc2hlci5fY3JlYXRlSGVscGVyKE1ENSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIEhNQUMncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICpcblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBoYXNoLlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBrZXkgVGhlIHNlY3JldCBrZXkuXG5cdCAgICAgKlxuXHQgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgSE1BQy5cblx0ICAgICAqXG5cdCAgICAgKiBAc3RhdGljXG5cdCAgICAgKlxuXHQgICAgICogQGV4YW1wbGVcblx0ICAgICAqXG5cdCAgICAgKiAgICAgdmFyIGhtYWMgPSBDcnlwdG9KUy5IbWFjTUQ1KG1lc3NhZ2UsIGtleSk7XG5cdCAgICAgKi9cblx0ICAgIEMuSG1hY01ENSA9IEhhc2hlci5fY3JlYXRlSG1hY0hlbHBlcihNRDUpO1xuXHR9KE1hdGgpKTtcblxuXG5cdHJldHVybiBDcnlwdG9KUy5NRDU7XG5cbn0pKTsiLCIoZnVuY3Rpb24ocm9vdCxmYWN0b3J5KXtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LmV2ZW50TGlzdGVuZXIgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiB3cmFwKHN0YW5kYXJkLCBmYWxsYmFjaykge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoZWwsIGV2dE5hbWUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG5cdFx0XHRpZiAoZWxbc3RhbmRhcmRdKSB7XG5cdFx0XHRcdGVsW3N0YW5kYXJkXShldnROYW1lLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG5cdFx0XHR9IGVsc2UgaWYgKGVsW2ZhbGxiYWNrXSkge1xuXHRcdFx0XHRlbFtmYWxsYmFja10oJ29uJyArIGV2dE5hbWUsIGxpc3RlbmVyKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuICAgIHJldHVybiB7XG5cdFx0YWRkOiB3cmFwKCdhZGRFdmVudExpc3RlbmVyJywgJ2F0dGFjaEV2ZW50JyksXG5cdFx0cmVtb3ZlOiB3cmFwKCdyZW1vdmVFdmVudExpc3RlbmVyJywgJ2RldGFjaEV2ZW50Jylcblx0fTtcbn0pKTsiLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjEuM1xuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IGZhbHNlO1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKCFyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIpIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpIChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXcml0ZVxuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0dmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGV4cGlyZXMuc2V0TWlsbGlzZWNvbmRzKGV4cGlyZXMuZ2V0TWlsbGlzZWNvbmRzKCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGV4cGlyZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdFx0aWYgKCFjb252ZXJ0ZXIud3JpdGUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBbXG5cdFx0XHRcdFx0a2V5LCAnPScsIHZhbHVlLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA/ICc7IGV4cGlyZXM9JyArIGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJycsIC8vIHVzZSBleHBpcmVzIGF0dHJpYnV0ZSwgbWF4LWFnZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5wYXRoID8gJzsgcGF0aD0nICsgYXR0cmlidXRlcy5wYXRoIDogJycsXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5kb21haW4gPyAnOyBkb21haW49JyArIGF0dHJpYnV0ZXMuZG9tYWluIDogJycsXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5zZWN1cmUgPyAnOyBzZWN1cmUnIDogJydcblx0XHRcdFx0XS5qb2luKCcnKSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWRcblxuXHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0cmVzdWx0ID0ge307XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcblx0XHRcdC8vIGluIGNhc2UgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlblxuXHRcdFx0Ly8gY2FsbGluZyBcImdldCgpXCJcblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgcmRlY29kZSA9IC8oJVswLTlBLVpdezJ9KSsvZztcblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0Zm9yICg7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJz0nKTtcblxuXHRcdFx0XHRpZiAoY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZS5zbGljZSgxLCAtMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHZhciBuYW1lID0gcGFydHNbMF0ucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvbnZlcnRlci5yZWFkID9cblx0XHRcdFx0XHRcdGNvbnZlcnRlci5yZWFkKGNvb2tpZSwgbmFtZSkgOiBjb252ZXJ0ZXIoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0Y29va2llLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmpzb24pIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvb2tpZSA9IEpTT04ucGFyc2UoY29va2llKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gbmFtZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ID0gY29va2llO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IGNvb2tpZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0YXBpLnNldCA9IGFwaTtcblx0XHRhcGkuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGFwaS5jYWxsKGFwaSwga2V5KTtcblx0XHR9O1xuXHRcdGFwaS5nZXRKU09OID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGFwaS5hcHBseSh7XG5cdFx0XHRcdGpzb246IHRydWVcblx0XHRcdH0sIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cdFx0fTtcblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRhcGkoa2V5LCAnJywgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcblx0XHRcdFx0ZXhwaXJlczogLTFcblx0XHRcdH0pKTtcblx0XHR9O1xuXG5cdFx0YXBpLndpdGhDb252ZXJ0ZXIgPSBpbml0O1xuXG5cdFx0cmV0dXJuIGFwaTtcblx0fVxuXG5cdHJldHVybiBpbml0KGZ1bmN0aW9uICgpIHt9KTtcbn0pKTtcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTkFOID0gMCAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW0gPSAvXlxccyt8XFxzKyQvZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgbmF0aXZlTWluID0gTWF0aC5taW47XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGludm9jYXRpb24uXG4gKi9cbnZhciBub3cgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJvb3QuRGF0ZS5ub3coKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGRlbGF5cyBpbnZva2luZyBgZnVuY2AgdW50aWwgYWZ0ZXIgYHdhaXRgXG4gKiBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3YXNcbiAqIGludm9rZWQuIFRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgIG1ldGhvZCB0byBjYW5jZWxcbiAqIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLlxuICogUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlXG4gKiBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkXG4gKiB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50XG4gKiBjYWxscyB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYFxuICogaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIGRlYm91bmNlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy5kZWJvdW5jZWAgYW5kIGBfLnRocm90dGxlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdXG4gKiAgVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGludm9rZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eC5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gSW52b2tlIGBzZW5kTWFpbGAgd2hlbiBjbGlja2VkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHMuXG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gKiAgICdsZWFkaW5nJzogdHJ1ZSxcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqXG4gKiAvLyBFbnN1cmUgYGJhdGNoTG9nYCBpcyBpbnZva2VkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzLlxuICogdmFyIGRlYm91bmNlZCA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDI1MCwgeyAnbWF4V2FpdCc6IDEwMDAgfSk7XG4gKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gKiBqUXVlcnkoc291cmNlKS5vbignbWVzc2FnZScsIGRlYm91bmNlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyBkZWJvdW5jZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGRlYm91bmNlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsYXN0QXJncyxcbiAgICAgIGxhc3RUaGlzLFxuICAgICAgbWF4V2FpdCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHRpbWVySWQsXG4gICAgICBsYXN0Q2FsbFRpbWUsXG4gICAgICBsYXN0SW52b2tlVGltZSA9IDAsXG4gICAgICBsZWFkaW5nID0gZmFsc2UsXG4gICAgICBtYXhpbmcgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB3YWl0ID0gdG9OdW1iZXIod2FpdCkgfHwgMDtcbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICEhb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heGluZyA9ICdtYXhXYWl0JyBpbiBvcHRpb25zO1xuICAgIG1heFdhaXQgPSBtYXhpbmcgPyBuYXRpdmVNYXgodG9OdW1iZXIob3B0aW9ucy5tYXhXYWl0KSB8fCAwLCB3YWl0KSA6IG1heFdhaXQ7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZUZ1bmModGltZSkge1xuICAgIHZhciBhcmdzID0gbGFzdEFyZ3MsXG4gICAgICAgIHRoaXNBcmcgPSBsYXN0VGhpcztcblxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlYWRpbmdFZGdlKHRpbWUpIHtcbiAgICAvLyBSZXNldCBhbnkgYG1heFdhaXRgIHRpbWVyLlxuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICAvLyBTdGFydCB0aGUgdGltZXIgZm9yIHRoZSB0cmFpbGluZyBlZGdlLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgLy8gSW52b2tlIHRoZSBsZWFkaW5nIGVkZ2UuXG4gICAgcmV0dXJuIGxlYWRpbmcgPyBpbnZva2VGdW5jKHRpbWUpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtYWluaW5nV2FpdCh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZSxcbiAgICAgICAgcmVzdWx0ID0gd2FpdCAtIHRpbWVTaW5jZUxhc3RDYWxsO1xuXG4gICAgcmV0dXJuIG1heGluZyA/IG5hdGl2ZU1pbihyZXN1bHQsIG1heFdhaXQgLSB0aW1lU2luY2VMYXN0SW52b2tlKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZEludm9rZSh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZTtcblxuICAgIC8vIEVpdGhlciB0aGlzIGlzIHRoZSBmaXJzdCBjYWxsLCBhY3Rpdml0eSBoYXMgc3RvcHBlZCBhbmQgd2UncmUgYXQgdGhlXG4gICAgLy8gdHJhaWxpbmcgZWRnZSwgdGhlIHN5c3RlbSB0aW1lIGhhcyBnb25lIGJhY2t3YXJkcyBhbmQgd2UncmUgdHJlYXRpbmdcbiAgICAvLyBpdCBhcyB0aGUgdHJhaWxpbmcgZWRnZSwgb3Igd2UndmUgaGl0IHRoZSBgbWF4V2FpdGAgbGltaXQuXG4gICAgcmV0dXJuIChsYXN0Q2FsbFRpbWUgPT09IHVuZGVmaW5lZCB8fCAodGltZVNpbmNlTGFzdENhbGwgPj0gd2FpdCkgfHxcbiAgICAgICh0aW1lU2luY2VMYXN0Q2FsbCA8IDApIHx8IChtYXhpbmcgJiYgdGltZVNpbmNlTGFzdEludm9rZSA+PSBtYXhXYWl0KSk7XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lckV4cGlyZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICBpZiAoc2hvdWxkSW52b2tlKHRpbWUpKSB7XG4gICAgICByZXR1cm4gdHJhaWxpbmdFZGdlKHRpbWUpO1xuICAgIH1cbiAgICAvLyBSZXN0YXJ0IHRoZSB0aW1lci5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhaWxpbmdFZGdlKHRpbWUpIHtcbiAgICB0aW1lcklkID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gT25seSBpbnZva2UgaWYgd2UgaGF2ZSBgbGFzdEFyZ3NgIHdoaWNoIG1lYW5zIGBmdW5jYCBoYXMgYmVlblxuICAgIC8vIGRlYm91bmNlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGlmICh0cmFpbGluZyAmJiBsYXN0QXJncykge1xuICAgICAgcmV0dXJuIGludm9rZUZ1bmModGltZSk7XG4gICAgfVxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBpZiAodGltZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgfVxuICAgIGxhc3RJbnZva2VUaW1lID0gMDtcbiAgICBsYXN0QXJncyA9IGxhc3RDYWxsVGltZSA9IGxhc3RUaGlzID0gdGltZXJJZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHJldHVybiB0aW1lcklkID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiB0cmFpbGluZ0VkZ2Uobm93KCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2VkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCksXG4gICAgICAgIGlzSW52b2tpbmcgPSBzaG91bGRJbnZva2UodGltZSk7XG5cbiAgICBsYXN0QXJncyA9IGFyZ3VtZW50cztcbiAgICBsYXN0VGhpcyA9IHRoaXM7XG4gICAgbGFzdENhbGxUaW1lID0gdGltZTtcblxuICAgIGlmIChpc0ludm9raW5nKSB7XG4gICAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nRWRnZShsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG1heGluZykge1xuICAgICAgICAvLyBIYW5kbGUgaW52b2NhdGlvbnMgaW4gYSB0aWdodCBsb29wLlxuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGRlYm91bmNlZC5jYW5jZWwgPSBjYW5jZWw7XG4gIGRlYm91bmNlZC5mbHVzaCA9IGZsdXNoO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PSAnZnVuY3Rpb24nID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlVHJpbSwgJycpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJvdW5jZTtcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTkFOID0gMCAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW0gPSAvXlxccyt8XFxzKyQvZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgbmF0aXZlTWluID0gTWF0aC5taW47XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGludm9jYXRpb24uXG4gKi9cbnZhciBub3cgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJvb3QuRGF0ZS5ub3coKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGRlbGF5cyBpbnZva2luZyBgZnVuY2AgdW50aWwgYWZ0ZXIgYHdhaXRgXG4gKiBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3YXNcbiAqIGludm9rZWQuIFRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgIG1ldGhvZCB0byBjYW5jZWxcbiAqIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLlxuICogUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlXG4gKiBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkXG4gKiB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50XG4gKiBjYWxscyB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYFxuICogaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIGRlYm91bmNlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy5kZWJvdW5jZWAgYW5kIGBfLnRocm90dGxlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdXG4gKiAgVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGludm9rZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eC5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gSW52b2tlIGBzZW5kTWFpbGAgd2hlbiBjbGlja2VkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHMuXG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gKiAgICdsZWFkaW5nJzogdHJ1ZSxcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqXG4gKiAvLyBFbnN1cmUgYGJhdGNoTG9nYCBpcyBpbnZva2VkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzLlxuICogdmFyIGRlYm91bmNlZCA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDI1MCwgeyAnbWF4V2FpdCc6IDEwMDAgfSk7XG4gKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gKiBqUXVlcnkoc291cmNlKS5vbignbWVzc2FnZScsIGRlYm91bmNlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyBkZWJvdW5jZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGRlYm91bmNlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsYXN0QXJncyxcbiAgICAgIGxhc3RUaGlzLFxuICAgICAgbWF4V2FpdCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHRpbWVySWQsXG4gICAgICBsYXN0Q2FsbFRpbWUsXG4gICAgICBsYXN0SW52b2tlVGltZSA9IDAsXG4gICAgICBsZWFkaW5nID0gZmFsc2UsXG4gICAgICBtYXhpbmcgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB3YWl0ID0gdG9OdW1iZXIod2FpdCkgfHwgMDtcbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICEhb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heGluZyA9ICdtYXhXYWl0JyBpbiBvcHRpb25zO1xuICAgIG1heFdhaXQgPSBtYXhpbmcgPyBuYXRpdmVNYXgodG9OdW1iZXIob3B0aW9ucy5tYXhXYWl0KSB8fCAwLCB3YWl0KSA6IG1heFdhaXQ7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZUZ1bmModGltZSkge1xuICAgIHZhciBhcmdzID0gbGFzdEFyZ3MsXG4gICAgICAgIHRoaXNBcmcgPSBsYXN0VGhpcztcblxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlYWRpbmdFZGdlKHRpbWUpIHtcbiAgICAvLyBSZXNldCBhbnkgYG1heFdhaXRgIHRpbWVyLlxuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICAvLyBTdGFydCB0aGUgdGltZXIgZm9yIHRoZSB0cmFpbGluZyBlZGdlLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgLy8gSW52b2tlIHRoZSBsZWFkaW5nIGVkZ2UuXG4gICAgcmV0dXJuIGxlYWRpbmcgPyBpbnZva2VGdW5jKHRpbWUpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtYWluaW5nV2FpdCh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZSxcbiAgICAgICAgcmVzdWx0ID0gd2FpdCAtIHRpbWVTaW5jZUxhc3RDYWxsO1xuXG4gICAgcmV0dXJuIG1heGluZyA/IG5hdGl2ZU1pbihyZXN1bHQsIG1heFdhaXQgLSB0aW1lU2luY2VMYXN0SW52b2tlKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZEludm9rZSh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZTtcblxuICAgIC8vIEVpdGhlciB0aGlzIGlzIHRoZSBmaXJzdCBjYWxsLCBhY3Rpdml0eSBoYXMgc3RvcHBlZCBhbmQgd2UncmUgYXQgdGhlXG4gICAgLy8gdHJhaWxpbmcgZWRnZSwgdGhlIHN5c3RlbSB0aW1lIGhhcyBnb25lIGJhY2t3YXJkcyBhbmQgd2UncmUgdHJlYXRpbmdcbiAgICAvLyBpdCBhcyB0aGUgdHJhaWxpbmcgZWRnZSwgb3Igd2UndmUgaGl0IHRoZSBgbWF4V2FpdGAgbGltaXQuXG4gICAgcmV0dXJuIChsYXN0Q2FsbFRpbWUgPT09IHVuZGVmaW5lZCB8fCAodGltZVNpbmNlTGFzdENhbGwgPj0gd2FpdCkgfHxcbiAgICAgICh0aW1lU2luY2VMYXN0Q2FsbCA8IDApIHx8IChtYXhpbmcgJiYgdGltZVNpbmNlTGFzdEludm9rZSA+PSBtYXhXYWl0KSk7XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lckV4cGlyZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICBpZiAoc2hvdWxkSW52b2tlKHRpbWUpKSB7XG4gICAgICByZXR1cm4gdHJhaWxpbmdFZGdlKHRpbWUpO1xuICAgIH1cbiAgICAvLyBSZXN0YXJ0IHRoZSB0aW1lci5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhaWxpbmdFZGdlKHRpbWUpIHtcbiAgICB0aW1lcklkID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gT25seSBpbnZva2UgaWYgd2UgaGF2ZSBgbGFzdEFyZ3NgIHdoaWNoIG1lYW5zIGBmdW5jYCBoYXMgYmVlblxuICAgIC8vIGRlYm91bmNlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGlmICh0cmFpbGluZyAmJiBsYXN0QXJncykge1xuICAgICAgcmV0dXJuIGludm9rZUZ1bmModGltZSk7XG4gICAgfVxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBpZiAodGltZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgfVxuICAgIGxhc3RJbnZva2VUaW1lID0gMDtcbiAgICBsYXN0QXJncyA9IGxhc3RDYWxsVGltZSA9IGxhc3RUaGlzID0gdGltZXJJZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHJldHVybiB0aW1lcklkID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiB0cmFpbGluZ0VkZ2Uobm93KCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2VkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCksXG4gICAgICAgIGlzSW52b2tpbmcgPSBzaG91bGRJbnZva2UodGltZSk7XG5cbiAgICBsYXN0QXJncyA9IGFyZ3VtZW50cztcbiAgICBsYXN0VGhpcyA9IHRoaXM7XG4gICAgbGFzdENhbGxUaW1lID0gdGltZTtcblxuICAgIGlmIChpc0ludm9raW5nKSB7XG4gICAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nRWRnZShsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG1heGluZykge1xuICAgICAgICAvLyBIYW5kbGUgaW52b2NhdGlvbnMgaW4gYSB0aWdodCBsb29wLlxuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGRlYm91bmNlZC5jYW5jZWwgPSBjYW5jZWw7XG4gIGRlYm91bmNlZC5mbHVzaCA9IGZsdXNoO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25jZSBwZXJcbiAqIGV2ZXJ5IGB3YWl0YCBtaWxsaXNlY29uZHMuIFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgXG4gKiBtZXRob2QgdG8gY2FuY2VsIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvXG4gKiBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS4gUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2BcbiAqIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGBcbiAqIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZCB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGVcbiAqIHRocm90dGxlZCBmdW5jdGlvbi4gU3Vic2VxdWVudCBjYWxscyB0byB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHJldHVybiB0aGVcbiAqIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRocm90dGxlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy50aHJvdHRsZWAgYW5kIGBfLmRlYm91bmNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGludm9jYXRpb25zIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZy5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlcy5cbiAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwgeyAndHJhaWxpbmcnOiBmYWxzZSB9KTtcbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCB0aHJvdHRsZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgdGhyb3R0bGVkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCB0aHJvdHRsZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGVhZGluZyA9IHRydWUsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIHtcbiAgICAnbGVhZGluZyc6IGxlYWRpbmcsXG4gICAgJ21heFdhaXQnOiB3YWl0LFxuICAgICd0cmFpbGluZyc6IHRyYWlsaW5nXG4gIH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PSAnZnVuY3Rpb24nID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlVHJpbSwgJycpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcbiIsIi8qXG5vYmplY3QtYXNzaWduXG4oYykgU2luZHJlIFNvcmh1c1xuQGxpY2Vuc2UgTUlUXG4qL1xuXG4ndXNlIHN0cmljdCc7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xudmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZFVzZU5hdGl2ZSgpIHtcblx0dHJ5IHtcblx0XHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBEZXRlY3QgYnVnZ3kgcHJvcGVydHkgZW51bWVyYXRpb24gb3JkZXIgaW4gb2xkZXIgVjggdmVyc2lvbnMuXG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTE4XG5cdFx0dmFyIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy13cmFwcGVyc1xuXHRcdHRlc3QxWzVdID0gJ2RlJztcblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09PSAnNScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QyID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0XHR0ZXN0MlsnXycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGk7XG5cdFx0fVxuXHRcdHZhciBvcmRlcjIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MikubWFwKGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRyZXR1cm4gdGVzdDJbbl07XG5cdFx0fSk7XG5cdFx0aWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MyA9IHt9O1xuXHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuXHRcdFx0dGVzdDNbbGV0dGVyXSA9IGxldHRlcjtcblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT1cblx0XHRcdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3VsZFVzZU5hdGl2ZSgpID8gT2JqZWN0LmFzc2lnbiA6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIHRvID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHN5bWJvbHM7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gT2JqZWN0KGFyZ3VtZW50c1tzXSk7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHR0b1trZXldID0gZnJvbVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcblx0XHRcdHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuMTIuMlxuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0TmFub1NlY29uZHMsIGhydGltZSwgbG9hZFRpbWUsIG1vZHVsZUxvYWRUaW1lLCBub2RlTG9hZFRpbWUsIHVwVGltZTtcblxuICBpZiAoKHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwZXJmb3JtYW5jZSAhPT0gbnVsbCkgJiYgcGVyZm9ybWFuY2Uubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9O1xuICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsKSAmJiBwcm9jZXNzLmhydGltZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGdldE5hbm9TZWNvbmRzKCkgLSBub2RlTG9hZFRpbWUpIC8gMWU2O1xuICAgIH07XG4gICAgaHJ0aW1lID0gcHJvY2Vzcy5ocnRpbWU7XG4gICAgZ2V0TmFub1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBocjtcbiAgICAgIGhyID0gaHJ0aW1lKCk7XG4gICAgICByZXR1cm4gaHJbMF0gKiAxZTkgKyBoclsxXTtcbiAgICB9O1xuICAgIG1vZHVsZUxvYWRUaW1lID0gZ2V0TmFub1NlY29uZHMoKTtcbiAgICB1cFRpbWUgPSBwcm9jZXNzLnVwdGltZSgpICogMWU5O1xuICAgIG5vZGVMb2FkVGltZSA9IG1vZHVsZUxvYWRUaW1lIC0gdXBUaW1lO1xuICB9IGVsc2UgaWYgKERhdGUubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbG9hZFRpbWU7XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IERhdGUubm93KCk7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wZXJmb3JtYW5jZS1ub3cuanMubWFwXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwcmludFdhcm5pbmcgPSBmdW5jdGlvbigpIHt9O1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICB2YXIgUmVhY3RQcm9wVHlwZXNTZWNyZXQgPSByZXF1aXJlKCcuL2xpYi9SZWFjdFByb3BUeXBlc1NlY3JldCcpO1xuICB2YXIgbG9nZ2VkVHlwZUZhaWx1cmVzID0ge307XG5cbiAgcHJpbnRXYXJuaW5nID0gZnVuY3Rpb24odGV4dCkge1xuICAgIHZhciBtZXNzYWdlID0gJ1dhcm5pbmc6ICcgKyB0ZXh0O1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAvLyAtLS0gV2VsY29tZSB0byBkZWJ1Z2dpbmcgUmVhY3QgLS0tXG4gICAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IHlvdSBjYW4gdXNlIHRoaXMgc3RhY2tcbiAgICAgIC8vIHRvIGZpbmQgdGhlIGNhbGxzaXRlIHRoYXQgY2F1c2VkIHRoaXMgd2FybmluZyB0byBmaXJlLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH0gY2F0Y2ggKHgpIHt9XG4gIH07XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoYXQgdGhlIHZhbHVlcyBtYXRjaCB3aXRoIHRoZSB0eXBlIHNwZWNzLlxuICogRXJyb3IgbWVzc2FnZXMgYXJlIG1lbW9yaXplZCBhbmQgd2lsbCBvbmx5IGJlIHNob3duIG9uY2UuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHR5cGVTcGVjcyBNYXAgb2YgbmFtZSB0byBhIFJlYWN0UHJvcFR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSB2YWx1ZXMgUnVudGltZSB2YWx1ZXMgdGhhdCBuZWVkIHRvIGJlIHR5cGUtY2hlY2tlZFxuICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uIGUuZy4gXCJwcm9wXCIsIFwiY29udGV4dFwiLCBcImNoaWxkIGNvbnRleHRcIlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbXBvbmVudE5hbWUgTmFtZSBvZiB0aGUgY29tcG9uZW50IGZvciBlcnJvciBtZXNzYWdlcy5cbiAqIEBwYXJhbSB7P0Z1bmN0aW9ufSBnZXRTdGFjayBSZXR1cm5zIHRoZSBjb21wb25lbnQgc3RhY2suXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjaGVja1Byb3BUeXBlcyh0eXBlU3BlY3MsIHZhbHVlcywgbG9jYXRpb24sIGNvbXBvbmVudE5hbWUsIGdldFN0YWNrKSB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgZm9yICh2YXIgdHlwZVNwZWNOYW1lIGluIHR5cGVTcGVjcykge1xuICAgICAgaWYgKHR5cGVTcGVjcy5oYXNPd25Qcm9wZXJ0eSh0eXBlU3BlY05hbWUpKSB7XG4gICAgICAgIHZhciBlcnJvcjtcbiAgICAgICAgLy8gUHJvcCB0eXBlIHZhbGlkYXRpb24gbWF5IHRocm93LiBJbiBjYXNlIHRoZXkgZG8sIHdlIGRvbid0IHdhbnQgdG9cbiAgICAgICAgLy8gZmFpbCB0aGUgcmVuZGVyIHBoYXNlIHdoZXJlIGl0IGRpZG4ndCBmYWlsIGJlZm9yZS4gU28gd2UgbG9nIGl0LlxuICAgICAgICAvLyBBZnRlciB0aGVzZSBoYXZlIGJlZW4gY2xlYW5lZCB1cCwgd2UnbGwgbGV0IHRoZW0gdGhyb3cuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyBpbnRlbnRpb25hbGx5IGFuIGludmFyaWFudCB0aGF0IGdldHMgY2F1Z2h0LiBJdCdzIHRoZSBzYW1lXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYXMgd2l0aG91dCB0aGlzIHN0YXRlbWVudCBleGNlcHQgd2l0aCBhIGJldHRlciBtZXNzYWdlLlxuICAgICAgICAgIGlmICh0eXBlb2YgdHlwZVNwZWNzW3R5cGVTcGVjTmFtZV0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSBFcnJvcihcbiAgICAgICAgICAgICAgKGNvbXBvbmVudE5hbWUgfHwgJ1JlYWN0IGNsYXNzJykgKyAnOiAnICsgbG9jYXRpb24gKyAnIHR5cGUgYCcgKyB0eXBlU3BlY05hbWUgKyAnYCBpcyBpbnZhbGlkOyAnICtcbiAgICAgICAgICAgICAgJ2l0IG11c3QgYmUgYSBmdW5jdGlvbiwgdXN1YWxseSBmcm9tIHRoZSBgcHJvcC10eXBlc2AgcGFja2FnZSwgYnV0IHJlY2VpdmVkIGAnICsgdHlwZW9mIHR5cGVTcGVjc1t0eXBlU3BlY05hbWVdICsgJ2AuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGVyci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlcnJvciA9IHR5cGVTcGVjc1t0eXBlU3BlY05hbWVdKHZhbHVlcywgdHlwZVNwZWNOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgbnVsbCwgUmVhY3RQcm9wVHlwZXNTZWNyZXQpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIGVycm9yID0gZXg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycm9yICYmICEoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikpIHtcbiAgICAgICAgICBwcmludFdhcm5pbmcoXG4gICAgICAgICAgICAoY29tcG9uZW50TmFtZSB8fCAnUmVhY3QgY2xhc3MnKSArICc6IHR5cGUgc3BlY2lmaWNhdGlvbiBvZiAnICtcbiAgICAgICAgICAgIGxvY2F0aW9uICsgJyBgJyArIHR5cGVTcGVjTmFtZSArICdgIGlzIGludmFsaWQ7IHRoZSB0eXBlIGNoZWNrZXIgJyArXG4gICAgICAgICAgICAnZnVuY3Rpb24gbXVzdCByZXR1cm4gYG51bGxgIG9yIGFuIGBFcnJvcmAgYnV0IHJldHVybmVkIGEgJyArIHR5cGVvZiBlcnJvciArICcuICcgK1xuICAgICAgICAgICAgJ1lvdSBtYXkgaGF2ZSBmb3Jnb3R0ZW4gdG8gcGFzcyBhbiBhcmd1bWVudCB0byB0aGUgdHlwZSBjaGVja2VyICcgK1xuICAgICAgICAgICAgJ2NyZWF0b3IgKGFycmF5T2YsIGluc3RhbmNlT2YsIG9iamVjdE9mLCBvbmVPZiwgb25lT2ZUeXBlLCBhbmQgJyArXG4gICAgICAgICAgICAnc2hhcGUgYWxsIHJlcXVpcmUgYW4gYXJndW1lbnQpLidcbiAgICAgICAgICApXG5cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiAhKGVycm9yLm1lc3NhZ2UgaW4gbG9nZ2VkVHlwZUZhaWx1cmVzKSkge1xuICAgICAgICAgIC8vIE9ubHkgbW9uaXRvciB0aGlzIGZhaWx1cmUgb25jZSBiZWNhdXNlIHRoZXJlIHRlbmRzIHRvIGJlIGEgbG90IG9mIHRoZVxuICAgICAgICAgIC8vIHNhbWUgZXJyb3IuXG4gICAgICAgICAgbG9nZ2VkVHlwZUZhaWx1cmVzW2Vycm9yLm1lc3NhZ2VdID0gdHJ1ZTtcblxuICAgICAgICAgIHZhciBzdGFjayA9IGdldFN0YWNrID8gZ2V0U3RhY2soKSA6ICcnO1xuXG4gICAgICAgICAgcHJpbnRXYXJuaW5nKFxuICAgICAgICAgICAgJ0ZhaWxlZCAnICsgbG9jYXRpb24gKyAnIHR5cGU6ICcgKyBlcnJvci5tZXNzYWdlICsgKHN0YWNrICE9IG51bGwgPyBzdGFjayA6ICcnKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjaGVja1Byb3BUeXBlcztcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xuXG52YXIgUmVhY3RQcm9wVHlwZXNTZWNyZXQgPSByZXF1aXJlKCcuL2xpYi9SZWFjdFByb3BUeXBlc1NlY3JldCcpO1xudmFyIGNoZWNrUHJvcFR5cGVzID0gcmVxdWlyZSgnLi9jaGVja1Byb3BUeXBlcycpO1xuXG52YXIgcHJpbnRXYXJuaW5nID0gZnVuY3Rpb24oKSB7fTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgcHJpbnRXYXJuaW5nID0gZnVuY3Rpb24odGV4dCkge1xuICAgIHZhciBtZXNzYWdlID0gJ1dhcm5pbmc6ICcgKyB0ZXh0O1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAvLyAtLS0gV2VsY29tZSB0byBkZWJ1Z2dpbmcgUmVhY3QgLS0tXG4gICAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IHlvdSBjYW4gdXNlIHRoaXMgc3RhY2tcbiAgICAgIC8vIHRvIGZpbmQgdGhlIGNhbGxzaXRlIHRoYXQgY2F1c2VkIHRoaXMgd2FybmluZyB0byBmaXJlLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH0gY2F0Y2ggKHgpIHt9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGVtcHR5RnVuY3Rpb25UaGF0UmV0dXJuc051bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGlzVmFsaWRFbGVtZW50LCB0aHJvd09uRGlyZWN0QWNjZXNzKSB7XG4gIC8qIGdsb2JhbCBTeW1ib2wgKi9cbiAgdmFyIElURVJBVE9SX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgU3ltYm9sLml0ZXJhdG9yO1xuICB2YXIgRkFVWF9JVEVSQVRPUl9TWU1CT0wgPSAnQEBpdGVyYXRvcic7IC8vIEJlZm9yZSBTeW1ib2wgc3BlYy5cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaXRlcmF0b3IgbWV0aG9kIGZ1bmN0aW9uIGNvbnRhaW5lZCBvbiB0aGUgaXRlcmFibGUgb2JqZWN0LlxuICAgKlxuICAgKiBCZSBzdXJlIHRvIGludm9rZSB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgaXRlcmFibGUgYXMgY29udGV4dDpcbiAgICpcbiAgICogICAgIHZhciBpdGVyYXRvckZuID0gZ2V0SXRlcmF0b3JGbihteUl0ZXJhYmxlKTtcbiAgICogICAgIGlmIChpdGVyYXRvckZuKSB7XG4gICAqICAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhdG9yRm4uY2FsbChteUl0ZXJhYmxlKTtcbiAgICogICAgICAgLi4uXG4gICAqICAgICB9XG4gICAqXG4gICAqIEBwYXJhbSB7P29iamVjdH0gbWF5YmVJdGVyYWJsZVxuICAgKiBAcmV0dXJuIHs/ZnVuY3Rpb259XG4gICAqL1xuICBmdW5jdGlvbiBnZXRJdGVyYXRvckZuKG1heWJlSXRlcmFibGUpIHtcbiAgICB2YXIgaXRlcmF0b3JGbiA9IG1heWJlSXRlcmFibGUgJiYgKElURVJBVE9SX1NZTUJPTCAmJiBtYXliZUl0ZXJhYmxlW0lURVJBVE9SX1NZTUJPTF0gfHwgbWF5YmVJdGVyYWJsZVtGQVVYX0lURVJBVE9SX1NZTUJPTF0pO1xuICAgIGlmICh0eXBlb2YgaXRlcmF0b3JGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGl0ZXJhdG9yRm47XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbGxlY3Rpb24gb2YgbWV0aG9kcyB0aGF0IGFsbG93IGRlY2xhcmF0aW9uIGFuZCB2YWxpZGF0aW9uIG9mIHByb3BzIHRoYXQgYXJlXG4gICAqIHN1cHBsaWVkIHRvIFJlYWN0IGNvbXBvbmVudHMuIEV4YW1wbGUgdXNhZ2U6XG4gICAqXG4gICAqICAgdmFyIFByb3BzID0gcmVxdWlyZSgnUmVhY3RQcm9wVHlwZXMnKTtcbiAgICogICB2YXIgTXlBcnRpY2xlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgKiAgICAgcHJvcFR5cGVzOiB7XG4gICAqICAgICAgIC8vIEFuIG9wdGlvbmFsIHN0cmluZyBwcm9wIG5hbWVkIFwiZGVzY3JpcHRpb25cIi5cbiAgICogICAgICAgZGVzY3JpcHRpb246IFByb3BzLnN0cmluZyxcbiAgICpcbiAgICogICAgICAgLy8gQSByZXF1aXJlZCBlbnVtIHByb3AgbmFtZWQgXCJjYXRlZ29yeVwiLlxuICAgKiAgICAgICBjYXRlZ29yeTogUHJvcHMub25lT2YoWydOZXdzJywnUGhvdG9zJ10pLmlzUmVxdWlyZWQsXG4gICAqXG4gICAqICAgICAgIC8vIEEgcHJvcCBuYW1lZCBcImRpYWxvZ1wiIHRoYXQgcmVxdWlyZXMgYW4gaW5zdGFuY2Ugb2YgRGlhbG9nLlxuICAgKiAgICAgICBkaWFsb2c6IFByb3BzLmluc3RhbmNlT2YoRGlhbG9nKS5pc1JlcXVpcmVkXG4gICAqICAgICB9LFxuICAgKiAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHsgLi4uIH1cbiAgICogICB9KTtcbiAgICpcbiAgICogQSBtb3JlIGZvcm1hbCBzcGVjaWZpY2F0aW9uIG9mIGhvdyB0aGVzZSBtZXRob2RzIGFyZSB1c2VkOlxuICAgKlxuICAgKiAgIHR5cGUgOj0gYXJyYXl8Ym9vbHxmdW5jfG9iamVjdHxudW1iZXJ8c3RyaW5nfG9uZU9mKFsuLi5dKXxpbnN0YW5jZU9mKC4uLilcbiAgICogICBkZWNsIDo9IFJlYWN0UHJvcFR5cGVzLnt0eXBlfSguaXNSZXF1aXJlZCk/XG4gICAqXG4gICAqIEVhY2ggYW5kIGV2ZXJ5IGRlY2xhcmF0aW9uIHByb2R1Y2VzIGEgZnVuY3Rpb24gd2l0aCB0aGUgc2FtZSBzaWduYXR1cmUuIFRoaXNcbiAgICogYWxsb3dzIHRoZSBjcmVhdGlvbiBvZiBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvbnMuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiAgdmFyIE15TGluayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICogICAgcHJvcFR5cGVzOiB7XG4gICAqICAgICAgLy8gQW4gb3B0aW9uYWwgc3RyaW5nIG9yIFVSSSBwcm9wIG5hbWVkIFwiaHJlZlwiLlxuICAgKiAgICAgIGhyZWY6IGZ1bmN0aW9uKHByb3BzLCBwcm9wTmFtZSwgY29tcG9uZW50TmFtZSkge1xuICAgKiAgICAgICAgdmFyIHByb3BWYWx1ZSA9IHByb3BzW3Byb3BOYW1lXTtcbiAgICogICAgICAgIGlmIChwcm9wVmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgcHJvcFZhbHVlICE9PSAnc3RyaW5nJyAmJlxuICAgKiAgICAgICAgICAgICEocHJvcFZhbHVlIGluc3RhbmNlb2YgVVJJKSkge1xuICAgKiAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKFxuICAgKiAgICAgICAgICAgICdFeHBlY3RlZCBhIHN0cmluZyBvciBhbiBVUkkgZm9yICcgKyBwcm9wTmFtZSArICcgaW4gJyArXG4gICAqICAgICAgICAgICAgY29tcG9uZW50TmFtZVxuICAgKiAgICAgICAgICApO1xuICAgKiAgICAgICAgfVxuICAgKiAgICAgIH1cbiAgICogICAgfSxcbiAgICogICAgcmVuZGVyOiBmdW5jdGlvbigpIHsuLi59XG4gICAqICB9KTtcbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuXG4gIHZhciBBTk9OWU1PVVMgPSAnPDxhbm9ueW1vdXM+Pic7XG5cbiAgLy8gSW1wb3J0YW50IVxuICAvLyBLZWVwIHRoaXMgbGlzdCBpbiBzeW5jIHdpdGggcHJvZHVjdGlvbiB2ZXJzaW9uIGluIGAuL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qc2AuXG4gIHZhciBSZWFjdFByb3BUeXBlcyA9IHtcbiAgICBhcnJheTogY3JlYXRlUHJpbWl0aXZlVHlwZUNoZWNrZXIoJ2FycmF5JyksXG4gICAgYm9vbDogY3JlYXRlUHJpbWl0aXZlVHlwZUNoZWNrZXIoJ2Jvb2xlYW4nKSxcbiAgICBmdW5jOiBjcmVhdGVQcmltaXRpdmVUeXBlQ2hlY2tlcignZnVuY3Rpb24nKSxcbiAgICBudW1iZXI6IGNyZWF0ZVByaW1pdGl2ZVR5cGVDaGVja2VyKCdudW1iZXInKSxcbiAgICBvYmplY3Q6IGNyZWF0ZVByaW1pdGl2ZVR5cGVDaGVja2VyKCdvYmplY3QnKSxcbiAgICBzdHJpbmc6IGNyZWF0ZVByaW1pdGl2ZVR5cGVDaGVja2VyKCdzdHJpbmcnKSxcbiAgICBzeW1ib2w6IGNyZWF0ZVByaW1pdGl2ZVR5cGVDaGVja2VyKCdzeW1ib2wnKSxcblxuICAgIGFueTogY3JlYXRlQW55VHlwZUNoZWNrZXIoKSxcbiAgICBhcnJheU9mOiBjcmVhdGVBcnJheU9mVHlwZUNoZWNrZXIsXG4gICAgZWxlbWVudDogY3JlYXRlRWxlbWVudFR5cGVDaGVja2VyKCksXG4gICAgaW5zdGFuY2VPZjogY3JlYXRlSW5zdGFuY2VUeXBlQ2hlY2tlcixcbiAgICBub2RlOiBjcmVhdGVOb2RlQ2hlY2tlcigpLFxuICAgIG9iamVjdE9mOiBjcmVhdGVPYmplY3RPZlR5cGVDaGVja2VyLFxuICAgIG9uZU9mOiBjcmVhdGVFbnVtVHlwZUNoZWNrZXIsXG4gICAgb25lT2ZUeXBlOiBjcmVhdGVVbmlvblR5cGVDaGVja2VyLFxuICAgIHNoYXBlOiBjcmVhdGVTaGFwZVR5cGVDaGVja2VyLFxuICAgIGV4YWN0OiBjcmVhdGVTdHJpY3RTaGFwZVR5cGVDaGVja2VyLFxuICB9O1xuXG4gIC8qKlxuICAgKiBpbmxpbmVkIE9iamVjdC5pcyBwb2x5ZmlsbCB0byBhdm9pZCByZXF1aXJpbmcgY29uc3VtZXJzIHNoaXAgdGhlaXIgb3duXG4gICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9pc1xuICAgKi9cbiAgLyplc2xpbnQtZGlzYWJsZSBuby1zZWxmLWNvbXBhcmUqL1xuICBmdW5jdGlvbiBpcyh4LCB5KSB7XG4gICAgLy8gU2FtZVZhbHVlIGFsZ29yaXRobVxuICAgIGlmICh4ID09PSB5KSB7XG4gICAgICAvLyBTdGVwcyAxLTUsIDctMTBcbiAgICAgIC8vIFN0ZXBzIDYuYi02LmU6ICswICE9IC0wXG4gICAgICByZXR1cm4geCAhPT0gMCB8fCAxIC8geCA9PT0gMSAvIHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN0ZXAgNi5hOiBOYU4gPT0gTmFOXG4gICAgICByZXR1cm4geCAhPT0geCAmJiB5ICE9PSB5O1xuICAgIH1cbiAgfVxuICAvKmVzbGludC1lbmFibGUgbm8tc2VsZi1jb21wYXJlKi9cblxuICAvKipcbiAgICogV2UgdXNlIGFuIEVycm9yLWxpa2Ugb2JqZWN0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IGFzIHBlb3BsZSBtYXkgY2FsbFxuICAgKiBQcm9wVHlwZXMgZGlyZWN0bHkgYW5kIGluc3BlY3QgdGhlaXIgb3V0cHV0LiBIb3dldmVyLCB3ZSBkb24ndCB1c2UgcmVhbFxuICAgKiBFcnJvcnMgYW55bW9yZS4gV2UgZG9uJ3QgaW5zcGVjdCB0aGVpciBzdGFjayBhbnl3YXksIGFuZCBjcmVhdGluZyB0aGVtXG4gICAqIGlzIHByb2hpYml0aXZlbHkgZXhwZW5zaXZlIGlmIHRoZXkgYXJlIGNyZWF0ZWQgdG9vIG9mdGVuLCBzdWNoIGFzIHdoYXRcbiAgICogaGFwcGVucyBpbiBvbmVPZlR5cGUoKSBmb3IgYW55IHR5cGUgYmVmb3JlIHRoZSBvbmUgdGhhdCBtYXRjaGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gUHJvcFR5cGVFcnJvcihtZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB0aGlzLnN0YWNrID0gJyc7XG4gIH1cbiAgLy8gTWFrZSBgaW5zdGFuY2VvZiBFcnJvcmAgc3RpbGwgd29yayBmb3IgcmV0dXJuZWQgZXJyb3JzLlxuICBQcm9wVHlwZUVycm9yLnByb3RvdHlwZSA9IEVycm9yLnByb3RvdHlwZTtcblxuICBmdW5jdGlvbiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSkge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgbWFudWFsUHJvcFR5cGVDYWxsQ2FjaGUgPSB7fTtcbiAgICAgIHZhciBtYW51YWxQcm9wVHlwZVdhcm5pbmdDb3VudCA9IDA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNoZWNrVHlwZShpc1JlcXVpcmVkLCBwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUsIHNlY3JldCkge1xuICAgICAgY29tcG9uZW50TmFtZSA9IGNvbXBvbmVudE5hbWUgfHwgQU5PTllNT1VTO1xuICAgICAgcHJvcEZ1bGxOYW1lID0gcHJvcEZ1bGxOYW1lIHx8IHByb3BOYW1lO1xuXG4gICAgICBpZiAoc2VjcmV0ICE9PSBSZWFjdFByb3BUeXBlc1NlY3JldCkge1xuICAgICAgICBpZiAodGhyb3dPbkRpcmVjdEFjY2Vzcykge1xuICAgICAgICAgIC8vIE5ldyBiZWhhdmlvciBvbmx5IGZvciB1c2VycyBvZiBgcHJvcC10eXBlc2AgcGFja2FnZVxuICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnQ2FsbGluZyBQcm9wVHlwZXMgdmFsaWRhdG9ycyBkaXJlY3RseSBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBgcHJvcC10eXBlc2AgcGFja2FnZS4gJyArXG4gICAgICAgICAgICAnVXNlIGBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMoKWAgdG8gY2FsbCB0aGVtLiAnICtcbiAgICAgICAgICAgICdSZWFkIG1vcmUgYXQgaHR0cDovL2ZiLm1lL3VzZS1jaGVjay1wcm9wLXR5cGVzJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgZXJyLm5hbWUgPSAnSW52YXJpYW50IFZpb2xhdGlvbic7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gT2xkIGJlaGF2aW9yIGZvciBwZW9wbGUgdXNpbmcgUmVhY3QuUHJvcFR5cGVzXG4gICAgICAgICAgdmFyIGNhY2hlS2V5ID0gY29tcG9uZW50TmFtZSArICc6JyArIHByb3BOYW1lO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFtYW51YWxQcm9wVHlwZUNhbGxDYWNoZVtjYWNoZUtleV0gJiZcbiAgICAgICAgICAgIC8vIEF2b2lkIHNwYW1taW5nIHRoZSBjb25zb2xlIGJlY2F1c2UgdGhleSBhcmUgb2Z0ZW4gbm90IGFjdGlvbmFibGUgZXhjZXB0IGZvciBsaWIgYXV0aG9yc1xuICAgICAgICAgICAgbWFudWFsUHJvcFR5cGVXYXJuaW5nQ291bnQgPCAzXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBwcmludFdhcm5pbmcoXG4gICAgICAgICAgICAgICdZb3UgYXJlIG1hbnVhbGx5IGNhbGxpbmcgYSBSZWFjdC5Qcm9wVHlwZXMgdmFsaWRhdGlvbiAnICtcbiAgICAgICAgICAgICAgJ2Z1bmN0aW9uIGZvciB0aGUgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBwcm9wIG9uIGAnICsgY29tcG9uZW50TmFtZSAgKyAnYC4gVGhpcyBpcyBkZXByZWNhdGVkICcgK1xuICAgICAgICAgICAgICAnYW5kIHdpbGwgdGhyb3cgaW4gdGhlIHN0YW5kYWxvbmUgYHByb3AtdHlwZXNgIHBhY2thZ2UuICcgK1xuICAgICAgICAgICAgICAnWW91IG1heSBiZSBzZWVpbmcgdGhpcyB3YXJuaW5nIGR1ZSB0byBhIHRoaXJkLXBhcnR5IFByb3BUeXBlcyAnICtcbiAgICAgICAgICAgICAgJ2xpYnJhcnkuIFNlZSBodHRwczovL2ZiLm1lL3JlYWN0LXdhcm5pbmctZG9udC1jYWxsLXByb3B0eXBlcyAnICsgJ2ZvciBkZXRhaWxzLidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBtYW51YWxQcm9wVHlwZUNhbGxDYWNoZVtjYWNoZUtleV0gPSB0cnVlO1xuICAgICAgICAgICAgbWFudWFsUHJvcFR5cGVXYXJuaW5nQ291bnQrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwcm9wc1twcm9wTmFtZV0gPT0gbnVsbCkge1xuICAgICAgICBpZiAoaXNSZXF1aXJlZCkge1xuICAgICAgICAgIGlmIChwcm9wc1twcm9wTmFtZV0gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvcFR5cGVFcnJvcignVGhlICcgKyBsb2NhdGlvbiArICcgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBpcyBtYXJrZWQgYXMgcmVxdWlyZWQgJyArICgnaW4gYCcgKyBjb21wb25lbnROYW1lICsgJ2AsIGJ1dCBpdHMgdmFsdWUgaXMgYG51bGxgLicpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdUaGUgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIGlzIG1hcmtlZCBhcyByZXF1aXJlZCBpbiAnICsgKCdgJyArIGNvbXBvbmVudE5hbWUgKyAnYCwgYnV0IGl0cyB2YWx1ZSBpcyBgdW5kZWZpbmVkYC4nKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGUocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY2hhaW5lZENoZWNrVHlwZSA9IGNoZWNrVHlwZS5iaW5kKG51bGwsIGZhbHNlKTtcbiAgICBjaGFpbmVkQ2hlY2tUeXBlLmlzUmVxdWlyZWQgPSBjaGVja1R5cGUuYmluZChudWxsLCB0cnVlKTtcblxuICAgIHJldHVybiBjaGFpbmVkQ2hlY2tUeXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUHJpbWl0aXZlVHlwZUNoZWNrZXIoZXhwZWN0ZWRUeXBlKSB7XG4gICAgZnVuY3Rpb24gdmFsaWRhdGUocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lLCBzZWNyZXQpIHtcbiAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICB2YXIgcHJvcFR5cGUgPSBnZXRQcm9wVHlwZShwcm9wVmFsdWUpO1xuICAgICAgaWYgKHByb3BUeXBlICE9PSBleHBlY3RlZFR5cGUpIHtcbiAgICAgICAgLy8gYHByb3BWYWx1ZWAgYmVpbmcgaW5zdGFuY2Ugb2YsIHNheSwgZGF0ZS9yZWdleHAsIHBhc3MgdGhlICdvYmplY3QnXG4gICAgICAgIC8vIGNoZWNrLCBidXQgd2UgY2FuIG9mZmVyIGEgbW9yZSBwcmVjaXNlIGVycm9yIG1lc3NhZ2UgaGVyZSByYXRoZXIgdGhhblxuICAgICAgICAvLyAnb2YgdHlwZSBgb2JqZWN0YCcuXG4gICAgICAgIHZhciBwcmVjaXNlVHlwZSA9IGdldFByZWNpc2VUeXBlKHByb3BWYWx1ZSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdJbnZhbGlkICcgKyBsb2NhdGlvbiArICcgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBvZiB0eXBlICcgKyAoJ2AnICsgcHJlY2lzZVR5cGUgKyAnYCBzdXBwbGllZCB0byBgJyArIGNvbXBvbmVudE5hbWUgKyAnYCwgZXhwZWN0ZWQgJykgKyAoJ2AnICsgZXhwZWN0ZWRUeXBlICsgJ2AuJykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBbnlUeXBlQ2hlY2tlcigpIHtcbiAgICByZXR1cm4gY3JlYXRlQ2hhaW5hYmxlVHlwZUNoZWNrZXIoZW1wdHlGdW5jdGlvblRoYXRSZXR1cm5zTnVsbCk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBcnJheU9mVHlwZUNoZWNrZXIodHlwZUNoZWNrZXIpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIGlmICh0eXBlb2YgdHlwZUNoZWNrZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdQcm9wZXJ0eSBgJyArIHByb3BGdWxsTmFtZSArICdgIG9mIGNvbXBvbmVudCBgJyArIGNvbXBvbmVudE5hbWUgKyAnYCBoYXMgaW52YWxpZCBQcm9wVHlwZSBub3RhdGlvbiBpbnNpZGUgYXJyYXlPZi4nKTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvcFZhbHVlKSkge1xuICAgICAgICB2YXIgcHJvcFR5cGUgPSBnZXRQcm9wVHlwZShwcm9wVmFsdWUpO1xuICAgICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIG9mIHR5cGUgJyArICgnYCcgKyBwcm9wVHlwZSArICdgIHN1cHBsaWVkIHRvIGAnICsgY29tcG9uZW50TmFtZSArICdgLCBleHBlY3RlZCBhbiBhcnJheS4nKSk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZXJyb3IgPSB0eXBlQ2hlY2tlcihwcm9wVmFsdWUsIGksIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUgKyAnWycgKyBpICsgJ10nLCBSZWFjdFByb3BUeXBlc1NlY3JldCk7XG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUNoYWluYWJsZVR5cGVDaGVja2VyKHZhbGlkYXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRUeXBlQ2hlY2tlcigpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICBpZiAoIWlzVmFsaWRFbGVtZW50KHByb3BWYWx1ZSkpIHtcbiAgICAgICAgdmFyIHByb3BUeXBlID0gZ2V0UHJvcFR5cGUocHJvcFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdJbnZhbGlkICcgKyBsb2NhdGlvbiArICcgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBvZiB0eXBlICcgKyAoJ2AnICsgcHJvcFR5cGUgKyAnYCBzdXBwbGllZCB0byBgJyArIGNvbXBvbmVudE5hbWUgKyAnYCwgZXhwZWN0ZWQgYSBzaW5nbGUgUmVhY3RFbGVtZW50LicpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlQ2hhaW5hYmxlVHlwZUNoZWNrZXIodmFsaWRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2VUeXBlQ2hlY2tlcihleHBlY3RlZENsYXNzKSB7XG4gICAgZnVuY3Rpb24gdmFsaWRhdGUocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lKSB7XG4gICAgICBpZiAoIShwcm9wc1twcm9wTmFtZV0gaW5zdGFuY2VvZiBleHBlY3RlZENsYXNzKSkge1xuICAgICAgICB2YXIgZXhwZWN0ZWRDbGFzc05hbWUgPSBleHBlY3RlZENsYXNzLm5hbWUgfHwgQU5PTllNT1VTO1xuICAgICAgICB2YXIgYWN0dWFsQ2xhc3NOYW1lID0gZ2V0Q2xhc3NOYW1lKHByb3BzW3Byb3BOYW1lXSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcFR5cGVFcnJvcignSW52YWxpZCAnICsgbG9jYXRpb24gKyAnIGAnICsgcHJvcEZ1bGxOYW1lICsgJ2Agb2YgdHlwZSAnICsgKCdgJyArIGFjdHVhbENsYXNzTmFtZSArICdgIHN1cHBsaWVkIHRvIGAnICsgY29tcG9uZW50TmFtZSArICdgLCBleHBlY3RlZCAnKSArICgnaW5zdGFuY2Ugb2YgYCcgKyBleHBlY3RlZENsYXNzTmFtZSArICdgLicpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlQ2hhaW5hYmxlVHlwZUNoZWNrZXIodmFsaWRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRW51bVR5cGVDaGVja2VyKGV4cGVjdGVkVmFsdWVzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGV4cGVjdGVkVmFsdWVzKSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/IHByaW50V2FybmluZygnSW52YWxpZCBhcmd1bWVudCBzdXBwbGllZCB0byBvbmVPZiwgZXhwZWN0ZWQgYW4gaW5zdGFuY2Ugb2YgYXJyYXkuJykgOiB2b2lkIDA7XG4gICAgICByZXR1cm4gZW1wdHlGdW5jdGlvblRoYXRSZXR1cm5zTnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4cGVjdGVkVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpcyhwcm9wVmFsdWUsIGV4cGVjdGVkVmFsdWVzW2ldKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZXNTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShleHBlY3RlZFZhbHVlcyk7XG4gICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIG9mIHZhbHVlIGAnICsgcHJvcFZhbHVlICsgJ2AgJyArICgnc3VwcGxpZWQgdG8gYCcgKyBjb21wb25lbnROYW1lICsgJ2AsIGV4cGVjdGVkIG9uZSBvZiAnICsgdmFsdWVzU3RyaW5nICsgJy4nKSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVPYmplY3RPZlR5cGVDaGVja2VyKHR5cGVDaGVja2VyKSB7XG4gICAgZnVuY3Rpb24gdmFsaWRhdGUocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lKSB7XG4gICAgICBpZiAodHlwZW9mIHR5cGVDaGVja2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcFR5cGVFcnJvcignUHJvcGVydHkgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBvZiBjb21wb25lbnQgYCcgKyBjb21wb25lbnROYW1lICsgJ2AgaGFzIGludmFsaWQgUHJvcFR5cGUgbm90YXRpb24gaW5zaWRlIG9iamVjdE9mLicpO1xuICAgICAgfVxuICAgICAgdmFyIHByb3BWYWx1ZSA9IHByb3BzW3Byb3BOYW1lXTtcbiAgICAgIHZhciBwcm9wVHlwZSA9IGdldFByb3BUeXBlKHByb3BWYWx1ZSk7XG4gICAgICBpZiAocHJvcFR5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcFR5cGVFcnJvcignSW52YWxpZCAnICsgbG9jYXRpb24gKyAnIGAnICsgcHJvcEZ1bGxOYW1lICsgJ2Agb2YgdHlwZSAnICsgKCdgJyArIHByb3BUeXBlICsgJ2Agc3VwcGxpZWQgdG8gYCcgKyBjb21wb25lbnROYW1lICsgJ2AsIGV4cGVjdGVkIGFuIG9iamVjdC4nKSk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBrZXkgaW4gcHJvcFZhbHVlKSB7XG4gICAgICAgIGlmIChwcm9wVmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHZhciBlcnJvciA9IHR5cGVDaGVja2VyKHByb3BWYWx1ZSwga2V5LCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lICsgJy4nICsga2V5LCBSZWFjdFByb3BUeXBlc1NlY3JldCk7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlQ2hhaW5hYmxlVHlwZUNoZWNrZXIodmFsaWRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVW5pb25UeXBlQ2hlY2tlcihhcnJheU9mVHlwZUNoZWNrZXJzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFycmF5T2ZUeXBlQ2hlY2tlcnMpKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nID8gcHJpbnRXYXJuaW5nKCdJbnZhbGlkIGFyZ3VtZW50IHN1cHBsaWVkIHRvIG9uZU9mVHlwZSwgZXhwZWN0ZWQgYW4gaW5zdGFuY2Ugb2YgYXJyYXkuJykgOiB2b2lkIDA7XG4gICAgICByZXR1cm4gZW1wdHlGdW5jdGlvblRoYXRSZXR1cm5zTnVsbDtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5T2ZUeXBlQ2hlY2tlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjaGVja2VyID0gYXJyYXlPZlR5cGVDaGVja2Vyc1tpXTtcbiAgICAgIGlmICh0eXBlb2YgY2hlY2tlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcmludFdhcm5pbmcoXG4gICAgICAgICAgJ0ludmFsaWQgYXJndW1lbnQgc3VwcGxpZWQgdG8gb25lT2ZUeXBlLiBFeHBlY3RlZCBhbiBhcnJheSBvZiBjaGVjayBmdW5jdGlvbnMsIGJ1dCAnICtcbiAgICAgICAgICAncmVjZWl2ZWQgJyArIGdldFBvc3RmaXhGb3JUeXBlV2FybmluZyhjaGVja2VyKSArICcgYXQgaW5kZXggJyArIGkgKyAnLidcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGVtcHR5RnVuY3Rpb25UaGF0UmV0dXJuc051bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGUocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5T2ZUeXBlQ2hlY2tlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoZWNrZXIgPSBhcnJheU9mVHlwZUNoZWNrZXJzW2ldO1xuICAgICAgICBpZiAoY2hlY2tlcihwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUsIFJlYWN0UHJvcFR5cGVzU2VjcmV0KSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdJbnZhbGlkICcgKyBsb2NhdGlvbiArICcgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBzdXBwbGllZCB0byAnICsgKCdgJyArIGNvbXBvbmVudE5hbWUgKyAnYC4nKSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVOb2RlQ2hlY2tlcigpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIGlmICghaXNOb2RlKHByb3BzW3Byb3BOYW1lXSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdJbnZhbGlkICcgKyBsb2NhdGlvbiArICcgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBzdXBwbGllZCB0byAnICsgKCdgJyArIGNvbXBvbmVudE5hbWUgKyAnYCwgZXhwZWN0ZWQgYSBSZWFjdE5vZGUuJykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVTaGFwZVR5cGVDaGVja2VyKHNoYXBlVHlwZXMpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICB2YXIgcHJvcFR5cGUgPSBnZXRQcm9wVHlwZShwcm9wVmFsdWUpO1xuICAgICAgaWYgKHByb3BUeXBlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIG9mIHR5cGUgYCcgKyBwcm9wVHlwZSArICdgICcgKyAoJ3N1cHBsaWVkIHRvIGAnICsgY29tcG9uZW50TmFtZSArICdgLCBleHBlY3RlZCBgb2JqZWN0YC4nKSk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBrZXkgaW4gc2hhcGVUeXBlcykge1xuICAgICAgICB2YXIgY2hlY2tlciA9IHNoYXBlVHlwZXNba2V5XTtcbiAgICAgICAgaWYgKCFjaGVja2VyKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVycm9yID0gY2hlY2tlcihwcm9wVmFsdWUsIGtleSwgY29tcG9uZW50TmFtZSwgbG9jYXRpb24sIHByb3BGdWxsTmFtZSArICcuJyArIGtleSwgUmVhY3RQcm9wVHlwZXNTZWNyZXQpO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlQ2hhaW5hYmxlVHlwZUNoZWNrZXIodmFsaWRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlU3RyaWN0U2hhcGVUeXBlQ2hlY2tlcihzaGFwZVR5cGVzKSB7XG4gICAgZnVuY3Rpb24gdmFsaWRhdGUocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lKSB7XG4gICAgICB2YXIgcHJvcFZhbHVlID0gcHJvcHNbcHJvcE5hbWVdO1xuICAgICAgdmFyIHByb3BUeXBlID0gZ2V0UHJvcFR5cGUocHJvcFZhbHVlKTtcbiAgICAgIGlmIChwcm9wVHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdJbnZhbGlkICcgKyBsb2NhdGlvbiArICcgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBvZiB0eXBlIGAnICsgcHJvcFR5cGUgKyAnYCAnICsgKCdzdXBwbGllZCB0byBgJyArIGNvbXBvbmVudE5hbWUgKyAnYCwgZXhwZWN0ZWQgYG9iamVjdGAuJykpO1xuICAgICAgfVxuICAgICAgLy8gV2UgbmVlZCB0byBjaGVjayBhbGwga2V5cyBpbiBjYXNlIHNvbWUgYXJlIHJlcXVpcmVkIGJ1dCBtaXNzaW5nIGZyb21cbiAgICAgIC8vIHByb3BzLlxuICAgICAgdmFyIGFsbEtleXMgPSBhc3NpZ24oe30sIHByb3BzW3Byb3BOYW1lXSwgc2hhcGVUeXBlcyk7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gYWxsS2V5cykge1xuICAgICAgICB2YXIgY2hlY2tlciA9IHNoYXBlVHlwZXNba2V5XTtcbiAgICAgICAgaWYgKCFjaGVja2VyKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKFxuICAgICAgICAgICAgJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIGtleSBgJyArIGtleSArICdgIHN1cHBsaWVkIHRvIGAnICsgY29tcG9uZW50TmFtZSArICdgLicgK1xuICAgICAgICAgICAgJ1xcbkJhZCBvYmplY3Q6ICcgKyBKU09OLnN0cmluZ2lmeShwcm9wc1twcm9wTmFtZV0sIG51bGwsICcgICcpICtcbiAgICAgICAgICAgICdcXG5WYWxpZCBrZXlzOiAnICsgIEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKHNoYXBlVHlwZXMpLCBudWxsLCAnICAnKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVycm9yID0gY2hlY2tlcihwcm9wVmFsdWUsIGtleSwgY29tcG9uZW50TmFtZSwgbG9jYXRpb24sIHByb3BGdWxsTmFtZSArICcuJyArIGtleSwgUmVhY3RQcm9wVHlwZXNTZWNyZXQpO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc05vZGUocHJvcFZhbHVlKSB7XG4gICAgc3dpdGNoICh0eXBlb2YgcHJvcFZhbHVlKSB7XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIHJldHVybiAhcHJvcFZhbHVlO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJvcFZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBwcm9wVmFsdWUuZXZlcnkoaXNOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvcFZhbHVlID09PSBudWxsIHx8IGlzVmFsaWRFbGVtZW50KHByb3BWYWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpdGVyYXRvckZuID0gZ2V0SXRlcmF0b3JGbihwcm9wVmFsdWUpO1xuICAgICAgICBpZiAoaXRlcmF0b3JGbikge1xuICAgICAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhdG9yRm4uY2FsbChwcm9wVmFsdWUpO1xuICAgICAgICAgIHZhciBzdGVwO1xuICAgICAgICAgIGlmIChpdGVyYXRvckZuICE9PSBwcm9wVmFsdWUuZW50cmllcykge1xuICAgICAgICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgICAgICAgICBpZiAoIWlzTm9kZShzdGVwLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJdGVyYXRvciB3aWxsIHByb3ZpZGUgZW50cnkgW2ssdl0gdHVwbGVzIHJhdGhlciB0aGFuIHZhbHVlcy5cbiAgICAgICAgICAgIHdoaWxlICghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgICAgICAgICAgdmFyIGVudHJ5ID0gc3RlcC52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc05vZGUoZW50cnlbMV0pKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzU3ltYm9sKHByb3BUeXBlLCBwcm9wVmFsdWUpIHtcbiAgICAvLyBOYXRpdmUgU3ltYm9sLlxuICAgIGlmIChwcm9wVHlwZSA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ10gPT09ICdTeW1ib2wnXG4gICAgaWYgKHByb3BWYWx1ZVsnQEB0b1N0cmluZ1RhZyddID09PSAnU3ltYm9sJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRmFsbGJhY2sgZm9yIG5vbi1zcGVjIGNvbXBsaWFudCBTeW1ib2xzIHdoaWNoIGFyZSBwb2x5ZmlsbGVkLlxuICAgIGlmICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHByb3BWYWx1ZSBpbnN0YW5jZW9mIFN5bWJvbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRXF1aXZhbGVudCBvZiBgdHlwZW9mYCBidXQgd2l0aCBzcGVjaWFsIGhhbmRsaW5nIGZvciBhcnJheSBhbmQgcmVnZXhwLlxuICBmdW5jdGlvbiBnZXRQcm9wVHlwZShwcm9wVmFsdWUpIHtcbiAgICB2YXIgcHJvcFR5cGUgPSB0eXBlb2YgcHJvcFZhbHVlO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHByb3BWYWx1ZSkpIHtcbiAgICAgIHJldHVybiAnYXJyYXknO1xuICAgIH1cbiAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAvLyBPbGQgd2Via2l0cyAoYXQgbGVhc3QgdW50aWwgQW5kcm9pZCA0LjApIHJldHVybiAnZnVuY3Rpb24nIHJhdGhlciB0aGFuXG4gICAgICAvLyAnb2JqZWN0JyBmb3IgdHlwZW9mIGEgUmVnRXhwLiBXZSdsbCBub3JtYWxpemUgdGhpcyBoZXJlIHNvIHRoYXQgL2JsYS9cbiAgICAgIC8vIHBhc3NlcyBQcm9wVHlwZXMub2JqZWN0LlxuICAgICAgcmV0dXJuICdvYmplY3QnO1xuICAgIH1cbiAgICBpZiAoaXNTeW1ib2wocHJvcFR5cGUsIHByb3BWYWx1ZSkpIHtcbiAgICAgIHJldHVybiAnc3ltYm9sJztcbiAgICB9XG4gICAgcmV0dXJuIHByb3BUeXBlO1xuICB9XG5cbiAgLy8gVGhpcyBoYW5kbGVzIG1vcmUgdHlwZXMgdGhhbiBgZ2V0UHJvcFR5cGVgLiBPbmx5IHVzZWQgZm9yIGVycm9yIG1lc3NhZ2VzLlxuICAvLyBTZWUgYGNyZWF0ZVByaW1pdGl2ZVR5cGVDaGVja2VyYC5cbiAgZnVuY3Rpb24gZ2V0UHJlY2lzZVR5cGUocHJvcFZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiBwcm9wVmFsdWUgPT09ICd1bmRlZmluZWQnIHx8IHByb3BWYWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnICsgcHJvcFZhbHVlO1xuICAgIH1cbiAgICB2YXIgcHJvcFR5cGUgPSBnZXRQcm9wVHlwZShwcm9wVmFsdWUpO1xuICAgIGlmIChwcm9wVHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChwcm9wVmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHJldHVybiAnZGF0ZSc7XG4gICAgICB9IGVsc2UgaWYgKHByb3BWYWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwcm9wVHlwZTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBzdHJpbmcgdGhhdCBpcyBwb3N0Zml4ZWQgdG8gYSB3YXJuaW5nIGFib3V0IGFuIGludmFsaWQgdHlwZS5cbiAgLy8gRm9yIGV4YW1wbGUsIFwidW5kZWZpbmVkXCIgb3IgXCJvZiB0eXBlIGFycmF5XCJcbiAgZnVuY3Rpb24gZ2V0UG9zdGZpeEZvclR5cGVXYXJuaW5nKHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSBnZXRQcmVjaXNlVHlwZSh2YWx1ZSk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdhcnJheSc6XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICByZXR1cm4gJ2FuICcgKyB0eXBlO1xuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdkYXRlJzpcbiAgICAgIGNhc2UgJ3JlZ2V4cCc6XG4gICAgICAgIHJldHVybiAnYSAnICsgdHlwZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0eXBlO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybnMgY2xhc3MgbmFtZSBvZiB0aGUgb2JqZWN0LCBpZiBhbnkuXG4gIGZ1bmN0aW9uIGdldENsYXNzTmFtZShwcm9wVmFsdWUpIHtcbiAgICBpZiAoIXByb3BWYWx1ZS5jb25zdHJ1Y3RvciB8fCAhcHJvcFZhbHVlLmNvbnN0cnVjdG9yLm5hbWUpIHtcbiAgICAgIHJldHVybiBBTk9OWU1PVVM7XG4gICAgfVxuICAgIHJldHVybiBwcm9wVmFsdWUuY29uc3RydWN0b3IubmFtZTtcbiAgfVxuXG4gIFJlYWN0UHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzID0gY2hlY2tQcm9wVHlwZXM7XG4gIFJlYWN0UHJvcFR5cGVzLlByb3BUeXBlcyA9IFJlYWN0UHJvcFR5cGVzO1xuXG4gIHJldHVybiBSZWFjdFByb3BUeXBlcztcbn07XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZhciBSRUFDVF9FTEVNRU5UX1RZUEUgPSAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIFN5bWJvbC5mb3IgJiZcbiAgICBTeW1ib2wuZm9yKCdyZWFjdC5lbGVtZW50JykpIHx8XG4gICAgMHhlYWM3O1xuXG4gIHZhciBpc1ZhbGlkRWxlbWVudCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgb2JqZWN0ICE9PSBudWxsICYmXG4gICAgICBvYmplY3QuJCR0eXBlb2YgPT09IFJFQUNUX0VMRU1FTlRfVFlQRTtcbiAgfTtcblxuICAvLyBCeSBleHBsaWNpdGx5IHVzaW5nIGBwcm9wLXR5cGVzYCB5b3UgYXJlIG9wdGluZyBpbnRvIG5ldyBkZXZlbG9wbWVudCBiZWhhdmlvci5cbiAgLy8gaHR0cDovL2ZiLm1lL3Byb3AtdHlwZXMtaW4tcHJvZFxuICB2YXIgdGhyb3dPbkRpcmVjdEFjY2VzcyA9IHRydWU7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9mYWN0b3J5V2l0aFR5cGVDaGVja2VycycpKGlzVmFsaWRFbGVtZW50LCB0aHJvd09uRGlyZWN0QWNjZXNzKTtcbn0gZWxzZSB7XG4gIC8vIEJ5IGV4cGxpY2l0bHkgdXNpbmcgYHByb3AtdHlwZXNgIHlvdSBhcmUgb3B0aW5nIGludG8gbmV3IHByb2R1Y3Rpb24gYmVoYXZpb3IuXG4gIC8vIGh0dHA6Ly9mYi5tZS9wcm9wLXR5cGVzLWluLXByb2RcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcycpKCk7XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0UHJvcFR5cGVzU2VjcmV0ID0gJ1NFQ1JFVF9ET19OT1RfUEFTU19USElTX09SX1lPVV9XSUxMX0JFX0ZJUkVEJztcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdFByb3BUeXBlc1NlY3JldDtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsdWUsIHN0cmljdCkge1xuXHRyZXR1cm4gc3RyaWN0ID8gc3RyaWN0VXJpRW5jb2RlKHZhbHVlKSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG59XG5cbmV4cG9ydHMuZXh0cmFjdCA9IGZ1bmN0aW9uIChzdHIpIHtcblx0cmV0dXJuIHN0ci5zcGxpdCgnPycpWzFdIHx8ICcnO1xufTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIChzdHIpIHtcblx0Ly8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIG5vIHByb3RvdHlwZVxuXHQvLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZy9pc3N1ZXMvNDdcblx0dmFyIHJldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cblx0aWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHN0ciA9IHN0ci50cmltKCkucmVwbGFjZSgvXihcXD98I3wmKS8sICcnKTtcblxuXHRpZiAoIXN0cikge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRzdHIuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uIChwYXJhbSkge1xuXHRcdHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG5cdFx0Ly8gRmlyZWZveCAocHJlIDQwKSBkZWNvZGVzIGAlM0RgIHRvIGA9YFxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nL3B1bGwvMzdcblx0XHR2YXIga2V5ID0gcGFydHMuc2hpZnQoKTtcblx0XHR2YXIgdmFsID0gcGFydHMubGVuZ3RoID4gMCA/IHBhcnRzLmpvaW4oJz0nKSA6IHVuZGVmaW5lZDtcblxuXHRcdGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXG5cdFx0Ly8gbWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcblx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0dmFsID0gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbCk7XG5cblx0XHRpZiAocmV0W2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0W2tleV0gPSB2YWw7XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuXHRcdFx0cmV0W2tleV0ucHVzaCh2YWwpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiByZXQ7XG59O1xuXG5leHBvcnRzLnN0cmluZ2lmeSA9IGZ1bmN0aW9uIChvYmosIG9wdHMpIHtcblx0b3B0cyA9IG9wdHMgfHwge307XG5cblx0dmFyIHN0cmljdCA9IG9wdHMuc3RyaWN0ICE9PSBmYWxzZTtcblxuXHRyZXR1cm4gb2JqID8gT2JqZWN0LmtleXMob2JqKS5zb3J0KCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHR2YXIgdmFsID0gb2JqW2tleV07XG5cblx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAodmFsID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4ga2V5O1xuXHRcdH1cblxuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcblx0XHRcdHZhciByZXN1bHQgPSBbXTtcblxuXHRcdFx0dmFsLnNsaWNlKCkuc29ydCgpLmZvckVhY2goZnVuY3Rpb24gKHZhbDIpIHtcblx0XHRcdFx0aWYgKHZhbDIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2YWwyID09PSBudWxsKSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goZW5jb2RlKGtleSwgc3RyaWN0KSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goZW5jb2RlKGtleSwgc3RyaWN0KSArICc9JyArIGVuY29kZSh2YWwyLCBzdHJpY3QpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiByZXN1bHQuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbmNvZGUoa2V5LCBzdHJpY3QpICsgJz0nICsgZW5jb2RlKHZhbCwgc3RyaWN0KTtcblx0fSkuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XG5cdFx0cmV0dXJuIHgubGVuZ3RoID4gMDtcblx0fSkuam9pbignJicpIDogJyc7XG59O1xuIiwidmFyIG5vdyA9IHJlcXVpcmUoJ3BlcmZvcm1hbmNlLW5vdycpXG4gICwgcm9vdCA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93XG4gICwgdmVuZG9ycyA9IFsnbW96JywgJ3dlYmtpdCddXG4gICwgc3VmZml4ID0gJ0FuaW1hdGlvbkZyYW1lJ1xuICAsIHJhZiA9IHJvb3RbJ3JlcXVlc3QnICsgc3VmZml4XVxuICAsIGNhZiA9IHJvb3RbJ2NhbmNlbCcgKyBzdWZmaXhdIHx8IHJvb3RbJ2NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxuXG5mb3IodmFyIGkgPSAwOyAhcmFmICYmIGkgPCB2ZW5kb3JzLmxlbmd0aDsgaSsrKSB7XG4gIHJhZiA9IHJvb3RbdmVuZG9yc1tpXSArICdSZXF1ZXN0JyArIHN1ZmZpeF1cbiAgY2FmID0gcm9vdFt2ZW5kb3JzW2ldICsgJ0NhbmNlbCcgKyBzdWZmaXhdXG4gICAgICB8fCByb290W3ZlbmRvcnNbaV0gKyAnQ2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG59XG5cbi8vIFNvbWUgdmVyc2lvbnMgb2YgRkYgaGF2ZSByQUYgYnV0IG5vdCBjQUZcbmlmKCFyYWYgfHwgIWNhZikge1xuICB2YXIgbGFzdCA9IDBcbiAgICAsIGlkID0gMFxuICAgICwgcXVldWUgPSBbXVxuICAgICwgZnJhbWVEdXJhdGlvbiA9IDEwMDAgLyA2MFxuXG4gIHJhZiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB2YXIgX25vdyA9IG5vdygpXG4gICAgICAgICwgbmV4dCA9IE1hdGgubWF4KDAsIGZyYW1lRHVyYXRpb24gLSAoX25vdyAtIGxhc3QpKVxuICAgICAgbGFzdCA9IG5leHQgKyBfbm93XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3AgPSBxdWV1ZS5zbGljZSgwKVxuICAgICAgICAvLyBDbGVhciBxdWV1ZSBoZXJlIHRvIHByZXZlbnRcbiAgICAgICAgLy8gY2FsbGJhY2tzIGZyb20gYXBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgICAvLyB0byB0aGUgY3VycmVudCBmcmFtZSdzIHF1ZXVlXG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDBcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYoIWNwW2ldLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICBjcFtpXS5jYWxsYmFjayhsYXN0KVxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGUgfSwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIE1hdGgucm91bmQobmV4dCkpXG4gICAgfVxuICAgIHF1ZXVlLnB1c2goe1xuICAgICAgaGFuZGxlOiArK2lkLFxuICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgY2FuY2VsbGVkOiBmYWxzZVxuICAgIH0pXG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICBjYWYgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHF1ZXVlW2ldLmhhbmRsZSA9PT0gaGFuZGxlKSB7XG4gICAgICAgIHF1ZXVlW2ldLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbikge1xuICAvLyBXcmFwIGluIGEgbmV3IGZ1bmN0aW9uIHRvIHByZXZlbnRcbiAgLy8gYGNhbmNlbGAgcG90ZW50aWFsbHkgYmVpbmcgYXNzaWduZWRcbiAgLy8gdG8gdGhlIG5hdGl2ZSByQUYgZnVuY3Rpb25cbiAgcmV0dXJuIHJhZi5jYWxsKHJvb3QsIGZuKVxufVxubW9kdWxlLmV4cG9ydHMuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gIGNhZi5hcHBseShyb290LCBhcmd1bWVudHMpXG59XG5tb2R1bGUuZXhwb3J0cy5wb2x5ZmlsbCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICBpZiAoIW9iamVjdCkge1xuICAgIG9iamVjdCA9IHJvb3Q7XG4gIH1cbiAgb2JqZWN0LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJhZlxuICBvYmplY3QuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjYWZcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9yZWFjdERvbSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCdldmVudGxpc3RlbmVyJyk7XG5cbnZhciBfbG9kYXNoID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyk7XG5cbnZhciBfbG9kYXNoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xvZGFzaCk7XG5cbnZhciBfbG9kYXNoMyA9IHJlcXVpcmUoJ2xvZGFzaC50aHJvdHRsZScpO1xuXG52YXIgX2xvZGFzaDQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2Rhc2gzKTtcblxudmFyIF9wYXJlbnRTY3JvbGwgPSByZXF1aXJlKCcuL3V0aWxzL3BhcmVudFNjcm9sbCcpO1xuXG52YXIgX3BhcmVudFNjcm9sbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXJlbnRTY3JvbGwpO1xuXG52YXIgX2luVmlld3BvcnQgPSByZXF1aXJlKCcuL3V0aWxzL2luVmlld3BvcnQnKTtcblxudmFyIF9pblZpZXdwb3J0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2luVmlld3BvcnQpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBMYXp5TG9hZCA9IGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0cyhMYXp5TG9hZCwgX0NvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gTGF6eUxvYWQocHJvcHMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGF6eUxvYWQpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKExhenlMb2FkLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTGF6eUxvYWQpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICBfdGhpcy5sYXp5TG9hZEhhbmRsZXIgPSBfdGhpcy5sYXp5TG9hZEhhbmRsZXIuYmluZChfdGhpcyk7XG5cbiAgICBpZiAocHJvcHMudGhyb3R0bGUgPiAwKSB7XG4gICAgICBpZiAocHJvcHMuZGVib3VuY2UpIHtcbiAgICAgICAgX3RoaXMubGF6eUxvYWRIYW5kbGVyID0gKDAsIF9sb2Rhc2gyLmRlZmF1bHQpKF90aGlzLmxhenlMb2FkSGFuZGxlciwgcHJvcHMudGhyb3R0bGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3RoaXMubGF6eUxvYWRIYW5kbGVyID0gKDAsIF9sb2Rhc2g0LmRlZmF1bHQpKF90aGlzLmxhenlMb2FkSGFuZGxlciwgcHJvcHMudGhyb3R0bGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF90aGlzLnN0YXRlID0geyB2aXNpYmxlOiBmYWxzZSB9O1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhMYXp5TG9hZCwgW3tcbiAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5fbW91bnRlZCA9IHRydWU7XG4gICAgICB2YXIgZXZlbnROb2RlID0gdGhpcy5nZXRFdmVudE5vZGUoKTtcblxuICAgICAgdGhpcy5sYXp5TG9hZEhhbmRsZXIoKTtcblxuICAgICAgaWYgKHRoaXMubGF6eUxvYWRIYW5kbGVyLmZsdXNoKSB7XG4gICAgICAgIHRoaXMubGF6eUxvYWRIYW5kbGVyLmZsdXNoKCk7XG4gICAgICB9XG5cbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5hZGQpKHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMubGF6eUxvYWRIYW5kbGVyKTtcbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5hZGQpKGV2ZW50Tm9kZSwgJ3Njcm9sbCcsIHRoaXMubGF6eUxvYWRIYW5kbGVyKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcygpIHtcbiAgICAgIGlmICghdGhpcy5zdGF0ZS52aXNpYmxlKSB7XG4gICAgICAgIHRoaXMubGF6eUxvYWRIYW5kbGVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2hvdWxkQ29tcG9uZW50VXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdWxkQ29tcG9uZW50VXBkYXRlKF9uZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgcmV0dXJuIG5leHRTdGF0ZS52aXNpYmxlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLl9tb3VudGVkID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5sYXp5TG9hZEhhbmRsZXIuY2FuY2VsKSB7XG4gICAgICAgIHRoaXMubGF6eUxvYWRIYW5kbGVyLmNhbmNlbCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRldGFjaExpc3RlbmVycygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50Tm9kZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50Tm9kZSgpIHtcbiAgICAgIHJldHVybiAoMCwgX3BhcmVudFNjcm9sbDIuZGVmYXVsdCkoKDAsIF9yZWFjdERvbS5maW5kRE9NTm9kZSkodGhpcykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldE9mZnNldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE9mZnNldCgpIHtcbiAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzLFxuICAgICAgICAgIG9mZnNldCA9IF9wcm9wcy5vZmZzZXQsXG4gICAgICAgICAgb2Zmc2V0VmVydGljYWwgPSBfcHJvcHMub2Zmc2V0VmVydGljYWwsXG4gICAgICAgICAgb2Zmc2V0SG9yaXpvbnRhbCA9IF9wcm9wcy5vZmZzZXRIb3Jpem9udGFsLFxuICAgICAgICAgIG9mZnNldFRvcCA9IF9wcm9wcy5vZmZzZXRUb3AsXG4gICAgICAgICAgb2Zmc2V0Qm90dG9tID0gX3Byb3BzLm9mZnNldEJvdHRvbSxcbiAgICAgICAgICBvZmZzZXRMZWZ0ID0gX3Byb3BzLm9mZnNldExlZnQsXG4gICAgICAgICAgb2Zmc2V0UmlnaHQgPSBfcHJvcHMub2Zmc2V0UmlnaHQsXG4gICAgICAgICAgdGhyZXNob2xkID0gX3Byb3BzLnRocmVzaG9sZDtcblxuXG4gICAgICB2YXIgX29mZnNldEFsbCA9IHRocmVzaG9sZCB8fCBvZmZzZXQ7XG4gICAgICB2YXIgX29mZnNldFZlcnRpY2FsID0gb2Zmc2V0VmVydGljYWwgfHwgX29mZnNldEFsbDtcbiAgICAgIHZhciBfb2Zmc2V0SG9yaXpvbnRhbCA9IG9mZnNldEhvcml6b250YWwgfHwgX29mZnNldEFsbDtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiBvZmZzZXRUb3AgfHwgX29mZnNldFZlcnRpY2FsLFxuICAgICAgICBib3R0b206IG9mZnNldEJvdHRvbSB8fCBfb2Zmc2V0VmVydGljYWwsXG4gICAgICAgIGxlZnQ6IG9mZnNldExlZnQgfHwgX29mZnNldEhvcml6b250YWwsXG4gICAgICAgIHJpZ2h0OiBvZmZzZXRSaWdodCB8fCBfb2Zmc2V0SG9yaXpvbnRhbFxuICAgICAgfTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdsYXp5TG9hZEhhbmRsZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsYXp5TG9hZEhhbmRsZXIoKSB7XG4gICAgICBpZiAoIXRoaXMuX21vdW50ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KCk7XG4gICAgICB2YXIgbm9kZSA9ICgwLCBfcmVhY3REb20uZmluZERPTU5vZGUpKHRoaXMpO1xuICAgICAgdmFyIGV2ZW50Tm9kZSA9IHRoaXMuZ2V0RXZlbnROb2RlKCk7XG5cbiAgICAgIGlmICgoMCwgX2luVmlld3BvcnQyLmRlZmF1bHQpKG5vZGUsIGV2ZW50Tm9kZSwgb2Zmc2V0KSkge1xuICAgICAgICB2YXIgb25Db250ZW50VmlzaWJsZSA9IHRoaXMucHJvcHMub25Db250ZW50VmlzaWJsZTtcblxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2aXNpYmxlOiB0cnVlIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAob25Db250ZW50VmlzaWJsZSkge1xuICAgICAgICAgICAgb25Db250ZW50VmlzaWJsZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGV0YWNoTGlzdGVuZXJzKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGV0YWNoTGlzdGVuZXJzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGV0YWNoTGlzdGVuZXJzKCkge1xuICAgICAgdmFyIGV2ZW50Tm9kZSA9IHRoaXMuZ2V0RXZlbnROb2RlKCk7XG5cbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5yZW1vdmUpKHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMubGF6eUxvYWRIYW5kbGVyKTtcbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5yZW1vdmUpKGV2ZW50Tm9kZSwgJ3Njcm9sbCcsIHRoaXMubGF6eUxvYWRIYW5kbGVyKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW5kZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHMsXG4gICAgICAgICAgY2hpbGRyZW4gPSBfcHJvcHMyLmNoaWxkcmVuLFxuICAgICAgICAgIGNsYXNzTmFtZSA9IF9wcm9wczIuY2xhc3NOYW1lLFxuICAgICAgICAgIGhlaWdodCA9IF9wcm9wczIuaGVpZ2h0LFxuICAgICAgICAgIHdpZHRoID0gX3Byb3BzMi53aWR0aDtcbiAgICAgIHZhciB2aXNpYmxlID0gdGhpcy5zdGF0ZS52aXNpYmxlO1xuXG5cbiAgICAgIHZhciBlbFN0eWxlcyA9IHsgaGVpZ2h0OiBoZWlnaHQsIHdpZHRoOiB3aWR0aCB9O1xuICAgICAgdmFyIGVsQ2xhc3NlcyA9ICdMYXp5TG9hZCcgKyAodmlzaWJsZSA/ICcgaXMtdmlzaWJsZScgOiAnJykgKyAoY2xhc3NOYW1lID8gJyAnICsgY2xhc3NOYW1lIDogJycpO1xuXG4gICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5lbGVtZW50VHlwZSwge1xuICAgICAgICBjbGFzc05hbWU6IGVsQ2xhc3NlcyxcbiAgICAgICAgc3R5bGU6IGVsU3R5bGVzXG4gICAgICB9LCB2aXNpYmxlICYmIF9yZWFjdC5DaGlsZHJlbi5vbmx5KGNoaWxkcmVuKSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIExhenlMb2FkO1xufShfcmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTGF6eUxvYWQ7XG5cblxuTGF6eUxvYWQucHJvcFR5cGVzID0ge1xuICBjaGlsZHJlbjogX3Byb3BUeXBlczIuZGVmYXVsdC5ub2RlLmlzUmVxdWlyZWQsXG4gIGNsYXNzTmFtZTogX3Byb3BUeXBlczIuZGVmYXVsdC5zdHJpbmcsXG4gIGRlYm91bmNlOiBfcHJvcFR5cGVzMi5kZWZhdWx0LmJvb2wsXG4gIGVsZW1lbnRUeXBlOiBfcHJvcFR5cGVzMi5kZWZhdWx0LnN0cmluZyxcbiAgaGVpZ2h0OiBfcHJvcFR5cGVzMi5kZWZhdWx0Lm9uZU9mVHlwZShbX3Byb3BUeXBlczIuZGVmYXVsdC5zdHJpbmcsIF9wcm9wVHlwZXMyLmRlZmF1bHQubnVtYmVyXSksXG4gIG9mZnNldDogX3Byb3BUeXBlczIuZGVmYXVsdC5udW1iZXIsXG4gIG9mZnNldEJvdHRvbTogX3Byb3BUeXBlczIuZGVmYXVsdC5udW1iZXIsXG4gIG9mZnNldEhvcml6b250YWw6IF9wcm9wVHlwZXMyLmRlZmF1bHQubnVtYmVyLFxuICBvZmZzZXRMZWZ0OiBfcHJvcFR5cGVzMi5kZWZhdWx0Lm51bWJlcixcbiAgb2Zmc2V0UmlnaHQ6IF9wcm9wVHlwZXMyLmRlZmF1bHQubnVtYmVyLFxuICBvZmZzZXRUb3A6IF9wcm9wVHlwZXMyLmRlZmF1bHQubnVtYmVyLFxuICBvZmZzZXRWZXJ0aWNhbDogX3Byb3BUeXBlczIuZGVmYXVsdC5udW1iZXIsXG4gIHRocmVzaG9sZDogX3Byb3BUeXBlczIuZGVmYXVsdC5udW1iZXIsXG4gIHRocm90dGxlOiBfcHJvcFR5cGVzMi5kZWZhdWx0Lm51bWJlcixcbiAgd2lkdGg6IF9wcm9wVHlwZXMyLmRlZmF1bHQub25lT2ZUeXBlKFtfcHJvcFR5cGVzMi5kZWZhdWx0LnN0cmluZywgX3Byb3BUeXBlczIuZGVmYXVsdC5udW1iZXJdKSxcbiAgb25Db250ZW50VmlzaWJsZTogX3Byb3BUeXBlczIuZGVmYXVsdC5mdW5jXG59O1xuXG5MYXp5TG9hZC5kZWZhdWx0UHJvcHMgPSB7XG4gIGVsZW1lbnRUeXBlOiAnZGl2JyxcbiAgZGVib3VuY2U6IHRydWUsXG4gIG9mZnNldDogMCxcbiAgb2Zmc2V0Qm90dG9tOiAwLFxuICBvZmZzZXRIb3Jpem9udGFsOiAwLFxuICBvZmZzZXRMZWZ0OiAwLFxuICBvZmZzZXRSaWdodDogMCxcbiAgb2Zmc2V0VG9wOiAwLFxuICBvZmZzZXRWZXJ0aWNhbDogMCxcbiAgdGhyb3R0bGU6IDI1MFxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGdldEVsZW1lbnRQb3NpdGlvbjtcbi8qXG4qIEZpbmRzIGVsZW1lbnQncyBwb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgd2hvbGUgZG9jdW1lbnQsXG4qIHJhdGhlciB0aGFuIHRvIHRoZSB2aWV3cG9ydCBhcyBpdCBpcyB0aGUgY2FzZSB3aXRoIC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5cbiovXG5mdW5jdGlvbiBnZXRFbGVtZW50UG9zaXRpb24oZWxlbWVudCkge1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgcmV0dXJuIHtcbiAgICB0b3A6IHJlY3QudG9wICsgd2luZG93LnBhZ2VZT2Zmc2V0LFxuICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldFxuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGluVmlld3BvcnQ7XG5cbnZhciBfZ2V0RWxlbWVudFBvc2l0aW9uID0gcmVxdWlyZSgnLi9nZXRFbGVtZW50UG9zaXRpb24nKTtcblxudmFyIF9nZXRFbGVtZW50UG9zaXRpb24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2V0RWxlbWVudFBvc2l0aW9uKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGlzSGlkZGVuID0gZnVuY3Rpb24gaXNIaWRkZW4oZWxlbWVudCkge1xuICByZXR1cm4gZWxlbWVudC5vZmZzZXRQYXJlbnQgPT09IG51bGw7XG59O1xuXG5mdW5jdGlvbiBpblZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgY3VzdG9tT2Zmc2V0KSB7XG4gIGlmIChpc0hpZGRlbihlbGVtZW50KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciB0b3AgPSB2b2lkIDA7XG4gIHZhciBib3R0b20gPSB2b2lkIDA7XG4gIHZhciBsZWZ0ID0gdm9pZCAwO1xuICB2YXIgcmlnaHQgPSB2b2lkIDA7XG5cbiAgaWYgKHR5cGVvZiBjb250YWluZXIgPT09ICd1bmRlZmluZWQnIHx8IGNvbnRhaW5lciA9PT0gd2luZG93KSB7XG4gICAgdG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGxlZnQgPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgYm90dG9tID0gdG9wICsgd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHJpZ2h0ID0gbGVmdCArIHdpbmRvdy5pbm5lcldpZHRoO1xuICB9IGVsc2Uge1xuICAgIHZhciBjb250YWluZXJQb3NpdGlvbiA9ICgwLCBfZ2V0RWxlbWVudFBvc2l0aW9uMi5kZWZhdWx0KShjb250YWluZXIpO1xuXG4gICAgdG9wID0gY29udGFpbmVyUG9zaXRpb24udG9wO1xuICAgIGxlZnQgPSBjb250YWluZXJQb3NpdGlvbi5sZWZ0O1xuICAgIGJvdHRvbSA9IHRvcCArIGNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gICAgcmlnaHQgPSBsZWZ0ICsgY29udGFpbmVyLm9mZnNldFdpZHRoO1xuICB9XG5cbiAgdmFyIGVsZW1lbnRQb3NpdGlvbiA9ICgwLCBfZ2V0RWxlbWVudFBvc2l0aW9uMi5kZWZhdWx0KShlbGVtZW50KTtcblxuICByZXR1cm4gdG9wIDw9IGVsZW1lbnRQb3NpdGlvbi50b3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodCArIGN1c3RvbU9mZnNldC50b3AgJiYgYm90dG9tID49IGVsZW1lbnRQb3NpdGlvbi50b3AgLSBjdXN0b21PZmZzZXQuYm90dG9tICYmIGxlZnQgPD0gZWxlbWVudFBvc2l0aW9uLmxlZnQgKyBlbGVtZW50Lm9mZnNldFdpZHRoICsgY3VzdG9tT2Zmc2V0LmxlZnQgJiYgcmlnaHQgPj0gZWxlbWVudFBvc2l0aW9uLmxlZnQgLSBjdXN0b21PZmZzZXQucmlnaHQ7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xudmFyIHN0eWxlID0gZnVuY3Rpb24gc3R5bGUoZWxlbWVudCwgcHJvcCkge1xuICByZXR1cm4gdHlwZW9mIGdldENvbXB1dGVkU3R5bGUgIT09ICd1bmRlZmluZWQnID8gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApIDogZWxlbWVudC5zdHlsZVtwcm9wXTtcbn07XG5cbnZhciBvdmVyZmxvdyA9IGZ1bmN0aW9uIG92ZXJmbG93KGVsZW1lbnQpIHtcbiAgcmV0dXJuIHN0eWxlKGVsZW1lbnQsICdvdmVyZmxvdycpICsgc3R5bGUoZWxlbWVudCwgJ292ZXJmbG93LXknKSArIHN0eWxlKGVsZW1lbnQsICdvdmVyZmxvdy14Jyk7XG59O1xuXG52YXIgc2Nyb2xsUGFyZW50ID0gZnVuY3Rpb24gc2Nyb2xsUGFyZW50KGVsZW1lbnQpIHtcbiAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cblxuICB2YXIgcGFyZW50ID0gZWxlbWVudDtcblxuICB3aGlsZSAocGFyZW50KSB7XG4gICAgaWYgKHBhcmVudCA9PT0gZG9jdW1lbnQuYm9keSB8fCBwYXJlbnQgPT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFwYXJlbnQucGFyZW50Tm9kZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKC8oc2Nyb2xsfGF1dG8pLy50ZXN0KG92ZXJmbG93KHBhcmVudCkpKSB7XG4gICAgICByZXR1cm4gcGFyZW50O1xuICAgIH1cblxuICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuICB9XG5cbiAgcmV0dXJuIHdpbmRvdztcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHNjcm9sbFBhcmVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZShcInByb3AtdHlwZXNcIik7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfcmFmID0gcmVxdWlyZShcInJhZlwiKTtcblxudmFyIF9yYWYyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmFmKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgQ29udGFpbmVyID0gZnVuY3Rpb24gKF9QdXJlQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0cyhDb250YWluZXIsIF9QdXJlQ29tcG9uZW50KTtcblxuICBmdW5jdGlvbiBDb250YWluZXIoKSB7XG4gICAgdmFyIF9yZWY7XG5cbiAgICB2YXIgX3RlbXAsIF90aGlzLCBfcmV0O1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbnRhaW5lcik7XG5cbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICByZXR1cm4gX3JldCA9IChfdGVtcCA9IChfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChfcmVmID0gQ29udGFpbmVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29udGFpbmVyKSkuY2FsbC5hcHBseShfcmVmLCBbdGhpc10uY29uY2F0KGFyZ3MpKSksIF90aGlzKSwgX3RoaXMuZXZlbnRzID0gW1wicmVzaXplXCIsIFwic2Nyb2xsXCIsIFwidG91Y2hzdGFydFwiLCBcInRvdWNobW92ZVwiLCBcInRvdWNoZW5kXCIsIFwicGFnZXNob3dcIiwgXCJsb2FkXCJdLCBfdGhpcy5zdWJzY3JpYmVycyA9IFtdLCBfdGhpcy5yYWZIYW5kbGUgPSBudWxsLCBfdGhpcy5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgX3RoaXMuc3Vic2NyaWJlcnMgPSBfdGhpcy5zdWJzY3JpYmVycy5jb25jYXQoaGFuZGxlcik7XG4gICAgfSwgX3RoaXMudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgX3RoaXMuc3Vic2NyaWJlcnMgPSBfdGhpcy5zdWJzY3JpYmVycy5maWx0ZXIoZnVuY3Rpb24gKGN1cnJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQgIT09IGhhbmRsZXI7XG4gICAgICB9KTtcbiAgICB9LCBfdGhpcy5ub3RpZnlTdWJzY3JpYmVycyA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgIGlmICghX3RoaXMuZnJhbWVQZW5kaW5nKSB7XG4gICAgICAgIHZhciBjdXJyZW50VGFyZ2V0ID0gZXZ0LmN1cnJlbnRUYXJnZXQ7XG5cblxuICAgICAgICBfdGhpcy5yYWZIYW5kbGUgPSAoMCwgX3JhZjIuZGVmYXVsdCkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLmZyYW1lUGVuZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgdmFyIF90aGlzJG5vZGUkZ2V0Qm91bmRpbiA9IF90aGlzLm5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICAgIHRvcCA9IF90aGlzJG5vZGUkZ2V0Qm91bmRpbi50b3AsXG4gICAgICAgICAgICAgIGJvdHRvbSA9IF90aGlzJG5vZGUkZ2V0Qm91bmRpbi5ib3R0b207XG5cbiAgICAgICAgICBfdGhpcy5zdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlcih7XG4gICAgICAgICAgICAgIGRpc3RhbmNlRnJvbVRvcDogdG9wLFxuICAgICAgICAgICAgICBkaXN0YW5jZUZyb21Cb3R0b206IGJvdHRvbSxcbiAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IGN1cnJlbnRUYXJnZXQgPT09IHdpbmRvdyA/IGRvY3VtZW50LmJvZHkgOiBfdGhpcy5ub2RlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIF90aGlzLmZyYW1lUGVuZGluZyA9IHRydWU7XG4gICAgICB9XG4gICAgfSwgX3RoaXMuZ2V0UGFyZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLm5vZGU7XG4gICAgfSwgX3RlbXApLCBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihfdGhpcywgX3JldCk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoQ29udGFpbmVyLCBbe1xuICAgIGtleTogXCJnZXRDaGlsZENvbnRleHRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3Vic2NyaWJlOiB0aGlzLnN1YnNjcmliZSxcbiAgICAgICAgdW5zdWJzY3JpYmU6IHRoaXMudW5zdWJzY3JpYmUsXG4gICAgICAgIGdldFBhcmVudDogdGhpcy5nZXRQYXJlbnRcbiAgICAgIH07XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNvbXBvbmVudERpZE1vdW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgX3RoaXMyLm5vdGlmeVN1YnNjcmliZXJzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjb21wb25lbnRXaWxsVW5tb3VudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5yYWZIYW5kbGUpIHtcbiAgICAgICAgX3JhZjIuZGVmYXVsdC5jYW5jZWwodGhpcy5yYWZIYW5kbGUpO1xuICAgICAgICB0aGlzLnJhZkhhbmRsZSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgX3RoaXMzLm5vdGlmeVN1YnNjcmliZXJzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJyZW5kZXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICByZWY6IGZ1bmN0aW9uIHJlZihub2RlKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzNC5ub2RlID0gbm9kZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25TY3JvbGw6IHRoaXMubm90aWZ5U3Vic2NyaWJlcnMsXG4gICAgICAgIG9uVG91Y2hTdGFydDogdGhpcy5ub3RpZnlTdWJzY3JpYmVycyxcbiAgICAgICAgb25Ub3VjaE1vdmU6IHRoaXMubm90aWZ5U3Vic2NyaWJlcnMsXG4gICAgICAgIG9uVG91Y2hFbmQ6IHRoaXMubm90aWZ5U3Vic2NyaWJlcnNcbiAgICAgIH0pKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ29udGFpbmVyO1xufShfcmVhY3QuUHVyZUNvbXBvbmVudCk7XG5cbkNvbnRhaW5lci5jaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgc3Vic2NyaWJlOiBfcHJvcFR5cGVzMi5kZWZhdWx0LmZ1bmMsXG4gIHVuc3Vic2NyaWJlOiBfcHJvcFR5cGVzMi5kZWZhdWx0LmZ1bmMsXG4gIGdldFBhcmVudDogX3Byb3BUeXBlczIuZGVmYXVsdC5mdW5jXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gQ29udGFpbmVyOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9yZWFjdERvbSA9IHJlcXVpcmUoXCJyZWFjdC1kb21cIik7XG5cbnZhciBfcmVhY3REb20yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3REb20pO1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoXCJwcm9wLXR5cGVzXCIpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBTdGlja3kgPSBmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICBfaW5oZXJpdHMoU3RpY2t5LCBfQ29tcG9uZW50KTtcblxuICBmdW5jdGlvbiBTdGlja3koKSB7XG4gICAgdmFyIF9yZWY7XG5cbiAgICB2YXIgX3RlbXAsIF90aGlzLCBfcmV0O1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFN0aWNreSk7XG5cbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICByZXR1cm4gX3JldCA9IChfdGVtcCA9IChfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChfcmVmID0gU3RpY2t5Ll9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoU3RpY2t5KSkuY2FsbC5hcHBseShfcmVmLCBbdGhpc10uY29uY2F0KGFyZ3MpKSksIF90aGlzKSwgX3RoaXMuc3RhdGUgPSB7XG4gICAgICBpc1N0aWNreTogZmFsc2UsXG4gICAgICB3YXNTdGlja3k6IGZhbHNlLFxuICAgICAgc3R5bGU6IHt9XG4gICAgfSwgX3RoaXMuaGFuZGxlQ29udGFpbmVyRXZlbnQgPSBmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICAgIHZhciBkaXN0YW5jZUZyb21Ub3AgPSBfcmVmMi5kaXN0YW5jZUZyb21Ub3AsXG4gICAgICAgICAgZGlzdGFuY2VGcm9tQm90dG9tID0gX3JlZjIuZGlzdGFuY2VGcm9tQm90dG9tLFxuICAgICAgICAgIGV2ZW50U291cmNlID0gX3JlZjIuZXZlbnRTb3VyY2U7XG5cbiAgICAgIHZhciBwYXJlbnQgPSBfdGhpcy5jb250ZXh0LmdldFBhcmVudCgpO1xuXG4gICAgICB2YXIgcHJldmVudGluZ1N0aWNreVN0YXRlQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgaWYgKF90aGlzLnByb3BzLnJlbGF0aXZlKSB7XG4gICAgICAgIHByZXZlbnRpbmdTdGlja3lTdGF0ZUNoYW5nZXMgPSBldmVudFNvdXJjZSAhPT0gcGFyZW50O1xuICAgICAgICBkaXN0YW5jZUZyb21Ub3AgPSAtKGV2ZW50U291cmNlLnNjcm9sbFRvcCArIGV2ZW50U291cmNlLm9mZnNldFRvcCkgKyBfdGhpcy5wbGFjZWhvbGRlci5vZmZzZXRUb3A7XG4gICAgICB9XG5cbiAgICAgIHZhciBwbGFjZWhvbGRlckNsaWVudFJlY3QgPSBfdGhpcy5wbGFjZWhvbGRlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciBjb250ZW50Q2xpZW50UmVjdCA9IF90aGlzLmNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgY2FsY3VsYXRlZEhlaWdodCA9IGNvbnRlbnRDbGllbnRSZWN0LmhlaWdodDtcblxuICAgICAgdmFyIGJvdHRvbURpZmZlcmVuY2UgPSBkaXN0YW5jZUZyb21Cb3R0b20gLSBfdGhpcy5wcm9wcy5ib3R0b21PZmZzZXQgLSBjYWxjdWxhdGVkSGVpZ2h0O1xuXG4gICAgICB2YXIgd2FzU3RpY2t5ID0gISFfdGhpcy5zdGF0ZS5pc1N0aWNreTtcbiAgICAgIHZhciBpc1N0aWNreSA9IHByZXZlbnRpbmdTdGlja3lTdGF0ZUNoYW5nZXMgPyB3YXNTdGlja3kgOiBkaXN0YW5jZUZyb21Ub3AgPD0gLV90aGlzLnByb3BzLnRvcE9mZnNldCAmJiBkaXN0YW5jZUZyb21Cb3R0b20gPiAtX3RoaXMucHJvcHMuYm90dG9tT2Zmc2V0O1xuXG4gICAgICBkaXN0YW5jZUZyb21Cb3R0b20gPSAoX3RoaXMucHJvcHMucmVsYXRpdmUgPyBwYXJlbnQuc2Nyb2xsSGVpZ2h0IC0gcGFyZW50LnNjcm9sbFRvcCA6IGRpc3RhbmNlRnJvbUJvdHRvbSkgLSBjYWxjdWxhdGVkSGVpZ2h0O1xuXG4gICAgICB2YXIgc3R5bGUgPSAhaXNTdGlja3kgPyB7fSA6IHtcbiAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgdG9wOiBib3R0b21EaWZmZXJlbmNlID4gMCA/IF90aGlzLnByb3BzLnJlbGF0aXZlID8gcGFyZW50Lm9mZnNldFRvcCAtIHBhcmVudC5vZmZzZXRQYXJlbnQuc2Nyb2xsVG9wIDogMCA6IGJvdHRvbURpZmZlcmVuY2UsXG4gICAgICAgIGxlZnQ6IHBsYWNlaG9sZGVyQ2xpZW50UmVjdC5sZWZ0LFxuICAgICAgICB3aWR0aDogcGxhY2Vob2xkZXJDbGllbnRSZWN0LndpZHRoXG4gICAgICB9O1xuXG4gICAgICBpZiAoIV90aGlzLnByb3BzLmRpc2FibGVIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgICBzdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVooMClcIjtcbiAgICAgIH1cblxuICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1N0aWNreTogaXNTdGlja3ksXG4gICAgICAgIHdhc1N0aWNreTogd2FzU3RpY2t5LFxuICAgICAgICBkaXN0YW5jZUZyb21Ub3A6IGRpc3RhbmNlRnJvbVRvcCxcbiAgICAgICAgZGlzdGFuY2VGcm9tQm90dG9tOiBkaXN0YW5jZUZyb21Cb3R0b20sXG4gICAgICAgIGNhbGN1bGF0ZWRIZWlnaHQ6IGNhbGN1bGF0ZWRIZWlnaHQsXG4gICAgICAgIHN0eWxlOiBzdHlsZVxuICAgICAgfSk7XG4gICAgfSwgX3RlbXApLCBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihfdGhpcywgX3JldCk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoU3RpY2t5LCBbe1xuICAgIGtleTogXCJjb21wb25lbnRXaWxsTW91bnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgaWYgKCF0aGlzLmNvbnRleHQuc3Vic2NyaWJlKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgU3RpY2t5IHRvIGJlIG1vdW50ZWQgd2l0aGluIFN0aWNreUNvbnRhaW5lclwiKTtcblxuICAgICAgdGhpcy5jb250ZXh0LnN1YnNjcmliZSh0aGlzLmhhbmRsZUNvbnRhaW5lckV2ZW50KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY29tcG9uZW50V2lsbFVubW91bnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLmNvbnRleHQudW5zdWJzY3JpYmUodGhpcy5oYW5kbGVDb250YWluZXJFdmVudCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNvbXBvbmVudERpZFVwZGF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICB0aGlzLnBsYWNlaG9sZGVyLnN0eWxlLnBhZGRpbmdCb3R0b20gPSB0aGlzLnByb3BzLmRpc2FibGVDb21wZW5zYXRpb24gPyAwIDogKHRoaXMuc3RhdGUuaXNTdGlja3kgPyB0aGlzLnN0YXRlLmNhbGN1bGF0ZWRIZWlnaHQgOiAwKSArIFwicHhcIjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicmVuZGVyXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB2YXIgZWxlbWVudCA9IF9yZWFjdDIuZGVmYXVsdC5jbG9uZUVsZW1lbnQodGhpcy5wcm9wcy5jaGlsZHJlbih7XG4gICAgICAgIGlzU3RpY2t5OiB0aGlzLnN0YXRlLmlzU3RpY2t5LFxuICAgICAgICB3YXNTdGlja3k6IHRoaXMuc3RhdGUud2FzU3RpY2t5LFxuICAgICAgICBkaXN0YW5jZUZyb21Ub3A6IHRoaXMuc3RhdGUuZGlzdGFuY2VGcm9tVG9wLFxuICAgICAgICBkaXN0YW5jZUZyb21Cb3R0b206IHRoaXMuc3RhdGUuZGlzdGFuY2VGcm9tQm90dG9tLFxuICAgICAgICBjYWxjdWxhdGVkSGVpZ2h0OiB0aGlzLnN0YXRlLmNhbGN1bGF0ZWRIZWlnaHQsXG4gICAgICAgIHN0eWxlOiB0aGlzLnN0YXRlLnN0eWxlXG4gICAgICB9KSwge1xuICAgICAgICByZWY6IGZ1bmN0aW9uIHJlZihjb250ZW50KSB7XG4gICAgICAgICAgX3RoaXMyLmNvbnRlbnQgPSBfcmVhY3REb20yLmRlZmF1bHQuZmluZERPTU5vZGUoY29udGVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgcmVmOiBmdW5jdGlvbiByZWYocGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpczIucGxhY2Vob2xkZXIgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgICB9IH0pLFxuICAgICAgICBlbGVtZW50XG4gICAgICApO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTdGlja3k7XG59KF9yZWFjdC5Db21wb25lbnQpO1xuXG5TdGlja3kucHJvcFR5cGVzID0ge1xuICB0b3BPZmZzZXQ6IF9wcm9wVHlwZXMyLmRlZmF1bHQubnVtYmVyLFxuICBib3R0b21PZmZzZXQ6IF9wcm9wVHlwZXMyLmRlZmF1bHQubnVtYmVyLFxuICByZWxhdGl2ZTogX3Byb3BUeXBlczIuZGVmYXVsdC5ib29sLFxuICBjaGlsZHJlbjogX3Byb3BUeXBlczIuZGVmYXVsdC5mdW5jLmlzUmVxdWlyZWRcbn07XG5TdGlja3kuZGVmYXVsdFByb3BzID0ge1xuICByZWxhdGl2ZTogZmFsc2UsXG4gIHRvcE9mZnNldDogMCxcbiAgYm90dG9tT2Zmc2V0OiAwLFxuICBkaXNhYmxlQ29tcGVuc2F0aW9uOiBmYWxzZSxcbiAgZGlzYWJsZUhhcmR3YXJlQWNjZWxlcmF0aW9uOiBmYWxzZVxufTtcblN0aWNreS5jb250ZXh0VHlwZXMgPSB7XG4gIHN1YnNjcmliZTogX3Byb3BUeXBlczIuZGVmYXVsdC5mdW5jLFxuICB1bnN1YnNjcmliZTogX3Byb3BUeXBlczIuZGVmYXVsdC5mdW5jLFxuICBnZXRQYXJlbnQ6IF9wcm9wVHlwZXMyLmRlZmF1bHQuZnVuY1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IFN0aWNreTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuU3RpY2t5Q29udGFpbmVyID0gZXhwb3J0cy5TdGlja3kgPSB1bmRlZmluZWQ7XG5cbnZhciBfU3RpY2t5ID0gcmVxdWlyZShcIi4vU3RpY2t5XCIpO1xuXG52YXIgX1N0aWNreTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TdGlja3kpO1xuXG52YXIgX0NvbnRhaW5lciA9IHJlcXVpcmUoXCIuL0NvbnRhaW5lclwiKTtcblxudmFyIF9Db250YWluZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29udGFpbmVyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5TdGlja3kgPSBfU3RpY2t5Mi5kZWZhdWx0O1xuZXhwb3J0cy5TdGlja3lDb250YWluZXIgPSBfQ29udGFpbmVyMi5kZWZhdWx0O1xuZXhwb3J0cy5kZWZhdWx0ID0gX1N0aWNreTIuZGVmYXVsdDsiLCIvKlxuXHRCYXNlZCBvbiByZ2Jjb2xvci5qcyBieSBTdG95YW4gU3RlZmFub3YgPHNzdG9vQGdtYWlsLmNvbT5cblx0aHR0cDovL3d3dy5waHBpZWQuY29tL3JnYi1jb2xvci1wYXJzZXItaW4tamF2YXNjcmlwdC9cbiovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29sb3Jfc3RyaW5nKSB7XG4gICAgdGhpcy5vayA9IGZhbHNlO1xuICAgIHRoaXMuYWxwaGEgPSAxLjA7XG5cbiAgICAvLyBzdHJpcCBhbnkgbGVhZGluZyAjXG4gICAgaWYgKGNvbG9yX3N0cmluZy5jaGFyQXQoMCkgPT0gJyMnKSB7IC8vIHJlbW92ZSAjIGlmIGFueVxuICAgICAgICBjb2xvcl9zdHJpbmcgPSBjb2xvcl9zdHJpbmcuc3Vic3RyKDEsNik7XG4gICAgfVxuXG4gICAgY29sb3Jfc3RyaW5nID0gY29sb3Jfc3RyaW5nLnJlcGxhY2UoLyAvZywnJyk7XG4gICAgY29sb3Jfc3RyaW5nID0gY29sb3Jfc3RyaW5nLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBiZWZvcmUgZ2V0dGluZyBpbnRvIHJlZ2V4cHMsIHRyeSBzaW1wbGUgbWF0Y2hlc1xuICAgIC8vIGFuZCBvdmVyd3JpdGUgdGhlIGlucHV0XG4gICAgdmFyIHNpbXBsZV9jb2xvcnMgPSB7XG4gICAgICAgIGFsaWNlYmx1ZTogJ2YwZjhmZicsXG4gICAgICAgIGFudGlxdWV3aGl0ZTogJ2ZhZWJkNycsXG4gICAgICAgIGFxdWE6ICcwMGZmZmYnLFxuICAgICAgICBhcXVhbWFyaW5lOiAnN2ZmZmQ0JyxcbiAgICAgICAgYXp1cmU6ICdmMGZmZmYnLFxuICAgICAgICBiZWlnZTogJ2Y1ZjVkYycsXG4gICAgICAgIGJpc3F1ZTogJ2ZmZTRjNCcsXG4gICAgICAgIGJsYWNrOiAnMDAwMDAwJyxcbiAgICAgICAgYmxhbmNoZWRhbG1vbmQ6ICdmZmViY2QnLFxuICAgICAgICBibHVlOiAnMDAwMGZmJyxcbiAgICAgICAgYmx1ZXZpb2xldDogJzhhMmJlMicsXG4gICAgICAgIGJyb3duOiAnYTUyYTJhJyxcbiAgICAgICAgYnVybHl3b29kOiAnZGViODg3JyxcbiAgICAgICAgY2FkZXRibHVlOiAnNWY5ZWEwJyxcbiAgICAgICAgY2hhcnRyZXVzZTogJzdmZmYwMCcsXG4gICAgICAgIGNob2NvbGF0ZTogJ2QyNjkxZScsXG4gICAgICAgIGNvcmFsOiAnZmY3ZjUwJyxcbiAgICAgICAgY29ybmZsb3dlcmJsdWU6ICc2NDk1ZWQnLFxuICAgICAgICBjb3Juc2lsazogJ2ZmZjhkYycsXG4gICAgICAgIGNyaW1zb246ICdkYzE0M2MnLFxuICAgICAgICBjeWFuOiAnMDBmZmZmJyxcbiAgICAgICAgZGFya2JsdWU6ICcwMDAwOGInLFxuICAgICAgICBkYXJrY3lhbjogJzAwOGI4YicsXG4gICAgICAgIGRhcmtnb2xkZW5yb2Q6ICdiODg2MGInLFxuICAgICAgICBkYXJrZ3JheTogJ2E5YTlhOScsXG4gICAgICAgIGRhcmtncmVlbjogJzAwNjQwMCcsXG4gICAgICAgIGRhcmtraGFraTogJ2JkYjc2YicsXG4gICAgICAgIGRhcmttYWdlbnRhOiAnOGIwMDhiJyxcbiAgICAgICAgZGFya29saXZlZ3JlZW46ICc1NTZiMmYnLFxuICAgICAgICBkYXJrb3JhbmdlOiAnZmY4YzAwJyxcbiAgICAgICAgZGFya29yY2hpZDogJzk5MzJjYycsXG4gICAgICAgIGRhcmtyZWQ6ICc4YjAwMDAnLFxuICAgICAgICBkYXJrc2FsbW9uOiAnZTk5NjdhJyxcbiAgICAgICAgZGFya3NlYWdyZWVuOiAnOGZiYzhmJyxcbiAgICAgICAgZGFya3NsYXRlYmx1ZTogJzQ4M2Q4YicsXG4gICAgICAgIGRhcmtzbGF0ZWdyYXk6ICcyZjRmNGYnLFxuICAgICAgICBkYXJrdHVycXVvaXNlOiAnMDBjZWQxJyxcbiAgICAgICAgZGFya3Zpb2xldDogJzk0MDBkMycsXG4gICAgICAgIGRlZXBwaW5rOiAnZmYxNDkzJyxcbiAgICAgICAgZGVlcHNreWJsdWU6ICcwMGJmZmYnLFxuICAgICAgICBkaW1ncmF5OiAnNjk2OTY5JyxcbiAgICAgICAgZG9kZ2VyYmx1ZTogJzFlOTBmZicsXG4gICAgICAgIGZlbGRzcGFyOiAnZDE5Mjc1JyxcbiAgICAgICAgZmlyZWJyaWNrOiAnYjIyMjIyJyxcbiAgICAgICAgZmxvcmFsd2hpdGU6ICdmZmZhZjAnLFxuICAgICAgICBmb3Jlc3RncmVlbjogJzIyOGIyMicsXG4gICAgICAgIGZ1Y2hzaWE6ICdmZjAwZmYnLFxuICAgICAgICBnYWluc2Jvcm86ICdkY2RjZGMnLFxuICAgICAgICBnaG9zdHdoaXRlOiAnZjhmOGZmJyxcbiAgICAgICAgZ29sZDogJ2ZmZDcwMCcsXG4gICAgICAgIGdvbGRlbnJvZDogJ2RhYTUyMCcsXG4gICAgICAgIGdyYXk6ICc4MDgwODAnLFxuICAgICAgICBncmVlbjogJzAwODAwMCcsXG4gICAgICAgIGdyZWVueWVsbG93OiAnYWRmZjJmJyxcbiAgICAgICAgaG9uZXlkZXc6ICdmMGZmZjAnLFxuICAgICAgICBob3RwaW5rOiAnZmY2OWI0JyxcbiAgICAgICAgaW5kaWFucmVkIDogJ2NkNWM1YycsXG4gICAgICAgIGluZGlnbyA6ICc0YjAwODInLFxuICAgICAgICBpdm9yeTogJ2ZmZmZmMCcsXG4gICAgICAgIGtoYWtpOiAnZjBlNjhjJyxcbiAgICAgICAgbGF2ZW5kZXI6ICdlNmU2ZmEnLFxuICAgICAgICBsYXZlbmRlcmJsdXNoOiAnZmZmMGY1JyxcbiAgICAgICAgbGF3bmdyZWVuOiAnN2NmYzAwJyxcbiAgICAgICAgbGVtb25jaGlmZm9uOiAnZmZmYWNkJyxcbiAgICAgICAgbGlnaHRibHVlOiAnYWRkOGU2JyxcbiAgICAgICAgbGlnaHRjb3JhbDogJ2YwODA4MCcsXG4gICAgICAgIGxpZ2h0Y3lhbjogJ2UwZmZmZicsXG4gICAgICAgIGxpZ2h0Z29sZGVucm9keWVsbG93OiAnZmFmYWQyJyxcbiAgICAgICAgbGlnaHRncmV5OiAnZDNkM2QzJyxcbiAgICAgICAgbGlnaHRncmVlbjogJzkwZWU5MCcsXG4gICAgICAgIGxpZ2h0cGluazogJ2ZmYjZjMScsXG4gICAgICAgIGxpZ2h0c2FsbW9uOiAnZmZhMDdhJyxcbiAgICAgICAgbGlnaHRzZWFncmVlbjogJzIwYjJhYScsXG4gICAgICAgIGxpZ2h0c2t5Ymx1ZTogJzg3Y2VmYScsXG4gICAgICAgIGxpZ2h0c2xhdGVibHVlOiAnODQ3MGZmJyxcbiAgICAgICAgbGlnaHRzbGF0ZWdyYXk6ICc3Nzg4OTknLFxuICAgICAgICBsaWdodHN0ZWVsYmx1ZTogJ2IwYzRkZScsXG4gICAgICAgIGxpZ2h0eWVsbG93OiAnZmZmZmUwJyxcbiAgICAgICAgbGltZTogJzAwZmYwMCcsXG4gICAgICAgIGxpbWVncmVlbjogJzMyY2QzMicsXG4gICAgICAgIGxpbmVuOiAnZmFmMGU2JyxcbiAgICAgICAgbWFnZW50YTogJ2ZmMDBmZicsXG4gICAgICAgIG1hcm9vbjogJzgwMDAwMCcsXG4gICAgICAgIG1lZGl1bWFxdWFtYXJpbmU6ICc2NmNkYWEnLFxuICAgICAgICBtZWRpdW1ibHVlOiAnMDAwMGNkJyxcbiAgICAgICAgbWVkaXVtb3JjaGlkOiAnYmE1NWQzJyxcbiAgICAgICAgbWVkaXVtcHVycGxlOiAnOTM3MGQ4JyxcbiAgICAgICAgbWVkaXVtc2VhZ3JlZW46ICczY2IzNzEnLFxuICAgICAgICBtZWRpdW1zbGF0ZWJsdWU6ICc3YjY4ZWUnLFxuICAgICAgICBtZWRpdW1zcHJpbmdncmVlbjogJzAwZmE5YScsXG4gICAgICAgIG1lZGl1bXR1cnF1b2lzZTogJzQ4ZDFjYycsXG4gICAgICAgIG1lZGl1bXZpb2xldHJlZDogJ2M3MTU4NScsXG4gICAgICAgIG1pZG5pZ2h0Ymx1ZTogJzE5MTk3MCcsXG4gICAgICAgIG1pbnRjcmVhbTogJ2Y1ZmZmYScsXG4gICAgICAgIG1pc3R5cm9zZTogJ2ZmZTRlMScsXG4gICAgICAgIG1vY2Nhc2luOiAnZmZlNGI1JyxcbiAgICAgICAgbmF2YWpvd2hpdGU6ICdmZmRlYWQnLFxuICAgICAgICBuYXZ5OiAnMDAwMDgwJyxcbiAgICAgICAgb2xkbGFjZTogJ2ZkZjVlNicsXG4gICAgICAgIG9saXZlOiAnODA4MDAwJyxcbiAgICAgICAgb2xpdmVkcmFiOiAnNmI4ZTIzJyxcbiAgICAgICAgb3JhbmdlOiAnZmZhNTAwJyxcbiAgICAgICAgb3JhbmdlcmVkOiAnZmY0NTAwJyxcbiAgICAgICAgb3JjaGlkOiAnZGE3MGQ2JyxcbiAgICAgICAgcGFsZWdvbGRlbnJvZDogJ2VlZThhYScsXG4gICAgICAgIHBhbGVncmVlbjogJzk4ZmI5OCcsXG4gICAgICAgIHBhbGV0dXJxdW9pc2U6ICdhZmVlZWUnLFxuICAgICAgICBwYWxldmlvbGV0cmVkOiAnZDg3MDkzJyxcbiAgICAgICAgcGFwYXlhd2hpcDogJ2ZmZWZkNScsXG4gICAgICAgIHBlYWNocHVmZjogJ2ZmZGFiOScsXG4gICAgICAgIHBlcnU6ICdjZDg1M2YnLFxuICAgICAgICBwaW5rOiAnZmZjMGNiJyxcbiAgICAgICAgcGx1bTogJ2RkYTBkZCcsXG4gICAgICAgIHBvd2RlcmJsdWU6ICdiMGUwZTYnLFxuICAgICAgICBwdXJwbGU6ICc4MDAwODAnLFxuICAgICAgICByZWQ6ICdmZjAwMDAnLFxuICAgICAgICByb3N5YnJvd246ICdiYzhmOGYnLFxuICAgICAgICByb3lhbGJsdWU6ICc0MTY5ZTEnLFxuICAgICAgICBzYWRkbGVicm93bjogJzhiNDUxMycsXG4gICAgICAgIHNhbG1vbjogJ2ZhODA3MicsXG4gICAgICAgIHNhbmR5YnJvd246ICdmNGE0NjAnLFxuICAgICAgICBzZWFncmVlbjogJzJlOGI1NycsXG4gICAgICAgIHNlYXNoZWxsOiAnZmZmNWVlJyxcbiAgICAgICAgc2llbm5hOiAnYTA1MjJkJyxcbiAgICAgICAgc2lsdmVyOiAnYzBjMGMwJyxcbiAgICAgICAgc2t5Ymx1ZTogJzg3Y2VlYicsXG4gICAgICAgIHNsYXRlYmx1ZTogJzZhNWFjZCcsXG4gICAgICAgIHNsYXRlZ3JheTogJzcwODA5MCcsXG4gICAgICAgIHNub3c6ICdmZmZhZmEnLFxuICAgICAgICBzcHJpbmdncmVlbjogJzAwZmY3ZicsXG4gICAgICAgIHN0ZWVsYmx1ZTogJzQ2ODJiNCcsXG4gICAgICAgIHRhbjogJ2QyYjQ4YycsXG4gICAgICAgIHRlYWw6ICcwMDgwODAnLFxuICAgICAgICB0aGlzdGxlOiAnZDhiZmQ4JyxcbiAgICAgICAgdG9tYXRvOiAnZmY2MzQ3JyxcbiAgICAgICAgdHVycXVvaXNlOiAnNDBlMGQwJyxcbiAgICAgICAgdmlvbGV0OiAnZWU4MmVlJyxcbiAgICAgICAgdmlvbGV0cmVkOiAnZDAyMDkwJyxcbiAgICAgICAgd2hlYXQ6ICdmNWRlYjMnLFxuICAgICAgICB3aGl0ZTogJ2ZmZmZmZicsXG4gICAgICAgIHdoaXRlc21va2U6ICdmNWY1ZjUnLFxuICAgICAgICB5ZWxsb3c6ICdmZmZmMDAnLFxuICAgICAgICB5ZWxsb3dncmVlbjogJzlhY2QzMidcbiAgICB9O1xuICAgIGNvbG9yX3N0cmluZyA9IHNpbXBsZV9jb2xvcnNbY29sb3Jfc3RyaW5nXSB8fCBjb2xvcl9zdHJpbmc7XG4gICAgLy8gZW1kIG9mIHNpbXBsZSB0eXBlLWluIGNvbG9yc1xuXG4gICAgLy8gYXJyYXkgb2YgY29sb3IgZGVmaW5pdGlvbiBvYmplY3RzXG4gICAgdmFyIGNvbG9yX2RlZnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJlOiAvXnJnYmFcXCgoXFxkezEsM30pLFxccyooXFxkezEsM30pLFxccyooXFxkezEsM30pLFxccyooKD86XFxkP1xcLik/XFxkKVxcKSQvLFxuICAgICAgICAgICAgZXhhbXBsZTogWydyZ2JhKDEyMywgMjM0LCA0NSwgMC44KScsICdyZ2JhKDI1NSwyMzQsMjQ1LDEuMCknXSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChiaXRzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1syXSksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbM10pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KGJpdHNbNF0pXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcmU6IC9ecmdiXFwoKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KVxcKSQvLFxuICAgICAgICAgICAgZXhhbXBsZTogWydyZ2IoMTIzLCAyMzQsIDQ1KScsICdyZ2IoMjU1LDIzNCwyNDUpJ10sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYml0cyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1sxXSksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbMl0pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzNdKVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJlOiAvXihcXHd7Mn0pKFxcd3syfSkoXFx3ezJ9KSQvLFxuICAgICAgICAgICAgZXhhbXBsZTogWycjMDBmZjAwJywgJzMzNjY5OSddLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGJpdHMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbMV0sIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1syXSwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzNdLCAxNilcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICByZTogL14oXFx3ezF9KShcXHd7MX0pKFxcd3sxfSkkLyxcbiAgICAgICAgICAgIGV4YW1wbGU6IFsnI2ZiMCcsICdmMGYnXSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChiaXRzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzFdICsgYml0c1sxXSwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzJdICsgYml0c1syXSwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzNdICsgYml0c1szXSwgMTYpXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIF07XG5cbiAgICAvLyBzZWFyY2ggdGhyb3VnaCB0aGUgZGVmaW5pdGlvbnMgdG8gZmluZCBhIG1hdGNoXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xvcl9kZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZSA9IGNvbG9yX2RlZnNbaV0ucmU7XG4gICAgICAgIHZhciBwcm9jZXNzb3IgPSBjb2xvcl9kZWZzW2ldLnByb2Nlc3M7XG4gICAgICAgIHZhciBiaXRzID0gcmUuZXhlYyhjb2xvcl9zdHJpbmcpO1xuICAgICAgICBpZiAoYml0cykge1xuICAgICAgICAgICAgdmFyIGNoYW5uZWxzID0gcHJvY2Vzc29yKGJpdHMpO1xuICAgICAgICAgICAgdGhpcy5yID0gY2hhbm5lbHNbMF07XG4gICAgICAgICAgICB0aGlzLmcgPSBjaGFubmVsc1sxXTtcbiAgICAgICAgICAgIHRoaXMuYiA9IGNoYW5uZWxzWzJdO1xuICAgICAgICAgICAgaWYgKGNoYW5uZWxzLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFscGhhID0gY2hhbm5lbHNbM107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9rID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gdmFsaWRhdGUvY2xlYW51cCB2YWx1ZXNcbiAgICB0aGlzLnIgPSAodGhpcy5yIDwgMCB8fCBpc05hTih0aGlzLnIpKSA/IDAgOiAoKHRoaXMuciA+IDI1NSkgPyAyNTUgOiB0aGlzLnIpO1xuICAgIHRoaXMuZyA9ICh0aGlzLmcgPCAwIHx8IGlzTmFOKHRoaXMuZykpID8gMCA6ICgodGhpcy5nID4gMjU1KSA/IDI1NSA6IHRoaXMuZyk7XG4gICAgdGhpcy5iID0gKHRoaXMuYiA8IDAgfHwgaXNOYU4odGhpcy5iKSkgPyAwIDogKCh0aGlzLmIgPiAyNTUpID8gMjU1IDogdGhpcy5iKTtcbiAgICB0aGlzLmFscGhhID0gKHRoaXMuYWxwaGEgPCAwKSA/IDAgOiAoKHRoaXMuYWxwaGEgPiAxLjAgfHwgaXNOYU4odGhpcy5hbHBoYSkpID8gMS4wIDogdGhpcy5hbHBoYSk7XG5cbiAgICAvLyBzb21lIGdldHRlcnNcbiAgICB0aGlzLnRvUkdCID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ3JnYignICsgdGhpcy5yICsgJywgJyArIHRoaXMuZyArICcsICcgKyB0aGlzLmIgKyAnKSc7XG4gICAgfVxuICAgIHRoaXMudG9SR0JBID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ3JnYmEoJyArIHRoaXMuciArICcsICcgKyB0aGlzLmcgKyAnLCAnICsgdGhpcy5iICsgJywgJyArIHRoaXMuYWxwaGEgKyAnKSc7XG4gICAgfVxuICAgIHRoaXMudG9IZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5yLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgdmFyIGcgPSB0aGlzLmcudG9TdHJpbmcoMTYpO1xuICAgICAgICB2YXIgYiA9IHRoaXMuYi50b1N0cmluZygxNik7XG4gICAgICAgIGlmIChyLmxlbmd0aCA9PSAxKSByID0gJzAnICsgcjtcbiAgICAgICAgaWYgKGcubGVuZ3RoID09IDEpIGcgPSAnMCcgKyBnO1xuICAgICAgICBpZiAoYi5sZW5ndGggPT0gMSkgYiA9ICcwJyArIGI7XG4gICAgICAgIHJldHVybiAnIycgKyByICsgZyArIGI7XG4gICAgfVxuXG4gICAgLy8gaGVscFxuICAgIHRoaXMuZ2V0SGVscFhNTCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgZXhhbXBsZXMgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgLy8gYWRkIHJlZ2V4cHNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xvcl9kZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZXhhbXBsZSA9IGNvbG9yX2RlZnNbaV0uZXhhbXBsZTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZXhhbXBsZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGV4YW1wbGVzW2V4YW1wbGVzLmxlbmd0aF0gPSBleGFtcGxlW2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCB0eXBlLWluIGNvbG9yc1xuICAgICAgICBmb3IgKHZhciBzYyBpbiBzaW1wbGVfY29sb3JzKSB7XG4gICAgICAgICAgICBleGFtcGxlc1tleGFtcGxlcy5sZW5ndGhdID0gc2M7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgeG1sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgeG1sLnNldEF0dHJpYnV0ZSgnaWQnLCAncmdiY29sb3ItZXhhbXBsZXMnKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBleGFtcGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdF9pdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdF9jb2xvciA9IG5ldyBSR0JDb2xvcihleGFtcGxlc1tpXSk7XG4gICAgICAgICAgICAgICAgdmFyIGV4YW1wbGVfZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZXhhbXBsZV9kaXYuc3R5bGUuY3NzVGV4dCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAnbWFyZ2luOiAzcHg7ICdcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJ2JvcmRlcjogMXB4IHNvbGlkIGJsYWNrOyAnXG4gICAgICAgICAgICAgICAgICAgICAgICArICdiYWNrZ3JvdW5kOicgKyBsaXN0X2NvbG9yLnRvSGV4KCkgKyAnOyAnXG4gICAgICAgICAgICAgICAgICAgICAgICArICdjb2xvcjonICsgbGlzdF9jb2xvci50b0hleCgpXG4gICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIGV4YW1wbGVfZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCd0ZXN0JykpO1xuICAgICAgICAgICAgICAgIHZhciBsaXN0X2l0ZW1fdmFsdWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcbiAgICAgICAgICAgICAgICAgICAgJyAnICsgZXhhbXBsZXNbaV0gKyAnIC0+ICcgKyBsaXN0X2NvbG9yLnRvUkdCKCkgKyAnIC0+ICcgKyBsaXN0X2NvbG9yLnRvSGV4KClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGxpc3RfaXRlbS5hcHBlbmRDaGlsZChleGFtcGxlX2Rpdik7XG4gICAgICAgICAgICAgICAgbGlzdF9pdGVtLmFwcGVuZENoaWxkKGxpc3RfaXRlbV92YWx1ZSk7XG4gICAgICAgICAgICAgICAgeG1sLmFwcGVuZENoaWxkKGxpc3RfaXRlbSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4bWw7XG5cbiAgICB9XG5cbn1cbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZSgvWyEnKCkqXS9nLCBmdW5jdGlvbiAoYykge1xuXHRcdHJldHVybiAnJScgKyBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdH0pO1xufTtcbiIsInZhciBnO1xuXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxuZyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXM7XG59KSgpO1xuXG50cnkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcblx0ZyA9IGcgfHwgbmV3IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcbn0gY2F0Y2ggKGUpIHtcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpIGcgPSB3aW5kb3c7XG59XG5cbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XG5cbm1vZHVsZS5leHBvcnRzID0gZztcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdGlmICghbW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xuXHRcdG1vZHVsZS5wYXRocyA9IFtdO1xuXHRcdC8vIG1vZHVsZS5wYXJlbnQgPSB1bmRlZmluZWQgYnkgZGVmYXVsdFxuXHRcdGlmICghbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImxvYWRlZFwiLCB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5sO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwiaWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUuaTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcblx0fVxuXHRyZXR1cm4gbW9kdWxlO1xufTtcbiIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdmlld0NsYXNzZXMgPSBbXG4gICAgICAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQ2NEFycmF5XSdcbiAgICBdXG5cbiAgICB2YXIgaXNEYXRhVmlldyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiBEYXRhVmlldy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihvYmopXG4gICAgfVxuXG4gICAgdmFyIGlzQXJyYXlCdWZmZXJWaWV3ID0gQXJyYXlCdWZmZXIuaXNWaWV3IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB2aWV3Q2xhc3Nlcy5pbmRleE9mKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSA+IC0xXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaGVhZGVycykpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQoaGVhZGVyWzBdLCBoZWFkZXJbMV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMubWFwW25hbWVdXG4gICAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlKycsJyt2YWx1ZSA6IHZhbHVlXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXMubWFwW25hbWVdLCBuYW1lLCB0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRBcnJheUJ1ZmZlckFzVGV4dChidWYpIHtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXJzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3W2ldKVxuICAgIH1cbiAgICByZXR1cm4gY2hhcnMuam9pbignJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICAgIGlmIChidWYuc2xpY2UpIHtcbiAgICAgIHJldHVybiBidWYuc2xpY2UoMClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYuYnl0ZUxlbmd0aClcbiAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZikpXG4gICAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcilcbiAgICAgICAgLy8gSUUgMTAtMTEgY2FuJ3QgaGFuZGxlIGEgRGF0YVZpZXcgYm9keS5cbiAgICAgICAgdGhpcy5fYm9keUluaXQgPSBuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKSlcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3VtZWQodGhpcykgfHwgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlYWRBcnJheUJ1ZmZlckFzVGV4dCh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcblxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkgJiYgaW5wdXQuX2JvZHlJbml0ICE9IG51bGwpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBTdHJpbmcoaW5wdXQpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMsIHsgYm9keTogdGhpcy5fYm9keUluaXQgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgICB2YXIgaGVhZGVycyA9IG5ldyBIZWFkZXJzKClcbiAgICByYXdIZWFkZXJzLnNwbGl0KC9cXHI/XFxuLykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBwYXJ0cy5zaGlmdCgpLnRyaW0oKVxuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gaGVhZGVyc1xuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9ICdzdGF0dXMnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1cyA6IDIwMFxuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSAnc3RhdHVzVGV4dCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzVGV4dCA6ICdPSydcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLnVybCA9ICdyZXNwb25zZVVSTCcgaW4geGhyID8geGhyLnJlc3BvbnNlVVJMIDogb3B0aW9ucy5oZWFkZXJzLmdldCgnWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuQmxvY2tseVZlcnNpb24gPSBleHBvcnRzLk5PVElGSUNBVElPTl9BTEVSVF9UWVBFID0gZXhwb3J0cy5QUk9GQU5JVFlfRk9VTkQgPSBleHBvcnRzLlRPT0xCT1hfRURJVF9NT0RFID0gZXhwb3J0cy5CQVNFX0RJQUxPR19XSURUSCA9IGV4cG9ydHMuRVhQT19TRVNTSU9OX1NFQ1JFVCA9IGV4cG9ydHMuQ0lQSEVSID0gZXhwb3J0cy5BTFBIQUJFVCA9IGV4cG9ydHMuU1ZHX05TID0gZXhwb3J0cy5Qb3NpdGlvbiA9IGV4cG9ydHMuS2V5Q29kZXMgPSBleHBvcnRzLkhhcnZlc3RlclRlcm1pbmF0aW9uVmFsdWUgPSBleHBvcnRzLkJlZVRlcm1pbmF0aW9uVmFsdWUgPSBleHBvcnRzLlRlc3RSZXN1bHRzID0gZXhwb3J0cy5SZXN1bHRUeXBlID0gdm9pZCAwO1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29uc3RhbnRzIHVzZWQgaW4gcHJvZHVjdGlvbiBjb2RlIGFuZCB0ZXN0cy5cbiAqL1xuXG4vKipcbiAqIEVudW1lcmF0aW9uIG9mIHVzZXIgcHJvZ3JhbSBleGVjdXRpb24gb3V0Y29tZXMuXG4gKiBUaGVzZSBhcmUgZGV0ZXJtaW5lZCBieSBlYWNoIGFwcC5cbiAqL1xudmFyIFJlc3VsdFR5cGUgPSB7XG4gIFVOU0VUOiAwLFxuICAvLyBUaGUgcmVzdWx0IGhhcyBub3QgeWV0IGJlZW4gY29tcHV0ZWQuXG4gIFNVQ0NFU1M6IDEsXG4gIC8vIFRoZSBwcm9ncmFtIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHksIGFjaGlldmluZyB0aGUgZ29hbC5cbiAgRkFJTFVSRTogLTEsXG4gIC8vIFRoZSBwcm9ncmFtIHJhbiB3aXRob3V0IGVycm9yIGJ1dCBkaWQgbm90IGFjaGlldmUgZ29hbC5cbiAgVElNRU9VVDogMixcbiAgLy8gVGhlIHByb2dyYW0gZGlkIG5vdCBjb21wbGV0ZSAobGlrZWx5IGluZmluaXRlIGxvb3ApLlxuICBFUlJPUjogLTIgLy8gVGhlIHByb2dyYW0gZ2VuZXJhdGVkIGFuIGVycm9yLlxuXG59O1xuLyoqXG4gKiBAdHlwZWRlZiB7bnVtYmVyfSBUZXN0UmVzdWx0XG4gKi9cblxuLyoqXG4gKiBFbnVtZXJhdGlvbiBvZiB0ZXN0IHJlc3VsdHMuXG4gKiBFTVBUWV9CTE9DS19GQUlMIGFuZCBFTVBUWV9GVU5DVElPTl9CTE9DS19GQUlMIGNhbiBvbmx5IG9jY3VyIGlmXG4gKiBTdHVkaW9BcHAuY2hlY2tGb3JFbXB0eUJsb2Nrc18gaXMgdHJ1ZS5cbiAqIEEgbnVtYmVyIG9mIHRoZXNlIHJlc3VsdHMgYXJlIGVudW1lcmF0ZWQgb24gdGhlIGRhc2hib2FyZCBzaWRlIGluXG4gKiBhY3Rpdml0eV9jb25zdGFudHMucmIsIGFuZCBpdCdzIGltcG9ydGFudCB0aGF0IHRoZXNlIHR3byBmaWxlcyBhcmUga2VwdCBpblxuICogc3luYy5cbiAqIE5PVEU6IFdlIHN0b3JlIHRoZSByZXN1bHRzIGZvciB1c2VyIGF0dGVtcHRzIGluIG91ciBkYiwgc28gY2hhbmdpbmcgdGhlc2VcbiAqIHZhbHVlcyB3b3VsZCBuZWNlc3NpdGF0ZSBhIG1pZ3JhdGlvblxuICpcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblxuZXhwb3J0cy5SZXN1bHRUeXBlID0gUmVzdWx0VHlwZTtcbnZhciBUZXN0UmVzdWx0cyA9IHtcbiAgLy8gRGVmYXVsdCB2YWx1ZSBiZWZvcmUgYW55IHRlc3RzIGFyZSBydW4uXG4gIE5PX1RFU1RTX1JVTjogLTEsXG4gIC8vIFRoZSBsZXZlbCB3YXMgbm90IHNvbHZlZC5cbiAgR0VORVJJQ19GQUlMOiAwLFxuICAvLyBVc2VkIGJ5IERTTCBkZWZpbmVkIGxldmVscy5cbiAgRU1QVFlfQkxPQ0tfRkFJTDogMSxcbiAgLy8gQW4gXCJpZlwiIG9yIFwicmVwZWF0XCIgYmxvY2sgd2FzIGVtcHR5LlxuICBUT09fRkVXX0JMT0NLU19GQUlMOiAyLFxuICAvLyBGZXdlciB0aGFuIHRoZSBpZGVhbCBudW1iZXIgb2YgYmxvY2tzIHVzZWQuXG4gIExFVkVMX0lOQ09NUExFVEVfRkFJTDogMyxcbiAgLy8gRGVmYXVsdCBmYWlsdXJlIHRvIGNvbXBsZXRlIGEgbGV2ZWwuXG4gIE1JU1NJTkdfQkxPQ0tfVU5GSU5JU0hFRDogNCxcbiAgLy8gQSByZXF1aXJlZCBibG9jayB3YXMgbm90IHVzZWQuXG4gIEVYVFJBX1RPUF9CTE9DS1NfRkFJTDogNSxcbiAgLy8gVGhlcmUgd2FzIG1vcmUgdGhhbiBvbmUgdG9wLWxldmVsIGJsb2NrLlxuICBSVU5USU1FX0VSUk9SX0ZBSUw6IDYsXG4gIC8vIFRoZXJlIHdhcyBhIHJ1bnRpbWUgZXJyb3IgaW4gdGhlIHByb2dyYW0uXG4gIFNZTlRBWF9FUlJPUl9GQUlMOiA3LFxuICAvLyBUaGVyZSB3YXMgYSBzeW50YXggZXJyb3IgaW4gdGhlIHByb2dyYW0uXG4gIE1JU1NJTkdfQkxPQ0tfRklOSVNIRUQ6IDEwLFxuICAvLyBUaGUgbGV2ZWwgd2FzIHNvbHZlZCB3aXRob3V0IHJlcXVpcmVkIGJsb2NrLlxuICBBUFBfU1BFQ0lGSUNfRkFJTDogMTEsXG4gIC8vIEFwcGxpY2F0aW9uLXNwZWNpZmljIGZhaWx1cmUuXG4gIEVNUFRZX0ZVTkNUSU9OX0JMT0NLX0ZBSUw6IDEyLFxuICAvLyBBIFwiZnVuY3Rpb25cIiBibG9jayB3YXMgZW1wdHlcbiAgVU5VU0VEX1BBUkFNOiAxMyxcbiAgLy8gUGFyYW0gZGVjbGFyZWQgYnV0IG5vdCB1c2VkIGluIGZ1bmN0aW9uLlxuICBVTlVTRURfRlVOQ1RJT046IDE0LFxuICAvLyBGdW5jdGlvbiBkZWNsYXJlZCBidXQgbm90IHVzZWQgaW4gd29ya3NwYWNlLlxuICBQQVJBTV9JTlBVVF9VTkFUVEFDSEVEOiAxNSxcbiAgLy8gRnVuY3Rpb24gbm90IGNhbGxlZCB3aXRoIGVub3VnaCBwYXJhbXMuXG4gIElOQ09NUExFVEVfQkxPQ0tfSU5fRlVOQ1RJT046IDE2LFxuICAvLyBJbmNvbXBsZXRlIGJsb2NrIGluc2lkZSBhIGZ1bmN0aW9uLlxuICBRVUVTVElPTl9NQVJLU19JTl9OVU1CRVJfRklFTEQ6IDE3LFxuICAvLyBCbG9jayBoYXMgPz8/IGluc3RlYWQgb2YgYSB2YWx1ZS5cbiAgRU1QVFlfRlVOQ1RJT05BTF9CTE9DSzogMTgsXG4gIC8vIFRoZXJlJ3MgYSBmdW5jdGlvbmFsIGJsb2NrIHdpdGggYW4gb3BlbiBpbnB1dFxuICBFWEFNUExFX0ZBSUxFRDogMTksXG4gIC8vIE9uZSBvZiBvdXIgZXhhbXBsZXMgZGlkbid0IG1hdGNoIHRoZSBkZWZpbml0aW9uXG4gIC8vIHN0YXJ0IHVzaW5nIG5lZ2F0aXZlIHZhbHVlcywgc2luY2Ugd2UgY29uc2lkZXIgPj0gMjAgdG8gYmUgXCJzb2x2ZWRcIlxuICBORVNURURfRk9SX1NBTUVfVkFSSUFCTEU6IC0yLFxuICAvLyBXZSBoYXZlIG5lc3RlZCBmb3IgbG9vcHMgZWFjaCB1c2luZyB0aGUgc2FtZSBjb3VudGVyIHZhcmlhYmxlXG4gIC8vIE5PVEU6IGZvciBzbW9lIHBlcmlvZCBvZiB0aW1lLCB0aGlzIHdhcyAtMSBhbmQgY29uZmxpY3RlZCB3aXRoIE5PX1RFU1RTX1JVTlxuICBFTVBUWV9GVU5DVElPTl9OQU1FOiAtMyxcbiAgLy8gV2UgaGF2ZSBhIHZhcmlhYmxlIG9yIGZ1bmN0aW9uIHdpdGggdGhlIG5hbWUgXCJcIlxuICBNSVNTSU5HX1JFQ09NTUVOREVEX0JMT0NLX1VORklOSVNIRUQ6IC00LFxuICAvLyBUaGUgbGV2ZWwgd2FzIGF0dGVtcHRlZCBidXQgbm90IHNvbHZlZCB3aXRob3V0IGEgcmVjb21tZW5kZWQgYmxvY2tcbiAgRVhUUkFfRlVOQ1RJT05fRkFJTDogLTUsXG4gIC8vIFRoZSBwcm9ncmFtIGNvbnRhaW5zIGEgSmF2YVNjcmlwdCBmdW5jdGlvbiB3aGVuIGl0IHNob3VsZCBub3RcbiAgTE9DQUxfRlVOQ1RJT05fRkFJTDogLTYsXG4gIC8vIFRoZSBwcm9ncmFtIGNvbnRhaW5zIGFuIHVuZXhwZWN0ZWQgSmF2YVNjcmlwdCBsb2NhbCBmdW5jdGlvblxuICBHRU5FUklDX0xJTlRfRkFJTDogLTcsXG4gIC8vIFRoZSBwcm9ncmFtIGNvbnRhaW5zIGEgbGludCBlcnJvclxuICBMT0dfQ09ORElUSU9OX0ZBSUw6IC04LFxuICAvLyBUaGUgcHJvZ3JhbSBleGVjdXRpb24gbG9nIGRpZCBub3QgcGFzcyBhIHJlcXVpcmVkIGNvbmRpdGlvblxuICBCTE9DS19MSU1JVF9GQUlMOiAtOSxcbiAgLy8gUHV6emxlIHdhcyBzb2x2ZWQgdXNpbmcgbW9yZSB0aGFuIHRoZSB0b29sYm94IGxpbWl0IG9mIGEgYmxvY2tcbiAgRlJFRV9QTEFZX1VOQ0hBTkdFRF9GQUlMOiAtMTAsXG4gIC8vIFRoZSBjb2RlIHdhcyBub3QgY2hhbmdlZCB3aGVuIHRoZSBmaW5pc2ggYnV0dG9uIHdhcyBjbGlja2VkXG4gIC8vIENvZGVzIGZvciB1bnZhbGlkYXRlZCBsZXZlbHMuXG4gIFVOU1VCTUlUVEVEX0FUVEVNUFQ6IC01MCxcbiAgLy8gUHJvZ3Jlc3Mgd2FzIHNhdmVkIHdpdGhvdXQgc3VibWl0dGluZyBmb3IgcmV2aWV3LCBvciB3YXMgdW5zdWJtaXR0ZWQuXG4gIFNLSVBQRUQ6IC0xMDAsXG4gIC8vIFNraXBwZWQsIGUuZy4gdGhleSB1c2VkIHRoZSBza2lwIGJ1dHRvbiBvbiBhIGNoYWxsZW5nZSBsZXZlbFxuICAvLyBUaGUgdGVhY2hlciBoYXMgdHJpZ2dlcmVkIGEgcmVzZXQgb2YgcHJvZ3Jlc3MgdGhyb3VnaCBsZWF2aW5nIFwiS2VlcCB3b3JraW5nXCIgZmVlZGJhY2suXG4gIC8vIFRFQUNIRVJfRkVFREJBQ0tfS0VFUF9XT1JLSU5HIGlzIG9ubHkgc2V0IGJ5IHRoZSBiYWNrLWVuZFxuICBURUFDSEVSX0ZFRURCQUNLX0tFRVBfV09SS0lORzogLTExMCxcbiAgTEVWRUxfU1RBUlRFRDogLTE1MCxcbiAgLy8gVGhlIHVzZXIgaGFzIHRyaWdnZXJlZCB0aGUgcmVzZXQgYWN0aW9uIGF0IGxlYXN0IG9uY2UgKGV4OiBieSBjbGlja2luZyB0aGUgcmVzZXQgYnV0dG9uKVxuICAvLyBOdW1iZXJzIGJlbG93IDIwIGFyZSBnZW5lcmFsbHkgY29uc2lkZXJlZCBzb21lIGZvcm0gb2YgZmFpbHVyZS5cbiAgLy8gTnVtYmVycyA+PSAyMCBnZW5lcmFsbHkgaW5kaWNhdGUgc29tZSBmb3JtIG9mIHN1Y2Nlc3MgKGFsdGhvdWdoIGFnYWluIHRoZXJlXG4gIC8vIGFyZSB2YWx1ZXMgbGlrZSBSRVZJRVdfUkVKRUNURURfUkVTVUxUIHRoYXQgZG9uJ3Qgc2VlbSB0byBxdWl0ZSBtZWV0IHRoYXQgcmVzdHJpY3Rpb24uXG4gIE1JTklNVU1fUEFTU19SRVNVTFQ6IDIwLFxuICAvLyBUaGUgbGV2ZWwgd2FzIHNvbHZlZCBpbiBhIG5vbi1vcHRpbWFsIHdheS4gIFVzZXIgbWF5IGFkdmFuY2Ugb3IgcmV0cnkuXG4gIFRPT19NQU5ZX0JMT0NLU19GQUlMOiAyMCxcbiAgLy8gTW9yZSB0aGFuIHRoZSBpZGVhbCBudW1iZXIgb2YgYmxvY2tzIHdlcmUgdXNlZC5cbiAgQVBQX1NQRUNJRklDX0FDQ0VQVEFCTEVfRkFJTDogMjEsXG4gIC8vIEFwcGxpY2F0aW9uLXNwZWNpZmljIGFjY2VwdGFibGUgZmFpbHVyZS5cbiAgTUlTU0lOR19SRUNPTU1FTkRFRF9CTE9DS19GSU5JU0hFRDogMjIsXG4gIC8vIFRoZSBsZXZlbCB3YXMgc29sdmVkIHdpdGhvdXQgYSByZWNvbW1lbmRlZCBibG9ja1xuICAvLyBOdW1iZXJzID49IDMwLCBhcmUgY29uc2lkZXJlZCB0byBiZSBcInBlcmZlY3RseVwiIHNvbHZlZCwgaS5lLiB0aG9zZSBpbiB0aGUgcmFuZ2VcbiAgLy8gb2YgMjAtMzAgaGF2ZSBjb3JyZWN0IGJ1dCBub3Qgb3B0aW1hbCBzb2x1dGlvbnNcbiAgTUlOSU1VTV9PUFRJTUFMX1JFU1VMVDogMzAsXG4gIC8vIFRoZSBsZXZlbCB3YXMgc29sdmVkIGluIGFuIG9wdGltYWwgd2F5LlxuICBGUkVFX1BMQVk6IDMwLFxuICAvLyBUaGUgdXNlciBpcyBpbiBmcmVlLXBsYXkgbW9kZS5cbiAgUEFTU19XSVRIX0VYVFJBX1RPUF9CTE9DS1M6IDMxLFxuICAvLyBUaGVyZSB3YXMgbW9yZSB0aGFuIG9uZSB0b3AtbGV2ZWwgYmxvY2suXG4gIEFQUF9TUEVDSUZJQ19JTVBFUkZFQ1RfUEFTUzogMzIsXG4gIC8vIFRoZSBsZXZlbCB3YXMgcGFzc2VkIGluIHNvbWUgb3B0aW1hbCBidXQgbm90IG5lY2Vzc2FyaWx5IHBlcmZlY3Qgd2F5XG4gIEVESVRfQkxPQ0tTOiA3MCxcbiAgLy8gVGhlIHVzZXIgaXMgY3JlYXRpbmcvZWRpdGluZyBhIG5ldyBsZXZlbC5cbiAgTUFOVUFMX1BBU1M6IDkwLFxuICAvLyBUaGUgbGV2ZWwgd2FzIG1hbnVhbGx5IHNldCBhcyBwZXJmZWN0ZWQgaW50ZXJuYWxseS5cbiAgLy8gVGhlIGxldmVsIHdhcyBzb2x2ZWQgaW4gdGhlIGlkZWFsIG1hbm5lci5cbiAgQUxMX1BBU1M6IDEwMCxcbiAgLy8gQ29udGFpbmVkIGxldmVsIHJlc3VsdC4gTm90IHZhbGlkYXRlZCwgYnV0IHNob3VsZCBiZSB0cmVhdGVkIGFzIGEgc3VjY2Vzc1xuICBDT05UQUlORURfTEVWRUxfUkVTVUxUOiAxMDEsXG4gIC8vIFRoZSBsZXZlbCB3YXMgc29sdmVkIHdpdGggZmV3ZXIgYmxvY2tzIHRoYW4gdGhlIHJlY29tbWVuZGVkIG51bWJlciBvZiBibG9ja3MuXG4gIEJFVFRFUl9USEFOX0lERUFMOiAxMDIsXG4gIFNVQk1JVFRFRF9SRVNVTFQ6IDEwMDAsXG4gIFJFVklFV19SRUpFQ1RFRF9SRVNVTFQ6IDE1MDAsXG4gIFJFVklFV19BQ0NFUFRFRF9SRVNVTFQ6IDIwMDBcbn07XG5leHBvcnRzLlRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHM7XG52YXIgQmVlVGVybWluYXRpb25WYWx1ZSA9IHtcbiAgRkFJTFVSRTogZmFsc2UsXG4gIFNVQ0NFU1M6IHRydWUsXG4gIElORklOSVRFX0xPT1A6IEluZmluaXR5LFxuICBOT1RfQVRfRkxPV0VSOiAxLFxuICAvLyBUcmllZCB0byBnZXQgbmVjdGFyIHdoZW4gbm90IGF0IGZsb3dlci5cbiAgRkxPV0VSX0VNUFRZOiAyLFxuICAvLyBUcmllZCB0byBnZXQgbmVjdGFyIHdoZW4gZmxvd2VyIGVtcHR5LlxuICBOT1RfQVRfSE9ORVlDT01COiAzLFxuICAvLyBUcmllZCB0byBtYWtlIGhvbmV5IHdoZW4gbm90IGF0IGhvbmV5Y29tYi5cbiAgSE9ORVlDT01CX0ZVTEw6IDQsXG4gIC8vIFRyaWVkIHRvIG1ha2UgaG9uZXksIGJ1dCBubyByb29tIGF0IGhvbmV5Y29tYi5cbiAgVU5DSEVDS0VEX0NMT1VEOiA1LFxuICAvLyBGaW5pc2hlZCBwdXp6bGUsIGJ1dCBkaWRuJ3QgY2hlY2sgZXZlcnkgY2xvdWRlZCBpdGVtXG4gIFVOQ0hFQ0tFRF9QVVJQTEU6IDYsXG4gIC8vIEZpbmlzaGVkIHB1enpsZSwgYnV0IGRpZG4ndCBjaGVjayBldmVyeSBwdXJwbGUgZmxvd2VyXG4gIElOU1VGRklDSUVOVF9ORUNUQVI6IDcsXG4gIC8vIERpZG4ndCBjb2xsZWN0IGFsbCBuZWN0YXIgYnkgZmluaXNoXG4gIElOU1VGRklDSUVOVF9IT05FWTogOCxcbiAgLy8gRGlkbid0IG1ha2UgYWxsIGhvbmV5IGJ5IGZpbmlzaFxuICBESURfTk9UX0NPTExFQ1RfRVZFUllUSElORzogOSAvLyBGb3IgcXVhbnR1bSBsZXZlbHMsIGRpZG4ndCB0cnkgdG8gY29sbGVjdCBhbGwgYXZhaWxhYmxlIGhvbmV5L25lY3RhclxuXG59O1xuZXhwb3J0cy5CZWVUZXJtaW5hdGlvblZhbHVlID0gQmVlVGVybWluYXRpb25WYWx1ZTtcbnZhciBIYXJ2ZXN0ZXJUZXJtaW5hdGlvblZhbHVlID0ge1xuICBXUk9OR19DUk9QOiAxLFxuICBFTVBUWV9DUk9QOiAyLFxuICBESURfTk9UX0NPTExFQ1RfRVZFUllUSElORzogM1xufTtcbmV4cG9ydHMuSGFydmVzdGVyVGVybWluYXRpb25WYWx1ZSA9IEhhcnZlc3RlclRlcm1pbmF0aW9uVmFsdWU7XG52YXIgS2V5Q29kZXMgPSB7XG4gIEJBQ0tTUEFDRTogOCxcbiAgRU5URVI6IDEzLFxuICBTUEFDRTogMzIsXG4gIExFRlQ6IDM3LFxuICBVUDogMzgsXG4gIFJJR0hUOiAzOSxcbiAgRE9XTjogNDAsXG4gIENPUFk6IDY3LFxuICBQQVNURTogODYsXG4gIERFTEVURTogMTI3XG59O1xuZXhwb3J0cy5LZXlDb2RlcyA9IEtleUNvZGVzO1xudmFyIFBvc2l0aW9uID0ge1xuICBPVVRUT1BPVVRMRUZUOiAxLFxuICBPVVRUT1BMRUZUOiAyLFxuICBPVVRUT1BDRU5URVI6IDMsXG4gIE9VVFRPUFJJR0hUOiA0LFxuICBPVVRUT1BPVVRSSUdIVDogNSxcbiAgVE9QT1VUTEVGVDogNixcbiAgVE9QTEVGVDogNyxcbiAgVE9QQ0VOVEVSOiA4LFxuICBUT1BSSUdIVDogOSxcbiAgVE9QT1VUUklHSFQ6IDEwLFxuICBNSURETEVPVVRMRUZUOiAxMSxcbiAgTUlERExFTEVGVDogMTIsXG4gIE1JRERMRUNFTlRFUjogMTMsXG4gIE1JRERMRVJJR0hUOiAxNCxcbiAgTUlERExFT1VUUklHSFQ6IDE1LFxuICBCT1RUT01PVVRMRUZUOiAxNixcbiAgQk9UVE9NTEVGVDogMTcsXG4gIEJPVFRPTUNFTlRFUjogMTgsXG4gIEJPVFRPTVJJR0hUOiAxOSxcbiAgQk9UVE9NT1VUUklHSFQ6IDIwLFxuICBPVVRCT1RUT01PVVRMRUZUOiAyMSxcbiAgT1VUQk9UVE9NTEVGVDogMjIsXG4gIE9VVEJPVFRPTUNFTlRFUjogMjMsXG4gIE9VVEJPVFRPTVJJR0hUOiAyNCxcbiAgT1VUQk9UVE9NT1VUUklHSFQ6IDI1XG59O1xuLyoqIEBjb25zdCB7c3RyaW5nfSBTVkcgZWxlbWVudCBuYW1lc3BhY2UgKi9cblxuZXhwb3J0cy5Qb3NpdGlvbiA9IFBvc2l0aW9uO1xudmFyIFNWR19OUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5leHBvcnRzLlNWR19OUyA9IFNWR19OUztcbnZhciBBTFBIQUJFVCA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMDEyMzQ1Njc4OSc7XG5leHBvcnRzLkFMUEhBQkVUID0gQUxQSEFCRVQ7XG52YXIgQ0lQSEVSID0gJ0lxNjFGOGtpYVVIUEdjc1k3RGdYNHlBdTNMd3RXaG5DbWVSNXBWckpvS2ZRWk14MEJTZGxPakV2MlRiTjl6JztcbmV4cG9ydHMuQ0lQSEVSID0gQ0lQSEVSO1xudmFyIEVYUE9fU0VTU0lPTl9TRUNSRVQgPSAne1wiaWRcIjpcImZha2VmYWtlLTY3ZWMtNDMxNC1hNDM4LTYwNTg5YjljMGZhMlwiLFwidmVyc2lvblwiOjEsXCJleHBpcmVzX2F0XCI6MjAwMDAwMDAwMDAwMH0nO1xuZXhwb3J0cy5FWFBPX1NFU1NJT05fU0VDUkVUID0gRVhQT19TRVNTSU9OX1NFQ1JFVDtcbnZhciBCQVNFX0RJQUxPR19XSURUSCA9IDcwMDtcbmV4cG9ydHMuQkFTRV9ESUFMT0dfV0lEVEggPSBCQVNFX0RJQUxPR19XSURUSDtcbnZhciBUT09MQk9YX0VESVRfTU9ERSA9ICd0b29sYm94X2Jsb2Nrcyc7XG5leHBvcnRzLlRPT0xCT1hfRURJVF9NT0RFID0gVE9PTEJPWF9FRElUX01PREU7XG52YXIgUFJPRkFOSVRZX0ZPVU5EID0gJ3Byb2Zhbml0eV9mb3VuZCc7XG5leHBvcnRzLlBST0ZBTklUWV9GT1VORCA9IFBST0ZBTklUWV9GT1VORDtcbnZhciBOT1RJRklDQVRJT05fQUxFUlRfVFlQRSA9ICdub3RpZmljYXRpb24nO1xuZXhwb3J0cy5OT1RJRklDQVRJT05fQUxFUlRfVFlQRSA9IE5PVElGSUNBVElPTl9BTEVSVF9UWVBFO1xudmFyIEJsb2NrbHlWZXJzaW9uID0ge1xuICBDRE86ICdDRE8nLFxuICBHT09HTEU6ICdHb29nbGUnXG59O1xuZXhwb3J0cy5CbG9ja2x5VmVyc2lvbiA9IEJsb2NrbHlWZXJzaW9uOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5mZXRjaFVSTEFzQmxvYiA9IGZldGNoVVJMQXNCbG9iO1xuZXhwb3J0cy5ibG9iVG9EYXRhVVJJID0gYmxvYlRvRGF0YVVSSTtcbmV4cG9ydHMuZGF0YVVSSVRvU291cmNlU2l6ZSA9IGRhdGFVUklUb1NvdXJjZVNpemU7XG5leHBvcnRzLmRhdGFVUklGcm9tVVJJID0gZGF0YVVSSUZyb21VUkk7XG5leHBvcnRzLlVSSUZyb21JbWFnZURhdGEgPSBVUklGcm9tSW1hZ2VEYXRhO1xuZXhwb3J0cy5kYXRhVVJJVG9GcmFtZWRCbG9iID0gZGF0YVVSSVRvRnJhbWVkQmxvYjtcbmV4cG9ydHMuc3ZnVG9EYXRhVVJJID0gc3ZnVG9EYXRhVVJJO1xuZXhwb3J0cy5jYW52YXNUb0Jsb2IgPSBjYW52YXNUb0Jsb2I7XG5leHBvcnRzLmRhdGFVUklUb0Jsb2IgPSBkYXRhVVJJVG9CbG9iO1xuZXhwb3J0cy50b0ltYWdlID0gdG9JbWFnZTtcbmV4cG9ydHMudG9DYW52YXMgPSB0b0NhbnZhcztcbmV4cG9ydHMudG9JbWFnZURhdGEgPSB0b0ltYWdlRGF0YTtcbmV4cG9ydHMuZG93bmxvYWRCbG9iQXNQbmcgPSBkb3dubG9hZEJsb2JBc1BuZztcblxudmFyIF9ibGFua19zaGFyaW5nX2RyYXdpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuLi9zdGF0aWMvdHVydGxlL2JsYW5rX3NoYXJpbmdfZHJhd2luZy5wbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IHZhciBvd25LZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KHNvdXJjZSkpOyBpZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09ICdmdW5jdGlvbicpIHsgb3duS2V5cyA9IG93bktleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKS5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHN5bSkuZW51bWVyYWJsZTsgfSkpOyB9IG93bktleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbmZ1bmN0aW9uIGZldGNoVVJMQXNCbG9iKHVybCwgb25Db21wbGV0ZSkge1xuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xuXG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLnRhcmdldC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgb25Db21wbGV0ZShudWxsLCBlLnRhcmdldC5yZXNwb25zZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uQ29tcGxldGUobmV3IEVycm9yKFwiVVJMIFwiLmNvbmNhdCh1cmwsIFwiIHJlc3BvbmRlZCB3aXRoIGNvZGUgXCIpLmNvbmNhdChlLnRhcmdldC5zdGF0dXMpKSk7XG4gICAgfVxuICB9O1xuXG4gIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcbiAgICByZXR1cm4gb25Db21wbGV0ZShuZXcgRXJyb3IoXCJFcnJvciBcIi5jb25jYXQoZS50YXJnZXQuc3RhdHVzLCBcIiBvY2N1cnJlZCB3aGlsZSByZWNlaXZpbmcgdGhlIGRvY3VtZW50LlwiKSkpO1xuICB9O1xuXG4gIHhoci5zZW5kKCk7XG59XG5cbmZ1bmN0aW9uIGJsb2JUb0RhdGFVUkkoYmxvYiwgb25Db21wbGV0ZSkge1xuICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgIHJldHVybiBvbkNvbXBsZXRlKGUudGFyZ2V0LnJlc3VsdCk7XG4gIH07XG5cbiAgZmlsZVJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xufVxuXG5mdW5jdGlvbiBkYXRhVVJJVG9Tb3VyY2VTaXplKGRhdGFVUkkpIHtcbiAgcmV0dXJuIHRvSW1hZ2UoZGF0YVVSSSkudGhlbihmdW5jdGlvbiAoaW1hZ2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogaW1hZ2Uud2lkdGgsXG4gICAgICB5OiBpbWFnZS5oZWlnaHRcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZGF0YVVSSUZyb21VUkkodXJpKSB7XG4gIHZhciBjYW52YXM7XG4gIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUuYXN5bmMoZnVuY3Rpb24gZGF0YVVSSUZyb21VUkkkKF9jb250ZXh0KSB7XG4gICAgd2hpbGUgKDEpIHtcbiAgICAgIHN3aXRjaCAoX2NvbnRleHQucHJldiA9IF9jb250ZXh0Lm5leHQpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIF9jb250ZXh0Lm5leHQgPSAyO1xuICAgICAgICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAodG9DYW52YXModXJpKSk7XG5cbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGNhbnZhcyA9IF9jb250ZXh0LnNlbnQ7XG4gICAgICAgICAgcmV0dXJuIF9jb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjYW52YXMudG9EYXRhVVJMKCkpO1xuXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgIHJldHVybiBfY29udGV4dC5zdG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gVVJJRnJvbUltYWdlRGF0YShpbWFnZURhdGEpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMud2lkdGggPSBpbWFnZURhdGEud2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBpbWFnZURhdGEuaGVpZ2h0O1xuICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCgpO1xufVxuXG5mdW5jdGlvbiBkYXRhVVJJVG9GcmFtZWRCbG9iKGRhdGFVUkksIGNhbGxiYWNrKSB7XG4gIHZhciBmcmFtZSA9IG5ldyBJbWFnZSgpO1xuICB2YXIgaW1hZ2VEYXRhID0gbmV3IEltYWdlKCk7XG4gIGltYWdlRGF0YS5zcmMgPSBkYXRhVVJJO1xuXG4gIGZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLndpZHRoID0gZnJhbWUud2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGZyYW1lLmhlaWdodDtcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY3R4LmRyYXdJbWFnZShmcmFtZSwgMCwgMCk7XG4gICAgY3R4LmRyYXdJbWFnZShpbWFnZURhdGEsIDE3NSwgNTIsIDE1NCwgMTU0KTtcblxuICAgIGlmIChjYW52YXMudG9CbG9iKSB7XG4gICAgICBjYW52YXMudG9CbG9iKGNhbGxiYWNrKTtcbiAgICB9XG4gIH07XG5cbiAgZnJhbWUuc3JjID0gX2JsYW5rX3NoYXJpbmdfZHJhd2luZ1tcImRlZmF1bHRcIl07XG59XG5cbmZ1bmN0aW9uIHN2Z1RvRGF0YVVSSShzdmcpIHtcbiAgdmFyIGltYWdlVHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJ2ltYWdlL3BuZyc7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgLy8gVXNlIGxhenktbG9hZGluZyB0byBrZWVwIGNhbnZnICg2MEtCKSBvdXQgb2YgdGhlIGluaXRpYWwgZG93bmxvYWQuXG4gICAgaW1wb3J0KCcuL3V0aWwvc3ZnZWxlbWVudC1wb2x5ZmlsbCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgc3ZnLnRvRGF0YVVSTChpbWFnZVR5cGUsIF9vYmplY3RTcHJlYWQoe30sIG9wdGlvbnMsIHtcbiAgICAgICAgY2FsbGJhY2s6IHJlc29sdmVcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbnZhc1RvQmxvYihjYW52YXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgY2FudmFzLnRvQmxvYihyZXNvbHZlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRhdGFVUklUb0Jsb2IodXJpKSB7XG4gIHZhciBjYW52YXM7XG4gIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUuYXN5bmMoZnVuY3Rpb24gZGF0YVVSSVRvQmxvYiQoX2NvbnRleHQyKSB7XG4gICAgd2hpbGUgKDEpIHtcbiAgICAgIHN3aXRjaCAoX2NvbnRleHQyLnByZXYgPSBfY29udGV4dDIubmV4dCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAyO1xuICAgICAgICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAodG9DYW52YXModXJpKSk7XG5cbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGNhbnZhcyA9IF9jb250ZXh0Mi5zZW50O1xuICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gNTtcbiAgICAgICAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKGNhbnZhc1RvQmxvYihjYW52YXMpKTtcblxuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5hYnJ1cHQoXCJyZXR1cm5cIiwgX2NvbnRleHQyLnNlbnQpO1xuXG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgIHJldHVybiBfY29udGV4dDIuc3RvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4vKipcbiAqIEB0eXBlZGVmIHtzdHJpbmd9IEltYWdlVVJJXG4gKiBBIHN0cmluZyBpbiB0aGUgZm9ybSBvZiBhbiBpbWFnZSBVUkkgb3IgZGF0YSBVUkk7IGFueXRoaW5nIHlvdSBtaWdodFxuICogYXNzaWduIHRvIGFuIDxpbWFnZT4ncyBgc3JjYCBhdHRyaWJ1dGUuICBFeGFtcGxlczpcbiAqIFwiaHR0cHM6Ly9leGFtcGxlLmNvbS9leGFtcGxlLnBuZ1wiXG4gKiBcImRhdGE6aW1hZ2Uvc3ZnK3htbCw8c3ZnLi4uXCJcbiAqIFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SLi4uXCJcbiAqL1xuXG4vKipcbiAqIEdpdmVuIGFuIGlucHV0IG9mIGEgc3VwcG9ydGVkIHR5cGUsIGNvbnZlcnRzIGl0IHRvIGFuIEhUTUxJbWFnZUVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtCbG9ifEhUTUxJbWFnZUVsZW1lbnR8SW1hZ2VVUkl9IGlucHV0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50Pn1cbiAqL1xuXG5cbmZ1bmN0aW9uIHRvSW1hZ2UoaW5wdXQpIHtcbiAgdmFyIHNyYywgY2xlYW51cDtcbiAgcmV0dXJuIHJlZ2VuZXJhdG9yUnVudGltZS5hc3luYyhmdW5jdGlvbiB0b0ltYWdlJChfY29udGV4dDMpIHtcbiAgICB3aGlsZSAoMSkge1xuICAgICAgc3dpdGNoIChfY29udGV4dDMucHJldiA9IF9jb250ZXh0My5uZXh0KSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBpZiAoIShpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpKSB7XG4gICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gX2NvbnRleHQzLmFicnVwdChcInJldHVyblwiLCBpbnB1dCk7XG5cbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGNsZWFudXAgPSBmdW5jdGlvbiBjbGVhbnVwKCkge307XG5cbiAgICAgICAgICBpZiAoIShpbnB1dCBpbnN0YW5jZW9mIEJsb2IpKSB7XG4gICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGlucHV0KTtcblxuICAgICAgICAgIGNsZWFudXAgPSBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgICAgICAgcmV0dXJuIFVSTC5yZXZva2VPYmplY3RVUkwoaW5wdXQpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDEzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICBpZiAoISh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAxMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNyYyA9IGlucHV0O1xuICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMTM7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGlucHV0IHRvIGltYWdlJyk7XG5cbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICByZXR1cm4gX2NvbnRleHQzLmFicnVwdChcInJldHVyblwiLCBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgIHJlc29sdmUoaW1hZ2UpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHNyYztcbiAgICAgICAgICB9KSk7XG5cbiAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgIHJldHVybiBfY29udGV4dDMuc3RvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4vKipcbiAqIEdpdmVuIGFuIGlucHV0IG9mIGEgc3VwcG9ydGVkIHR5cGUsIGNvbnZlcnRzIGl0IHRvIGFuIEhUTUxDYW52YXNFbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7QmxvYnxIVE1MQ2FudmFzRWxlbWVudHxIVE1MSW1hZ2VFbGVtZW50fEltYWdlVVJJfSBpbnB1dFxuICogQHJldHVybnMge1Byb21pc2U8SFRNTENhbnZhc0VsZW1lbnQ+fVxuICovXG5cblxuZnVuY3Rpb24gdG9DYW52YXMoaW5wdXQpIHtcbiAgdmFyIGltYWdlLCBjYW52YXMsIGNvbnRleHQ7XG4gIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUuYXN5bmMoZnVuY3Rpb24gdG9DYW52YXMkKF9jb250ZXh0NCkge1xuICAgIHdoaWxlICgxKSB7XG4gICAgICBzd2l0Y2ggKF9jb250ZXh0NC5wcmV2ID0gX2NvbnRleHQ0Lm5leHQpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIGlmICghKGlucHV0IGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpKSB7XG4gICAgICAgICAgICBfY29udGV4dDQubmV4dCA9IDI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gX2NvbnRleHQ0LmFicnVwdChcInJldHVyblwiLCBpbnB1dCk7XG5cbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIF9jb250ZXh0NC5wcmV2ID0gMjtcbiAgICAgICAgICBfY29udGV4dDQubmV4dCA9IDU7XG4gICAgICAgICAgcmV0dXJuIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh0b0ltYWdlKGlucHV0KSk7XG5cbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGltYWdlID0gX2NvbnRleHQ0LnNlbnQ7XG4gICAgICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgY2FudmFzLndpZHRoID0gaW1hZ2Uud2lkdGg7XG4gICAgICAgICAgY2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICAgICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuICAgICAgICAgIHJldHVybiBfY29udGV4dDQuYWJydXB0KFwicmV0dXJuXCIsIGNhbnZhcyk7XG5cbiAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICBfY29udGV4dDQucHJldiA9IDE0O1xuICAgICAgICAgIF9jb250ZXh0NC50MCA9IF9jb250ZXh0NFtcImNhdGNoXCJdKDIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgaW5wdXQgdG8gY2FudmFzOiAnICsgX2NvbnRleHQ0LnQwKTtcblxuICAgICAgICBjYXNlIDE3OlxuICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgcmV0dXJuIF9jb250ZXh0NC5zdG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCBudWxsLCBudWxsLCBbWzIsIDE0XV0pO1xufVxuLyoqXG4gKiBHaXZlbiBhbiBpbnB1dCBvZiBhIHN1cHBvcnRlZCB0eXBlLCBjb252ZXJ0cyBpdCB0byBhbiBJbWFnZURhdGEgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7QmxvYnxIVE1MQ2FudmFzRWxlbWVudHxIVE1MSW1hZ2VFbGVtZW50fEltYWdlRGF0YXxJbWFnZVVSSX0gaW5wdXRcbiAqIEByZXR1cm5zIHtQcm9taXNlPEltYWdlRGF0YT59XG4gKi9cblxuXG5mdW5jdGlvbiB0b0ltYWdlRGF0YShpbnB1dCkge1xuICB2YXIgY2FudmFzO1xuICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLmFzeW5jKGZ1bmN0aW9uIHRvSW1hZ2VEYXRhJChfY29udGV4dDUpIHtcbiAgICB3aGlsZSAoMSkge1xuICAgICAgc3dpdGNoIChfY29udGV4dDUucHJldiA9IF9jb250ZXh0NS5uZXh0KSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBpZiAoIShpbnB1dCBpbnN0YW5jZW9mIEltYWdlRGF0YSkpIHtcbiAgICAgICAgICAgIF9jb250ZXh0NS5uZXh0ID0gMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBfY29udGV4dDUuYWJydXB0KFwicmV0dXJuXCIsIGlucHV0KTtcblxuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgX2NvbnRleHQ1LnByZXYgPSAyO1xuICAgICAgICAgIF9jb250ZXh0NS5uZXh0ID0gNTtcbiAgICAgICAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHRvQ2FudmFzKGlucHV0KSk7XG5cbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGNhbnZhcyA9IF9jb250ZXh0NS5zZW50O1xuICAgICAgICAgIHJldHVybiBfY29udGV4dDUuYWJydXB0KFwicmV0dXJuXCIsIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpKTtcblxuICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgX2NvbnRleHQ1LnByZXYgPSA5O1xuICAgICAgICAgIF9jb250ZXh0NS50MCA9IF9jb250ZXh0NVtcImNhdGNoXCJdKDIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgaW5wdXQgdG8gSW1hZ2VEYXRhOiAnICsgX2NvbnRleHQ1LnQwKTtcblxuICAgICAgICBjYXNlIDEyOlxuICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgcmV0dXJuIF9jb250ZXh0NS5zdG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCBudWxsLCBudWxsLCBbWzIsIDldXSk7XG59XG4vKipcbiAqIEBwYXJhbSB7QmxvYn1cbiAqL1xuXG5cbmZ1bmN0aW9uIGRvd25sb2FkQmxvYkFzUG5nKGJsb2IpIHtcbiAgdmFyIGZpbGVuYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnaW1hZ2UucG5nJztcbiAgdmFyIGRvd25sb2FkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBkb3dubG9hZC5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgZG93bmxvYWQuZG93bmxvYWQgPSBmaWxlbmFtZTtcbiAgZG93bmxvYWQuY2xpY2soKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF93Z3hwYXRoID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwid2d4cGF0aFwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKipcbiAqIEEgbG93LXBlcmZvcm1hbmNlIHBvbHlmaWxsIGZvciB0b0Jsb2IgYmFzZWQgb24gdG9EYXRhVVJMLiBBZGFwdGVkIGZyb206XG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSFRNTENhbnZhc0VsZW1lbnQvdG9CbG9iXG4gKi9cbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLnRvQmxvYikge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLCAndG9CbG9iJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZShjYWxsYmFjaywgdHlwZSwgcXVhbGl0eSkge1xuICAgICAgdmFyIGJpblN0ciA9IGF0b2IodGhpcy50b0RhdGFVUkwodHlwZSwgcXVhbGl0eSkuc3BsaXQoJywnKVsxXSk7XG4gICAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYmluU3RyLmxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmluU3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFycltpXSA9IGJpblN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgfVxuXG4gICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFthcnJdLCB7XG4gICAgICAgIHR5cGU6IHR5cGUgfHwgJ2ltYWdlL3BuZydcbiAgICAgIH0pO1xuICAgICAgY2FsbGJhY2soYmxvYik7XG4gICAgfVxuICB9KTtcbn1cbi8qKlxuICogUG9seWZpbGwgZm9yIHN2Zy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lIGZvciBJRTExXG4gKiBGcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jbGllbnRJTy9qb2ludC9pc3N1ZXMvMTE3I2lzc3VlY29tbWVudC0xOTQ2OTkyMjJcbiAqL1xuXG5cbmlmIChTVkdFbGVtZW50LnByb3RvdHlwZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgU1ZHRWxlbWVudC5wcm90b3R5cGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSA9IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIGNsYXNzTmFtZSk7XG4gIH07XG59XG4vKipcbiAqIFBvbHlmaWxsIGZvciBkb2N1bWVudC5ldmFsdWF0ZSBmb3IgSUVcbiAqL1xuXG5cbmlmICghZG9jdW1lbnQuZXZhbHVhdGUpIHtcbiAgX3dneHBhdGhbXCJkZWZhdWx0XCJdLmluc3RhbGwod2luZG93KTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3Byb3BUeXBlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInByb3AtdHlwZXNcIikpO1xuXG52YXIgX3JlYWN0ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicmVhY3RcIikpO1xuXG52YXIgX2NvbG9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGNkby9hcHBzL3V0aWwvY29sb3JcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzTG9vc2Uoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7IHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzOyBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBTZWFyY2hCYXIgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgX2luaGVyaXRzTG9vc2UoU2VhcmNoQmFyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICBmdW5jdGlvbiBTZWFyY2hCYXIoKSB7XG4gICAgcmV0dXJuIF9SZWFjdCRDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFNlYXJjaEJhci5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5zZWFyY2hCb3guZm9jdXMoKTtcbiAgfTtcblxuICBfcHJvdG8ucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMuc2VhcmNoQXJlYVxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcInNwYW5cIiwge1xuICAgICAgY2xhc3NOYW1lOiBcImZhIGZhLXNlYXJjaFwiLFxuICAgICAgc3R5bGU6IHN0eWxlcy5pY29uXG4gICAgfSksIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMuaW5wdXQsXG4gICAgICBwbGFjZWhvbGRlcjogdGhpcy5wcm9wcy5wbGFjZWhvbGRlclRleHQsXG4gICAgICBvbkNoYW5nZTogdGhpcy5wcm9wcy5vbkNoYW5nZSxcbiAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGlucHV0KSB7XG4gICAgICAgIF90aGlzLnNlYXJjaEJveCA9IGlucHV0O1xuICAgICAgfVxuICAgIH0pLCB0aGlzLnByb3BzLmNsZWFyQnV0dG9uICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcInNwYW5cIiwge1xuICAgICAgY2xhc3NOYW1lOiBcImZhIGZhLWNsb3NlXCIsXG4gICAgICBzdHlsZTogc3R5bGVzLmNsZWFySWNvbixcbiAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgIF90aGlzLnNlYXJjaEJveC52YWx1ZSA9ICcnO1xuXG4gICAgICAgIF90aGlzLnByb3BzLm9uQ2hhbmdlKCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIHJldHVybiBTZWFyY2hCYXI7XG59KF9yZWFjdFtcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTZWFyY2hCYXI7XG5cbl9kZWZpbmVQcm9wZXJ0eShTZWFyY2hCYXIsIFwicHJvcFR5cGVzXCIsIHtcbiAgcGxhY2Vob2xkZXJUZXh0OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgb25DaGFuZ2U6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmZ1bmMuaXNSZXF1aXJlZCxcbiAgY2xlYXJCdXR0b246IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmJvb2xcbn0pO1xuXG52YXIgQk9SREVSX1dJRFRIID0gMTtcbnZhciBCT1JERVJfQ09MT1IgPSBfY29sb3JbXCJkZWZhdWx0XCJdLmxpZ2h0X2dyYXk7XG52YXIgQk9SREVSX1JBRElVUyA9IDQ7IC8vIFdlIGhhdmUgc2lkZS1ieS1zaWRlIGVsZW1lbnRzIHRoYXQgc2hvdWxkIGZvcm1hdCBzb3J0IG9mIGxpa2Ugb25lIGVsZW1lbnRcblxudmFyIHN0eWxlcyA9IHtcbiAgaW5wdXQ6IHtcbiAgICB3aWR0aDogJzEwMCUnLFxuICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgIHBhZGRpbmc6ICczcHggN3B4JyxcbiAgICBtYXJnaW46IDAsXG4gICAgYm9yZGVyU3R5bGU6ICdzb2xpZCcsXG4gICAgYm9yZGVyV2lkdGg6IEJPUkRFUl9XSURUSCxcbiAgICBib3JkZXJDb2xvcjogQk9SREVSX0NPTE9SLFxuICAgIGJvcmRlclJhZGl1czogQk9SREVSX1JBRElVUyxcbiAgICB0ZXh0SW5kZW50OiAyMlxuICB9LFxuICBpY29uOiB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgdG9wOiA2LFxuICAgIGxlZnQ6IDUsXG4gICAgZm9udFNpemU6IDE2LFxuICAgIGNvbG9yOiBfY29sb3JbXCJkZWZhdWx0XCJdLmxpZ2h0X2dyYXlcbiAgfSxcbiAgY2xlYXJJY29uOiB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgdG9wOiA2LFxuICAgIHJpZ2h0OiA1LFxuICAgIGZvbnRTaXplOiAxNixcbiAgICBjb2xvcjogX2NvbG9yW1wiZGVmYXVsdFwiXS5saWdodF9ncmF5LFxuICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gIH0sXG4gIHNlYXJjaEFyZWE6IHtcbiAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICBtYXJnaW46ICcxMHB4IDAnXG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcmVhY3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5cbnZhciBfbG9jYWxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGNkby90dXRvcmlhbEV4cGxvcmVyL2xvY2FsZVwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKiBCYWNrQnV0dG9uOiBBIGJ1dHRvbiBzaG93biBhYm92ZSB0aGUgZmlsdGVycyB0aGF0IGdvZXMgYmFjayB0byAvbGVhcm4uXG4gKi9cbnZhciBzdHlsZXMgPSB7XG4gIGJhY2tCdXR0b246IHtcbiAgICBtYXJnaW5Ub3A6IDcsXG4gICAgbWFyZ2luQm90dG9tOiAxM1xuICB9XG59O1xuXG52YXIgQmFja0J1dHRvbiA9IGZ1bmN0aW9uIEJhY2tCdXR0b24ocHJvcHMpIHtcbiAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImFcIiwge1xuICAgIGhyZWY6IFwiL2xlYXJuXCJcbiAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcbiAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgIHN0eWxlOiBzdHlsZXMuYmFja0J1dHRvblxuICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtcbiAgICBjbGFzc05hbWU6IFwiZmEgZmEtYXJyb3ctbGVmdFwiLFxuICAgIFwiYXJpYS1oaWRkZW5cIjogdHJ1ZVxuICB9KSwgXCJcXHhBMFwiLCBfbG9jYWxlW1wiZGVmYXVsdFwiXS5iYWNrQnV0dG9uQmFjaygpKSk7XG59O1xuXG52YXIgX2RlZmF1bHQgPSBCYWNrQnV0dG9uO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9wcm9wVHlwZXMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJwcm9wLXR5cGVzXCIpKTtcblxudmFyIF9yZWFjdCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInJlYWN0XCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIEZpbHRlckNob2ljZSA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICBfaW5oZXJpdHNMb29zZShGaWx0ZXJDaG9pY2UsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gIGZ1bmN0aW9uIEZpbHRlckNob2ljZSgpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgX3RoaXMgPSBfUmVhY3QkQ29tcG9uZW50LmNhbGwuYXBwbHkoX1JlYWN0JENvbXBvbmVudCwgW3RoaXNdLmNvbmNhdChhcmdzKSkgfHwgdGhpcztcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJoYW5kbGVDaGFuZ2VcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBfdGhpcy5wcm9wcy5vblVzZXJJbnB1dChfdGhpcy5wcm9wcy5ncm91cE5hbWUsIF90aGlzLnByb3BzLm5hbWUsIGV2ZW50LnRhcmdldC5jaGVja2VkKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBGaWx0ZXJDaG9pY2UucHJvdG90eXBlO1xuXG4gIF9wcm90by5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHR5cGUgPSB0aGlzLnByb3BzLnNpbmdsZUVudHJ5ID8gJ3JhZGlvJyA6ICdjaGVja2JveCc7XG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLmZpbHRlckNob2ljZU91dGVyXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwge1xuICAgICAgc3R5bGU6IHN0eWxlcy5maWx0ZXJDaG9pY2VMYWJlbFxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBjaGVja2VkOiB0aGlzLnByb3BzLnNlbGVjdGVkLFxuICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlQ2hhbmdlLFxuICAgICAgc3R5bGU6IHN0eWxlcy5maWx0ZXJDaG9pY2VJbnB1dFxuICAgIH0pLCB0aGlzLnByb3BzLnRleHQpKTtcbiAgfTtcblxuICByZXR1cm4gRmlsdGVyQ2hvaWNlO1xufShfcmVhY3RbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRmlsdGVyQ2hvaWNlO1xuXG5fZGVmaW5lUHJvcGVydHkoRmlsdGVyQ2hvaWNlLCBcInByb3BUeXBlc1wiLCB7XG4gIG9uVXNlcklucHV0OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5mdW5jLmlzUmVxdWlyZWQsXG4gIGdyb3VwTmFtZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nLmlzUmVxdWlyZWQsXG4gIG5hbWU6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLnN0cmluZy5pc1JlcXVpcmVkLFxuICBzZWxlY3RlZDogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uYm9vbC5pc1JlcXVpcmVkLFxuICB0ZXh0OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgc2luZ2xlRW50cnk6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmJvb2wuaXNSZXF1aXJlZFxufSk7XG5cbnZhciBzdHlsZXMgPSB7XG4gIGZpbHRlckNob2ljZU91dGVyOiB7XG4gICAgdXNlclNlbGVjdDogJ25vbmUnLFxuICAgIFdlYmtpdFVzZXJTZWxlY3Q6ICdub25lJyxcbiAgICBNb3pVc2VyU2VsZWN0OiAnbm9uZScsXG4gICAgTXNVc2VyU2VsZWN0OiAnbm9uZSdcbiAgfSxcbiAgZmlsdGVyQ2hvaWNlTGFiZWw6IHtcbiAgICBmb250RmFtaWx5OiAnXCJHb3RoYW0gNHJcIiwgc2Fucy1zZXJpZicsXG4gICAgZm9udFNpemU6IDEzLFxuICAgIHBhZGRpbmdCb3R0b206IDAsXG4gICAgbWFyZ2luQm90dG9tOiAwLFxuICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gIH0sXG4gIGZpbHRlckNob2ljZUlucHV0OiB7XG4gICAgbWFyZ2luUmlnaHQ6IDVcbiAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9wcm9wVHlwZXMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJwcm9wLXR5cGVzXCIpKTtcblxudmFyIF9yZWFjdCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInJlYWN0XCIpKTtcblxudmFyIF9maWx0ZXJHcm91cENvbnRhaW5lciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vZmlsdGVyR3JvdXBDb250YWluZXJcIikpO1xuXG52YXIgX2ZpbHRlckNob2ljZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vZmlsdGVyQ2hvaWNlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgRmlsdGVyR3JvdXAgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgX2luaGVyaXRzTG9vc2UoRmlsdGVyR3JvdXAsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gIGZ1bmN0aW9uIEZpbHRlckdyb3VwKCkge1xuICAgIHJldHVybiBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBGaWx0ZXJHcm91cC5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfZmlsdGVyR3JvdXBDb250YWluZXJbXCJkZWZhdWx0XCJdLCB7XG4gICAgICB0ZXh0OiB0aGlzLnByb3BzLnRleHRcbiAgICB9LCB0aGlzLnByb3BzLmZpbHRlckVudHJpZXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9maWx0ZXJDaG9pY2VbXCJkZWZhdWx0XCJdLCB7XG4gICAgICAgIGdyb3VwTmFtZTogX3RoaXMucHJvcHMubmFtZSxcbiAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICB0ZXh0OiBpdGVtLnRleHQsXG4gICAgICAgIHNlbGVjdGVkOiBfdGhpcy5wcm9wcy5zZWxlY3Rpb24gJiYgX3RoaXMucHJvcHMuc2VsZWN0aW9uLmluZGV4T2YoaXRlbS5uYW1lKSAhPT0gLTEsXG4gICAgICAgIG9uVXNlcklucHV0OiBfdGhpcy5wcm9wcy5vblVzZXJJbnB1dCxcbiAgICAgICAgc2luZ2xlRW50cnk6IF90aGlzLnByb3BzLnNpbmdsZUVudHJ5LFxuICAgICAgICBrZXk6IGl0ZW0ubmFtZVxuICAgICAgfSk7XG4gICAgfSkpO1xuICB9O1xuXG4gIHJldHVybiBGaWx0ZXJHcm91cDtcbn0oX3JlYWN0W1wiZGVmYXVsdFwiXS5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEZpbHRlckdyb3VwO1xuXG5fZGVmaW5lUHJvcGVydHkoRmlsdGVyR3JvdXAsIFwicHJvcFR5cGVzXCIsIHtcbiAgbmFtZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nLmlzUmVxdWlyZWQsXG4gIHRleHQ6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLnN0cmluZy5pc1JlcXVpcmVkLFxuICBmaWx0ZXJFbnRyaWVzOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5hcnJheS5pc1JlcXVpcmVkLFxuICBzZWxlY3Rpb246IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5LmlzUmVxdWlyZWQsXG4gIG9uVXNlcklucHV0OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5mdW5jLmlzUmVxdWlyZWQsXG4gIHNpbmdsZUVudHJ5OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5ib29sLmlzUmVxdWlyZWRcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcHJvcFR5cGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicHJvcC10eXBlc1wiKSk7XG5cbnZhciBfcmVhY3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5cbnZhciBfcmVzcG9uc2l2ZSA9IHJlcXVpcmUoXCIuL3Jlc3BvbnNpdmVcIik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgdmFyIG93bktleXMgPSBPYmplY3Qua2V5cyhPYmplY3Qoc291cmNlKSk7IGlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gJ2Z1bmN0aW9uJykgeyBvd25LZXlzID0gb3duS2V5cy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzb3VyY2UpLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgc3ltKS5lbnVtZXJhYmxlOyB9KSk7IH0gb3duS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgX2RlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzTG9vc2Uoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7IHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzOyBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBGaWx0ZXJHcm91cENvbnRhaW5lciA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICBfaW5oZXJpdHNMb29zZShGaWx0ZXJHcm91cENvbnRhaW5lciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gRmlsdGVyR3JvdXBDb250YWluZXIoKSB7XG4gICAgcmV0dXJuIF9SZWFjdCRDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IEZpbHRlckdyb3VwQ29udGFpbmVyLnByb3RvdHlwZTtcblxuICBfcHJvdG8ucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBmaWx0ZXJHcm91cE91dGVyU3R5bGUgPSBfb2JqZWN0U3ByZWFkKHt9LCBzdHlsZXMuZmlsdGVyR3JvdXBPdXRlciwge1xuICAgICAgd2lkdGg6ICgwLCBfcmVzcG9uc2l2ZS5nZXRSZXNwb25zaXZlVmFsdWUpKHtcbiAgICAgICAgeHM6IDEwMCxcbiAgICAgICAgc206IDUwLFxuICAgICAgICBtZDogMTAwXG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogZmlsdGVyR3JvdXBPdXRlclN0eWxlXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMuZmlsdGVyR3JvdXBUZXh0XG4gICAgfSwgdGhpcy5wcm9wcy50ZXh0KSwgdGhpcy5wcm9wcy5jaGlsZHJlbik7XG4gIH07XG5cbiAgcmV0dXJuIEZpbHRlckdyb3VwQ29udGFpbmVyO1xufShfcmVhY3RbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRmlsdGVyR3JvdXBDb250YWluZXI7XG5cbl9kZWZpbmVQcm9wZXJ0eShGaWx0ZXJHcm91cENvbnRhaW5lciwgXCJwcm9wVHlwZXNcIiwge1xuICB0ZXh0OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgY2hpbGRyZW46IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLm5vZGUuaXNSZXF1aXJlZFxufSk7XG5cbnZhciBzdHlsZXMgPSB7XG4gIGZpbHRlckdyb3VwT3V0ZXI6IHtcbiAgICBcImZsb2F0XCI6ICdsZWZ0JyxcbiAgICBwYWRkaW5nQm90dG9tOiAyMCxcbiAgICBwYWRkaW5nUmlnaHQ6IDQwLFxuICAgIHBhZGRpbmdMZWZ0OiAxMFxuICB9LFxuICBmaWx0ZXJHcm91cFRleHQ6IHtcbiAgICBmb250RmFtaWx5OiAnXCJHb3RoYW0gNXJcIiwgc2Fucy1zZXJpZicsXG4gICAgYm9yZGVyQm90dG9tOiAnc29saWQgZ3JleSAxcHgnXG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcHJvcFR5cGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicHJvcC10eXBlc1wiKSk7XG5cbnZhciBfcmVhY3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgdmFyIG93bktleXMgPSBPYmplY3Qua2V5cyhPYmplY3Qoc291cmNlKSk7IGlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gJ2Z1bmN0aW9uJykgeyBvd25LZXlzID0gb3duS2V5cy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzb3VyY2UpLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgc3ltKS5lbnVtZXJhYmxlOyB9KSk7IH0gb3duS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgX2RlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7IGlmIChzZWxmID09PSB2b2lkIDApIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgRmlsdGVyR3JvdXBIZWFkZXJTZWxlY3Rpb24gPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgX2luaGVyaXRzTG9vc2UoRmlsdGVyR3JvdXBIZWFkZXJTZWxlY3Rpb24sIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gIGZ1bmN0aW9uIEZpbHRlckdyb3VwSGVhZGVyU2VsZWN0aW9uKCkge1xuICAgIHZhciBfdGhpcztcblxuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICBfdGhpcyA9IF9SZWFjdCRDb21wb25lbnQuY2FsbC5hcHBseShfUmVhY3QkQ29tcG9uZW50LCBbdGhpc10uY29uY2F0KGFyZ3MpKSB8fCB0aGlzO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImhhbmRsZUNoYW5nZVwiLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIF90aGlzLnByb3BzLm9uVXNlcklucHV0KF90aGlzLnByb3BzLmZpbHRlckdyb3VwLm5hbWUsIHZhbHVlLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBGaWx0ZXJHcm91cEhlYWRlclNlbGVjdGlvbi5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLml0ZW1TdHlsZSA9IGZ1bmN0aW9uIGl0ZW1TdHlsZShpbmRleCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMucHJvcHMuc2VsZWN0aW9uWzBdO1xuICAgIHZhciBzZWxlY3RlZEluZGV4ID0gdGhpcy5wcm9wcy5maWx0ZXJHcm91cC5lbnRyaWVzLmZpbmRJbmRleChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIGl0ZW0ubmFtZSA9PT0gdmFsdWU7XG4gICAgfSk7IC8vIFdoZW4gd2UgaGF2ZSB0d28gdW5zZWxlY3RlZCBpdGVtcyBuZXh0IHRvIGVhY2ggb3RoZXIsIHdlIHdhbnQgdG8gZHJhdyBhIGdyZXlcbiAgICAvLyB2ZXJ0aWNhbCBkaXZpZGVyIGJldHdlZW4gdGhlbSwgYW5kIHRoYXQncyBkb25lIGJ5IHJlbmRlcmluZyBhIGJvcmRlci1sZWZ0XG4gICAgLy8gb2YgdGhlIGl0ZW0gb24gdGhlIHJpZ2h0LlxuXG4gICAgaWYgKGluZGV4ID09PSBzZWxlY3RlZEluZGV4KSB7XG4gICAgICAvLyBUaGUgc2VsZWN0ZWQgaXRlbS5cbiAgICAgIHJldHVybiBzdHlsZXMuc2VsZWN0O1xuICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgIC8vIFRoZSBmaXJzdCBpdGVtLlxuICAgICAgcmV0dXJuIHt9O1xuICAgIH0gZWxzZSBpZiAoaW5kZXggLSAxICE9PSBzZWxlY3RlZEluZGV4KSB7XG4gICAgICAvLyBBbiBpdGVtIHRoYXQgaXMgbm90IGltbWVkaWF0ZWx5IHRvIHRoZSByaWdodCBvZiB0aGUgc2VsZWN0ZWQgaXRlbS5cbiAgICAgIHJldHVybiBzdHlsZXMuYm9yZGVyT25MZWZ0O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBbiBpdGVtIGltbWVkaWF0ZWx5IHRvIHRoZSByaWdodCBvZiB0aGUgc2VsZWN0ZWQgaXRlbS5cbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgIHJldHVybiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IF9vYmplY3RTcHJlYWQoe30sIHN0eWxlcy5jb250YWluZXIsIHRoaXMucHJvcHMuY29udGFpbmVyU3R5bGUpXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMuZmxleENvbnRhaW5lclxuICAgIH0sIHRoaXMucHJvcHMuZmlsdGVyR3JvdXAuZW50cmllcy5tYXAoZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAga2V5OiBpdGVtLm5hbWUsXG4gICAgICAgIG9uQ2xpY2s6IF90aGlzMi5oYW5kbGVDaGFuZ2UuYmluZChfdGhpczIsIGl0ZW0ubmFtZSksXG4gICAgICAgIHN0eWxlOiBfb2JqZWN0U3ByZWFkKHt9LCBzdHlsZXMuaXRlbSwgX3RoaXMyLml0ZW1TdHlsZShpbmRleCkpXG4gICAgICB9LCBpdGVtLnRleHQpO1xuICAgIH0pKSk7XG4gIH07XG5cbiAgcmV0dXJuIEZpbHRlckdyb3VwSGVhZGVyU2VsZWN0aW9uO1xufShfcmVhY3RbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRmlsdGVyR3JvdXBIZWFkZXJTZWxlY3Rpb247XG5cbl9kZWZpbmVQcm9wZXJ0eShGaWx0ZXJHcm91cEhlYWRlclNlbGVjdGlvbiwgXCJwcm9wVHlwZXNcIiwge1xuICBjb250YWluZXJTdHlsZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0ub2JqZWN0LmlzUmVxdWlyZWQsXG4gIGZpbHRlckdyb3VwOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5vYmplY3QuaXNSZXF1aXJlZCxcbiAgc2VsZWN0aW9uOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5hcnJheS5pc1JlcXVpcmVkLFxuICBvblVzZXJJbnB1dDogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uZnVuYy5pc1JlcXVpcmVkXG59KTtcblxudmFyIHN0eWxlcyA9IHtcbiAgY29udGFpbmVyOiB7XG4gICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgbWFyZ2luVG9wOiA2LFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICBoZWlnaHQ6IDM0LFxuICAgIGxpbmVIZWlnaHQ6ICczNHB4JyxcbiAgICBib3JkZXI6ICdzb2xpZCAxcHggI2EyYTJhMicsXG4gICAgYm9yZGVyUmFkaXVzOiA1XG4gIH0sXG4gIGZsZXhDb250YWluZXI6IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleFdyYXA6ICdub3dyYXAnXG4gIH0sXG4gIGl0ZW06IHtcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgY29sb3I6ICdkaW1ncmV5JyxcbiAgICBmb250RmFtaWx5OiBcIidHb3RoYW0gNHInLCBzYW5zLXNlcmlmXCIsXG4gICAgZm9udFNpemU6IDE1LFxuICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgIFwiZmxvYXRcIjogJ2xlZnQnLFxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgZmxleDogMSxcbiAgICB1c2VyU2VsZWN0OiAnbm9uZScsXG4gICAgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXG4gICAgYm9yZGVyTGVmdDogJ3NvbGlkIDFweCB3aGl0ZSdcbiAgfSxcbiAgc2VsZWN0OiB7XG4gICAgYmFja2dyb3VuZENvbG9yOiAnIzI3OTlhNCcsXG4gICAgY29sb3I6ICd3aGl0ZScsXG4gICAgYm9yZGVyTGVmdDogJ3NvbGlkIDFweCAjMjc5OWE0J1xuICB9LFxuICBib3JkZXJPbkxlZnQ6IHtcbiAgICBib3JkZXJMZWZ0OiAnc29saWQgMXB4ICNhMmEyYTInXG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcHJvcFR5cGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicHJvcC10eXBlc1wiKSk7XG5cbnZhciBfcmVhY3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5cbnZhciBfZmlsdGVyR3JvdXBDb250YWluZXIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2ZpbHRlckdyb3VwQ29udGFpbmVyXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcblxudmFyIF9sb2NhbGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAY2RvL3R1dG9yaWFsRXhwbG9yZXIvbG9jYWxlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIEZpbHRlckdyb3VwT3JnTmFtZXMgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgX2luaGVyaXRzTG9vc2UoRmlsdGVyR3JvdXBPcmdOYW1lcywgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gRmlsdGVyR3JvdXBPcmdOYW1lcygpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgX3RoaXMgPSBfUmVhY3QkQ29tcG9uZW50LmNhbGwuYXBwbHkoX1JlYWN0JENvbXBvbmVudCwgW3RoaXNdLmNvbmNhdChhcmdzKSkgfHwgdGhpcztcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJoYW5kbGVDaGFuZ2VPcmdOYW1lXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgX3RoaXMucHJvcHMub25Vc2VySW5wdXQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBGaWx0ZXJHcm91cE9yZ05hbWVzLnByb3RvdHlwZTtcblxuICBfcHJvdG8udHJ1bmNhdGVPcmdOYW1lID0gZnVuY3Rpb24gdHJ1bmNhdGVPcmdOYW1lKG9yZ05hbWUpIHtcbiAgICAvLyBUcnVuY2F0ZSBhbmQgZWxsaXBzaXMgb3JnYW5pemF0aW9uIG5hbWUgdG8gbGltaXQgbGVuZ3RoIGluIGRyb3Bkb3duLlxuICAgIHZhciBtYXhPcmdOYW1lQ2hhcnMgPSAyNTtcblxuICAgIGlmIChvcmdOYW1lLmxlbmd0aCA+IG1heE9yZ05hbWVDaGFycykge1xuICAgICAgcmV0dXJuIG9yZ05hbWUuc3Vic3RyaW5nKDAsIG1heE9yZ05hbWVDaGFycykgKyAnLi4uJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9yZ05hbWU7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9maWx0ZXJHcm91cENvbnRhaW5lcltcImRlZmF1bHRcIl0sIHtcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlck9yZ05hbWVzKClcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCB7XG4gICAgICBodG1sRm9yOiBcImZpbHRlci1vcmctbmFtZXMtZHJvcGRvd25cIixcbiAgICAgIGNsYXNzTmFtZTogXCJoaWRkZW4tbGFiZWxcIlxuICAgIH0sIF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlck9yZ05hbWVzKCkpLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIiwge1xuICAgICAgaWQ6IFwiZmlsdGVyLW9yZy1uYW1lcy1kcm9wZG93blwiLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMub3JnTmFtZSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZU9yZ05hbWUsXG4gICAgICBzdHlsZTogc3R5bGVzLnNlbGVjdCxcbiAgICAgIGNsYXNzTmFtZTogXCJub0ZvY3VzQnV0dG9uXCJcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIiwge1xuICAgICAga2V5OiBfdXRpbC5UdXRvcmlhbHNPcmdOYW1lLmFsbCxcbiAgICAgIHZhbHVlOiBfdXRpbC5UdXRvcmlhbHNPcmdOYW1lLmFsbFxuICAgIH0sIF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlck9yZ05hbWVzQWxsKCkpLCB0aGlzLnByb3BzLnVuaXF1ZU9yZ05hbWVzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcIm9wdGlvblwiLCB7XG4gICAgICAgIGtleTogaXRlbSxcbiAgICAgICAgdmFsdWU6IGl0ZW1cbiAgICAgIH0sIF90aGlzMi50cnVuY2F0ZU9yZ05hbWUoaXRlbSkpO1xuICAgIH0pKSk7XG4gIH07XG5cbiAgcmV0dXJuIEZpbHRlckdyb3VwT3JnTmFtZXM7XG59KF9yZWFjdFtcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBGaWx0ZXJHcm91cE9yZ05hbWVzO1xuXG5fZGVmaW5lUHJvcGVydHkoRmlsdGVyR3JvdXBPcmdOYW1lcywgXCJwcm9wVHlwZXNcIiwge1xuICBvcmdOYW1lOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgdW5pcXVlT3JnTmFtZXM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5T2YoX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nKS5pc1JlcXVpcmVkLFxuICBvblVzZXJJbnB1dDogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uZnVuYy5pc1JlcXVpcmVkXG59KTtcblxudmFyIHN0eWxlcyA9IHtcbiAgc2VsZWN0OiB7XG4gICAgd2lkdGg6ICcxMDAlJyxcbiAgICBtYXJnaW5Ub3A6IDEwLFxuICAgIGhlaWdodDogMjYsXG4gICAgZm9udFNpemU6IDEzXG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcHJvcFR5cGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicHJvcC10eXBlc1wiKSk7XG5cbnZhciBfcmVhY3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5cbnZhciBfZmlsdGVyR3JvdXBDb250YWluZXIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2ZpbHRlckdyb3VwQ29udGFpbmVyXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcblxudmFyIF9sb2NhbGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAY2RvL3R1dG9yaWFsRXhwbG9yZXIvbG9jYWxlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIEZpbHRlckdyb3VwU29ydEJ5ID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0c0xvb3NlKEZpbHRlckdyb3VwU29ydEJ5LCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICBmdW5jdGlvbiBGaWx0ZXJHcm91cFNvcnRCeSgpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgX3RoaXMgPSBfUmVhY3QkQ29tcG9uZW50LmNhbGwuYXBwbHkoX1JlYWN0JENvbXBvbmVudCwgW3RoaXNdLmNvbmNhdChhcmdzKSkgfHwgdGhpcztcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJoYW5kbGVDaGFuZ2VTb3J0XCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgX3RoaXMucHJvcHMub25Vc2VySW5wdXQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBGaWx0ZXJHcm91cFNvcnRCeS5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBTaG93IHRoZSBkZWZhdWx0IHNvcnQgY3JpdGVyaWEgZmlyc3QuICBUaGF0IHdheSwgd2hlbiB0aGUgZHJvcGRvd24gdGhhdFxuICAgIC8vIHNob3dzIFwiU29ydFwiIGlzIG9wZW5lZCB0byBzaG93IHRoZSB0d28gcG9zc2libGUgb3B0aW9ucywgdGhlIGRlZmF1bHRcbiAgICAvLyB3aWxsIGJlIGZpcnN0IGFuZCB3aWxsIGdldCB0aGUgY2hlY2ttYXJrIHRoYXQgc2VlbXMgdG8gYmUgYWx3YXlzIHNob3duXG4gICAgLy8gbmV4dCB0byB0aGUgZmlyc3Qgb3B0aW9uLlxuICAgIHZhciBzb3J0T3B0aW9ucztcblxuICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRTb3J0QnkgPT09IF91dGlsLlR1dG9yaWFsc1NvcnRCeU9wdGlvbnMucG9wdWxhcml0eXJhbmspIHtcbiAgICAgIHNvcnRPcHRpb25zID0gW3tcbiAgICAgICAgdmFsdWU6ICdwb3B1bGFyaXR5cmFuaycsXG4gICAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclNvcnRCeVBvcHVsYXJpdHlSYW5rKClcbiAgICAgIH0sIHtcbiAgICAgICAgdmFsdWU6ICdkaXNwbGF5d2VpZ2h0JyxcbiAgICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyU29ydEJ5RGlzcGxheVdlaWdodCgpXG4gICAgICB9XTtcbiAgICB9IGVsc2Uge1xuICAgICAgc29ydE9wdGlvbnMgPSBbe1xuICAgICAgICB2YWx1ZTogJ2Rpc3BsYXl3ZWlnaHQnLFxuICAgICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJTb3J0QnlEaXNwbGF5V2VpZ2h0KClcbiAgICAgIH0sIHtcbiAgICAgICAgdmFsdWU6ICdwb3B1bGFyaXR5cmFuaycsXG4gICAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclNvcnRCeVBvcHVsYXJpdHlSYW5rKClcbiAgICAgIH1dO1xuICAgIH1cblxuICAgIHJldHVybiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX2ZpbHRlckdyb3VwQ29udGFpbmVyW1wiZGVmYXVsdFwiXSwge1xuICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyU29ydEJ5KClcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCB7XG4gICAgICBodG1sRm9yOiBcImZpbHRlci1zb3J0LWJ5LWRyb3Bkb3duXCIsXG4gICAgICBjbGFzc05hbWU6IFwiaGlkZGVuLWxhYmVsXCJcbiAgICB9LCBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJTb3J0QnkoKSksIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcInNlbGVjdFwiLCB7XG4gICAgICBpZDogXCJmaWx0ZXItc29ydC1ieS1kcm9wZG93blwiLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuc29ydEJ5LFxuICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlQ2hhbmdlU29ydCxcbiAgICAgIHN0eWxlOiBzdHlsZXMuc2VsZWN0LFxuICAgICAgY2xhc3NOYW1lOiBcIm5vRm9jdXNCdXR0b25cIlxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcIm9wdGlvblwiLCB7XG4gICAgICB2YWx1ZTogc29ydE9wdGlvbnNbMF0udmFsdWVcbiAgICB9LCBzb3J0T3B0aW9uc1swXS50ZXh0KSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIsIHtcbiAgICAgIHZhbHVlOiBzb3J0T3B0aW9uc1sxXS52YWx1ZVxuICAgIH0sIHNvcnRPcHRpb25zWzFdLnRleHQpKSk7XG4gIH07XG5cbiAgcmV0dXJuIEZpbHRlckdyb3VwU29ydEJ5O1xufShfcmVhY3RbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRmlsdGVyR3JvdXBTb3J0Qnk7XG5cbl9kZWZpbmVQcm9wZXJ0eShGaWx0ZXJHcm91cFNvcnRCeSwgXCJwcm9wVHlwZXNcIiwge1xuICBkZWZhdWx0U29ydEJ5OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5vbmVPZihPYmplY3Qua2V5cyhfdXRpbC5UdXRvcmlhbHNTb3J0QnlPcHRpb25zKSkuaXNSZXF1aXJlZCxcbiAgc29ydEJ5OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5vbmVPZihPYmplY3Qua2V5cyhfdXRpbC5UdXRvcmlhbHNTb3J0QnlPcHRpb25zKSkuaXNSZXF1aXJlZCxcbiAgb25Vc2VySW5wdXQ6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmZ1bmMuaXNSZXF1aXJlZFxufSk7XG5cbnZhciBzdHlsZXMgPSB7XG4gIHNlbGVjdDoge1xuICAgIHdpZHRoOiAnMTAwJScsXG4gICAgbWFyZ2luVG9wOiAxMCxcbiAgICBoZWlnaHQ6IDI2LFxuICAgIGZvbnRTaXplOiAxM1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3Byb3BUeXBlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInByb3AtdHlwZXNcIikpO1xuXG52YXIgX3JlYWN0ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicmVhY3RcIikpO1xuXG52YXIgX2JhY2tCdXR0b24gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2JhY2tCdXR0b25cIikpO1xuXG52YXIgX2ZpbHRlckdyb3VwSGVhZGVyU2VsZWN0aW9uID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9maWx0ZXJHcm91cEhlYWRlclNlbGVjdGlvblwiKSk7XG5cbnZhciBfcmVzcG9uc2l2ZSA9IHJlcXVpcmUoXCIuL3Jlc3BvbnNpdmVcIik7XG5cbnZhciBfcmVhY3RTdGlja3kgPSByZXF1aXJlKFwicmVhY3Qtc3RpY2t5XCIpO1xuXG52YXIgX2xvY2FsZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBjZG8vdHV0b3JpYWxFeHBsb3Jlci9sb2NhbGVcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IHZhciBvd25LZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KHNvdXJjZSkpOyBpZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09ICdmdW5jdGlvbicpIHsgb3duS2V5cyA9IG93bktleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKS5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHN5bSkuZW51bWVyYWJsZTsgfSkpOyB9IG93bktleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgRmlsdGVySGVhZGVyID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0c0xvb3NlKEZpbHRlckhlYWRlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gRmlsdGVySGVhZGVyKCkge1xuICAgIHJldHVybiBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBGaWx0ZXJIZWFkZXIucHJvdG90eXBlO1xuXG4gIF9wcm90by5zaG91bGRTaG93T3BlbkZpbHRlcnNCdXR0b24gPSBmdW5jdGlvbiBzaG91bGRTaG93T3BlbkZpbHRlcnNCdXR0b24oKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMubW9iaWxlTGF5b3V0ICYmICF0aGlzLnByb3BzLnNob3dpbmdNb2RhbEZpbHRlcnM7XG4gIH07XG5cbiAgX3Byb3RvLnNob3VsZFNob3dDbG9zZUZpbHRlcnNCdXR0b24gPSBmdW5jdGlvbiBzaG91bGRTaG93Q2xvc2VGaWx0ZXJzQnV0dG9uKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLm1vYmlsZUxheW91dCAmJiB0aGlzLnByb3BzLnNob3dpbmdNb2RhbEZpbHRlcnM7XG4gIH07XG5cbiAgX3Byb3RvLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIHR1dG9yaWFsQ291bnQgPSB0aGlzLnByb3BzLmZpbHRlcmVkVHV0b3JpYWxzQ291bnQ7XG4gICAgdmFyIHR1dG9yaWFsQ291bnRTdHJpbmcgPSB0dXRvcmlhbENvdW50ID09PSAxID8gX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVySGVhZGVyVHV0b3JpYWxDb3VudFNpbmdsZSgpIDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVySGVhZGVyVHV0b3JpYWxDb3VudFBsdXJhbCh7XG4gICAgICB0dXRvcmlhbF9jb3VudDogdHV0b3JpYWxDb3VudFxuICAgIH0pOyAvLyBUaGVyZSBhcmUgdHdvIGZpbHRlcnMgd2hpY2ggY2FuIGFwcGVhciBpbiB0aGlzIGhlYWRlciBhdCBkZXNrdG9wIHdpZHRoLlxuICAgIC8vIENoZWNrIGV4cGxpY2l0bHkgZm9yIGVhY2guXG5cbiAgICB2YXIgZmlsdGVyR3JvdXBHcmFkZSA9IG51bGw7XG4gICAgdmFyIGZpbHRlckdyb3VwSGVhZGVyU3R1ZGVudEV4cGVyaWVuY2UgPSBudWxsO1xuXG4gICAgaWYgKCF0aGlzLnByb3BzLm1vYmlsZUxheW91dCkge1xuICAgICAgZmlsdGVyR3JvdXBHcmFkZSA9IHRoaXMucHJvcHMuZmlsdGVyR3JvdXBzLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSA9PT0gJ2dyYWRlJztcbiAgICAgIH0pO1xuICAgICAgZmlsdGVyR3JvdXBIZWFkZXJTdHVkZW50RXhwZXJpZW5jZSA9IHRoaXMucHJvcHMuZmlsdGVyR3JvdXBzLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSA9PT0gJ3N0dWRlbnRfZXhwZXJpZW5jZSc7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMuaGVhZGVyXG4gICAgfSwgdGhpcy5wcm9wcy5iYWNrQnV0dG9uICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfYmFja0J1dHRvbltcImRlZmF1bHRcIl0sIG51bGwpLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX3JlYWN0U3RpY2t5LlN0aWNreSwgbnVsbCwgZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciBzdHlsZSA9IF9yZWYuc3R5bGU7XG4gICAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgc3R5bGU6IF9vYmplY3RTcHJlYWQoe30sIHN0eWxlLCB7XG4gICAgICAgICAgekluZGV4OiAxXG4gICAgICAgIH0sICgwLCBfcmVzcG9uc2l2ZS5nZXRSZXNwb25zaXZlVmFsdWUpKHtcbiAgICAgICAgICB4czogc3R5bGVzLmJhck1vYmlsZSxcbiAgICAgICAgICBtZDogc3R5bGVzLmJhckRlc2t0b3BcbiAgICAgICAgfSkpXG4gICAgICB9LCAhX3RoaXMucHJvcHMubW9iaWxlTGF5b3V0ICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgIHN0eWxlOiBzdHlsZXMuZnVsbFxuICAgICAgfSwgZmlsdGVyR3JvdXBHcmFkZSAmJiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX2ZpbHRlckdyb3VwSGVhZGVyU2VsZWN0aW9uW1wiZGVmYXVsdFwiXSwge1xuICAgICAgICBjb250YWluZXJTdHlsZTogc3R5bGVzLmZpbHRlckdyb3VwR3JhZGVDb250YWluZXIsXG4gICAgICAgIGZpbHRlckdyb3VwOiBmaWx0ZXJHcm91cEdyYWRlLFxuICAgICAgICBzZWxlY3Rpb246IF90aGlzLnByb3BzLnNlbGVjdGlvblsnZ3JhZGUnXSxcbiAgICAgICAgb25Vc2VySW5wdXQ6IF90aGlzLnByb3BzLm9uVXNlcklucHV0RmlsdGVyXG4gICAgICB9KSwgZmlsdGVyR3JvdXBIZWFkZXJTdHVkZW50RXhwZXJpZW5jZSAmJiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX2ZpbHRlckdyb3VwSGVhZGVyU2VsZWN0aW9uW1wiZGVmYXVsdFwiXSwge1xuICAgICAgICBjb250YWluZXJTdHlsZTogc3R5bGVzLmZpbHRlckdyb3VwU3R1ZGVudEV4cGVyaWVuY2VDb250YWluZXIsXG4gICAgICAgIGZpbHRlckdyb3VwOiBmaWx0ZXJHcm91cEhlYWRlclN0dWRlbnRFeHBlcmllbmNlLFxuICAgICAgICBzZWxlY3Rpb246IF90aGlzLnByb3BzLnNlbGVjdGlvblsnc3R1ZGVudF9leHBlcmllbmNlJ10sXG4gICAgICAgIG9uVXNlcklucHV0OiBfdGhpcy5wcm9wcy5vblVzZXJJbnB1dEZpbHRlclxuICAgICAgfSkpLCBfdGhpcy5wcm9wcy5tb2JpbGVMYXlvdXQgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgIHN0eWxlOiBzdHlsZXMubGVmdFxuICAgICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7XG4gICAgICAgIHN0eWxlOiBzdHlsZXMubW9iaWxlQ291bnRcbiAgICAgIH0sIHR1dG9yaWFsQ291bnRTdHJpbmcpKSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgc3R5bGU6IHN0eWxlcy5yaWdodFxuICAgICAgfSwgX3RoaXMuc2hvdWxkU2hvd09wZW5GaWx0ZXJzQnV0dG9uKCkgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1xuICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICBvbkNsaWNrOiBfdGhpcy5wcm9wcy5zaG93TW9kYWxGaWx0ZXJzLFxuICAgICAgICBzdHlsZTogc3R5bGVzLmJ1dHRvbixcbiAgICAgICAgY2xhc3NOYW1lOiBcIm5vRm9jdXNCdXR0b25cIlxuICAgICAgfSwgX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVySGVhZGVyU2hvd0ZpbHRlcnMoKSkpLCBfdGhpcy5zaG91bGRTaG93Q2xvc2VGaWx0ZXJzQnV0dG9uKCkgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1xuICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICBvbkNsaWNrOiBfdGhpcy5wcm9wcy5oaWRlTW9kYWxGaWx0ZXJzLFxuICAgICAgICBzdHlsZTogc3R5bGVzLmJ1dHRvbixcbiAgICAgICAgY2xhc3NOYW1lOiBcIm5vRm9jdXNCdXR0b25cIlxuICAgICAgfSwgX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVySGVhZGVySGlkZUZpbHRlcnMoKSkpKSkpO1xuICAgIH0pKTtcbiAgfTtcblxuICByZXR1cm4gRmlsdGVySGVhZGVyO1xufShfcmVhY3RbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRmlsdGVySGVhZGVyO1xuXG5fZGVmaW5lUHJvcGVydHkoRmlsdGVySGVhZGVyLCBcInByb3BUeXBlc1wiLCB7XG4gIG1vYmlsZUxheW91dDogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uYm9vbC5pc1JlcXVpcmVkLFxuICBmaWx0ZXJHcm91cHM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5LmlzUmVxdWlyZWQsXG4gIHNlbGVjdGlvbjogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0ub2JqZWN0T2YoX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uYXJyYXlPZihfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmcpKS5pc1JlcXVpcmVkLFxuICBvblVzZXJJbnB1dEZpbHRlcjogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uZnVuYy5pc1JlcXVpcmVkLFxuICBiYWNrQnV0dG9uOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5ib29sLFxuICBmaWx0ZXJlZFR1dG9yaWFsc0NvdW50OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5udW1iZXIuaXNSZXF1aXJlZCxcbiAgc2hvd2luZ01vZGFsRmlsdGVyczogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uYm9vbC5pc1JlcXVpcmVkLFxuICBzaG93TW9kYWxGaWx0ZXJzOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5mdW5jLmlzUmVxdWlyZWQsXG4gIGhpZGVNb2RhbEZpbHRlcnM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmZ1bmMuaXNSZXF1aXJlZFxufSk7XG5cbnZhciBzdHlsZXMgPSB7XG4gIGhlYWRlcjoge1xuICAgIG1hcmdpblRvcDogOCxcbiAgICBtYXJnaW5Cb3R0b206IDgsXG4gICAgcGFkZGluZ0xlZnQ6IDcsXG4gICAgcGFkZGluZ1JpZ2h0OiA3LFxuICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJ1xuICB9LFxuICBiYXJEZXNrdG9wOiB7XG4gICAgY29sb3I6ICdkaW1ncmV5JyxcbiAgICBoZWlnaHQ6IDQ2LFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZSdcbiAgfSxcbiAgYmFyTW9iaWxlOiB7XG4gICAgY29sb3I6ICd3aGl0ZScsXG4gICAgaGVpZ2h0OiA0NixcbiAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnXG4gIH0sXG4gIGJ1dHRvbjoge1xuICAgIGJhY2tncm91bmRDb2xvcjogJyMyNzk5YTQnLFxuICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgIGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuICAgIGhlaWdodDogMzRcbiAgfSxcbiAgZnVsbDoge1xuICAgIFwiZmxvYXRcIjogJ2xlZnQnLFxuICAgIHdpZHRoOiAnMTAwJSdcbiAgfSxcbiAgbGVmdDoge1xuICAgIFwiZmxvYXRcIjogJ2xlZnQnLFxuICAgIG1hcmdpbkxlZnQ6IDZcbiAgfSxcbiAgcmlnaHQ6IHtcbiAgICBcImZsb2F0XCI6ICdyaWdodCcsXG4gICAgbWFyZ2luVG9wOiA2LFxuICAgIG1hcmdpblJpZ2h0OiA2XG4gIH0sXG4gIG1vYmlsZUNvdW50OiB7XG4gICAgbGluZUhlaWdodDogJzQ2cHgnLFxuICAgIHBhZGRpbmdMZWZ0OiA2LFxuICAgIGNvbG9yOiAnZGltZ3JleSdcbiAgfSxcbiAgZmlsdGVyR3JvdXBHcmFkZUNvbnRhaW5lcjoge1xuICAgIHdpZHRoOiAnNjglJyxcbiAgICBcImZsb2F0XCI6ICdsZWZ0J1xuICB9LFxuICBmaWx0ZXJHcm91cFN0dWRlbnRFeHBlcmllbmNlQ29udGFpbmVyOiB7XG4gICAgd2lkdGg6ICcyOCUnLFxuICAgIFwiZmxvYXRcIjogJ3JpZ2h0J1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3Byb3BUeXBlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInByb3AtdHlwZXNcIikpO1xuXG52YXIgX3JlYWN0ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicmVhY3RcIikpO1xuXG52YXIgX2ZpbHRlckdyb3VwID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9maWx0ZXJHcm91cFwiKSk7XG5cbnZhciBfcm9ib3RpY3NCdXR0b24gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3JvYm90aWNzQnV0dG9uXCIpKTtcblxudmFyIF9maWx0ZXJHcm91cFNvcnRCeSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vZmlsdGVyR3JvdXBTb3J0QnlcIikpO1xuXG52YXIgX2ZpbHRlckdyb3VwT3JnTmFtZXMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2ZpbHRlckdyb3VwT3JnTmFtZXNcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7IGlmIChzZWxmID09PSB2b2lkIDApIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgRmlsdGVyU2V0ID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0c0xvb3NlKEZpbHRlclNldCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gRmlsdGVyU2V0KCkge1xuICAgIHZhciBfdGhpcztcblxuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICBfdGhpcyA9IF9SZWFjdCRDb21wb25lbnQuY2FsbC5hcHBseShfUmVhY3QkQ29tcG9uZW50LCBbdGhpc10uY29uY2F0KGFyZ3MpKSB8fCB0aGlzO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImRpc3BsYXlJdGVtXCIsIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBpdGVtIGlzbid0IGZvcmNlZCBoaWRkZW4sIGFuZCB0aGF0IGl0J3Mgbm90IGhpZGRlbiBkdWUgdG8gYmVpbmdcbiAgICAgIC8vIGRlc2t0b3AgbGF5b3V0LlxuICAgICAgcmV0dXJuIGl0ZW0uZGlzcGxheSAhPT0gZmFsc2UgJiYgKF90aGlzLnByb3BzLm1vYmlsZUxheW91dCB8fCAhX3RoaXMucHJvcHMubW9iaWxlTGF5b3V0ICYmICFpdGVtLmhlYWRlck9uRGVza3RvcCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gRmlsdGVyU2V0LnByb3RvdHlwZTtcblxuICBfcHJvdG8ucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCB0aGlzLnByb3BzLnNob3dTb3J0RHJvcGRvd24gJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9maWx0ZXJHcm91cFNvcnRCeVtcImRlZmF1bHRcIl0sIHtcbiAgICAgIGRlZmF1bHRTb3J0Qnk6IHRoaXMucHJvcHMuZGVmYXVsdFNvcnRCeSxcbiAgICAgIHNvcnRCeTogdGhpcy5wcm9wcy5zb3J0QnksXG4gICAgICBvblVzZXJJbnB1dDogdGhpcy5wcm9wcy5vblVzZXJJbnB1dFNvcnRCeVxuICAgIH0pLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX2ZpbHRlckdyb3VwT3JnTmFtZXNbXCJkZWZhdWx0XCJdLCB7XG4gICAgICBvcmdOYW1lOiB0aGlzLnByb3BzLm9yZ05hbWUsXG4gICAgICB1bmlxdWVPcmdOYW1lczogdGhpcy5wcm9wcy51bmlxdWVPcmdOYW1lcyxcbiAgICAgIG9uVXNlcklucHV0OiB0aGlzLnByb3BzLm9uVXNlcklucHV0T3JnTmFtZVxuICAgIH0pLCB0aGlzLnByb3BzLmZpbHRlckdyb3Vwcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiBfdGhpczIuZGlzcGxheUl0ZW0oaXRlbSkgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9maWx0ZXJHcm91cFtcImRlZmF1bHRcIl0sIHtcbiAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICB0ZXh0OiBpdGVtLnRleHQsXG4gICAgICAgIGZpbHRlckVudHJpZXM6IGl0ZW0uZW50cmllcyxcbiAgICAgICAgb25Vc2VySW5wdXQ6IF90aGlzMi5wcm9wcy5vblVzZXJJbnB1dEZpbHRlcixcbiAgICAgICAgc2VsZWN0aW9uOiBfdGhpczIucHJvcHMuc2VsZWN0aW9uW2l0ZW0ubmFtZV0sXG4gICAgICAgIHNpbmdsZUVudHJ5OiBpdGVtLnNpbmdsZUVudHJ5IHx8IGZhbHNlLFxuICAgICAgICBrZXk6IGl0ZW0ubmFtZVxuICAgICAgfSk7XG4gICAgfSksIHRoaXMucHJvcHMucm9ib3RpY3NCdXR0b25VcmwgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9yb2JvdGljc0J1dHRvbltcImRlZmF1bHRcIl0sIHtcbiAgICAgIHVybDogdGhpcy5wcm9wcy5yb2JvdGljc0J1dHRvblVybFxuICAgIH0pKTtcbiAgfTtcblxuICByZXR1cm4gRmlsdGVyU2V0O1xufShfcmVhY3RbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRmlsdGVyU2V0O1xuXG5fZGVmaW5lUHJvcGVydHkoRmlsdGVyU2V0LCBcInByb3BUeXBlc1wiLCB7XG4gIG1vYmlsZUxheW91dDogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uYm9vbC5pc1JlcXVpcmVkLFxuICB1bmlxdWVPcmdOYW1lczogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uYXJyYXlPZihfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmcpLmlzUmVxdWlyZWQsXG4gIG9yZ05hbWU6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLnN0cmluZyxcbiAgc2hvd1NvcnREcm9wZG93bjogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uYm9vbC5pc1JlcXVpcmVkLFxuICBkZWZhdWx0U29ydEJ5OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5vbmVPZihPYmplY3Qua2V5cyhfdXRpbC5UdXRvcmlhbHNTb3J0QnlPcHRpb25zKSkuaXNSZXF1aXJlZCxcbiAgc29ydEJ5OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5vbmVPZihPYmplY3Qua2V5cyhfdXRpbC5UdXRvcmlhbHNTb3J0QnlPcHRpb25zKSkuaXNSZXF1aXJlZCxcbiAgZmlsdGVyR3JvdXBzOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5hcnJheS5pc1JlcXVpcmVkLFxuICBzZWxlY3Rpb246IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLm9iamVjdE9mKF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5T2YoX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nKSkuaXNSZXF1aXJlZCxcbiAgb25Vc2VySW5wdXRGaWx0ZXI6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25Vc2VySW5wdXRPcmdOYW1lOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5mdW5jLmlzUmVxdWlyZWQsXG4gIG9uVXNlcklucHV0U29ydEJ5OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5mdW5jLmlzUmVxdWlyZWQsXG4gIHJvYm90aWNzQnV0dG9uVXJsOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmdcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcHJvcFR5cGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicHJvcC10eXBlc1wiKSk7XG5cbnZhciBfcmVhY3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5cbnZhciBfcmVhY3REb20gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdC1kb21cIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2V4dGVuZHMoKSB7IF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTsgcmV0dXJuIF9leHRlbmRzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IHZhciBvd25LZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KHNvdXJjZSkpOyBpZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09ICdmdW5jdGlvbicpIHsgb3duS2V5cyA9IG93bktleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKS5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHN5bSkuZW51bWVyYWJsZTsgfSkpOyB9IG93bktleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIEltYWdlID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0c0xvb3NlKEltYWdlLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICBmdW5jdGlvbiBJbWFnZSgpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgX3RoaXMgPSBfUmVhY3QkQ29tcG9uZW50LmNhbGwuYXBwbHkoX1JlYWN0JENvbXBvbmVudCwgW3RoaXNdLmNvbmNhdChhcmdzKSkgfHwgdGhpcztcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJzdGF0ZVwiLCB7XG4gICAgICBsb2FkZWQ6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwib25JbWFnZUxvYWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGVkOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBJbWFnZS5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIGltZ1RhZyA9IF9yZWFjdERvbVtcImRlZmF1bHRcIl0uZmluZERPTU5vZGUodGhpcy5yZWZzLmltZyk7XG5cbiAgICB2YXIgaW1nU3JjID0gaW1nVGFnLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgdmFyIGltZyA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcbiAgICBpbWcuc3JjID0gaW1nU3JjO1xuICB9O1xuXG4gIF9wcm90by5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHN0eWxlO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUubG9hZGVkKSB7XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgdHJhbnNpdGlvbjogJ29wYWNpdHkgMjAwbXMgZWFzZS1pbidcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlID0ge1xuICAgICAgICBvcGFjaXR5OiAwLjFcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImltZ1wiLCBfZXh0ZW5kcyh7XG4gICAgICByZWY6IFwiaW1nXCJcbiAgICB9LCB0aGlzLnByb3BzLCB7XG4gICAgICBzdHlsZTogX29iamVjdFNwcmVhZCh7fSwgdGhpcy5wcm9wcy5zdHlsZSwgc3R5bGUpLFxuICAgICAgb25Mb2FkOiB0aGlzLm9uSW1hZ2VMb2FkXG4gICAgfSkpO1xuICB9O1xuXG4gIHJldHVybiBJbWFnZTtcbn0oX3JlYWN0W1wiZGVmYXVsdFwiXS5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEltYWdlO1xuXG5fZGVmaW5lUHJvcGVydHkoSW1hZ2UsIFwicHJvcFR5cGVzXCIsIHtcbiAgc3R5bGU6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLm9iamVjdC5pc1JlcXVpcmVkXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9zYWZlTG9hZExvY2FsZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBjZG8vYXBwcy91dGlsL3NhZmVMb2FkTG9jYWxlXCIpKTtcblxudmFyIF9pMThuU3RyaW5nVHJhY2tlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBjZG8vYXBwcy91dGlsL2kxOG5TdHJpbmdUcmFja2VyXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qKlxuICogRE8gTk9UIElNUE9SVCBUSElTIERJUkVDVExZLiBJbnN0ZWFkIGRvOlxuICogICBgYGBcbiAqICAgaW1wb3J0IG1zZyBmcm9tICdAY2RvL3R1dG9yaWFsRXhwbG9yZXIvbG9jYWxlJy5cbiAqICAgYGBgXG4gKiBUaGlzIGFsbG93cyB0aGUgd2VicGFjayBjb25maWcgdG8gZGV0ZXJtaW5lIGhvdyBsb2NhbGVzIHNob3VsZCBiZSBsb2FkZWQsXG4gKiB3aGljaCBpcyBpbXBvcnRhbnQgZm9yIG1ha2luZyBsb2NhbGUgc2V0dXAgd29yayBzZWFtbGVzc2x5IGluIHRlc3RzLlxuICovXG52YXIgbG9jYWxlID0gKDAsIF9zYWZlTG9hZExvY2FsZVtcImRlZmF1bHRcIl0pKCd0dXRvcmlhbEV4cGxvcmVyX2xvY2FsZScpO1xubG9jYWxlID0gKDAsIF9pMThuU3RyaW5nVHJhY2tlcltcImRlZmF1bHRcIl0pKGxvY2FsZSwgJ3R1dG9yaWFsRXhwbG9yZXInKTtcbm1vZHVsZS5leHBvcnRzID0gbG9jYWxlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZXRSZXNwb25zaXZlQ29udGFpbmVyV2lkdGggPSBnZXRSZXNwb25zaXZlQ29udGFpbmVyV2lkdGg7XG5leHBvcnRzLmdldFJlc3BvbnNpdmVXaW5kb3dXaWR0aCA9IGdldFJlc3BvbnNpdmVXaW5kb3dXaWR0aDtcbmV4cG9ydHMuaXNSZXNwb25zaXZlQ2F0ZWdvcnlBY3RpdmUgPSBpc1Jlc3BvbnNpdmVDYXRlZ29yeUFjdGl2ZTtcbmV4cG9ydHMuaXNSZXNwb25zaXZlQ2F0ZWdvcnlJbmFjdGl2ZSA9IGlzUmVzcG9uc2l2ZUNhdGVnb3J5SW5hY3RpdmU7XG5leHBvcnRzLmdldFJlc3BvbnNpdmVWYWx1ZSA9IGdldFJlc3BvbnNpdmVWYWx1ZTtcblxudmFyIF9qcXVlcnkgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJqcXVlcnlcIikpO1xuXG52YXIgdXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChyZXF1aXJlKFwiLi4vdXRpbHNcIikpO1xuXG52YXIgX3Jlc3BvbnNpdmVXaW5kb3dXaWR0O1xuXG5mdW5jdGlvbiBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKSB7IGlmICh0eXBlb2YgV2Vha01hcCAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gbnVsbDsgdmFyIGNhY2hlID0gbmV3IFdlYWtNYXAoKTsgX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlID0gZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCkgeyByZXR1cm4gY2FjaGU7IH07IHJldHVybiBjYWNoZTsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGlmIChvYmogPT09IG51bGwgfHwgX3R5cGVvZihvYmopICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvYmogIT09IFwiZnVuY3Rpb25cIikgeyByZXR1cm4geyBcImRlZmF1bHRcIjogb2JqIH07IH0gdmFyIGNhY2hlID0gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCk7IGlmIChjYWNoZSAmJiBjYWNoZS5oYXMob2JqKSkgeyByZXR1cm4gY2FjaGUuZ2V0KG9iaik7IH0gdmFyIG5ld09iaiA9IHt9OyB2YXIgaGFzUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmRlZmluZVByb3BlcnR5ICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHsgdmFyIGRlc2MgPSBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KSA6IG51bGw7IGlmIChkZXNjICYmIChkZXNjLmdldCB8fCBkZXNjLnNldCkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5ld09iaiwga2V5LCBkZXNjKTsgfSBlbHNlIHsgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IH0gbmV3T2JqW1wiZGVmYXVsdFwiXSA9IG9iajsgaWYgKGNhY2hlKSB7IGNhY2hlLnNldChvYmosIG5ld09iaik7IH0gcmV0dXJuIG5ld09iajsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mKG9iaik7IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxuLyoqXG4gKiBHZXRzIHRoZSBjb250YWluZXIgd2lkdGguXG4gKiBSZXR1cm5zIGVpdGhlciBhIG51bWJlciAoZS5nLiAxMTcwKSBvciBhIHN0cmluZyAoZS5nLiBcIjk3JVwiKS5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVzcG9uc2l2ZUNvbnRhaW5lcldpZHRoKCkge1xuICB2YXIgd2luZG93V2lkdGggPSAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKHdpbmRvdykud2lkdGgoKTtcblxuICBpZiAod2luZG93V2lkdGggPj0gMTIwMCkge1xuICAgIHJldHVybiAxMTcwO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnOTclJztcbiAgfVxufSAvLyBtYWtlRW51bSBjb21lcyBmcm9tIGFwcHMvc3JjL3V0aWxzXG5cblxudmFyIFJlc3BvbnNpdmVTaXplID0gdXRpbHMubWFrZUVudW0oJ2xnJywgJ21kJywgJ3NtJywgJ3hzJyk7IC8vIFdpbmRvdyB3aWR0aHMgdGhhdCBhcmUgdGhlIHN0YXJ0aW5nIHBvaW50cyBmb3IgZWFjaCB3aWR0aCBjYXRlZ29yeS5cblxudmFyIHJlc3BvbnNpdmVXaW5kb3dXaWR0aCA9IChfcmVzcG9uc2l2ZVdpbmRvd1dpZHQgPSB7fSwgX2RlZmluZVByb3BlcnR5KF9yZXNwb25zaXZlV2luZG93V2lkdCwgUmVzcG9uc2l2ZVNpemUubGcsIDEwMjQpLCBfZGVmaW5lUHJvcGVydHkoX3Jlc3BvbnNpdmVXaW5kb3dXaWR0LCBSZXNwb25zaXZlU2l6ZS5tZCwgODIwKSwgX2RlZmluZVByb3BlcnR5KF9yZXNwb25zaXZlV2luZG93V2lkdCwgUmVzcG9uc2l2ZVNpemUuc20sIDY1MCksIF9kZWZpbmVQcm9wZXJ0eShfcmVzcG9uc2l2ZVdpbmRvd1dpZHQsIFJlc3BvbnNpdmVTaXplLnhzLCAwKSwgX3Jlc3BvbnNpdmVXaW5kb3dXaWR0KTtcbi8qKlxuICogUmV0dXJucyB0aGUgd2luZG93IHdpZHRoIHRoYXQgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciBhIHdpZHRoIGNhdGVnb3J5LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFwieHNcIiwgXCJzbVwiLCBcIm1kXCIsIG9yIFwibGdcIlxuICovXG5cbmZ1bmN0aW9uIGdldFJlc3BvbnNpdmVXaW5kb3dXaWR0aChjYXRlZ29yeSkge1xuICByZXR1cm4gcmVzcG9uc2l2ZVdpbmRvd1dpZHRoW2NhdGVnb3J5XTtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHByb3ZpZGVkIGNhdGVnb3J5IGlzIGFjdGl2ZSwgZ2l2ZW4gY3VycmVudCB3aW5kb3cgd2lkdGguXG4gKiBlLmcuIGNhbGxlZCB3aXRoIFwibWRcIiB3aGVuIHdpbmRvdyB3aWR0aCA+PSA4MjBweCByZXR1cm5zIHRydWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gXCJ4c1wiLCBcInNtXCIsIFwibWRcIiwgb3IgXCJsZ1wiXG4gKi9cblxuXG5mdW5jdGlvbiBpc1Jlc3BvbnNpdmVDYXRlZ29yeUFjdGl2ZShjYXRlZ29yeSkge1xuICByZXR1cm4gKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSh3aW5kb3cpLndpZHRoKCkgPj0gcmVzcG9uc2l2ZVdpbmRvd1dpZHRoW2NhdGVnb3J5XTtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHByb3ZpZGVkIGNhdGVnb3J5IGlzIGluYWN0aXZlLCBnaXZlbiBjdXJyZW50IHdpbmRvdyB3aWR0aC5cbiAqIGUuZy4gY2FsbGVkIHdpdGggXCJtZFwiIHdoZW4gd2luZG93IHdpZHRoIDwgODIwcHggcmV0dXJucyBmYWxzZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBcInhzXCIsIFwic21cIiwgXCJtZFwiLCBvciBcImxnXCJcbiAqL1xuXG5cbmZ1bmN0aW9uIGlzUmVzcG9uc2l2ZUNhdGVnb3J5SW5hY3RpdmUoY2F0ZWdvcnkpIHtcbiAgcmV0dXJuICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkod2luZG93KS53aWR0aCgpIDwgcmVzcG9uc2l2ZVdpbmRvd1dpZHRoW2NhdGVnb3J5XTtcbn1cbi8qKlxuICogRnJvbSBhIHNldCBvZiB2YWx1ZXMgcHJvdmlkZWQsIHJldHVybnMgdGhlIGFwcHJvcHJpYXRlIG9uZSBmb3IgdGhlIGN1cnJlbnRcbiAqIHdpbmRvdyB3aWR0aC5cbiAqIE5vdGUgdGhhdCB3ZSBkZWZhdWx0IHRvIHRoZSBsYXJnZXN0LXByb3ZpZGVkIHZhbHVlIHRoYXQgaXMgbm90IGZvciBhIHdpZHRoXG4gKiB0aGF0J3MgZ3JlYXRlciB0aGFuIHRoZSBjdXJyZW50IHdpbmRvdyB3aWR0aC4gIGUuZy4gSWYgdGhlIHdpbmRvdyB3aWR0aCBpc1xuICogXCJtZFwiIHRoZW4gd2UgdXNlIHRoZSBwcm92aWRlZCBcIm1kXCIgd2lkdGgsIG90aGVyd2lzZSB0aGUgcHJvdmlkZWQgXCJzbVwiIHdpZHRoLFxuICogb3RoZXJ3aXNlIHRoZSBwcm92aWRlZCBcInhzXCIgd2lkdGguXG4gKiBOb3RlIGFsc28gdGhhdCB3aGVuIHRoZSB2YWx1ZSBiZWluZyByZXR1cm5lZCBpcyBhIG51bWJlciwgaXQncyBjb252ZXJ0ZWQgaW50b1xuICogYSBwZXJjZW50YWdlIHN0cmluZy4gIGUuZy4gNCBiZWNvbWVzIFwiNCVcIlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZXMgLSBBIHNldCBvZiB2YWx1ZXMgZnJvbSB3aGljaCB3ZSB3YW50IG9uZS5cbiAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gdmFsdWVzLnhzIC0gVmFsdWUgcmV0dXJuZWQgb24gZXh0cmEtc21hbGwgbGF5b3V0LlxuICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSB2YWx1ZXMuc20gLSBWYWx1ZSByZXR1cm5lZCBvbiBzbWFsbCBsYXlvdXQuXG4gKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IHZhbHVlcy5tZCAtIFZhbHVlIHJldHVybmVkIG9uIG1lZGl1bSBsYXlvdXQuXG4gKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IHZhbHVlcy5sZyAtIFZhbHVlIHJldHVybmVkIG9uIGxhcmdlIGxheW91dC5cbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJlc3BvbnNpdmVWYWx1ZSh2YWx1ZXMpIHtcbiAgdmFyIHdpbmRvd1dpZHRoID0gKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSh3aW5kb3cpLndpZHRoKCk7XG4gIHZhciB2YWx1ZTtcblxuICBpZiAod2luZG93V2lkdGggPj0gcmVzcG9uc2l2ZVdpbmRvd1dpZHRoW1Jlc3BvbnNpdmVTaXplLmxnXSkge1xuICAgIGlmICh2YWx1ZXMubGcpIHtcbiAgICAgIHZhbHVlID0gdmFsdWVzLmxnO1xuICAgIH0gZWxzZSBpZiAodmFsdWVzLm1kKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlcy5tZDtcbiAgICB9IGVsc2UgaWYgKHZhbHVlcy5zbSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZXMuc207XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdmFsdWVzLnhzO1xuICAgIH1cbiAgfSBlbHNlIGlmICh3aW5kb3dXaWR0aCA+PSByZXNwb25zaXZlV2luZG93V2lkdGhbUmVzcG9uc2l2ZVNpemUubWRdKSB7XG4gICAgaWYgKHZhbHVlcy5tZCkge1xuICAgICAgdmFsdWUgPSB2YWx1ZXMubWQ7XG4gICAgfSBlbHNlIGlmICh2YWx1ZXMuc20pIHtcbiAgICAgIHZhbHVlID0gdmFsdWVzLnNtO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlcy54cztcbiAgICB9XG4gIH0gZWxzZSBpZiAod2luZG93V2lkdGggPj0gcmVzcG9uc2l2ZVdpbmRvd1dpZHRoW1Jlc3BvbnNpdmVTaXplLnNtXSkge1xuICAgIGlmICh2YWx1ZXMuc20pIHtcbiAgICAgIHZhbHVlID0gdmFsdWVzLnNtO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlcy54cztcbiAgICB9XG4gIH0gZWxzZSBpZiAodmFsdWVzLnhzKSB7XG4gICAgdmFsdWUgPSB2YWx1ZXMueHM7XG4gIH1cblxuICBpZiAodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHZhbHVlLCBcIiVcIik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChfdHlwZW9mKHZhbHVlKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH1cbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3Byb3BUeXBlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInByb3AtdHlwZXNcIikpO1xuXG52YXIgX3JlYWN0ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicmVhY3RcIikpO1xuXG52YXIgX3Jlc3BvbnNpdmUgPSByZXF1aXJlKFwiLi9yZXNwb25zaXZlXCIpO1xuXG52YXIgX2xvY2FsZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBjZG8vdHV0b3JpYWxFeHBsb3Jlci9sb2NhbGVcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IHZhciBvd25LZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KHNvdXJjZSkpOyBpZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09ICdmdW5jdGlvbicpIHsgb3duS2V5cyA9IG93bktleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKS5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHN5bSkuZW51bWVyYWJsZTsgfSkpOyB9IG93bktleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgUm9ib3RpY3NCdXR0b24gPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgX2luaGVyaXRzTG9vc2UoUm9ib3RpY3NCdXR0b24sIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gIGZ1bmN0aW9uIFJvYm90aWNzQnV0dG9uKCkge1xuICAgIHJldHVybiBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBSb2JvdGljc0J1dHRvbi5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcm9ib3RpY3NUZXh0U3R5bGUgPSBfb2JqZWN0U3ByZWFkKHt9LCBzdHlsZXMucm9ib3RpY3NUZXh0LCB7XG4gICAgICBkaXNwbGF5OiAoMCwgX3Jlc3BvbnNpdmUuZ2V0UmVzcG9uc2l2ZVZhbHVlKSh7XG4gICAgICAgIHhzOiAnYmxvY2snLFxuICAgICAgICBtZDogJ25vbmUnXG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IHtcbiAgICAgICAgZGlzcGxheTogKDAsIF9yZXNwb25zaXZlLmdldFJlc3BvbnNpdmVWYWx1ZSkoe1xuICAgICAgICAgIG1kOiAnYmxvY2snLFxuICAgICAgICAgIHhzOiAnbm9uZSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IHN0eWxlcy5idXR0b25cbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcbiAgICAgIGhyZWY6IHRoaXMucHJvcHMudXJsXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMuY29udGFpbmVyXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIHtcbiAgICAgIHNyYzogXCIvaW1hZ2VzL2xlYXJuL3JvYm90aWNzLWxpbmsucG5nXCIsXG4gICAgICBzdHlsZTogc3R5bGVzLnJvYm90aWNzQnV0dG9uSW1hZ2UsXG4gICAgICBhbHQ6IFwiXCJcbiAgICB9KSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMucm9ib3RpY3NCdXR0b25UZXh0XG4gICAgfSwgX2xvY2FsZVtcImRlZmF1bHRcIl0ucm9ib3RpY3NCdXR0b25UZXh0KCksIFwiXFx4QTBcIiwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiaVwiLCB7XG4gICAgICBjbGFzc05hbWU6IFwiZmEgZmEtYXJyb3ctcmlnaHRcIixcbiAgICAgIFwiYXJpYS1oaWRkZW5cIjogdHJ1ZVxuICAgIH0pKSkpKSksIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogcm9ib3RpY3NUZXh0U3R5bGVcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcbiAgICAgIGhyZWY6IHRoaXMucHJvcHMudXJsXG4gICAgfSwgX2xvY2FsZVtcImRlZmF1bHRcIl0ucm9ib3RpY3NUZXh0KCkpKSk7XG4gIH07XG5cbiAgcmV0dXJuIFJvYm90aWNzQnV0dG9uO1xufShfcmVhY3RbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gUm9ib3RpY3NCdXR0b247XG5cbl9kZWZpbmVQcm9wZXJ0eShSb2JvdGljc0J1dHRvbiwgXCJwcm9wVHlwZXNcIiwge1xuICB1cmw6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLnN0cmluZ1xufSk7XG5cbnZhciBzdHlsZXMgPSB7XG4gIGJ1dHRvbjoge1xuICAgIFwiZmxvYXRcIjogJ2xlZnQnLFxuICAgIHdpZHRoOiAnMTAwJScsXG4gICAgcGFkZGluZ0xlZnQ6IDEwLFxuICAgIHBhZGRpbmdSaWdodDogNDBcbiAgfSxcbiAgY29udGFpbmVyOiB7XG4gICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgfSxcbiAgcm9ib3RpY3NCdXR0b25JbWFnZToge1xuICAgIG1hcmdpblRvcDogMTAsXG4gICAgbWFyZ2luQm90dG9tOiAyMCxcbiAgICB3aWR0aDogJzEwMCUnXG4gIH0sXG4gIHJvYm90aWNzQnV0dG9uVGV4dDoge1xuICAgIGZvbnRGYW1pbHk6IFwiJ0dvdGhhbSA0cicsIHNhbnMtc2VyaWZcIixcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICB0b3A6IDAsXG4gICAgbGVmdDogMCxcbiAgICBtYXJnaW46ICcyNXB4IDE1cHggMTVweCAxNXB4JyxcbiAgICBjb2xvcjogJ3doaXRlJyxcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgIGZvbnRTaXplOiAxNlxuICB9LFxuICByb2JvdGljc1RleHQ6IHtcbiAgICBcImZsb2F0XCI6ICdsZWZ0JyxcbiAgICBtYXJnaW46IDUsXG4gICAgcGFkZGluZzogNSxcbiAgICBib3JkZXJSYWRpdXM6IDUsXG4gICAgbWFyZ2luQm90dG9tOiAyMCxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZWVlJ1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3Byb3BUeXBlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInByb3AtdHlwZXNcIikpO1xuXG52YXIgX3JlYWN0ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicmVhY3RcIikpO1xuXG52YXIgX2ZpbHRlckdyb3VwQ29udGFpbmVyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9maWx0ZXJHcm91cENvbnRhaW5lclwiKSk7XG5cbnZhciBfU2VhcmNoQmFyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi4vdGVtcGxhdGVzL1NlYXJjaEJhclwiKSk7XG5cbnZhciBfZGVib3VuY2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gvZGVib3VuY2VcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7IGlmIChzZWxmID09PSB2b2lkIDApIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgU2VhcmNoID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0c0xvb3NlKFNlYXJjaCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gU2VhcmNoKCkge1xuICAgIHZhciBfdGhpcztcblxuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICBfdGhpcyA9IF9SZWFjdCRDb21wb25lbnQuY2FsbC5hcHBseShfUmVhY3QkQ29tcG9uZW50LCBbdGhpc10uY29uY2F0KGFyZ3MpKSB8fCB0aGlzO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImRlYm91bmNlZE9uQ2hhbmdlXCIsICgwLCBfZGVib3VuY2VbXCJkZWZhdWx0XCJdKShfdGhpcy5wcm9wcy5vbkNoYW5nZSwgMzAwKSk7XG5cbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwiaGFuZGxlQ2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgdmFsdWUgPSBlID8gZS50YXJnZXQudmFsdWUgOiAnJztcblxuICAgICAgX3RoaXMuZGVib3VuY2VkT25DaGFuZ2UodmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFNlYXJjaC5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9maWx0ZXJHcm91cENvbnRhaW5lcltcImRlZmF1bHRcIl0sIHtcbiAgICAgIHRleHQ6IFwiU2VhcmNoXCJcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX1NlYXJjaEJhcltcImRlZmF1bHRcIl0sIHtcbiAgICAgIGNsZWFyQnV0dG9uOiB0aGlzLnByb3BzLnNob3dDbGVhckljb24sXG4gICAgICBvbkNoYW5nZTogdGhpcy5oYW5kbGVDaGFuZ2UsXG4gICAgICBwbGFjZWhvbGRlclRleHQ6IFwiXCJcbiAgICB9KSk7XG4gIH07XG5cbiAgcmV0dXJuIFNlYXJjaDtcbn0oX3JlYWN0W1wiZGVmYXVsdFwiXS5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFNlYXJjaDtcblxuX2RlZmluZVByb3BlcnR5KFNlYXJjaCwgXCJwcm9wVHlwZXNcIiwge1xuICBvbkNoYW5nZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uZnVuYy5pc1JlcXVpcmVkLFxuICBzaG93Q2xlYXJJY29uOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5ib29sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3Byb3BUeXBlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInByb3AtdHlwZXNcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyogQ29tbW9uIHNoYXBlcyB1c2VkIGZvciBSZWFjdCBwcm9wIHZhbGlkYXRpb24uXG4gKi9cbnZhciBzaGFwZXMgPSB7XG4gIHR1dG9yaWFsOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zaGFwZSh7XG4gICAgdGFnc19sZW5ndGg6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLnN0cmluZyxcbiAgICB0YWdzX3N1YmplY3Q6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLnN0cmluZyxcbiAgICB0YWdzX3N0dWRlbnRfZXhwZXJpZW5jZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nLFxuICAgIHRhZ3NfYWN0aXZpdHlfdHlwZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nLFxuICAgIHRhZ3NfaW50ZXJuYXRpb25hbF9sYW5ndWFnZXM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLnN0cmluZyxcbiAgICB0YWdzX2dyYWRlOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmcsXG4gICAgdGFnc19wcm9ncmFtbWluZ19sYW5ndWFnZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nXG4gIH0pXG59O1xudmFyIF9kZWZhdWx0ID0gc2hhcGVzO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9wcm9wVHlwZXMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJwcm9wLXR5cGVzXCIpKTtcblxudmFyIF9yZWFjdCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInJlYWN0XCIpKTtcblxudmFyIF9sb2NhbGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAY2RvL3R1dG9yaWFsRXhwbG9yZXIvbG9jYWxlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgVG9nZ2xlQWxsVHV0b3JpYWxzQnV0dG9uID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0c0xvb3NlKFRvZ2dsZUFsbFR1dG9yaWFsc0J1dHRvbiwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gVG9nZ2xlQWxsVHV0b3JpYWxzQnV0dG9uKCkge1xuICAgIHJldHVybiBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBUb2dnbGVBbGxUdXRvcmlhbHNCdXR0b24ucHJvdG90eXBlO1xuXG4gIF9wcm90by5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnRvZ2dsZUFsbFR1dG9yaWFsc0Jsb2NrXG4gICAgfSwgIXRoaXMucHJvcHMuc2hvd2luZ0FsbFR1dG9yaWFscyAmJiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1xuICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMuc2hvd0FsbFR1dG9yaWFsc1xuICAgIH0sIF9sb2NhbGVbXCJkZWZhdWx0XCJdLnNob3dBbGxUdXRvcmlhbHNCdXR0b24oKSwgXCJcXHhBMFwiLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJmYSBmYS1jYXJldC1kb3duXCIsXG4gICAgICBcImFyaWEtaGlkZGVuXCI6IHRydWVcbiAgICB9KSksIHRoaXMucHJvcHMuc2hvd2luZ0FsbFR1dG9yaWFscyAmJiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1xuICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMuaGlkZUFsbFR1dG9yaWFsc1xuICAgIH0sIF9sb2NhbGVbXCJkZWZhdWx0XCJdLmhpZGVBbGxUdXRvcmlhbHNCdXR0b24oKSwgXCJcXHhBMFwiLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJmYSBmYS1jYXJldC11cFwiLFxuICAgICAgXCJhcmlhLWhpZGRlblwiOiB0cnVlXG4gICAgfSkpKTtcbiAgfTtcblxuICByZXR1cm4gVG9nZ2xlQWxsVHV0b3JpYWxzQnV0dG9uO1xufShfcmVhY3RbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gVG9nZ2xlQWxsVHV0b3JpYWxzQnV0dG9uO1xuXG5fZGVmaW5lUHJvcGVydHkoVG9nZ2xlQWxsVHV0b3JpYWxzQnV0dG9uLCBcInByb3BUeXBlc1wiLCB7XG4gIHNob3dBbGxUdXRvcmlhbHM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmZ1bmMuaXNSZXF1aXJlZCxcbiAgaGlkZUFsbFR1dG9yaWFsczogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uZnVuYy5pc1JlcXVpcmVkLFxuICBzaG93aW5nQWxsVHV0b3JpYWxzOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5ib29sXG59KTtcblxudmFyIHN0eWxlcyA9IHtcbiAgdG9nZ2xlQWxsVHV0b3JpYWxzQmxvY2s6IHtcbiAgICB3aWR0aDogJzEwMCUnLFxuICAgIGNsZWFyOiAnYm90aCcsXG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICBwYWRkaW5nVG9wOiAzMCxcbiAgICBwYWRkaW5nQm90dG9tOiAzMFxuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3Byb3BUeXBlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInByb3AtdHlwZXNcIikpO1xuXG52YXIgX3JlYWN0ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicmVhY3RcIikpO1xuXG52YXIgX3NoYXBlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vc2hhcGVzXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcblxudmFyIF9yZXNwb25zaXZlID0gcmVxdWlyZShcIi4vcmVzcG9uc2l2ZVwiKTtcblxudmFyIF9pbWFnZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaW1hZ2VcIikpO1xuXG52YXIgX3JlYWN0TGF6eUxvYWQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdC1sYXp5LWxvYWRcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IHZhciBvd25LZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KHNvdXJjZSkpOyBpZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09ICdmdW5jdGlvbicpIHsgb3duS2V5cyA9IG93bktleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKS5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHN5bSkuZW51bWVyYWJsZTsgfSkpOyB9IG93bktleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIFR1dG9yaWFsID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0c0xvb3NlKFR1dG9yaWFsLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICBmdW5jdGlvbiBUdXRvcmlhbCgpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgX3RoaXMgPSBfUmVhY3QkQ29tcG9uZW50LmNhbGwuYXBwbHkoX1JlYWN0JENvbXBvbmVudCwgW3RoaXNdLmNvbmNhdChhcmdzKSkgfHwgdGhpcztcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJrZXlib2FyZFNlbGVjdFR1dG9yaWFsXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDMyIHx8IGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgX3RoaXMucHJvcHMudHV0b3JpYWxDbGlja2VkKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gVHV0b3JpYWwucHJvdG90eXBlO1xuXG4gIF9wcm90by5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHR1dG9yaWFsT3V0ZXJTdHlsZSA9IF9vYmplY3RTcHJlYWQoe30sIHN0eWxlcy50dXRvcmlhbE91dGVyLCB7XG4gICAgICB3aWR0aDogKDAsIF9yZXNwb25zaXZlLmdldFJlc3BvbnNpdmVWYWx1ZSkoe1xuICAgICAgICBsZzogMzMuMzMzMzMzMyxcbiAgICAgICAgc206IDUwLFxuICAgICAgICB4czogMTAwXG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgdmFyIGltYWdlU3JjID0gdGhpcy5wcm9wcy5pdGVtLmltYWdlLnJlcGxhY2UoJy5wbmcnLCAnLmpwZycpO1xuICAgIHJldHVybiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IHR1dG9yaWFsT3V0ZXJTdHlsZSxcbiAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMudHV0b3JpYWxDbGlja2VkLFxuICAgICAgb25LZXlEb3duOiB0aGlzLmtleWJvYXJkU2VsZWN0VHV0b3JpYWwsXG4gICAgICB0YWJJbmRleDogXCIwXCIsXG4gICAgICByb2xlOiBcImJ1dHRvblwiXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMudHV0b3JpYWxJbWFnZUNvbnRhaW5lclxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsSW1hZ2VCYWNrZ3JvdW5kXG4gICAgfSksIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfcmVhY3RMYXp5TG9hZFtcImRlZmF1bHRcIl0sIHtcbiAgICAgIG9mZnNldDogMTAwMFxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfaW1hZ2VbXCJkZWZhdWx0XCJdLCB7XG4gICAgICBzcmM6IGltYWdlU3JjLFxuICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbEltYWdlLFxuICAgICAgYWx0OiBcIlwiXG4gICAgfSkpKSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMudHV0b3JpYWxOYW1lXG4gICAgfSwgdGhpcy5wcm9wcy5pdGVtLm5hbWUpLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbFN1YlxuICAgIH0sICgwLCBfdXRpbC5nZXRUdXRvcmlhbERldGFpbFN0cmluZykodGhpcy5wcm9wcy5pdGVtKSkpO1xuICB9O1xuXG4gIHJldHVybiBUdXRvcmlhbDtcbn0oX3JlYWN0W1wiZGVmYXVsdFwiXS5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFR1dG9yaWFsO1xuXG5fZGVmaW5lUHJvcGVydHkoVHV0b3JpYWwsIFwicHJvcFR5cGVzXCIsIHtcbiAgaXRlbTogX3NoYXBlc1tcImRlZmF1bHRcIl0udHV0b3JpYWwuaXNSZXF1aXJlZCxcbiAgdHV0b3JpYWxDbGlja2VkOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5mdW5jLmlzUmVxdWlyZWRcbn0pO1xuXG52YXIgc3R5bGVzID0ge1xuICB0dXRvcmlhbE91dGVyOiB7XG4gICAgXCJmbG9hdFwiOiAnbGVmdCcsXG4gICAgcGFkZGluZ1RvcDogNSxcbiAgICBwYWRkaW5nQm90dG9tOiA1LFxuICAgIHBhZGRpbmdMZWZ0OiA3LFxuICAgIHBhZGRpbmdSaWdodDogNyxcbiAgICBjdXJzb3I6ICdwb2ludGVyJ1xuICB9LFxuICB0dXRvcmlhbEltYWdlQ29udGFpbmVyOiB7XG4gICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgd2lkdGg6ICcxMDAlJyxcbiAgICBoZWlnaHQ6IDAsXG4gICAgcGFkZGluZ1RvcDogJzc1JSdcbiAgfSxcbiAgdHV0b3JpYWxJbWFnZUJhY2tncm91bmQ6IHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICB0b3A6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgbGVmdDogMCxcbiAgICBib3R0b206IDAsXG4gICAgYmFja2dyb3VuZENvbG9yOiAnI2YxZjFmMScsXG4gICAgYm9yZGVyOiAnc29saWQgMXB4ICNjZWNlY2UnXG4gIH0sXG4gIHR1dG9yaWFsSW1hZ2U6IHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICB0b3A6IDAsXG4gICAgbGVmdDogMCxcbiAgICB3aWR0aDogJzEwMCUnXG4gIH0sXG4gIHR1dG9yaWFsTmFtZToge1xuICAgIGZvbnRGYW1pbHk6ICdcIkdvdGhhbSA1clwiLCBzYW5zLXNlcmlmJyxcbiAgICBmb250U2l6ZTogMTUsXG4gICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICB9LFxuICB0dXRvcmlhbFN1Yjoge1xuICAgIGZvbnRGYW1pbHk6ICdcIkdvdGhhbSAzclwiLCBzYW5zLXNlcmlmJyxcbiAgICBmb250U2l6ZTogMTIsXG4gICAgbGluZUhlaWdodDogJzE2cHgnLFxuICAgIGhlaWdodDogNDBcbiAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9wcm9wVHlwZXMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJwcm9wLXR5cGVzXCIpKTtcblxudmFyIF9yZWFjdCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInJlYWN0XCIpKTtcblxudmFyIF9zaGFwZXMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3NoYXBlc1wiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG5cbnZhciBfaW1hZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2ltYWdlXCIpKTtcblxudmFyIF9sb2NhbGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAY2RvL3R1dG9yaWFsRXhwbG9yZXIvbG9jYWxlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxuLyogZ2xvYmFsIGdhICovXG52YXIgVHV0b3JpYWxEZXRhaWwgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgX2luaGVyaXRzTG9vc2UoVHV0b3JpYWxEZXRhaWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gIGZ1bmN0aW9uIFR1dG9yaWFsRGV0YWlsKCkge1xuICAgIHZhciBfdGhpcztcblxuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICBfdGhpcyA9IF9SZWFjdCRDb21wb25lbnQuY2FsbC5hcHBseShfUmVhY3QkQ29tcG9uZW50LCBbdGhpc10uY29uY2F0KGFyZ3MpKSB8fCB0aGlzO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcIm9uS2V5RG93blwiLCBmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIGtleUNvZGUgPSBfcmVmLmtleUNvZGU7XG5cbiAgICAgIGlmICghX3RoaXMucHJvcHMuc2hvd2luZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXlDb2RlID09PSAyNykge1xuICAgICAgICBfdGhpcy5wcm9wcy5jbG9zZUNsaWNrZWQoKTtcbiAgICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gMzcpIHtcbiAgICAgICAgX3RoaXMucHJvcHMuY2hhbmdlVHV0b3JpYWwoLTEpO1xuICAgICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSAzOSkge1xuICAgICAgICBfdGhpcy5wcm9wcy5jaGFuZ2VUdXRvcmlhbCgxKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJzdGFydFR1dG9yaWFsQ2xpY2tlZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2hvcnRDb2RlID0gX3RoaXMucHJvcHMuaXRlbS5zaG9ydF9jb2RlO1xuICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCAnbGVhcm4nLCAnc3RhcnQnLCBzaG9ydENvZGUpO1xuICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCAnbGVhcm4nLCBcInN0YXJ0LVwiLmNvbmNhdChfdGhpcy5wcm9wcy5ncmFkZSksIHNob3J0Q29kZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gVHV0b3JpYWxEZXRhaWwucHJvdG90eXBlO1xuXG4gIF9wcm90by5jb21wb25lbnREaWRNb3VudCA9IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bik7XG4gIH07XG5cbiAgX3Byb3RvLmNvbXBvbmVudFdpbGxVbm1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duKTtcbiAgfTtcblxuICBfcHJvdG8ucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5zaG93aW5nKSB7XG4gICAgICAvLyBFbmFibGUgYm9keSBzY3JvbGxpbmcuXG4gICAgICAkKCdib2R5JykuY3NzKCdvdmVyZmxvdycsICdhdXRvJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IC8vIERpc2FibGUgYm9keSBzY3JvbGxpbmcuXG5cblxuICAgICQoJ2JvZHknKS5jc3MoJ292ZXJmbG93JywgJ2hpZGRlbicpO1xuICAgIHZhciB0YWJsZUVudHJpZXMgPSBbLy8gUmVzZXJ2ZSBrZXkgMCBmb3IgdGhlIG9wdGlvbmFsIHRlYWNoZXJzIG5vdGVzLlxuICAgIC8vIFJlc2VydmUga2V5IDEgZm9yIHRoZSBvcHRpb25hbCBzaG9ydCBsaW5rLlxuICAgIHtcbiAgICAgIGtleTogMixcbiAgICAgIHRpdGxlOiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJTdHVkZW50RXhwZXJpZW5jZSgpLFxuICAgICAgYm9keTogKDAsIF91dGlsLmdldFRhZ1N0cmluZykoJ3N0dWRlbnRfZXhwZXJpZW5jZScsIHRoaXMucHJvcHMuaXRlbS50YWdzX3N0dWRlbnRfZXhwZXJpZW5jZSlcbiAgICB9LCB7XG4gICAgICBrZXk6IDMsXG4gICAgICB0aXRsZTogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyUGxhdGZvcm0oKSxcbiAgICAgIGJvZHk6IHRoaXMucHJvcHMuaXRlbS5zdHJpbmdfcGxhdGZvcm1zXG4gICAgfSwge1xuICAgICAga2V5OiA0LFxuICAgICAgdGl0bGU6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclRvcGljcygpLFxuICAgICAgYm9keTogKDAsIF91dGlsLmdldFRhZ1N0cmluZykoJ3N1YmplY3QnLCB0aGlzLnByb3BzLml0ZW0udGFnc19zdWJqZWN0KVxuICAgIH0sIHtcbiAgICAgIGtleTogNSxcbiAgICAgIHRpdGxlOiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJBY3Rpdml0eVR5cGUoKSxcbiAgICAgIGJvZHk6ICgwLCBfdXRpbC5nZXRUYWdTdHJpbmcpKCdhY3Rpdml0eV90eXBlJywgdGhpcy5wcm9wcy5pdGVtLnRhZ3NfYWN0aXZpdHlfdHlwZSlcbiAgICB9LCB7XG4gICAgICBrZXk6IDYsXG4gICAgICB0aXRsZTogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyTGVuZ3RoKCksXG4gICAgICBib2R5OiAoMCwgX3V0aWwuZ2V0VGFnU3RyaW5nKSgnbGVuZ3RoJywgdGhpcy5wcm9wcy5pdGVtLnRhZ3NfbGVuZ3RoKVxuICAgIH0sIHtcbiAgICAgIGtleTogNyxcbiAgICAgIHRpdGxlOiBfbG9jYWxlW1wiZGVmYXVsdFwiXS50dXRvcmlhbERldGFpbEludGVybmF0aW9uYWxMYW5ndWFnZXMoKSxcbiAgICAgIGJvZHk6IHRoaXMucHJvcHMuaXRlbS5sYW5ndWFnZVxuICAgIH0gLy8gUmVzZXJ2ZSBrZXkgOCBmb3IgdGhlIG9wdGlvbmFsIHN0YW5kYXJkcy5cbiAgICBdO1xuICAgIHZhciBpbWFnZVNyYyA9IHRoaXMucHJvcHMuaXRlbS5pbWFnZS5yZXBsYWNlKCcucG5nJywgJy5qcGcnKTtcblxuICAgIHZhciBpbWFnZUNvbXBvbmVudCA9IF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsRGV0YWlsSW1hZ2VPdXRlckNvbnRhaW5lcixcbiAgICAgIGNsYXNzTmFtZTogXCJjb2wteHMtMTIgY29sLXNtLTZcIlxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsRGV0YWlsSW1hZ2VDb250YWluZXJcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbERldGFpbEltYWdlQmFja2dyb3VuZFxuICAgIH0pLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX2ltYWdlW1wiZGVmYXVsdFwiXSwge1xuICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbERldGFpbEltYWdlLFxuICAgICAgc3JjOiBpbWFnZVNyY1xuICAgIH0pKSk7XG5cbiAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIGlkOiBcInR1dG9yaWFsUG9wdXBGdWxsV2lkdGhcIixcbiAgICAgIHN0eWxlOiBzdHlsZXMucG9wdXBGdWxsV2lkdGhcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgY2xhc3NOYW1lOiBcIm1vZGFsXCIsXG4gICAgICBpZDogXCJ0dXRvcmlhbFBvcHVwXCIsXG4gICAgICBzdHlsZToge1xuICAgICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgICB9LFxuICAgICAgb25DbGljazogdGhpcy5wcm9wcy5jbG9zZUNsaWNrZWRcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgY2xhc3NOYW1lOiBcIm1vZGFsLWRpYWxvZyBtb2RhbC1sZ1wiLFxuICAgICAgb25DbGljazogZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgICAgIHJldHVybiBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfVxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBjbGFzc05hbWU6IFwibW9kYWwtY29udGVudFwiXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJtb2RhbC1oZWFkZXJcIixcbiAgICAgIHN0eWxlOiBzdHlsZXMudHV0b3JpYWxEZXRhaWxNb2RhbEhlYWRlclxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XG4gICAgICBjbGFzc05hbWU6IFwiY2xvc2VcIixcbiAgICAgIFwiZGF0YS1kaXNtaXNzXCI6IFwibW9kYWxcIixcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIGhlaWdodDogNDhcbiAgICAgIH0sXG4gICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgb25DbGljazogdGhpcy5wcm9wcy5jbG9zZUNsaWNrZWRcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtcbiAgICAgIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsXG4gICAgICBzdHlsZToge1xuICAgICAgICBmb250U2l6ZTogNDhcbiAgICAgIH1cbiAgICB9LCBcIlxceEQ3XCIpLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJzci1vbmx5XCJcbiAgICB9LCBcIkNsb3NlXCIpKSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIGNsZWFyOiAnYm90aCdcbiAgICAgIH1cbiAgICB9KSksIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBjbGFzc05hbWU6IFwibW9kYWwtYm9keVwiLFxuICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbERldGFpbE1vZGFsQm9keVxuICAgIH0sICF0aGlzLnByb3BzLmRpc2FibGVkVHV0b3JpYWwgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XG4gICAgICBocmVmOiB0aGlzLnByb3BzLml0ZW0udXJsLFxuICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgcmVsOiBcIm5vb3BlbmVyIG5vcmVmZXJyZXJcIixcbiAgICAgIG9uQ2xpY2s6IHRoaXMuc3RhcnRUdXRvcmlhbENsaWNrZWRcbiAgICB9LCBpbWFnZUNvbXBvbmVudCksIHRoaXMucHJvcHMuZGlzYWJsZWRUdXRvcmlhbCAmJiBpbWFnZUNvbXBvbmVudCwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMudHV0b3JpYWxEZXRhaWxJbmZvQ29udGFpbmVyLFxuICAgICAgY2xhc3NOYW1lOiBcImNvbC14cy0xMiBjb2wtc20tNlwiXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMudHV0b3JpYWxEZXRhaWxOYW1lXG4gICAgfSwgdGhpcy5wcm9wcy5pdGVtLm5hbWUpLCB0aGlzLnByb3BzLml0ZW0ub3JnbmFtZSAhPT0gX3V0aWwuRG9Ob3RTaG93ICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsRGV0YWlsUHVibGlzaGVyXG4gICAgfSwgdGhpcy5wcm9wcy5pdGVtLm9yZ25hbWUpLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbERldGFpbFN1YlxuICAgIH0sICgwLCBfdXRpbC5nZXRUdXRvcmlhbERldGFpbFN0cmluZykodGhpcy5wcm9wcy5pdGVtKSksIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsRGV0YWlsRGVzY3JpcHRpb25cbiAgICB9LCB0aGlzLnByb3BzLml0ZW0ubG9uZ2Rlc2NyaXB0aW9uKSwgdGhpcy5wcm9wcy5kaXNhYmxlZFR1dG9yaWFsICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsRGV0YWlsRGlzYWJsZWRcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJmYSBmYS13YXJuaW5nIHdhcm5pbmctc2lnblwiLFxuICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbERldGFpbERpc2FibGVkSWNvblxuICAgIH0pLCBcIlxceEEwXCIsIF9sb2NhbGVbXCJkZWZhdWx0XCJdLnR1dG9yaWFsRGV0YWlsRGlzYWJsZWQoKSksICF0aGlzLnByb3BzLmRpc2FibGVkVHV0b3JpYWwgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XG4gICAgICBocmVmOiB0aGlzLnByb3BzLml0ZW0udXJsLFxuICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgcmVsOiBcIm5vb3BlbmVyIG5vcmVmZXJyZXJcIixcbiAgICAgIG9uQ2xpY2s6IHRoaXMuc3RhcnRUdXRvcmlhbENsaWNrZWRcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1xuICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIG1hcmdpblRvcDogMjBcbiAgICAgIH1cbiAgICB9LCBfbG9jYWxlW1wiZGVmYXVsdFwiXS5zdGFydEJ1dHRvbigpKSkpLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IHtcbiAgICAgICAgY2xlYXI6ICdib3RoJ1xuICAgICAgfVxuICAgIH0pLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJ0YWJsZVwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsRGV0YWlsc1RhYmxlXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwidGJvZHlcIiwgbnVsbCwgdGhpcy5wcm9wcy5pdGVtLnRlYWNoZXJzX25vdGVzICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcInRyXCIsIHtcbiAgICAgIGtleTogMFxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcInRkXCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMudHV0b3JpYWxEZXRhaWxzVGFibGVUaXRsZVxuICAgIH0sIF9sb2NhbGVbXCJkZWZhdWx0XCJdLnR1dG9yaWFsRGV0YWlsc01vcmVSZXNvdXJjZXMoKSksIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcInRkXCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMudHV0b3JpYWxEZXRhaWxzVGFibGVCb2R5XG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XG4gICAgICBocmVmOiB0aGlzLnByb3BzLml0ZW0udGVhY2hlcnNfbm90ZXMsXG4gICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICByZWw6IFwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiaVwiLCB7XG4gICAgICBjbGFzc05hbWU6IFwiZmEgZmEtZXh0ZXJuYWwtbGlua1wiLFxuICAgICAgXCJhcmlhLWhpZGRlblwiOiB0cnVlXG4gICAgfSksIFwiXFx4QTBcIiwgX2xvY2FsZVtcImRlZmF1bHRcIl0udHV0b3JpYWxEZXRhaWxzVGVhY2hlck5vdGVzKCkpKSksIHRhYmxlRW50cmllcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJ0clwiLCB7XG4gICAgICAgIGtleTogaXRlbS5rZXlcbiAgICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcInRkXCIsIHtcbiAgICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbERldGFpbHNUYWJsZVRpdGxlXG4gICAgICB9LCBpdGVtLnRpdGxlKSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwidGRcIiwge1xuICAgICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsRGV0YWlsc1RhYmxlQm9keVxuICAgICAgfSwgaXRlbS5ib2R5KSk7XG4gICAgfSksIHRoaXMucHJvcHMubG9jYWxlRW5nbGlzaCAmJiB0aGlzLnByb3BzLml0ZW0uc3RyaW5nX3N0YW5kYXJkcyAmJiBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJ0clwiLCB7XG4gICAgICBrZXk6IDhcbiAgICB9LCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnR1dG9yaWFsRGV0YWlsc1RhYmxlVGl0bGVcbiAgICB9LCBfbG9jYWxlW1wiZGVmYXVsdFwiXS50dXRvcmlhbERldGFpbFN0YW5kYXJkcygpKSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwidGRcIiwge1xuICAgICAgc3R5bGU6IHN0eWxlcy50dXRvcmlhbERldGFpbHNUYWJsZUJvZHlOb1dyYXBcbiAgICB9LCB0aGlzLnByb3BzLml0ZW0uc3RyaW5nX3N0YW5kYXJkcykpKSkpKSkpKTtcbiAgfTtcblxuICByZXR1cm4gVHV0b3JpYWxEZXRhaWw7XG59KF9yZWFjdFtcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBUdXRvcmlhbERldGFpbDtcblxuX2RlZmluZVByb3BlcnR5KFR1dG9yaWFsRGV0YWlsLCBcInByb3BUeXBlc1wiLCB7XG4gIHNob3dpbmc6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmJvb2wuaXNSZXF1aXJlZCxcbiAgaXRlbTogX3NoYXBlc1tcImRlZmF1bHRcIl0udHV0b3JpYWwsXG4gIGNsb3NlQ2xpY2tlZDogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uZnVuYy5pc1JlcXVpcmVkLFxuICBjaGFuZ2VUdXRvcmlhbDogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uZnVuYy5pc1JlcXVpcmVkLFxuICBsb2NhbGVFbmdsaXNoOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5ib29sLmlzUmVxdWlyZWQsXG4gIGRpc2FibGVkVHV0b3JpYWw6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmJvb2wuaXNSZXF1aXJlZCxcbiAgZ3JhZGU6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLnN0cmluZy5pc1JlcXVpcmVkXG59KTtcblxudmFyIHN0eWxlcyA9IHtcbiAgdHV0b3JpYWxEZXRhaWxNb2RhbEhlYWRlcjoge1xuICAgIGJvcmRlckJvdHRvbVdpZHRoOiAwLFxuICAgIHBhZGRpbmdUb3A6IDAsXG4gICAgcGFkZGluZ0JvdHRvbTogNCxcbiAgICBoZWlnaHQ6IDQ4XG4gIH0sXG4gIHR1dG9yaWFsRGV0YWlsTW9kYWxCb2R5OiB7XG4gICAgcGFkZGluZ1RvcDogMCxcbiAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgbWF4SGVpZ2h0OiAnY2FsYygxMDB2aCAtIDEwMHB4KScsXG4gICAgb3ZlcmZsb3dZOiAnYXV0bydcbiAgfSxcbiAgcG9wdXBGdWxsV2lkdGg6IHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICBsZWZ0OiAwLFxuICAgIHRvcDogMCxcbiAgICB3aWR0aDogJzEwMCUnXG4gIH0sXG4gIHR1dG9yaWFsRGV0YWlsSW1hZ2VPdXRlckNvbnRhaW5lcjoge1xuICAgIFwiZmxvYXRcIjogJ2xlZnQnLFxuICAgIHBhZGRpbmdCb3R0b206IDEwXG4gIH0sXG4gIHR1dG9yaWFsRGV0YWlsSW1hZ2VDb250YWluZXI6IHtcbiAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICB3aWR0aDogJzEwMCUnLFxuICAgIGhlaWdodDogMCxcbiAgICBwYWRkaW5nVG9wOiAnNzUlJ1xuICB9LFxuICB0dXRvcmlhbERldGFpbEltYWdlQmFja2dyb3VuZDoge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHRvcDogMCxcbiAgICByaWdodDogMCxcbiAgICBsZWZ0OiAwLFxuICAgIGJvdHRvbTogMCxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjFmMWYxJyxcbiAgICBib3JkZXI6ICdzb2xpZCAxcHggI2NlY2VjZSdcbiAgfSxcbiAgdHV0b3JpYWxEZXRhaWxJbWFnZToge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHRvcDogMCxcbiAgICBsZWZ0OiAwLFxuICAgIHdpZHRoOiAnMTAwJSdcbiAgfSxcbiAgdHV0b3JpYWxEZXRhaWxJbmZvQ29udGFpbmVyOiB7XG4gICAgXCJmbG9hdFwiOiAnbGVmdCcsXG4gICAgcGFkZGluZ0xlZnQ6IDIwXG4gIH0sXG4gIHR1dG9yaWFsRGV0YWlsTmFtZToge1xuICAgIGZvbnRGYW1pbHk6ICdcIkdvdGhhbSA1clwiLCBzYW5zLXNlcmlmJyxcbiAgICBmb250U2l6ZTogMjIsXG4gICAgcGFkZGluZ0JvdHRvbTogNFxuICB9LFxuICB0dXRvcmlhbERldGFpbFB1Ymxpc2hlcjoge1xuICAgIGZvbnRGYW1pbHk6ICdcIkdvdGhhbSAzclwiLCBzYW5zLXNlcmlmJyxcbiAgICBmb250U2l6ZTogMTZcbiAgfSxcbiAgdHV0b3JpYWxEZXRhaWxTdWI6IHtcbiAgICBmb250RmFtaWx5OiAnXCJHb3RoYW0gM3JcIiwgc2Fucy1zZXJpZicsXG4gICAgZm9udFNpemU6IDEyLFxuICAgIHBhZGRpbmdCb3R0b206IDIwXG4gIH0sXG4gIHR1dG9yaWFsRGV0YWlsRGVzY3JpcHRpb246IHtcbiAgICBmb250RmFtaWx5OiAnXCJHb3RoYW0gM3JcIiwgc2Fucy1zZXJpZicsXG4gICAgZm9udFNpemU6IDE0XG4gIH0sXG4gIHR1dG9yaWFsRGV0YWlsRGlzYWJsZWQ6IHtcbiAgICBmb250RmFtaWx5OiAnXCJHb3RoYW0gNXJcIiwgc2Fucy1zZXJpZicsXG4gICAgZm9udFNpemU6IDE2LFxuICAgIHBhZGRpbmdUb3A6IDQwXG4gIH0sXG4gIHR1dG9yaWFsRGV0YWlsRGlzYWJsZWRJY29uOiB7XG4gICAgY29sb3I6ICcjZDk1MzRmJ1xuICB9LFxuICB0dXRvcmlhbERldGFpbHNUYWJsZToge1xuICAgIG1hcmdpblRvcDogMjAsXG4gICAgd2lkdGg6ICcxMDAlJ1xuICB9LFxuICB0dXRvcmlhbERldGFpbHNUYWJsZVRpdGxlOiB7XG4gICAgcGFkZGluZzogNSxcbiAgICB3aWR0aDogJzQwJScsXG4gICAgZm9udEZhbWlseTogJ1wiR290aGFtIDVyXCIsIHNhbnMtc2VyaWYnLFxuICAgIGJvcmRlcjogJzFweCBzb2xpZCBsaWdodGdyZXknXG4gIH0sXG4gIHR1dG9yaWFsRGV0YWlsc1RhYmxlQm9keToge1xuICAgIHBhZGRpbmc6IDUsXG4gICAgYm9yZGVyOiAnMXB4IHNvbGlkIGxpZ2h0Z3JleSdcbiAgfSxcbiAgdHV0b3JpYWxEZXRhaWxzVGFibGVCb2R5Tm9XcmFwOiB7XG4gICAgcGFkZGluZzogNSxcbiAgICBib3JkZXI6ICcxcHggc29saWQgbGlnaHRncmV5JyxcbiAgICB3aGl0ZVNwYWNlOiAncHJlLXdyYXAnXG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcHJvcFR5cGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicHJvcC10eXBlc1wiKSk7XG5cbnZhciBfcmVhY3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5cbnZhciBfcmVhY3REb20gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJyZWFjdC1kb21cIikpO1xuXG52YXIgX2ltbXV0YWJsZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcImltbXV0YWJsZVwiKSk7XG5cbnZhciBfZmlsdGVySGVhZGVyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9maWx0ZXJIZWFkZXJcIikpO1xuXG52YXIgX2ZpbHRlclNldCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vZmlsdGVyU2V0XCIpKTtcblxudmFyIF90dXRvcmlhbFNldCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdHV0b3JpYWxTZXRcIikpO1xuXG52YXIgX3RvZ2dsZUFsbFR1dG9yaWFsc0J1dHRvbiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdG9nZ2xlQWxsVHV0b3JpYWxzQnV0dG9uXCIpKTtcblxudmFyIF9zZWFyY2ggPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3NlYXJjaFwiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG5cbnZhciBfcmVzcG9uc2l2ZSA9IHJlcXVpcmUoXCIuL3Jlc3BvbnNpdmVcIik7XG5cbnZhciBfbG9jYWxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGNkby90dXRvcmlhbEV4cGxvcmVyL2xvY2FsZVwiKSk7XG5cbnZhciBfbG9kYXNoID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwibG9kYXNoXCIpKTtcblxudmFyIF9xdWVyeVN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInF1ZXJ5LXN0cmluZ1wiKSk7XG5cbnZhciBfcmVhY3RTdGlja3kgPSByZXF1aXJlKFwicmVhY3Qtc3RpY2t5XCIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IHZhciBvd25LZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KHNvdXJjZSkpOyBpZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09ICdmdW5jdGlvbicpIHsgb3duS2V5cyA9IG93bktleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKS5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHN5bSkuZW51bWVyYWJsZTsgfSkpOyB9IG93bktleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIFR1dG9yaWFsRXhwbG9yZXIgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgX2luaGVyaXRzTG9vc2UoVHV0b3JpYWxFeHBsb3JlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gVHV0b3JpYWxFeHBsb3Jlcihwcm9wcykge1xuICAgIHZhciBfdGhpcztcblxuICAgIF90aGlzID0gX1JlYWN0JENvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzKSB8fCB0aGlzO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImhhbmRsZVNlYXJjaFRlcm1cIiwgZnVuY3Rpb24gKHNlYXJjaFRlcm0pIHtcbiAgICAgIHZhciBmaWx0ZXJlZFR1dG9yaWFscyA9IF90aGlzLmZpbHRlclR1dG9yaWFsU2V0KF90aGlzLnN0YXRlLmZpbHRlcnMsIF90aGlzLnN0YXRlLnNvcnRCeSwgX3RoaXMuc3RhdGUub3JnTmFtZSwgc2VhcmNoVGVybSk7XG5cbiAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2VhcmNoVGVybTogc2VhcmNoVGVybSxcbiAgICAgICAgZmlsdGVyZWRUdXRvcmlhbHM6IGZpbHRlcmVkVHV0b3JpYWxzLFxuICAgICAgICBmaWx0ZXJlZFR1dG9yaWFsc0NvdW50OiBmaWx0ZXJlZFR1dG9yaWFscy5sZW5ndGhcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImhhbmRsZVVzZXJJbnB1dEZpbHRlclwiLCBmdW5jdGlvbiAoZmlsdGVyR3JvdXAsIGZpbHRlckVudHJ5LCB2YWx1ZSkge1xuICAgICAgdmFyIHN0YXRlID0gX2ltbXV0YWJsZVtcImRlZmF1bHRcIl0uZnJvbUpTKF90aGlzLnN0YXRlKTtcblxuICAgICAgdmFyIG5ld1N0YXRlID0ge307XG5cbiAgICAgIGlmIChfdGhpcy5wcm9wcy5maWx0ZXJHcm91cHMuZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5uYW1lID09PSBmaWx0ZXJHcm91cDtcbiAgICAgIH0pLnNpbmdsZUVudHJ5KSB7XG4gICAgICAgIG5ld1N0YXRlID0gc3RhdGUudXBkYXRlSW4oWydmaWx0ZXJzJywgZmlsdGVyR3JvdXBdLCBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgICAgcmV0dXJuIFtmaWx0ZXJFbnRyeV07XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAvLyBBZGQgdmFsdWUgdG8gZW5kIG9mIGFycmF5LlxuICAgICAgICBuZXdTdGF0ZSA9IHN0YXRlLnVwZGF0ZUluKFsnZmlsdGVycycsIGZpbHRlckdyb3VwXSwgZnVuY3Rpb24gKGFycikge1xuICAgICAgICAgIHJldHVybiBhcnIucHVzaChmaWx0ZXJFbnRyeSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRmluZCBhbmQgcmVtb3ZlIHNwZWNpZmljIHZhbHVlIGZyb20gYXJyYXkuXG4gICAgICAgIHZhciBpdGVtSW5kZXggPSBfdGhpcy5zdGF0ZS5maWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlckVudHJ5KTtcblxuICAgICAgICBuZXdTdGF0ZSA9IHN0YXRlLnVwZGF0ZUluKFsnZmlsdGVycycsIGZpbHRlckdyb3VwXSwgZnVuY3Rpb24gKGFycikge1xuICAgICAgICAgIHJldHVybiBhcnIuc3BsaWNlKGl0ZW1JbmRleCwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBuZXdTdGF0ZSA9IG5ld1N0YXRlLnRvSlMoKTtcblxuICAgICAgdmFyIGZpbHRlcmVkVHV0b3JpYWxzID0gX3RoaXMuZmlsdGVyVHV0b3JpYWxTZXQobmV3U3RhdGUuZmlsdGVycywgX3RoaXMuc3RhdGUuc29ydEJ5LCBfdGhpcy5zdGF0ZS5vcmdOYW1lLCBfdGhpcy5zdGF0ZS5zZWFyY2hUZXJtKTtcblxuICAgICAgX3RoaXMuc2V0U3RhdGUoX29iamVjdFNwcmVhZCh7fSwgbmV3U3RhdGUsIHtcbiAgICAgICAgZmlsdGVyZWRUdXRvcmlhbHM6IGZpbHRlcmVkVHV0b3JpYWxzLFxuICAgICAgICBmaWx0ZXJlZFR1dG9yaWFsc0NvdW50OiBmaWx0ZXJlZFR1dG9yaWFscy5sZW5ndGhcbiAgICAgIH0pKTtcbiAgICB9KTtcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJoYW5kbGVVc2VySW5wdXRTb3J0QnlcIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgZmlsdGVyZWRUdXRvcmlhbHMgPSBfdGhpcy5maWx0ZXJUdXRvcmlhbFNldChfdGhpcy5zdGF0ZS5maWx0ZXJzLCB2YWx1ZSwgX3RoaXMuc3RhdGUub3JnTmFtZSwgX3RoaXMuc3RhdGUuc2VhcmNoVGVybSk7XG5cbiAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmlsdGVyZWRUdXRvcmlhbHM6IGZpbHRlcmVkVHV0b3JpYWxzLFxuICAgICAgICBmaWx0ZXJlZFR1dG9yaWFsc0NvdW50OiBmaWx0ZXJlZFR1dG9yaWFscy5sZW5ndGgsXG4gICAgICAgIHNvcnRCeTogdmFsdWVcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpcy5zY3JvbGxUb1RvcCgpO1xuICAgIH0pO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImhhbmRsZVVzZXJJbnB1dE9yZ05hbWVcIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgZmlsdGVyZWRUdXRvcmlhbHMgPSBfdGhpcy5maWx0ZXJUdXRvcmlhbFNldChfdGhpcy5zdGF0ZS5maWx0ZXJzLCBfdGhpcy5zdGF0ZS5zb3J0QnksIHZhbHVlLCBfdGhpcy5zdGF0ZS5zZWFyY2hUZXJtKTtcblxuICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICBmaWx0ZXJlZFR1dG9yaWFsczogZmlsdGVyZWRUdXRvcmlhbHMsXG4gICAgICAgIGZpbHRlcmVkVHV0b3JpYWxzQ291bnQ6IGZpbHRlcmVkVHV0b3JpYWxzLmxlbmd0aCxcbiAgICAgICAgb3JnTmFtZTogdmFsdWVcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpcy5zY3JvbGxUb1RvcCgpO1xuICAgIH0pO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcInNob3dNb2RhbEZpbHRlcnNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzaG93aW5nTW9kYWxGaWx0ZXJzOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgaWYgKF90aGlzLnN0YXRlLm1vYmlsZUxheW91dCkge1xuICAgICAgICBfdGhpcy5zY3JvbGxUb1RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImhpZGVNb2RhbEZpbHRlcnNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzaG93aW5nTW9kYWxGaWx0ZXJzOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChfdGhpcy5zdGF0ZS5tb2JpbGVMYXlvdXQpIHtcbiAgICAgICAgX3RoaXMuc2Nyb2xsVG9Ub3AoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJzaG93QWxsVHV0b3JpYWxzXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2hvd2luZ0FsbFR1dG9yaWFsczogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwiaGlkZUFsbFR1dG9yaWFsc1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNob3dpbmdBbGxUdXRvcmlhbHM6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJvblJlc2l6ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgd2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgIHZhciB3aW5kb3dIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7IC8vIFdlIGZpcmUgd2luZG93IHJlc2l6ZSBldmVudHMgd2hlbiB0aGUgZ3JpcHB5IGlzIGRyYWdnZWQgc28gdGhhdCBub24tUmVhY3RcbiAgICAgIC8vIGNvbnRyb2xsZWQgY29tcG9uZW50cyBhcmUgYWJsZSB0byByZXJlbmRlciB0aGUgZWRpdG9yLiBJZiB3aWR0aC9oZWlnaHRcbiAgICAgIC8vIGRpZG4ndCBjaGFuZ2UsIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgZWxzZSBoZXJlXG5cbiAgICAgIGlmICh3aW5kb3dXaWR0aCA9PT0gX3RoaXMuc3RhdGUud2luZG93V2lkdGggJiYgd2luZG93SGVpZ2h0ID09PSBfdGhpcy5zdGF0ZS53aW5kb3dIZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHdpbmRvd1dpZHRoOiAkKHdpbmRvdykud2lkdGgoKSxcbiAgICAgICAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG1vYmlsZUxheW91dDogKDAsIF9yZXNwb25zaXZlLmlzUmVzcG9uc2l2ZUNhdGVnb3J5SW5hY3RpdmUpKCdtZCcpXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIF90aGlzLnNob3VsZFNjcm9sbFRvVG9wID0gZmFsc2U7XG4gICAgdmFyIGZpbHRlcnMgPSB7fTtcblxuICAgIGZvciAodmFyIGZpbHRlckdyb3VwTmFtZSBpbiBwcm9wcy5maWx0ZXJHcm91cHMpIHtcbiAgICAgIHZhciBmaWx0ZXJHcm91cCA9IHByb3BzLmZpbHRlckdyb3Vwc1tmaWx0ZXJHcm91cE5hbWVdO1xuICAgICAgZmlsdGVyc1tmaWx0ZXJHcm91cC5uYW1lXSA9IFtdO1xuICAgICAgdmFyIGluaXRpYWxGaWx0ZXJzRm9yR3JvdXAgPSBwcm9wcy5pbml0aWFsRmlsdGVyc1tmaWx0ZXJHcm91cC5uYW1lXTtcblxuICAgICAgaWYgKGluaXRpYWxGaWx0ZXJzRm9yR3JvdXApIHtcbiAgICAgICAgZmlsdGVyc1tmaWx0ZXJHcm91cC5uYW1lXSA9IGluaXRpYWxGaWx0ZXJzRm9yR3JvdXA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNvcnRCeSA9IHByb3BzLmRlZmF1bHRTb3J0Qnk7XG4gICAgdmFyIG9yZ05hbWUgPSBfdXRpbC5UdXRvcmlhbHNPcmdOYW1lLmFsbDtcbiAgICB2YXIgZGVmYXVsdFNlYXJjaFRlcm0gPSAnJztcblxuICAgIHZhciBfZmlsdGVyZWRUdXRvcmlhbHMgPSBfdGhpcy5maWx0ZXJUdXRvcmlhbFNldChmaWx0ZXJzLCBzb3J0QnksIG9yZ05hbWUsIGRlZmF1bHRTZWFyY2hUZXJtKTtcblxuICAgIHZhciBmaWx0ZXJlZFR1dG9yaWFsc0ZvckxvY2FsZSA9IF90aGlzLmZpbHRlclR1dG9yaWFsU2V0Rm9yTG9jYWxlKCk7XG5cbiAgICB2YXIgc2hvd2luZ0FsbFR1dG9yaWFscyA9IF90aGlzLmlzTG9jYWxlRW5nbGlzaCgpO1xuXG4gICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICBmaWx0ZXJzOiBmaWx0ZXJzLFxuICAgICAgZmlsdGVyZWRUdXRvcmlhbHM6IF9maWx0ZXJlZFR1dG9yaWFscyxcbiAgICAgIGZpbHRlcmVkVHV0b3JpYWxzQ291bnQ6IF9maWx0ZXJlZFR1dG9yaWFscy5sZW5ndGgsXG4gICAgICBmaWx0ZXJlZFR1dG9yaWFsc0ZvckxvY2FsZTogZmlsdGVyZWRUdXRvcmlhbHNGb3JMb2NhbGUsXG4gICAgICB3aW5kb3dXaWR0aDogJCh3aW5kb3cpLndpZHRoKCksXG4gICAgICB3aW5kb3dIZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKSxcbiAgICAgIG1vYmlsZUxheW91dDogKDAsIF9yZXNwb25zaXZlLmlzUmVzcG9uc2l2ZUNhdGVnb3J5SW5hY3RpdmUpKCdtZCcpLFxuICAgICAgc2hvd2luZ01vZGFsRmlsdGVyczogZmFsc2UsXG4gICAgICBzb3J0Qnk6IHNvcnRCeSxcbiAgICAgIG9yZ05hbWU6IG9yZ05hbWUsXG4gICAgICBzaG93aW5nQWxsVHV0b3JpYWxzOiBzaG93aW5nQWxsVHV0b3JpYWxzLFxuICAgICAgc2VhcmNoVGVybTogZGVmYXVsdFNlYXJjaFRlcm1cbiAgICB9O1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBUdXRvcmlhbEV4cGxvcmVyLnByb3RvdHlwZTtcblxuICAvKlxuICAgKiBOb3cgdGhhdCB3ZSd2ZSByZS1yZW5kZXJlZCBjaGFuZ2VzLCBjaGVjayB0byBzZWUgaWYgdGhlcmUncyBhIHBlbmRpbmdcbiAgICogc2Nyb2xsIHRvIHRoZSB0b3Agb2YgYWxsIHR1dG9yaWFscy5cbiAgICogalF1ZXJ5IGlzIHVzZWQgdG8gZG8gdGhlIHNjcm9sbGluZywgd2hpY2ggaXMgYSBsaXR0bGUgdW51c3VhbCwgYnV0XG4gICAqIGVuc3VyZXMgYSBzbW9vdGgsIHdlbGwtZWFzZWQgbW92ZW1lbnQuXG4gICAqL1xuICBfcHJvdG8uY29tcG9uZW50RGlkVXBkYXRlID0gZnVuY3Rpb24gY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIGlmICh0aGlzLnNob3VsZFNjcm9sbFRvVG9wKSB7XG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgIHNjcm9sbFRvcDogJCh0aGlzLmFsbFR1dG9yaWFscykub2Zmc2V0KCkudG9wXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2hvdWxkU2Nyb2xsVG9Ub3AgPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFNldCB1cCBhIHNtb290aCBzY3JvbGwgdG8gdGhlIHRvcCBvZiBhbGwgdHV0b3JpYWxzIG9uY2Ugd2UndmUgcmUtcmVuZGVyZWQgdGhlXG4gICAqIHJlbGV2YW50IGNoYW5nZXMuXG4gICAqIE5vdGUgdGhhdCBpZiB0aGF0IG5leHQgcmVuZGVyIG5ldmVyIGNvbWVzLCB3ZSB3b24ndCBhY3R1YWxseSBkbyB0aGUgc2Nyb2xsLlxuICAgKi9cbiAgO1xuXG4gIF9wcm90by5zY3JvbGxUb1RvcCA9IGZ1bmN0aW9uIHNjcm9sbFRvVG9wKCkge1xuICAgIHRoaXMuc2hvdWxkU2Nyb2xsVG9Ub3AgPSB0cnVlO1xuICB9XG4gIC8qKlxuICAgKiBHaXZlbiBhIHNvcnQgYnkgY2hvaWNlIChwb3B1bGFyaXR5cmFuayBvciBkaXNwbGF5d2VpZ2h0KSBhbmQgYSBncmFkZSByYW5nZSxcbiAgICogcmV0dXJuIHRoZSBmaWVsZCBuYW1lIGZyb20gdGhlIHR1dG9yaWFscyBkYXRhIHRoYXQgc2hvdWxkIHVzZWQgZm9yIHNvcnRpbmcuXG4gICAqL1xuICA7XG5cbiAgX3Byb3RvLmdldFNvcnRCeUZpZWxkTmFtZSA9IGZ1bmN0aW9uIGdldFNvcnRCeUZpZWxkTmFtZShzb3J0QnksIGdyYWRlKSB7XG4gICAgdmFyIHNvcnRCeUZpZWxkTmFtZTtcbiAgICB2YXIgZ3JhZGVUb0Rpc3BsYXlXZWlnaHRTb3J0QnlGaWVsZE5hbWUgPSB7XG4gICAgICBhbGw6IF91dGlsLlR1dG9yaWFsc1NvcnRCeUZpZWxkTmFtZXMuZGlzcGxheXdlaWdodCxcbiAgICAgIHByZTogX3V0aWwuVHV0b3JpYWxzU29ydEJ5RmllbGROYW1lcy5kaXNwbGF5d2VpZ2h0X3ByZSxcbiAgICAgICcyLTUnOiBfdXRpbC5UdXRvcmlhbHNTb3J0QnlGaWVsZE5hbWVzLmRpc3BsYXl3ZWlnaHRfMjUsXG4gICAgICAnNi04JzogX3V0aWwuVHV0b3JpYWxzU29ydEJ5RmllbGROYW1lcy5kaXNwbGF5d2VpZ2h0X21pZGRsZSxcbiAgICAgICc5Kyc6IF91dGlsLlR1dG9yaWFsc1NvcnRCeUZpZWxkTmFtZXMuZGlzcGxheXdlaWdodF9oaWdoXG4gICAgfTtcbiAgICB2YXIgZ3JhZGVUb1BvcHVsYXJpdHlSYW5rU29ydEJ5RmllbGROYW1lID0ge1xuICAgICAgYWxsOiBfdXRpbC5UdXRvcmlhbHNTb3J0QnlGaWVsZE5hbWVzLnBvcHVsYXJpdHlyYW5rLFxuICAgICAgcHJlOiBfdXRpbC5UdXRvcmlhbHNTb3J0QnlGaWVsZE5hbWVzLnBvcHVsYXJpdHlyYW5rX3ByZSxcbiAgICAgICcyLTUnOiBfdXRpbC5UdXRvcmlhbHNTb3J0QnlGaWVsZE5hbWVzLnBvcHVsYXJpdHlyYW5rXzI1LFxuICAgICAgJzYtOCc6IF91dGlsLlR1dG9yaWFsc1NvcnRCeUZpZWxkTmFtZXMucG9wdWxhcml0eXJhbmtfbWlkZGxlLFxuICAgICAgJzkrJzogX3V0aWwuVHV0b3JpYWxzU29ydEJ5RmllbGROYW1lcy5wb3B1bGFyaXR5cmFua19oaWdoXG4gICAgfTsgLy8gSWYgd2UncmUgc29ydGluZyBieSByZWNvbW1lbmRhdGlvbiAoYS5rLmEuIGRpc3BsYXl3ZWlnaHQpIHRoZW4gZmluZCB0aGVcbiAgICAvLyByaWdodCBzZXQgb2YgZGF0YSB0byBtYXRjaCB0aGUgY3VycmVudGx5LXNlbGVjdGVkIGdyYWRlLlxuXG4gICAgaWYgKHNvcnRCeSA9PT0gX3V0aWwuVHV0b3JpYWxzU29ydEJ5T3B0aW9ucy5kaXNwbGF5d2VpZ2h0KSB7XG4gICAgICBzb3J0QnlGaWVsZE5hbWUgPSBncmFkZVRvRGlzcGxheVdlaWdodFNvcnRCeUZpZWxkTmFtZVtncmFkZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHNvcnRCeUZpZWxkTmFtZSA9IGdyYWRlVG9Qb3B1bGFyaXR5UmFua1NvcnRCeUZpZWxkTmFtZVtncmFkZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNvcnRCeUZpZWxkTmFtZTtcbiAgfVxuICAvKlxuICAgKiBUaGUgbWFpbiB0dXRvcmlhbCBzZXQgaXMgcmV0dXJuZWQgd2l0aCB0aGUgZ2l2ZW4gZmlsdGVycyBhbmQgc29ydCBvcmRlci5cbiAgICpcbiAgICogV2hldGhlciBlbiBvciBub24tZW4gdXNlciwgdGhpcyBmaWx0ZXJzIGFzIHRob3VnaCB0aGUgdXNlciBpcyBvZiBcImVuLVVTXCIgbG9jYWxlLlxuICAgKi9cbiAgO1xuXG4gIF9wcm90by5maWx0ZXJUdXRvcmlhbFNldCA9IGZ1bmN0aW9uIGZpbHRlclR1dG9yaWFsU2V0KGZpbHRlcnMsIHNvcnRCeSwgb3JnTmFtZSwgc2VhcmNoVGVybSkge1xuICAgIHZhciBncmFkZSA9IGZpbHRlcnMuZ3JhZGVbMF07XG4gICAgdmFyIGZpbHRlclByb3BzID0ge1xuICAgICAgZmlsdGVyczogZmlsdGVycyxcbiAgICAgIGhpZGVGaWx0ZXJzOiB0aGlzLnByb3BzLmhpZGVGaWx0ZXJzLFxuICAgICAgbG9jYWxlOiAnZW4tVVMnLFxuICAgICAgb3JnTmFtZTogb3JnTmFtZSxcbiAgICAgIHNvcnRCeUZpZWxkTmFtZTogdGhpcy5nZXRTb3J0QnlGaWVsZE5hbWUoc29ydEJ5LCBncmFkZSksXG4gICAgICBzZWFyY2hUZXJtOiBzZWFyY2hUZXJtXG4gICAgfTtcbiAgICByZXR1cm4gVHV0b3JpYWxFeHBsb3Jlci5maWx0ZXJUdXRvcmlhbHModGhpcy5wcm9wcy50dXRvcmlhbHMsIGZpbHRlclByb3BzKTtcbiAgfVxuICAvKlxuICAgKiBUaGUgZXh0cmEgc2V0IG9mIHR1dG9yaWFscyBmb3IgYSBzcGVjaWZpYyBsb2NhbGUsIHNob3duIGF0IHRvcCBmb3Igbm9uLWVuIHVzZXJcbiAgICogd2l0aCBubyBmaWx0ZXIgb3B0aW9ucy5cbiAgICogSWYgbm90IHJvYm90aWNzIHBhZ2UsIHNob3cgYWxsIHR1dG9yaWFscyBpbmNsdWRpbmcgcm9ib3RpY3MuICBJZiByb2JvdGljcyBwYWdlLFxuICAgKiB0aGVuIHVzZSB0aGF0IGZpbHRlci5cbiAgICovXG4gIDtcblxuICBfcHJvdG8uZmlsdGVyVHV0b3JpYWxTZXRGb3JMb2NhbGUgPSBmdW5jdGlvbiBmaWx0ZXJUdXRvcmlhbFNldEZvckxvY2FsZSgpIHtcbiAgICB2YXIgZmlsdGVyUHJvcHMgPSB7XG4gICAgICBzb3J0QnlGaWVsZE5hbWU6IHRoaXMucHJvcHMuZGVmYXVsdFNvcnRCeVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5pc1JvYm90aWNzKCkpIHtcbiAgICAgIGZpbHRlclByb3BzLmZpbHRlcnMgPSB7XG4gICAgICAgIGFjdGl2aXR5X3R5cGU6IFsncm9ib3RpY3MnXVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmaWx0ZXJQcm9wcy5zcGVjaWZpY0xvY2FsZSA9IHRydWU7XG4gICAgZmlsdGVyUHJvcHMubG9jYWxlID0gdGhpcy5wcm9wcy5sb2NhbGU7XG4gICAgcmV0dXJuIFR1dG9yaWFsRXhwbG9yZXIuZmlsdGVyVHV0b3JpYWxzKHRoaXMucHJvcHMudHV0b3JpYWxzLCBmaWx0ZXJQcm9wcyk7XG4gIH07XG5cbiAgX3Byb3RvLmdldFVuaXF1ZU9yZ05hbWVzID0gZnVuY3Rpb24gZ2V0VW5pcXVlT3JnTmFtZXMoKSB7XG4gICAgcmV0dXJuIFR1dG9yaWFsRXhwbG9yZXIuZ2V0VW5pcXVlT3JnTmFtZXNGcm9tVHV0b3JpYWxzKHRoaXMucHJvcHMudHV0b3JpYWxzLCB0aGlzLmlzUm9ib3RpY3MoKSk7XG4gIH07XG5cbiAgX3Byb3RvLmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIF9sb2Rhc2hbXCJkZWZhdWx0XCJdLmRlYm91bmNlKHRoaXMub25SZXNpemUsIDEwMCkpO1xuICB9O1xuXG4gIF9wcm90by5zaG91bGRTaG93RmlsdGVycyA9IGZ1bmN0aW9uIHNob3VsZFNob3dGaWx0ZXJzKCkge1xuICAgIHJldHVybiAhdGhpcy5zdGF0ZS5tb2JpbGVMYXlvdXQgfHwgdGhpcy5zdGF0ZS5zaG93aW5nTW9kYWxGaWx0ZXJzO1xuICB9O1xuXG4gIF9wcm90by5zaG91bGRTaG93VHV0b3JpYWxzID0gZnVuY3Rpb24gc2hvdWxkU2hvd1R1dG9yaWFscygpIHtcbiAgICByZXR1cm4gIXRoaXMuc3RhdGUubW9iaWxlTGF5b3V0IHx8ICF0aGlzLnN0YXRlLnNob3dpbmdNb2RhbEZpbHRlcnM7XG4gIH07XG5cbiAgX3Byb3RvLnNob3VsZFNob3dUdXRvcmlhbHNGb3JMb2NhbGUgPSBmdW5jdGlvbiBzaG91bGRTaG93VHV0b3JpYWxzRm9yTG9jYWxlKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0xvY2FsZUVuZ2xpc2goKTtcbiAgfTtcblxuICBfcHJvdG8uc2hvdWxkU2hvd0FsbFR1dG9yaWFsc1RvZ2dsZUJ1dHRvbiA9IGZ1bmN0aW9uIHNob3VsZFNob3dBbGxUdXRvcmlhbHNUb2dnbGVCdXR0b24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzTG9jYWxlRW5nbGlzaCgpO1xuICB9O1xuXG4gIF9wcm90by5pc0xvY2FsZUVuZ2xpc2ggPSBmdW5jdGlvbiBpc0xvY2FsZUVuZ2xpc2goKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMubG9jYWxlLnN1YnN0cmluZygwLCAyKSA9PT0gJ2VuJztcbiAgfTtcblxuICBfcHJvdG8uaXNSb2JvdGljcyA9IGZ1bmN0aW9uIGlzUm9ib3RpY3MoKSB7XG4gICAgcmV0dXJuICF0aGlzLnByb3BzLnJvYm90aWNzQnV0dG9uVXJsO1xuICB9XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgd2luZG93IHJlc2l6ZXMuIExvb2sgdG8gc2VlIGlmIHdpZHRoL2hlaWdodCBjaGFuZ2VkLCB0aGVuXG4gICAqIGNhbGwgYWRqdXN0VG9wUGFuZUhlaWdodCBhcyBvdXIgbWF4SGVpZ2h0IG1heSBuZWVkIGFkanVzdGluZy5cbiAgICovXG4gIDtcblxuICAvKipcbiAgICogRmlsdGVycyBhIGdpdmVuIGFycmF5IG9mIHR1dG9yaWFscyBieSB0aGUgZ2l2ZW4gZmlsdGVyIHByb3BzLlxuICAgKlxuICAgKiBJdCBnb2VzIHRocm91Z2ggYWxsIGFjdGl2ZSBmaWx0ZXIgY2F0ZWdvcmllcy4gIElmIG5vIGZpbHRlcnMgYXJlIHNldCBmb3JcbiAgICogYSBmaWx0ZXIgZ3JvdXAsIHRoZW4gdGhhdCBpdGVtIHdpbGwgZGVmYXVsdCB0byBzaG93aW5nLCBzbyBsb25nIGFzIG5vIG90aGVyXG4gICAqIGZpbHRlciBncm91cCBwcmV2ZW50cyBpdCBmcm9tIHNob3dpbmcuXG4gICAqIGhpZGVGaWx0ZXJzIGlzIGFuIGV4cGxpY2l0IGxpc3Qgb2YgZmlsdGVycyB0aGF0IHdlIGFjdHVhbGx5IGhpZGUgaWYgbWF0Y2hlZC5cbiAgICogQnV0IGlmIHdlIGRvIGhhdmUgYSBmaWx0ZXIgc2V0IGZvciBhIGZpbHRlciBncm91cCwgYW5kIHRoZSB0dXRvcmlhbCBpcyB0YWdnZWRcbiAgICogZm9yIHRoYXQgZmlsdGVyIGdyb3VwLCB0aGVuIGF0IGxlYXN0IG9uZSBvZiB0aGUgYWN0aXZlIGZpbHRlcnMgbXVzdCBtYXRjaCBhIHRhZy5cbiAgICogZS5nLiBJZiB0aGUgdXNlciBjaG9vc2VzIHR3byBwbGF0Zm9ybXMsIHRoZW4gYXQgbGVhc3Qgb25lIG9mIHRoZSBwbGF0Zm9ybXNcbiAgICogbXVzdCBtYXRjaCBhIHBsYXRmb3JtIHRhZyBvbiB0aGUgdHV0b3JpYWwuXG4gICAqIEEgc2ltaWxhciBjaGVjayBmb3IgbGFuZ3VhZ2UgaXMgZG9uZSBmaXJzdC5cbiAgICogSW4gdGhlIGNhc2UgdGhhdCBmaWx0ZXJQcm9wcy5zcGVjaWZpY0xvY2FsZSBpcyB0cnVlLCB3ZSBkbyBzb21ldGhpbmcgc2xpZ2h0bHlcbiAgICogZGlmZmVyZW50LiAgV2UgZG9uJ3Qgc2hvdyB0dXRvcmlhbHMgdGhhdCBkb24ndCBoYXZlIGFueSBsYW5ndWFnZSB0YWdzLCBhbmQgd2VcbiAgICogcmVqZWN0IHR1dG9yaWFscyB0aGF0IGRvbid0IGhhdmUgdGhlIGN1cnJlbnQgbG9jYWxlIGV4cGxpY2l0bHkgbGlzdGVkLiAgVGhpc1xuICAgKiBhbGxvd3MgdXMgdG8gcmV0dXJuIGEgc2V0IG9mIHR1dG9yaWFscyB0aGF0IGhhdmUgZXhwbGljaXQgc3VwcG9ydCBmb3IgdGhlXG4gICAqIGN1cnJlbnQgbG9jYWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSB0dXRvcmlhbHMgLSBBcnJheSBvZiB0dXRvcmlhbHMuICBFYWNoIGNvbnRhaW5zIGEgdmFyaWV0eSBvZlxuICAgKiAgIHN0cmluZ3MsIGVhY2ggb2Ygd2hpY2ggaXMgYSBsaXN0IG9mIHRhZ3Mgc2VwYXJhdGVkIGJ5IGNvbW1hcywgbm8gc3BhY2VzLlxuICAgKiBAcGFyYW0ge29iamVjdH0gZmlsdGVyUHJvcHMgLSBPYmplY3QgY29udGFpbmluZyBmaWx0ZXIgcHJvcGVydGllcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbHRlclByb3BzLmxvY2FsZSAtIFRoZSBjdXJyZW50IGxvY2FsZS5cbiAgICogQHBhcmFtIHtib29sfSBmaWx0ZXJQcm9wcy5zcGVjaWZpY0xvY2FsZSAtIFdoZXRoZXIgd2UgZmlsdGVyIHRvIG9ubHkgYWxsb3dcbiAgICogICB0aHJvdWdoIHR1dG9yaWFscyBtYXRjaGluZyB0aGUgY3VycmVudCBsb2NhbGUuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmaWx0ZXJQcm9wcy5maWx0ZXJzIC0gQ29udGFpbnMgYXJyYXlzIG9mIHN0cmluZ3MgaWRlbnRpZnlpbmdcbiAgICogICB0aGUgY3VycmVudGx5IGFjdGl2ZSBmaWx0ZXJzLiAgRWFjaCBhcnJheSBpcyBuYW1lZCBmb3IgaXRzIGZpbHRlciBncm91cC5cbiAgICovXG4gIFR1dG9yaWFsRXhwbG9yZXIuZmlsdGVyVHV0b3JpYWxzID0gZnVuY3Rpb24gZmlsdGVyVHV0b3JpYWxzKHR1dG9yaWFscywgZmlsdGVyUHJvcHMpIHtcbiAgICB2YXIgX3NlYXJjaFRlcm0kdG9Mb3dlckNhO1xuXG4gICAgdmFyIGxvY2FsZSA9IGZpbHRlclByb3BzLmxvY2FsZSxcbiAgICAgICAgc3BlY2lmaWNMb2NhbGUgPSBmaWx0ZXJQcm9wcy5zcGVjaWZpY0xvY2FsZSxcbiAgICAgICAgb3JnTmFtZSA9IGZpbHRlclByb3BzLm9yZ05hbWUsXG4gICAgICAgIGZpbHRlcnMgPSBmaWx0ZXJQcm9wcy5maWx0ZXJzLFxuICAgICAgICBoaWRlRmlsdGVycyA9IGZpbHRlclByb3BzLmhpZGVGaWx0ZXJzLFxuICAgICAgICBzb3J0QnlGaWVsZE5hbWUgPSBmaWx0ZXJQcm9wcy5zb3J0QnlGaWVsZE5hbWUsXG4gICAgICAgIHNlYXJjaFRlcm0gPSBmaWx0ZXJQcm9wcy5zZWFyY2hUZXJtO1xuICAgIHZhciBjbGVhblNlYXJjaFRlcm0gPSBzZWFyY2hUZXJtID09PSBudWxsIHx8IHNlYXJjaFRlcm0gPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfc2VhcmNoVGVybSR0b0xvd2VyQ2EgPSBzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpID09PSBudWxsIHx8IF9zZWFyY2hUZXJtJHRvTG93ZXJDYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3NlYXJjaFRlcm0kdG9Mb3dlckNhLnRyaW0oKTtcbiAgICB2YXIgZmlsdGVyZWRUdXRvcmlhbHMgPSB0dXRvcmlhbHMuZmlsdGVyKGZ1bmN0aW9uICh0dXRvcmlhbCkge1xuICAgICAgdmFyIF90dXRvcmlhbCRuYW1lLCBfdHV0b3JpYWwkbG9uZ2Rlc2NyaXA7XG5cbiAgICAgIC8vIENoZWNrIHRoYXQgdGhlIHR1dG9yaWFsIGlzbid0IG1hcmtlZCBhcyBEb05vdFNob3cuICBJZiBpdCBkb2VzLFxuICAgICAgLy8gaXQncyBoaWRkZW4uXG4gICAgICBpZiAodHV0b3JpYWwudGFncy5zcGxpdCgnLCcpLmluZGV4T2YoX3V0aWwuRG9Ob3RTaG93KSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSAvLyBGaXJzdCBjaGVjayB0aGF0IHRoZSB0dXRvcmlhbCBsYW5ndWFnZSBkb2Vzbid0IGV4Y2x1ZGUgaXQgaW1tZWRpYXRlbHkuXG4gICAgICAvLyBJZiB0aGUgdGFncyBjb250YWluIHNvbWUgbGFuZ3VhZ2VzLCBhbmQgd2UgZG9uJ3QgaGF2ZSBhIG1hdGNoLCB0aGVuXG4gICAgICAvLyBoaWRlIHRoZSB0dXRvcmlhbC5cblxuXG4gICAgICBpZiAobG9jYWxlICYmIHR1dG9yaWFsLmxhbmd1YWdlc19zdXBwb3J0ZWQpIHtcbiAgICAgICAgdmFyIGxhbmd1YWdlVGFncyA9IHR1dG9yaWFsLmxhbmd1YWdlc19zdXBwb3J0ZWQuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAobGFuZ3VhZ2VUYWdzLmxlbmd0aCA+IDAgJiYgbGFuZ3VhZ2VUYWdzLmluZGV4T2YobG9jYWxlKSA9PT0gLTEgJiYgbGFuZ3VhZ2VUYWdzLmluZGV4T2YobG9jYWxlLnN1YnN0cmluZygwLCAyKSkgPT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHNwZWNpZmljTG9jYWxlKSB7XG4gICAgICAgIC8vIElmIHRoZSB0dXRvcmlhbCBkb2Vzbid0IGhhdmUgbGFuZ3VhZ2UgdGFncywgYnV0IHdlJ3JlIG9ubHkgbG9va2luZ1xuICAgICAgICAvLyBmb3Igc3BlY2lmaWMgbWF0Y2hlcyB0byBvdXIgY3VycmVudCBsb2NhbGUsIHRoZW4gZG9uJ3Qgc2hvdyB0aGlzXG4gICAgICAgIC8vIHR1dG9yaWFsLiAgaS5lLiBkb24ndCBsZXQgbm9uLWxvY2FsZS1zcGVjaWZpYyB0dXRvcmlhbHMgdGhyb3VnaC5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSAvLyBJZiB3ZSBhcmUgc2hvd2luZyBhbiBleHBsaWNpdCBvcmduYW1lLCB0aGVuIGZpbHRlciBpZiBpdCBkb2Vzbid0XG4gICAgICAvLyBtYXRjaC4gIE1ha2UgYW4gZXhjZXB0aW9uIGZvciBNaW5lY3JhZnQgc28gdGhhdCBpdCBzaG93cyB3aGVuXG4gICAgICAvLyBDb2RlLm9yZyBpcyBzZWxlY3RlZC5cblxuXG4gICAgICBpZiAob3JnTmFtZSAmJiBvcmdOYW1lICE9PSBfdXRpbC5UdXRvcmlhbHNPcmdOYW1lLmFsbCAmJiB0dXRvcmlhbC5vcmduYW1lICE9PSBvcmdOYW1lICYmICEob3JnTmFtZSA9PT0gX3V0aWwub3JnTmFtZUNvZGVPcmcgJiYgdHV0b3JpYWwub3JnbmFtZSA9PT0gX3V0aWwub3JnTmFtZU1pbmVjcmFmdCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VhcmNoVGVybSAmJiAhKChfdHV0b3JpYWwkbmFtZSA9IHR1dG9yaWFsLm5hbWUpICE9PSBudWxsICYmIF90dXRvcmlhbCRuYW1lICE9PSB2b2lkIDAgJiYgX3R1dG9yaWFsJG5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhjbGVhblNlYXJjaFRlcm0pIHx8IChfdHV0b3JpYWwkbG9uZ2Rlc2NyaXAgPSB0dXRvcmlhbC5sb25nZGVzY3JpcHRpb24pICE9PSBudWxsICYmIF90dXRvcmlhbCRsb25nZGVzY3JpcCAhPT0gdm9pZCAwICYmIF90dXRvcmlhbCRsb25nZGVzY3JpcC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGNsZWFuU2VhcmNoVGVybSkpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gLy8gSWYgd2UgYXJlIGV4cGxpY2l0bHkgaGlkaW5nIGEgbWF0Y2hpbmcgZmlsdGVyLCB0aGVuIGRvbid0IHNob3cgdGhlXG4gICAgICAvLyB0dXRvcmlhbC5cblxuXG4gICAgICBmb3IgKHZhciBmaWx0ZXJHcm91cE5hbWUgaW4gaGlkZUZpbHRlcnMpIHtcbiAgICAgICAgdmFyIHR1dG9yaWFsVGFncyA9IHR1dG9yaWFsWyd0YWdzXycgKyBmaWx0ZXJHcm91cE5hbWVdO1xuICAgICAgICB2YXIgZmlsdGVyR3JvdXAgPSBoaWRlRmlsdGVyc1tmaWx0ZXJHcm91cE5hbWVdO1xuXG4gICAgICAgIGlmIChmaWx0ZXJHcm91cC5sZW5ndGggIT09IDAgJiYgdHV0b3JpYWxUYWdzICYmIHR1dG9yaWFsVGFncy5sZW5ndGggPiAwICYmIFR1dG9yaWFsRXhwbG9yZXIuZmluZE1hdGNoaW5nVGFnKGZpbHRlckdyb3VwLCB0dXRvcmlhbFRhZ3MpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IC8vIElmIHdlIG1pc3MgYW55IGFjdGl2ZSBmaWx0ZXIgZ3JvdXAsIHRoZW4gd2UgZG9uJ3Qgc2hvdyB0aGUgdHV0b3JpYWwuXG5cblxuICAgICAgdmFyIGZpbHRlckdyb3Vwc1NhdGlzZmllZCA9IHRydWU7XG5cbiAgICAgIGZvciAodmFyIF9maWx0ZXJHcm91cE5hbWUgaW4gZmlsdGVycykge1xuICAgICAgICB2YXIgX3R1dG9yaWFsVGFncyA9IHR1dG9yaWFsWyd0YWdzXycgKyBfZmlsdGVyR3JvdXBOYW1lXTtcbiAgICAgICAgdmFyIF9maWx0ZXJHcm91cCA9IGZpbHRlcnNbX2ZpbHRlckdyb3VwTmFtZV07XG5cbiAgICAgICAgaWYgKF9maWx0ZXJHcm91cC5sZW5ndGggIT09IDAgJiYgX3R1dG9yaWFsVGFncyAmJiBfdHV0b3JpYWxUYWdzLmxlbmd0aCA+IDAgJiYgIVR1dG9yaWFsRXhwbG9yZXIuZmluZE1hdGNoaW5nVGFnKF9maWx0ZXJHcm91cCwgX3R1dG9yaWFsVGFncykpIHtcbiAgICAgICAgICBmaWx0ZXJHcm91cHNTYXRpc2ZpZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmlsdGVyR3JvdXBzU2F0aXNmaWVkO1xuICAgIH0pLnNvcnQoZnVuY3Rpb24gKHR1dG9yaWFsMSwgdHV0b3JpYWwyKSB7XG4gICAgICBpZiAoKDAsIF91dGlsLmlzVHV0b3JpYWxTb3J0QnlGaWVsZE5hbWVQb3B1bGFyaXR5KShzb3J0QnlGaWVsZE5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0dXRvcmlhbDFbc29ydEJ5RmllbGROYW1lXSAtIHR1dG9yaWFsMltzb3J0QnlGaWVsZE5hbWVdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHR1dG9yaWFsMltzb3J0QnlGaWVsZE5hbWVdIC0gdHV0b3JpYWwxW3NvcnRCeUZpZWxkTmFtZV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbHRlcmVkVHV0b3JpYWxzO1xuICB9XG4gIC8qIEdpdmVuIGEgZmlsdGVyIGdyb3VwLCBhbmQgdGhlIHR1dG9yaWFsJ3MgcmVsZXZhbnQgdGFncyBmb3IgdGhhdCBmaWx0ZXIgZ3JvdXAsXG4gICAqIHNlZSBpZiB0aGVyZSdzIGF0IGxlYXN0IGEgc2luZ2xlIG1hdGNoLlxuICAgKiBAcGFyYW0ge0FycmF5fSBmaWx0ZXJHcm91cCAtIEFycmF5IG9mIHN0cmluZ3MsIGVhY2ggb2Ygd2hpY2ggaXMgYSBzZWxlY3RlZCBmaWx0ZXJcbiAgICogICBmb3IgdGhlIGdyb3VwLiAgZS5nLiBbXCJiZWdpbm5lclwiLCBcImV4cGVyaWVuY2VkXCJdLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHV0b3JpYWxUYWdzIC0gQ29tbWEtc2VwYXJhdGVkIHRhZ3MgZm9yIGEgdHV0b3JpYWwuXG4gICAqICAgZS5nLiBcImJlZ2lubmVyLGV4cGVyaWVuY2VkXCIuXG4gICAqIEByZXR1cm4ge2Jvb2x9IC0gdHJ1ZSBpZiB0aGUgdHV0b3JpYWwgaGFkIGF0IGxlYXN0IG9uZSB0YWcgbWF0Y2hpbmcgYXQgbGVhc3RcbiAgICogICBvbmUgb2YgdGhlIGZpbHRlckdyb3VwJ3MgdmFsdWVzLlxuICAgKi9cbiAgO1xuXG4gIFR1dG9yaWFsRXhwbG9yZXIuZmluZE1hdGNoaW5nVGFnID0gZnVuY3Rpb24gZmluZE1hdGNoaW5nVGFnKGZpbHRlckdyb3VwLCB0dXRvcmlhbFRhZ3MpIHtcbiAgICByZXR1cm4gZmlsdGVyR3JvdXAuc29tZShmdW5jdGlvbiAoZmlsdGVyTmFtZSkge1xuICAgICAgcmV0dXJuIHR1dG9yaWFsVGFncy5zcGxpdCgnLCcpLmluZGV4T2YoZmlsdGVyTmFtZSkgIT09IC0xO1xuICAgIH0pO1xuICB9XG4gIC8qIFJldHVybnMgYW4gYXJyYXkgb2YgdW5pcXVlIG9yZ2FuaXphdGlvbiBuYW1lcyBmcm9tIHRoZSBzZXQgb2YgdHV0b3JpYWxzLFxuICAgKiBzb3J0ZWQgYWxwaGFiZXRpY2FsbHkuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IHR1dG9yaWFscyAtIEFycmF5IG9mIHR1dG9yaWFscy5cbiAgICogQHBhcmFtIHtib29sfSByb2JvdGljcyAtIFdoZXRoZXIgdGhlIHBhZ2UgaXMgZm9yIHJvYm90aWNzLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gLSBBcnJheSBvZiBzdHJpbmdzLlxuICAgKi9cbiAgO1xuXG4gIFR1dG9yaWFsRXhwbG9yZXIuZ2V0VW5pcXVlT3JnTmFtZXNGcm9tVHV0b3JpYWxzID0gZnVuY3Rpb24gZ2V0VW5pcXVlT3JnTmFtZXNGcm9tVHV0b3JpYWxzKHR1dG9yaWFscywgcm9ib3RpY3MpIHtcbiAgICAvLyBGaWx0ZXIgb3V0IHR1dG9yaWFscyB3aXRoIERvTm90U2hvdyBhcyBlaXRoZXIgdGFnIG9yIG9yZ2FuaXphdGlvbiBuYW1lLlxuICAgIHZhciBhdmFpbGFibGVUdXRvcmlhbHMgPSB0dXRvcmlhbHMuZmlsdGVyKGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdC50YWdzLnNwbGl0KCcsJykuaW5kZXhPZihfdXRpbC5Eb05vdFNob3cpID09PSAtMSAmJiB0Lm9yZ25hbWUgIT09IF91dGlsLkRvTm90U2hvdztcbiAgICB9KTsgLy8gRW5zdXJlIHJvYm90aWNzIHRhZyBpcyBlaXRoZXIgcHJlc2VudCBvciBhYnNlbnQsIGRlcGVuZGluZyB3aGV0aGVyIHdlXG4gICAgLy8gYXJlIG9uIHJvYm90aWNzIHZhcmlhbnQgb2YgdGhlIHBhZ2Ugb3Igbm90LlxuXG4gICAgYXZhaWxhYmxlVHV0b3JpYWxzID0gYXZhaWxhYmxlVHV0b3JpYWxzLmZpbHRlcihmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKHJvYm90aWNzKSB7XG4gICAgICAgIHJldHVybiB0LnRhZ3NfYWN0aXZpdHlfdHlwZS5zcGxpdCgnLCcpLmluZGV4T2YoJ3JvYm90aWNzJykgIT09IC0xO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHQudGFnc19hY3Rpdml0eV90eXBlLnNwbGl0KCcsJykuaW5kZXhPZigncm9ib3RpY3MnKSA9PT0gLTE7XG4gICAgICB9XG4gICAgfSk7IC8vIENvbnN0cnVjdCBhcnJheSBvZiB1bmlxdWUgb3JnIG5hbWVzIGZyb20gdGhlIHR1dG9yaWFscy5cblxuICAgIHZhciB1bmlxdWVPcmdOYW1lcyA9IF9sb2Rhc2hbXCJkZWZhdWx0XCJdLnVuaXEoYXZhaWxhYmxlVHV0b3JpYWxzLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQub3JnbmFtZTtcbiAgICB9KSk7IC8vIFNvcnQgdGhlIHVuaXF1ZSBvcmcgbmFtZXMgYWxwaGFiZXRpY2FsbHksIGNhc2UtaW5zZW5zaXRpdmUuXG5cblxuICAgIHVuaXF1ZU9yZ05hbWVzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLnRvTG93ZXJDYXNlKCkpO1xuICAgIH0pO1xuICAgIHJldHVybiB1bmlxdWVPcmdOYW1lcztcbiAgfTtcblxuICBfcHJvdG8ucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgdmFyIGJvdHRvbUxpbmtzQ29udGFpbmVyU3R5bGUgPSBfb2JqZWN0U3ByZWFkKHt9LCBzdHlsZXMuYm90dG9tTGlua3NDb250YWluZXIsIHtcbiAgICAgIHRleHRBbGlnbjogKDAsIF9yZXNwb25zaXZlLmdldFJlc3BvbnNpdmVWYWx1ZSkoe1xuICAgICAgICB4czogJ2xlZnQnLFxuICAgICAgICBtZDogJ3JpZ2h0J1xuICAgICAgfSksXG4gICAgICB2aXNpYmlsaXR5OiB0aGlzLnNob3VsZFNob3dUdXRvcmlhbHMoKSA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nXG4gICAgfSk7XG5cbiAgICB2YXIgZ3JhZGUgPSB0aGlzLnN0YXRlLmZpbHRlcnMuZ3JhZGVbMF07XG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZToge1xuICAgICAgICB3aWR0aDogKDAsIF9yZXNwb25zaXZlLmdldFJlc3BvbnNpdmVDb250YWluZXJXaWR0aCkoKSxcbiAgICAgICAgbWFyZ2luOiAnMCBhdXRvJyxcbiAgICAgICAgcGFkZGluZ0JvdHRvbTogMFxuICAgICAgfVxuICAgIH0sIHRoaXMuc2hvdWxkU2hvd1R1dG9yaWFsc0ZvckxvY2FsZSgpICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJoMVwiLCBudWxsLCBfbG9jYWxlW1wiZGVmYXVsdFwiXS5oZWFkaW5nVHV0b3JpYWxzWW91ckxhbmd1YWdlKCkpLCB0aGlzLnN0YXRlLmZpbHRlcmVkVHV0b3JpYWxzRm9yTG9jYWxlLmxlbmd0aCA9PT0gMCAmJiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5ub1R1dG9yaWFsc1lvdXJMYW5ndWFnZSgpLCB0aGlzLnN0YXRlLmZpbHRlcmVkVHV0b3JpYWxzRm9yTG9jYWxlLmxlbmd0aCA+IDAgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF90dXRvcmlhbFNldFtcImRlZmF1bHRcIl0sIHtcbiAgICAgIHR1dG9yaWFsczogdGhpcy5zdGF0ZS5maWx0ZXJlZFR1dG9yaWFsc0ZvckxvY2FsZSxcbiAgICAgIHNwZWNpZmljTG9jYWxlOiB0cnVlLFxuICAgICAgbG9jYWxlRW5nbGlzaDogZmFsc2UsXG4gICAgICBkaXNhYmxlZFR1dG9yaWFsczogdGhpcy5wcm9wcy5kaXNhYmxlZFR1dG9yaWFscyxcbiAgICAgIGdyYWRlOiBncmFkZVxuICAgIH0pKSwgdGhpcy5zaG91bGRTaG93QWxsVHV0b3JpYWxzVG9nZ2xlQnV0dG9uKCkgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF90b2dnbGVBbGxUdXRvcmlhbHNCdXR0b25bXCJkZWZhdWx0XCJdLCB7XG4gICAgICBzaG93QWxsVHV0b3JpYWxzOiB0aGlzLnNob3dBbGxUdXRvcmlhbHMsXG4gICAgICBoaWRlQWxsVHV0b3JpYWxzOiB0aGlzLmhpZGVBbGxUdXRvcmlhbHMsXG4gICAgICBzaG93aW5nQWxsVHV0b3JpYWxzOiB0aGlzLnN0YXRlLnNob3dpbmdBbGxUdXRvcmlhbHNcbiAgICB9KSwgdGhpcy5zdGF0ZS5zaG93aW5nQWxsVHV0b3JpYWxzICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfcmVhY3RTdGlja3kuU3RpY2t5Q29udGFpbmVyLCBudWxsLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgcmVmOiBmdW5jdGlvbiByZWYoYWxsVHV0b3JpYWxzKSB7XG4gICAgICAgIHJldHVybiBfdGhpczIuYWxsVHV0b3JpYWxzID0gYWxsVHV0b3JpYWxzO1xuICAgICAgfVxuICAgIH0sIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfZmlsdGVySGVhZGVyW1wiZGVmYXVsdFwiXSwge1xuICAgICAgbW9iaWxlTGF5b3V0OiB0aGlzLnN0YXRlLm1vYmlsZUxheW91dCxcbiAgICAgIGZpbHRlckdyb3VwczogdGhpcy5wcm9wcy5maWx0ZXJHcm91cHMsXG4gICAgICBzZWxlY3Rpb246IHRoaXMuc3RhdGUuZmlsdGVycyxcbiAgICAgIG9uVXNlcklucHV0RmlsdGVyOiB0aGlzLmhhbmRsZVVzZXJJbnB1dEZpbHRlcixcbiAgICAgIGJhY2tCdXR0b246IHRoaXMucHJvcHMuYmFja0J1dHRvbixcbiAgICAgIGZpbHRlcmVkVHV0b3JpYWxzQ291bnQ6IHRoaXMuc3RhdGUuZmlsdGVyZWRUdXRvcmlhbHNDb3VudCxcbiAgICAgIHNob3dpbmdNb2RhbEZpbHRlcnM6IHRoaXMuc3RhdGUuc2hvd2luZ01vZGFsRmlsdGVycyxcbiAgICAgIHNob3dNb2RhbEZpbHRlcnM6IHRoaXMuc2hvd01vZGFsRmlsdGVycyxcbiAgICAgIGhpZGVNb2RhbEZpbHRlcnM6IHRoaXMuaGlkZU1vZGFsRmlsdGVyc1xuICAgIH0pLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgc3R5bGU6IHtcbiAgICAgICAgY2xlYXI6ICdib3RoJ1xuICAgICAgfVxuICAgIH0pLCB0aGlzLnNob3VsZFNob3dGaWx0ZXJzKCkgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIFwiZmxvYXRcIjogJ2xlZnQnLFxuICAgICAgICB3aWR0aDogKDAsIF9yZXNwb25zaXZlLmdldFJlc3BvbnNpdmVWYWx1ZSkoe1xuICAgICAgICAgIHhzOiAxMDAsXG4gICAgICAgICAgbWQ6IDIwXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSwgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9zZWFyY2hbXCJkZWZhdWx0XCJdLCB7XG4gICAgICBvbkNoYW5nZTogdGhpcy5oYW5kbGVTZWFyY2hUZXJtLFxuICAgICAgc2hvd0NsZWFySWNvbjogdGhpcy5zdGF0ZS5zZWFyY2hUZXJtICE9PSAnJ1xuICAgIH0pLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX2ZpbHRlclNldFtcImRlZmF1bHRcIl0sIHtcbiAgICAgIG1vYmlsZUxheW91dDogdGhpcy5zdGF0ZS5tb2JpbGVMYXlvdXQsXG4gICAgICB1bmlxdWVPcmdOYW1lczogdGhpcy5nZXRVbmlxdWVPcmdOYW1lcygpLFxuICAgICAgb3JnTmFtZTogdGhpcy5zdGF0ZS5vcmdOYW1lLFxuICAgICAgc2hvd1NvcnREcm9wZG93bjogdGhpcy5wcm9wcy5zaG93U29ydERyb3Bkb3duLFxuICAgICAgZGVmYXVsdFNvcnRCeTogdGhpcy5wcm9wcy5kZWZhdWx0U29ydEJ5LFxuICAgICAgc29ydEJ5OiB0aGlzLnN0YXRlLnNvcnRCeSxcbiAgICAgIGZpbHRlckdyb3VwczogdGhpcy5wcm9wcy5maWx0ZXJHcm91cHMsXG4gICAgICBzZWxlY3Rpb246IHRoaXMuc3RhdGUuZmlsdGVycyxcbiAgICAgIG9uVXNlcklucHV0RmlsdGVyOiB0aGlzLmhhbmRsZVVzZXJJbnB1dEZpbHRlcixcbiAgICAgIG9uVXNlcklucHV0T3JnTmFtZTogdGhpcy5oYW5kbGVVc2VySW5wdXRPcmdOYW1lLFxuICAgICAgb25Vc2VySW5wdXRTb3J0Qnk6IHRoaXMuaGFuZGxlVXNlcklucHV0U29ydEJ5LFxuICAgICAgcm9ib3RpY3NCdXR0b25Vcmw6IHRoaXMucHJvcHMucm9ib3RpY3NCdXR0b25VcmxcbiAgICB9KSksIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBzdHlsZToge1xuICAgICAgICBcImZsb2F0XCI6ICdsZWZ0JyxcbiAgICAgICAgd2lkdGg6ICgwLCBfcmVzcG9uc2l2ZS5nZXRSZXNwb25zaXZlVmFsdWUpKHtcbiAgICAgICAgICB4czogMTAwLFxuICAgICAgICAgIG1kOiA4MFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sIHRoaXMuc2hvdWxkU2hvd1R1dG9yaWFscygpICYmIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfdHV0b3JpYWxTZXRbXCJkZWZhdWx0XCJdLCB7XG4gICAgICB0dXRvcmlhbHM6IHRoaXMuc3RhdGUuZmlsdGVyZWRUdXRvcmlhbHMsXG4gICAgICBsb2NhbGVFbmdsaXNoOiB0aGlzLmlzTG9jYWxlRW5nbGlzaCgpLFxuICAgICAgZGlzYWJsZWRUdXRvcmlhbHM6IHRoaXMucHJvcHMuZGlzYWJsZWRUdXRvcmlhbHMsXG4gICAgICBncmFkZTogZ3JhZGVcbiAgICB9KSkpKSk7XG4gIH07XG5cbiAgcmV0dXJuIFR1dG9yaWFsRXhwbG9yZXI7XG59KF9yZWFjdFtcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBUdXRvcmlhbEV4cGxvcmVyO1xuXG5fZGVmaW5lUHJvcGVydHkoVHV0b3JpYWxFeHBsb3JlciwgXCJwcm9wVHlwZXNcIiwge1xuICB0dXRvcmlhbHM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5LmlzUmVxdWlyZWQsXG4gIGZpbHRlckdyb3VwczogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uYXJyYXkuaXNSZXF1aXJlZCxcbiAgaW5pdGlhbEZpbHRlcnM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLm9iamVjdE9mKF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5T2YoX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nKSkuaXNSZXF1aXJlZCxcbiAgaGlkZUZpbHRlcnM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLm9iamVjdE9mKF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5T2YoX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nKSksXG4gIGxvY2FsZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nLmlzUmVxdWlyZWQsXG4gIGJhY2tCdXR0b246IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmJvb2wsXG4gIHJvYm90aWNzQnV0dG9uVXJsOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5zdHJpbmcsXG4gIHNob3dTb3J0RHJvcGRvd246IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmJvb2wuaXNSZXF1aXJlZCxcbiAgZGlzYWJsZWRUdXRvcmlhbHM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5T2YoX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nKS5pc1JlcXVpcmVkLFxuICBkZWZhdWx0U29ydEJ5OiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5vbmVPZihPYmplY3Qua2V5cyhfdXRpbC5UdXRvcmlhbHNTb3J0QnlPcHRpb25zKSkuaXNSZXF1aXJlZFxufSk7XG5cbnZhciBzdHlsZXMgPSB7XG4gIGJvdHRvbUxpbmtzQ29udGFpbmVyOiB7XG4gICAgcGFkZGluZzogJzEwcHggN3B4IDQwcHggN3B4JyxcbiAgICBmb250U2l6ZTogMTMsXG4gICAgbGluZUhlaWdodDogJzE3cHgnLFxuICAgIGNsZWFyOiAnYm90aCdcbiAgfSxcbiAgYm90dG9tTGlua3NMaW5rOiB7XG4gICAgZm9udEZhbWlseTogJ1wiR290aGFtIDVyXCIsIHNhbnMtc2VyaWYnXG4gIH0sXG4gIGJvdHRvbUxpbmtzTGlua0ZpcnN0OiB7XG4gICAgcGFkZGluZ0JvdHRvbTogMTBcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0RmlsdGVycyhfcmVmKSB7XG4gIHZhciByb2JvdGljcyA9IF9yZWYucm9ib3RpY3MsXG4gICAgICBtb2JpbGUgPSBfcmVmLm1vYmlsZTtcbiAgdmFyIGZpbHRlcnMgPSBbe1xuICAgIG5hbWU6ICdncmFkZScsXG4gICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyR3JhZGVzKCksXG4gICAgaGVhZGVyT25EZXNrdG9wOiB0cnVlLFxuICAgIHNpbmdsZUVudHJ5OiB0cnVlLFxuICAgIGVudHJpZXM6IFt7XG4gICAgICBuYW1lOiAnYWxsJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlckdyYWRlc0FsbCgpXG4gICAgfSwge1xuICAgICAgbmFtZTogJ3ByZScsXG4gICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJHcmFkZXNQcmUoKVxuICAgIH0sIHtcbiAgICAgIG5hbWU6ICcyLTUnLFxuICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyR3JhZGVzMjUoKVxuICAgIH0sIHtcbiAgICAgIG5hbWU6ICc2LTgnLFxuICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyR3JhZGVzNjgoKVxuICAgIH0sIHtcbiAgICAgIG5hbWU6ICc5KycsXG4gICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJHcmFkZXM5KClcbiAgICB9XVxuICB9LCB7XG4gICAgbmFtZTogJ3N0dWRlbnRfZXhwZXJpZW5jZScsXG4gICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyU3R1ZGVudEV4cGVyaWVuY2UoKSxcbiAgICBoZWFkZXJPbkRlc2t0b3A6IHRydWUsXG4gICAgc2luZ2xlRW50cnk6IHRydWUsXG4gICAgZW50cmllczogW3tcbiAgICAgIG5hbWU6ICdiZWdpbm5lcicsXG4gICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJTdHVkZW50RXhwZXJpZW5jZUJlZ2lubmVyKClcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnY29tZm9ydGFibGUnLFxuICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyU3R1ZGVudEV4cGVyaWVuY2VDb21mb3J0YWJsZSgpXG4gICAgfV1cbiAgfSwge1xuICAgIG5hbWU6ICdwbGF0Zm9ybScsXG4gICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyUGxhdGZvcm0oKSxcbiAgICBlbnRyaWVzOiBbe1xuICAgICAgbmFtZTogJ2NvbXB1dGVycycsXG4gICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJQbGF0Zm9ybUNvbXB1dGVycygpXG4gICAgfSwge1xuICAgICAgbmFtZTogJ2FuZHJvaWQnLFxuICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyUGxhdGZvcm1BbmRyb2lkKClcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnaW9zJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclBsYXRmb3JtSW9zKClcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnc2NyZWVucmVhZGVyJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclBsYXRmb3JtU2NyZWVuUmVhZGVyKClcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnbm8taW50ZXJuZXQnLFxuICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyUGxhdGZvcm1Ob0ludGVybmV0KClcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnbm8tY29tcHV0ZXJzJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclBsYXRmb3JtTm9Db21wdXRlcnMoKVxuICAgIH1dXG4gIH0sIHtcbiAgICBuYW1lOiAnc3ViamVjdCcsXG4gICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyVG9waWNzKCksXG4gICAgZW50cmllczogW3tcbiAgICAgIG5hbWU6ICdzY2llbmNlJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclRvcGljc1NjaWVuY2UoKVxuICAgIH0sIHtcbiAgICAgIG5hbWU6ICdtYXRoJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclRvcGljc01hdGgoKVxuICAgIH0sIHtcbiAgICAgIG5hbWU6ICdoaXN0b3J5JyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclRvcGljc0hpc3RvcnkoKVxuICAgIH0sIHtcbiAgICAgIG5hbWU6ICdsYScsXG4gICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJUb3BpY3NMYSgpXG4gICAgfSwge1xuICAgICAgbmFtZTogJ2FydCcsXG4gICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJUb3BpY3NBcnQoKVxuICAgIH0sIHtcbiAgICAgIG5hbWU6ICdjcy1vbmx5JyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclRvcGljc0NzT25seSgpXG4gICAgfV1cbiAgfSwge1xuICAgIG5hbWU6ICdhY3Rpdml0eV90eXBlJyxcbiAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJBY3Rpdml0eVR5cGUoKSxcbiAgICBlbnRyaWVzOiBbe1xuICAgICAgbmFtZTogJ29ubGluZS10dXRvcmlhbCcsXG4gICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJBY3Rpdml0eVR5cGVPbmxpbmVUdXRvcmlhbCgpXG4gICAgfSwge1xuICAgICAgbmFtZTogJ2xlc3Nvbi1wbGFuJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlckFjdGl2aXR5VHlwZUxlc3NvblBsYW4oKVxuICAgIH1dXG4gIH0sIHtcbiAgICBuYW1lOiAnbGVuZ3RoJyxcbiAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJMZW5ndGgoKSxcbiAgICBlbnRyaWVzOiBbe1xuICAgICAgbmFtZTogJzFob3VyJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlckxlbmd0aDFIb3VyKClcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnMWhvdXItZm9sbG93JyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlckxlbmd0aDFIb3VyRm9sbG93KClcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnZmV3LWhvdXJzJyxcbiAgICAgIHRleHQ6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlckxlbmd0aEZld0hvdXJzKClcbiAgICB9XVxuICB9LCB7XG4gICAgbmFtZTogJ3Byb2dyYW1taW5nX2xhbmd1YWdlJyxcbiAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJQcm9ncmFtbWluZ0xhbmd1YWdlKCksXG4gICAgZW50cmllczogW3tcbiAgICAgIG5hbWU6ICdibG9ja3MnLFxuICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyUHJvZ3JhbW1pbmdMYW5ndWFnZUJsb2NrcygpXG4gICAgfSwge1xuICAgICAgbmFtZTogJ3R5cGluZycsXG4gICAgICB0ZXh0OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJQcm9ncmFtbWluZ0xhbmd1YWdlVHlwaW5nKClcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnb3RoZXInLFxuICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyUHJvZ3JhbW1pbmdMYW5ndWFnZU90aGVyKClcbiAgICB9XVxuICB9XTtcbiAgdmFyIGluaXRpYWxGaWx0ZXJzID0ge1xuICAgIHN0dWRlbnRfZXhwZXJpZW5jZTogWydiZWdpbm5lciddLFxuICAgIGdyYWRlOiBbJ2FsbCddXG4gIH07XG4gIHZhciBoaWRlRmlsdGVycyA9IHtcbiAgICBhY3Rpdml0eV90eXBlOiBbJ3JvYm90aWNzJ11cbiAgfTtcblxuICBpZiAocm9ib3RpY3MpIHtcbiAgICBmaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZpbHRlckdyb3VwKSB7XG4gICAgICBpZiAoZmlsdGVyR3JvdXAubmFtZSA9PT0gJ2FjdGl2aXR5X3R5cGUnKSB7XG4gICAgICAgIGZpbHRlckdyb3VwLmVudHJpZXMgPSBbe1xuICAgICAgICAgIG5hbWU6ICdyb2JvdGljcycsXG4gICAgICAgICAgdGV4dDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyQWN0aXZpdHlUeXBlUm9ib3RpY3MoKVxuICAgICAgICB9XTtcbiAgICAgICAgZmlsdGVyR3JvdXAuZGlzcGxheSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGluaXRpYWxGaWx0ZXJzLmFjdGl2aXR5X3R5cGUgPSBbJ3JvYm90aWNzJ107XG4gICAgaGlkZUZpbHRlcnMuYWN0aXZpdHlfdHlwZSA9IFtdO1xuICB9XG5cbiAgaWYgKG1vYmlsZSkge1xuICAgIGluaXRpYWxGaWx0ZXJzLnBsYXRmb3JtID0gWydhbmRyb2lkJywgJ2lvcyddO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBmaWx0ZXJzOiBmaWx0ZXJzLFxuICAgIGluaXRpYWxGaWx0ZXJzOiBpbml0aWFsRmlsdGVycyxcbiAgICBoaWRlRmlsdGVyczogaGlkZUZpbHRlcnNcbiAgfTtcbn1cbi8qXG4gKiBQYXJzZSBVUkwgcGFyYW1ldGVycyB0byByZXRyaWV2ZSBhbiBvdmVycmlkZSBvZiBpbml0aWFsRmlsdGVycy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBmaWx0ZXJzIC0gQXJyYXkgb2YgZmlsdGVyR3JvdXAgb2JqZWN0cy5cbiAqIEBwYXJhbSB7Ym9vbH0gcm9ib3RpY3MgLSB3aGV0aGVyIG9uIHRoZSByb2JvdGljcyBwYWdlLlxuICpcbiAqIEByZXR1cm4ge29iamVjdH0gLSBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIGFycmF5cyBvZiBzdHJpbmdzLiAgRWFjaFxuICogICBhcnJheSBpcyBuYW1lZCBmb3IgYSBmaWx0ZXJHcm91cCBuYW1lLCBhbmQgZWFjaCBzdHJpbmcgaW5zaWRlIGlzIG5hbWVkXG4gKiAgIGZvciBhIGZpbHRlciBlbnRyeS4gIE5vdGUgdGhhdCB0aGlzIGlzIG5vdCBjdXJyZW50bHkgd2hpdGUtbGlzdGVkIGFnYWluc3RcbiAqICAgb3VyIGtub3duIG5hbWUgb2YgZmlsdGVyR3JvdXBzL2VudHJpZXMsIGJ1dCBpbnZhbGlkIGVudHJpZXMgc2hvdWxkIGJlXG4gKiAgIGlnbm9yZWQgaW4gdGhlIGZpbHRlcmluZyB1c2VyIGV4cGVyaWVuY2UuXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRVcmxQYXJhbWV0ZXJzKGZpbHRlcnMsIHJvYm90aWNzKSB7XG4gIC8vIENyZWF0ZSBhIHJlc3VsdCBvYmplY3QgdGhhdCBoYXMgYSBfX3Byb3RvX18gc28gdGhhdCBSZWFjdCB2YWxpZGF0aW9uIHdpbGwgd29ya1xuICAvLyBwcm9wZXJseS5cbiAgdmFyIHBhcmFtZXRlcnNPYmplY3QgPSB7fTtcblxuICB2YXIgcGFyYW1ldGVycyA9IF9xdWVyeVN0cmluZ1tcImRlZmF1bHRcIl0ucGFyc2UobG9jYXRpb24uc2VhcmNoKTtcblxuICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChuYW1lKSB7XG4gICAgdmFyIGZpbHRlckdyb3VwID0gZmlsdGVycy5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gaXRlbS5uYW1lID09PSBuYW1lO1xuICAgIH0pOyAvLyBWYWxpZGF0ZSBmaWx0ZXJHcm91cCBuYW1lLlxuXG4gICAgaWYgKGZpbHRlckdyb3VwKSB7XG4gICAgICB2YXIgZW50cnlOYW1lcyA9IFtdO1xuXG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbbmFtZV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIENvbnZlcnQgaXRlbSB3aXRoIHNpbmdsZSBmaWx0ZXIgZW50cnkgaW50byBhcnJheSBjb250YWluaW5nIHRoZSBzdHJpbmcuXG4gICAgICAgIGVudHJ5TmFtZXMgPSBbcGFyYW1ldGVyc1tuYW1lXV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbnRyeU5hbWVzID0gcGFyYW1ldGVyc1tuYW1lXTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9sb29wMiA9IGZ1bmN0aW9uIF9sb29wMihlbnRyeSkge1xuICAgICAgICB2YXIgZW50cnlOYW1lID0gZW50cnlOYW1lc1tlbnRyeV07IC8vIFZhbGlkYXRlIGVudHJ5IG5hbWUuXG5cbiAgICAgICAgaWYgKGZpbHRlckdyb3VwLmVudHJpZXMuZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIHJldHVybiBpdGVtLm5hbWUgPT09IGVudHJ5TmFtZTtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgICBpZiAoIXBhcmFtZXRlcnNPYmplY3RbbmFtZV0pIHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnNPYmplY3RbbmFtZV0gPSBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYXJhbWV0ZXJzT2JqZWN0W25hbWVdLnB1c2goZW50cnlOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZm9yICh2YXIgZW50cnkgaW4gZW50cnlOYW1lcykge1xuICAgICAgICBfbG9vcDIoZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBmb3IgKHZhciBuYW1lIGluIHBhcmFtZXRlcnMpIHtcbiAgICBfbG9vcChuYW1lKTtcbiAgfVxuXG4gIGlmIChyb2JvdGljcykge1xuICAgIC8vIFRoZSByb2JvdGljcyBwYWdlIHJlbWFpbnMgZGVkaWNhdGVkIHRvIHJvYm90aWNzIGFjdGl2aXRpZXMuXG4gICAgcGFyYW1ldGVyc09iamVjdC5hY3Rpdml0eV90eXBlID0gWydyb2JvdGljcyddO1xuICAgIHBhcmFtZXRlcnNPYmplY3Quc3R1ZGVudF9leHBlcmllbmNlID0gWydiZWdpbm5lciddO1xuICAgIHBhcmFtZXRlcnNPYmplY3QuZ3JhZGUgPSBbJ2FsbCddO1xuICB9XG5cbiAgcmV0dXJuIHBhcmFtZXRlcnNPYmplY3Q7XG59XG5cbndpbmRvdy5UdXRvcmlhbEV4cGxvcmVyTWFuYWdlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIG9wdGlvbnMubW9iaWxlID0gKDAsIF91dGlsLm1vYmlsZUNoZWNrKSgpO1xuXG4gIHZhciBfZ2V0RmlsdGVycyA9IGdldEZpbHRlcnMob3B0aW9ucyksXG4gICAgICBmaWx0ZXJzID0gX2dldEZpbHRlcnMuZmlsdGVycyxcbiAgICAgIGluaXRpYWxGaWx0ZXJzID0gX2dldEZpbHRlcnMuaW5pdGlhbEZpbHRlcnMsXG4gICAgICBoaWRlRmlsdGVycyA9IF9nZXRGaWx0ZXJzLmhpZGVGaWx0ZXJzO1xuXG4gIHZhciByb2JvdGljcyA9ICFvcHRpb25zLnJvYm90aWNzQnV0dG9uVXJsOyAvLyBDaGVjayBmb3IgVVJMLWJhc2VkIG92ZXJyaWRlIG9mIGluaXRpYWxGaWx0ZXJzLlxuXG4gIHZhciBwcm92aWRlZFBhcmFtZXRlcnMgPSBnZXRVcmxQYXJhbWV0ZXJzKGZpbHRlcnMsIHJvYm90aWNzKTtcblxuICBpZiAoIV9sb2Rhc2hbXCJkZWZhdWx0XCJdLmlzRW1wdHkocHJvdmlkZWRQYXJhbWV0ZXJzKSkge1xuICAgIGluaXRpYWxGaWx0ZXJzID0gcHJvdmlkZWRQYXJhbWV0ZXJzO1xuICB9IC8vIFRoZSBjYWxsZXIgY2FuIHByb3ZpZGUgZGVmYXVsdFNvcnRCeVBvcHVsYXJpdHksIGFuZCB3aGVuIHRydWUsIHRoZSBkZWZhdWx0IHNvcnQgd2lsbFxuICAvLyBiZSBieSBwb3B1bGFyaXR5LiAgT3RoZXJ3aXNlLCB0aGUgZGVmYXVsdCBzb3J0IHdpbGwgYmUgYnkgZGlzcGxheSB3ZWlnaHQuXG5cblxuICB2YXIgZGVmYXVsdFNvcnRCeSA9IG9wdGlvbnMuZGVmYXVsdFNvcnRCeVBvcHVsYXJpdHkgPyBfdXRpbC5UdXRvcmlhbHNTb3J0QnlPcHRpb25zLnBvcHVsYXJpdHlyYW5rIDogX3V0aWwuVHV0b3JpYWxzU29ydEJ5T3B0aW9ucy5kaXNwbGF5d2VpZ2h0O1xuXG4gIHRoaXMucmVuZGVyVG9FbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBfcmVhY3REb21bXCJkZWZhdWx0XCJdLnJlbmRlcihfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoVHV0b3JpYWxFeHBsb3Jlciwge1xuICAgICAgdHV0b3JpYWxzOiBvcHRpb25zLnR1dG9yaWFscyxcbiAgICAgIGZpbHRlckdyb3VwczogZmlsdGVycyxcbiAgICAgIGluaXRpYWxGaWx0ZXJzOiBpbml0aWFsRmlsdGVycyxcbiAgICAgIGhpZGVGaWx0ZXJzOiBoaWRlRmlsdGVycyxcbiAgICAgIGxvY2FsZTogb3B0aW9ucy5sb2NhbGUsXG4gICAgICBiYWNrQnV0dG9uOiBvcHRpb25zLmJhY2tCdXR0b24sXG4gICAgICByb2JvdGljc0J1dHRvblVybDogb3B0aW9ucy5yb2JvdGljc0J1dHRvblVybCxcbiAgICAgIHNob3dTb3J0RHJvcGRvd246IG9wdGlvbnMuc2hvd1NvcnREcm9wZG93bixcbiAgICAgIGRpc2FibGVkVHV0b3JpYWxzOiBvcHRpb25zLmRpc2FibGVkVHV0b3JpYWxzLFxuICAgICAgZGVmYXVsdFNvcnRCeTogZGVmYXVsdFNvcnRCeVxuICAgIH0pLCBlbGVtZW50KTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9wcm9wVHlwZXMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJwcm9wLXR5cGVzXCIpKTtcblxudmFyIF9yZWFjdCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcInJlYWN0XCIpKTtcblxudmFyIF90dXRvcmlhbCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdHV0b3JpYWxcIikpO1xuXG52YXIgX3R1dG9yaWFsRGV0YWlsID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi90dXRvcmlhbERldGFpbFwiKSk7XG5cbnZhciBfc2hhcGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9zaGFwZXNcIikpO1xuXG52YXIgX2xvY2FsZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBjZG8vdHV0b3JpYWxFeHBsb3Jlci9sb2NhbGVcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7IGlmIChzZWxmID09PSB2b2lkIDApIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgVHV0b3JpYWxTZXQgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgX2luaGVyaXRzTG9vc2UoVHV0b3JpYWxTZXQsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gIGZ1bmN0aW9uIFR1dG9yaWFsU2V0KCkge1xuICAgIHZhciBfdGhpcztcblxuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICBfdGhpcyA9IF9SZWFjdCRDb21wb25lbnQuY2FsbC5hcHBseShfUmVhY3QkQ29tcG9uZW50LCBbdGhpc10uY29uY2F0KGFyZ3MpKSB8fCB0aGlzO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcInN0YXRlXCIsIHtcbiAgICAgIHNob3dpbmdEZXRhaWw6IGZhbHNlLFxuICAgICAgY2hvc2VuSXRlbTogbnVsbFxuICAgIH0pO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcInR1dG9yaWFsQ2xpY2tlZFwiLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2hvd2luZ0RldGFpbDogdHJ1ZSxcbiAgICAgICAgY2hvc2VuSXRlbTogaXRlbVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwidHV0b3JpYWxEZXRhaWxDbG9zZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2hvd2luZ0RldGFpbDogZmFsc2UsXG4gICAgICAgIGNob3Nlbkl0ZW06IG51bGxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImNoYW5nZVR1dG9yaWFsXCIsIGZ1bmN0aW9uIChkZWx0YSkge1xuICAgICAgdmFyIGluZGV4ID0gX3RoaXMucHJvcHMudHV0b3JpYWxzLmluZGV4T2YoX3RoaXMuc3RhdGUuY2hvc2VuSXRlbSk7XG5cbiAgICAgIHZhciBuZXh0SXRlbSA9IF90aGlzLnByb3BzLnR1dG9yaWFsc1tpbmRleCArIGRlbHRhXTtcblxuICAgICAgaWYgKG5leHRJdGVtKSB7XG4gICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBzaG93aW5nRGV0YWlsOiB0cnVlLFxuICAgICAgICAgIGNob3Nlbkl0ZW06IG5leHRJdGVtXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFR1dG9yaWFsU2V0LnByb3RvdHlwZTtcblxuICBfcHJvdG8ucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgdmFyIGRpc2FibGVkVHV0b3JpYWwgPSB0aGlzLnN0YXRlLnNob3dpbmdEZXRhaWwgJiYgdGhpcy5wcm9wcy5kaXNhYmxlZFR1dG9yaWFscy5pbmRleE9mKHRoaXMuc3RhdGUuY2hvc2VuSXRlbS5zaG9ydF9jb2RlKSAhPT0gLTE7XG4gICAgcmV0dXJuIF9yZWFjdFtcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBfcmVhY3RbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX3R1dG9yaWFsRGV0YWlsW1wiZGVmYXVsdFwiXSwge1xuICAgICAgc2hvd2luZzogdGhpcy5zdGF0ZS5zaG93aW5nRGV0YWlsLFxuICAgICAgaXRlbTogdGhpcy5zdGF0ZS5jaG9zZW5JdGVtLFxuICAgICAgY2xvc2VDbGlja2VkOiB0aGlzLnR1dG9yaWFsRGV0YWlsQ2xvc2VkLFxuICAgICAgbG9jYWxlRW5nbGlzaDogdGhpcy5wcm9wcy5sb2NhbGVFbmdsaXNoLFxuICAgICAgZGlzYWJsZWRUdXRvcmlhbDogZGlzYWJsZWRUdXRvcmlhbCxcbiAgICAgIGNoYW5nZVR1dG9yaWFsOiB0aGlzLmNoYW5nZVR1dG9yaWFsLFxuICAgICAgZ3JhZGU6IHRoaXMucHJvcHMuZ3JhZGVcbiAgICB9KSwgdGhpcy5wcm9wcy50dXRvcmlhbHMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF90dXRvcmlhbFtcImRlZmF1bHRcIl0sIHtcbiAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAga2V5OiBpdGVtLmNvZGUsXG4gICAgICAgIHR1dG9yaWFsQ2xpY2tlZDogX3RoaXMyLnR1dG9yaWFsQ2xpY2tlZC5iaW5kKF90aGlzMiwgaXRlbSlcbiAgICAgIH0pO1xuICAgIH0pLCB0aGlzLnByb3BzLnR1dG9yaWFscy5sZW5ndGggPT09IDAgJiYgX3JlYWN0W1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMudHV0b3JpYWxTZXROb1R1dG9yaWFsc1xuICAgIH0sIF9sb2NhbGVbXCJkZWZhdWx0XCJdLnR1dG9yaWFsU2V0Tm9UdXRvcmlhbHMoKSkpO1xuICB9O1xuXG4gIHJldHVybiBUdXRvcmlhbFNldDtcbn0oX3JlYWN0W1wiZGVmYXVsdFwiXS5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFR1dG9yaWFsU2V0O1xuXG5fZGVmaW5lUHJvcGVydHkoVHV0b3JpYWxTZXQsIFwicHJvcFR5cGVzXCIsIHtcbiAgdHV0b3JpYWxzOiBfcHJvcFR5cGVzW1wiZGVmYXVsdFwiXS5hcnJheU9mKF9zaGFwZXNbXCJkZWZhdWx0XCJdLnR1dG9yaWFsLmlzUmVxdWlyZWQpLmlzUmVxdWlyZWQsXG4gIGxvY2FsZUVuZ2xpc2g6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmJvb2wuaXNSZXF1aXJlZCxcbiAgZGlzYWJsZWRUdXRvcmlhbHM6IF9wcm9wVHlwZXNbXCJkZWZhdWx0XCJdLmFycmF5T2YoX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nKS5pc1JlcXVpcmVkLFxuICBncmFkZTogX3Byb3BUeXBlc1tcImRlZmF1bHRcIl0uc3RyaW5nLmlzUmVxdWlyZWRcbn0pO1xuXG52YXIgc3R5bGVzID0ge1xuICB0dXRvcmlhbFNldE5vVHV0b3JpYWxzOiB7XG4gICAgYmFja2dyb3VuZENvbG9yOiAnI2Q2ZDZkNicsXG4gICAgcGFkZGluZzogMjAsXG4gICAgbWFyZ2luOiA2MCxcbiAgICB3aGl0ZVNwYWNlOiAncHJlLXdyYXAnXG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5pc1R1dG9yaWFsU29ydEJ5RmllbGROYW1lUG9wdWxhcml0eSA9IGlzVHV0b3JpYWxTb3J0QnlGaWVsZE5hbWVQb3B1bGFyaXR5O1xuZXhwb3J0cy5nZXRUYWdTdHJpbmcgPSBnZXRUYWdTdHJpbmc7XG5leHBvcnRzLmdldFR1dG9yaWFsRGV0YWlsU3RyaW5nID0gZ2V0VHV0b3JpYWxEZXRhaWxTdHJpbmc7XG5leHBvcnRzLm1vYmlsZUNoZWNrID0gbW9iaWxlQ2hlY2s7XG5leHBvcnRzLm9yZ05hbWVNaW5lY3JhZnQgPSBleHBvcnRzLm9yZ05hbWVDb2RlT3JnID0gZXhwb3J0cy5Eb05vdFNob3cgPSBleHBvcnRzLlR1dG9yaWFsc09yZ05hbWUgPSBleHBvcnRzLlR1dG9yaWFsc1NvcnRCeUZpZWxkTmFtZXMgPSBleHBvcnRzLlR1dG9yaWFsc1NvcnRCeU9wdGlvbnMgPSB2b2lkIDA7XG5cbnZhciBfbG9jYWxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGNkby90dXRvcmlhbEV4cGxvcmVyL2xvY2FsZVwiKSk7XG5cbnZhciB1dGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKHJlcXVpcmUoXCIuLi91dGlsc1wiKSk7XG5cbmZ1bmN0aW9uIF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSgpIHsgaWYgKHR5cGVvZiBXZWFrTWFwICE9PSBcImZ1bmN0aW9uXCIpIHJldHVybiBudWxsOyB2YXIgY2FjaGUgPSBuZXcgV2Vha01hcCgpOyBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUgPSBmdW5jdGlvbiBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKSB7IHJldHVybiBjYWNoZTsgfTsgcmV0dXJuIGNhY2hlOyB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gaWYgKG9iaiA9PT0gbnVsbCB8fCBfdHlwZW9mKG9iaikgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG9iaiAhPT0gXCJmdW5jdGlvblwiKSB7IHJldHVybiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfSB2YXIgY2FjaGUgPSBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKTsgaWYgKGNhY2hlICYmIGNhY2hlLmhhcyhvYmopKSB7IHJldHVybiBjYWNoZS5nZXQob2JqKTsgfSB2YXIgbmV3T2JqID0ge307IHZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgeyB2YXIgZGVzYyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvciA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpIDogbnVsbDsgaWYgKGRlc2MgJiYgKGRlc2MuZ2V0IHx8IGRlc2Muc2V0KSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3T2JqLCBrZXksIGRlc2MpOyB9IGVsc2UgeyBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gfSBuZXdPYmpbXCJkZWZhdWx0XCJdID0gb2JqOyBpZiAoY2FjaGUpIHsgY2FjaGUuc2V0KG9iaiwgbmV3T2JqKTsgfSByZXR1cm4gbmV3T2JqOyB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vLyBTb3J0IEJ5IGRyb3Bkb3duIGNob2ljZXMgZm9yIHR1dG9yaWFscy5cbnZhciBUdXRvcmlhbHNTb3J0QnlPcHRpb25zID0gdXRpbHMubWFrZUVudW0oJ3BvcHVsYXJpdHlyYW5rJywgJ2Rpc3BsYXl3ZWlnaHQnKTsgLy8gU29ydCBCeSBzb3VyY2UgZGF0YSBmaWVsZCBuYW1lcyAoZnJvbSBnc2hlZXQpIGZvciB0dXRvcmlhbHMuXG5cbmV4cG9ydHMuVHV0b3JpYWxzU29ydEJ5T3B0aW9ucyA9IFR1dG9yaWFsc1NvcnRCeU9wdGlvbnM7XG52YXIgVHV0b3JpYWxzU29ydEJ5RmllbGROYW1lcyA9IHV0aWxzLm1ha2VFbnVtKCdwb3B1bGFyaXR5cmFuaycsICdwb3B1bGFyaXR5cmFua19wcmUnLCAncG9wdWxhcml0eXJhbmtfMjUnLCAncG9wdWxhcml0eXJhbmtfbWlkZGxlJywgJ3BvcHVsYXJpdHlyYW5rX2hpZ2gnLCAnZGlzcGxheXdlaWdodCcsICdkaXNwbGF5d2VpZ2h0X3ByZScsICdkaXNwbGF5d2VpZ2h0XzI1JywgJ2Rpc3BsYXl3ZWlnaHRfbWlkZGxlJywgJ2Rpc3BsYXl3ZWlnaHRfaGlnaCcpO1xuZXhwb3J0cy5UdXRvcmlhbHNTb3J0QnlGaWVsZE5hbWVzID0gVHV0b3JpYWxzU29ydEJ5RmllbGROYW1lcztcblxuZnVuY3Rpb24gaXNUdXRvcmlhbFNvcnRCeUZpZWxkTmFtZVBvcHVsYXJpdHkoc29ydEJ5RmllbGROYW1lKSB7XG4gIHJldHVybiBzb3J0QnlGaWVsZE5hbWUgPT09ICdwb3B1bGFyaXR5cmFuaycgfHwgc29ydEJ5RmllbGROYW1lID09PSAncG9wdWxhcml0eXJhbmtfcHJlJyB8fCBzb3J0QnlGaWVsZE5hbWUgPT09ICdwb3B1bGFyaXR5cmFua18yNScgfHwgc29ydEJ5RmllbGROYW1lID09PSAncG9wdWxhcml0eXJhbmtfbWlkZGxlJyB8fCBzb3J0QnlGaWVsZE5hbWUgPT09ICdwb3B1bGFyaXR5cmFua19oaWdoJztcbn0gLy8gT3JnbmFtZSB2YWx1ZS5cblxuXG52YXIgVHV0b3JpYWxzT3JnTmFtZSA9IHV0aWxzLm1ha2VFbnVtKCdhbGwnKTsgLy8gXCJkby1ub3Qtc2hvd1wiIHN0cmluZyB1c2VkIGluIHRoZSBzb3VyY2UgZGF0YSBhcyBib3RoIGEgdGFnIGFuZCBpbiBwbGFjZSBvZiBhblxuLy8gb3JnYW5pemF0aW9uIG5hbWUuXG5cbmV4cG9ydHMuVHV0b3JpYWxzT3JnTmFtZSA9IFR1dG9yaWFsc09yZ05hbWU7XG52YXIgRG9Ob3RTaG93ID0gJ2RvLW5vdC1zaG93JzsgLy8gQ29kZS5vcmcncyBvcmdhbml6YXRpb24gbmFtZS5cblxuZXhwb3J0cy5Eb05vdFNob3cgPSBEb05vdFNob3c7XG52YXIgb3JnTmFtZUNvZGVPcmcgPSAnQ29kZS5vcmcnOyAvLyBNaW5lY3JhZnQncyBvcmdhbml6YXRpb24gbmFtZS5cblxuZXhwb3J0cy5vcmdOYW1lQ29kZU9yZyA9IG9yZ05hbWVDb2RlT3JnO1xudmFyIG9yZ05hbWVNaW5lY3JhZnQgPSAnTW9qYW5nLCBNaWNyb3NvZnQgYW5kIENvZGUub3JnJztcbi8qKlxuICogRm9yIGEgY29tbWEtc2VwYXJhdGVkIHN0cmluZyBvZiB0YWdzLCBnZW5lcmF0ZSBhIGNvbW1hLXNlcGFyYXRlZCBzdHJpbmcgb2YgdGhlaXIgZnJpZW5kbHlcbiAqIG5hbWVzLlxuICogZS5nLiBHaXZlbiBhIHByZWZpeCBvZiBcInN1YmplY3RfXCIgYW5kIGEgc3RyaW5nIG9mIHRhZ3Mgb2YgXCJoaXN0b3J5LHNjaWVuY2VcIixcbiAqIGdlbmVyYXRlIHRoZSByZWFkYWJsZSBzdHJpbmcgXCJTb2NpYWwgU3R1ZGllcywgU2NpZW5jZVwiLiAgVGhlc2UgZnJpZW5kbHkgc3RyaW5ncyBhcmVcbiAqIHN0b3JlZCBpbiB0aGUgc3RyaW5nIHRhYmxlIGFzIFwic3ViamVjdF9oaXN0b3J5XCIgYW5kIFwic3ViamVjdF9zY2llbmNlXCIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCAtIFRoZSBwcmVmaXggYXBwbGllZCB0byB0aGUgdGFnIGluIHRoZSBzdHJpbmcgdGFibGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnU3RyaW5nIC0gQ29tbWEtc2VwYXJhdGVkIHRhZ3MsIG5vIHNwYWNlcy5cbiAqL1xuXG5leHBvcnRzLm9yZ05hbWVNaW5lY3JhZnQgPSBvcmdOYW1lTWluZWNyYWZ0O1xuXG5mdW5jdGlvbiBnZXRUYWdTdHJpbmcocHJlZml4LCB0YWdTdHJpbmcpIHtcbiAgaWYgKCF0YWdTdHJpbmcpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICB2YXIgdGFnVG9TdHJpbmcgPSB7XG4gICAgbGVuZ3RoXzFob3VyOiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJMZW5ndGgxSG91cigpLFxuICAgICdsZW5ndGhfMWhvdXItZm9sbG93JzogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyTGVuZ3RoMUhvdXJGb2xsb3coKSxcbiAgICAnbGVuZ3RoX2Zldy1ob3Vycyc6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlckxlbmd0aEZld0hvdXJzKCksXG4gICAgc3ViamVjdF9zY2llbmNlOiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJUb3BpY3NTY2llbmNlKCksXG4gICAgc3ViamVjdF9tYXRoOiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJUb3BpY3NNYXRoKCksXG4gICAgc3ViamVjdF9oaXN0b3J5OiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJUb3BpY3NIaXN0b3J5KCksXG4gICAgc3ViamVjdF9sYTogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyVG9waWNzTGEoKSxcbiAgICBzdWJqZWN0X2FydDogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyVG9waWNzQXJ0KCksXG4gICAgJ3N1YmplY3RfY3Mtb25seSc6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlclRvcGljc0NzT25seSgpLFxuICAgIHN0dWRlbnRfZXhwZXJpZW5jZV9iZWdpbm5lcjogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyU3R1ZGVudEV4cGVyaWVuY2VCZWdpbm5lcigpLFxuICAgIHN0dWRlbnRfZXhwZXJpZW5jZV9jb21mb3J0YWJsZTogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyU3R1ZGVudEV4cGVyaWVuY2VDb21mb3J0YWJsZSgpLFxuICAgICdhY3Rpdml0eV90eXBlX29ubGluZS10dXRvcmlhbCc6IF9sb2NhbGVbXCJkZWZhdWx0XCJdLmZpbHRlckFjdGl2aXR5VHlwZU9ubGluZVR1dG9yaWFsKCksXG4gICAgJ2FjdGl2aXR5X3R5cGVfbGVzc29uLXBsYW4nOiBfbG9jYWxlW1wiZGVmYXVsdFwiXS5maWx0ZXJBY3Rpdml0eVR5cGVMZXNzb25QbGFuKCksXG4gICAgYWN0aXZpdHlfdHlwZV9yb2JvdGljczogX2xvY2FsZVtcImRlZmF1bHRcIl0uZmlsdGVyQWN0aXZpdHlUeXBlUm9ib3RpY3MoKVxuICB9O1xuICByZXR1cm4gdGFnU3RyaW5nLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uICh0YWcpIHtcbiAgICByZXR1cm4gdGFnVG9TdHJpbmdbXCJcIi5jb25jYXQocHJlZml4LCBcIl9cIikuY29uY2F0KHRhZyldO1xuICB9KS5maWx0ZXIoZnVuY3Rpb24gKHN0cikge1xuICAgIHJldHVybiAhIXN0cjtcbiAgfSkuam9pbignLCAnKTtcbn1cbi8qKlxuICogR2l2ZW4gYSB0dXRvcmlhbCBpdGVtLCByZXR1cm4gdGhlIHN0cmluZyB0byByZW5kZXIgZm9yIGl0cyBkZXRhaWxzLlxuICogQHBhcmFtIHtvYmplY3R9IGl0ZW0gLSBBIHR1dG9yaWFsIGl0ZW0uXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gVGhlIGRldGFpbCBzdHJpbmcsIGUuZy4gXCJHcmFkZSA0IHwgQysrIHwgV2ViXCIgb3IgXCJHcmFkZSA0IHwgQysrXCIuXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUdXRvcmlhbERldGFpbFN0cmluZyhpdGVtKSB7XG4gIHZhciBncmFkZXMgPSBpdGVtLnN0cmluZ19kZXRhaWxfZ3JhZGVzO1xuICB2YXIgcHJvZ3JhbW1pbmdfbGFuZ3VhZ2VzID0gaXRlbS5zdHJpbmdfZGV0YWlsX3Byb2dyYW1taW5nX2xhbmd1YWdlcztcbiAgdmFyIHBsYXRmb3JtcyA9IGl0ZW0uc3RyaW5nX2RldGFpbF9wbGF0Zm9ybXM7XG4gIHZhciByZXN1bHQgPSBcIlwiLmNvbmNhdChncmFkZXMsIFwiIHwgXCIpLmNvbmNhdChwcm9ncmFtbWluZ19sYW5ndWFnZXMpO1xuXG4gIGlmIChwbGF0Zm9ybXMpIHtcbiAgICByZXN1bHQgPSByZXN1bHQgKyBcIiB8IFwiLmNvbmNhdChwbGF0Zm9ybXMpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIGl0IGRldGVjdHMgdGhhdCBpdCdzIHJ1bm5pbmcgb24gYSBtb2JpbGUgZGV2aWNlLlxuICovXG5cblxuZnVuY3Rpb24gbW9iaWxlQ2hlY2soKSB7XG4gIC8vIEFkYXB0ZWQgZnJvbSBodHRwOi8vZGV0ZWN0bW9iaWxlYnJvd3NlcnMuY29tLyB3aXRoIHRoZSBhZGRpdGlvbiBvZiB8YW5kcm9pZHxpcGFkfHBsYXlib29rfHNpbGsgYXNcbiAgLy8gaXQgc3VnZ2VzdHMgYXQgaHR0cDovL2RldGVjdG1vYmlsZWJyb3dzZXJzLmNvbS9hYm91dFxuICAvLyBOb3RlIHRoYXQgdGhlcmUgYXJlIHR3byByZWd1bGFyIGV4cHJlc3Npb25zIGluIHRoZSBibG9iLiAgVGhlIGZpcnN0IHRlc3RzIGFnYWluc3QgdmFyaWFibGUgYSAodGhlIGVudGlyZVxuICAvLyB1c2VyIGFnZW50KSB3aGlsZSB0aGUgc2Vjb25kIHRlc3RzIGFnYWluc3QganVzdCB0aGUgZmlyc3QgZm91ciBjaGFyYWN0ZXJzIGluIGl0LlxuICB2YXIgY2hlY2sgPSBmYWxzZTtcblxuICAoZnVuY3Rpb24gKGEpIHtcbiAgICBpZiAoLyhhbmRyb2lkfGJiXFxkK3xtZWVnbykuK21vYmlsZXxhdmFudGdvfGJhZGFcXC98YmxhY2tiZXJyeXxibGF6ZXJ8Y29tcGFsfGVsYWluZXxmZW5uZWN8aGlwdG9wfGllbW9iaWxlfGlwKGhvbmV8b2QpfGlyaXN8a2luZGxlfGxnZSB8bWFlbW98bWlkcHxtbXB8bW9iaWxlLitmaXJlZm94fG5ldGZyb250fG9wZXJhIG0ob2J8aW4paXxwYWxtKCBvcyk/fHBob25lfHAoaXhpfHJlKVxcL3xwbHVja2VyfHBvY2tldHxwc3B8c2VyaWVzKDR8NikwfHN5bWJpYW58dHJlb3x1cFxcLihicm93c2VyfGxpbmspfHZvZGFmb25lfHdhcHx3aW5kb3dzIChjZXxwaG9uZSl8eGRhfHhpaW5vfGFuZHJvaWR8aXBhZHxwbGF5Ym9va3xzaWxrL2kudGVzdChhKSB8fCAvMTIwN3w2MzEwfDY1OTB8M2dzb3w0dGhwfDUwWzEtNl1pfDc3MHN8ODAyc3xhIHdhfGFiYWN8YWMoZXJ8b298c1xcLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXxcXC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YndcXC0obnx1KXxjNTVcXC98Y2FwaXxjY3dhfGNkbVxcLXxjZWxsfGNodG18Y2xkY3xjbWRcXC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGNcXC1zfGRldml8ZGljYXxkbW9ifGRvKGN8cClvfGRzKDEyfFxcLWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseShcXC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2ZcXC01fGdcXC1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkXFwtKG18cHx0KXxoZWlcXC18aGkocHR8dGEpfGhwKCBpfGlwKXxoc1xcLWN8aHQoYyhcXC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpXFwtKDIwfGdvfG1hKXxpMjMwfGlhYyggfFxcLXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djXFwtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fFxcLVthLXddKXxsaWJ3fGx5bnh8bTFcXC13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bVxcLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KFxcLXwgfG98dil8enopfG10KDUwfHAxfHYgKXxtd2JwfG15d2F8bjEwWzAtMl18bjIwWzItM118bjMwKDB8Mil8bjUwKDB8Mnw1KXxuNygwKDB8MSl8MTApfG5lKChjfG0pXFwtfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3xcXC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG5cXC0yfHBvKGNrfHJ0fHNlKXxwcm94fHBzaW98cHRcXC1nfHFhXFwtYXxxYygwN3wxMnwyMXwzMnw2MHxcXC1bMi03XXxpXFwtKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aFxcLXxvb3xwXFwtKXxzZGtcXC98c2UoYyhcXC18MHwxKXw0N3xtY3xuZHxyaSl8c2doXFwtfHNoYXJ8c2llKFxcLXxtKXxza1xcLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aFxcLXx2XFwtfHYgKXxzeSgwMXxtYil8dDIoMTh8NTApfHQ2KDAwfDEwfDE4KXx0YShndHxsayl8dGNsXFwtfHRkZ1xcLXx0ZWwoaXxtKXx0aW1cXC18dFxcLW1vfHRvKHBsfHNoKXx0cyg3MHxtXFwtfG0zfG01KXx0eFxcLTl8dXAoXFwuYnxnMXxzaSl8dXRzdHx2NDAwfHY3NTB8dmVyaXx2aShyZ3x0ZSl8dmsoNDB8NVswLTNdfFxcLXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoXFwtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzXFwtfHlvdXJ8emV0b3x6dGVcXC0vaS50ZXN0KGEuc3Vic3RyKDAsIDQpKSkge1xuICAgICAgY2hlY2sgPSB0cnVlO1xuICAgIH1cbiAgfSkobmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8IHdpbmRvdy5vcGVyYSk7XG5cbiAgcmV0dXJuIGNoZWNrO1xufSIsIi8qIGVzbGludC1kaXNhYmxlICovXG4vLyBhcHBzL3NyYy91dGlsL2NvbG9yLmpzXG4vLyBHRU5FUkFURUQgRklMRTogRE8gTk9UIE1PRElGWSBESVJFQ1RMWVxuLy8gVGhpcyBnZW5lcmF0ZWQgZmlsZSBleHBvcnRzIGFsbCB2YXJpYWJsZXMgZGVmaW5lZCBpbiBzaGFyZWQvY3NzL2NvbG9yLnNjc3Ncbi8vIGZvciB1c2UgaW4gSmF2YVNjcmlwdC4gVGhlIGdlbmVyYXRvciBzY3JpcHQgaXMgY29udmVydC1zY3NzLXZhcmlhYmxlcy5qc1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYmxhY2tcIjogXCIjMDAwXCIsXG4gIFwiZGFya2VzdF9ncmF5XCI6IFwiIzI3MjgyMlwiLFxuICBcImRhcmtfc2xhdGVfZ3JheVwiOiBcIiMyODJjMzRcIixcbiAgXCJkYXJrX2NoYXJjb2FsXCI6IFwiIzRkNTc1ZlwiLFxuICBcImNoYXJjb2FsXCI6IFwiIzViNjc3MFwiLFxuICBcImxpZ2h0X2dyYXlcIjogXCIjOTQ5Y2EyXCIsXG4gIFwibGlnaHRlcl9ncmF5XCI6IFwiI2M2Y2FjZFwiLFxuICBcImxpZ2h0ZXN0X2dyYXlcIjogXCIjZTdlOGVhXCIsXG4gIFwiYmFja2dyb3VuZF9ncmF5XCI6IFwiI2YyZjJmMlwiLFxuICBcImRpbWdyYXlcIjogXCIjNjk2OTY5XCIsXG4gIFwid2hpdGVcIjogXCIjZmZmXCIsXG4gIFwiZGVmYXVsdF9ibHVlXCI6IFwiIzM2NzBiM1wiLFxuICBcImRhcmtfdGVhbFwiOiBcIiMwMDk0YTNcIixcbiAgXCJ0ZWFsXCI6IFwiIzAwYWRiY1wiLFxuICBcImFwcGxhYl9idXR0b25fdGVhbFwiOiBcIiMxYWJjOWNcIixcbiAgXCJsaWdodF90ZWFsXCI6IFwiIzU5Y2FkM1wiLFxuICBcImxpZ2h0aXNoX3RlYWxcIjogXCIjODBkNmRlXCIsXG4gIFwibGlnaHRlcl90ZWFsXCI6IFwiI2E2ZTNlOFwiLFxuICBcImxpZ2h0ZXN0X3RlYWxcIjogXCIjZDlmM2Y1XCIsXG4gIFwicHVycGxlXCI6IFwiIzc2NjVhMFwiLFxuICBcImxpZ2h0X3B1cnBsZVwiOiBcIiNhNjliYzFcIixcbiAgXCJsaWdodGVyX3B1cnBsZVwiOiBcIiNjZmM5ZGVcIixcbiAgXCJsaWdodGVzdF9wdXJwbGVcIjogXCIjZWJlOGYxXCIsXG4gIFwiY3lhblwiOiBcIiMwMDk0Y2FcIixcbiAgXCJsaWdodF9jeWFuXCI6IFwiIzU5YjlkY1wiLFxuICBcImxpZ2h0ZXJfY3lhblwiOiBcIiNhNmRhZWRcIixcbiAgXCJsaWdodGVzdF9jeWFuXCI6IFwiI2Q5ZWZmN1wiLFxuICBcImFsbW9zdF93aGl0ZV9jeWFuXCI6IFwiI2Y1ZmNmZlwiLFxuICBcIm9yYW5nZVwiOiBcIiNmZmE0MDBcIixcbiAgXCJsaWdodF9vcmFuZ2VcIjogXCIjZmZjNDU5XCIsXG4gIFwibGlnaHRlcl9vcmFuZ2VcIjogXCIjZmZlMGE2XCIsXG4gIFwibGlnaHRlc3Rfb3JhbmdlXCI6IFwiI2ZmZjJkOVwiLFxuICBcImRhcmtfb3JhbmdlXCI6IFwiI2ZmODYwMFwiLFxuICBcImdyZWVuXCI6IFwiI2I5YmYxNVwiLFxuICBcImxpZ2h0X2dyZWVuXCI6IFwiI2QxZDU2N1wiLFxuICBcImxpZ2h0ZXJfZ3JlZW5cIjogXCIjZTdlOWFkXCIsXG4gIFwibGlnaHRlc3RfZ3JlZW5cIjogXCIjZjVmNWRjXCIsXG4gIFwiaGlnaGxpZ2h0X2dyZWVuXCI6IFwiIzhhZmM5YlwiLFxuICBcInllbGxvd1wiOiBcIiNmZmI4MWRcIixcbiAgXCJsaWdodF95ZWxsb3dcIjogXCIjZmZkYjc0XCIsXG4gIFwibGlnaHRlcl95ZWxsb3dcIjogXCIjZmZlYmI1XCIsXG4gIFwibGlnaHRlc3RfeWVsbG93XCI6IFwiI2ZmZjdkZlwiLFxuICBcImdvbGRlbnJvZFwiOiBcIiNkYWE1MjBcIixcbiAgXCJoZWFkZXJfdGV4dFwiOiBcIiNmZmZcIixcbiAgXCJia2duZF9jb2xvclwiOiBcIiMwMGFkYmNcIixcbiAgXCJpbnNldF9jb2xvclwiOiBcIiNjNmNhY2RcIixcbiAgXCJkYXJrX2NvbG9yXCI6IFwiIzc2NjVhMFwiLFxuICBcImhkcl9jb2xvclwiOiBcIiM3NjY1YTBcIixcbiAgXCJyZWRcIjogXCIjYzAwXCIsXG4gIFwibGlnaHRlc3RfcmVkXCI6IFwiI2ZjY1wiLFxuICBcImRhcmtfcmVkXCI6IFwiI2Q2MjkxMVwiLFxuICBcInJlYWxncmVlblwiOiBcIiMwMDgwMDBcIixcbiAgXCJyZWFseWVsbG93XCI6IFwiI2ZmMFwiLFxuICBcIm11c3RhcmR5ZWxsb3dcIjogXCIjZWZjZDFjXCIsXG4gIFwidHdpdHRlcl9ibHVlXCI6IFwiIzAwYWNlZFwiLFxuICBcImZhY2Vib29rX2JsdWVcIjogXCIjM2I1OTk4XCIsXG4gIFwiZ29vZ2xlX3JlZFwiOiBcIiNhNTIwMWFcIixcbiAgXCJtaWNyb3NvZnRfYmx1ZVwiOiBcIiMyYTVjYjJcIixcbiAgXCJkYXJrX2JsdWVcIjogXCIjMDA2NDdmXCIsXG4gIFwiYmxvY2tseV9mbHlvdXRfZ3JheVwiOiBcIiNkZGRcIixcbiAgXCJkZWZhdWx0X3RleHRcIjogXCIjMzMzXCIsXG4gIFwiYm9yZGVyX2dyYXlcIjogXCIjYmJiXCIsXG4gIFwiYm9yZGVyX2xpZ2h0X2dyYXlcIjogXCIjZDhkOGQ4XCIsXG4gIFwidGFibGVfaGVhZGVyXCI6IFwiI2VjZWNlY1wiLFxuICBcInRhYmxlX2xpZ2h0X3Jvd1wiOiBcIiNmY2ZjZmNcIixcbiAgXCJ0YWJsZV9kYXJrX3Jvd1wiOiBcIiNmNGY0ZjRcIixcbiAgXCJsZXZlbF9zdWJtaXR0ZWRcIjogXCIjNzY2NWEwXCIsXG4gIFwibGV2ZWxfcGVyZmVjdFwiOiBcInJnYigxNCwgMTkwLCAxNClcIixcbiAgXCJsZXZlbF9wYXNzZWRcIjogXCJyZ2IoMTU5LCAyMTIsIDE1OSlcIixcbiAgXCJsZXZlbF9hdHRlbXB0ZWRcIjogXCIjZmYwXCIsXG4gIFwibGV2ZWxfbm90X3RyaWVkXCI6IFwiI2ZlZmVmZVwiLFxuICBcImxldmVsX2N1cnJlbnRcIjogXCIjZmZhNDAwXCIsXG4gIFwibGV2ZWxfcmV2aWV3X3JlamVjdGVkXCI6IFwiI2MwMFwiLFxuICBcImxldmVsX3Jldmlld19hY2NlcHRlZFwiOiBcInJnYigxMSwgMTQyLCAxMSlcIixcbiAgXCJhc3Nlc3NtZW50XCI6IFwiIzAwOTRjYVwiLFxuICBcIndvcmtzcGFjZV9ydW5uaW5nX2JhY2tncm91bmRcIjogXCIjZTVlNWU1XCIsXG4gIFwibGlua19jb2xvclwiOiBcIiMwNTk2Q0VcIixcbiAgXCJzaGFkb3dcIjogXCJyZ2JhKDAsIDAsIDAsIDAuMylcIixcbiAgXCJib290c3RyYXBfYnV0dG9uX2JsdWVcIjogXCIjMzM3YWI3XCIsXG4gIFwiYm9vdHN0cmFwX2J1dHRvbl9yZWRcIjogXCIjZDk1MzRmXCIsXG4gIFwiYm9vdHN0cmFwX2Vycm9yX2JhY2tncm91bmRcIjogXCIjZjJkZWRlXCIsXG4gIFwiYm9vdHN0cmFwX2Vycm9yX3RleHRcIjogXCIjYjk0YTQ4XCIsXG4gIFwiYm9vdHN0cmFwX2Vycm9yX2JvcmRlclwiOiBcIiNlYmNjZDFcIixcbiAgXCJib290c3RyYXBfd2FybmluZ19iYWNrZ3JvdW5kXCI6IFwiI2ZjZjhlM1wiLFxuICBcImJvb3RzdHJhcF93YXJuaW5nX3RleHRcIjogXCIjYzA5ODUzXCIsXG4gIFwiYm9vdHN0cmFwX3dhcm5pbmdfYm9yZGVyXCI6IFwiI2ZhZWJjY1wiLFxuICBcImJvb3RzdHJhcF9ib3JkZXJfY29sb3JcIjogXCIjY2NjY2NjXCIsXG4gIFwiYm9vdHN0cmFwX3N1Y2Nlc3NfYmFja2dyb3VuZFwiOiBcIiNkZmYwZDhcIixcbiAgXCJib290c3RyYXBfc3VjY2Vzc190ZXh0XCI6IFwiIzQ2ODg0N1wiLFxuICBcImJvb3RzdHJhcF9zdWNjZXNzX2JvcmRlclwiOiBcIiNkNmU5YzZcIixcbiAgXCJkcm9wbGV0X2xpZ2h0X2dyZWVuXCI6IFwiI2QzZTk2NVwiLFxuICBcImRyb3BsZXRfYmx1ZVwiOiBcIiM2NGI1ZjZcIixcbiAgXCJkcm9wbGV0X2JyaWdodF9ibHVlXCI6IFwiIzE5YzNlMVwiLFxuICBcImRyb3BsZXRfeWVsbG93XCI6IFwiI2ZmZjE3NlwiLFxuICBcImRyb3BsZXRfb3JhbmdlXCI6IFwiI2ZmYjc0ZFwiLFxuICBcImRyb3BsZXRfcmVkXCI6IFwiI2Y3ODE4M1wiLFxuICBcImRyb3BsZXRfY3lhblwiOiBcIiM0ZGQwZTFcIixcbiAgXCJkcm9wbGV0X3BpbmtcIjogXCIjZjU3YWM2XCIsXG4gIFwiZHJvcGxldF9wdXJwbGVcIjogXCIjYmI3N2M3XCIsXG4gIFwiZHJvcGxldF9ncmVlblwiOiBcIiM2OGQ5OTVcIixcbiAgXCJkcm9wbGV0X3doaXRlXCI6IFwiI2ZmZlwiLFxuICBcIm9jZWFuc19kZWVwX2JsdWVcIjogXCJyZ2IoMiwgMCwgMjgpXCJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbHNcIik7XG5cbnZhciBfanNDb29raWUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJqcy1jb29raWVcIikpO1xuXG52YXIgX3RyYWNrRXZlbnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3RyYWNrRXZlbnRcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBUaGlzIG1vZHVsZSBjb250YWlucyBsb2dpYyBmb3IgdHJhY2tpbmcgdmFyaW91cyBleHBlcmltZW50cy4gRXhwZXJpbWVudHNcbiAqIGNhbiBiZSBlbmFibGVkL2Rpc2FibGVkIHVzaW5nIHF1ZXJ5IHBhcmFtZXRlcnM6XG4gKiAgIGVuYWJsZTogIGh0dHA6Ly9mb28uY29tLz9lbmFibGVFeHBlcmltZW50cz1leHBlcmltZW50T25lLGV4cGVyaW1lbnRUd29cbiAqICAgZGlzYWJsZTogaHR0cDovL2Zvby5jb20vP2Rpc2FibGVFeHBlcmltZW50cz1leHBlcmltZW50T25lLGV4cGVyaW1lbnRUd29cbiAqIEV4cGVyaW1lbnQgc3RhdGUgaXMgcGVyc2lzdGVkIGFjcm9zcyBwYWdlIGxvYWRzIHVzaW5nIGxvY2FsIHN0b3JhZ2UuICBOb3RlXG4gKiB0aGF0IGl0J3Mgb25seSB3cml0dGVuIHdoZW4gaXNFbmFibGVkIGlzIGNhbGxlZCBmb3IgdGhlIGtleSBpbiBxdWVzdGlvbi5cbiAqL1xudmFyIHF1ZXJ5U3RyaW5nID0gcmVxdWlyZSgncXVlcnktc3RyaW5nJyk7XG5cbnZhciBleHBlcmltZW50cyA9IG1vZHVsZS5leHBvcnRzO1xudmFyIFNUT1JBR0VfS0VZID0gJ2V4cGVyaW1lbnRzTGlzdCc7XG52YXIgR0FfRVZFTlQgPSAnZXhwZXJpbWVudHMnO1xudmFyIEVYUEVSSU1FTlRfTElGRVNQQU5fSE9VUlMgPSAxMjsgLy8gU3BlY2lmaWMgZXhwZXJpbWVudCBuYW1lc1xuXG5leHBlcmltZW50cy5SRURVWF9MT0dHSU5HID0gJ3JlZHV4TG9nZ2luZyc7XG5leHBlcmltZW50cy5TQ0hPT0xfQVVUT0NPTVBMRVRFX0RST1BET1dOX05FV19TRUFSQ0ggPSAnc2Nob29sQXV0b2NvbXBsZXRlRHJvcGRvd25OZXdTZWFyY2gnO1xuZXhwZXJpbWVudHMuU0hPV19VTlBVQkxJU0hFRF9GSVJFQkFTRV9UQUJMRVMgPSAnc2hvd1VucHVibGlzaGVkRmlyZWJhc2VUYWJsZXMnO1xuZXhwZXJpbWVudHMuTUlDUk9CSVQgPSAnbWljcm9iaXQnO1xuZXhwZXJpbWVudHMuVEVBQ0hFUl9EQVNIQk9BUkRfU0VDVElPTl9CVVRUT05TID0gJ3RlYWNoZXItZGFzaGJvYXJkLXNlY3Rpb24tYnV0dG9ucyc7XG5leHBlcmltZW50cy5URUFDSEVSX0RBU0hCT0FSRF9TRUNUSU9OX0JVVFRPTlNfQUxURVJOQVRFX1RFWFQgPSAndGVhY2hlci1kYXNoYm9hcmQtc2VjdGlvbi1idXR0b25zLWFsdGVybmF0ZS10ZXh0JztcbmV4cGVyaW1lbnRzLkZJTklTSF9ESUFMT0dfTUVUUklDUyA9ICdmaW5pc2gtZGlhbG9nLW1ldHJpY3MnO1xuZXhwZXJpbWVudHMuSTE4Tl9UUkFDS0lORyA9ICdpMThuLXRyYWNraW5nJztcbmV4cGVyaW1lbnRzLlRJTUVfU1BFTlQgPSAndGltZS1zcGVudCc7XG5leHBlcmltZW50cy5CWVBBU1NfRElBTE9HX1BPUFVQID0gJ2J5cGFzcy1kaWFsb2ctcG9wdXAnO1xuZXhwZXJpbWVudHMuU1BFQ0lBTF9UT1BJQyA9ICdzcGVjaWFsLXRvcGljJztcbmV4cGVyaW1lbnRzLkNMRUFSRVJfU0lHTl9VUF9VU0VSX1RZUEUgPSAnY2xlYXJlclNpZ25VcFVzZXJUeXBlJztcbmV4cGVyaW1lbnRzLk9QVF9JTl9FTUFJTF9SRUdfUEFSVE5FUiA9ICdvcHRJbkVtYWlsUmVnUGFydG5lcic7XG5leHBlcmltZW50cy5DT0RFX1JFVklFV19HUk9VUFMgPSAnY29kZVJldmlld0dyb3Vwcyc7XG5leHBlcmltZW50cy5KQVZBTEFCX1VOSVRfVEVTVFMgPSAnamF2YWxhYlVuaXRUZXN0cyc7XG4vKipcbiAqIFRoaXMgd2FzIGEgZ2FtaWZpZWQgdmVyc2lvbiBvZiB0aGUgZmluaXNoIGRpYWxvZywgYnVpbHQgaW4gMjAxOCxcbiAqIGJ1dCBuZXZlciBmdWxseSBzaGlwcGVkLlxuICogU2VlIGdpdGh1Yi5jb20vY29kZS1kb3Qtb3JnL2NvZGUtZG90LW9yZy9wdWxsLzE5NTU3XG4gKi9cblxuZXhwZXJpbWVudHMuQlVCQkxFX0RJQUxPRyA9ICdidWJibGVEaWFsb2cnO1xuLyoqXG4gKiBHZXQgb3VyIHF1ZXJ5IHN0cmluZy4gUHJvdmlkZWQgYXMgYSBtZXRob2Qgc28gdGhhdCB0ZXN0cyBjYW4gbW9jayB0aGlzLlxuICovXG5cbmV4cGVyaW1lbnRzLmdldFF1ZXJ5U3RyaW5nXyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG59O1xuXG5leHBlcmltZW50cy5nZXRTdG9yZWRFeHBlcmltZW50c18gPSBmdW5jdGlvbiAoKSB7XG4gIC8vIEdldCBleHBlcmltZW50cyBvbiBjdXJyZW50IHVzZXIgZnJvbSBleHBlcmltZW50cyBjb29raWVcbiAgdmFyIGV4cGVyaW1lbnRzQ29va2llID0gX2pzQ29va2llW1wiZGVmYXVsdFwiXS5nZXQoJ19leHBlcmltZW50cycgKyB3aW5kb3cuY29va2llRW52U3VmZml4KTtcblxuICB2YXIgdXNlckV4cGVyaW1lbnRzID0gZXhwZXJpbWVudHNDb29raWUgPyBKU09OLnBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChleHBlcmltZW50c0Nvb2tpZSkpLm1hcChmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB7XG4gICAgICBrZXk6IG5hbWVcbiAgICB9O1xuICB9KSA6IFtdOyAvLyBHZXQgZXhwZXJpbWVudHMgc3RvcmVkIGluIGxvY2FsIHN0b3JhZ2UuXG5cbiAgdHJ5IHtcbiAgICB2YXIganNvbkxpc3QgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSk7XG4gICAgdmFyIHN0b3JlZEV4cGVyaW1lbnRzID0ganNvbkxpc3QgPyBKU09OLnBhcnNlKGpzb25MaXN0KSA6IFtdO1xuICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgIHZhciBlbmFibGVkRXhwZXJpbWVudHMgPSBzdG9yZWRFeHBlcmltZW50cy5maWx0ZXIoZnVuY3Rpb24gKGV4cGVyaW1lbnQpIHtcbiAgICAgIHJldHVybiBleHBlcmltZW50LmtleSAmJiAoZXhwZXJpbWVudC5leHBpcmF0aW9uID09PSB1bmRlZmluZWQgfHwgZXhwZXJpbWVudC5leHBpcmF0aW9uID4gbm93KTtcbiAgICB9KTtcblxuICAgIGlmIChlbmFibGVkRXhwZXJpbWVudHMubGVuZ3RoIDwgc3RvcmVkRXhwZXJpbWVudHMubGVuZ3RoKSB7XG4gICAgICAoMCwgX3V0aWxzLnRyeVNldExvY2FsU3RvcmFnZSkoU1RPUkFHRV9LRVksIEpTT04uc3RyaW5naWZ5KGVuYWJsZWRFeHBlcmltZW50cykpO1xuICAgIH1cblxuICAgIHJldHVybiB1c2VyRXhwZXJpbWVudHMuY29uY2F0KGVuYWJsZWRFeHBlcmltZW50cyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdXNlckV4cGVyaW1lbnRzO1xuICB9XG59O1xuXG5leHBlcmltZW50cy5nZXRFbmFibGVkRXhwZXJpbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdldFN0b3JlZEV4cGVyaW1lbnRzXygpLm1hcChmdW5jdGlvbiAoZXhwZXJpbWVudCkge1xuICAgIHJldHVybiBleHBlcmltZW50LmtleTtcbiAgfSk7XG59O1xuXG5leHBlcmltZW50cy5zZXRFbmFibGVkID0gZnVuY3Rpb24gKGtleSwgc2hvdWxkRW5hYmxlKSB7XG4gIHZhciBleHBpcmF0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG4gIHZhciBhbGxFbmFibGVkID0gdGhpcy5nZXRTdG9yZWRFeHBlcmltZW50c18oKTtcbiAgdmFyIGV4cGVyaW1lbnRJbmRleCA9IGFsbEVuYWJsZWQuZmluZEluZGV4KGZ1bmN0aW9uIChleHBlcmltZW50KSB7XG4gICAgcmV0dXJuIGV4cGVyaW1lbnQua2V5ID09PSBrZXk7XG4gIH0pO1xuXG4gIGlmIChzaG91bGRFbmFibGUpIHtcbiAgICBpZiAoZXhwZXJpbWVudEluZGV4IDwgMCkge1xuICAgICAgYWxsRW5hYmxlZC5wdXNoKHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGV4cGlyYXRpb246IGV4cGlyYXRpb25cbiAgICAgIH0pO1xuICAgICAgKDAsIF90cmFja0V2ZW50W1wiZGVmYXVsdFwiXSkoR0FfRVZFTlQsICdlbmFibGUnLCBrZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbGxFbmFibGVkW2V4cGVyaW1lbnRJbmRleF0uZXhwaXJhdGlvbiA9IGV4cGlyYXRpb247XG4gICAgfVxuICB9IGVsc2UgaWYgKGV4cGVyaW1lbnRJbmRleCA+PSAwKSB7XG4gICAgYWxsRW5hYmxlZC5zcGxpY2UoZXhwZXJpbWVudEluZGV4LCAxKTtcbiAgICAoMCwgX3RyYWNrRXZlbnRbXCJkZWZhdWx0XCJdKShHQV9FVkVOVCwgJ2Rpc2FibGUnLCBrZXkpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybjtcbiAgfVxuXG4gICgwLCBfdXRpbHMudHJ5U2V0TG9jYWxTdG9yYWdlKShTVE9SQUdFX0tFWSwgSlNPTi5zdHJpbmdpZnkoYWxsRW5hYmxlZCkpO1xufTtcbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgcHJvdmlkZWQgZXhwZXJpbWVudCBpcyBlbmFibGVkIG9yIG5vdFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIE5hbWUgb2YgZXhwZXJpbWVudCBpbiBxdWVzdGlvblxuICogQHJldHVybnMge2Jvb2x9XG4gKi9cblxuXG5leHBlcmltZW50cy5pc0VuYWJsZWQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHZhciBzdG9yZWRFeHBlcmltZW50cyA9IHRoaXMuZ2V0U3RvcmVkRXhwZXJpbWVudHNfKCk7XG4gIHZhciBlbmFibGVkID0gc3RvcmVkRXhwZXJpbWVudHMuc29tZShmdW5jdGlvbiAoZXhwZXJpbWVudCkge1xuICAgIHJldHVybiBleHBlcmltZW50LmtleSA9PT0ga2V5O1xuICB9KSB8fCAhISh3aW5kb3cuYXBwT3B0aW9ucyAmJiB3aW5kb3cuYXBwT3B0aW9ucy5leHBlcmltZW50cyAmJiB3aW5kb3cuYXBwT3B0aW9ucy5leHBlcmltZW50cy5pbmNsdWRlcyhrZXkpKTtcbiAgdmFyIHF1ZXJ5ID0gcXVlcnlTdHJpbmcucGFyc2UodGhpcy5nZXRRdWVyeVN0cmluZ18oKSk7XG4gIHZhciBlbmFibGVRdWVyeSA9IHF1ZXJ5WydlbmFibGVFeHBlcmltZW50cyddO1xuICB2YXIgZGlzYWJsZVF1ZXJ5ID0gcXVlcnlbJ2Rpc2FibGVFeHBlcmltZW50cyddO1xuICB2YXIgdGVtcEVuYWJsZVF1ZXJ5ID0gcXVlcnlbJ3RlbXBFbmFibGVFeHBlcmltZW50cyddO1xuXG4gIGlmIChlbmFibGVRdWVyeSkge1xuICAgIHZhciBleHBlcmltZW50c1RvRW5hYmxlID0gZW5hYmxlUXVlcnkuc3BsaXQoJywnKTtcblxuICAgIGlmIChleHBlcmltZW50c1RvRW5hYmxlLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICBlbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuc2V0RW5hYmxlZChrZXksIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChkaXNhYmxlUXVlcnkpIHtcbiAgICB2YXIgZXhwZXJpbWVudHNUb0Rpc2FibGUgPSBkaXNhYmxlUXVlcnkuc3BsaXQoJywnKTtcblxuICAgIGlmIChleHBlcmltZW50c1RvRGlzYWJsZS5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5zZXRFbmFibGVkKGtleSwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0ZW1wRW5hYmxlUXVlcnkpIHtcbiAgICB2YXIgZXhwaXJhdGlvbkRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGV4cGlyYXRpb25EYXRlLnNldEhvdXJzKGV4cGlyYXRpb25EYXRlLmdldEhvdXJzKCkgKyBFWFBFUklNRU5UX0xJRkVTUEFOX0hPVVJTKTtcbiAgICB2YXIgZXhwaXJhdGlvbiA9IGV4cGlyYXRpb25EYXRlLmdldFRpbWUoKTtcblxuICAgIHZhciBfZXhwZXJpbWVudHNUb0VuYWJsZSA9IHRlbXBFbmFibGVRdWVyeS5zcGxpdCgnLCcpO1xuXG4gICAgaWYgKF9leHBlcmltZW50c1RvRW5hYmxlLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICBlbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuc2V0RW5hYmxlZChrZXksIHRydWUsIGV4cGlyYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbmFibGVkO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbG9jYWxlV2l0aEkxOG5TdHJpbmdUcmFja2VyO1xuXG52YXIgX2V4cGVyaW1lbnRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGNkby9hcHBzL3V0aWwvZXhwZXJpbWVudHNcIikpO1xuXG52YXIgX2kxOG5TdHJpbmdUcmFja2VyV29ya2VyID0gcmVxdWlyZShcIkBjZG8vYXBwcy91dGlsL2kxOG5TdHJpbmdUcmFja2VyV29ya2VyXCIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gbG9jYWxlV2l0aEkxOG5TdHJpbmdUcmFja2VyKGxvY2FsZSwgc291cmNlKSB7XG4gIGlmICghX2V4cGVyaW1lbnRzW1wiZGVmYXVsdFwiXS5pc0VuYWJsZWQoX2V4cGVyaW1lbnRzW1wiZGVmYXVsdFwiXS5JMThOX1RSQUNLSU5HKSkge1xuICAgIHJldHVybiBsb2NhbGU7XG4gIH1cblxuICB2YXIgbG9jYWxlV2l0aFRyYWNrZXIgPSB7fTsgLy8gSXRlcmF0ZXMgZWFjaCBmdW5jdGlvbiBpbiB0aGUgZ2l2ZW4gbG9jYWxlIG9iamVjdCBhbmQgY3JlYXRlcyBhIHdyYXBwZXIgZnVuY3Rpb24uXG5cbiAgT2JqZWN0LmtleXMobG9jYWxlKS5mb3JFYWNoKGZ1bmN0aW9uIChzdHJpbmdLZXksIGluZGV4KSB7XG4gICAgbG9jYWxlV2l0aFRyYWNrZXJbc3RyaW5nS2V5XSA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICB2YXIgdmFsdWUgPSBsb2NhbGVbc3RyaW5nS2V5XShkKTtcbiAgICAgIGxvZyhzdHJpbmdLZXksIHNvdXJjZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiBsb2NhbGVXaXRoVHJhY2tlcjtcbn0gLy8gUmVjb3JkcyB0aGUgdXNhZ2Ugb2YgdGhlIGdpdmVuIGkxOG4gc3RyaW5nIGtleSBmcm9tIHRoZSBnaXZlbiBzb3VyY2UgZmlsZS5cbi8vIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdLZXkgIFRoZSBzdHJpbmcga2V5IHVzZWQgdG8gbG9vayB1cCB0aGUgaTE4biB2YWx1ZSBlLmcuICdob21lLmJhbm5lcl90ZXh0J1xuLy8gQHBhcmFtIHtzdHJpbmd9IHNvdXJjZSBDb250ZXh0IGZvciB3aGVyZSB0aGUgZ2l2ZW4gc3RyaW5nIGtleSBjYW1lIGZyb20gZS5nLiAnbWF6ZScsICdkYW5jZScsIGV0Yy5cblxuXG5mdW5jdGlvbiBsb2coc3RyaW5nS2V5LCBzb3VyY2UpIHtcbiAgaWYgKCFzdHJpbmdLZXkgfHwgIXNvdXJjZSkge1xuICAgIHJldHVybjtcbiAgfSAvLyBTZW5kIHRoZSB1c2FnZSBkYXRhIHRvIGEgYmFja2dyb3VuZCB3b3JrZXIgdGhyZWFkIHRvIGJlIGJ1ZmZlcmVkIGFuZCBzZW50LlxuXG5cbiAgKDAsIF9pMThuU3RyaW5nVHJhY2tlcldvcmtlci5nZXRJMThuU3RyaW5nVHJhY2tlcldvcmtlcikoKS5sb2coc3RyaW5nS2V5LCBzb3VyY2UpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZXRJMThuU3RyaW5nVHJhY2tlcldvcmtlciA9IGdldEkxOG5TdHJpbmdUcmFja2VyV29ya2VyO1xuXG5yZXF1aXJlKFwid2hhdHdnLWZldGNoXCIpO1xuXG4vKipcbiAqIEdldHMgdGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiBhbiBJMThuU3RyaW5nVHJhY2tlcldvcmtlclxuICogQHJldHVybnMge0kxOG5TdHJpbmdUcmFja2VyV29ya2VyfVxuICovXG5mdW5jdGlvbiBnZXRJMThuU3RyaW5nVHJhY2tlcldvcmtlcigpIHtcbiAgcmV0dXJuIG5ldyBJMThuU3RyaW5nVHJhY2tlcldvcmtlcigpO1xufVxuLyoqXG4gKiBBIHNpbmdsZXRvbiBjbGFzcyB3aGljaCBidWZmZXJzIGkxOG4gc3RyaW5nIHVzYWdlIGRhdGEgYW5kIHNlbmRzIGl0IGluIGJhdGNoZXMgdG8gdGhlICcvaTE4bi90cmFja19zdHJpbmdfdXNhZ2UnIEFQSS5cbiAqL1xuXG5cbnZhciBJMThuU3RyaW5nVHJhY2tlcldvcmtlciA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEkxOG5TdHJpbmdUcmFja2VyV29ya2VyKCkge1xuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGFscmVhZHkgYSBzaW5nbGV0b24gaW5zdGFuY2UuXG4gICAgdmFyIGluc3RhbmNlID0gdGhpcy5jb25zdHJ1Y3Rvci5pbnN0YW5jZTtcblxuICAgIGlmIChpbnN0YW5jZSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH0gLy8gU2V0IHRoZSBzaW5nbGV0b24gaW5zdGFuY2UgdG8gdGhpcyBpbnN0YW5jZSBpZiBpdCBkb2Vzbid0IGV4aXN0IGFscmVhZHkuXG5cblxuICAgIHRoaXMuY29uc3RydWN0b3IuaW5zdGFuY2UgPSB0aGlzO1xuICAgIC8qKlxuICAgICAqIEEgYnVmZmVyIG9mIHJlY29yZHMgdG8gYmUgc2VudCBpbiBiYXRjaGVzLiBFYWNoIGtleSBpcyB0aGUgYHNvdXJjZWAgZmlsZSBvZiB0aGUgc3RyaW5nIGFuZCB0aGUgdmFsdWVzIGFyZSB0aGVcbiAgICAgKiBpMThuIGBzdHJpbmdLZXlgcyB1c2VkIHRvIGxvb2t1cCB0aGUgdHJhbnNsYXRlZCBzdHJpbmcuXG4gICAgICogQHR5cGVkZWYge09iamVjdC48c3RyaW5nLCBTZXQ+fSBJMThuUmVjb3Jkc1xuICAgICAqIEV4YW1wbGU6XG4gICAgICoge1xuICAgICAqICAgJ2NvbW1vbl9sb2NhbGUnOiBbICdjdXJyaWN1bHVtJywgJ3RlYWNoZXJGb3J1bScsICdwcm9mZXNzaW9uYWxMZWFybmluZycsIC4uLl0sXG4gICAgICogICAnZmlzaF9sb2NhbGUnOiAuLi5cbiAgICAgKiB9XG4gICAgICovXG5cbiAgICB0aGlzLmJ1ZmZlciA9IHt9O1xuICB9XG4gIC8qKlxuICAgKiBCdWZmZXJzIHRoZSBnaXZlbiBpMThuIHN0cmluZyB1c2FnZSBkYXRhIHRvIGJlIHNlbnQgbGF0ZXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdLZXkgVGhlIGtleSB1c2VkIHRvIGxvb2sgdXAgdGhlIGkxOG4gc3RyaW5nIHZhbHVlIGUuZy4gJ2N1cnJpY3VsdW0nXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2UgQ29udGV4dCBhYm91dCB0aGUgZmlsZSBpMThuIHZhbHVlIHdhcyBsb29rZWQgdXAgaW4gZS5nLiAnY29tbW9uX2xvY2FsZSdcbiAgICovXG5cblxuICB2YXIgX3Byb3RvID0gSTE4blN0cmluZ1RyYWNrZXJXb3JrZXIucHJvdG90eXBlO1xuXG4gIF9wcm90by5sb2cgPSBmdW5jdGlvbiBsb2coc3RyaW5nS2V5LCBzb3VyY2UpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCFzdHJpbmdLZXkgfHwgIXNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyW3NvdXJjZV0gPSB0aGlzLmJ1ZmZlcltzb3VyY2VdIHx8IG5ldyBTZXQoKTtcbiAgICB0aGlzLmJ1ZmZlcltzb3VyY2VdLmFkZChcIlwiLmNvbmNhdChzb3VyY2UsIFwiLlwiKS5jb25jYXQoc3RyaW5nS2V5KSk7IC8vIHNjaGVkdWxlIGEgYnVmZmVyIGZsdXNoIGlmIHRoZXJlIGlzbid0IGFscmVhZHkgb25lLlxuXG4gICAgaWYgKCF0aGlzLnBlbmRpbmdGbHVzaCkge1xuICAgICAgdGhpcy5wZW5kaW5nRmx1c2ggPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmZsdXNoKCk7XG4gICAgICB9LCAzMDAwKTtcbiAgICB9XG4gIH0gLy8gU2VuZHMgYWxsIHRoZSBidWZmZXJlZCByZWNvcmRzXG4gIDtcblxuICBfcHJvdG8uZmx1c2ggPSBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAvLyBEbyBub3RoaW5nIGlmIHRoZXJlIGFyZSBubyByZWNvcmRzIHRvIHJlY29yZC5cbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5idWZmZXIpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gR3JhYiB0aGUgY29udGVudHMgb2YgdGhlIGN1cnJlbnQgYnVmZmVyIGFuZCBjbGVhciB0aGUgYnVmZmVyLlxuXG5cbiAgICB2YXIgcmVjb3JkcyA9IHRoaXMuYnVmZmVyO1xuICAgIHRoaXMuYnVmZmVyID0ge307XG4gICAgdGhpcy5wZW5kaW5nRmx1c2ggPSBudWxsOyAvLyBSTkcgdG8gc2VuZCBvbmx5IDElIG9mIHRoZSB0aW1lXG5cbiAgICBpZiAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSA9PT0gMCkge1xuICAgICAgLy8gUmVjb3JkIHRoZSBpMThuIHN0cmluZyB1c2FnZSBkYXRhLlxuICAgICAgc2VuZFJlY29yZHMocmVjb3Jkcyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBJMThuU3RyaW5nVHJhY2tlcldvcmtlcjtcbn0oKTsgLy8gVGhlIG1heCBudW1iZXIgb2YgcmVjb3JkcyB3aGljaCBjYW4gYmUgc2VudCBhdCBvbmNlIHRvIHRoZSAnL2kxOG4vdHJhY2tfc3RyaW5nX3VzYWdlJyBBUElcblxuXG52YXIgUkVDT1JEX0xJTUlUID0gNTAwO1xuLyoqXG4gKiBBc3luY2hyb25vdXNseSBzZW5kIHRoZSBnaXZlbiByZWNvcmRzIHRvIHRoZSBgL2kxOG4vdHJhY2tfc3RyaW5nX3VzYWdlYCBBUElcbiAqIEBwYXJhbSB7STE4blJlY29yZHN9IHJlY29yZHMgVGhlIHJlY29yZHMgb2YgaTE4biBzdHJpbmcgdXNhZ2UgaW5mb3JtYXRpb24gdG8gYmUgc2VudC5cbiAqL1xuXG5mdW5jdGlvbiBzZW5kUmVjb3JkcyhyZWNvcmRzKSB7XG4gIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lOyAvL3N0cmlwIHRoZSBxdWVyeSBzdHJpbmcgZnJvbSB0aGUgVVJMXG5cbiAgT2JqZWN0LmtleXMocmVjb3JkcykuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgdmFyIHN0cmluZ0tleXMgPSBBcnJheS5mcm9tKHJlY29yZHNbc291cmNlXSk7IC8vIEJyZWFrIHRoZSBrZXlzIHVwIGludG8gc21hbGxlciBiYXRjaGVzIGJlY2F1c2UgdGhlIEFQSSBoYXMgYSBtYXhpbXVtIGxpbWl0LlxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJpbmdLZXlzLmxlbmd0aDsgaSArPSBSRUNPUkRfTElNSVQpIHtcbiAgICAgIHZhciBzdHJpbmdLZXlCYXRjaCA9IHN0cmluZ0tleXMuc2xpY2UoaSwgUkVDT1JEX0xJTUlUKTtcbiAgICAgIGZldGNoKCcvaTE4bi90cmFja19zdHJpbmdfdXNhZ2UnLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgc3RyaW5nX2tleXM6IHN0cmluZ0tleUJhdGNoXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX3NhZmVMb2FkTG9jYWxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGNkby9hcHBzL3V0aWwvc2FmZUxvYWRMb2NhbGVcIikpO1xuXG52YXIgX2kxOG5TdHJpbmdUcmFja2VyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGNkby9hcHBzL3V0aWwvaTE4blN0cmluZ1RyYWNrZXJcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBETyBOT1QgSU1QT1JUIFRISVMgRElSRUNUTFkuIEluc3RlYWQgZG86XG4gKiAgIGBgYFxuICogICBpbXBvcnQgbXNnIGZyb20gJ0BjZG8vbG9jYWxlJy5cbiAqICAgYGBgXG4gKiBUaGlzIGFsbG93cyB0aGUgd2VicGFjayBjb25maWcgdG8gZGV0ZXJtaW5lIGhvdyBsb2NhbGVzIHNob3VsZCBiZSBsb2FkZWQsXG4gKiB3aGljaCBpcyBpbXBvcnRhbnQgZm9yIG1ha2luZyBsb2NhbGUgc2V0dXAgd29yayBzZWVtbGVzc2x5IGluIHRlc3RzLlxuICovXG4vLyBiYXNlIGxvY2FsZVxudmFyIGxvY2FsZSA9ICgwLCBfc2FmZUxvYWRMb2NhbGVbXCJkZWZhdWx0XCJdKSgnY29tbW9uX2xvY2FsZScpO1xubG9jYWxlID0gKDAsIF9pMThuU3RyaW5nVHJhY2tlcltcImRlZmF1bHRcIl0pKGxvY2FsZSwgJ2NvbW1vbicpO1xubW9kdWxlLmV4cG9ydHMgPSBsb2NhbGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHNhZmVMb2FkTG9jYWxlO1xuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgZm9yIGxvYWRpbmcgdGhlIGxvY2FsZSBmcm9tIHRoZSBnbG9iYWwgc2NvcGUsIHdoaWNoIHdpbGwgZGV0ZWN0IGlmXG4gKiB0cmFuc2xhdGlvbnMgYXJlIG5vdCBwcmVzZW50IGluIHRoZSBlbnZpcm9ubWVudCBhbmQgZmFsbCBiYWNrIHRvIGFuIGVtcHR5IGxvY2FsZVxuICogb2JqZWN0LlxuICpcbiAqIEBwYXJhbSBsb2NhbGVLZXkge1N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIGxvY2FsZSBvbiB0aGUgZ2xvYmFsIGJsb2NrbHlcbiAqICAgICBvYmplY3QuIFVzdWFsbHkgc29tZXRoaW5nIGxpa2UgXCJjb21tb25fbG9jYWxlXCIsIFwic3R1ZGlvX2xvY2FsZVwiLFxuICogICAgIFwiYXBwbGFiX2xvY2FsZVwiLCBldGMuXG4gKi9cbmZ1bmN0aW9uIHNhZmVMb2FkTG9jYWxlKGxvY2FsZUtleSkge1xuICBpZiAod2luZG93LmxvY2FsZXMgJiYgd2luZG93LmxvY2FsZXNbbG9jYWxlS2V5XSkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxlc1tsb2NhbGVLZXldO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUud2FybignVHJhbnNsYXRpb25zIG11c3QgYmUgbG9hZGVkIGludG8gdGhlIGdsb2JhbCBzY29wZSBiZWZvcmUgYWNjZXNzLiAnICsgJ0ZhbGxpbmcgYmFjayBvbiBhbiBlbXB0eSB0cmFuc2xhdGlvbiBvYmplY3QuIFRoaXMgcGFnZSBtYXkgYnJlYWsgZHVlIHRvIG1pc3NpbmcgdHJhbnNsYXRpb25zLicpOyAvLyBSZXR1cm4gYW4gZW1wdHkgb2JqZWN0LCBzbyBpMThuIG1ldGhvZHMgdGhyb3cgd2hlcmUgdGhleSBhcmUgY2FsbGVkIGFuZFxuICAgIC8vIGdlbmVyYXRlIG1vcmUgdXNlZnVsIHN0YWNrIHRyYWNlcy5cblxuICAgIHJldHVybiB7fTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB0cmFja0V2ZW50O1xuXG4vKiBnbG9iYWwgd2luZG93ICovXG5cbi8qKlxuICogUmVwb3J0IGFuIGV2ZW50IHRvIEdvb2dsZSBBbmFseXRpY3MuXG4gKiB0cmFja0V2ZW50IGlzIHByb3ZpZGVkIGJ5IF9hbmFseXRpY3MuaHRtbC5oYW1sIGluIG1vc3QgY2FzZXMuXG4gKiBJbiB0aG9zZSB3aGVyZSBpdCBpc24ndCwgd2Ugd2FudCB0aGlzIGNhbGwgdG8gYmUgYSBzaW1wbGUgbm8tb3AuXG4gKi9cbmZ1bmN0aW9uIHRyYWNrRXZlbnQoKSB7XG4gIHZhciBfd2luZG93O1xuXG4gIGlmIChJTl9VTklUX1RFU1QgfHwgSU5fU1RPUllCT09LKSB7XG4gICAgLy8gV2Ugc2hvdWxkIHNpbGVudGx5IG5vLW9wIGluIHRlc3RzLCBidXQgaW4gb3RoZXIgcGxhY2VzIHdlIGFjdHVhbGx5XG4gICAgLy8gd2FudCB0aGlzIGNhbGwgdG8gZmFpbCBpZiB3aW5kb3cudHJhY2tFdmVudCBpcyBub3QgYXZhaWxhYmxlLlxuICAgIHJldHVybjtcbiAgfVxuXG4gIChfd2luZG93ID0gd2luZG93KS50cmFja0V2ZW50LmFwcGx5KF93aW5kb3csIGFyZ3VtZW50cyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmlzU3Vic2VxdWVuY2UgPSBpc1N1YnNlcXVlbmNlO1xuZXhwb3J0cy5zaGFsbG93Q29weSA9IHNoYWxsb3dDb3B5O1xuZXhwb3J0cy5jbG9uZVdpdGhvdXRGdW5jdGlvbnMgPSBjbG9uZVdpdGhvdXRGdW5jdGlvbnM7XG5leHBvcnRzLnF1b3RlID0gcXVvdGU7XG5leHBvcnRzLnN0cmluZ1RvQ2h1bmtzID0gc3RyaW5nVG9DaHVua3M7XG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDtcbmV4cG9ydHMuZXNjYXBlSHRtbCA9IGVzY2FwZUh0bWw7XG5leHBvcnRzLm1vZCA9IG1vZDtcbmV4cG9ydHMucmFuZ2UgPSByYW5nZTtcbmV4cG9ydHMuZXhlY3V0ZUlmQ29uZGl0aW9uYWwgPSBleGVjdXRlSWZDb25kaXRpb25hbDtcbmV4cG9ydHMuc3RyaXBRdW90ZXMgPSBzdHJpcFF1b3RlcztcbmV4cG9ydHMud3JhcE51bWJlclZhbGlkYXRvcnNGb3JMZXZlbEJ1aWxkZXIgPSB3cmFwTnVtYmVyVmFsaWRhdG9yc0ZvckxldmVsQnVpbGRlcjtcbmV4cG9ydHMucmFuZG9tVmFsdWUgPSByYW5kb21WYWx1ZTtcbmV4cG9ydHMucmFuZG9tS2V5ID0gcmFuZG9tS2V5O1xuZXhwb3J0cy5jcmVhdGVVdWlkID0gY3JlYXRlVXVpZDtcbmV4cG9ydHMuZmlyZVJlc2l6ZUV2ZW50ID0gZmlyZVJlc2l6ZUV2ZW50O1xuZXhwb3J0cy52YWx1ZU9yID0gdmFsdWVPcjtcbmV4cG9ydHMuaXNJbmZpbml0ZVJlY3Vyc2lvbkVycm9yID0gaXNJbmZpbml0ZVJlY3Vyc2lvbkVycm9yO1xuZXhwb3J0cy51bmVzY2FwZVRleHQgPSB1bmVzY2FwZVRleHQ7XG5leHBvcnRzLmVzY2FwZVRleHQgPSBlc2NhcGVUZXh0O1xuZXhwb3J0cy5zaG93R2VuZXJpY1F0aXAgPSBzaG93R2VuZXJpY1F0aXA7XG5leHBvcnRzLnNob3dVbnVzZWRCbG9ja1F0aXAgPSBzaG93VW51c2VkQmxvY2tRdGlwO1xuZXhwb3J0cy50cnlHZXRMb2NhbFN0b3JhZ2UgPSB0cnlHZXRMb2NhbFN0b3JhZ2U7XG5leHBvcnRzLnRyeVNldExvY2FsU3RvcmFnZSA9IHRyeVNldExvY2FsU3RvcmFnZTtcbmV4cG9ydHMudHJ5R2V0U2Vzc2lvblN0b3JhZ2UgPSB0cnlHZXRTZXNzaW9uU3RvcmFnZTtcbmV4cG9ydHMudHJ5U2V0U2Vzc2lvblN0b3JhZ2UgPSB0cnlTZXRTZXNzaW9uU3RvcmFnZTtcbmV4cG9ydHMubWFrZUVudW0gPSBtYWtlRW51bTtcbmV4cG9ydHMuZWxsaXBzaWZ5ID0gZWxsaXBzaWZ5O1xuZXhwb3J0cy5kZWVwTWVyZ2VDb25jYXRBcnJheXMgPSBkZWVwTWVyZ2VDb25jYXRBcnJheXM7XG5leHBvcnRzLmNyZWF0ZUV2ZW50ID0gY3JlYXRlRXZlbnQ7XG5leHBvcnRzLm5vcm1hbGl6ZSA9IG5vcm1hbGl6ZTtcbmV4cG9ydHMueEZyb21Qb3NpdGlvbiA9IHhGcm9tUG9zaXRpb247XG5leHBvcnRzLnlGcm9tUG9zaXRpb24gPSB5RnJvbVBvc2l0aW9uO1xuZXhwb3J0cy5sZXZlbnNodGVpbiA9IGxldmVuc2h0ZWluO1xuZXhwb3J0cy5iaXNlY3QgPSBiaXNlY3Q7XG5leHBvcnRzLmZsYXR0ZW4gPSBmbGF0dGVuO1xuZXhwb3J0cy5yZWxvYWQgPSByZWxvYWQ7XG5leHBvcnRzLmN1cnJlbnRMb2NhdGlvbiA9IGN1cnJlbnRMb2NhdGlvbjtcbmV4cG9ydHMud2luZG93T3BlbiA9IHdpbmRvd09wZW47XG5leHBvcnRzLm5hdmlnYXRlVG9IcmVmID0gbmF2aWdhdGVUb0hyZWY7XG5leHBvcnRzLnN0cmluZ2lmeVF1ZXJ5UGFyYW1zID0gc3RyaW5naWZ5UXVlcnlQYXJhbXM7XG5leHBvcnRzLmxpbmtXaXRoUXVlcnlQYXJhbXMgPSBsaW5rV2l0aFF1ZXJ5UGFyYW1zO1xuZXhwb3J0cy5yZXNldEFuaUdpZiA9IHJlc2V0QW5pR2lmO1xuZXhwb3J0cy5pbnRlcnBvbGF0ZUNvbG9ycyA9IGludGVycG9sYXRlQ29sb3JzO1xuZXhwb3J0cy5nZXRUYWJJZCA9IGdldFRhYklkO1xuZXhwb3J0cy5jcmVhdGVIaWRkZW5QcmludFdpbmRvdyA9IGNyZWF0ZUhpZGRlblByaW50V2luZG93O1xuZXhwb3J0cy5jYWxjdWxhdGVPZmZzZXRDb29yZGluYXRlcyA9IGNhbGN1bGF0ZU9mZnNldENvb3JkaW5hdGVzO1xuZXhwb3J0cy5oYXNoU3RyaW5nID0gaGFzaFN0cmluZztcbmV4cG9ydHMudG9vbHRpcGlmeVZvY2FidWxhcnkgPSB0b29sdGlwaWZ5Vm9jYWJ1bGFyeTtcbmV4cG9ydHMuY29udGFpbnNBdExlYXN0T25lQWxwaGFOdW1lcmljID0gY29udGFpbnNBdExlYXN0T25lQWxwaGFOdW1lcmljO1xuZXhwb3J0cy5maW5kUHJvZmFuaXR5ID0gdm9pZCAwO1xuXG52YXIgX2pxdWVyeSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcImpxdWVyeVwiKSk7XG5cbnZhciBfaW1tdXRhYmxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiaW1tdXRhYmxlXCIpKTtcblxudmFyIF9tZCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcImNyeXB0by1qcy9tZDVcIikpO1xuXG52YXIgX3JnYmNvbG9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwicmdiY29sb3JcIikpO1xuXG52YXIgX2NvbnN0YW50cyA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcblxudmFyIF9pbWFnZVV0aWxzID0gcmVxdWlyZShcIi4vaW1hZ2VVdGlsc1wiKTtcblxucmVxdWlyZShcIi4vcG9seWZpbGxzXCIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gc3Vic2VxdWVuY2UgaXMgdHJ1bHkgYSBzdWJzZXF1ZW5jZSBvZiB0aGUgZ2l2ZW4gc2VxdWVuY2UsXG4gKiBhbmQgd2hldGhlciB0aGUgZWxlbWVudHMgYXBwZWFyIGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZSBzZXF1ZW5jZS5cbiAqXG4gKiBAcGFyYW0gc2VxdWVuY2UgQXJyYXkgLSBUaGUgc2VxdWVuY2UgdGhhdCB0aGUgc3Vic2VxdWVuY2Ugc2hvdWxkIGJlIGEgc3Vic2VxdWVuY2Ugb2YuXG4gKiBAcGFyYW0gc3Vic2VxdWVuY2UgQXJyYXkgLSBBIHN1YnNlcXVlbmNlIG9mIHRoZSBnaXZlbiBzZXF1ZW5jZS5cbiAqIEByZXR1cm5zIGJvb2xlYW4gLSB3aGV0aGVyIG9yIG5vdCBzdWJzZXF1ZW5jZSBpcyByZWFsbHkgYSBzdWJzZXF1ZW5jZSBvZiBzZXF1ZW5jZS5cbiAqL1xuZnVuY3Rpb24gaXNTdWJzZXF1ZW5jZShzZXF1ZW5jZSwgc3Vic2VxdWVuY2UpIHtcbiAgdmFyIHN1cGVySW5kZXggPSAwLFxuICAgICAgc3ViSW5kZXggPSAwO1xuXG4gIHdoaWxlIChzdWJJbmRleCA8IHN1YnNlcXVlbmNlLmxlbmd0aCkge1xuICAgIHdoaWxlIChzdXBlckluZGV4IDwgc2VxdWVuY2UubGVuZ3RoICYmIHN1YnNlcXVlbmNlW3N1YkluZGV4XSAhPT0gc2VxdWVuY2Vbc3VwZXJJbmRleF0pIHtcbiAgICAgIHN1cGVySW5kZXgrKztcbiAgICB9XG5cbiAgICBpZiAoc3VwZXJJbmRleCA+PSBzZXF1ZW5jZS5sZW5ndGgpIHtcbiAgICAgIC8vIHdlIHdlbnQgb2ZmIHRoZSBlbmQgd2hpbGUgc2VhcmNoaW5nXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3ViSW5kZXgrKztcbiAgICBzdXBlckluZGV4Kys7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc2hhbGxvd0NvcHkoc291cmNlKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcblxuICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgIHJlc3VsdFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIFJldHVybnMgYSBjbG9uZSBvZiB0aGUgb2JqZWN0LCBzdHJpcHBpbmcgYW55IGZ1bmN0aW9ucyBvbiBpdC5cbiAqL1xuXG5cbmZ1bmN0aW9uIGNsb25lV2l0aG91dEZ1bmN0aW9ucyhvYmplY3QpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqZWN0KSk7XG59XG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgd2l0aCBhIGRvdWJsZSBxdW90ZSBiZWZvcmUgYW5kIGFmdGVyLlxuICovXG5cblxuZnVuY3Rpb24gcXVvdGUoc3RyKSB7XG4gIHJldHVybiAnXCInICsgc3RyICsgJ1wiJztcbn1cbi8qKlxuICogU3BsaXRzIGEgc3RyaW5nIGludG8gY2h1bmtzIG9mIGEgY2VydGFpbiBsZW5ndGguXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtOdW1iZXJ9IG1heExlbmd0aCBNYXggbGVuZ3RoIG9mIGVhY2ggY2h1bmsuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGVsaW1pdGVyXG4gKiBAcmV0dXJucyBBcnJheTxTdHJpbmc+XG4gKi9cblxuXG5mdW5jdGlvbiBzdHJpbmdUb0NodW5rcyhzdHIsIG1heExlbmd0aCkge1xuICB2YXIgZGVsaW1pdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAnICc7XG4gIHJldHVybiBzdHIuc3BsaXQoZGVsaW1pdGVyKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgdmFsKSB7XG4gICAgdmFyIGxhc3RWYWwgPSAnJztcblxuICAgIGlmIChhY2NbYWNjLmxlbmd0aCAtIDFdLmxlbmd0aCArIHZhbC5sZW5ndGggPCBtYXhMZW5ndGgpIHtcbiAgICAgIGxhc3RWYWwgPSBhY2MucG9wKCkgKyBkZWxpbWl0ZXI7XG4gICAgfVxuXG4gICAgbGFzdFZhbCArPSB2YWw7XG4gICAgYWNjLnB1c2gobGFzdFZhbC50cmltKCkpO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIFsnJ10pO1xufVxuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IG9iamVjdCB3aXRoIHRoZSBwcm9wZXJ0aWVzIGZyb20gZGVmYXVsdHMgb3ZlcnJpZGRlbiBieSBhbnlcbiAqIHByb3BlcnRpZXMgaW4gb3B0aW9ucy4gTGVhdmVzIGRlZmF1bHRzIGFuZCBvcHRpb25zIHVuY2hhbmdlZC5cbiAqIE5PVEU6IEZvciBuZXcgY29kZSwgdXNlIE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRpb25zKSBpbnN0ZWFkXG4gKi9cblxuXG5mdW5jdGlvbiBleHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMpIHtcbiAgdmFyIGZpbmFsT3B0aW9ucyA9IGV4cG9ydHMuc2hhbGxvd0NvcHkoZGVmYXVsdHMpO1xuXG4gIGZvciAodmFyIHByb3AgaW4gb3B0aW9ucykge1xuICAgIGZpbmFsT3B0aW9uc1twcm9wXSA9IG9wdGlvbnNbcHJvcF07XG4gIH1cblxuICByZXR1cm4gZmluYWxPcHRpb25zO1xufVxuLyoqXG4gKiBSZXBsYWNlcyBzcGVjaWFsIGNoYXJhY3RlcnMgaW4gc3RyaW5nIGJ5IEhUTUwgZW50aXRpZXMuXG4gKiBMaXN0IG9mIHNwZWNpYWwgY2hhcmFjdGVycyBpcyB0YWtlbiBmcm9tXG4gKiBodHRwczovL2NoZWF0c2hlZXRzZXJpZXMub3dhc3Aub3JnL2NoZWF0c2hlZXRzL0Nyb3NzX1NpdGVfU2NyaXB0aW5nX1ByZXZlbnRpb25fQ2hlYXRfU2hlZXQuaHRtbC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1bnNhZmUgLSBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IEVzY2FwZWQgc3RyaW5nLiBSZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBpZiBpbnB1dCBpcyBudWxsIG9yIHVuZGVmaW5lZC5cbiAqL1xuXG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwodW5zYWZlKSB7XG4gIHJldHVybiB1bnNhZmUgPyB1bnNhZmUucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKS5yZXBsYWNlKC8nL2csICcmIzM5OycpLnJlcGxhY2UoL1xcLy9nLCAnJiM0NzsnKSA6ICcnO1xufVxuLyoqXG4gKiBWZXJzaW9uIG9mIG1vZHVsbyB3aGljaCwgdW5saWtlIGphdmFzY3JpcHQncyBgJWAgb3BlcmF0b3IsXG4gKiB3aWxsIGFsd2F5cyByZXR1cm4gYSBwb3NpdGl2ZSByZW1haW5kZXIuXG4gKiBAcGFyYW0gbnVtYmVyXG4gKiBAcGFyYW0gbW9kXG4gKi9cblxuXG5mdW5jdGlvbiBtb2QobnVtYmVyLCBtb2QpIHtcbiAgcmV0dXJuIChudW1iZXIgJSBtb2QgKyBtb2QpICUgbW9kO1xufVxuLyoqXG4gKiBHZW5lcmF0ZXMgYW4gYXJyYXkgb2YgaW50ZWdlcnMgZnJvbSBzdGFydCB0byBlbmQgaW5jbHVzaXZlXG4gKi9cblxuXG5mdW5jdGlvbiByYW5nZShzdGFydCwgZW5kKSB7XG4gIHZhciBpbnRzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgaW50cy5wdXNoKGkpO1xuICB9XG5cbiAgcmV0dXJuIGludHM7XG59XG4vKipcbiAqIEdpdmVuIHR3byBmdW5jdGlvbnMsIGdlbmVyYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZVxuICogc2Vjb25kIGZ1bmN0aW9uIGlmIGFuZCBvbmx5IGlmIHRoZSBmaXJzdCBmdW5jdGlvbiByZXR1cm5zIHRydWVcbiAqL1xuXG5cbmZ1bmN0aW9uIGV4ZWN1dGVJZkNvbmRpdGlvbmFsKGNvbmRpdGlvbmFsLCBmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmIChjb25kaXRpb25hbCgpKSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG59XG4vKipcbiAqIFJlbW92ZXMgYWxsIHNpbmdsZSBhbmQgZG91YmxlIHF1b3RlcyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gaW5wdXRTdHJpbmdcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHN0cmluZyB3aXRob3V0IHF1b3Rlc1xuICovXG5cblxuZnVuY3Rpb24gc3RyaXBRdW90ZXMoaW5wdXRTdHJpbmcpIHtcbiAgcmV0dXJuIGlucHV0U3RyaW5nLnJlcGxhY2UoL1tcIiddL2csICcnKTtcbn1cbi8qKlxuICogRGVmaW5lcyBhbiBpbmhlcml0YW5jZSByZWxhdGlvbnNoaXAgYmV0d2VlbiBwYXJlbnQgY2xhc3MgYW5kIHRoaXMgY2xhc3MuXG4gKi9cblxuXG5GdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIHRoaXMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcbiAgdGhpcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB0aGlzO1xuICB0aGlzLnN1cGVyUHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcbn07XG4vKipcbiAqIFdyYXAgYSBjb3VwbGUgb2Ygb3VyIEJsb2NrbHkgbnVtYmVyIHZhbGlkYXRvcnMgdG8gYWxsb3cgZm9yID8/Py4gIFRoaXMgaXNcbiAqIGRvbmUgc28gdGhhdCBsZXZlbCBidWlsZGVycyBjYW4gc3BlY2lmeSByZXF1aXJlZCBibG9ja3Mgd2l0aCB3aWxkY2FyZCBmaWVsZHMuXG4gKi9cblxuXG5mdW5jdGlvbiB3cmFwTnVtYmVyVmFsaWRhdG9yc0ZvckxldmVsQnVpbGRlcigpIHtcbiAgdmFyIG5vbk5lZyA9IEJsb2NrbHkuRmllbGRUZXh0SW5wdXQubm9ubmVnYXRpdmVJbnRlZ2VyVmFsaWRhdG9yO1xuICB2YXIgbnVtVmFsID0gQmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3I7XG5cbiAgQmxvY2tseS5GaWVsZFRleHRJbnB1dC5ub25uZWdhdGl2ZUludGVnZXJWYWxpZGF0b3IgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgIGlmICh0ZXh0ID09PSAnPz8/Jykge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vbk5lZyh0ZXh0KTtcbiAgfTtcblxuICBCbG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgaWYgKHRleHQgPT09ICc/Pz8nKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVtVmFsKHRleHQpO1xuICB9O1xufVxuLyoqXG4gKiBSZXR1cm4gYSByYW5kb20gdmFsdWUgZnJvbSBhbiBhcnJheVxuICovXG5cblxuZnVuY3Rpb24gcmFuZG9tVmFsdWUodmFsdWVzKSB7XG4gIHZhciBrZXkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWx1ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbHVlc1trZXldO1xufVxuLyoqXG4gKiBSZXR1cm4gYSByYW5kb20ga2V5IG5hbWUgZnJvbSBhbiBvYmplY3QuXG4gKi9cblxuXG5mdW5jdGlvbiByYW5kb21LZXkob2JqKSB7XG4gIHJldHVybiByYW5kb21WYWx1ZShPYmplY3Qua2V5cyhvYmopKTtcbn1cbi8qKlxuICogR2VuZXJhdGUgYSByYW5kb20gaWRlbnRpZmllciBpbiBhIGZvcm1hdCBtYXRjaGluZyB0aGUgUkZDLTQxMjIgc3BlY2lmaWNhdGlvbi5cbiAqXG4gKiBUYWtlbiBmcm9tXG4gKiB7QGxpbmsgaHR0cDovL2J5cm9uc2FsYXUuY29tL2Jsb2cvaG93LXRvLWNyZWF0ZS1hLWd1aWQtdXVpZC1pbi1qYXZhc2NyaXB0L31cbiAqXG4gKiBAc2VlIFJGQy00MTIyIHN0YW5kYXJkIHtAbGluayBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmM0MTIyLnR4dH1cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSRkM0MTIyLWNvbXBsaWFudCBVVUlEXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVVdWlkKCkge1xuICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCxcbiAgICAgICAgdiA9IGMgPT09ICd4JyA/IHIgOiByICYgMHgzIHwgMHg4O1xuICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGZpcmVSZXNpemVFdmVudCgpIHtcbiAgdmFyIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gIGV2LmluaXRFdmVudCgncmVzaXplJywgdHJ1ZSwgdHJ1ZSk7XG4gIHdpbmRvdy5kaXNwYXRjaEV2ZW50KGV2KTtcbn1cbi8qKlxuICogU2ltaWxhciB0byB2YWwgfHwgZGVmYXVsdFZhbCwgZXhjZXB0IGl0J3MgZ2F0ZWQgb24gd2hldGhlciBvciBub3QgdmFsIGlzXG4gKiB1bmRlZmluZWQgaW5zdGVhZCBvZiB3aGV0aGVyIHZhbCBpcyBmYWxzZXkuXG4gKiBAcmV0dXJucyB7Kn0gdmFsIGlmIG5vdCB1bmRlZmluZWQsIG90aGVyd2lzZSBkZWZhdWx0VmFsXG4gKi9cblxuXG5mdW5jdGlvbiB2YWx1ZU9yKHZhbCwgZGVmYXVsdFZhbCkge1xuICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsIDogdmFsO1xufVxuLyoqXG4gKiBBdHRlbXB0cyB0byBhbmFseXplIHdoZXRoZXIgb3Igbm90IGVyciByZXByZXNlbnRzIGluZmluaXRlIHJlY3Vyc2lvbiBoYXZpbmdcbiAqIG9jY3VycmVkLiBUaGlzIGVycm9yIGRpZmZlcnMgcGVyIGJyb3dzZXIsIGFuZCBpdCdzIHBvc3NpYmxlIHRoYXQgd2UgZG9uJ3RcbiAqIHByb3Blcmx5IGRpc2NvdmVyIGFsbCBjYXNlcy5cbiAqIE5vdGU6IE90aGVyIGxhbmd1YWdlcyBwcm9iYWJseSBoYXZlIGxvY2FsaXplZCBtZXNzYWdlcywgbWVhbmluZyB3ZSB3b24ndFxuICogY2F0Y2ggdGhlbS5cbiAqL1xuXG5cbmZ1bmN0aW9uIGlzSW5maW5pdGVSZWN1cnNpb25FcnJvcihlcnIpIHtcbiAgLy8gQ2hyb21lL1NhZmFyaTogbWVzc2FnZSBlbmRzIGluIGEgcGVyaW9kIGluIFNhZmFyaSwgbm90IGluIENocm9tZVxuICBpZiAoZXJyIGluc3RhbmNlb2YgUmFuZ2VFcnJvciAmJiAvXk1heGltdW0gY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkLy50ZXN0KGVyci5tZXNzYWdlKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IC8vIEZpcmVmb3hcblxuICAvKmVzbGludC1kaXNhYmxlICovXG4gIC8vIExpbnRlciBkb2Vzbid0IGxpa2Ugb3VyIHVzZSBvZiBJbnRlcm5hbEVycm9yLCBldmVuIHRob3VnaCB3ZSBnYXRlIG9uIGl0c1xuICAvLyBleGlzdGVuY2UuXG5cblxuICBpZiAodHlwZW9mIEludGVybmFsRXJyb3IgIT09ICd1bmRlZmluZWQnICYmIGVyciBpbnN0YW5jZW9mIEludGVybmFsRXJyb3IgJiYgZXJyLm1lc3NhZ2UgPT09ICd0b28gbXVjaCByZWN1cnNpb24nKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgLyplc2xpbnQtZW5hYmxlICovXG4gIC8vIElFXG5cblxuICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyLm1lc3NhZ2UgPT09ICdPdXQgb2Ygc3RhY2sgc3BhY2UnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4vKipcbiAqIFJlbW92ZSBlc2NhcGVkIGNoYXJhY3RlcnMgYW5kIEhUTUwgdG8gY29udmVydCBzb21lIHJlbmRlcmVkIHRleHQgdG8gd2hhdCBzaG91bGQgYXBwZWFyIGluIHVzZXItZWRpdGVkIGNvbnRyb2xzXG4gKiBAcGFyYW0gdGV4dFxuICogQHJldHVybnMgU3RyaW5nIHRoYXQgaGFzIG5vIG1vcmUgZXNjYXBlIGNoYXJhY3RlcnMgYW5kIG11bHRpcGxlIGRpdnMgY29udmVydGVkIHRvIG5ld2xpbmVzXG4gKi9cblxuXG5mdW5jdGlvbiB1bmVzY2FwZVRleHQodGV4dCkge1xuICB2YXIgY2xlYW5lZFRleHQgPSB0ZXh0OyAvLyBIYW5kbGluZyBvZiBsaW5lIGJyZWFrczpcbiAgLy8gSW4gbXVsdGlsaW5lIHRleHQgaXQncyBwb3NzaWJsZSBmb3IgdGhlIGZpcnN0IGxpbmUgdG8gcmVuZGVyIHdyYXBwZWQgb3IgdW53cmFwcGVkLlxuICAvLyAgICAgTGluZSAxXG4gIC8vICAgICBMaW5lIDJcbiAgLy8gICBDYW4gcmVuZGVyIGFzIGFueSBvZjpcbiAgLy8gICAgIExpbmUgMTxkaXY+TGluZSAyPC9kaXY+XG4gIC8vICAgICBMaW5lIDE8YnI+PGRpdj5MaW5lIDI8L2Rpdj5cbiAgLy8gICAgIDxkaXY+TGluZSAxPC9kaXY+PGRpdj5MaW5lIDI8L2Rpdj5cbiAgLy9cbiAgLy8gTW9zdCBibGFuayBsaW5lcyBhcmUgcmVuZGVyZWQgYXMgPGRpdj48YnI+PC9kaXY+XG4gIC8vICAgICBMaW5lIDFcbiAgLy9cbiAgLy8gICAgIExpbmUgM1xuICAvLyAgIENhbiByZW5kZXIgYXMgYW55IG9mOlxuICAvLyAgICAgTGluZSAxPGRpdj48YnI+PC9kaXY+PGRpdj5MaW5lIDM8L2Rpdj5cbiAgLy8gICAgIExpbmUgMTxicj48ZGl2Pjxicj48L2Rpdj48ZGl2PkxpbmUgMzwvZGl2PlxuICAvLyAgICAgPGRpdj5MaW5lIDE8L2Rpdj48ZGl2Pjxicj48L2Rpdj48ZGl2PkxpbmUgMzwvZGl2PlxuICAvL1xuICAvLyBMZWFkaW5nIGJsYW5rIGxpbmVzIHJlbmRlciB3cmFwcGVkIG9yIGFzIHBsYWNlaG9sZGVyIGJyZWFrcyBhbmQgc2hvdWxkIGJlIHByZXNlcnZlZFxuICAvL1xuICAvLyAgICAgTGluZSAyXG4gIC8vICAgUmVuZGVycyBhcyBhbnkgb2Y6XG4gIC8vICAgIDxicj48ZGl2PkxpbmUgMjwvZGl2PlxuICAvLyAgICA8ZGl2Pjxicj48L2Rpdj48ZGl2PkxpbmUgMjwvZGl2PlxuICAvLyBGaXJzdCwgY29udmVydCBldmVyeSA8ZGl2PiB0YWcgdGhhdCBpc24ndCBhdCB0aGUgdmVyeSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICAvLyB0byBhIG5ld2xpbmUuICBUaGlzIGF2b2lkcyBnZW5lcmF0aW5nIGFuIGluY29ycmVjdCBibGFuayBsaW5lIGF0IHRoZSBzdGFydFxuICAvLyBpZiB0aGUgZmlyc3QgbGluZSBpcyB3cmFwcGVkIGluIGEgPGRpdj4uXG5cbiAgY2xlYW5lZFRleHQgPSBjbGVhbmVkVGV4dC5yZXBsYWNlKC8oPyFeKTxkaXZbXj5dKj4vZ2ksICdcXG4nKTtcbiAgY2xlYW5lZFRleHQgPSBjbGVhbmVkVGV4dC5yZXBsYWNlKC88W14+XSs+L2dpLCAnJyk7IC8vIFN0cmlwIGFsbCBvdGhlciB0YWdzXG5cbiAgY2xlYW5lZFRleHQgPSBjbGVhbmVkVGV4dC5yZXBsYWNlKC8mbmJzcDsvZ2ksICcgJyk7IC8vIFVuZXNjYXBlIG5vbmJyZWFraW5nIHNwYWNlc1xuXG4gIGNsZWFuZWRUZXh0ID0gY2xlYW5lZFRleHQucmVwbGFjZSgvJmd0Oy9naSwgJz4nKTsgLy8gVW5lc2NhcGUgPlxuXG4gIGNsZWFuZWRUZXh0ID0gY2xlYW5lZFRleHQucmVwbGFjZSgvJmx0Oy9naSwgJzwnKTsgLy8gVW5lc2NhcGUgPFxuXG4gIGNsZWFuZWRUZXh0ID0gY2xlYW5lZFRleHQucmVwbGFjZSgvJmFtcDsvZ2ksICcmJyk7IC8vIFVuZXNjYXBlICYgKG11c3QgaGFwcGVuIGxhc3QhKVxuXG4gIHJldHVybiBjbGVhbmVkVGV4dDtcbn1cbi8qKlxuICogRXNjYXBlIHNwZWNpYWwgY2hhcmFjdGVycyBpbiBhIHBpZWNlIG9mIHRleHQsIGFuZCBjb252ZXJ0IG5ld2xpbmVzIHRvIHNlcGVyYXRlIGRpdnNcbiAqIEBwYXJhbSB0ZXh0XG4gKiBAcmV0dXJucyBTdHJpbmcgd2l0aCBzcGVjaWFsIGNoYXJhY3RlcnMgZXNjYXBlZCBhbmQgbmV3bGluZXMgY29udmVydGVkIGRpdnNcbiAqL1xuXG5cbmZ1bmN0aW9uIGVzY2FwZVRleHQodGV4dCkge1xuICB2YXIgZXNjYXBlZFRleHQgPSB0ZXh0LnRvU3RyaW5nKCk7XG4gIGVzY2FwZWRUZXh0ID0gZXNjYXBlZFRleHQucmVwbGFjZSgvJi9nLCAnJmFtcDsnKTsgLy8gRXNjYXBlICYgKG11c3QgaGFwcGVuIGZpcnN0ISlcblxuICBlc2NhcGVkVGV4dCA9IGVzY2FwZWRUZXh0LnJlcGxhY2UoLzwvZywgJyZsdDsnKTsgLy8gRXNjYXBlIDxcblxuICBlc2NhcGVkVGV4dCA9IGVzY2FwZWRUZXh0LnJlcGxhY2UoLz4vZywgJyZndDsnKTsgLy8gRXNjYXBlID5cblxuICBlc2NhcGVkVGV4dCA9IGVzY2FwZWRUZXh0LnJlcGxhY2UoLyB7Mn0vZywgJyAmbmJzcDsnKTsgLy8gRXNjYXBlIGRvdWJsZWQgc3BhY2VzXG4gIC8vIE5vdyB3cmFwIGVhY2ggbGluZSBleGNlcHQgdGhlIGZpcnN0IGxpbmUgaW4gYSA8ZGl2PixcbiAgLy8gcmVwbGFjaW5nIGJsYW5rIGxpbmVzIHdpdGggPGRpdj48YnI+PGRpdj5cblxuICB2YXIgbGluZXMgPSBlc2NhcGVkVGV4dC5zcGxpdCgnXFxuJyk7XG4gIHZhciBmaXJzdCA9IGxpbmVzWzBdO1xuICB2YXIgcmVzdCA9IGxpbmVzLnNsaWNlKDEpOyAvLyBJZiBmaXJzdCBsaW5lIGlzIGJsYW5rIGFuZCBub3QgdGhlIG9ubHkgbGluZSwgY29udmVydCBpdCB0byBhIDxicj4gdGFnOlxuXG4gIGlmIChmaXJzdC5sZW5ndGggPT09IDAgJiYgbGluZXMubGVuZ3RoID4gMSkge1xuICAgIGZpcnN0ID0gJzxicj4nO1xuICB9IC8vIFdyYXAgdGhlIHJlc3Qgb2YgdGhlIGxpbmVzXG5cblxuICByZXR1cm4gZmlyc3QgKyByZXN0Lm1hcChmdW5jdGlvbiAobGluZSkge1xuICAgIHJldHVybiAnPGRpdj4nICsgKGxpbmUubGVuZ3RoID8gbGluZSA6ICc8YnI+JykgKyAnPC9kaXY+JztcbiAgfSkuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIHNob3dHZW5lcmljUXRpcCh0YXJnZXRFbGVtZW50LCB0aXRsZSwgbWVzc2FnZSwgcG9zaXRpb24pIHtcbiAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSh0YXJnZXRFbGVtZW50KS5xdGlwKHtcbiAgICBjb250ZW50OiB7XG4gICAgICB0ZXh0OiBcIlxcbiAgICAgICAgPGg0PlwiLmNvbmNhdCh0aXRsZSwgXCI8L2g0PlxcbiAgICAgICAgPHA+XCIpLmNvbmNhdChtZXNzYWdlLCBcIjwvcD5cXG4gICAgICBcIiksXG4gICAgICB0aXRsZToge1xuICAgICAgICBidXR0b246ICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJzxkaXYgY2xhc3M9XCJ0b29sdGlwLXgtY2xvc2VcIi8+JylcbiAgICAgIH1cbiAgICB9LFxuICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICBzdHlsZToge1xuICAgICAgY2xhc3NlczogJ2Nkby1xdGlwcycsXG4gICAgICB0aXA6IHtcbiAgICAgICAgd2lkdGg6IDIwLFxuICAgICAgICBoZWlnaHQ6IDIwXG4gICAgICB9XG4gICAgfSxcbiAgICBoaWRlOiB7XG4gICAgICBldmVudDogJ3VuZm9jdXMnXG4gICAgfSxcbiAgICBzaG93OiBmYWxzZSAvLyBkb24ndCBzaG93IG9uIG1vdXNlb3ZlclxuXG4gIH0pLnF0aXAoJ3Nob3cnKTtcbn1cblxuZnVuY3Rpb24gc2hvd1VudXNlZEJsb2NrUXRpcCh0YXJnZXRFbGVtZW50KSB7XG4gIHZhciBtc2cgPSByZXF1aXJlKCdAY2RvL2xvY2FsZScpO1xuXG4gIHZhciB0aXRsZSA9IG1zZy51bmF0dGFjaGVkQmxvY2tUaXBUaXRsZSgpO1xuICB2YXIgbWVzc2FnZSA9IG1zZy51bmF0dGFjaGVkQmxvY2tUaXBCb2R5KCk7XG4gIHZhciBwb3NpdGlvbiA9IHtcbiAgICBteTogJ2JvdHRvbSBsZWZ0JyxcbiAgICBhdDogJ3RvcCByaWdodCdcbiAgfTtcbiAgc2hvd0dlbmVyaWNRdGlwKHRhcmdldEVsZW1lbnQsIHRpdGxlLCBtZXNzYWdlLCBwb3NpdGlvbik7XG59XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZWZhdWx0VmFsdWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuXG5cbmZ1bmN0aW9uIHRyeUdldExvY2FsU3RvcmFnZShrZXksIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZGVmYXVsdFZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyAndHJ5R2V0TG9jYWxTdG9yYWdlIHJlcXVpcmVzIGRlZmF1bHRWYWx1ZSc7XG4gIH1cblxuICB2YXIgcmV0dXJuVmFsdWUgPSBkZWZhdWx0VmFsdWU7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm5WYWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gIH0gY2F0Y2ggKGUpIHsvLyBJZ25vcmUsIHJldHVybiBkZWZhdWx0XG4gIH1cblxuICByZXR1cm4gcmV0dXJuVmFsdWU7XG59XG4vKipcbiAqIFNpbXBsZSB3cmFwcGVyIGFyb3VuZCBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSB0aGF0IGNhdGNoZXMgYW55IGV4Y2VwdGlvbnMgKGZvclxuICogZXhhbXBsZSB3aGVuIHdlIGNhbGwgc2V0SXRlbSBpbiBTYWZhcmkncyBwcml2YXRlIG1vZGUpXG4gKiBAcGFyYW0ge3N0cmluZ30gaXRlbVxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHdlIHNldCBzdWNjZXNzZnVsbHlcbiAqL1xuXG5cbmZ1bmN0aW9uIHRyeVNldExvY2FsU3RvcmFnZShpdGVtLCB2YWx1ZSkge1xuICB0cnkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGl0ZW0sIHZhbHVlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnlHZXRTZXNzaW9uU3RvcmFnZShrZXksIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZGVmYXVsdFZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyAndHJ5R2V0U2Vzc2lvblN0b3JhZ2UgcmVxdWlyZXMgZGVmYXVsdFZhbHVlJztcbiAgfVxuXG4gIHZhciByZXR1cm5WYWx1ZSA9IGRlZmF1bHRWYWx1ZTtcblxuICB0cnkge1xuICAgIHJldHVyblZhbHVlID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICB9IGNhdGNoIChlKSB7Ly8gSWdub3JlLCByZXR1cm4gZGVmYXVsdFxuICB9XG5cbiAgcmV0dXJuIHJldHVyblZhbHVlO1xufVxuLyoqXG4gKiBTaW1wbGUgd3JhcHBlciBhcm91bmQgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSB0aGF0IGNhdGNoZXMgdGhlIHF1b3RhIGV4Y2VlZGVkXG4gKiBleGNlcHRpb25zIHdlIGdldCB3aGVuIHdlIGNhbGwgc2V0SXRlbSBpbiBTYWZhcmkncyBwcml2YXRlIG1vZGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gaXRlbVxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHdlIHNldCBzdWNjZXNzZnVsbHlcbiAqL1xuXG5cbmZ1bmN0aW9uIHRyeVNldFNlc3Npb25TdG9yYWdlKGl0ZW0sIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShpdGVtLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZS5uYW1lICE9PSAnUXVvdGFFeGNlZWRlZEVycm9yJykge1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbi8qKlxuICogR2VuZXJhdGVzIGEgc2ltcGxlIGVudW0gb2JqZWN0XG4gKiBAcmV0dXJuIHtPYmplY3Q8U3RyaW5nLCBTdHJpbmc+fVxuICogQGV4YW1wbGVcbiAqICAgdmFyIFNlYXNvbnMgPSBlbnVtKCdTUFJJTkcnLCAnU1VNTUVSJywgJ0ZBTEwnLCAnV0lOVEVSJyk7XG4gKiAgIFNlYXNvbnMuU1BSSU5HID09PSAnU1BSSU5HJztcbiAqICAgU2Vhc29ucy5TVU1NRVIgPT09ICdTVU1NRVInO1xuICogICAvLyBldGMuLi5cbiAqL1xuXG5cbmZ1bmN0aW9uIG1ha2VFbnVtKCkge1xuICB2YXIgcmVzdWx0ID0ge30sXG4gICAgICBrZXk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBrZXkgPSBTdHJpbmcoYXJndW1lbnRzW2ldKTtcblxuICAgIGlmIChyZXN1bHRba2V5XSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXkgXCInICsga2V5ICsgJ1wiIG9jY3VycmVkIHR3aWNlIHdoaWxlIGNvbnN0cnVjdGluZyBlbnVtJyk7XG4gICAgfVxuXG4gICAgcmVzdWx0W2tleV0gPSBrZXk7XG4gIH1cblxuICBpZiAoT2JqZWN0LmZyZWV6ZSkge1xuICAgIE9iamVjdC5mcmVlemUocmVzdWx0KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIElmIHRoZSBzdHJpbmcgaXMgdG9vIGxvbmcsIHRydW5jYXRlIGl0IGFuZCBhcHBlbmQgYW4gZWxsaXBzaXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRUZXh0XG4gKiBAcGFyYW0ge251bWJlcn0gbWF4TGVuZ3RoXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5cblxuZnVuY3Rpb24gZWxsaXBzaWZ5KGlucHV0VGV4dCwgbWF4TGVuZ3RoKSB7XG4gIGlmIChpbnB1dFRleHQgJiYgaW5wdXRUZXh0Lmxlbmd0aCA+IG1heExlbmd0aCkge1xuICAgIHJldHVybiBpbnB1dFRleHQuc3Vic3RyKDAsIG1heExlbmd0aCAtIDMpICsgJy4uLic7XG4gIH1cblxuICByZXR1cm4gaW5wdXRUZXh0IHx8ICcnO1xufVxuLyoqXG4gKiBSZXR1cm5zIGRlZXAgbWVyZ2Ugb2YgdHdvIG9iamVjdHMsIGNvbmNhdGVuYXRpbmcgcmF0aGVyIHRoYW4gb3ZlcndyaXRpbmdcbiAqIGFycmF5IHByb3Blcml0ZXMuIERvZXMgbm90IG11dGF0ZSBlaXRoZXIgb2JqZWN0LlxuICpcbiAqIE5vdGU6IG5ldyBwcm9wZXJ0aWVzIGluIG92ZXJyaWRlcyBhcmUgYWx3YXlzIGFkZGVkIHRvIGVuZCwgbm90IGluLW9yZGVyLlxuICpcbiAqIFRPRE8oYmpvcmRhbik6IFJlcGxhY2Ugd2l0aCBfLm1lcmdlV2l0aCB3aGVuIGxvZGFzaCB1cGdyYWRlZCB0byA0LnguXG4gKlxuICogTm90ZTogbWF5IGJlY29tZSBkZWZhdWx0IGJlaGF2aW9yIG9mIG1lcmdlRGVlcCBpbiBmdXR1cmUgaW1tdXRhYmxlIHZlcnNpb25zLlxuICogICBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9pbW11dGFibGUtanMvaXNzdWVzLzQwNlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBiYXNlT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb3ZlcnJpZGVzXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBvcmlnaW5hbCBvYmplY3QgKG5vdyBtb2RpZmllZCBpbi1wbGFjZSlcbiAqL1xuXG5cbmZ1bmN0aW9uIGRlZXBNZXJnZUNvbmNhdEFycmF5cyhiYXNlT2JqZWN0LCBvdmVycmlkZXMpIHtcbiAgZnVuY3Rpb24gZGVlcENvbmNhdE1lcmdlcihhLCBiKSB7XG4gICAgdmFyIGlzTGlzdCA9IF9pbW11dGFibGVbXCJkZWZhdWx0XCJdLkxpc3QuaXNMaXN0O1xuXG4gICAgaWYgKGlzTGlzdChhKSAmJiBpc0xpc3QoYikpIHtcbiAgICAgIHJldHVybiBhLmNvbmNhdChiKTtcbiAgICB9XG5cbiAgICBpZiAoYSAmJiBhLm1lcmdlV2l0aCkge1xuICAgICAgcmV0dXJuIGEubWVyZ2VXaXRoKGRlZXBDb25jYXRNZXJnZXIsIGIpO1xuICAgIH1cblxuICAgIHJldHVybiBiO1xuICB9XG5cbiAgdmFyIGJhc2VJbW11dGFibGUgPSBfaW1tdXRhYmxlW1wiZGVmYXVsdFwiXS5mcm9tSlMoYmFzZU9iamVjdCk7XG5cbiAgcmV0dXJuIGJhc2VJbW11dGFibGUubWVyZ2VXaXRoKGRlZXBDb25jYXRNZXJnZXIsIG92ZXJyaWRlcykudG9KUygpO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGV2ZW50IGluIGEgY3Jvc3MtYnJvd3N3ZXItY29tcGF0aWJsZSB3YXkuXG4gKlxuICogY3JlYXRlRXZlbnQgZnVuY3Rpb25hbGl0eSBpcyBvZmZpY2lhbGx5IGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2ZcbiAqIHRoZSBFdmVudCBjb25zdHJ1Y3RvciwgYnV0IHNvbWUgb2xkZXIgYnJvd3NlcnMgZG8gbm90IHlldCBzdXBwb3J0XG4gKiBldmVudCBjb25zdHJ1Y3RvcnMuIEF0dGVtcHQgdG8gdXNlIHRoZSBuZXcgZnVuY3Rpb25hbGl0eSwgZmFsbFxuICogYmFjayB0byB0aGUgb2xkIGlmIGl0IGZhaWxzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtidWJibGVzPWZhbHNlXVxuICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsYWJsZT1mYWxzZV1cbiAqL1xuXG5cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50KHR5cGUpIHtcbiAgdmFyIGJ1YmJsZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICB2YXIgY2FuY2VsYWJsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gIHZhciBjdXN0b21FdmVudDtcblxuICB0cnkge1xuICAgIGN1c3RvbUV2ZW50ID0gbmV3IEV2ZW50KHR5cGUsIHtcbiAgICAgIGJ1YmJsZXM6IGJ1YmJsZXMsXG4gICAgICBjYW5jZWxhYmxlOiBjYW5jZWxhYmxlXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjdXN0b21FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIGN1c3RvbUV2ZW50LmluaXRFdmVudCh0eXBlLCBidWJibGVzLCBjYW5jZWxhYmxlKTtcbiAgfVxuXG4gIHJldHVybiBjdXN0b21FdmVudDtcbn1cbi8qKlxuICogQHBhcmFtIHtPYmplY3R9IHZlY3RvciB3aXRoIHggYW5kIHkgY29vcmRpbmF0ZXNcbiAqIEByZXR1cm5zIHtPYmplY3R9IHZlY3RvciB3aXRoIHggYW5kIHkgY29vcmRpbmF0ZXMgYW5kIGxlbmd0aCAxIChvciAwIGlmXG4gKiAgIHRoZSBhcmd1bWVudCBhbHNvIGhhZCBsZW5ndGggMClcbiAqL1xuXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZSh2ZWN0b3IpIHtcbiAgdmFyIG1hZyA9IE1hdGguc3FydCh2ZWN0b3IueCAqIHZlY3Rvci54ICsgdmVjdG9yLnkgKiB2ZWN0b3IueSk7XG5cbiAgaWYgKG1hZyA9PT0gMCkge1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHg6IHZlY3Rvci54IC8gbWFnLFxuICAgIHk6IHZlY3Rvci55IC8gbWFnXG4gIH07XG59XG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NpdGlvbiBzZWxlY3RlZCBmcm9tIGNvbnN0YW50cy5Qb3NpdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IGNvbnRhaW5lcldpZHRoIHdpZHRoIG9mIHRoZSBlbGVtZW50IHdlIGFyZVxuICogICAgICAgIHBvc2l0aW9uaW5nIHdpdGhpblxuICogQHBhcmFtIHtudW1iZXJ9IHNwcml0ZVdpZHRoIHdpZHRoIG9mIHRoZSBlbGVtZW50IGJlaW5nIHBvc2l0aW9uZWRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGxlZnQtbW9zdCBwb2ludCBvZiBzcHJpdGUgZ2l2ZW4gcG9zaXRpb24gY29uc3RhbnRcbiAqL1xuXG5cbmZ1bmN0aW9uIHhGcm9tUG9zaXRpb24ocG9zaXRpb24pIHtcbiAgdmFyIGNvbnRhaW5lcldpZHRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICB2YXIgc3ByaXRlV2lkdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDA7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRUT1BPVVRMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5UT1BPVVRMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5NSURETEVPVVRMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5CT1RUT01PVVRMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRCT1RUT01PVVRMRUZUOlxuICAgICAgcmV0dXJuIC1zcHJpdGVXaWR0aDtcblxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRUT1BMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5UT1BMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5NSURETEVMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5CT1RUT01MRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRCT1RUT01MRUZUOlxuICAgICAgcmV0dXJuIDA7XG5cbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUVE9QQ0VOVEVSOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5UT1BDRU5URVI6XG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLk1JRERMRUNFTlRFUjpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uQk9UVE9NQ0VOVEVSOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRCT1RUT01DRU5URVI6XG4gICAgICByZXR1cm4gKGNvbnRhaW5lcldpZHRoIC0gc3ByaXRlV2lkdGgpIC8gMjtcblxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRUT1BSSUdIVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uVE9QUklHSFQ6XG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLk1JRERMRVJJR0hUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5CT1RUT01SSUdIVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUQk9UVE9NUklHSFQ6XG4gICAgICByZXR1cm4gY29udGFpbmVyV2lkdGggLSBzcHJpdGVXaWR0aDtcblxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRUT1BPVVRSSUdIVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uVE9QT1VUUklHSFQ6XG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLk1JRERMRU9VVFJJR0hUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5CT1RUT01PVVRSSUdIVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUQk9UVE9NT1VUUklHSFQ6XG4gICAgICByZXR1cm4gY29udGFpbmVyV2lkdGg7XG4gIH1cbn1cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uIHNlbGVjdGVkIGZyb20gY29uc3RhbnRzLlBvc2l0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gY29udGFpbmVySGVpZ2h0IGhlaWdodCBvZiB0aGUgZWxlbWVudCB3ZSBhcmVcbiAqICAgICAgICBwb3NpdGlvbmluZyB3aXRoaW5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzcHJpdGVIZWlnaHQgaGVpZ2h0IG9mIHRoZSBlbGVtZW50IGJlaW5nIHBvc2l0aW9uZWRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRvcC1tb3N0IHBvaW50IG9mIHNwcml0ZSBnaXZlbiBwb3NpdGlvbiBjb25zdGFudFxuICovXG5cblxuZnVuY3Rpb24geUZyb21Qb3NpdGlvbihwb3NpdGlvbikge1xuICB2YXIgY29udGFpbmVySGVpZ2h0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICB2YXIgc3ByaXRlSGVpZ2h0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAwO1xuXG4gIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUVE9QT1VUTEVGVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUVE9QTEVGVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUVE9QQ0VOVEVSOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRUT1BSSUdIVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUVE9QT1VUUklHSFQ6XG4gICAgICByZXR1cm4gLXNwcml0ZUhlaWdodDtcblxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5UT1BPVVRMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5UT1BMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5UT1BDRU5URVI6XG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLlRPUFJJR0hUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5UT1BPVVRSSUdIVDpcbiAgICAgIHJldHVybiAwO1xuXG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLk1JRERMRU9VVExFRlQ6XG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLk1JRERMRUxFRlQ6XG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLk1JRERMRUNFTlRFUjpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uTUlERExFUklHSFQ6XG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLk1JRERMRU9VVFJJR0hUOlxuICAgICAgcmV0dXJuIChjb250YWluZXJIZWlnaHQgLSBzcHJpdGVIZWlnaHQpIC8gMjtcblxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5CT1RUT01PVVRMRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5CT1RUT01MRUZUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5CT1RUT01DRU5URVI6XG4gICAgY2FzZSBfY29uc3RhbnRzLlBvc2l0aW9uLkJPVFRPTVJJR0hUOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5CT1RUT01PVVRSSUdIVDpcbiAgICAgIHJldHVybiBjb250YWluZXJIZWlnaHQgLSBzcHJpdGVIZWlnaHQ7XG5cbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUQk9UVE9NT1VUTEVGVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUQk9UVE9NTEVGVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUQk9UVE9NQ0VOVEVSOlxuICAgIGNhc2UgX2NvbnN0YW50cy5Qb3NpdGlvbi5PVVRCT1RUT01SSUdIVDpcbiAgICBjYXNlIF9jb25zdGFudHMuUG9zaXRpb24uT1VUQk9UVE9NT1VUUklHSFQ6XG4gICAgICByZXR1cm4gY29udGFpbmVySGVpZ2h0O1xuICB9XG59XG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgTGV2ZW5zaHRlaW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gc3RyaW5nc1xuICogQHBhcmFtIHtzdHJpbmd9IGFcbiAqIEBwYXJhbSB7c3RyaW5nfSBiXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGRpc3RhbmNlXG4gKi9cblxuXG5mdW5jdGlvbiBsZXZlbnNodGVpbihhLCBiKSB7XG4gIGlmICghYSB8fCAhYikge1xuICAgIHJldHVybiAoYSB8fCBiKS5sZW5ndGg7XG4gIH1cblxuICB2YXIgbWF0cml4ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gYi5sZW5ndGg7IGkrKykge1xuICAgIG1hdHJpeFtpXSA9IFtpXTtcblxuICAgIGlmIChpID09PSAwKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8PSBhLmxlbmd0aDsgaisrKSB7XG4gICAgICBtYXRyaXhbMF1bal0gPSBqO1xuXG4gICAgICBpZiAoaiA9PT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbWF0cml4W2ldW2pdID0gYi5jaGFyQXQoaSAtIDEpID09PSBhLmNoYXJBdChqIC0gMSkgPyBtYXRyaXhbaSAtIDFdW2ogLSAxXSA6IE1hdGgubWluKG1hdHJpeFtpIC0gMV1baiAtIDFdICsgMSwgbWF0cml4W2ldW2ogLSAxXSArIDEsIG1hdHJpeFtpIC0gMV1bal0gKyAxKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0cml4W2IubGVuZ3RoXVthLmxlbmd0aF07XG59XG4vKipcbiAqIEJpc2VjdHMgdGhlIGdpdmVuIGFycmF5IGJhc2VkIG9uIHRoZSBnaXZlbiBjb25kaXRpb25hbFxuICogQHBhcmFtIHtBcnJheX0gYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbmRpdGlvbmFsXG4gKiBAcmV0dXJuIHtBcnJheS48QXJyYXk+fSBhbiBhcnJheSB3aXRoIHR3byBlbGVtZW50czsgdGhlIGZpcnN0IGlzIGFuXG4gKiAgICAgICAgIGFycmF5IGNvbnRhaW5pbmcgdGhvc2UgdmFsdWVzIGZvciB3aGljaCB0aGUgZ2l2ZW4gY29uZGl0aW9uYWxcbiAqICAgICAgICAgZnVuY3Rpb24gaXMgdHJ1ZSBhbmQgdGhlIHNlY29uZCBpcyBhbiBhcnJheSBjb250YWluaW5nIHRob3NlXG4gKiAgICAgICAgIHZhbHVlcyBmb3Igd2hpY2ggaXQgaXMgZmFsc2VcbiAqL1xuXG5cbmZ1bmN0aW9uIGJpc2VjdChhcnJheSwgY29uZGl0aW9uYWwpIHtcbiAgdmFyIHBvc2l0aXZlID0gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIGNvbmRpdGlvbmFsKHgpO1xuICB9KTtcbiAgdmFyIG5lZ2F0aXZlID0gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuICFjb25kaXRpb25hbCh4KTtcbiAgfSk7XG4gIHJldHVybiBbcG9zaXRpdmUsIG5lZ2F0aXZlXTtcbn1cbi8qKlxuICogUmVjdXJzaXZlbHkgZmxhdHRlbiB0aGUgZ2l2ZW4gYXJyYXlcbiAqIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE1MDMwMTE3LzE4MTA0NjBcbiAqL1xuXG5cbmZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAoZmxhdCwgdG9GbGF0dGVuKSB7XG4gICAgcmV0dXJuIGZsYXQuY29uY2F0KEFycmF5LmlzQXJyYXkodG9GbGF0dGVuKSA/IGZsYXR0ZW4odG9GbGF0dGVuKSA6IHRvRmxhdHRlbik7XG4gIH0sIFtdKTtcbn1cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgd3JhcHMgd2luZG93LmxvY2F0aW9uLnJlbG9hZCwgd2hpY2ggd2UgY2Fubm90IHN0dWJcbiAqIGluIHVuaXQgdGVzdHMgaWYgd2UncmUgcnVubmluZyB0aGVtIGluIENocm9tZS5cbiAqL1xuXG5cbmZ1bmN0aW9uIHJlbG9hZCgpIHtcbiAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xufVxuXG5mdW5jdGlvbiBjdXJyZW50TG9jYXRpb24oKSB7XG4gIHJldHVybiB3aW5kb3cubG9jYXRpb247XG59XG4vKipcbiAqIEhlbHBlciB0aGF0IHdyYXBzIHdpbmRvdy5vcGVuLCBmb3Igc3R1YmJpbmcgaW4gdW5pdCB0ZXN0cy5cbiAqL1xuXG5cbmZ1bmN0aW9uIHdpbmRvd09wZW4oKSB7XG4gIHZhciBfd2luZG93O1xuXG4gIHJldHVybiAoX3dpbmRvdyA9IHdpbmRvdykub3Blbi5hcHBseShfd2luZG93LCBhcmd1bWVudHMpO1xufVxuLyoqXG4gKiBXcmFwcGVyIGZvciB3aW5kb3cubG9jYXRpb24uaHJlZiB3aGljaCB3ZSBjYW4gc3R1YiBpbiB1bml0IHRlc3RzLlxuICogQHBhcmFtIHtzdHJpbmd9IGhyZWYgTG9jYXRpb24gdG8gbmF2aWdhdGUgdG8uXG4gKi9cblxuXG5mdW5jdGlvbiBuYXZpZ2F0ZVRvSHJlZihocmVmKSB7XG4gIGlmICghSU5fVU5JVF9URVNUKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICB9XG59XG4vKipcbiAqIFRha2VzIGEgc2ltcGxlIG9iamVjdCBhbmQgcmV0dXJucyBpdCByZXByZXNlbnRlZCBhcyBhIGNoYWluIG9mIHVybCBxdWVyeVxuICogcGFyYW1zLCBpbmNsdWRpbmcgPyBhbmQgJiBhcyBuZWNlc3NhcnkuIERvZXMgbm90IHBlcmZvcm0gZXNjYXBpbmcuIEV4YW1wbGVzOlxuICoge30gLT4gJydcbiAqIHthOiAxfSAtPiAnP2E9MSdcbiAqIHthOiAxLCBiOiAnYyd9IC0+ICc/YT0xJmI9YydcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIE9iamVjdCB0byBzdHJpbmdpZnkuXG4gKi9cblxuXG5mdW5jdGlvbiBzdHJpbmdpZnlRdWVyeVBhcmFtcyhwYXJhbXMpIHtcbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHBhcmFtcyk7XG5cbiAgaWYgKCFrZXlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHJldHVybiAnPycgKyBrZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIFwiXCIuY29uY2F0KGtleSwgXCI9XCIpLmNvbmNhdChwYXJhbXNba2V5XSk7XG4gIH0pLmpvaW4oJyYnKTtcbn1cbi8qKlxuICogVGFrZXMgYSBsaW5rLCBsb29rcyBmb3IgcGFyYW1zIGFscmVhZHkgaW4gdGhlIGN1cnJlbnQgVVJMXG4gKiBhbmQgZ2VuZXJhdGVzIGEgbmV3IGxpbmsgd2l0aCB0aG9zZSBwYXJhbXNcbiAqL1xuXG5cbmZ1bmN0aW9uIGxpbmtXaXRoUXVlcnlQYXJhbXMobGluaykge1xuICB2YXIgcXVlcnlQYXJhbXMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoIHx8ICcnO1xuICByZXR1cm4gbGluayArIHF1ZXJ5UGFyYW1zO1xufVxuLyoqXG4gKiBSZXNldHMgdGhlIGFuaW1hdGlvbiBvZiBhbiBhbmlHaWYgYnkgdW5zZXR0aW5nIGFuZCBzZXR0aW5nIHRoZSBzcmNcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCB0aGUgPGltZz4gZWxlbWVudCB0aGF0IG5lZWRzIHRvIGJlIHJlc2V0XG4gKi9cblxuXG5mdW5jdGlvbiByZXNldEFuaUdpZihlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzcmMgPSBlbGVtZW50LnNyYztcbiAgZWxlbWVudC5zcmMgPSAnIyc7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBlbGVtZW50LnNyYyA9IHNyYztcbiAgfSwgMCk7XG59XG4vKipcbiAqIENvbXB1dGUgYSBjb2xvciBhbiBhcmJpdHJhcnkgZGlzdGFuY2UgYmV0d2VlbiBmcm9tIGFuZCB0bywgdXNlZnVsIGZvclxuICogcmVhY3QtbW90aW9uIGJhc2VkIGNvbG9yIHRyYW5zaXRpb25zLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tIGEgaGV4IGNvbG9yIHN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IHRvIGFub3RoZXIgaGV4IGNvbG9yIHN0cmluZ1xuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMSwgZXhwcmVzc2luZyBob3cgZmFyIGFsb25nXG4gKiAgIHRoZSB3YXkgZnJvbSAnZnJvbScgdG8gJ3RvJyB0aGUgcmV0dXJuZWQgY29sb3Igc2hvdWxkIGJlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBhIGNvbG9yIGJldHdlZW4gZnJvbSBhbmQgdG9cbiAqL1xuXG5cbmZ1bmN0aW9uIGludGVycG9sYXRlQ29sb3JzKGZyb20sIHRvLCB2YWx1ZSkge1xuICB2YXIgZnJvbVJHQiA9IG5ldyBfcmdiY29sb3JbXCJkZWZhdWx0XCJdKGZyb20pO1xuICB2YXIgdG9SR0IgPSBuZXcgX3JnYmNvbG9yW1wiZGVmYXVsdFwiXSh0byk7XG4gIHZhciByID0gZnJvbVJHQi5yICogKDEgLSB2YWx1ZSkgKyB0b1JHQi5yICogdmFsdWU7XG4gIHZhciBnID0gZnJvbVJHQi5nICogKDEgLSB2YWx1ZSkgKyB0b1JHQi5nICogdmFsdWU7XG4gIHZhciBiID0gZnJvbVJHQi5iICogKDEgLSB2YWx1ZSkgKyB0b1JHQi5iICogdmFsdWU7XG4gIHJldHVybiBcInJnYihcIi5jb25jYXQociwgXCIsIFwiKS5jb25jYXQoZywgXCIsIFwiKS5jb25jYXQoYiwgXCIpXCIpO1xufVxuLyoqXG4gKiBSZXR1cm4gYSByYW5kb20gaWQgd2hpY2ggd2lsbCBiZSBjb25zaXN0ZW50IGZvciB0aGlzIGJyb3dzZXIgdGFiIG9yIHdpbmRvdyBhcyBsb25nIGFzIGl0IHJlbWFpbnNcbiAqIG9wZW4sIGluY2x1ZGluZyBpZiB0aGlzIHBhZ2UgaXMgcmVsb2FkZWQgb3IgaWYgd2UgbmF2aWdhdGUgYXdheSBhbmQgdGhlbiBiYWNrIHRvIGl0LiBUaGUgaWQgd2lsbFxuICogYmUgZGlmZmVyZW50IGZvciBvdGhlciB0YWJzLCBpbmNsdWRpbmcgdGFicyBpbiBvdGhlciBicm93c2VycyBvciBvbiBvdGhlciBtYWNoaW5lcy4gVW5mb3J0dW5hdGVseSxcbiAqIGR1cGxpY2F0aW5nIGEgYnJvd3NlciB0YWIgd2lsbCByZXN1bHQgaW4gdHdvIHRhYnMgd2l0aCB0aGUgc2FtZSBpZCwgYnV0IHRoaXMgaXMgbm90IGNvbW1vbi5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRpbmcgYSBmbG9hdCBiZXR3ZWVuIDAgYW5kIDEuXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUYWJJZCgpIHtcbiAgdmFyIHRhYklkID0gdHJ5R2V0U2Vzc2lvblN0b3JhZ2UoJ3RhYklkJywgZmFsc2UpO1xuXG4gIGlmICh0YWJJZCkge1xuICAgIHJldHVybiB0YWJJZDtcbiAgfVxuXG4gIHRyeVNldFNlc3Npb25TdG9yYWdlKCd0YWJJZCcsIE1hdGgucmFuZG9tKCkgKyAnJyk7XG4gIHJldHVybiB0cnlHZXRTZXNzaW9uU3RvcmFnZSgndGFiSWQnLCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhpZGRlblByaW50V2luZG93KHNyYykge1xuICAoMCwgX2ltYWdlVXRpbHMuZGF0YVVSSUZyb21VUkkpKHNyYykudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciBpZnJhbWUgPSAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCc8aWZyYW1lIHN0eWxlPVwicG9zaXRpb246IGFic29sdXRlOyB2aXNpYmlsaXR5OiBoaWRkZW47XCI+PC9pZnJhbWU+Jyk7IC8vIENyZWF0ZWQgYSBoaWRkZW4gaWZyYW1lIHdpdGgganVzdCB0aGUgZGVzaXJlZCBpbWFnZSBhcyBpdHMgY29udGVudHNcblxuICAgIGlmcmFtZS5hcHBlbmRUbygnYm9keScpO1xuICAgIGlmcmFtZVswXS5jb250ZW50V2luZG93LmRvY3VtZW50LndyaXRlKFwiPGltZyBzcmM9XFxcIlwiLmNvbmNhdChkYXRhLCBcIlxcXCIgc3R5bGU9XFxcImJvcmRlcjogMXB4IHNvbGlkICMwMDA7XFxcIiBvbmxvYWQ9XFxcImlmIChkb2N1bWVudC5leGVjQ29tbWFuZCgncHJpbnQnLCBmYWxzZSwgbnVsbCkpIHsgIH0gZWxzZSB7IHdpbmRvdy5wcmludCgpOyB9XFxcIi8+XCIpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZU9mZnNldENvb3JkaW5hdGVzKGVsZW1lbnQsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHg6IE1hdGgucm91bmQoKGNsaWVudFggLSByZWN0LmxlZnQpICogZWxlbWVudC5vZmZzZXRXaWR0aCAvIHJlY3Qud2lkdGgpLFxuICAgIHk6IE1hdGgucm91bmQoKGNsaWVudFkgLSByZWN0LnRvcCkgKiBlbGVtZW50Lm9mZnNldEhlaWdodCAvIHJlY3QuaGVpZ2h0KVxuICB9O1xufVxuLyoqXG4gKiBEZXRlY3RzIHByb2Zhbml0eSBpbiBhIHN0cmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxlIE9wdGlvbmFsLlxuICogQHBhcmFtIHtzdHJpbmd9IGF1dGhlbnRpY2l0eVRva2VuIFJhaWxzIGF1dGhlbnRpY2l0eSB0b2tlbi4gT3B0aW9uYWwuXG4gKiBAcmV0dXJucyB7QXJyYXk8c3RyaW5nPnxudWxsfSBBcnJheSBvZiBwcm9mYW5lIHdvcmRzLlxuICovXG5cblxudmFyIGZpbmRQcm9mYW5pdHkgPSBmdW5jdGlvbiBmaW5kUHJvZmFuaXR5KHRleHQsIGxvY2FsZSkge1xuICB2YXIgYXV0aGVudGljaXR5VG9rZW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG4gIHZhciByZXF1ZXN0ID0ge1xuICAgIHVybDogJy9wcm9mYW5pdHkvZmluZCcsXG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnLFxuICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIHRleHQ6IHRleHQsXG4gICAgICBsb2NhbGU6IGxvY2FsZVxuICAgIH0pXG4gIH07XG5cbiAgaWYgKGF1dGhlbnRpY2l0eVRva2VuKSB7XG4gICAgcmVxdWVzdC5oZWFkZXJzID0ge1xuICAgICAgJ1gtQ1NSRi1Ub2tlbic6IGF1dGhlbnRpY2l0eVRva2VuXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfanF1ZXJ5W1wiZGVmYXVsdFwiXS5hamF4KHJlcXVlc3QpO1xufTtcbi8qKlxuICogQ29udmVydCBhIHN0cmluZyB0byBhbiBNRDUgaGFzaC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGluZyBhbiBNRDUgaGFzaC5cbiAqL1xuXG5cbmV4cG9ydHMuZmluZFByb2Zhbml0eSA9IGZpbmRQcm9mYW5pdHk7XG5cbmZ1bmN0aW9uIGhhc2hTdHJpbmcoc3RyKSB7XG4gIHJldHVybiAoMCwgX21kW1wiZGVmYXVsdFwiXSkoc3RyKS50b1N0cmluZygpO1xufVxuLypcbiAqIEFkZCB0b29sdGlwIHRvZ2dsZXMgdG8gdm9jYWJ1bGFyeSBkZWZpbml0aW9ucywgYXMgZ2VuZXJhdGVkIGJ5IHRoZVxuICogTWFya2Rvd25QcmVwcm9jZXNzb3JcbiAqIEBzZWUgaHR0cHM6Ly9nZXRib290c3RyYXAuY29tLzIuMy4yL2phdmFzY3JpcHQuaHRtbCN0b29sdGlwc1xuICovXG5cblxuZnVuY3Rpb24gdG9vbHRpcGlmeVZvY2FidWxhcnkoKSB7XG4gICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJy52b2NhYicpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkodGhpcykudG9vbHRpcCh7XG4gICAgICBwbGFjZW1lbnQ6ICdib3R0b20nXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjb250YWluc0F0TGVhc3RPbmVBbHBoYU51bWVyaWMoc3RyaW5nKSB7XG4gIHJldHVybiAvXi4qW2EtekEtWjAtOcOow6DDucOsw7LDiMOAw5LDmcOMw6nDocO6w63Ds8OJw4HDmsONw5PDq8Okw7zDr8O2w4vDhMOcw4/DlsOqw6LDu8Ouw7TDisOCw5vDjsOUw6cnLV0rLiokLy50ZXN0KHN0cmluZyk7XG59Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUN2dkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQzNRQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBLGFBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDeFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQ3RiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUMxaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUlBOzs7Ozs7Ozs7Ozs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDNU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUM1Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDeFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUMzVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3gzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBIiwic291cmNlUm9vdCI6IiJ9
;
