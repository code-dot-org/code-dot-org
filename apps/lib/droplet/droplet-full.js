/* Droplet.
 * Copyright (c) 2016 Anthony Bau.
 * MIT License.
 *
 * Date: 2016-03-29
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.droplet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":4,"ieee754":5,"isarray":6}],4:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],5:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],6:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],8:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],9:[function(require,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],10:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],11:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
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
    var timeout = setTimeout(cleanUpNextTick);
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
    clearTimeout(timeout);
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
        setTimeout(drainQueue, 0);
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

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
module.exports = require("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":13}],13:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
/*</replacement>*/


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

forEach(objectKeys(Writable.prototype), function(method) {
  if (!Duplex.prototype[method])
    Duplex.prototype[method] = Writable.prototype[method];
});

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(this.end.bind(this));
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

}).call(this,require('_process'))
},{"./_stream_readable":15,"./_stream_writable":17,"_process":11,"core-util-is":18,"inherits":8}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":16,"core-util-is":18,"inherits":8}],15:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;

/*<replacement>*/
if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

var Stream = require('stream');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var StringDecoder;


/*<replacement>*/
var debug = require('util');
if (debug && debug.debuglog) {
  debug = debug.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/


util.inherits(Readable, Stream);

function ReadableState(options, stream) {
  var Duplex = require('./_stream_duplex');

  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.readableObjectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  var Duplex = require('./_stream_duplex');

  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (util.isString(chunk) && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (util.isNullOrUndefined(chunk)) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      if (!addToFront)
        state.reading = false;

      // if we want the data now, just emit it.
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit('data', chunk);
        stream.read(0);
      } else {
        // update the buffer info.
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);

        if (state.needReadable)
          emitReadable(stream);
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (isNaN(n) || util.isNull(n)) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  debug('read', n);
  var state = this._readableState;
  var nOrig = n;

  if (!util.isNumber(n) || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended)
      endReadable(this);
    else
      emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  }

  if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read pushed data synchronously, then `reading` will be false,
  // and we need to re-evaluate how much data we can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (util.isNull(ret)) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we tried to read() past the EOF, then emit end on the next tick.
  if (nOrig !== n && state.ended && state.length === 0)
    endReadable(this);

  if (!util.isNull(ret))
    this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!util.isBuffer(chunk) &&
      !util.isString(chunk) &&
      !util.isNullOrUndefined(chunk) &&
      !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync)
      process.nextTick(function() {
        emitReadable_(stream);
      });
    else
      emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    process.nextTick(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain &&
        (!dest._writableState || dest._writableState.needDrain))
      ondrain();
  }

  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    if (false === ret) {
      debug('false write response, pause',
            src._readableState.awaitDrain);
      src._readableState.awaitDrain++;
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS.
  if (!dest._events || !dest._events.error)
    dest.on('error', onerror);
  else if (isArray(dest._events.error))
    dest._events.error.unshift(onerror);
  else
    dest._events.error = [onerror, dest._events.error];



  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain)
      state.awaitDrain--;
    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  // If listening to data, and it has not explicitly been paused,
  // then call resume to start the flow of data on the next tick.
  if (ev === 'data' && false !== this._readableState.flowing) {
    this.resume();
  }

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        var self = this;
        process.nextTick(function() {
          debug('readable nexttick read 0');
          self.read(0);
        });
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    if (!state.reading) {
      debug('resume read 0');
      this.read(0);
    }
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(function() {
      resume_(stream, state);
    });
  }
}

function resume_(stream, state) {
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading)
    stream.read(0);
}

Readable.prototype.pause = function() {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  if (state.flowing) {
    do {
      var chunk = stream.read();
    } while (null !== chunk && state.flowing);
  }
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    debug('wrapped data');
    if (state.decoder)
      chunk = state.decoder.write(chunk);
    if (!chunk || !state.objectMode && !chunk.length)
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'))
},{"./_stream_duplex":13,"_process":11,"buffer":3,"core-util-is":18,"events":7,"inherits":8,"isarray":10,"stream":23,"string_decoder/":24,"util":2}],16:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (!util.isNullOrUndefined(data))
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('prefinish', function() {
    if (util.isFunction(this._flush))
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":13,"core-util-is":18,"inherits":8}],17:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;

/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Writable.WritableState = WritableState;


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Stream = require('stream');

util.inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  var Duplex = require('./_stream_duplex');

  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.writableObjectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;
}

function Writable(options) {
  var Duplex = require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  process.nextTick(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!util.isBuffer(chunk) &&
      !util.isString(chunk) &&
      !util.isNullOrUndefined(chunk) &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    process.nextTick(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (util.isFunction(encoding)) {
    cb = encoding;
    encoding = null;
  }

  if (util.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (!util.isFunction(cb))
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function() {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function() {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing &&
        !state.corked &&
        !state.finished &&
        !state.bufferProcessing &&
        state.buffer.length)
      clearBuffer(this, state);
  }
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      util.isString(chunk)) {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  if (util.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing || state.corked)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, false, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev)
    stream._writev(chunk, state.onwrite);
  else
    stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    process.nextTick(function() {
      state.pendingcb--;
      cb(er);
    });
  else {
    state.pendingcb--;
    cb(er);
  }

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished &&
        !state.corked &&
        !state.bufferProcessing &&
        state.buffer.length) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  if (stream._writev && state.buffer.length > 1) {
    // Fast case, write everything using _writev()
    var cbs = [];
    for (var c = 0; c < state.buffer.length; c++)
      cbs.push(state.buffer[c].callback);

    // count the one we are adding, as well.
    // TODO(isaacs) clean this up
    state.pendingcb++;
    doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
      for (var i = 0; i < cbs.length; i++) {
        state.pendingcb--;
        cbs[i](err);
      }
    });

    // Clear buffer
    state.buffer = [];
  } else {
    // Slow case, write chunks one-by-one
    for (var c = 0; c < state.buffer.length; c++) {
      var entry = state.buffer[c];
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);

      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        c++;
        break;
      }
    }

    if (c < state.buffer.length)
      state.buffer = state.buffer.slice(c);
    else
      state.buffer.length = 0;
  }

  state.bufferProcessing = false;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));

};

Writable.prototype._writev = null;

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (util.isFunction(chunk)) {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (util.isFunction(encoding)) {
    cb = encoding;
    encoding = null;
  }

  if (!util.isNullOrUndefined(chunk))
    this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else
      prefinish(stream, state);
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      process.nextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

}).call(this,require('_process'))
},{"./_stream_duplex":13,"_process":11,"buffer":3,"core-util-is":18,"inherits":8,"stream":23}],18:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../../../insert-module-globals/node_modules/is-buffer/index.js")})
},{"../../../../insert-module-globals/node_modules/is-buffer/index.js":9}],19:[function(require,module,exports){
module.exports = require("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":14}],20:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = require('stream');
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":13,"./lib/_stream_passthrough.js":14,"./lib/_stream_readable.js":15,"./lib/_stream_transform.js":16,"./lib/_stream_writable.js":17,"stream":23}],21:[function(require,module,exports){
module.exports = require("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":16}],22:[function(require,module,exports){
module.exports = require("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":17}],23:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":7,"inherits":8,"readable-stream/duplex.js":12,"readable-stream/passthrough.js":19,"readable-stream/readable.js":20,"readable-stream/transform.js":21,"readable-stream/writable.js":22}],24:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":3}],25:[function(require,module,exports){
(function (Buffer){
;(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
  sax.SAXParser = SAXParser
  sax.SAXStream = SAXStream
  sax.createStream = createStream

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ]

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ]

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this
    clearBuffers(parser)
    parser.q = parser.c = ''
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
    parser.opt = opt || {}
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    parser.tags = []
    parser.closed = parser.closedRoot = parser.sawRoot = false
    parser.tag = parser.error = null
    parser.strict = !!strict
    parser.noscript = !!(strict || parser.opt.noscript)
    parser.state = S.BEGIN
    parser.strictEntities = parser.opt.strictEntities
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    parser.attribList = []

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS)
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0
    }
    emit(parser, 'onready')
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o
      var newf = new F()
      return newf
    }
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = []
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
      return a
    }
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    var maxActual = 0
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser)
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual
    parser.bufferCheckPosition = m + parser.position
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = ''
    }
  }

  function flushBuffers (parser) {
    closeText(parser)
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata)
      parser.cdata = ''
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }
  }

  SAXParser.prototype = {
    end: function () { end(this) },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this) }
  }

  var Stream
  try {
    Stream = require('stream').Stream
  } catch (ex) {
    Stream = function () {}
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  })

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this)

    this._parser = new SAXParser(strict, opt)
    this.writable = true
    this.readable = true

    var me = this

    this._parser.onend = function () {
      me.emit('end')
    }

    this._parser.onerror = function (er) {
      me.emit('error', er)

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null
    }

    this._decoder = null

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev)
            me._parser['on' + ev] = h
            return h
          }
          me.on(ev, h)
        },
        enumerable: true,
        configurable: false
      })
    })
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  })

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require('string_decoder').StringDecoder
        this._decoder = new SD('utf8')
      }
      data = this._decoder.write(data)
    }

    this._parser.write(data.toString())
    this.emit('data', data)
    return true
  }

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk)
    }
    this._parser.end()
    return true
  }

  SAXStream.prototype.on = function (ev, handler) {
    var me = this
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
        args.splice(0, 0, ev)
        me.emit.apply(me, args)
      }
    }

    return Stream.prototype.on.call(me, ev, handler)
  }

  // character classes and tokens
  var whitespace = '\r\n\t '

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var number = '0124356789'
  var letter = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  // (Letter | "_" | ":")
  var quote = '\'"'
  var attribEnd = whitespace + '>'
  var CDATA = '[CDATA['
  var DOCTYPE = 'DOCTYPE'
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

  // turn all the string character sets into character class objects.
  whitespace = charClass(whitespace)
  number = charClass(number)
  letter = charClass(letter)

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/

  quote = charClass(quote)
  attribEnd = charClass(attribEnd)

  function charClass (str) {
    return str.split('').reduce(function (s, c) {
      s[c] = true
      return s
    }, {})
  }

  function isRegExp (c) {
    return Object.prototype.toString.call(c) === '[object RegExp]'
  }

  function is (charclass, c) {
    return isRegExp(charclass) ? !!c.match(charclass) : charclass[c]
  }

  function not (charclass, c) {
    return !is(charclass, c)
  }

  var S = 0
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  }

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  }

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  }

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key]
    var s = typeof e === 'number' ? String.fromCharCode(e) : e
    sax.ENTITIES[key] = s
  })

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s
  }

  // shorthand
  S = sax.STATE

  function emit (parser, event, data) {
    parser[event] && parser[event](data)
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser)
    emit(parser, nodeType, data)
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode)
    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
    parser.textNode = ''
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim()
    if (opt.normalize) text = text.replace(/\s+/g, ' ')
    return text
  }

  function error (parser, er) {
    closeText(parser)
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c
    }
    er = new Error(er)
    parser.error = er
    emit(parser, 'onerror', er)
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end')
    }
    closeText(parser)
    parser.c = ''
    parser.closed = true
    emit(parser, 'onend')
    SAXParser.call(parser, parser.strict, parser.opt)
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message)
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
    var parent = parser.tags[parser.tags.length - 1] || parser
    var tag = parser.tag = { name: parser.tagName, attributes: {} }

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns
    }
    parser.attribList.length = 0
    emitNode(parser, 'onopentagstart', tag)
  }

  function qname (name, attribute) {
    var i = name.indexOf(':')
    var qualName = i < 0 ? [ '', name ] : name.split(':')
    var prefix = qualName[0]
    var local = qualName[1]

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns'
      local = ''
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]()
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = ''
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true)
      var prefix = qn.prefix
      var local = qn.local

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else {
          var tag = parser.tag
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns)
          }
          tag.ns[local] = parser.attribValue
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue])
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      })
    }

    parser.attribName = parser.attribValue = ''
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag

      // add namespace info to tag
      var qn = qname(parser.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName))
        tag.uri = qn.prefix
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          })
        })
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i]
        var name = nv[0]
        var value = nv[1]
        var qualName = qname(name, true)
        var prefix = qualName.prefix
        var local = qualName.local
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        }

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix))
          a.uri = prefix
        }
        parser.tag.attributes[name] = a
        emitNode(parser, 'onattribute', a)
      }
      parser.attribList.length = 0
    }

    parser.tag.isSelfClosing = !!selfClosing

    // process the tag
    parser.sawRoot = true
    parser.tags.push(parser.tag)
    emitNode(parser, 'onopentag', parser.tag)
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT
      } else {
        parser.state = S.TEXT
      }
      parser.tag = null
      parser.tagName = ''
    }
    parser.attribName = parser.attribValue = ''
    parser.attribList.length = 0
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.')
      parser.textNode += '</>'
      parser.state = S.TEXT
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>'
        parser.tagName = ''
        parser.state = S.SCRIPT
        return
      }
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length
    var tagName = parser.tagName
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]()
    }
    var closeTo = tagName
    while (t--) {
      var close = parser.tags[t]
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag')
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
      parser.textNode += '</' + parser.tagName + '>'
      parser.state = S.TEXT
      return
    }
    parser.tagName = tagName
    var s = parser.tags.length
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop()
      parser.tagName = parser.tag.name
      emitNode(parser, 'onclosetag', parser.tagName)

      var x = {}
      for (var i in tag.ns) {
        x[i] = tag.ns[i]
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p]
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) parser.closedRoot = true
    parser.tagName = parser.attribValue = parser.attribName = ''
    parser.attribList.length = 0
    parser.state = S.TEXT
  }

  function parseEntity (parser) {
    var entity = parser.entity
    var entityLC = entity.toLowerCase()
    var num
    var numStr = ''

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity')
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA
      parser.startTagPosition = parser.position
    } else if (not(whitespace, c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.')
      parser.textNode = c
      parser.state = S.TEXT
    }
  }

  function charAt (chunk, i) {
    var result = ''
    if (i < chunk.length) {
      result = chunk.charAt(i)
    }
    return result
  }

  function write (chunk) {
    var parser = this
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString()
    }
    var i = 0
    var c = ''
    while (true) {
      c = charAt(chunk, i++)
      parser.c = c
      if (!c) {
        break
      }
      if (parser.trackPosition) {
        parser.position++
        if (c === '\n') {
          parser.line++
          parser.column = 0
        } else {
          parser.column++
        }
      }
      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c)
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c)
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if (c && parser.trackPosition) {
                parser.position++
                if (c === '\n') {
                  parser.line++
                  parser.column = 0
                } else {
                  parser.column++
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else {
            if (not(whitespace, c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.')
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY
            } else {
              parser.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING
          } else {
            parser.script += c
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG
          } else {
            parser.script += '<' + c
            parser.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL
            parser.sgmlDecl = ''
          } else if (is(whitespace, c)) {
            // wait for it...
          } else if (is(nameStart, c)) {
            parser.state = S.OPEN_TAG
            parser.tagName = c
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG
            parser.tagName = ''
          } else if (c === '?') {
            parser.state = S.PROC_INST
            parser.procInstName = parser.procInstBody = ''
          } else {
            strictFail(parser, 'Unencoded <')
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            parser.textNode += '<' + c
            parser.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata')
            parser.state = S.CDATA
            parser.sgmlDecl = ''
            parser.cdata = ''
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT
            parser.comment = ''
            parser.sgmlDecl = ''
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration')
            }
            parser.doctype = ''
            parser.sgmlDecl = ''
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
            parser.sgmlDecl = ''
            parser.state = S.TEXT
          } else if (is(quote, c)) {
            parser.state = S.SGML_DECL_QUOTED
            parser.sgmlDecl += c
          } else {
            parser.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL
            parser.q = ''
          }
          parser.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT
            emitNode(parser, 'ondoctype', parser.doctype)
            parser.doctype = true // just remember that we saw it.
          } else {
            parser.doctype += c
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD
            } else if (is(quote, c)) {
              parser.state = S.DOCTYPE_QUOTED
              parser.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.q = ''
            parser.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c
          if (c === ']') {
            parser.state = S.DOCTYPE
          } else if (is(quote, c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED
            parser.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD
            parser.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING
          } else {
            parser.comment += c
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED
            parser.comment = textopts(parser.opt, parser.comment)
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment)
            }
            parser.comment = ''
          } else {
            parser.comment += '-' + c
            parser.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment')
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c
            parser.state = S.COMMENT
          } else {
            parser.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING
          } else {
            parser.cdata += c
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2
          } else {
            parser.cdata += ']' + c
            parser.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata)
            }
            emitNode(parser, 'onclosecdata')
            parser.cdata = ''
            parser.state = S.TEXT
          } else if (c === ']') {
            parser.cdata += ']'
          } else {
            parser.cdata += ']]' + c
            parser.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else if (is(whitespace, c)) {
            parser.state = S.PROC_INST_BODY
          } else {
            parser.procInstName += c
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && is(whitespace, c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else {
            parser.procInstBody += c
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            })
            parser.procInstName = parser.procInstBody = ''
            parser.state = S.TEXT
          } else {
            parser.procInstBody += '?' + c
            parser.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (is(nameBody, c)) {
            parser.tagName += c
          } else {
            newTag(parser)
            if (c === '>') {
              openTag(parser)
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH
            } else {
              if (not(whitespace, c)) {
                strictFail(parser, 'Invalid character in tag name')
              }
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true)
            closeTag(parser)
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >')
            parser.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (is(whitespace, c)) {
            continue
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (is(nameStart, c)) {
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value')
            parser.attribValue = parser.attribName
            attrib(parser)
            openTag(parser)
          } else if (is(whitespace, c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE
          } else if (is(nameBody, c)) {
            parser.attribName += c
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (is(whitespace, c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value')
            parser.tag.attributes[parser.attribName] = ''
            parser.attribValue = ''
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            })
            parser.attribName = ''
            if (c === '>') {
              openTag(parser)
            } else if (is(nameStart, c)) {
              parser.attribName = c
              parser.state = S.ATTRIB_NAME
            } else {
              strictFail(parser, 'Invalid attribute name')
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (is(whitespace, c)) {
            continue
          } else if (is(quote, c)) {
            parser.q = c
            parser.state = S.ATTRIB_VALUE_QUOTED
          } else {
            strictFail(parser, 'Unquoted attribute value')
            parser.state = S.ATTRIB_VALUE_UNQUOTED
            parser.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          parser.q = ''
          parser.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (is(whitespace, c)) {
            parser.state = S.ATTRIB
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (is(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes')
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (not(attribEnd, c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          if (c === '>') {
            openTag(parser)
          } else {
            parser.state = S.ATTRIB
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (is(whitespace, c)) {
              continue
            } else if (not(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.')
              }
            } else {
              parser.tagName = c
            }
          } else if (c === '>') {
            closeTag(parser)
          } else if (is(nameBody, c)) {
            parser.tagName += c
          } else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (not(whitespace, c)) {
              strictFail(parser, 'Invalid tagname in closing tag')
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (is(whitespace, c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser)
          } else {
            strictFail(parser, 'Invalid characters in closing tag')
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState
          var buffer
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT
              buffer = 'textNode'
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED
              buffer = 'attribValue'
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED
              buffer = 'attribValue'
              break
          }

          if (c === ';') {
            parser[buffer] += parseEntity(parser)
            parser.entity = ''
            parser.state = returnState
          } else if (is(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c
          } else {
            strictFail(parser, 'Invalid character in entity name')
            parser[buffer] += '&' + parser.entity + c
            parser.entity = ''
            parser.state = returnState
          }

          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser)
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode
      var floor = Math.floor
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000
        var codeUnits = []
        var highSurrogate
        var lowSurrogate
        var index = -1
        var length = arguments.length
        if (!length) {
          return ''
        }
        var result = ''
        while (++index < length) {
          var codePoint = Number(arguments[index])
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint)
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000
            highSurrogate = (codePoint >> 10) + 0xD800
            lowSurrogate = (codePoint % 0x400) + 0xDC00
            codeUnits.push(highSurrogate, lowSurrogate)
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits)
            codeUnits.length = 0
          }
        }
        return result
      }
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        })
      } else {
        String.fromCodePoint = fromCodePoint
      }
    }())
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports)

}).call(this,require("buffer").Buffer)
},{"buffer":3,"stream":23,"string_decoder":24}],26:[function(require,module,exports){
var ANIMATION_FRAME_RATE, BACKSPACE_KEY, CONTROL_KEYS, CURSOR_HEIGHT_DECREASE, CURSOR_UNFOCUSED_OPACITY, CURSOR_WIDTH_DECREASE, CapturePoint, CrossDocumentLocation, DEBUG_FLAG, DEFAULT_INDENT_DEPTH, DISCOURAGE_DROP_TIMEOUT, DOWN_ARROW_KEY, DROPDOWN_SCROLLBAR_PADDING, ENTER_KEY, Editor, EditorState, FloatingBlockRecord, FloatingOperation, GRAY_BLOCK_BORDER, GRAY_BLOCK_COLOR, GRAY_BLOCK_HANDLE_HEIGHT, GRAY_BLOCK_HANDLE_WIDTH, GRAY_BLOCK_MARGIN, LEFT_ARROW_KEY, MAX_DROP_DISTANCE, META_KEYS, MIN_DRAG_DISTANCE, PALETTE_LEFT_MARGIN, PALETTE_MARGIN, PALETTE_TOP_MARGIN, QUAD, RIGHT_ARROW_KEY, RememberedSocketRecord, TAB_KEY, TOUCH_SELECTION_TIMEOUT, TYPE_FROM_SEVERITY, TYPE_SEVERITY, UP_ARROW_KEY, Y_KEY, Z_KEY, binding, command_modifiers, command_pressed, containsCursor, draw, editorBindings, escapeString, getMostSevereAnnotationType, getOffsetLeft, getOffsetTop, helper, hook, isOSX, j, key, last_, len, model, modes, parseBlock, ref, ref1, touchEvents, unsortedEditorBindings, userAgent, validateLassoSelection, view,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

helper = require('./helper.coffee');

draw = require('./draw.coffee');

model = require('./model.coffee');

view = require('./view.coffee');

QUAD = require('../vendor/quadtree.js');

modes = require('./modes.coffee');

PALETTE_TOP_MARGIN = 5;

PALETTE_MARGIN = 5;

MIN_DRAG_DISTANCE = 1;

PALETTE_LEFT_MARGIN = 5;

DEFAULT_INDENT_DEPTH = '  ';

ANIMATION_FRAME_RATE = 60;

DISCOURAGE_DROP_TIMEOUT = 1000;

MAX_DROP_DISTANCE = 100;

CURSOR_WIDTH_DECREASE = 3;

CURSOR_HEIGHT_DECREASE = 2;

CURSOR_UNFOCUSED_OPACITY = 0.5;

DEBUG_FLAG = false;

DROPDOWN_SCROLLBAR_PADDING = 17;

BACKSPACE_KEY = 8;

TAB_KEY = 9;

ENTER_KEY = 13;

LEFT_ARROW_KEY = 37;

UP_ARROW_KEY = 38;

RIGHT_ARROW_KEY = 39;

DOWN_ARROW_KEY = 40;

Z_KEY = 90;

Y_KEY = 89;

META_KEYS = [91, 92, 93, 223, 224];

CONTROL_KEYS = [17, 162, 163];

GRAY_BLOCK_MARGIN = 5;

GRAY_BLOCK_HANDLE_WIDTH = 15;

GRAY_BLOCK_HANDLE_HEIGHT = 30;

GRAY_BLOCK_COLOR = '#FFF';

GRAY_BLOCK_BORDER = '#AAA';

userAgent = '';

if (typeof window !== 'undefined' && ((ref = window.navigator) != null ? ref.userAgent : void 0)) {
  userAgent = window.navigator.userAgent;
}

isOSX = /OS X/.test(userAgent);

command_modifiers = isOSX ? META_KEYS : CONTROL_KEYS;

command_pressed = function(e) {
  if (isOSX) {
    return e.metaKey;
  } else {
    return e.ctrlKey;
  }
};

unsortedEditorBindings = {
  'populate': [],
  'resize': [],
  'resize_palette': [],
  'redraw_main': [],
  'redraw_palette': [],
  'rebuild_palette': [],
  'mousedown': [],
  'mousemove': [],
  'mouseup': [],
  'dblclick': [],
  'keydown': [],
  'keyup': []
};

editorBindings = {};

hook = function(event, priority, fn) {
  return unsortedEditorBindings[event].push({
    priority: priority,
    fn: fn
  });
};

exports.Editor = Editor = (function() {
  function Editor(wrapperElement, options1) {
    var binding, boundListeners, dispatchKeyEvent, dispatchMouseEvent, elements, eventName, fn1, j, len, ref1, ref2, ref3, ref4, ref5, ref6, ref7, useBlockMode;
    this.wrapperElement = wrapperElement;
    this.options = options1;
    this.readOnly = false;
    this.paletteGroups = this.options.palette;
    this.showPaletteInTextMode = (ref1 = this.options.showPaletteInTextMode) != null ? ref1 : false;
    this.paletteEnabled = (ref2 = this.options.enablePaletteAtStart) != null ? ref2 : true;
    this.dropIntoAceAtLineStart = (ref3 = this.options.dropIntoAceAtLineStart) != null ? ref3 : false;
    this.allowFloatingBlocks = (ref4 = this.options.allowFloatingBlocks) != null ? ref4 : true;
    this.options.mode = this.options.mode.replace(/$\/ace\/mode\//, '');
    if (this.options.mode in modes) {
      this.mode = new modes[this.options.mode](this.options.modeOptions);
    } else {
      this.mode = new coffee(this.options.modeOptions);
    }
    this.draw = new draw.Draw();
    this.gutterDecorations = {};
    this.debugging = true;
    this.dropletElement = document.createElement('div');
    this.dropletElement.className = 'droplet-wrapper-div';
    this.dropletElement.tabIndex = 0;
    this.wrapperElement.appendChild(this.dropletElement);
    this.wrapperElement.style.backgroundColor = '#FFF';
    this.mainCanvas = document.createElement('canvas');
    this.mainCanvas.className = 'droplet-main-canvas';
    this.mainCanvas.width = this.mainCanvas.height = 0;
    this.mainCtx = this.mainCanvas.getContext('2d');
    this.dropletElement.appendChild(this.mainCanvas);
    this.paletteWrapper = document.createElement('div');
    this.paletteWrapper.className = 'droplet-palette-wrapper';
    this.paletteElement = document.createElement('div');
    this.paletteElement.className = 'droplet-palette-element';
    this.paletteWrapper.appendChild(this.paletteElement);
    this.paletteCanvas = document.createElement('canvas');
    this.paletteCanvas.className = 'droplet-palette-canvas';
    this.paletteCanvas.height = this.paletteCanvas.width = 0;
    this.paletteCtx = this.paletteCanvas.getContext('2d');
    this.paletteElement.appendChild(this.paletteCanvas);
    this.paletteWrapper.style.position = 'absolute';
    this.paletteWrapper.style.left = '0px';
    this.paletteWrapper.style.top = '0px';
    this.paletteWrapper.style.bottom = '0px';
    this.paletteWrapper.style.width = '270px';
    this.dropletElement.style.left = this.paletteWrapper.offsetWidth + 'px';
    this.wrapperElement.appendChild(this.paletteWrapper);
    this.draw.refreshFontCapital();
    this.standardViewSettings = {
      padding: 5,
      indentWidth: 20,
      textHeight: helper.getFontHeight('Courier New', 15),
      indentTongueHeight: 20,
      tabOffset: 10,
      tabWidth: 15,
      tabHeight: 4,
      tabSideWidth: 1 / 4,
      dropAreaHeight: 20,
      indentDropAreaMinWidth: 50,
      emptySocketWidth: 20,
      emptyLineHeight: 25,
      highlightAreaHeight: 10,
      shadowBlur: 5,
      ctx: this.mainCtx,
      draw: this.draw
    };
    this.bindings = {};
    this.view = new view.View(this.standardViewSettings);
    this.paletteView = new view.View(helper.extend({}, this.standardViewSettings, {
      showDropdowns: (ref5 = this.options.showDropdownInPalette) != null ? ref5 : false
    }));
    this.dragView = new view.View(this.standardViewSettings);
    boundListeners = [];
    ref6 = editorBindings.populate;
    for (j = 0, len = ref6.length; j < len; j++) {
      binding = ref6[j];
      binding.call(this);
    }
    window.addEventListener('resize', (function(_this) {
      return function() {
        return _this.resizeBlockMode();
      };
    })(this));
    dispatchMouseEvent = (function(_this) {
      return function(event) {
        var handler, k, len1, ref7, state, trackPoint;
        if (event.type !== 'mousemove' && event.which !== 1) {
          return;
        }
        trackPoint = new _this.draw.Point(event.clientX, event.clientY);
        state = {};
        ref7 = editorBindings[event.type];
        for (k = 0, len1 = ref7.length; k < len1; k++) {
          handler = ref7[k];
          handler.call(_this, trackPoint, event, state);
        }
        if (event.type === 'mousedown') {
          if (typeof event.preventDefault === "function") {
            event.preventDefault();
          }
          event.returnValue = false;
          return false;
        }
      };
    })(this);
    dispatchKeyEvent = (function(_this) {
      return function(event) {
        var handler, k, len1, ref7, results, state;
        state = {};
        ref7 = editorBindings[event.type];
        results = [];
        for (k = 0, len1 = ref7.length; k < len1; k++) {
          handler = ref7[k];
          results.push(handler.call(_this, event, state));
        }
        return results;
      };
    })(this);
    ref7 = {
      keydown: [this.dropletElement, this.paletteElement],
      keyup: [this.dropletElement, this.paletteElement],
      mousedown: [this.dropletElement, this.paletteElement, this.dragCover],
      dblclick: [this.dropletElement, this.paletteElement, this.dragCover],
      mouseup: [window],
      mousemove: [window]
    };
    fn1 = (function(_this) {
      return function(eventName, elements) {
        var element, k, len1, results;
        results = [];
        for (k = 0, len1 = elements.length; k < len1; k++) {
          element = elements[k];
          if (/^key/.test(eventName)) {
            results.push(element.addEventListener(eventName, dispatchKeyEvent));
          } else {
            results.push(element.addEventListener(eventName, dispatchMouseEvent));
          }
        }
        return results;
      };
    })(this);
    for (eventName in ref7) {
      elements = ref7[eventName];
      fn1(eventName, elements);
    }
    this.tree = new model.Document();
    this.resizeBlockMode();
    this.redrawMain();
    this.rebuildPalette();
    useBlockMode = (this.mode != null) && !this.options.textModeAtStart;
    this.setEditorState(useBlockMode);
    return this;
  }

  Editor.prototype.setMode = function(mode, modeOptions) {
    var modeClass;
    modeClass = modes[mode];
    if (modeClass) {
      this.options.mode = mode;
      this.mode = new modeClass(modeOptions);
    } else {
      this.options.mode = null;
      this.mode = null;
    }
    return this.setValue(this.getValue());
  };

  Editor.prototype.getMode = function() {
    return this.options.mode;
  };

  Editor.prototype.setReadOnly = function(readOnly) {
    this.readOnly = readOnly;
    return this.aceEditor.setReadOnly(readOnly);
  };

  Editor.prototype.getReadOnly = function() {
    return this.readOnly;
  };

  Editor.prototype.resizeTextMode = function() {
    this.resizeAceElement();
    return this.aceEditor.resize(true);
  };

  Editor.prototype.resizeBlockMode = function() {
    this.resizeTextMode();
    this.dropletElement.style.height = this.wrapperElement.clientHeight + "px";
    if (this.paletteEnabled) {
      this.dropletElement.style.left = this.paletteWrapper.offsetWidth + "px";
      this.dropletElement.style.width = (this.wrapperElement.clientWidth - this.paletteWrapper.offsetWidth) + "px";
    } else {
      this.dropletElement.style.left = "0px";
      this.dropletElement.style.width = this.wrapperElement.clientWidth + "px";
    }
    this.resizeGutter();
    this.mainCanvas.height = this.dropletElement.offsetHeight;
    this.mainCanvas.width = this.dropletElement.offsetWidth - this.gutter.offsetWidth;
    this.mainCanvas.style.height = this.mainCanvas.height + "px";
    this.mainCanvas.style.width = this.mainCanvas.width + "px";
    this.mainCanvas.style.left = this.gutter.offsetWidth + "px";
    this.transitionContainer.style.left = this.gutter.offsetWidth + "px";
    this.resizePalette();
    this.resizePaletteHighlight();
    this.resizeNubby();
    this.resizeMainScroller();
    this.resizeLassoCanvas();
    this.resizeCursorCanvas();
    this.resizeDragCanvas();
    this.scrollOffsets.main.y = this.mainScroller.scrollTop;
    this.scrollOffsets.main.x = this.mainScroller.scrollLeft;
    this.mainCtx.setTransform(1, 0, 0, 1, -this.scrollOffsets.main.x, -this.scrollOffsets.main.y);
    this.highlightCtx.setTransform(1, 0, 0, 1, -this.scrollOffsets.main.x, -this.scrollOffsets.main.y);
    this.cursorCtx.setTransform(1, 0, 0, 1, -this.scrollOffsets.main.x, -this.scrollOffsets.main.y);
    return this.redrawMain();
  };

  Editor.prototype.resizePalette = function() {
    var binding, j, len, ref1;
    this.paletteCanvas.style.top = this.paletteHeader.offsetHeight + "px";
    this.paletteCanvas.height = this.paletteWrapper.offsetHeight - this.paletteHeader.offsetHeight;
    this.paletteCanvas.width = this.paletteWrapper.offsetWidth;
    this.paletteCanvas.style.height = this.paletteCanvas.height + "px";
    this.paletteCanvas.style.width = this.paletteCanvas.width + "px";
    ref1 = editorBindings.resize_palette;
    for (j = 0, len = ref1.length; j < len; j++) {
      binding = ref1[j];
      binding.call(this);
    }
    this.paletteCtx.setTransform(1, 0, 0, 1, -this.scrollOffsets.palette.x, -this.scrollOffsets.palette.y);
    this.paletteHighlightCtx.setTransform(1, 0, 0, 1, -this.scrollOffsets.palette.x, -this.scrollOffsets.palette.y);
    return this.rebuildPalette();
  };

  Editor.prototype.resize = function() {
    if (this.currentlyUsingBlocks) {
      return this.resizeBlockMode();
    } else {
      return this.resizeTextMode();
    }
  };

  return Editor;

})();

Editor.prototype.clearMain = function(opts) {
  if (opts.boundingRectangle != null) {
    return this.mainCtx.clearRect(opts.boundingRectangle.x, opts.boundingRectangle.y, opts.boundingRectangle.width, opts.boundingRectangle.height);
  } else {
    return this.mainCtx.clearRect(this.scrollOffsets.main.x, this.scrollOffsets.main.y, this.mainCanvas.width, this.mainCanvas.height);
  }
};

Editor.prototype.setTopNubbyStyle = function(height, color) {
  if (height == null) {
    height = 10;
  }
  if (color == null) {
    color = '#EBEBEB';
  }
  this.nubbyHeight = Math.max(0, height);
  this.nubbyColor = color;
  this.topNubbyPath = new this.draw.Path();
  if (height >= 0) {
    this.topNubbyPath.bevel = true;
    this.topNubbyPath.push(new this.draw.Point(this.mainCanvas.width, -5));
    this.topNubbyPath.push(new this.draw.Point(this.mainCanvas.width, height));
    this.topNubbyPath.push(new this.draw.Point(this.view.opts.tabOffset + this.view.opts.tabWidth, height));
    this.topNubbyPath.push(new this.draw.Point(this.view.opts.tabOffset + this.view.opts.tabWidth * (1 - this.view.opts.tabSideWidth), this.view.opts.tabHeight + height));
    this.topNubbyPath.push(new this.draw.Point(this.view.opts.tabOffset + this.view.opts.tabWidth * this.view.opts.tabSideWidth, this.view.opts.tabHeight + height));
    this.topNubbyPath.push(new this.draw.Point(this.view.opts.tabOffset, height));
    this.topNubbyPath.push(new this.draw.Point(-5, height));
    this.topNubbyPath.push(new this.draw.Point(-5, -5));
    this.topNubbyPath.style.fillColor = color;
  }
  return this.redrawMain();
};

Editor.prototype.resizeNubby = function() {
  return this.setTopNubbyStyle(this.nubbyHeight, this.nubbyColor);
};

Editor.prototype.drawFloatingBlock = function(record, startWidth, endWidth, rect, opts) {
  var blockView, bottomTextPosition, oldBounds, path, rectangle, ref1, ref2, startHeight;
  blockView = this.view.getViewNodeFor(record.block);
  blockView.layout(record.position.x, record.position.y);
  rectangle = new this.view.draw.Rectangle();
  rectangle.copy(blockView.totalBounds);
  rectangle.x -= GRAY_BLOCK_MARGIN;
  rectangle.y -= GRAY_BLOCK_MARGIN;
  rectangle.width += 2 * GRAY_BLOCK_MARGIN;
  rectangle.height += 2 * GRAY_BLOCK_MARGIN;
  bottomTextPosition = blockView.totalBounds.bottom() - blockView.distanceToBase[blockView.lineLength - 1].below - this.fontSize;
  if ((blockView.totalBounds.width - blockView.bounds[blockView.bounds.length - 1].width) < endWidth) {
    if (blockView.lineLength > 1) {
      rectangle.height += this.fontSize;
      bottomTextPosition = rectangle.bottom() - this.fontSize - 5;
    } else {
      rectangle.width += endWidth;
    }
  }
  if (!rectangle.equals(record.grayBox)) {
    record.grayBox = rectangle;
    oldBounds = (ref1 = (ref2 = record.grayBoxPath) != null ? typeof ref2.bounds === "function" ? ref2.bounds() : void 0 : void 0) != null ? ref1 : new this.view.draw.NoRectangle();
    startHeight = blockView.bounds[0].height + 10;
    record.grayBoxPath = path = new this.view.draw.Path();
    path.push(new this.view.draw.Point(rectangle.right() - 5, rectangle.y));
    path.push(new this.view.draw.Point(rectangle.right(), rectangle.y + 5));
    path.push(new this.view.draw.Point(rectangle.right(), rectangle.bottom() - 5));
    path.push(new this.view.draw.Point(rectangle.right() - 5, rectangle.bottom()));
    if (blockView.lineLength > 1) {
      path.push(new this.view.draw.Point(rectangle.x + 5, rectangle.bottom()));
      path.push(new this.view.draw.Point(rectangle.x, rectangle.bottom() - 5));
    } else {
      path.push(new this.view.draw.Point(rectangle.x, rectangle.bottom()));
    }
    path.push(new this.view.draw.Point(rectangle.x, rectangle.y + startHeight));
    path.push(new this.view.draw.Point(rectangle.x - startWidth + 5, rectangle.y + startHeight));
    path.push(new this.view.draw.Point(rectangle.x - startWidth, rectangle.y + startHeight - 5));
    path.push(new this.view.draw.Point(rectangle.x - startWidth, rectangle.y + 5));
    path.push(new this.view.draw.Point(rectangle.x - startWidth + 5, rectangle.y));
    path.push(new this.view.draw.Point(rectangle.x, rectangle.y));
    path.bevel = false;
    path.noclip = true;
    path.dotted = true;
    path.style = {
      fillColor: GRAY_BLOCK_COLOR,
      strokeColor: GRAY_BLOCK_BORDER,
      lineWidth: 4
    };
    if (opts.boundingRectangle != null) {
      opts.boundingRectangle.unite(path.bounds());
      opts.boundingRectangle.unite(oldBounds);
      this.mainCtx.restore();
      return this.redrawMain(opts);
    }
  }
  this.mainCtx.globalAlpha *= 0.8;
  record.grayBoxPath.draw(this.mainCtx);
  this.mainCtx.fillStyle = '#000';
  this.mainCtx.fillText(this.mode.startComment, blockView.totalBounds.x - startWidth, blockView.totalBounds.y + blockView.distanceToBase[0].above - this.fontSize);
  this.mainCtx.fillText(this.mode.endComment, record.grayBox.right() - endWidth - 5, bottomTextPosition);
  this.mainCtx.globalAlpha /= 0.8;
  return blockView.draw(this.mainCtx, rect, {
    grayscale: false,
    selected: false,
    noText: false
  });
};

Editor.prototype.redrawMain = function(opts) {
  var binding, endWidth, j, k, layoutResult, len, len1, oldScroll, options, record, rect, ref1, ref2, ref3, ref4, startWidth;
  if (opts == null) {
    opts = {};
  }
  if (!this.currentlyAnimating_suprressRedraw) {
    this.draw.setGlobalFontSize(this.fontSize);
    this.draw.setCtx(this.mainCtx);
    this.clearMain(opts);
    this.topNubbyPath.draw(this.mainCtx);
    if (opts.boundingRectangle != null) {
      this.mainCtx.save();
      opts.boundingRectangle.clip(this.mainCtx);
    }
    rect = (ref1 = opts.boundingRectangle) != null ? ref1 : new this.draw.Rectangle(this.scrollOffsets.main.x, this.scrollOffsets.main.y, this.mainCanvas.width, this.mainCanvas.height);
    options = {
      grayscale: false,
      selected: false,
      noText: (ref2 = opts.noText) != null ? ref2 : false
    };
    layoutResult = this.view.getViewNodeFor(this.tree).layout(0, this.nubbyHeight);
    this.view.getViewNodeFor(this.tree).draw(this.mainCtx, rect, options);
    startWidth = this.mainCtx.measureText(this.mode.startComment).width;
    endWidth = this.mainCtx.measureText(this.mode.endComment).width;
    ref3 = this.floatingBlocks;
    for (j = 0, len = ref3.length; j < len; j++) {
      record = ref3[j];
      this.drawFloatingBlock(record, startWidth, endWidth, rect, opts);
    }
    if (opts.boundingRectangle != null) {
      this.mainCtx.restore();
    }
    this.redrawCursors();
    this.redrawHighlights();
    this.resizeGutter();
    ref4 = editorBindings.redraw_main;
    for (k = 0, len1 = ref4.length; k < len1; k++) {
      binding = ref4[k];
      binding.call(this, layoutResult);
    }
    if (this.changeEventVersion !== this.tree.version) {
      this.changeEventVersion = this.tree.version;
      this.suppressAceChangeEvent = true;
      oldScroll = this.aceEditor.session.getScrollTop();
      this.setAceValue(this.getValue());
      this.suppressAceChangeEvent = false;
      this.aceEditor.session.setScrollTop(oldScroll);
      this.fireEvent('change', []);
    }
    return null;
  }
};

Editor.prototype.redrawHighlights = function() {
  var id, info, line, path, ref1, ref2, ref3;
  this.clearHighlightCanvas();
  ref1 = this.markedLines;
  for (line in ref1) {
    info = ref1[line];
    if (this.inDisplay(info.model)) {
      path = this.getHighlightPath(info.model, info.style);
      path.draw(this.highlightCtx);
    } else {
      delete this.markedLines[line];
    }
  }
  ref2 = this.markedBlocks;
  for (id in ref2) {
    info = ref2[id];
    if (this.inDisplay(info.model)) {
      path = this.getHighlightPath(info.model, info.style);
      path.draw(this.highlightCtx);
    } else {
      delete this.markedLines[id];
    }
  }
  ref3 = this.extraMarks;
  for (id in ref3) {
    info = ref3[id];
    if (this.inDisplay(info.model)) {
      path = this.getHighlightPath(info.model, info.style);
      path.draw(this.highlightCtx);
    } else {
      delete this.extraMarks[id];
    }
  }
  if ((this.draggingBlock != null) && this.inDisplay(this.draggingBlock)) {
    this.view.getViewNodeFor(this.draggingBlock).draw(this.highlightCtx, new this.draw.Rectangle(this.scrollOffsets.main.x, this.scrollOffsets.main.y, this.mainCanvas.width, this.mainCanvas.height), {
      grayscale: true
    });
    this.maskFloatingPaths(this.draggingBlock.getDocument());
  }
  return this.redrawLassoHighlight();
};

Editor.prototype.clearCursorCanvas = function() {
  return this.cursorCtx.clearRect(this.scrollOffsets.main.x, this.scrollOffsets.main.y, this.cursorCanvas.width, this.cursorCanvas.height);
};

Editor.prototype.redrawCursors = function() {
  this.clearCursorCanvas();
  if (this.cursorAtSocket()) {
    return this.redrawTextHighlights();
  } else if (this.lassoSelection == null) {
    return this.drawCursor();
  }
};

Editor.prototype.drawCursor = function() {
  return this.strokeCursor(this.determineCursorPosition());
};

Editor.prototype.clearPalette = function() {
  return this.paletteCtx.clearRect(this.scrollOffsets.palette.x, this.scrollOffsets.palette.y, this.paletteCanvas.width, this.paletteCanvas.height);
};

Editor.prototype.clearPaletteHighlightCanvas = function() {
  return this.paletteHighlightCtx.clearRect(this.scrollOffsets.palette.x, this.scrollOffsets.palette.y, this.paletteHighlightCanvas.width, this.paletteHighlightCanvas.height);
};

Editor.prototype.redrawPalette = function() {
  var binding, boundingRect, entry, j, k, lastBottomEdge, len, len1, paletteBlockView, ref1, ref2, results;
  this.clearPalette();
  lastBottomEdge = PALETTE_TOP_MARGIN;
  boundingRect = new this.draw.Rectangle(this.scrollOffsets.palette.x, this.scrollOffsets.palette.y, this.paletteCanvas.width, this.paletteCanvas.height);
  ref1 = this.currentPaletteBlocks;
  for (j = 0, len = ref1.length; j < len; j++) {
    entry = ref1[j];
    paletteBlockView = this.paletteView.getViewNodeFor(entry.block);
    paletteBlockView.layout(PALETTE_LEFT_MARGIN, lastBottomEdge);
    paletteBlockView.draw(this.paletteCtx, boundingRect);
    lastBottomEdge = paletteBlockView.getBounds().bottom() + PALETTE_MARGIN;
  }
  ref2 = editorBindings.redraw_palette;
  results = [];
  for (k = 0, len1 = ref2.length; k < len1; k++) {
    binding = ref2[k];
    results.push(binding.call(this));
  }
  return results;
};

Editor.prototype.rebuildPalette = function() {
  var binding, j, len, ref1, results;
  this.redrawPalette();
  ref1 = editorBindings.rebuild_palette;
  results = [];
  for (j = 0, len = ref1.length; j < len; j++) {
    binding = ref1[j];
    results.push(binding.call(this));
  }
  return results;
};

Editor.prototype.absoluteOffset = function(el) {
  var point;
  point = new this.draw.Point(el.offsetLeft, el.offsetTop);
  el = el.offsetParent;
  while (!(el === document.body || (el == null))) {
    point.x += el.offsetLeft - el.scrollLeft;
    point.y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return point;
};

Editor.prototype.trackerPointToMain = function(point) {
  var gbr;
  if (this.mainCanvas.offsetParent == null) {
    return new this.draw.Point(NaN, NaN);
  }
  gbr = this.mainCanvas.getBoundingClientRect();
  return new this.draw.Point(point.x - gbr.left + this.scrollOffsets.main.x, point.y - gbr.top + this.scrollOffsets.main.y);
};

Editor.prototype.trackerPointToPalette = function(point) {
  var gbr;
  if (this.paletteCanvas.offsetParent == null) {
    return new this.draw.Point(NaN, NaN);
  }
  gbr = this.paletteCanvas.getBoundingClientRect();
  return new this.draw.Point(point.x - gbr.left + this.scrollOffsets.palette.x, point.y - gbr.top + this.scrollOffsets.palette.y);
};

Editor.prototype.trackerPointIsInElement = function(point, element) {
  var gbr;
  if (this.readOnly) {
    return false;
  }
  if (element.offsetParent == null) {
    return false;
  }
  gbr = element.getBoundingClientRect();
  return point.x >= gbr.left && point.x < gbr.right && point.y >= gbr.top && point.y < gbr.bottom;
};

Editor.prototype.trackerPointIsInMain = function(point) {
  return this.trackerPointIsInElement(point, this.mainCanvas);
};

Editor.prototype.trackerPointIsInMainScroller = function(point) {
  return this.trackerPointIsInElement(point, this.mainScroller);
};

Editor.prototype.trackerPointIsInGutter = function(point) {
  return this.trackerPointIsInElement(point, this.gutter);
};

Editor.prototype.trackerPointIsInPalette = function(point) {
  return this.trackerPointIsInElement(point, this.paletteCanvas);
};

Editor.prototype.trackerPointIsInAce = function(point) {
  return this.trackerPointIsInElement(point, this.aceElement);
};

Editor.prototype.hitTest = function(point, block, view) {
  var head, result, seek;
  if (view == null) {
    view = this.view;
  }
  if (this.readOnly) {
    return null;
  }
  head = block.start;
  seek = block.end;
  result = null;
  while (head !== seek) {
    if (head.type === 'blockStart' && view.getViewNodeFor(head.container).path.contains(point)) {
      result = head.container;
      seek = head.container.end;
    }
    head = head.next;
  }
  return result;
};

hook('mousedown', 10, function() {
  var x, y;
  x = document.body.scrollLeft;
  y = document.body.scrollTop;
  this.dropletElement.focus();
  return window.scrollTo(x, y);
});

Editor.prototype.removeBlankLines = function() {
  var head, tail;
  head = tail = this.tree.end.prev;
  while ((head != null ? head.type : void 0) === 'newline') {
    head = head.prev;
  }
  if (head.type === 'newline') {
    return this.spliceOut(new model.List(head, tail));
  }
};

hook('populate', 0, function() {
  this.undoStack = [];
  this.redoStack = [];
  return this.changeEventVersion = 0;
});

hook('keydown', 0, function(event, state) {
  if (event.which === Z_KEY && event.shiftKey && command_pressed(event)) {
    return this.redo();
  } else if (event.which === Z_KEY && command_pressed(event)) {
    return this.undo();
  } else if (event.which === Y_KEY && command_pressed(event)) {
    return this.redo();
  }
});

EditorState = (function() {
  function EditorState(root, floats) {
    this.root = root;
    this.floats = floats;
  }

  EditorState.prototype.equals = function(other) {
    var el, i, j, len, ref1;
    if (!(this.root === other.root && this.floats.length === other.floats.length)) {
      return false;
    }
    ref1 = this.floats;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      el = ref1[i];
      if (!(el.position.equals(other.floats[i].position) && el.string === other.floats[i].string)) {
        return false;
      }
    }
    return true;
  };

  EditorState.prototype.toString = function() {
    return JSON.stringify({
      root: this.root,
      floats: this.floats
    });
  };

  return EditorState;

})();

Editor.prototype.getSerializedEditorState = function() {
  return new EditorState(this.tree.stringify(), this.floatingBlocks.map(function(x) {
    return {
      position: x.position,
      string: x.block.stringify()
    };
  }));
};

Editor.prototype.clearUndoStack = function() {
  this.undoStack.length = 0;
  return this.redoStack.length = 0;
};

Editor.prototype.undo = function() {
  var currentValue, operation;
  this.setCursor(this.cursor, (function(x) {
    return x.type !== 'socketStart';
  }));
  currentValue = this.getSerializedEditorState();
  while (!(this.undoStack.length === 0 || (this.undoStack[this.undoStack.length - 1] instanceof CapturePoint && !this.getSerializedEditorState().equals(currentValue)))) {
    operation = this.popUndo();
    if (operation instanceof FloatingOperation) {
      this.performFloatingOperation(operation, 'backward');
    } else {
      if (!(operation instanceof CapturePoint)) {
        this.getDocument(operation.document).perform(operation.operation, 'backward', this.getPreserves(operation.document));
      }
    }
  }
  if (this.undoStack[this.undoStack.length - 1] instanceof CapturePoint) {
    this.rememberedSockets = this.undoStack[this.undoStack.length - 1].rememberedSockets.map(function(x) {
      return x.clone();
    });
  }
  this.popUndo();
  this.correctCursor();
  this.redrawMain();
};

Editor.prototype.pushUndo = function(operation) {
  this.redoStack.length = 0;
  return this.undoStack.push(operation);
};

Editor.prototype.popUndo = function() {
  var operation;
  operation = this.undoStack.pop();
  if (operation != null) {
    this.redoStack.push(operation);
  }
  return operation;
};

Editor.prototype.popRedo = function() {
  var operation;
  operation = this.redoStack.pop();
  if (operation != null) {
    this.undoStack.push(operation);
  }
  return operation;
};

Editor.prototype.redo = function() {
  var currentValue, operation;
  currentValue = this.getSerializedEditorState();
  while (!(this.redoStack.length === 0 || (this.redoStack[this.redoStack.length - 1] instanceof CapturePoint && !this.getSerializedEditorState().equals(currentValue)))) {
    operation = this.popRedo();
    if (operation instanceof FloatingOperation) {
      this.performFloatingOperation(operation, 'forward');
    } else {
      if (!(operation instanceof CapturePoint)) {
        this.getDocument(operation.document).perform(operation.operation, 'forward', this.getPreserves(operation.document));
      }
    }
  }
  if (this.undoStack[this.undoStack.length - 1] instanceof CapturePoint) {
    this.rememberedSockets = this.undoStack[this.undoStack.length - 1].rememberedSockets.map(function(x) {
      return x.clone();
    });
  }
  this.popRedo();
  this.redrawMain();
};

Editor.prototype.undoCapture = function() {
  return this.pushUndo(new CapturePoint(this.rememberedSockets));
};

CapturePoint = (function() {
  function CapturePoint(rememberedSockets) {
    this.rememberedSockets = rememberedSockets.map(function(x) {
      return x.clone();
    });
  }

  return CapturePoint;

})();

hook('populate', 7, function() {
  return this.rememberedSockets = [];
});

Editor.prototype.getPreserves = function(dropletDocument) {
  var array;
  if (dropletDocument instanceof model.Document) {
    dropletDocument = this.documentIndex(dropletDocument);
  }
  array = [this.cursor];
  array = array.concat(this.rememberedSockets.map(function(x) {
    return x.socket;
  }));
  return array.filter(function(location) {
    return location.document === dropletDocument;
  }).map(function(location) {
    return location.location;
  });
};

Editor.prototype.spliceOut = function(node, container) {
  var dropletDocument, i, j, k, len, len1, operation, parent, record, ref1, ref2, socket;
  if (container == null) {
    container = null;
  }
  if (!(node instanceof model.List)) {
    node = new model.List(node, node);
  }
  operation = null;
  dropletDocument = node.getDocument();
  parent = node.parent;
  if (dropletDocument != null) {
    operation = node.getDocument().remove(node, this.getPreserves(dropletDocument));
    this.pushUndo({
      operation: operation,
      document: this.getDocuments().indexOf(dropletDocument)
    });
    if ((parent != null ? parent.type : void 0) === 'socket' && node.start.type === 'blockStart') {
      ref1 = this.rememberedSockets;
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        socket = ref1[i];
        if (this.fromCrossDocumentLocation(socket.socket) === parent) {
          this.rememberedSockets.splice(i, 0);
          this.populateSocket(parent, socket.text);
          break;
        }
      }
    }
    if (dropletDocument.start.next === dropletDocument.end) {
      ref2 = this.floatingBlocks;
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        record = ref2[i];
        if (record.block === dropletDocument) {
          this.pushUndo(new FloatingOperation(i, record.block, record.position, 'delete'));
          if (this.cursor.document === i + 1) {
            this.setCursor(this.tree.start);
          }
          if (this.cursor.document > i + 1) {
            this.cursor.document -= 1;
          }
          this.floatingBlocks.splice(i, 1);
          break;
        }
      }
    }
  } else if (container != null) {
    container.remove(node);
  }
  this.prepareNode(node, null);
  this.correctCursor();
  return operation;
};

Editor.prototype.spliceIn = function(node, location) {
  var container, dropletDocument, operation, ref1;
  container = (ref1 = location.container) != null ? ref1 : location.parent;
  if (container.type === 'block') {
    container = container.parent;
  } else if (container.type === 'socket' && container.start.next !== container.end) {
    if (this.documentIndex(container) !== -1) {
      this.rememberedSockets.push(new RememberedSocketRecord(this.toCrossDocumentLocation(container), container.textContent()));
    }
    this.spliceOut(new model.List(container.start.next, container.end.prev), container);
  }
  dropletDocument = location.getDocument();
  this.prepareNode(node, container);
  if (dropletDocument != null) {
    operation = dropletDocument.insert(location, node, this.getPreserves(dropletDocument));
    this.pushUndo({
      operation: operation,
      document: this.getDocuments().indexOf(dropletDocument)
    });
    this.correctCursor();
    return operation;
  } else {
    container.insert(location, node);
    return null;
  }
};

RememberedSocketRecord = (function() {
  function RememberedSocketRecord(socket1, text1) {
    this.socket = socket1;
    this.text = text1;
  }

  RememberedSocketRecord.prototype.clone = function() {
    return new RememberedSocketRecord(this.socket.clone(), this.text);
  };

  return RememberedSocketRecord;

})();

Editor.prototype.replace = function(before, after, updates) {
  var dropletDocument, operation;
  if (updates == null) {
    updates = [];
  }
  dropletDocument = before.start.getDocument();
  if (dropletDocument != null) {
    operation = dropletDocument.replace(before, after, updates.concat(this.getPreserves(dropletDocument)));
    this.pushUndo({
      operation: operation,
      document: this.documentIndex(dropletDocument)
    });
    this.correctCursor();
    return operation;
  } else {
    return null;
  }
};

Editor.prototype.adjustPosToLineStart = function(pos) {
  var line;
  line = this.aceEditor.session.getLine(pos.row);
  if (pos.row === this.aceEditor.session.getLength() - 1) {
    pos.column = pos.column >= line.length / 2 ? line.length : 0;
  } else {
    pos.column = 0;
  }
  return pos;
};

Editor.prototype.correctCursor = function() {
  var cursor;
  cursor = this.fromCrossDocumentLocation(this.cursor);
  if (!this.validCursorPosition(cursor)) {
    while (!((cursor == null) || (this.validCursorPosition(cursor) && cursor.type !== 'socketStart'))) {
      cursor = cursor.next;
    }
    if (cursor == null) {
      cursor = this.fromCrossDocumentLocation(this.cursor);
    }
    while (!((cursor == null) || (this.validCursorPosition(cursor) && cursor.type !== 'socketStart'))) {
      cursor = cursor.prev;
    }
    return this.cursor = this.toCrossDocumentLocation(cursor);
  }
};

Editor.prototype.prepareNode = function(node, context) {
  var leading, ref1, ref2, trailing;
  if (node instanceof model.Container) {
    leading = node.getLeadingText();
    if (node.start.next === node.end.prev) {
      trailing = null;
    } else {
      trailing = node.getTrailingText();
    }
    ref2 = this.mode.parens(leading, trailing, node.getReader(), (ref1 = context != null ? typeof context.getReader === "function" ? context.getReader() : void 0 : void 0) != null ? ref1 : null), leading = ref2[0], trailing = ref2[1];
    node.setLeadingText(leading);
    return node.setTrailingText(trailing);
  }
};

hook('populate', 0, function() {
  this.clickedPoint = null;
  this.clickedBlock = null;
  this.clickedBlockPaletteEntry = null;
  this.draggingBlock = null;
  this.draggingOffset = null;
  this.lastHighlight = null;
  this.dragCanvas = document.createElement('canvas');
  this.dragCanvas.className = 'droplet-drag-canvas';
  this.dragCanvas.style.left = '-9999px';
  this.dragCanvas.style.top = '-9999px';
  this.dragCtx = this.dragCanvas.getContext('2d');
  this.highlightCanvas = document.createElement('canvas');
  this.highlightCanvas.className = 'droplet-highlight-canvas';
  this.highlightCtx = this.highlightCanvas.getContext('2d');
  this.wrapperElement.appendChild(this.dragCanvas);
  return this.dropletElement.appendChild(this.highlightCanvas);
});

Editor.prototype.clearHighlightCanvas = function() {
  return this.highlightCtx.clearRect(this.scrollOffsets.main.x, this.scrollOffsets.main.y, this.highlightCanvas.width, this.highlightCanvas.height);
};

Editor.prototype.clearDrag = function() {
  return this.dragCtx.clearRect(0, 0, this.dragCanvas.width, this.dragCanvas.height);
};

Editor.prototype.resizeDragCanvas = function() {
  this.dragCanvas.width = 0;
  this.dragCanvas.height = 0;
  this.highlightCanvas.width = this.dropletElement.offsetWidth - this.gutter.offsetWidth;
  this.highlightCanvas.style.width = this.highlightCanvas.width + "px";
  this.highlightCanvas.height = this.dropletElement.offsetHeight;
  this.highlightCanvas.style.height = this.highlightCanvas.height + "px";
  return this.highlightCanvas.style.left = this.mainCanvas.offsetLeft + "px";
};

Editor.prototype.getDocuments = function() {
  var documents, el, i, j, len, ref1;
  documents = [this.tree];
  ref1 = this.floatingBlocks;
  for (i = j = 0, len = ref1.length; j < len; i = ++j) {
    el = ref1[i];
    documents.push(el.block);
  }
  return documents;
};

Editor.prototype.getDocument = function(n) {
  if (n === 0) {
    return this.tree;
  } else {
    return this.floatingBlocks[n - 1].block;
  }
};

Editor.prototype.documentIndex = function(block) {
  return this.getDocuments().indexOf(block.getDocument());
};

Editor.prototype.fromCrossDocumentLocation = function(location) {
  return this.getDocument(location.document).getFromLocation(location.location);
};

Editor.prototype.toCrossDocumentLocation = function(block) {
  return new CrossDocumentLocation(this.documentIndex(block), block.getLocation());
};

hook('mousedown', 1, function(point, event, state) {
  var box, dropletDocument, hitTestResult, i, j, k, len, line, mainPoint, node, record, ref1, ref2;
  if (state.consumedHitTest) {
    return;
  }
  if (!this.trackerPointIsInMain(point)) {
    return;
  }
  mainPoint = this.trackerPointToMain(point);
  ref1 = this.getDocuments();
  for (i = j = ref1.length - 1; j >= 0; i = j += -1) {
    dropletDocument = ref1[i];
    if (this.handleTextInputClick(mainPoint, dropletDocument)) {
      state.consumedHitTest = true;
      return;
    } else if (this.cursor.document === i && this.cursorAtSocket()) {
      this.setCursor(this.cursor, (function(token) {
        return token.type !== 'socketStart';
      }));
    }
    hitTestResult = this.hitTest(mainPoint, dropletDocument);
    if (this.debugging && event.shiftKey) {
      line = null;
      node = this.view.getViewNodeFor(hitTestResult);
      ref2 = node.bounds;
      for (i = k = 0, len = ref2.length; k < len; i = ++k) {
        box = ref2[i];
        if (box.contains(mainPoint)) {
          line = i;
          break;
        }
      }
      this.dumpNodeForDebug(hitTestResult, line);
    }
    if (hitTestResult != null) {
      this.clickedBlock = hitTestResult;
      this.clickedBlockPaletteEntry = null;
      this.setCursor(this.clickedBlock.start.next);
      this.clickedPoint = point;
      state.consumedHitTest = true;
      return;
    } else if (i > 0) {
      record = this.floatingBlocks[i - 1];
      if ((record.grayBoxPath != null) && record.grayBoxPath.contains(this.trackerPointToMain(point))) {
        this.clickedBlock = new model.List(record.block.start.next, record.block.end.prev);
        this.clickedPoint = point;
        this.view.getViewNodeFor(this.clickedBlock).absorbCache();
        state.consumedHitTest = true;
        this.redrawMain();
        return;
      }
    }
  }
});

hook('mousedown', 4, function(point, event, state) {
  var hitTestBlock, hitTestResult, line, mainPoint, str;
  if (state.consumedHitTest) {
    return;
  }
  if (!this.trackerPointIsInMain(point)) {
    return;
  }
  mainPoint = this.trackerPointToMain(point);
  if ((this.lassoSelection != null) && (this.hitTest(mainPoint, this.lassoSelection) != null)) {
    return;
  }
  hitTestResult = this.hitTest(mainPoint, this.tree);
  if (hitTestResult != null) {
    hitTestBlock = this.view.getViewNodeFor(hitTestResult);
    str = hitTestResult.stringifyInPlace();
    if ((hitTestBlock.addButtonRect != null) && hitTestBlock.addButtonRect.contains(mainPoint)) {
      line = this.mode.handleButton(str, 'add-button', hitTestResult.getReader());
      this.populateBlock(hitTestResult, line);
      return state.consumedHitTest = true;
    } else if ((hitTestBlock.subtractButtonRect != null) && hitTestBlock.subtractButtonRect.contains(mainPoint)) {
      line = this.mode.handleButton(str, 'subtract-button', hitTestResult.getReader());
      this.populateBlock(hitTestResult, line);
      return state.consumedHitTest = true;
    }
  }
});

hook('mouseup', 0, function(point, event, state) {
  if (this.clickedBlock != null) {
    this.clickedBlock = null;
    return this.clickedPoint = null;
  }
});

Editor.prototype.drawDraggingBlock = function() {
  var draggingBlockView;
  this.dragView.clearCache();
  draggingBlockView = this.dragView.getViewNodeFor(this.draggingBlock);
  draggingBlockView.layout(1, 1);
  this.dragCanvas.width = Math.min(draggingBlockView.totalBounds.width + 10, window.screen.width);
  this.dragCanvas.height = Math.min(draggingBlockView.totalBounds.height + 10, window.screen.height);
  draggingBlockView.drawShadow(this.dragCtx, 5, 5);
  return draggingBlockView.draw(this.dragCtx, new this.draw.Rectangle(0, 0, this.dragCanvas.width, this.dragCanvas.height));
};

Editor.prototype.wouldDelete = function(position) {
  var mainPoint, palettePoint, ref1, ref2, ref3, ref4;
  mainPoint = this.trackerPointToMain(position);
  palettePoint = this.trackerPointToPalette(position);
  return !this.lastHighlight && !((this.mainCanvas.width + this.scrollOffsets.main.x > (ref1 = mainPoint.x) && ref1 > this.scrollOffsets.main.x) && (this.mainCanvas.height + this.scrollOffsets.main.y > (ref2 = mainPoint.y) && ref2 > this.scrollOffsets.main.y)) || ((this.paletteCanvas.width + this.scrollOffsets.palette.x > (ref3 = palettePoint.x) && ref3 > this.scrollOffsets.palette.x) && (this.paletteCanvas.height + this.scrollOffsets.palette.y > (ref4 = palettePoint.y) && ref4 > this.scrollOffsets.palette.y));
};

hook('mousemove', 1, function(point, event, state) {
  var acceptLevel, allowed, bound, dropPoint, dropletDocument, expansion, head, i, j, k, l, len, len1, line, mainPoint, position, record, ref1, ref2, ref3, viewNode;
  if (!state.capturedPickup && (this.clickedBlock != null) && point.from(this.clickedPoint).magnitude() > MIN_DRAG_DISTANCE) {
    this.draggingBlock = this.clickedBlock;
    this.dragReplacing = false;
    if (this.clickedBlockPaletteEntry) {
      this.draggingOffset = this.paletteView.getViewNodeFor(this.draggingBlock).bounds[0].upperLeftCorner().from(this.trackerPointToPalette(this.clickedPoint));
      expansion = this.clickedBlockPaletteEntry.expansion;
      if ('function' === typeof expansion) {
        expansion = expansion();
      }
      if (expansion) {
        expansion = parseBlock(this.mode, expansion);
      }
      this.draggingBlock = (expansion || this.draggingBlock).clone();
      if ('function' === typeof this.clickedBlockPaletteEntry.expansion) {
        if (indexOf.call(this.draggingBlock.classes, 'mostly-value') >= 0) {
          this.draggingBlock.classes.push('any-drop');
        }
        this.draggingBlock.lastExpansionText = expansion;
        this.draggingBlock.expansion = this.clickedBlockPaletteEntry.expansion;
      }
    } else {
      mainPoint = this.trackerPointToMain(this.clickedPoint);
      viewNode = this.view.getViewNodeFor(this.draggingBlock);
      this.draggingOffset = null;
      ref1 = viewNode.bounds;
      for (line = j = 0, len = ref1.length; j < len; line = ++j) {
        bound = ref1[line];
        if (bound.contains(mainPoint)) {
          this.draggingOffset = bound.upperLeftCorner().from(mainPoint);
          this.draggingOffset.y += viewNode.bounds[0].y - bound.y;
          break;
        }
      }
      if (this.draggingOffset == null) {
        this.draggingOffset = viewNode.bounds[0].upperLeftCorner().from(mainPoint);
      }
    }
    this.drawDraggingBlock();
    position = new this.draw.Point(point.x + this.draggingOffset.x, point.y + this.draggingOffset.y);
    this.dropPointQuadTree = QUAD.init({
      x: this.scrollOffsets.main.x,
      y: this.scrollOffsets.main.y,
      w: this.mainCanvas.width,
      h: this.mainCanvas.height
    });
    ref2 = this.getDocuments();
    for (k = 0, len1 = ref2.length; k < len1; k++) {
      dropletDocument = ref2[k];
      head = dropletDocument.start;
      if (this.draggingBlock.start.prev === head) {
        head = head.next;
      }
      while (head !== dropletDocument.end) {
        if (head === this.draggingBlock.start) {
          head = this.draggingBlock.end;
        }
        if (head instanceof model.StartToken) {
          acceptLevel = this.getAcceptLevel(this.draggingBlock, head.container);
          if (acceptLevel !== helper.FORBID) {
            dropPoint = this.view.getViewNodeFor(head.container).dropPoint;
            if (dropPoint != null) {
              allowed = true;
              ref3 = this.floatingBlocks;
              for (i = l = ref3.length - 1; l >= 0; i = l += -1) {
                record = ref3[i];
                if (record.block === dropletDocument) {
                  break;
                } else if (record.grayBoxPath.contains(dropPoint)) {
                  allowed = false;
                  break;
                }
              }
              if (allowed) {
                this.dropPointQuadTree.insert({
                  x: dropPoint.x,
                  y: dropPoint.y,
                  w: 0,
                  h: 0,
                  acceptLevel: acceptLevel,
                  _droplet_node: head.container
                });
              }
            }
          }
        }
        head = head.next;
      }
    }
    this.dragCanvas.style.top = (position.y + getOffsetTop(this.dropletElement)) + "px";
    this.dragCanvas.style.left = (position.x + getOffsetLeft(this.dropletElement)) + "px";
    this.clickedPoint = this.clickedBlock = null;
    this.clickedBlockPaletteEntry = null;
    this.begunTrash = this.wouldDelete(position);
    return this.redrawMain();
  }
});

Editor.prototype.getClosestDroppableBlock = function(mainPoint, isDebugMode) {
  var best, min, testPoints;
  best = null;
  min = Infinity;
  if (!this.dropPointQuadTree) {
    return null;
  }
  testPoints = this.dropPointQuadTree.retrieve({
    x: mainPoint.x - MAX_DROP_DISTANCE,
    y: mainPoint.y - MAX_DROP_DISTANCE,
    w: MAX_DROP_DISTANCE * 2,
    h: MAX_DROP_DISTANCE * 2
  }, (function(_this) {
    return function(point) {
      var distance;
      if (!((point.acceptLevel === helper.DISCOURAGE) && !isDebugMode)) {
        distance = mainPoint.from(point);
        distance.y *= 2;
        distance = distance.magnitude();
        if (distance < min && mainPoint.from(point).magnitude() < MAX_DROP_DISTANCE && (_this.view.getViewNodeFor(point._droplet_node).highlightArea != null)) {
          best = point._droplet_node;
          return min = distance;
        }
      }
    };
  })(this));
  return best;
};

Editor.prototype.getClosestDroppableBlockFromPosition = function(position, isDebugMode) {
  var mainPoint;
  if (!this.currentlyUsingBlocks) {
    return null;
  }
  mainPoint = this.trackerPointToMain(position);
  return this.getClosestDroppableBlock(mainPoint, isDebugMode);
};

Editor.prototype.getAcceptLevel = function(drag, drop) {
  var next;
  if (drop.type === 'socket') {
    if (drag.type === 'list') {
      return helper.FORBID;
    } else {
      return this.mode.drop(drag.getReader(), drop.getReader(), null, null);
    }
  } else if (drop.type === 'block') {
    if (drop.parent.type === 'socket') {
      return helper.FORBID;
    } else {
      next = drop.nextSibling();
      return this.mode.drop(drag.getReader(), drop.parent.getReader(), drop.getReader(), next != null ? typeof next.getReader === "function" ? next.getReader() : void 0 : void 0);
    }
  } else {
    next = drop.firstChild();
    return this.mode.drop(drag.getReader(), drop.getReader(), drop.getReader(), next != null ? typeof next.getReader === "function" ? next.getReader() : void 0 : void 0);
  }
};

hook('mousemove', 0, function(point, event, state) {
  var dropBlock, expansionText, head, mainPoint, newBlock, palettePoint, pos, position, rect, ref1, ref2, ref3;
  if (this.draggingBlock != null) {
    position = new this.draw.Point(point.x + this.draggingOffset.x, point.y + this.draggingOffset.y);
    if (this.draggingBlock.expansion) {
      expansionText = this.draggingBlock.expansion(this.getClosestDroppableBlockFromPosition(position, event.shiftKey));
      if (expansionText !== this.draggingBlock.lastExpansionText) {
        newBlock = parseBlock(this.mode, expansionText);
        newBlock.lastExpansionText = expansionText;
        newBlock.expansion = this.draggingBlock.expansion;
        if (indexOf.call(this.draggingBlock.classes, 'any-drop') >= 0) {
          newBlock.classes.push('any-drop');
        }
        this.draggingBlock = newBlock;
        this.drawDraggingBlock();
      }
    }
    if (!this.currentlyUsingBlocks) {
      if (this.trackerPointIsInAce(position)) {
        pos = this.aceEditor.renderer.screenToTextCoordinates(position.x, position.y);
        if (this.dropIntoAceAtLineStart) {
          pos = this.adjustPosToLineStart(pos);
        }
        this.aceEditor.focus();
        this.aceEditor.session.selection.moveToPosition(pos);
      } else {
        this.aceEditor.blur();
      }
    }
    rect = this.wrapperElement.getBoundingClientRect();
    this.dragCanvas.style.top = (position.y - rect.top) + "px";
    this.dragCanvas.style.left = (position.x - rect.left) + "px";
    mainPoint = this.trackerPointToMain(position);
    head = this.tree.start.next;
    while (((ref1 = head.type) === 'newline' || ref1 === 'cursor') || head.type === 'text' && head.value === '') {
      head = head.next;
    }
    if (head === this.tree.end && this.floatingBlocks.length === 0 && (this.mainCanvas.width + this.scrollOffsets.main.x > (ref2 = mainPoint.x) && ref2 > this.scrollOffsets.main.x - this.gutter.offsetWidth) && (this.mainCanvas.height + this.scrollOffsets.main.y > (ref3 = mainPoint.y) && ref3 > this.scrollOffsets.main.y)) {
      this.view.getViewNodeFor(this.tree).highlightArea.draw(this.highlightCtx);
      this.lastHighlight = this.tree;
    } else {
      if (this.hitTest(mainPoint, this.draggingBlock)) {
        dropBlock = null;
        this.dragReplacing = true;
      } else {
        this.dragReplacing = false;
        dropBlock = this.getClosestDroppableBlock(mainPoint, event.shiftKey);
      }
      if (dropBlock !== this.lastHighlight) {
        this.redrawHighlights();
        if (dropBlock != null) {
          this.view.getViewNodeFor(dropBlock).highlightArea.draw(this.highlightCtx);
          this.maskFloatingPaths(dropBlock.getDocument());
        }
        this.lastHighlight = dropBlock;
      }
    }
    palettePoint = this.trackerPointToPalette(position);
    if (this.wouldDelete(position)) {
      if (this.begunTrash) {
        return this.dragCanvas.style.opacity = 0.85;
      } else {
        return this.dragCanvas.style.opacity = 0.3;
      }
    } else {
      this.dragCanvas.style.opacity = 0.85;
      return this.begunTrash = false;
    }
  }
});

hook('mouseup', 0, function() {
  clearTimeout(this.discourageDropTimeout);
  return this.discourageDropTimeout = null;
});

hook('mouseup', 1, function(point, event, state) {
  var el, firstChar, firstNonWhitespaceRegex, futureCursorLocation, hadTextToken, hasTextToken, i, indentation, j, leadingWhitespaceRegex, len, line, newBeginning, newIndex, nextLine, pos, position, prefix, prevLine, rememberedSocketOffsets, skipInitialIndent, suffix, text;
  if (this.dragReplacing) {
    this.endDrag();
  }
  if (this.draggingBlock != null) {
    if (!this.currentlyUsingBlocks) {
      position = new this.draw.Point(point.x + this.draggingOffset.x, point.y + this.draggingOffset.y);
      if (this.trackerPointIsInAce(position)) {
        leadingWhitespaceRegex = /^(\s*)/;
        pos = this.aceEditor.renderer.screenToTextCoordinates(position.x, position.y);
        line = this.aceEditor.session.getLine(pos.row);
        indentation = leadingWhitespaceRegex.exec(line)[0];
        skipInitialIndent = true;
        prefix = '';
        suffix = '';
        if (this.dropIntoAceAtLineStart) {
          firstNonWhitespaceRegex = /\S/;
          firstChar = firstNonWhitespaceRegex.exec(line);
          if (firstChar && firstChar[0] === '}') {
            prevLine = this.aceEditor.session.getLine(pos.row - 1);
            indentation = leadingWhitespaceRegex.exec(prevLine)[0];
          }
          pos = this.adjustPosToLineStart(pos);
          skipInitialIndent = false;
          if (pos.column === 0) {
            suffix = '\n';
          } else {
            prefix = '\n';
          }
        } else if (indentation.length === line.length || indentation.length === pos.column) {
          suffix = '\n' + indentation;
        } else if (pos.column === line.length) {
          prefix = '\n';
          skipInitialIndent = false;
          nextLine = this.aceEditor.session.getLine(pos.row + 1);
          indentation = leadingWhitespaceRegex.exec(nextLine)[0];
        }
        this.prepareNode(this.draggingBlock, null);
        text = this.draggingBlock.stringify(this.mode);
        text = text.split('\n').map((function(_this) {
          return function(line, index) {
            return (index === 0 && skipInitialIndent ? '' : indentation) + line;
          };
        })(this)).join('\n');
        text = prefix + text + suffix;
        return this.aceEditor.onTextInput(text);
      }
    } else if (this.lastHighlight != null) {
      this.undoCapture();
      rememberedSocketOffsets = this.spliceRememberedSocketOffsets(this.draggingBlock);
      hadTextToken = this.draggingBlock.start.next.type === 'text';
      this.spliceOut(this.draggingBlock);
      this.clearHighlightCanvas();
      this.fireEvent('sound', [this.lastHighlight.type]);
      switch (this.lastHighlight.type) {
        case 'indent':
        case 'socket':
          this.spliceIn(this.draggingBlock, this.lastHighlight.start);
          break;
        case 'block':
          this.spliceIn(this.draggingBlock, this.lastHighlight.end);
          break;
        default:
          if (this.lastHighlight.type === 'document') {
            this.spliceIn(this.draggingBlock, this.lastHighlight.start);
          }
      }
      hasTextToken = this.draggingBlock.start.next.type === 'text';
      if (hadTextToken && !hasTextToken) {
        rememberedSocketOffsets.forEach(function(x) {
          return x.offset -= 1;
        });
      } else if (hasTextToken && !hadTextToken) {
        rememberedSocketOffsets.forEach(function(x) {
          return x.offset += 1;
        });
      }
      futureCursorLocation = this.toCrossDocumentLocation(this.draggingBlock.start);
      if (this.lastHighlight.type === 'socket') {
        this.reparse(this.draggingBlock.parent.parent);
      }
      this.endDrag();
      if (futureCursorLocation != null) {
        this.setCursor(futureCursorLocation);
      }
      newBeginning = futureCursorLocation.location.count;
      newIndex = futureCursorLocation.document;
      for (i = j = 0, len = rememberedSocketOffsets.length; j < len; i = ++j) {
        el = rememberedSocketOffsets[i];
        this.rememberedSockets.push(new RememberedSocketRecord(new CrossDocumentLocation(newIndex, new model.Location(el.offset + newBeginning, 'socket')), el.text));
      }
      return this.fireEvent('block-click');
    }
  }
});

Editor.prototype.spliceRememberedSocketOffsets = function(block) {
  var blockBegin, el, i, j, len, newRememberedSockets, offsets, ref1;
  if (block.getDocument() != null) {
    blockBegin = block.start.getLocation().count;
    offsets = [];
    newRememberedSockets = [];
    ref1 = this.rememberedSockets;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      el = ref1[i];
      if (block.contains(this.fromCrossDocumentLocation(el.socket))) {
        offsets.push({
          offset: el.socket.location.count - blockBegin,
          text: el.text
        });
      } else {
        newRememberedSockets.push(el);
      }
    }
    this.rememberedSockets = newRememberedSockets;
    return offsets;
  } else {
    return [];
  }
};

hook('populate', 0, function() {
  return this.floatingBlocks = [];
});

FloatingBlockRecord = (function() {
  function FloatingBlockRecord(block1, position1) {
    this.block = block1;
    this.position = position1;
  }

  return FloatingBlockRecord;

})();

Editor.prototype.inTree = function(block) {
  var ref1;
  return ((ref1 = block.container) != null ? ref1 : block).getDocument() === this.tree;
};

Editor.prototype.inDisplay = function(block) {
  var ref1, ref2;
  return ref1 = ((ref2 = block.container) != null ? ref2 : block).getDocument(), indexOf.call(this.getDocuments(), ref1) >= 0;
};

hook('mouseup', 0, function(point, event, state) {
  var addBlockAsFloatingBlock, el, i, j, len, newDocument, palettePoint, ref1, ref2, ref3, ref4, rememberedSocketOffsets, removeBlock, renderPoint, trackPoint;
  if ((this.draggingBlock != null) && (this.lastHighlight == null) && !this.dragReplacing) {
    trackPoint = new this.draw.Point(point.x + this.draggingOffset.x, point.y + this.draggingOffset.y);
    renderPoint = this.trackerPointToMain(trackPoint);
    palettePoint = this.trackerPointToPalette(trackPoint);
    removeBlock = true;
    addBlockAsFloatingBlock = true;
    palettePoint = this.trackerPointToPalette(point);
    if ((0 < (ref1 = palettePoint.x - this.scrollOffsets.palette.x) && ref1 < this.paletteCanvas.width) && (0 < (ref2 = palettePoint.y - this.scrollOffsets.palette.y) && ref2 < this.paletteCanvas.height) || !((-this.gutter.offsetWidth < (ref3 = renderPoint.x - this.scrollOffsets.main.x) && ref3 < this.mainCanvas.width) && (0 < (ref4 = renderPoint.y - this.scrollOffsets.main.y) && ref4 < this.mainCanvas.height))) {
      if (this.draggingBlock === this.lassoSelection) {
        this.lassoSelection = null;
      }
      addBlockAsFloatingBlock = false;
    } else {
      if (renderPoint.x - this.scrollOffsets.main.x < 0) {
        renderPoint.x = this.scrollOffsets.main.x;
      }
      if (!this.allowFloatingBlocks) {
        addBlockAsFloatingBlock = false;
        removeBlock = false;
      }
    }
    if (removeBlock) {
      this.undoCapture();
      rememberedSocketOffsets = this.spliceRememberedSocketOffsets(this.draggingBlock);
      this.spliceOut(this.draggingBlock);
    }
    if (!addBlockAsFloatingBlock) {
      this.endDrag();
      return;
    }
    newDocument = new model.Document({
      roundedSingletons: true
    });
    newDocument.insert(newDocument.start, this.draggingBlock);
    this.pushUndo(new FloatingOperation(this.floatingBlocks.length, newDocument, renderPoint, 'create'));
    this.floatingBlocks.push(new FloatingBlockRecord(newDocument, renderPoint));
    this.setCursor(this.draggingBlock.start);
    for (i = j = 0, len = rememberedSocketOffsets.length; j < len; i = ++j) {
      el = rememberedSocketOffsets[i];
      this.rememberedSockets.push(new RememberedSocketRecord(new CrossDocumentLocation(this.floatingBlocks.length, new model.Location(el.offset + 1, 'socket')), el.text));
    }
    this.draggingBlock = null;
    this.draggingOffset = null;
    this.lastHighlight = null;
    this.clearDrag();
    return this.redrawMain();
  }
});

Editor.prototype.performFloatingOperation = function(op, direction) {
  if ((op.type === 'create') === (direction === 'forward')) {
    if (this.cursor.document > op.index) {
      this.cursor.document += 1;
    }
    return this.floatingBlocks.splice(op.index, 0, new FloatingBlockRecord(op.block.clone(), op.position));
  } else {
    if (this.cursor.document === op.index + 1) {
      this.setCursor(this.tree.start);
    }
    return this.floatingBlocks.splice(op.index, 1);
  }
};

FloatingOperation = (function() {
  function FloatingOperation(index1, block1, position1, type) {
    this.index = index1;
    this.block = block1;
    this.position = position1;
    this.type = type;
    this.block = this.block.clone();
  }

  FloatingOperation.prototype.toString = function() {
    return JSON.stringify({
      index: this.index,
      block: this.block.stringify(),
      position: this.position.toString(),
      type: this.type
    });
  };

  return FloatingOperation;

})();

hook('populate', 0, function() {
  this.paletteHeader = document.createElement('div');
  this.paletteHeader.className = 'droplet-palette-header';
  this.paletteElement.appendChild(this.paletteHeader);
  return this.setPalette(this.paletteGroups);
});

parseBlock = (function(_this) {
  return function(mode, code) {
    var block;
    block = mode.parse(code).start.next.container;
    block.start.prev = block.end.next = null;
    block.setParent(null);
    return block;
  };
})(this);

Editor.prototype.setPalette = function(paletteGroups) {
  var fn1, i, j, len, paletteGroup, paletteHeaderRow, ref1;
  this.paletteHeader.innerHTML = '';
  this.paletteGroups = paletteGroups;
  this.currentPaletteBlocks = [];
  this.currentPaletteMetadata = [];
  paletteHeaderRow = null;
  ref1 = this.paletteGroups;
  fn1 = (function(_this) {
    return function(paletteGroup, i) {
      var clickHandler, data, expansion, k, len1, newBlock, newPaletteBlocks, paletteGroupBlocks, paletteGroupHeader, ref2, updatePalette;
      if (i % 2 === 0) {
        paletteHeaderRow = document.createElement('div');
        paletteHeaderRow.className = 'droplet-palette-header-row';
        _this.paletteHeader.appendChild(paletteHeaderRow);
        if (_this.paletteGroups.length === 1 && !paletteGroup.name) {
          paletteHeaderRow.style.height = 0;
        }
      }
      paletteGroupHeader = document.createElement('div');
      paletteGroupHeader.className = 'droplet-palette-group-header';
      paletteGroupHeader.innerText = paletteGroupHeader.textContent = paletteGroupHeader.textContent = paletteGroup.name;
      if (paletteGroup.color) {
        paletteGroupHeader.className += ' ' + paletteGroup.color;
      }
      paletteHeaderRow.appendChild(paletteGroupHeader);
      newPaletteBlocks = [];
      ref2 = paletteGroup.blocks;
      for (k = 0, len1 = ref2.length; k < len1; k++) {
        data = ref2[k];
        newBlock = parseBlock(_this.mode, data.block);
        expansion = data.expansion || null;
        newPaletteBlocks.push({
          block: newBlock,
          expansion: expansion,
          title: data.title,
          id: data.id
        });
      }
      paletteGroupBlocks = newPaletteBlocks;
      updatePalette = function() {
        var ref3;
        _this.currentPaletteGroup = paletteGroup.name;
        _this.currentPaletteBlocks = paletteGroupBlocks;
        _this.currentPaletteMetadata = paletteGroupBlocks;
        if ((ref3 = _this.currentPaletteGroupHeader) != null) {
          ref3.className = _this.currentPaletteGroupHeader.className.replace(/\s[-\w]*-selected\b/, '');
        }
        _this.currentPaletteGroupHeader = paletteGroupHeader;
        _this.currentPaletteIndex = i;
        _this.currentPaletteGroupHeader.className += ' droplet-palette-group-header-selected';
        _this.rebuildPalette();
        return _this.fireEvent('selectpalette', [paletteGroup.name]);
      };
      clickHandler = function() {
        return updatePalette();
      };
      paletteGroupHeader.addEventListener('click', clickHandler);
      paletteGroupHeader.addEventListener('touchstart', clickHandler);
      if (i === 0) {
        return updatePalette();
      }
    };
  })(this);
  for (i = j = 0, len = ref1.length; j < len; i = ++j) {
    paletteGroup = ref1[i];
    fn1(paletteGroup, i);
  }
  this.resizePalette();
  return this.resizePaletteHighlight();
};

hook('mousedown', 6, function(point, event, state) {
  var entry, hitTestResult, j, len, palettePoint, ref1, ref2, ref3;
  if (state.consumedHitTest) {
    return;
  }
  if (!this.trackerPointIsInPalette(point)) {
    return;
  }
  palettePoint = this.trackerPointToPalette(point);
  if ((this.scrollOffsets.palette.y < (ref1 = palettePoint.y) && ref1 < this.scrollOffsets.palette.y + this.paletteCanvas.height) && (this.scrollOffsets.palette.x < (ref2 = palettePoint.x) && ref2 < this.scrollOffsets.palette.x + this.paletteCanvas.width)) {
    if (this.handleTextInputClickInPalette(palettePoint)) {
      state.consumedHitTest = true;
      return;
    }
    ref3 = this.currentPaletteBlocks;
    for (j = 0, len = ref3.length; j < len; j++) {
      entry = ref3[j];
      hitTestResult = this.hitTest(palettePoint, entry.block, this.paletteView);
      if (hitTestResult != null) {
        this.clickedBlock = entry.block;
        this.clickedPoint = point;
        this.clickedBlockPaletteEntry = entry;
        state.consumedHitTest = true;
        this.fireEvent('pickblock', [entry.id]);
        return;
      }
    }
  }
  return this.clickedBlockPaletteEntry = null;
});

hook('populate', 1, function() {
  this.paletteHighlightCanvas = document.createElement('canvas');
  this.paletteHighlightCanvas.className = 'droplet-palette-highlight-canvas';
  this.paletteHighlightCtx = this.paletteHighlightCanvas.getContext('2d');
  this.paletteHighlightPath = null;
  this.currentHighlightedPaletteBlock = null;
  return this.paletteElement.appendChild(this.paletteHighlightCanvas);
});

Editor.prototype.resizePaletteHighlight = function() {
  this.paletteHighlightCanvas.style.top = this.paletteHeader.offsetHeight + 'px';
  this.paletteHighlightCanvas.width = this.paletteCanvas.width;
  return this.paletteHighlightCanvas.height = this.paletteCanvas.height;
};

hook('redraw_palette', 0, function() {
  this.clearPaletteHighlightCanvas();
  if (this.currentHighlightedPaletteBlock != null) {
    return this.paletteHighlightPath.draw(this.paletteHighlightCtx);
  }
});

hook('rebuild_palette', 1, function() {
  var block, bounds, data, fn1, hoverDiv, j, len, ref1, ref2, results;
  this.paletteScrollerStuffing.innerHTML = '';
  this.currentHighlightedPaletteBlock = null;
  ref1 = this.currentPaletteMetadata;
  fn1 = (function(_this) {
    return function(block) {
      hoverDiv.addEventListener('mousemove', function(event) {
        var palettePoint;
        palettePoint = _this.trackerPointToPalette(new _this.draw.Point(event.clientX, event.clientY));
        if (_this.viewOrChildrenContains(block, palettePoint, _this.paletteView)) {
          _this.clearPaletteHighlightCanvas();
          _this.paletteHighlightPath = _this.getHighlightPath(block, {
            color: '#FF0'
          }, _this.paletteView);
          _this.paletteHighlightPath.draw(_this.paletteHighlightCtx);
          return _this.currentHighlightedPaletteBlock = block;
        } else if (block === _this.currentHighlightedPaletteBlock) {
          _this.currentHighlightedPaletteBlock = null;
          return _this.clearPaletteHighlightCanvas();
        }
      });
      return hoverDiv.addEventListener('mouseout', function(event) {
        if (block === _this.currentHighlightedPaletteBlock) {
          _this.currentHighlightedPaletteBlock = null;
          return _this.paletteHighlightCtx.clearRect(_this.scrollOffsets.palette.x, _this.scrollOffsets.palette.y, _this.paletteHighlightCanvas.width + _this.scrollOffsets.palette.x, _this.paletteHighlightCanvas.height + _this.scrollOffsets.palette.y);
        }
      });
    };
  })(this);
  results = [];
  for (j = 0, len = ref1.length; j < len; j++) {
    data = ref1[j];
    block = data.block;
    hoverDiv = document.createElement('div');
    hoverDiv.className = 'droplet-hover-div';
    hoverDiv.title = (ref2 = data.title) != null ? ref2 : block.stringify();
    if (data.id != null) {
      hoverDiv.setAttribute('data-id', data.id);
    }
    bounds = this.paletteView.getViewNodeFor(block).totalBounds;
    hoverDiv.style.top = bounds.y + "px";
    hoverDiv.style.left = bounds.x + "px";
    hoverDiv.style.width = (Math.min(bounds.width, Infinity)) + "px";
    hoverDiv.style.height = bounds.height + "px";
    fn1(block);
    results.push(this.paletteScrollerStuffing.appendChild(hoverDiv));
  }
  return results;
});

hook('populate', 1, function() {
  var event, j, len, ref1, results;
  this.hiddenInput = document.createElement('textarea');
  this.hiddenInput.className = 'droplet-hidden-input';
  this.hiddenInput.addEventListener('focus', (function(_this) {
    return function() {
      var bounds, inputLeft, inputTop;
      if (_this.cursorAtSocket()) {
        bounds = _this.view.getViewNodeFor(_this.getCursor()).bounds[0];
        inputLeft = bounds.x + _this.mainCanvas.offsetLeft - _this.scrollOffsets.main.x;
        inputLeft = Math.min(inputLeft, _this.dropletElement.clientWidth - 10);
        inputLeft = Math.max(_this.mainCanvas.offsetLeft, inputLeft);
        _this.hiddenInput.style.left = inputLeft + 'px';
        inputTop = bounds.y - _this.scrollOffsets.main.y;
        inputTop = Math.min(inputTop, _this.dropletElement.clientHeight - 10);
        inputTop = Math.max(0, inputTop);
        return _this.hiddenInput.style.top = inputTop + 'px';
      }
    };
  })(this));
  this.dropletElement.appendChild(this.hiddenInput);
  this.textInputAnchor = null;
  this.textInputSelecting = false;
  this.oldFocusValue = null;
  this.hiddenInput.addEventListener('keydown', (function(_this) {
    return function(event) {
      var ref1;
      if (event.keyCode === 8 && _this.hiddenInput.value.length > 1 && _this.hiddenInput.value[0] === _this.hiddenInput.value[_this.hiddenInput.value.length - 1] && ((ref1 = _this.hiddenInput.value[0]) === '\'' || ref1 === '\"') && _this.hiddenInput.selectionEnd === 1) {
        return event.preventDefault();
      }
    };
  })(this));
  ref1 = ['input', 'keyup', 'keydown', 'select'];
  results = [];
  for (j = 0, len = ref1.length; j < len; j++) {
    event = ref1[j];
    results.push(this.hiddenInput.addEventListener(event, (function(_this) {
      return function() {
        _this.highlightFlashShow();
        if (_this.cursorAtSocket()) {
          _this.redrawTextInput();
          if (_this.dropdownVisible) {
            return _this.formatDropdown();
          }
        }
      };
    })(this)));
  }
  return results;
});

Editor.prototype.resizeAceElement = function() {
  var width;
  width = this.wrapperElement.clientWidth;
  if (this.showPaletteInTextMode && this.paletteEnabled) {
    width -= this.paletteWrapper.offsetWidth;
  }
  this.aceElement.style.width = width + "px";
  return this.aceElement.style.height = this.wrapperElement.clientHeight + "px";
};

last_ = function(array) {
  return array[array.length - 1];
};

Editor.prototype.redrawTextInput = function() {
  var dropletDocument, endRow, head, line, newp, oldp, rect, sameLength, startRow, textFocusView, treeView;
  sameLength = this.getCursor().stringify().split('\n').length === this.hiddenInput.value.split('\n').length;
  dropletDocument = this.getCursor().getDocument();
  this.populateSocket(this.getCursor(), this.hiddenInput.value);
  textFocusView = this.view.getViewNodeFor(this.getCursor());
  startRow = this.getCursor().stringify().slice(0, this.hiddenInput.selectionStart).split('\n').length - 1;
  endRow = this.getCursor().stringify().slice(0, this.hiddenInput.selectionEnd).split('\n').length - 1;
  if (sameLength && startRow === endRow) {
    line = endRow;
    head = this.getCursor().start;
    while (head !== dropletDocument.start) {
      head = head.prev;
      if (head.type === 'newline') {
        line++;
      }
    }
    treeView = this.view.getViewNodeFor(dropletDocument);
    oldp = helper.deepCopy([treeView.glue[line - 1], treeView.glue[line], treeView.bounds[line].height]);
    treeView.layout();
    newp = helper.deepCopy([treeView.glue[line - 1], treeView.glue[line], treeView.bounds[line].height]);
    if (helper.deepEquals(newp, oldp)) {
      rect = new this.draw.NoRectangle();
      if (line > 0) {
        rect.unite(treeView.bounds[line - 1]);
      }
      rect.unite(treeView.bounds[line]);
      if (line + 1 < treeView.bounds.length) {
        rect.unite(treeView.bounds[line + 1]);
      }
      rect.width = Math.max(rect.width, this.mainCanvas.width);
      return this.redrawMain({
        boundingRectangle: rect
      });
    } else {
      return this.redrawMain();
    }
  } else {
    return this.redrawMain();
  }
};

Editor.prototype.redrawTextHighlights = function(scrollIntoView) {
  var endPosition, endRow, i, j, lines, ref1, ref2, startPosition, startRow, textFocusView;
  if (scrollIntoView == null) {
    scrollIntoView = false;
  }
  if (!this.cursorAtSocket()) {
    return;
  }
  textFocusView = this.view.getViewNodeFor(this.getCursor());
  startRow = this.getCursor().stringify().slice(0, this.hiddenInput.selectionStart).split('\n').length - 1;
  endRow = this.getCursor().stringify().slice(0, this.hiddenInput.selectionEnd).split('\n').length - 1;
  lines = this.getCursor().stringify().split('\n');
  startPosition = textFocusView.bounds[startRow].x + this.view.opts.textPadding + this.mainCtx.measureText(last_(this.getCursor().stringify().slice(0, this.hiddenInput.selectionStart).split('\n'))).width + (this.getCursor().hasDropdown() ? helper.DROPDOWN_ARROW_WIDTH : 0);
  endPosition = textFocusView.bounds[endRow].x + this.view.opts.textPadding + this.mainCtx.measureText(last_(this.getCursor().stringify().slice(0, this.hiddenInput.selectionEnd).split('\n'))).width + (this.getCursor().hasDropdown() ? helper.DROPDOWN_ARROW_WIDTH : 0);
  if (this.hiddenInput.selectionStart === this.hiddenInput.selectionEnd) {
    this.cursorCtx.lineWidth = 1;
    this.cursorCtx.strokeStyle = '#000';
    this.cursorCtx.strokeRect(startPosition, textFocusView.bounds[startRow].y, 0, this.view.opts.textHeight);
    this.textInputHighlighted = false;
  } else {
    this.textInputHighlighted = true;
    this.cursorCtx.fillStyle = 'rgba(0, 0, 256, 0.3)';
    if (startRow === endRow) {
      this.cursorCtx.fillRect(startPosition, textFocusView.bounds[startRow].y + this.view.opts.textPadding, endPosition - startPosition, this.view.opts.textHeight);
    } else {
      this.cursorCtx.fillRect(startPosition, textFocusView.bounds[startRow].y + this.view.opts.textPadding, textFocusView.bounds[startRow].right() - this.view.opts.textPadding - startPosition, this.view.opts.textHeight);
      for (i = j = ref1 = startRow + 1, ref2 = endRow; ref1 <= ref2 ? j < ref2 : j > ref2; i = ref1 <= ref2 ? ++j : --j) {
        this.cursorCtx.fillRect(textFocusView.bounds[i].x, textFocusView.bounds[i].y + this.view.opts.textPadding, textFocusView.bounds[i].width, this.view.opts.textHeight);
      }
      this.cursorCtx.fillRect(textFocusView.bounds[endRow].x, textFocusView.bounds[endRow].y + this.view.opts.textPadding, endPosition - textFocusView.bounds[endRow].x, this.view.opts.textHeight);
    }
  }
  if (scrollIntoView && endPosition > this.scrollOffsets.main.x + this.mainCanvas.width) {
    return this.mainScroller.scrollLeft = endPosition - this.mainCanvas.width + this.view.opts.padding;
  }
};

escapeString = function(str) {
  return str[0] + str.slice(1, -1).replace(/(\'|\"|\n)/g, '\\$1') + str[str.length - 1];
};

hook('mousedown', 7, function() {
  return this.hideDropdown();
});

Editor.prototype.reparse = function(list, recovery, updates, originalTrigger) {
  var context, e, error, error1, newList, originalText, originalUpdates, parent, ref1;
  if (updates == null) {
    updates = [];
  }
  if (originalTrigger == null) {
    originalTrigger = list;
  }
  if (list.start.type === 'socketStart') {
    if (list.start.next === list.end) {
      return;
    }
    originalText = list.textContent();
    originalUpdates = updates.map(function(location) {
      return {
        count: location.count,
        type: location.type
      };
    });
    this.reparse(new model.List(list.start.next, list.end.prev), recovery, updates, originalTrigger);
    if (!this.reparse(list.parent, recovery, updates, originalTrigger)) {
      this.populateSocket(list, originalText);
      originalUpdates.forEach(function(location, i) {
        updates[i].count = location.count;
        return updates[i].type = location.type;
      });
      this.reparse(list.parent, recovery, updates, originalTrigger);
    }
    return;
  }
  parent = list.start.parent;
  context = ((ref1 = list.start.container) != null ? ref1 : list.start.parent).parseContext;
  try {
    newList = this.mode.parse(list.stringifyInPlace(), {
      wrapAtRoot: parent.type !== 'socket',
      context: context
    });
  } catch (error) {
    e = error;
    try {
      newList = this.mode.parse(recovery(list.stringifyInPlace()), {
        wrapAtRoot: parent.type !== 'socket',
        context: context
      });
    } catch (error1) {
      e = error1;
      while ((parent != null) && parent.type === 'socket') {
        parent = parent.parent;
      }
      if (parent != null) {
        return this.reparse(parent, recovery, updates, originalTrigger);
      } else {
        this.markBlock(originalTrigger, {
          color: '#F00'
        });
        return false;
      }
    }
  }
  if (newList.start.next === newList.end) {
    return;
  }
  newList = new model.List(newList.start.next, newList.end.prev);
  newList.traverseOneLevel((function(_this) {
    return function(head) {
      return _this.prepareNode(head, parent);
    };
  })(this));
  this.replace(list, newList, updates);
  this.redrawMain();
  return true;
};

Editor.prototype.setTextSelectionRange = function(selectionStart, selectionEnd) {
  var ref1;
  if ((selectionStart != null) && (selectionEnd == null)) {
    selectionEnd = selectionStart;
  }
  if (this.cursorAtSocket()) {
    this.hiddenInput.focus();
    if ((selectionStart != null) && (selectionEnd != null)) {
      this.hiddenInput.setSelectionRange(selectionStart, selectionEnd);
    } else if (this.hiddenInput.value[0] === this.hiddenInput.value[this.hiddenInput.value.length - 1] && ((ref1 = this.hiddenInput.value[0]) === '\'' || ref1 === '"')) {
      this.hiddenInput.setSelectionRange(1, this.hiddenInput.value.length - 1);
    } else {
      this.hiddenInput.setSelectionRange(0, this.hiddenInput.value.length);
    }
    this.redrawTextInput();
  }
  this.redrawMain();
  return this.redrawTextInput();
};

Editor.prototype.cursorAtSocket = function() {
  return this.getCursor().type === 'socket';
};

Editor.prototype.populateSocket = function(socket, string) {
  var first, i, j, last, len, line, lines;
  if (socket.textContent() !== string) {
    lines = string.split('\n');
    if (socket.start.next !== socket.end) {
      this.spliceOut(new model.List(socket.start.next, socket.end.prev));
    }
    first = last = new model.TextToken(lines[0]);
    for (i = j = 0, len = lines.length; j < len; i = ++j) {
      line = lines[i];
      if (!(i > 0)) {
        continue;
      }
      last = helper.connect(last, new model.NewlineToken());
      last = helper.connect(last, new model.TextToken(line));
    }
    return this.spliceIn(new model.List(first, last), socket.start);
  }
};

Editor.prototype.populateBlock = function(block, string) {
  var location, newBlock, ref1;
  newBlock = this.mode.parse(string, {
    wrapAtRoot: false
  }).start.next.container;
  if (newBlock) {
    location = block.start.prev;
    while ((location != null ? location.type : void 0) === 'newline' && !(((ref1 = location.prev) != null ? ref1.type : void 0) === 'indentStart' && location.prev.container.end === block.end.next)) {
      location = location.prev;
    }
    this.spliceOut(block);
    this.spliceIn(newBlock, location);
    return true;
  }
  return false;
};

Editor.prototype.hitTestTextInput = function(point, block) {
  var head;
  head = block.start;
  while (head != null) {
    if (head.type === 'socketStart' && head.container.isDroppable() && this.view.getViewNodeFor(head.container).path.contains(point)) {
      return head.container;
    }
    head = head.next;
  }
  return null;
};

Editor.prototype.getTextPosition = function(point) {
  var column, lines, row, textFocusView;
  textFocusView = this.view.getViewNodeFor(this.getCursor());
  row = Math.floor((point.y - textFocusView.bounds[0].y) / (this.fontSize + 2 * this.view.opts.padding));
  row = Math.max(row, 0);
  row = Math.min(row, textFocusView.lineLength - 1);
  column = Math.max(0, Math.round((point.x - textFocusView.bounds[row].x - this.view.opts.textPadding - (this.getCursor().hasDropdown() ? helper.DROPDOWN_ARROW_WIDTH : 0)) / this.mainCtx.measureText(' ').width));
  lines = this.getCursor().stringify().split('\n').slice(0, +row + 1 || 9e9);
  lines[lines.length - 1] = lines[lines.length - 1].slice(0, column);
  return lines.join('\n').length;
};

Editor.prototype.setTextInputAnchor = function(point) {
  this.textInputAnchor = this.textInputHead = this.getTextPosition(point);
  return this.hiddenInput.setSelectionRange(this.textInputAnchor, this.textInputHead);
};

Editor.prototype.selectDoubleClick = function(point) {
  var after, before, position, ref1, ref2, ref3, ref4;
  position = this.getTextPosition(point);
  before = (ref1 = (ref2 = this.getCursor().stringify().slice(0, position).match(/\w*$/)[0]) != null ? ref2.length : void 0) != null ? ref1 : 0;
  after = (ref3 = (ref4 = this.getCursor().stringify().slice(position).match(/^\w*/)[0]) != null ? ref4.length : void 0) != null ? ref3 : 0;
  this.textInputAnchor = position - before;
  this.textInputHead = position + after;
  return this.hiddenInput.setSelectionRange(this.textInputAnchor, this.textInputHead);
};

Editor.prototype.setTextInputHead = function(point) {
  this.textInputHead = this.getTextPosition(point);
  return this.hiddenInput.setSelectionRange(Math.min(this.textInputAnchor, this.textInputHead), Math.max(this.textInputAnchor, this.textInputHead));
};

Editor.prototype.handleTextInputClick = function(mainPoint, dropletDocument) {
  var hitTestResult;
  hitTestResult = this.hitTestTextInput(mainPoint, dropletDocument);
  if (hitTestResult != null) {
    if (hitTestResult !== this.getCursor()) {
      if (hitTestResult.editable()) {
        this.undoCapture();
        this.setCursor(hitTestResult);
        this.redrawMain();
      }
      if (hitTestResult.hasDropdown() && ((!hitTestResult.editable()) || mainPoint.x - this.view.getViewNodeFor(hitTestResult).bounds[0].x < helper.DROPDOWN_ARROW_WIDTH)) {
        this.showDropdown(hitTestResult);
      }
      this.textInputSelecting = false;
    } else {
      if (this.getCursor().hasDropdown() && mainPoint.x - this.view.getViewNodeFor(hitTestResult).bounds[0].x < helper.DROPDOWN_ARROW_WIDTH) {
        this.showDropdown();
      }
      this.setTextInputAnchor(mainPoint);
      this.redrawTextInput();
      this.textInputSelecting = true;
    }
    this.hiddenInput.focus();
    return true;
  } else {
    return false;
  }
};

Editor.prototype.hitTestTextInputInPalette = function(point, block) {
  var head;
  head = block.start;
  while (head != null) {
    if (head.type === 'socketStart' && head.container.isDroppable() && this.paletteView.getViewNodeFor(head.container).path.contains(point)) {
      return head.container;
    }
    head = head.next;
  }
  return null;
};

Editor.prototype.handleTextInputClickInPalette = function(palettePoint) {
  var entry, hitTestResult, j, len, ref1;
  ref1 = this.currentPaletteBlocks;
  for (j = 0, len = ref1.length; j < len; j++) {
    entry = ref1[j];
    hitTestResult = this.hitTestTextInputInPalette(palettePoint, entry.block);
    if (hitTestResult != null) {
      if (hitTestResult.hasDropdown()) {
        this.showDropdown(hitTestResult, true);
        return true;
      }
    }
  }
  return false;
};

hook('populate', 0, function() {
  this.dropdownElement = document.createElement('div');
  this.dropdownElement.className = 'droplet-dropdown';
  this.wrapperElement.appendChild(this.dropdownElement);
  this.dropdownElement.innerHTML = '';
  this.dropdownElement.style.display = 'inline-block';
  return this.dropdownVisible = false;
});

Editor.prototype.formatDropdown = function(socket, view) {
  if (socket == null) {
    socket = this.getCursor();
  }
  if (view == null) {
    view = this.view;
  }
  this.dropdownElement.style.fontFamily = this.fontFamily;
  this.dropdownElement.style.fontSize = this.fontSize;
  return this.dropdownElement.style.minWidth = view.getViewNodeFor(socket).bounds[0].width;
};

Editor.prototype.getDropdownList = function(socket) {
  var result;
  result = socket.dropdown;
  if (result.generate) {
    result = result.generate;
  }
  if ('function' === typeof result) {
    result = socket.dropdown();
  } else {
    result = socket.dropdown;
  }
  if (result.options) {
    result = result.options;
  }
  return result.map(function(x) {
    if ('string' === typeof x) {
      return {
        text: x,
        display: x
      };
    } else {
      return x;
    }
  });
};

Editor.prototype.showDropdown = function(socket, inPalette) {
  var dropdownItems, el, fn1, i, j, len, ref1;
  if (socket == null) {
    socket = this.getCursor();
  }
  if (inPalette == null) {
    inPalette = false;
  }
  this.dropdownVisible = true;
  dropdownItems = [];
  this.dropdownElement.innerHTML = '';
  this.dropdownElement.style.display = 'inline-block';
  this.formatDropdown(socket, inPalette ? this.paletteView : this.view);
  ref1 = this.getDropdownList(socket);
  fn1 = (function(_this) {
    return function(el) {
      var div, setText;
      div = document.createElement('div');
      div.innerHTML = el.display;
      div.className = 'droplet-dropdown-item';
      dropdownItems.push(div);
      div.style.paddingLeft = helper.DROPDOWN_ARROW_WIDTH;
      setText = function(text) {
        _this.undoCapture();
        if (_this.dropdownElement.style.display === 'none') {
          return;
        }
        if (inPalette) {
          _this.populateSocket(socket, text);
          _this.redrawPalette();
        } else {
          if (!_this.cursorAtSocket()) {
            return;
          }
          _this.populateSocket(_this.getCursor(), text);
          _this.hiddenInput.value = text;
          _this.redrawMain();
        }
        return _this.hideDropdown();
      };
      div.addEventListener('mouseup', function() {
        if (el.click) {
          return el.click(setText);
        } else {
          return setText(el.text);
        }
      });
      return _this.dropdownElement.appendChild(div);
    };
  })(this);
  for (i = j = 0, len = ref1.length; j < len; i = ++j) {
    el = ref1[i];
    fn1(el);
  }
  this.dropdownElement.style.top = '-9999px';
  this.dropdownElement.style.left = '-9999px';
  return setTimeout(((function(_this) {
    return function() {
      var dropdownTop, k, len1, location;
      if (_this.dropdownElement.offsetHeight < _this.dropdownElement.scrollHeight) {
        for (k = 0, len1 = dropdownItems.length; k < len1; k++) {
          el = dropdownItems[k];
          el.style.paddingRight = DROPDOWN_SCROLLBAR_PADDING;
        }
      }
      if (inPalette) {
        location = _this.paletteView.getViewNodeFor(socket).bounds[0];
        _this.dropdownElement.style.left = location.x - _this.scrollOffsets.palette.x + _this.paletteCanvas.offsetLeft + 'px';
        _this.dropdownElement.style.minWidth = location.width + 'px';
        dropdownTop = location.y + _this.fontSize - _this.scrollOffsets.palette.y + _this.paletteCanvas.offsetTop;
        if (dropdownTop + _this.dropdownElement.offsetHeight > _this.paletteElement.offsetHeight) {
          dropdownTop -= _this.fontSize + _this.dropdownElement.offsetHeight;
        }
        return _this.dropdownElement.style.top = dropdownTop + 'px';
      } else {
        location = _this.view.getViewNodeFor(socket).bounds[0];
        _this.dropdownElement.style.left = location.x - _this.scrollOffsets.main.x + _this.dropletElement.offsetLeft + _this.mainCanvas.offsetLeft + 'px';
        _this.dropdownElement.style.minWidth = location.width + 'px';
        dropdownTop = location.y + _this.fontSize - _this.scrollOffsets.main.y;
        if (dropdownTop + _this.dropdownElement.offsetHeight > _this.dropletElement.offsetHeight) {
          dropdownTop -= _this.fontSize + _this.dropdownElement.offsetHeight;
        }
        return _this.dropdownElement.style.top = dropdownTop + 'px';
      }
    };
  })(this)), 0);
};

Editor.prototype.hideDropdown = function() {
  this.dropdownVisible = false;
  this.dropdownElement.style.display = 'none';
  return this.dropletElement.focus();
};

hook('dblclick', 0, function(point, event, state) {
  var dropletDocument, hitTestResult, j, len, mainPoint, ref1;
  if (state.consumedHitTest) {
    return;
  }
  ref1 = this.getDocuments();
  for (j = 0, len = ref1.length; j < len; j++) {
    dropletDocument = ref1[j];
    mainPoint = this.trackerPointToMain(point);
    hitTestResult = this.hitTestTextInput(mainPoint, this.tree);
    if (hitTestResult !== this.getCursor()) {
      if ((hitTestResult != null) && hitTestResult.editable()) {
        this.redrawMain();
        hitTestResult = this.hitTestTextInput(mainPoint, this.tree);
      }
    }
    if ((hitTestResult != null) && hitTestResult.editable()) {
      this.setCursor(hitTestResult);
      this.redrawMain();
      setTimeout(((function(_this) {
        return function() {
          _this.selectDoubleClick(mainPoint);
          _this.redrawTextInput();
          return _this.textInputSelecting = false;
        };
      })(this)), 0);
      state.consumedHitTest = true;
      return;
    }
  }
});

hook('mousemove', 0, function(point, event, state) {
  var mainPoint;
  if (this.textInputSelecting) {
    if (!this.cursorAtSocket()) {
      this.textInputSelecting = false;
      return;
    }
    mainPoint = this.trackerPointToMain(point);
    this.setTextInputHead(mainPoint);
    return this.redrawTextInput();
  }
});

hook('mouseup', 0, function(point, event, state) {
  var mainPoint;
  if (this.textInputSelecting) {
    mainPoint = this.trackerPointToMain(point);
    this.setTextInputHead(mainPoint);
    this.redrawTextInput();
    return this.textInputSelecting = false;
  }
});

hook('populate', 0, function() {
  this.lassoSelectCanvas = document.createElement('canvas');
  this.lassoSelectCanvas.className = 'droplet-lasso-select-canvas';
  this.lassoSelectCtx = this.lassoSelectCanvas.getContext('2d');
  this.lassoSelectAnchor = null;
  this.lassoSelection = null;
  return this.dropletElement.appendChild(this.lassoSelectCanvas);
});

Editor.prototype.clearLassoSelectCanvas = function() {
  return this.lassoSelectCtx.clearRect(0, 0, this.lassoSelectCanvas.width, this.lassoSelectCanvas.height);
};

Editor.prototype.resizeLassoCanvas = function() {
  this.lassoSelectCanvas.width = this.dropletElement.offsetWidth - this.gutter.offsetWidth;
  this.lassoSelectCanvas.style.width = this.lassoSelectCanvas.width + "px";
  this.lassoSelectCanvas.height = this.dropletElement.offsetHeight;
  this.lassoSelectCanvas.style.height = this.lassoSelectCanvas.height + "px";
  return this.lassoSelectCanvas.style.left = this.mainCanvas.offsetLeft + "px";
};

Editor.prototype.clearLassoSelection = function() {
  this.lassoSelection = null;
  return this.redrawHighlights();
};

hook('mousedown', 0, function(point, event, state) {
  var mainPoint, palettePoint;
  if (!state.clickedLassoSelection) {
    this.clearLassoSelection();
  }
  if (state.consumedHitTest || state.suppressLassoSelect) {
    return;
  }
  if (!this.trackerPointIsInMain(point)) {
    return;
  }
  if (this.trackerPointIsInPalette(point)) {
    return;
  }
  mainPoint = this.trackerPointToMain(point).from(this.scrollOffsets.main);
  palettePoint = this.trackerPointToPalette(point).from(this.scrollOffsets.palette);
  return this.lassoSelectAnchor = this.trackerPointToMain(point);
});

hook('mousemove', 0, function(point, event, state) {
  var dropletDocument, findLassoSelect, j, lassoRectangle, len, mainPoint, ref1, results;
  if (this.lassoSelectAnchor != null) {
    mainPoint = this.trackerPointToMain(point);
    this.clearLassoSelectCanvas();
    lassoRectangle = new this.draw.Rectangle(Math.min(this.lassoSelectAnchor.x, mainPoint.x), Math.min(this.lassoSelectAnchor.y, mainPoint.y), Math.abs(this.lassoSelectAnchor.x - mainPoint.x), Math.abs(this.lassoSelectAnchor.y - mainPoint.y));
    findLassoSelect = (function(_this) {
      return function(dropletDocument) {
        var first, last, ref1;
        first = dropletDocument.start;
        while (!((first == null) || first.type === 'blockStart' && _this.view.getViewNodeFor(first.container).path.intersects(lassoRectangle))) {
          first = first.next;
        }
        last = dropletDocument.end;
        while (!((last == null) || last.type === 'blockEnd' && _this.view.getViewNodeFor(last.container).path.intersects(lassoRectangle))) {
          last = last.prev;
        }
        _this.clearLassoSelectCanvas();
        _this.clearHighlightCanvas();
        _this.lassoSelectCtx.strokeStyle = '#00f';
        _this.lassoSelectCtx.strokeRect(lassoRectangle.x - _this.scrollOffsets.main.x, lassoRectangle.y - _this.scrollOffsets.main.y, lassoRectangle.width, lassoRectangle.height);
        if (first && (last != null)) {
          ref1 = validateLassoSelection(dropletDocument, first, last), first = ref1[0], last = ref1[1];
          _this.lassoSelection = new model.List(first, last);
          _this.redrawLassoHighlight();
          return true;
        } else {
          _this.lassoSelection = null;
          return false;
        }
      };
    })(this);
    if (!((this.lassoSelectionDocument != null) && findLassoSelect(this.lassoSelectionDocument))) {
      ref1 = this.getDocuments();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        dropletDocument = ref1[j];
        if (findLassoSelect(dropletDocument)) {
          this.lassoSelectionDocument = dropletDocument;
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  }
});

Editor.prototype.redrawLassoHighlight = function() {
  var lassoView, mainCanvasRectangle;
  if (this.lassoSelection != null) {
    mainCanvasRectangle = new this.draw.Rectangle(this.scrollOffsets.main.x, this.scrollOffsets.main.y, this.mainCanvas.width, this.mainCanvas.height);
    lassoView = this.view.getViewNodeFor(this.lassoSelection);
    lassoView.absorbCache();
    lassoView.draw(this.highlightCtx, mainCanvasRectangle, {
      selected: true
    });
    return this.maskFloatingPaths(this.lassoSelection.start.getDocument());
  }
};

Editor.prototype.maskFloatingPaths = function(dropletDocument) {
  var i, j, record, ref1, results;
  ref1 = this.floatingBlocks;
  results = [];
  for (i = j = ref1.length - 1; j >= 0; i = j += -1) {
    record = ref1[i];
    if (record.block === dropletDocument) {
      break;
    } else {
      this.highlightCtx.save();
      record.grayBoxPath.clip(this.highlightCtx);
      record.grayBoxPath.bounds().clearRect(this.highlightCtx);
      results.push(this.highlightCtx.restore());
    }
  }
  return results;
};

validateLassoSelection = function(tree, first, last) {
  var head, tokensToInclude;
  tokensToInclude = [];
  head = first;
  while (head !== last.next) {
    if (head instanceof model.StartToken || head instanceof model.EndToken) {
      tokensToInclude.push(head.container.start);
      tokensToInclude.push(head.container.end);
    }
    head = head.next;
  }
  first = tree.start;
  while (indexOf.call(tokensToInclude, first) < 0) {
    first = first.next;
  }
  last = tree.end;
  while (indexOf.call(tokensToInclude, last) < 0) {
    last = last.prev;
  }
  while (first.type !== 'blockStart') {
    first = first.prev;
    if (first.type === 'blockEnd') {
      first = first.container.start.prev;
    }
  }
  while (last.type !== 'blockEnd') {
    last = last.next;
    if (last.type === 'blockStart') {
      last = last.container.end.next;
    }
  }
  return [first, last];
};

hook('mouseup', 0, function(point, event, state) {
  if (this.lassoSelectAnchor != null) {
    if (this.lassoSelection != null) {
      this.setCursor(this.lassoSelection.end);
    }
    this.lassoSelectAnchor = null;
    this.clearLassoSelectCanvas();
    this.redrawHighlights();
  }
  return this.lassoSelectionDocument = null;
});

hook('mousedown', 3, function(point, event, state) {
  if (state.consumedHitTest) {
    return;
  }
  if ((this.lassoSelection != null) && (this.hitTest(this.trackerPointToMain(point), this.lassoSelection) != null)) {
    this.clickedBlock = this.lassoSelection;
    this.clickedBlockPaletteEntry = null;
    this.clickedPoint = point;
    state.consumedHitTest = true;
    return state.clickedLassoSelection = true;
  }
});

hook('populate', 0, function() {
  return this.cursor = new CrossDocumentLocation(0, new model.Location(0, 'documentStart'));
});

CrossDocumentLocation = (function() {
  function CrossDocumentLocation(document1, location1) {
    this.document = document1;
    this.location = location1;
  }

  CrossDocumentLocation.prototype.is = function(other) {
    return this.location.is(other.location) && this.document === other.document;
  };

  CrossDocumentLocation.prototype.clone = function() {
    return new CrossDocumentLocation(this.document, this.location.clone());
  };

  return CrossDocumentLocation;

})();

Editor.prototype.validCursorPosition = function(destination) {
  var ref1, ref2;
  return ((ref1 = destination.type) === 'documentStart' || ref1 === 'indentStart') || destination.type === 'blockEnd' && ((ref2 = destination.parent.type) === 'document' || ref2 === 'indent') || destination.type === 'socketStart' && destination.container.editable();
};

Editor.prototype.setCursor = function(destination, validate, direction) {
  var end, ref1, ref2, start;
  if (validate == null) {
    validate = (function() {
      return true;
    });
  }
  if (direction == null) {
    direction = 'after';
  }
  if ((destination != null) && destination instanceof CrossDocumentLocation) {
    destination = this.fromCrossDocumentLocation(destination);
  }
  if (!((destination != null) && this.inDisplay(destination))) {
    return;
  }
  if (destination instanceof model.Container) {
    destination = destination.start;
  }
  while (!(this.validCursorPosition(destination) && validate(destination))) {
    destination = (direction === 'after' ? destination.next : destination.prev);
    if (destination == null) {
      return;
    }
  }
  destination = this.toCrossDocumentLocation(destination);
  if (this.cursorAtSocket() && !this.cursor.is(destination)) {
    this.reparse(this.getCursor(), null, (destination.document === this.cursor.document ? [destination.location] : []));
    this.hiddenInput.blur();
    this.dropletElement.focus();
  }
  this.cursor = destination;
  this.correctCursor();
  this.redrawMain();
  this.highlightFlashShow();
  if (this.cursorAtSocket()) {
    if (((ref1 = this.getCursor()) != null ? ref1.id : void 0) in this.extraMarks) {
      delete this.extraMarks[typeof focus !== "undefined" && focus !== null ? focus.id : void 0];
    }
    this.undoCapture();
    this.hiddenInput.value = this.getCursor().textContent();
    this.hiddenInput.focus();
    ref2 = this.mode.getDefaultSelectionRange(this.hiddenInput.value), start = ref2.start, end = ref2.end;
    return this.setTextSelectionRange(start, end);
  }
};

Editor.prototype.determineCursorPosition = function() {
  var bound, cursor, line;
  this.view.getViewNodeFor(this.tree).layout(0, this.nubbyHeight);
  cursor = this.getCursor();
  if (cursor.type === 'documentStart') {
    bound = this.view.getViewNodeFor(cursor.container).bounds[0];
    return new this.draw.Point(bound.x, bound.y);
  } else if (cursor.type === 'indentStart') {
    line = cursor.next.type === 'newline' ? 1 : 0;
    bound = this.view.getViewNodeFor(cursor.container).bounds[line];
    return new this.draw.Point(bound.x, bound.y);
  } else {
    line = this.getCursor().getTextLocation().row - cursor.parent.getTextLocation().row;
    bound = this.view.getViewNodeFor(cursor.parent).bounds[line];
    return new this.draw.Point(bound.x, bound.bottom());
  }
};

Editor.prototype.getCursor = function() {
  var cursor;
  cursor = this.fromCrossDocumentLocation(this.cursor);
  if (cursor.type === 'socketStart') {
    return cursor.container;
  } else {
    return cursor;
  }
};

Editor.prototype.scrollCursorIntoPosition = function() {
  var axis;
  axis = this.determineCursorPosition().y;
  if (axis - this.scrollOffsets.main.y < 0) {
    this.mainScroller.scrollTop = axis;
  } else if (axis - this.scrollOffsets.main.y > this.mainCanvas.height) {
    this.mainScroller.scrollTop = axis - this.mainCanvas.height;
  }
  return this.mainScroller.scrollLeft = 0;
};

Editor.prototype.scrollCursorToEndOfDocument = function() {
  var pos;
  if (this.currentlyUsingBlocks) {
    pos = this.tree.end;
    while (pos && !this.validCursorPosition(pos)) {
      pos = pos.prev;
    }
    this.setCursor(pos);
    return this.scrollCursorIntoPosition();
  } else {
    return this.aceEditor.scrollToLine(this.aceEditor.session.getLength());
  }
};

hook('keydown', 0, function(event, state) {
  var next, prev, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
  if (event.which === UP_ARROW_KEY) {
    this.clearLassoSelection();
    prev = (ref1 = this.getCursor().prev) != null ? ref1 : (ref2 = this.getCursor().start) != null ? ref2.prev : void 0;
    this.setCursor(prev, (function(token) {
      return token.type !== 'socketStart';
    }), 'before');
    return this.scrollCursorIntoPosition();
  } else if (event.which === DOWN_ARROW_KEY) {
    this.clearLassoSelection();
    next = (ref3 = this.getCursor().next) != null ? ref3 : (ref4 = this.getCursor().end) != null ? ref4.next : void 0;
    this.setCursor(next, (function(token) {
      return token.type !== 'socketStart';
    }), 'after');
    return this.scrollCursorIntoPosition();
  } else if (event.which === RIGHT_ARROW_KEY && (!this.cursorAtSocket() || this.hiddenInput.selectionStart === this.hiddenInput.value.length)) {
    this.clearLassoSelection();
    next = (ref5 = this.getCursor().next) != null ? ref5 : (ref6 = this.getCursor().end) != null ? ref6.next : void 0;
    this.setCursor(next, null, 'after');
    this.scrollCursorIntoPosition();
    return event.preventDefault();
  } else if (event.which === LEFT_ARROW_KEY && (!this.cursorAtSocket() || this.hiddenInput.selectionEnd === 0)) {
    this.clearLassoSelection();
    prev = (ref7 = this.getCursor().prev) != null ? ref7 : (ref8 = this.getCursor().start) != null ? ref8.prev : void 0;
    this.setCursor(prev, null, 'before');
    this.scrollCursorIntoPosition();
    return event.preventDefault();
  }
});

hook('keydown', 0, function(event, state) {
  var next, prev, ref1, ref2, ref3, ref4;
  if (event.which !== TAB_KEY) {
    return;
  }
  if (event.shiftKey) {
    prev = (ref1 = this.getCursor().prev) != null ? ref1 : (ref2 = this.getCursor().start) != null ? ref2.prev : void 0;
    this.setCursor(prev, (function(token) {
      return token.type === 'socketStart';
    }), 'before');
  } else {
    next = (ref3 = this.getCursor().next) != null ? ref3 : (ref4 = this.getCursor().end) != null ? ref4.next : void 0;
    this.setCursor(next, (function(token) {
      return token.type === 'socketStart';
    }), 'after');
  }
  return event.preventDefault();
});

Editor.prototype.deleteAtCursor = function() {
  var block;
  if (this.getCursor().type === 'blockEnd') {
    block = this.getCursor().container;
  } else if (this.getCursor().type === 'indentStart') {
    block = this.getCursor().parent;
  } else {
    return;
  }
  this.setCursor(block.start, null, 'before');
  this.undoCapture();
  this.spliceOut(block);
  return this.redrawMain();
};

hook('keydown', 0, function(event, state) {
  if (this.readOnly) {
    return;
  }
  if (event.which !== BACKSPACE_KEY) {
    return;
  }
  if (state.capturedBackspace) {
    return;
  }
  if (this.lassoSelection != null) {
    this.deleteLassoSelection();
    event.preventDefault();
    return false;
  } else if (!this.cursorAtSocket() || (this.hiddenInput.value.length === 0 && this.getCursor().handwritten)) {
    this.deleteAtCursor();
    state.capturedBackspace = true;
    event.preventDefault();
    return false;
  }
  return true;
});

Editor.prototype.deleteLassoSelection = function() {
  var cursorTarget;
  if (this.lassoSelection == null) {
    if (DEBUG_FLAG) {
      throw new Error('Cannot delete nonexistent lasso segment');
    }
    return null;
  }
  cursorTarget = this.lassoSelection.start.prev;
  this.spliceOut(this.lassoSelection);
  this.lassoSelection = null;
  this.setCursor(cursorTarget);
  return this.redrawMain();
};

hook('populate', 0, function() {
  return this.handwrittenBlocks = [];
});

hook('keydown', 0, function(event, state) {
  var head, newBlock, newSocket;
  if (this.readOnly) {
    return;
  }
  if (event.which === ENTER_KEY) {
    if (!this.cursorAtSocket() && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      newBlock = new model.Block();
      newSocket = new model.Socket(this.mode.empty, Infinity);
      newSocket.handwritten = true;
      newSocket.setParent(newBlock);
      helper.connect(newBlock.start, newSocket.start);
      helper.connect(newSocket.end, newBlock.end);
      head = this.getCursor();
      while (head.type === 'newline') {
        head = head.prev;
      }
      this.spliceIn(newBlock, head);
      this.redrawMain();
      return this.newHandwrittenSocket = newSocket;
    } else if (this.cursorAtSocket() && !event.shiftKey) {
      this.hiddenInput.blur();
      this.dropletElement.focus();
      this.setCursor(this.cursor, function(token) {
        return token.type !== 'socketStart';
      });
      return this.redrawMain();
    }
  }
});

hook('keyup', 0, function(event, state) {
  if (this.readOnly) {
    return;
  }
  if (event.which === ENTER_KEY) {
    if (this.newHandwrittenSocket != null) {
      this.setCursor(this.newHandwrittenSocket);
      return this.newHandwrittenSocket = null;
    }
  }
});

containsCursor = function(block) {
  var head;
  head = block.start;
  while (head !== block.end) {
    if (head.type === 'cursor') {
      return true;
    }
    head = head.next;
  }
  return false;
};

Editor.prototype.copyAceEditor = function() {
  this.gutter.style.width = this.aceEditor.renderer.$gutterLayer.gutterWidth + 'px';
  this.resizeBlockMode();
  return this.setValue_raw(this.getAceValue());
};

hook('populate', 1, function() {
  var acemode;
  this.aceElement = document.createElement('div');
  this.aceElement.className = 'droplet-ace';
  this.wrapperElement.appendChild(this.aceElement);
  this.aceEditor = ace.edit(this.aceElement);
  this.aceEditor.setTheme('ace/theme/chrome');
  this.aceEditor.setFontSize(15);
  acemode = this.options.mode;
  if (acemode === 'coffeescript') {
    acemode = 'coffee';
  }
  this.aceEditor.getSession().setMode('ace/mode/' + acemode);
  this.aceEditor.getSession().setTabSize(2);
  this.currentlyUsingBlocks = true;
  this.currentlyAnimating = false;
  this.transitionContainer = document.createElement('div');
  this.transitionContainer.className = 'droplet-transition-container';
  return this.dropletElement.appendChild(this.transitionContainer);
});

getOffsetTop = function(element) {
  var top;
  top = element.offsetTop;
  while ((element = element.offsetParent) != null) {
    top += element.offsetTop;
  }
  return top;
};

getOffsetLeft = function(element) {
  var left;
  left = element.offsetLeft;
  while ((element = element.offsetParent) != null) {
    left += element.offsetLeft;
  }
  return left;
};

Editor.prototype.computePlaintextTranslationVectors = function() {
  var aceSession, corner, head, rownum, state, textElements, translationVectors, wrappedlines;
  textElements = [];
  translationVectors = [];
  head = this.tree.start;
  aceSession = this.aceEditor.session;
  state = {
    x: (this.aceEditor.container.getBoundingClientRect().left - this.aceElement.getBoundingClientRect().left + this.aceEditor.renderer.$gutterLayer.gutterWidth) - this.gutter.offsetWidth + 5,
    y: (this.aceEditor.container.getBoundingClientRect().top - this.aceElement.getBoundingClientRect().top) - aceSession.getScrollTop(),
    indent: 0,
    lineHeight: this.aceEditor.renderer.layerConfig.lineHeight,
    leftEdge: (this.aceEditor.container.getBoundingClientRect().left - getOffsetLeft(this.aceElement) + this.aceEditor.renderer.$gutterLayer.gutterWidth) - this.gutter.offsetWidth + 5
  };
  this.mainCtx.font = this.aceFontSize() + ' ' + this.fontFamily;
  rownum = 0;
  while (head !== this.tree.end) {
    switch (head.type) {
      case 'text':
        corner = this.view.getViewNodeFor(head).bounds[0].upperLeftCorner();
        corner.x -= this.scrollOffsets.main.x;
        corner.y -= this.scrollOffsets.main.y;
        translationVectors.push((new this.draw.Point(state.x, state.y)).from(corner));
        textElements.push(this.view.getViewNodeFor(head));
        state.x += this.mainCtx.measureText(head.value).width;
        break;
      case 'newline':
        wrappedlines = Math.max(1, aceSession.documentToScreenRow(rownum + 1, 0) - aceSession.documentToScreenRow(rownum, 0));
        rownum += 1;
        state.y += state.lineHeight * wrappedlines;
        if (head.specialIndent != null) {
          state.x = state.leftEdge + this.mainCtx.measureText(head.specialIndent).width;
        } else {
          state.x = state.leftEdge + state.indent * this.mainCtx.measureText(' ').width;
        }
        break;
      case 'indentStart':
        state.indent += head.container.depth;
        break;
      case 'indentEnd':
        state.indent -= head.container.depth;
    }
    head = head.next;
  }
  return {
    textElements: textElements,
    translationVectors: translationVectors
  };
};

Editor.prototype.performMeltAnimation = function(fadeTime, translateTime, cb) {
  var aceScrollTop, bottom, div, fn1, fn2, i, j, k, len, line, lineHeight, paletteDisappearingWithMelt, ref1, ref2, ref3, textElement, textElements, top, translatingElements, translationVectors, treeView;
  if (fadeTime == null) {
    fadeTime = 500;
  }
  if (translateTime == null) {
    translateTime = 1000;
  }
  if (cb == null) {
    cb = function() {};
  }
  if (this.currentlyUsingBlocks && !this.currentlyAnimating) {
    this.hideDropdown();
    this.fireEvent('statechange', [false]);
    this.setAceValue(this.getValue());
    top = this.findLineNumberAtCoordinate(this.scrollOffsets.main.y);
    this.aceEditor.scrollToLine(top);
    this.aceEditor.resize(true);
    this.redrawMain({
      noText: true
    });
    if (this.mainScroller.scrollWidth > this.mainScroller.offsetWidth) {
      this.mainScroller.style.overflowX = 'scroll';
    } else {
      this.mainScroller.style.overflowX = 'hidden';
    }
    this.mainScroller.style.overflowY = 'hidden';
    this.dropletElement.style.width = this.wrapperElement.clientWidth + 'px';
    this.currentlyUsingBlocks = false;
    this.currentlyAnimating = this.currentlyAnimating_suppressRedraw = true;
    ref1 = this.computePlaintextTranslationVectors(), textElements = ref1.textElements, translationVectors = ref1.translationVectors;
    translatingElements = [];
    fn1 = (function(_this) {
      return function(div, textElement, translationVectors, i) {
        return setTimeout((function() {
          div.style.left = (textElement.bounds[0].x - _this.scrollOffsets.main.x + translationVectors[i].x) + 'px';
          div.style.top = (textElement.bounds[0].y - _this.scrollOffsets.main.y + translationVectors[i].y) + 'px';
          return div.style.fontSize = _this.aceFontSize();
        }), fadeTime);
      };
    })(this);
    for (i = j = 0, len = textElements.length; j < len; i = ++j) {
      textElement = textElements[i];
      if (!(0 < textElement.bounds[0].bottom() - this.scrollOffsets.main.y + translationVectors[i].y && textElement.bounds[0].y - this.scrollOffsets.main.y + translationVectors[i].y < this.mainCanvas.height)) {
        continue;
      }
      div = document.createElement('div');
      div.style.whiteSpace = 'pre';
      div.innerText = div.textContent = textElement.model.value;
      div.style.font = this.fontSize + 'px ' + this.fontFamily;
      div.style.left = (textElement.bounds[0].x - this.scrollOffsets.main.x) + "px";
      div.style.top = (textElement.bounds[0].y - this.scrollOffsets.main.y - this.fontAscent) + "px";
      div.className = 'droplet-transitioning-element';
      div.style.transition = "left " + translateTime + "ms, top " + translateTime + "ms, font-size " + translateTime + "ms";
      translatingElements.push(div);
      this.transitionContainer.appendChild(div);
      fn1(div, textElement, translationVectors, i);
    }
    top = Math.max(this.aceEditor.getFirstVisibleRow(), 0);
    bottom = Math.min(this.aceEditor.getLastVisibleRow(), this.view.getViewNodeFor(this.tree).lineLength - 1);
    aceScrollTop = this.aceEditor.session.getScrollTop();
    treeView = this.view.getViewNodeFor(this.tree);
    lineHeight = this.aceEditor.renderer.layerConfig.lineHeight;
    fn2 = (function(_this) {
      return function(div, line) {
        return setTimeout((function() {
          div.style.left = '0px';
          div.style.top = (_this.aceEditor.session.documentToScreenRow(line, 0) * lineHeight - aceScrollTop) + 'px';
          return div.style.fontSize = _this.aceFontSize();
        }), fadeTime);
      };
    })(this);
    for (line = k = ref2 = top, ref3 = bottom; ref2 <= ref3 ? k <= ref3 : k >= ref3; line = ref2 <= ref3 ? ++k : --k) {
      div = document.createElement('div');
      div.style.whiteSpace = 'pre';
      div.innerText = div.textContent = line + 1;
      div.style.left = 0;
      div.style.top = (treeView.bounds[line].y + treeView.distanceToBase[line].above - this.view.opts.textHeight - this.fontAscent - this.scrollOffsets.main.y) + "px";
      div.style.font = this.fontSize + 'px ' + this.fontFamily;
      div.style.width = this.gutter.offsetWidth + "px";
      translatingElements.push(div);
      div.className = 'droplet-transitioning-element droplet-transitioning-gutter droplet-gutter-line';
      if (this.annotations[line] != null) {
        div.className += ' droplet_' + getMostSevereAnnotationType(this.annotations[line]);
      }
      div.style.transition = "left " + translateTime + "ms, top " + translateTime + "ms, font-size " + translateTime + "ms";
      this.dropletElement.appendChild(div);
      fn2(div, line);
    }
    this.lineNumberWrapper.style.display = 'none';
    this.mainCanvas.style.transition = this.highlightCanvas.style.transition = this.cursorCanvas.style.opacity = "opacity " + fadeTime + "ms linear";
    this.mainCanvas.style.opacity = this.highlightCanvas.style.opacity = this.cursorCanvas.style.opacity = 0;
    paletteDisappearingWithMelt = this.paletteEnabled && !this.showPaletteInTextMode;
    if (paletteDisappearingWithMelt) {
      this.paletteHeader.style.zIndex = 0;
      setTimeout(((function(_this) {
        return function() {
          _this.dropletElement.style.transition = _this.paletteWrapper.style.transition = "left " + translateTime + "ms";
          _this.dropletElement.style.left = '0px';
          return _this.paletteWrapper.style.left = (-_this.paletteWrapper.offsetWidth) + "px";
        };
      })(this)), fadeTime);
    }
    setTimeout(((function(_this) {
      return function() {
        var l, len1;
        _this.dropletElement.style.transition = _this.paletteWrapper.style.transition = '';
        _this.aceElement.style.top = '0px';
        if (_this.showPaletteInTextMode && _this.paletteEnabled) {
          _this.aceElement.style.left = _this.paletteWrapper.offsetWidth + "px";
        } else {
          _this.aceElement.style.left = '0px';
        }
        if (paletteDisappearingWithMelt) {
          _this.paletteWrapper.style.top = '-9999px';
          _this.paletteWrapper.style.left = '-9999px';
        }
        _this.dropletElement.style.top = '-9999px';
        _this.dropletElement.style.left = '-9999px';
        _this.currentlyAnimating = false;
        _this.mainScroller.style.overflow = 'auto';
        for (l = 0, len1 = translatingElements.length; l < len1; l++) {
          div = translatingElements[l];
          div.parentNode.removeChild(div);
        }
        _this.fireEvent('toggledone', [_this.currentlyUsingBlocks]);
        if (cb != null) {
          return cb();
        }
      };
    })(this)), fadeTime + translateTime);
    return {
      success: true
    };
  }
};

Editor.prototype.aceFontSize = function() {
  return parseFloat(this.aceEditor.getFontSize()) + 'px';
};

Editor.prototype.performFreezeAnimation = function(fadeTime, translateTime, cb) {
  var setValueResult;
  if (fadeTime == null) {
    fadeTime = 500;
  }
  if (translateTime == null) {
    translateTime = 500;
  }
  if (cb == null) {
    cb = function() {};
  }
  if (!this.currentlyUsingBlocks && !this.currentlyAnimating) {
    setValueResult = this.copyAceEditor();
    if (!setValueResult.success) {
      if (setValueResult.error) {
        this.fireEvent('parseerror', [setValueResult.error]);
      }
      return setValueResult;
    }
    if (this.aceEditor.getFirstVisibleRow() === 0) {
      this.mainScroller.scrollTop = 0;
    } else {
      this.mainScroller.scrollTop = this.view.getViewNodeFor(this.tree).bounds[this.aceEditor.getFirstVisibleRow()].y;
    }
    this.currentlyUsingBlocks = true;
    this.currentlyAnimating = true;
    this.fireEvent('statechange', [true]);
    setTimeout(((function(_this) {
      return function() {
        var aceScrollTop, bottom, div, el, fn1, fn2, i, j, k, l, len, len1, line, lineHeight, paletteAppearingWithFreeze, ref1, ref2, ref3, ref4, textElement, textElements, top, translatingElements, translationVectors, treeView;
        _this.mainScroller.style.overflow = 'hidden';
        _this.dropletElement.style.width = _this.wrapperElement.clientWidth + 'px';
        _this.redrawMain({
          noText: true
        });
        _this.currentlyAnimating_suppressRedraw = true;
        _this.aceElement.style.top = "-9999px";
        _this.aceElement.style.left = "-9999px";
        paletteAppearingWithFreeze = _this.paletteEnabled && !_this.showPaletteInTextMode;
        if (paletteAppearingWithFreeze) {
          _this.paletteWrapper.style.top = '0px';
          _this.paletteWrapper.style.left = (-_this.paletteWrapper.offsetWidth) + "px";
          _this.paletteHeader.style.zIndex = 0;
        }
        _this.dropletElement.style.top = "0px";
        if (_this.paletteEnabled && !paletteAppearingWithFreeze) {
          _this.dropletElement.style.left = _this.paletteWrapper.offsetWidth + "px";
        } else {
          _this.dropletElement.style.left = "0px";
        }
        ref1 = _this.computePlaintextTranslationVectors(), textElements = ref1.textElements, translationVectors = ref1.translationVectors;
        translatingElements = [];
        fn1 = function(div, textElement) {
          return setTimeout((function() {
            div.style.left = (textElement.bounds[0].x - _this.scrollOffsets.main.x) + "px";
            div.style.top = (textElement.bounds[0].y - _this.scrollOffsets.main.y - _this.fontAscent) + "px";
            return div.style.fontSize = _this.fontSize + 'px';
          }), 0);
        };
        for (i = j = 0, len = textElements.length; j < len; i = ++j) {
          textElement = textElements[i];
          if (!(0 < textElement.bounds[0].bottom() - _this.scrollOffsets.main.y + translationVectors[i].y && textElement.bounds[0].y - _this.scrollOffsets.main.y + translationVectors[i].y < _this.mainCanvas.height)) {
            continue;
          }
          div = document.createElement('div');
          div.style.whiteSpace = 'pre';
          div.innerText = div.textContent = textElement.model.value;
          div.style.font = _this.aceFontSize() + ' ' + _this.fontFamily;
          div.style.position = 'absolute';
          div.style.left = (textElement.bounds[0].x - _this.scrollOffsets.main.x + translationVectors[i].x) + "px";
          div.style.top = (textElement.bounds[0].y - _this.scrollOffsets.main.y + translationVectors[i].y) + "px";
          div.className = 'droplet-transitioning-element';
          div.style.transition = "left " + translateTime + "ms, top " + translateTime + "ms, font-size " + translateTime + "ms";
          translatingElements.push(div);
          _this.transitionContainer.appendChild(div);
          fn1(div, textElement);
        }
        top = Math.max(_this.aceEditor.getFirstVisibleRow(), 0);
        bottom = Math.min(_this.aceEditor.getLastVisibleRow(), _this.view.getViewNodeFor(_this.tree).lineLength - 1);
        treeView = _this.view.getViewNodeFor(_this.tree);
        lineHeight = _this.aceEditor.renderer.layerConfig.lineHeight;
        aceScrollTop = _this.aceEditor.session.getScrollTop();
        fn2 = function(div, line) {
          return setTimeout((function() {
            div.style.left = 0;
            div.style.top = (treeView.bounds[line].y + treeView.distanceToBase[line].above - _this.view.opts.textHeight - _this.fontAscent - _this.scrollOffsets.main.y) + "px";
            return div.style.fontSize = _this.fontSize + 'px';
          }), 0);
        };
        for (line = k = ref2 = top, ref3 = bottom; ref2 <= ref3 ? k <= ref3 : k >= ref3; line = ref2 <= ref3 ? ++k : --k) {
          div = document.createElement('div');
          div.style.whiteSpace = 'pre';
          div.innerText = div.textContent = line + 1;
          div.style.font = _this.aceFontSize() + ' ' + _this.fontFamily;
          div.style.width = _this.aceEditor.renderer.$gutter.offsetWidth + "px";
          div.style.left = 0;
          div.style.top = (_this.aceEditor.session.documentToScreenRow(line, 0) * lineHeight - aceScrollTop) + "px";
          div.className = 'droplet-transitioning-element droplet-transitioning-gutter droplet-gutter-line';
          if (_this.annotations[line] != null) {
            div.className += ' droplet_' + getMostSevereAnnotationType(_this.annotations[line]);
          }
          div.style.transition = "left " + translateTime + "ms, top " + translateTime + "ms, font-size " + translateTime + "ms";
          translatingElements.push(div);
          _this.dropletElement.appendChild(div);
          fn2(div, line);
        }
        ref4 = [_this.mainCanvas, _this.highlightCanvas, _this.cursorCanvas];
        for (l = 0, len1 = ref4.length; l < len1; l++) {
          el = ref4[l];
          el.style.opacity = 0;
        }
        setTimeout((function() {
          var len2, m, ref5;
          ref5 = [_this.mainCanvas, _this.highlightCanvas, _this.cursorCanvas];
          for (m = 0, len2 = ref5.length; m < len2; m++) {
            el = ref5[m];
            el.style.transition = "opacity " + fadeTime + "ms linear";
          }
          _this.mainCanvas.style.opacity = 1;
          _this.highlightCanvas.style.opacity = 1;
          if (_this.editorHasFocus()) {
            return _this.cursorCanvas.style.opacity = 1;
          } else {
            return _this.cursorCanvas.style.opacity = CURSOR_UNFOCUSED_OPACITY;
          }
        }), translateTime);
        _this.dropletElement.style.transition = "left " + fadeTime + "ms";
        if (paletteAppearingWithFreeze) {
          _this.paletteWrapper.style.transition = _this.dropletElement.style.transition;
          _this.dropletElement.style.left = _this.paletteWrapper.offsetWidth + "px";
          _this.paletteWrapper.style.left = '0px';
        }
        return setTimeout((function() {
          var len2, m;
          _this.dropletElement.style.transition = _this.paletteWrapper.style.transition = '';
          _this.mainScroller.style.overflow = 'auto';
          _this.currentlyAnimating = false;
          _this.lineNumberWrapper.style.display = 'block';
          _this.redrawMain();
          _this.paletteHeader.style.zIndex = 257;
          for (m = 0, len2 = translatingElements.length; m < len2; m++) {
            div = translatingElements[m];
            div.parentNode.removeChild(div);
          }
          _this.resizeBlockMode();
          _this.fireEvent('toggledone', [_this.currentlyUsingBlocks]);
          if (cb != null) {
            return cb();
          }
        }), translateTime + fadeTime);
      };
    })(this)), 0);
    return {
      success: true
    };
  }
};

Editor.prototype.enablePalette = function(enabled) {
  var activeElement;
  if (!this.currentlyAnimating && this.paletteEnabled !== enabled) {
    this.paletteEnabled = enabled;
    this.currentlyAnimating = true;
    if (this.currentlyUsingBlocks) {
      activeElement = this.dropletElement;
    } else {
      activeElement = this.aceElement;
    }
    if (!this.paletteEnabled) {
      activeElement.style.transition = this.paletteWrapper.style.transition = "left 500ms";
      activeElement.style.left = '0px';
      this.paletteWrapper.style.left = (-this.paletteWrapper.offsetWidth) + "px";
      this.paletteHeader.style.zIndex = 0;
      this.resize();
      return setTimeout(((function(_this) {
        return function() {
          activeElement.style.transition = _this.paletteWrapper.style.transition = '';
          _this.paletteWrapper.style.top = '-9999px';
          _this.paletteWrapper.style.left = '-9999px';
          _this.currentlyAnimating = false;
          return _this.fireEvent('palettetoggledone', [_this.paletteEnabled]);
        };
      })(this)), 500);
    } else {
      this.paletteWrapper.style.top = '0px';
      this.paletteWrapper.style.left = (-this.paletteWrapper.offsetWidth) + "px";
      this.paletteHeader.style.zIndex = 257;
      return setTimeout(((function(_this) {
        return function() {
          activeElement.style.transition = _this.paletteWrapper.style.transition = "left 500ms";
          activeElement.style.left = _this.paletteWrapper.offsetWidth + "px";
          _this.paletteWrapper.style.left = '0px';
          return setTimeout((function() {
            activeElement.style.transition = _this.paletteWrapper.style.transition = '';
            _this.resize();
            _this.currentlyAnimating = false;
            return _this.fireEvent('palettetoggledone', [_this.paletteEnabled]);
          }), 500);
        };
      })(this)), 0);
    }
  }
};

Editor.prototype.toggleBlocks = function(cb) {
  if (this.currentlyUsingBlocks) {
    return this.performMeltAnimation(500, 1000, cb);
  } else {
    return this.performFreezeAnimation(500, 500, cb);
  }
};

hook('populate', 2, function() {
  this.scrollOffsets = {
    main: new this.draw.Point(0, 0),
    palette: new this.draw.Point(0, 0)
  };
  this.mainScroller = document.createElement('div');
  this.mainScroller.className = 'droplet-main-scroller';
  this.mainScrollerStuffing = document.createElement('div');
  this.mainScrollerStuffing.className = 'droplet-main-scroller-stuffing';
  this.mainScroller.appendChild(this.mainScrollerStuffing);
  this.dropletElement.appendChild(this.mainScroller);
  this.wrapperElement.addEventListener('scroll', (function(_this) {
    return function() {
      return _this.wrapperElement.scrollTop = _this.wrapperElement.scrollLeft = 0;
    };
  })(this));
  this.mainScroller.addEventListener('scroll', (function(_this) {
    return function() {
      _this.scrollOffsets.main.y = _this.mainScroller.scrollTop;
      _this.scrollOffsets.main.x = _this.mainScroller.scrollLeft;
      _this.mainCtx.setTransform(1, 0, 0, 1, -_this.scrollOffsets.main.x, -_this.scrollOffsets.main.y);
      _this.highlightCtx.setTransform(1, 0, 0, 1, -_this.scrollOffsets.main.x, -_this.scrollOffsets.main.y);
      _this.cursorCtx.setTransform(1, 0, 0, 1, -_this.scrollOffsets.main.x, -_this.scrollOffsets.main.y);
      return _this.redrawMain();
    };
  })(this));
  this.paletteScroller = document.createElement('div');
  this.paletteScroller.className = 'droplet-palette-scroller';
  this.paletteScrollerStuffing = document.createElement('div');
  this.paletteScrollerStuffing.className = 'droplet-palette-scroller-stuffing';
  this.paletteScroller.appendChild(this.paletteScrollerStuffing);
  this.paletteElement.appendChild(this.paletteScroller);
  return this.paletteScroller.addEventListener('scroll', (function(_this) {
    return function() {
      _this.scrollOffsets.palette.y = _this.paletteScroller.scrollTop;
      _this.paletteCtx.setTransform(1, 0, 0, 1, -_this.scrollOffsets.palette.x, -_this.scrollOffsets.palette.y);
      _this.paletteHighlightCtx.setTransform(1, 0, 0, 1, -_this.scrollOffsets.palette.x, -_this.scrollOffsets.palette.y);
      return _this.redrawPalette();
    };
  })(this));
});

Editor.prototype.resizeMainScroller = function() {
  this.mainScroller.style.width = this.dropletElement.offsetWidth + "px";
  return this.mainScroller.style.height = this.dropletElement.offsetHeight + "px";
};

hook('resize_palette', 0, function() {
  this.paletteScroller.style.top = this.paletteHeader.offsetHeight + "px";
  this.paletteScroller.style.width = this.paletteCanvas.offsetWidth + "px";
  return this.paletteScroller.style.height = this.paletteCanvas.offsetHeight + "px";
});

hook('redraw_main', 1, function() {
  var bounds, j, len, record, ref1, ref2;
  bounds = this.view.getViewNodeFor(this.tree).getBounds();
  ref1 = this.floatingBlocks;
  for (j = 0, len = ref1.length; j < len; j++) {
    record = ref1[j];
    bounds.unite(this.view.getViewNodeFor(record.block).getBounds());
  }
  this.mainScrollerStuffing.style.width = (bounds.right()) + "px";
  return this.mainScrollerStuffing.style.height = (bounds.bottom() + ((ref2 = this.options.extraBottomHeight) != null ? ref2 : this.fontSize)) + "px";
});

hook('redraw_palette', 0, function() {
  var bounds, entry, j, len, ref1;
  bounds = new this.draw.NoRectangle();
  ref1 = this.currentPaletteBlocks;
  for (j = 0, len = ref1.length; j < len; j++) {
    entry = ref1[j];
    bounds.unite(this.paletteView.getViewNodeFor(entry.block).getBounds());
  }
  return this.paletteScrollerStuffing.style.height = (bounds.bottom()) + "px";
});

hook('populate', 0, function() {
  var metrics;
  this.fontSize = 15;
  this.fontFamily = 'Courier New';
  metrics = helper.fontMetrics(this.fontFamily, this.fontSize);
  this.fontAscent = metrics.prettytop;
  return this.fontDescent = metrics.descent;
});

Editor.prototype.setFontSize_raw = function(fontSize) {
  var metrics;
  if (this.fontSize !== fontSize) {
    this.fontSize = fontSize;
    this.paletteHeader.style.fontSize = fontSize + "px";
    this.gutter.style.fontSize = fontSize + "px";
    this.tooltipElement.style.fontSize = fontSize + "px";
    this.view.opts.textHeight = this.dragView.opts.textHeight = helper.getFontHeight(this.fontFamily, this.fontSize);
    metrics = helper.fontMetrics(this.fontFamily, this.fontSize);
    this.fontAscent = metrics.prettytop;
    this.fontDescent = metrics.descent;
    this.view.clearCache();
    this.dragView.clearCache();
    this.gutter.style.width = this.aceEditor.renderer.$gutterLayer.gutterWidth + 'px';
    this.redrawMain();
    return this.rebuildPalette();
  }
};

Editor.prototype.setFontFamily = function(fontFamily) {
  this.draw.setGlobalFontFamily(fontFamily);
  this.fontFamily = fontFamily;
  this.view.opts.textHeight = helper.getFontHeight(this.fontFamily, this.fontSize);
  this.fontAscent = helper.fontMetrics(this.fontFamily, this.fontSize).prettytop;
  this.view.clearCache();
  this.dragView.clearCache();
  this.gutter.style.fontFamily = fontFamily;
  this.tooltipElement.style.fontFamily = fontFamily;
  this.redrawMain();
  return this.rebuildPalette();
};

Editor.prototype.setFontSize = function(fontSize) {
  this.setFontSize_raw(fontSize);
  return this.resizeBlockMode();
};

hook('populate', 0, function() {
  this.markedLines = {};
  this.markedBlocks = {};
  this.nextMarkedBlockId = 0;
  return this.extraMarks = {};
});

Editor.prototype.getHighlightPath = function(model, style, view) {
  var path;
  if (view == null) {
    view = this.view;
  }
  path = view.getViewNodeFor(model).path.clone();
  path.style.fillColor = null;
  path.style.strokeColor = style.color;
  path.style.lineWidth = 3;
  path.noclip = true;
  path.bevel = false;
  return path;
};

Editor.prototype.markLine = function(line, style) {
  var block;
  block = this.tree.getBlockOnLine(line);
  if (block != null) {
    this.markedLines[line] = {
      model: block,
      style: style
    };
  }
  return this.redrawHighlights();
};

Editor.prototype.markBlock = function(block, style) {
  var key;
  key = this.nextMarkedBlockId++;
  this.markedBlocks[key] = {
    model: block,
    style: style
  };
  return key;
};

Editor.prototype.mark = function(location, style) {
  var block, key, ref1;
  block = this.tree.getFromTextLocation(location);
  block = (ref1 = block.container) != null ? ref1 : block;
  key = this.nextMarkedBlockId++;
  this.markedBlocks[key] = {
    model: block,
    style: style
  };
  this.redrawHighlights();
  return key;
};

Editor.prototype.unmark = function(key) {
  delete this.markedBlocks[key];
  this.redrawHighlights();
  return true;
};

Editor.prototype.unmarkLine = function(line) {
  delete this.markedLines[line];
  return this.redrawHighlights();
};

Editor.prototype.clearLineMarks = function() {
  this.markedLines = this.markedBlocks = {};
  return this.redrawHighlights();
};

hook('populate', 0, function() {
  return this.lastHoveredLine = null;
});

hook('mousemove', 0, function(point, event, state) {
  var hoveredLine, mainPoint, treeView;
  if ((this.draggingBlock == null) && (this.clickedBlock == null) && this.hasEvent('linehover')) {
    if (!this.trackerPointIsInMainScroller(point)) {
      return;
    }
    mainPoint = this.trackerPointToMain(point);
    treeView = this.view.getViewNodeFor(this.tree);
    if ((this.lastHoveredLine != null) && (treeView.bounds[this.lastHoveredLine] != null) && treeView.bounds[this.lastHoveredLine].contains(mainPoint)) {
      return;
    }
    hoveredLine = this.findLineNumberAtCoordinate(mainPoint.y);
    if (!treeView.bounds[hoveredLine].contains(mainPoint)) {
      hoveredLine = null;
    }
    if (hoveredLine !== this.lastHoveredLine) {
      return this.fireEvent('linehover', [
        {
          line: this.lastHoveredLine = hoveredLine
        }
      ]);
    }
  }
});

hook('populate', 0, function() {
  return this.trimWhitespace = false;
});

Editor.prototype.setTrimWhitespace = function(trimWhitespace) {
  return this.trimWhitespace = trimWhitespace;
};

Editor.prototype.setValue_raw = function(value) {
  var e, error, newParse, removal;
  try {
    if (this.trimWhitespace) {
      value = value.trim();
    }
    newParse = this.mode.parse(value, {
      wrapAtRoot: true
    });
    if (this.tree.start.next !== this.tree.end) {
      removal = new model.List(this.tree.start.next, this.tree.end.prev);
      this.spliceOut(removal);
    }
    if (newParse.start.next !== newParse.end) {
      this.spliceIn(new model.List(newParse.start.next, newParse.end.prev), this.tree.start);
    }
    this.removeBlankLines();
    this.redrawMain();
    return {
      success: true
    };
  } catch (error) {
    e = error;
    return {
      success: false,
      error: e
    };
  }
};

Editor.prototype.setValue = function(value) {
  var oldScrollTop, result;
  oldScrollTop = this.aceEditor.session.getScrollTop();
  this.setAceValue(value);
  this.resizeTextMode();
  this.aceEditor.session.setScrollTop(oldScrollTop);
  if (this.currentlyUsingBlocks) {
    result = this.setValue_raw(value);
    if (result.success === false) {
      this.setEditorState(false);
      this.aceEditor.setValue(value);
      if (result.error) {
        return this.fireEvent('parseerror', [result.error]);
      }
    }
  }
};

Editor.prototype.addEmptyLine = function(str) {
  if (str.length === 0 || str[str.length - 1] === '\n') {
    return str;
  } else {
    return str + '\n';
  }
};

Editor.prototype.getValue = function() {
  if (this.currentlyUsingBlocks) {
    return this.addEmptyLine(this.tree.stringify());
  } else {
    return this.getAceValue();
  }
};

Editor.prototype.getAceValue = function() {
  var value;
  value = this.aceEditor.getValue();
  return this.lastAceSeenValue = value;
};

Editor.prototype.setAceValue = function(value) {
  if (value !== this.lastAceSeenValue) {
    this.aceEditor.setValue(value, 1);
    return this.lastAceSeenValue = value;
  }
};

Editor.prototype.on = function(event, handler) {
  return this.bindings[event] = handler;
};

Editor.prototype.once = function(event, handler) {
  return this.bindings[event] = function() {
    handler.apply(this, arguments);
    return this.bindings[event] = null;
  };
};

Editor.prototype.fireEvent = function(event, args) {
  if (event in this.bindings) {
    return this.bindings[event].apply(this, args);
  }
};

Editor.prototype.hasEvent = function(event) {
  return event in this.bindings && (this.bindings[event] != null);
};

Editor.prototype.setEditorState = function(useBlocks) {
  var oldScrollTop, paletteVisibleInNewState;
  if (useBlocks) {
    if (!this.currentlyUsingBlocks) {
      this.setValue(this.getAceValue());
    }
    this.dropletElement.style.top = '0px';
    if (this.paletteEnabled) {
      this.paletteWrapper.style.top = this.paletteWrapper.style.left = '0px';
      this.dropletElement.style.left = this.paletteWrapper.offsetWidth + "px";
    } else {
      this.paletteWrapper.style.top = this.paletteWrapper.style.left = '-9999px';
      this.dropletElement.style.left = '0px';
    }
    this.aceElement.style.top = this.aceElement.style.left = '-9999px';
    this.currentlyUsingBlocks = true;
    this.lineNumberWrapper.style.display = 'block';
    this.mainCanvas.opacity = this.paletteWrapper.opacity = this.highlightCanvas.opacity = 1;
    this.resizeBlockMode();
    return this.redrawMain();
  } else {
    this.hideDropdown();
    paletteVisibleInNewState = this.paletteEnabled && this.showPaletteInTextMode;
    oldScrollTop = this.aceEditor.session.getScrollTop();
    if (this.currentlyUsingBlocks) {
      this.setAceValue(this.getValue());
    }
    this.aceEditor.resize(true);
    this.aceEditor.session.setScrollTop(oldScrollTop);
    this.dropletElement.style.top = this.dropletElement.style.left = '-9999px';
    if (paletteVisibleInNewState) {
      this.paletteWrapper.style.top = this.paletteWrapper.style.left = '0px';
    } else {
      this.paletteWrapper.style.top = this.paletteWrapper.style.left = '-9999px';
    }
    this.aceElement.style.top = '0px';
    if (paletteVisibleInNewState) {
      this.aceElement.style.left = this.paletteWrapper.offsetWidth + "px";
    } else {
      this.aceElement.style.left = '0px';
    }
    this.currentlyUsingBlocks = false;
    this.lineNumberWrapper.style.display = 'none';
    this.mainCanvas.opacity = this.highlightCanvas.opacity = 0;
    return this.resizeBlockMode();
  }
};

hook('populate', 0, function() {
  this.dragCover = document.createElement('div');
  this.dragCover.className = 'droplet-drag-cover';
  this.dragCover.style.display = 'none';
  return document.body.appendChild(this.dragCover);
});

hook('mousedown', -1, function() {
  if (this.clickedBlock != null) {
    return this.dragCover.style.display = 'block';
  }
});

hook('mouseup', 0, function() {
  this.dragCanvas.style.top = this.dragCanvas.style.left = '-9999px';
  return this.dragCover.style.display = 'none';
});

hook('mousedown', 10, function() {
  if (this.draggingBlock != null) {
    return this.endDrag();
  }
});

Editor.prototype.endDrag = function() {
  if (this.cursorAtSocket()) {
    this.setCursor(this.cursor, function(x) {
      return x.type !== 'socketStart';
    });
  }
  this.draggingBlock = null;
  this.draggingOffset = null;
  this.lastHighlight = null;
  this.clearDrag();
  this.redrawMain();
};

hook('rebuild_palette', 0, function() {
  return this.fireEvent('changepalette', []);
});

touchEvents = {
  'touchstart': 'mousedown',
  'touchmove': 'mousemove',
  'touchend': 'mouseup'
};

TOUCH_SELECTION_TIMEOUT = 1000;

Editor.prototype.touchEventToPoint = function(event, index) {
  var absolutePoint;
  absolutePoint = new this.draw.Point(event.changedTouches[index].clientX, event.changedTouches[index].clientY);
  return absolutePoint;
};

Editor.prototype.queueLassoMousedown = function(trackPoint, event) {
  return this.lassoSelectStartTimeout = setTimeout(((function(_this) {
    return function() {
      var handler, j, len, ref1, results, state;
      state = {};
      ref1 = editorBindings.mousedown;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        handler = ref1[j];
        results.push(handler.call(_this, trackPoint, event, state));
      }
      return results;
    };
  })(this)), TOUCH_SELECTION_TIMEOUT);
};

hook('populate', 0, function() {
  this.touchScrollAnchor = new this.draw.Point(0, 0);
  this.lassoSelectStartTimeout = null;
  this.wrapperElement.addEventListener('touchstart', (function(_this) {
    return function(event) {
      var handler, j, len, ref1, state, trackPoint;
      clearTimeout(_this.lassoSelectStartTimeout);
      trackPoint = _this.touchEventToPoint(event, 0);
      state = {
        suppressLassoSelect: true
      };
      ref1 = editorBindings.mousedown;
      for (j = 0, len = ref1.length; j < len; j++) {
        handler = ref1[j];
        handler.call(_this, trackPoint, event, state);
      }
      if (state.consumedHitTest) {
        return event.preventDefault();
      } else {
        return _this.queueLassoMousedown(trackPoint, event);
      }
    };
  })(this));
  this.wrapperElement.addEventListener('touchmove', (function(_this) {
    return function(event) {
      var handler, j, len, ref1, state, trackPoint;
      clearTimeout(_this.lassoSelectStartTimeout);
      trackPoint = _this.touchEventToPoint(event, 0);
      if (!((_this.clickedBlock != null) || (_this.draggingBlock != null))) {
        _this.queueLassoMousedown(trackPoint, event);
      }
      state = {};
      ref1 = editorBindings.mousemove;
      for (j = 0, len = ref1.length; j < len; j++) {
        handler = ref1[j];
        handler.call(_this, trackPoint, event, state);
      }
      if ((_this.clickedBlock != null) || (_this.draggingBlock != null) || (_this.lassoSelectAnchor != null) || _this.textInputSelecting) {
        return event.preventDefault();
      }
    };
  })(this));
  return this.wrapperElement.addEventListener('touchend', (function(_this) {
    return function(event) {
      var handler, j, len, ref1, state, trackPoint;
      clearTimeout(_this.lassoSelectStartTimeout);
      trackPoint = _this.touchEventToPoint(event, 0);
      state = {};
      ref1 = editorBindings.mouseup;
      for (j = 0, len = ref1.length; j < len; j++) {
        handler = ref1[j];
        handler.call(_this, trackPoint, event, state);
      }
      return event.preventDefault();
    };
  })(this));
});

hook('populate', 0, function() {
  this.cursorCanvas = document.createElement('canvas');
  this.cursorCanvas.className = 'droplet-highlight-canvas droplet-cursor-canvas';
  this.cursorCtx = this.cursorCanvas.getContext('2d');
  return this.dropletElement.appendChild(this.cursorCanvas);
});

Editor.prototype.resizeCursorCanvas = function() {
  this.cursorCanvas.width = this.dropletElement.offsetWidth - this.gutter.offsetWidth;
  this.cursorCanvas.style.width = this.cursorCanvas.width + "px";
  this.cursorCanvas.height = this.dropletElement.offsetHeight;
  this.cursorCanvas.style.height = this.cursorCanvas.height + "px";
  return this.cursorCanvas.style.left = this.mainCanvas.offsetLeft + "px";
};

Editor.prototype.strokeCursor = function(point) {
  var arcAngle, arcCenter, endAngle, h, startAngle, w;
  if (point == null) {
    return;
  }
  this.cursorCtx.beginPath();
  this.cursorCtx.fillStyle = this.cursorCtx.strokeStyle = '#000';
  this.cursorCtx.lineCap = 'round';
  this.cursorCtx.lineWidth = 3;
  w = this.view.opts.tabWidth / 2 - CURSOR_WIDTH_DECREASE;
  h = this.view.opts.tabHeight - CURSOR_HEIGHT_DECREASE;
  arcCenter = new this.draw.Point(point.x + this.view.opts.tabOffset + w + CURSOR_WIDTH_DECREASE, point.y - (w * w + h * h) / (2 * h) + h + CURSOR_HEIGHT_DECREASE / 2);
  arcAngle = Math.atan2(w, (w * w + h * h) / (2 * h) - h);
  startAngle = 0.5 * Math.PI - arcAngle;
  endAngle = 0.5 * Math.PI + arcAngle;
  this.cursorCtx.arc(arcCenter.x, arcCenter.y, (w * w + h * h) / (2 * h), startAngle, endAngle);
  return this.cursorCtx.stroke();
};

Editor.prototype.highlightFlashShow = function() {
  if (this.flashTimeout != null) {
    clearTimeout(this.flashTimeout);
  }
  this.cursorCanvas.style.display = 'block';
  this.highlightsCurrentlyShown = true;
  return this.flashTimeout = setTimeout(((function(_this) {
    return function() {
      return _this.flash();
    };
  })(this)), 500);
};

Editor.prototype.highlightFlashHide = function() {
  if (this.flashTimeout != null) {
    clearTimeout(this.flashTimeout);
  }
  this.cursorCanvas.style.display = 'none';
  this.highlightsCurrentlyShown = false;
  return this.flashTimeout = setTimeout(((function(_this) {
    return function() {
      return _this.flash();
    };
  })(this)), 500);
};

Editor.prototype.editorHasFocus = function() {
  var ref1;
  return ((ref1 = document.activeElement) === this.dropletElement || ref1 === this.hiddenInput || ref1 === this.copyPasteInput) && document.hasFocus();
};

Editor.prototype.flash = function() {
  if ((this.lassoSelection != null) || (this.draggingBlock != null) || (this.cursorAtSocket() && this.textInputHighlighted) || !this.highlightsCurrentlyShown || !this.editorHasFocus()) {
    return this.highlightFlashShow();
  } else {
    return this.highlightFlashHide();
  }
};

hook('populate', 0, function() {
  var blurCursors, focusCursors;
  this.highlightsCurrentlyShown = false;
  blurCursors = (function(_this) {
    return function() {
      _this.highlightFlashShow();
      _this.cursorCanvas.style.transition = '';
      return _this.cursorCanvas.style.opacity = CURSOR_UNFOCUSED_OPACITY;
    };
  })(this);
  this.dropletElement.addEventListener('blur', blurCursors);
  this.hiddenInput.addEventListener('blur', blurCursors);
  this.copyPasteInput.addEventListener('blur', blurCursors);
  focusCursors = (function(_this) {
    return function() {
      _this.highlightFlashShow();
      _this.cursorCanvas.style.transition = '';
      return _this.cursorCanvas.style.opacity = 1;
    };
  })(this);
  this.dropletElement.addEventListener('focus', focusCursors);
  this.hiddenInput.addEventListener('focus', focusCursors);
  this.copyPasteInput.addEventListener('focus', focusCursors);
  return this.flashTimeout = setTimeout(((function(_this) {
    return function() {
      return _this.flash();
    };
  })(this)), 0);
});

Editor.prototype.viewOrChildrenContains = function(model, point, view) {
  var childObj, j, len, modelView, ref1;
  if (view == null) {
    view = this.view;
  }
  modelView = view.getViewNodeFor(model);
  if (modelView.path.contains(point)) {
    return true;
  }
  ref1 = modelView.children;
  for (j = 0, len = ref1.length; j < len; j++) {
    childObj = ref1[j];
    if (this.viewOrChildrenContains(childObj.child, point, view)) {
      return true;
    }
  }
  return false;
};

hook('populate', 0, function() {
  this.gutter = document.createElement('div');
  this.gutter.className = 'droplet-gutter';
  this.lineNumberWrapper = document.createElement('div');
  this.gutter.appendChild(this.lineNumberWrapper);
  this.gutterVersion = -1;
  this.lastGutterWidth = null;
  this.lineNumberTags = {};
  this.mainScroller.appendChild(this.gutter);
  this.annotations = {};
  this.breakpoints = {};
  this.tooltipElement = document.createElement('div');
  this.tooltipElement.className = 'droplet-tooltip';
  this.dropletElement.appendChild(this.tooltipElement);
  return this.aceEditor.on('guttermousedown', (function(_this) {
    return function(e) {
      var row, target;
      target = e.domEvent.target;
      if (target.className.indexOf('ace_gutter-cell') === -1) {
        return;
      }
      row = e.getDocumentPosition().row;
      e.stop();
      return _this.fireEvent('guttermousedown', [
        {
          line: row,
          event: e.domEvent
        }
      ]);
    };
  })(this));
});

hook('mousedown', 11, function(point, event, state) {
  var clickedLine, mainPoint, treeView;
  if (!this.trackerPointIsInGutter(point)) {
    return;
  }
  mainPoint = this.trackerPointToMain(point);
  treeView = this.view.getViewNodeFor(this.tree);
  clickedLine = this.findLineNumberAtCoordinate(mainPoint.y);
  this.fireEvent('guttermousedown', [
    {
      line: clickedLine,
      event: event
    }
  ]);
  return true;
});

Editor.prototype.setBreakpoint = function(row) {
  this.aceEditor.session.setBreakpoint(row);
  this.breakpoints[row] = true;
  return this.redrawGutter(false);
};

Editor.prototype.clearBreakpoint = function(row) {
  this.aceEditor.session.clearBreakpoint(row);
  this.breakpoints[row] = false;
  return this.redrawGutter(false);
};

Editor.prototype.clearBreakpoints = function(row) {
  this.aceEditor.session.clearBreakpoints();
  this.breakpoints = {};
  return this.redrawGutter(false);
};

Editor.prototype.getBreakpoints = function(row) {
  return this.aceEditor.session.getBreakpoints();
};

Editor.prototype.setAnnotations = function(annotations) {
  var base, el, i, j, len, name;
  this.aceEditor.session.setAnnotations(annotations);
  this.annotations = {};
  for (i = j = 0, len = annotations.length; j < len; i = ++j) {
    el = annotations[i];
    if ((base = this.annotations)[name = el.row] == null) {
      base[name] = [];
    }
    this.annotations[el.row].push(el);
  }
  return this.redrawGutter(false);
};

Editor.prototype.resizeGutter = function() {
  if (this.lastGutterWidth !== this.aceEditor.renderer.$gutterLayer.gutterWidth) {
    this.lastGutterWidth = this.aceEditor.renderer.$gutterLayer.gutterWidth;
    this.gutter.style.width = this.lastGutterWidth + 'px';
    return this.resize();
  }
  return this.gutter.style.height = (Math.max(this.dropletElement.offsetHeight, this.mainScrollerStuffing.offsetHeight)) + "px";
};

Editor.prototype.addLineNumberForLine = function(line) {
  var lineDiv, title, treeView;
  treeView = this.view.getViewNodeFor(this.tree);
  if (line in this.lineNumberTags) {
    lineDiv = this.lineNumberTags[line];
  } else {
    lineDiv = document.createElement('div');
    lineDiv.innerText = lineDiv.textContent = line + 1;
    this.lineNumberTags[line] = lineDiv;
  }
  lineDiv.className = 'droplet-gutter-line';
  if (this.annotations[line] != null) {
    lineDiv.className += ' droplet_' + getMostSevereAnnotationType(this.annotations[line]);
    title = this.annotations[line].map(function(x) {
      return x.text;
    }).join('\n');
    lineDiv.addEventListener('mouseover', (function(_this) {
      return function() {
        _this.tooltipElement.innerText = _this.tooltipElement.textContent = title;
        return _this.tooltipElement.style.display = 'block';
      };
    })(this));
    lineDiv.addEventListener('mousemove', (function(_this) {
      return function(event) {
        _this.tooltipElement.style.left = event.pageX + 'px';
        return _this.tooltipElement.style.top = event.pageY + 'px';
      };
    })(this));
    lineDiv.addEventListener('mouseout', (function(_this) {
      return function() {
        return _this.tooltipElement.style.display = 'none';
      };
    })(this));
  }
  if (this.breakpoints[line]) {
    lineDiv.className += ' droplet_breakpoint';
  }
  lineDiv.style.top = treeView.bounds[line].y + "px";
  lineDiv.style.paddingTop = (treeView.distanceToBase[line].above - this.view.opts.textHeight - this.fontAscent) + "px";
  lineDiv.style.paddingBottom = "" + (treeView.distanceToBase[line].below - this.fontDescent);
  lineDiv.style.height = treeView.bounds[line].height + 'px';
  lineDiv.style.fontSize = this.fontSize + 'px';
  return this.lineNumberWrapper.appendChild(lineDiv);
};

TYPE_SEVERITY = {
  'error': 2,
  'warning': 1,
  'info': 0
};

TYPE_FROM_SEVERITY = ['info', 'warning', 'error'];

getMostSevereAnnotationType = function(arr) {
  return TYPE_FROM_SEVERITY[Math.max.apply(this, arr.map(function(x) {
    return TYPE_SEVERITY[x.type];
  }))];
};

Editor.prototype.findLineNumberAtCoordinate = function(coord) {
  var end, pivot, start, treeView;
  treeView = this.view.getViewNodeFor(this.tree);
  start = 0;
  end = treeView.bounds.length;
  pivot = Math.floor((start + end) / 2);
  while (treeView.bounds[pivot].y !== coord && start < end) {
    if (start === pivot || end === pivot) {
      return pivot;
    }
    if (treeView.bounds[pivot].y > coord) {
      end = pivot;
    } else {
      start = pivot;
    }
    if (end < 0) {
      return 0;
    }
    if (start >= treeView.bounds.length) {
      return treeView.bounds.length - 1;
    }
    pivot = Math.floor((start + end) / 2);
  }
  return pivot;
};

hook('redraw_main', 0, function(changedBox) {
  return this.redrawGutter(changedBox);
});

Editor.prototype.redrawGutter = function(changedBox) {
  var bottom, j, line, ref1, ref2, ref3, tag, top, treeView;
  if (changedBox == null) {
    changedBox = true;
  }
  treeView = this.view.getViewNodeFor(this.tree);
  top = this.findLineNumberAtCoordinate(this.scrollOffsets.main.y);
  bottom = this.findLineNumberAtCoordinate(this.scrollOffsets.main.y + this.mainCanvas.height);
  for (line = j = ref1 = top, ref2 = bottom; ref1 <= ref2 ? j <= ref2 : j >= ref2; line = ref1 <= ref2 ? ++j : --j) {
    this.addLineNumberForLine(line);
  }
  ref3 = this.lineNumberTags;
  for (line in ref3) {
    tag = ref3[line];
    if (line < top || line > bottom) {
      this.lineNumberTags[line].parentNode.removeChild(this.lineNumberTags[line]);
      delete this.lineNumberTags[line];
    }
  }
  if (changedBox) {
    return this.resizeGutter();
  }
};

Editor.prototype.setPaletteWidth = function(width) {
  this.paletteWrapper.style.width = width + 'px';
  return this.resizeBlockMode();
};

hook('populate', 1, function() {
  var pressedVKey, pressedXKey;
  this.copyPasteInput = document.createElement('textarea');
  this.copyPasteInput.style.position = 'absolute';
  this.copyPasteInput.style.left = this.copyPasteInput.style.top = '-9999px';
  this.dropletElement.appendChild(this.copyPasteInput);
  pressedVKey = false;
  pressedXKey = false;
  this.copyPasteInput.addEventListener('keydown', function(event) {
    pressedVKey = pressedXKey = false;
    if (event.keyCode === 86) {
      return pressedVKey = true;
    } else if (event.keyCode === 88) {
      return pressedXKey = true;
    }
  });
  return this.copyPasteInput.addEventListener('input', (function(_this) {
    return function() {
      var blocks, e, error, lines, minIndent, str;
      if (_this.readOnly) {
        return;
      }
      if (pressedVKey && !_this.cursorAtSocket()) {
        str = _this.copyPasteInput.value;
        lines = str.split('\n');
        minIndent = lines.map(function(line) {
          return line.length - line.trimLeft().length;
        }).reduce(function(a, b) {
          return Math.min(a, b);
        });
        str = lines.map(function(line) {
          return line.slice(minIndent);
        }).join('\n');
        str = str.replace(/^\n*|\n*$/g, '');
        try {
          blocks = _this.mode.parse(str);
          blocks = new model.List(blocks.start.next, blocks.end.prev);
        } catch (error) {
          e = error;
          blocks = null;
        }
        if (blocks == null) {
          return;
        }
        _this.undoCapture();
        _this.spliceIn(blocks, _this.getCursor());
        _this.setCursor(blocks.end);
        _this.redrawMain();
        return _this.copyPasteInput.setSelectionRange(0, _this.copyPasteInput.value.length);
      } else if (pressedXKey && (_this.lassoSelection != null)) {
        _this.spliceOut(_this.lassoSelection);
        _this.lassoSelection = null;
        return _this.redrawMain();
      }
    };
  })(this));
});

hook('keydown', 0, function(event, state) {
  var ref1, x, y;
  if (ref1 = event.which, indexOf.call(command_modifiers, ref1) >= 0) {
    if (!this.cursorAtSocket()) {
      x = document.body.scrollLeft;
      y = document.body.scrollTop;
      this.copyPasteInput.focus();
      window.scrollTo(x, y);
      if (this.lassoSelection != null) {
        this.copyPasteInput.value = this.lassoSelection.stringifyInPlace();
      }
      return this.copyPasteInput.setSelectionRange(0, this.copyPasteInput.value.length);
    }
  }
});

hook('keyup', 0, function(point, event, state) {
  var ref1;
  if (ref1 = event.which, indexOf.call(command_modifiers, ref1) >= 0) {
    if (this.cursorAtSocket()) {
      return this.hiddenInput.focus();
    } else {
      return this.dropletElement.focus();
    }
  }
});

Editor.prototype.overflowsX = function() {
  return this.documentDimensions().width > this.viewportDimensions().width;
};

Editor.prototype.overflowsY = function() {
  return this.documentDimensions().height > this.viewportDimensions().height;
};

Editor.prototype.documentDimensions = function() {
  var bounds;
  bounds = this.view.getViewNodeFor(this.tree).totalBounds;
  return {
    width: bounds.width,
    height: bounds.height
  };
};

Editor.prototype.viewportDimensions = function() {
  return {
    width: this.mainCanvas.width,
    height: this.mainCanvas.height
  };
};

Editor.prototype.getLineMetrics = function(row) {
  var bounds, viewNode;
  viewNode = this.view.getViewNodeFor(this.tree);
  bounds = (new this.view.draw.Rectangle()).copy(viewNode.bounds[row]);
  bounds.x += this.mainCanvas.offsetLeft + this.mainCanvas.offsetParent.offsetLeft;
  return {
    bounds: bounds,
    distanceToBase: {
      above: viewNode.distanceToBase[row].above,
      below: viewNode.distanceToBase[row].below
    }
  };
};

Editor.prototype.dumpNodeForDebug = function(hitTestResult, line) {
  console.log('Model node:');
  console.log(hitTestResult.serialize());
  console.log('View node:');
  return console.log(this.view.getViewNodeFor(hitTestResult).serialize(line));
};

for (key in unsortedEditorBindings) {
  unsortedEditorBindings[key].sort(function(a, b) {
    if (a.priority > b.priority) {
      return -1;
    } else {
      return 1;
    }
  });
  editorBindings[key] = [];
  ref1 = unsortedEditorBindings[key];
  for (j = 0, len = ref1.length; j < len; j++) {
    binding = ref1[j];
    editorBindings[key].push(binding.fn);
  }
}


},{"../vendor/quadtree.js":36,"./draw.coffee":27,"./helper.coffee":28,"./model.coffee":31,"./modes.coffee":32,"./view.coffee":34}],27:[function(require,module,exports){
var Draw, _area, _intersects, avgColor, helper, max, memoizedAvgColor, min, toHex, toRGB, twoDigitHex, zeroPad,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

helper = require('./helper.coffee');

_area = function(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
};

_intersects = function(a, b, c, d) {
  return ((_area(a, b, c) > 0) !== (_area(a, b, d) > 0)) && ((_area(c, d, a) > 0) !== (_area(c, d, b) > 0));
};

max = function(a, b) {
  return (a > b ? a : b);
};

min = function(a, b) {
  return (b > a ? a : b);
};

toRGB = function(hex) {
  var b, c, g, r;
  if (hex.length === 4) {
    hex = ((function() {
      var j, len1, results;
      results = [];
      for (j = 0, len1 = hex.length; j < len1; j++) {
        c = hex[j];
        results.push(c + c);
      }
      return results;
    })()).join('').slice(1);
  }
  r = parseInt(hex.slice(1, 3), 16);
  g = parseInt(hex.slice(3, 5), 16);
  b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

zeroPad = function(str, len) {
  if (str.length < len) {
    return ((function() {
      var j, ref, ref1, results;
      results = [];
      for (j = ref = str.length, ref1 = len; ref <= ref1 ? j < ref1 : j > ref1; ref <= ref1 ? j++ : j--) {
        results.push('0');
      }
      return results;
    })()).join('') + str;
  } else {
    return str;
  }
};

twoDigitHex = function(n) {
  return zeroPad(Math.round(n).toString(16), 2);
};

toHex = function(rgb) {
  var k;
  return '#' + ((function() {
    var j, len1, results;
    results = [];
    for (j = 0, len1 = rgb.length; j < len1; j++) {
      k = rgb[j];
      results.push(twoDigitHex(k));
    }
    return results;
  })()).join('');
};

memoizedAvgColor = {};

avgColor = function(a, factor, b) {
  var c, i, k, newRGB;
  c = a + ',' + factor + ',' + b;
  if (c in memoizedAvgColor) {
    return memoizedAvgColor[c];
  }
  a = toRGB(a);
  b = toRGB(b);
  newRGB = (function() {
    var j, len1, results;
    results = [];
    for (i = j = 0, len1 = a.length; j < len1; i = ++j) {
      k = a[i];
      results.push(a[i] * factor + b[i] * (1 - factor));
    }
    return results;
  })();
  return memoizedAvgColor[c] = toHex(newRGB);
};

exports.Draw = Draw = (function() {
  function Draw() {
    var NoRectangle, Path, Point, Rectangle, Size, Text, self;
    this.ctx = null;
    this.fontSize = 15;
    this.fontFamily = 'Courier New, monospace';
    this.fontAscent = 2;
    self = this;
    this.Point = Point = (function() {
      function Point(x1, y1) {
        this.x = x1;
        this.y = y1;
      }

      Point.prototype.clone = function() {
        return new Point(this.x, this.y);
      };

      Point.prototype.magnitude = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      };

      Point.prototype.translate = function(vector) {
        this.x += vector.x;
        return this.y += vector.y;
      };

      Point.prototype.add = function(x, y) {
        this.x += x;
        return this.y += y;
      };

      Point.prototype.plus = function(arg) {
        var x, y;
        x = arg.x, y = arg.y;
        return new Point(this.x + x, this.y + y);
      };

      Point.prototype.toMagnitude = function(mag) {
        var r;
        r = mag / this.magnitude();
        return new Point(this.x * r, this.y * r);
      };

      Point.prototype.copy = function(point) {
        this.x = point.x;
        this.y = point.y;
        return this;
      };

      Point.prototype.from = function(point) {
        return new Point(this.x - point.x, this.y - point.y);
      };

      Point.prototype.clear = function() {
        return this.x = this.y = 0;
      };

      Point.prototype.equals = function(point) {
        return point.x === this.x && point.y === this.y;
      };

      return Point;

    })();
    this.Size = Size = (function() {
      function Size(width, height) {
        this.width = width;
        this.height = height;
      }

      Size.prototype.equals = function(size) {
        return this.width === size.width && this.height === size.height;
      };

      Size.copy = function(size) {
        return new Size(size.width, size.height);
      };

      return Size;

    })();
    this.Rectangle = Rectangle = (function() {
      function Rectangle(x1, y1, width, height) {
        this.x = x1;
        this.y = y1;
        this.width = width;
        this.height = height;
      }

      Rectangle.prototype.contains = function(point) {
        return (this.x != null) && (this.y != null) && !((point.x < this.x) || (point.x > this.x + this.width) || (point.y < this.y) || (point.y > this.y + this.height));
      };

      Rectangle.prototype.equals = function(other) {
        if (!(other instanceof Rectangle)) {
          return false;
        }
        return this.x === other.x && this.y === other.y && this.width === other.width && this.height === other.height;
      };

      Rectangle.prototype.copy = function(rect) {
        this.x = rect.x;
        this.y = rect.y;
        this.width = rect.width;
        this.height = rect.height;
        return this;
      };

      Rectangle.prototype.clip = function(ctx) {
        ctx.rect(this.x, this.y, this.width, this.height);
        return ctx.clip();
      };

      Rectangle.prototype.clearRect = function(ctx) {
        return ctx.clearRect(this.x, this.y, this.width, this.height);
      };

      Rectangle.prototype.clone = function() {
        var rect;
        rect = new Rectangle(0, 0, 0, 0);
        rect.copy(this);
        return rect;
      };

      Rectangle.prototype.clear = function() {
        this.width = this.height = 0;
        return this.x = this.y = null;
      };

      Rectangle.prototype.bottom = function() {
        return this.y + this.height;
      };

      Rectangle.prototype.right = function() {
        return this.x + this.width;
      };

      Rectangle.prototype.fill = function(ctx, style) {
        ctx.fillStyle = style;
        return ctx.fillRect(this.x, this.y, this.width, this.height);
      };

      Rectangle.prototype.unite = function(rectangle) {
        if (!((this.x != null) && (this.y != null))) {
          return this.copy(rectangle);
        } else if (!((rectangle.x != null) && (rectangle.y != null))) {

        } else {
          this.width = max(this.right(), rectangle.right()) - (this.x = min(this.x, rectangle.x));
          return this.height = max(this.bottom(), rectangle.bottom()) - (this.y = min(this.y, rectangle.y));
        }
      };

      Rectangle.prototype.swallow = function(point) {
        if (!((this.x != null) && (this.y != null))) {
          return this.copy(new Rectangle(point.x, point.y, 0, 0));
        } else {
          this.width = max(this.right(), point.x) - (this.x = min(this.x, point.x));
          return this.height = max(this.bottom(), point.y) - (this.y = min(this.y, point.y));
        }
      };

      Rectangle.prototype.overlap = function(rectangle) {
        return (this.x != null) && (this.y != null) && !((rectangle.right()) < this.x || (rectangle.bottom() < this.y) || (rectangle.x > this.right()) || (rectangle.y > this.bottom()));
      };

      Rectangle.prototype.translate = function(vector) {
        this.x += vector.x;
        return this.y += vector.y;
      };

      Rectangle.prototype.stroke = function(ctx, style) {
        ctx.strokeStyle = style;
        return ctx.strokeRect(this.x, this.y, this.width, this.height);
      };

      Rectangle.prototype.fill = function(ctx, style) {
        ctx.fillStyle = style;
        return ctx.fillRect(this.x, this.y, this.width, this.height);
      };

      Rectangle.prototype.upperLeftCorner = function() {
        return new Point(this.x, this.y);
      };

      Rectangle.prototype.toPath = function() {
        var j, len1, path, point, ref;
        path = new Path();
        ref = [[this.x, this.y], [this.x, this.bottom()], [this.right(), this.bottom()], [this.right(), this.y]];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          point = ref[j];
          path.push(new Point(point[0], point[1]));
        }
        return path;
      };

      return Rectangle;

    })();
    this.NoRectangle = NoRectangle = (function(superClass) {
      extend(NoRectangle, superClass);

      function NoRectangle() {
        NoRectangle.__super__.constructor.call(this, null, null, 0, 0);
      }

      return NoRectangle;

    })(Rectangle);
    this.Path = Path = (function() {
      function Path() {
        this._points = [];
        this._cachedTranslation = new Point(0, 0);
        this._cacheFlag = false;
        this._bounds = new NoRectangle();
        this.bevel = this.noclip = this.dotted = false;
        this.style = {
          'strokeColor': '#000',
          'lineWidth': 1,
          'fillColor': null
        };
      }

      Path.prototype._clearCache = function() {
        var j, len1, maxX, maxY, minX, minY, point, ref;
        this._cacheFlag = true;
        if (this._cacheFlag) {
          if (this._points.length === 0) {
            return this._bounds = new NoRectangle();
          } else {
            minX = minY = Infinity;
            maxX = maxY = 0;
            ref = this._points;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              point = ref[j];
              minX = min(minX, point.x);
              maxX = max(maxX, point.x);
              minY = min(minY, point.y);
              maxY = max(maxY, point.y);
            }
            this._bounds.x = minX;
            this._bounds.y = minY;
            this._bounds.width = maxX - minX;
            this._bounds.height = maxY - minY;
            return this._cacheFlag = false;
          }
        }
      };

      Path.prototype.push = function(point) {
        this._points.push(point);
        return this._cacheFlag = true;
      };

      Path.prototype.unshift = function(point) {
        this._points.unshift(point);
        return this._cacheFlag = true;
      };

      Path.prototype.reverse = function() {
        this._points.reverse();
        return this;
      };

      Path.prototype.contains = function(point) {
        var count, dest, end, j, last, len1, ref;
        this._clearCache();
        if (this._points.length === 0) {
          return false;
        }
        if (!this._bounds.contains(point)) {
          return false;
        }
        dest = new Point(this._bounds.x - 10, point.y);
        count = 0;
        last = this._points[this._points.length - 1];
        ref = this._points;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          end = ref[j];
          if (_intersects(last, end, point, dest)) {
            count += 1;
          }
          last = end;
        }
        return count % 2 === 1;
      };

      Path.prototype.intersects = function(rectangle) {
        var end, j, l, last, lastSide, len1, len2, rectSides, ref, side;
        this._clearCache();
        if (this._points.length === 0) {
          return false;
        }
        if (!rectangle.overlap(this._bounds)) {
          return false;
        } else {
          last = this._points[this._points.length - 1];
          rectSides = [new Point(rectangle.x, rectangle.y), new Point(rectangle.right(), rectangle.y), new Point(rectangle.right(), rectangle.bottom()), new Point(rectangle.x, rectangle.bottom())];
          ref = this._points;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            end = ref[j];
            lastSide = rectSides[rectSides.length - 1];
            for (l = 0, len2 = rectSides.length; l < len2; l++) {
              side = rectSides[l];
              if (_intersects(last, end, lastSide, side)) {
                return true;
              }
              lastSide = side;
            }
            last = end;
          }
          if (this.contains(rectSides[0])) {
            return true;
          }
          if (rectangle.contains(this._points[0])) {
            return true;
          }
          return false;
        }
      };

      Path.prototype.bounds = function() {
        this._clearCache();
        return this._bounds;
      };

      Path.prototype.translate = function(vector) {
        this._cachedTranslation.translate(vector);
        return this._cacheFlag = true;
      };

      Path.prototype.clip = function(ctx) {
        var j, len1, point, ref;
        this._clearCache();
        if (this._points.length === 0) {
          return;
        }
        ctx.beginPath();
        ctx.moveTo(this._points[0].x, this._points[0].y);
        ref = this._points;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          point = ref[j];
          ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(this._points[0].x, this._points[0].y);
        if (this._points.length > 1) {
          ctx.lineTo(this._points[1].x, this._points[1].y);
        }
        return ctx.clip();
      };

      Path.prototype.draw = function(ctx) {
        var i, j, l, len1, len2, len3, m, point, ref, ref1, ref2;
        this._clearCache();
        if (this._points.length === 0) {
          return;
        }
        ctx.strokeStyle = this.style.strokeColor;
        ctx.lineWidth = this.style.lineWidth;
        if (this.style.fillColor != null) {
          ctx.fillStyle = this.style.fillColor;
        }
        ctx.beginPath();
        ctx.moveTo(this._points[0].x, this._points[0].y);
        ref = this._points;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          point = ref[j];
          ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(this._points[0].x, this._points[0].y);
        if (this._points.length > 1) {
          ctx.lineTo(this._points[1].x, this._points[1].y);
        }
        if (this.style.fillColor != null) {
          ctx.fill();
        }
        ctx.save();
        if (!this.noclip) {
          ctx.clip();
        }
        if (this.bevel) {
          ctx.beginPath();
          ctx.moveTo(this._points[0].x, this._points[0].y);
          ref1 = this._points.slice(1);
          for (i = l = 0, len2 = ref1.length; l < len2; i = ++l) {
            point = ref1[i];
            if ((point.x < this._points[i].x && point.y >= this._points[i].y) || (point.y > this._points[i].y && point.x <= this._points[i].x)) {
              ctx.lineTo(point.x, point.y);
            } else if (!point.equals(this._points[i])) {
              ctx.moveTo(point.x, point.y);
            }
          }
          if (!(this._points[0].x > this._points[this._points.length - 1].x || this._points[0].y < this._points[this._points.length - 1].y)) {
            ctx.lineTo(this._points[0].x, this._points[0].y);
          }
          ctx.lineWidth = 4;
          ctx.strokeStyle = avgColor(this.style.fillColor, 0.85, '#000');
          ctx.stroke();
          ctx.lineWidth = 2;
          ctx.strokeStyle = avgColor(this.style.fillColor, 0.7, '#000');
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(this._points[0].x, this._points[0].y);
          ref2 = this._points.slice(1);
          for (i = m = 0, len3 = ref2.length; m < len3; i = ++m) {
            point = ref2[i];
            if ((point.x > this._points[i].x && point.y <= this._points[i].y) || (point.y < this._points[i].y && point.x >= this._points[i].x)) {
              ctx.lineTo(point.x, point.y);
            } else if (!point.equals(this._points[i])) {
              ctx.moveTo(point.x, point.y);
            }
          }
          if (this._points[0].x > this._points[this._points.length - 1].x || this._points[0].y < this._points[this._points.length - 1].y) {
            ctx.lineTo(this._points[0].x, this._points[0].y);
          }
          ctx.lineWidth = 4;
          ctx.strokeStyle = avgColor(this.style.fillColor, 0.85, '#FFF');
          ctx.stroke();
          ctx.lineWidth = 2;
          ctx.strokeStyle = avgColor(this.style.fillColor, 0.7, '#FFF');
          ctx.stroke();
        } else {
          if (this.dotted && (ctx.setLineDash != null)) {
            ctx.setLineDash([8, 5]);
          }
          ctx.stroke();
        }
        return ctx.restore();
      };

      Path.prototype.clone = function() {
        var clone, el, j, len1, ref;
        clone = new Path();
        ref = this._points;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          el = ref[j];
          clone.push(el);
        }
        return clone;
      };

      Path.prototype.drawShadow = function(ctx, offsetX, offsetY, blur) {
        var j, key, len1, oldValues, point, ref, results, value;
        this._clearCache();
        ctx.fillStyle = this.style.fillColor;
        if (this._points.length === 0) {
          return;
        }
        oldValues = {
          shadowColor: ctx.shadowColor,
          shadowBlur: ctx.shadowBlur,
          shadowOffsetY: ctx.shadowOffsetY,
          shadowOffsetX: ctx.shadowOffsetX,
          globalAlpha: ctx.globalAlpha
        };
        ctx.globalAlpha = 0.5;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = blur;
        ctx.shadowOffsetX = offsetX;
        ctx.shadowOffsetY = offsetY;
        ctx.beginPath();
        ctx.moveTo(this._points[0].x, this._points[0].y);
        ref = this._points;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          point = ref[j];
          ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(this._points[0].x, this._points[0].y);
        ctx.fill();
        results = [];
        for (key in oldValues) {
          if (!hasProp.call(oldValues, key)) continue;
          value = oldValues[key];
          results.push(ctx[key] = value);
        }
        return results;
      };

      return Path;

    })();
    this.Text = Text = (function() {
      function Text(point1, value1) {
        this.point = point1;
        this.value = value1;
        this.wantedFont = self.fontSize + 'px ' + self.fontFamily;
        if (self.ctx.font !== this.wantedFont) {
          self.ctx.font = self.fontSize + 'px ' + self.fontFamily;
        }
        this._bounds = new Rectangle(this.point.x, this.point.y, self.ctx.measureText(this.value).width, self.fontSize);
      }

      Text.prototype.bounds = function() {
        return this._bounds;
      };

      Text.prototype.contains = function(point) {
        return this._bounds.contains(point);
      };

      Text.prototype.translate = function(vector) {
        this.point.translate(vector);
        return this._bounds.translate(vector);
      };

      Text.prototype.setPosition = function(point) {
        return this.translate(point.from(this.point));
      };

      Text.prototype.draw = function(ctx) {
        ctx.textBaseline = 'top';
        ctx.font = self.fontSize + 'px ' + self.fontFamily;
        ctx.fillStyle = '#000';
        return ctx.fillText(this.value, this.point.x, this.point.y - self.fontAscent);
      };

      return Text;

    })();
  }

  Draw.prototype.refreshFontCapital = function() {
    return this.fontAscent = helper.fontMetrics(this.fontFamily, this.fontSize).prettytop;
  };

  Draw.prototype.setCtx = function(ctx) {
    return this.ctx = ctx;
  };

  Draw.prototype.setGlobalFontSize = function(size) {
    this.fontSize = size;
    return this.refreshFontCapital();
  };

  Draw.prototype.setGlobalFontFamily = function(family) {
    this.fontFamily = family;
    return this.refreshFontCapital();
  };

  Draw.prototype.getGlobalFontSize = function() {
    return this.fontSize;
  };

  return Draw;

})();


},{"./helper.coffee":28}],28:[function(require,module,exports){
var deepCopy, deepEquals, fontMetrics, fontMetricsCache, sax,
  hasProp = {}.hasOwnProperty;

sax = require('sax');

exports.ANY_DROP = 0;

exports.BLOCK_ONLY = 1;

exports.MOSTLY_BLOCK = 2;

exports.MOSTLY_VALUE = 3;

exports.VALUE_ONLY = 4;

exports.ENCOURAGE = 1;

exports.DISCOURAGE = 0;

exports.FORBID = -1;

exports.DROPDOWN_ARROW_WIDTH = 15;

exports.DROPDOWN_ARROW_PADDING = 3;

if (typeof window !== "undefined" && window !== null) {
  window.String.prototype.trimLeft = function() {
    return this.replace(/^\s+/, '');
  };
  window.String.prototype.trimRight = function() {
    return this.replace(/\s+$/, '');
  };
}

exports.extend = function(target) {
  var sources;
  sources = [].slice.call(arguments, 1);
  sources.forEach(function(source) {
    if (source) {
      return Object.getOwnPropertyNames(source).forEach(function(prop) {
        return Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
      });
    }
  });
  return target;
};

exports.xmlPrettyPrint = function(str) {
  var result, xmlParser;
  result = '';
  xmlParser = sax.parser(true);
  xmlParser.ontext = function(text) {
    return result += exports.escapeXMLText(text);
  };
  xmlParser.onopentag = function(node) {
    var attr, ref, val;
    result += '<' + node.name;
    ref = node.attributes;
    for (attr in ref) {
      val = ref[attr];
      result += '\n  ' + attr + '=' + JSON.stringify(val);
    }
    return result += '>';
  };
  xmlParser.onclosetag = function(name) {
    return result += '</' + name + '>';
  };
  xmlParser.write(str).close();
  return result;
};

fontMetricsCache = {};

exports.fontMetrics = fontMetrics = function(fontFamily, fontHeight) {
  var baseline, canvas, capital, ctx, ex, fontStyle, gp, height, lf, metrics, result, textTopAndBottom, width;
  fontStyle = fontHeight + "px " + fontFamily;
  result = fontMetricsCache[fontStyle];
  textTopAndBottom = function(testText) {
    var col, first, index, j, k, last, pixels, ref, ref1, right, row;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    ctx.fillText(testText, 0, 0);
    right = Math.ceil(ctx.measureText(testText).width);
    pixels = ctx.getImageData(0, 0, width, height).data;
    first = -1;
    last = height;
    for (row = j = 0, ref = height; 0 <= ref ? j < ref : j > ref; row = 0 <= ref ? ++j : --j) {
      for (col = k = 1, ref1 = right; 1 <= ref1 ? k < ref1 : k > ref1; col = 1 <= ref1 ? ++k : --k) {
        index = (row * width + col) * 4;
        if (pixels[index] !== 0) {
          if (first < 0) {
            first = row;
          }
          break;
        }
      }
      if (first >= 0 && col >= right) {
        last = row;
        break;
      }
    }
    return {
      top: first,
      bottom: last
    };
  };
  if (!result) {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    ctx.font = fontStyle;
    metrics = ctx.measureText('Hg');
    if (canvas.height < fontHeight * 2 || canvas.width < metrics.width) {
      canvas.width = Math.ceil(metrics.width);
      canvas.height = fontHeight * 2;
      ctx = canvas.getContext('2d');
      ctx.font = fontStyle;
    }
    width = canvas.width;
    height = canvas.height;
    capital = textTopAndBottom('H');
    ex = textTopAndBottom('x');
    lf = textTopAndBottom('lf');
    gp = textTopAndBottom('g');
    baseline = capital.bottom;
    result = {
      ascent: lf.top,
      capital: capital.top,
      ex: ex.top,
      baseline: capital.bottom,
      descent: gp.bottom
    };
    result.prettytop = Math.max(0, Math.min(result.ascent, result.ex - (result.descent - result.baseline)));
    fontMetricsCache[fontStyle] = result;
  }
  return result;
};

exports.clipLines = function(lines, start, end) {
  if (start.line !== end.line) {
    console.log('pieces:', "'" + lines[start.line].slice(start.column) + "'", "'" + (lines.slice(start.line + 1, end.line).join('\n')) + "'", "'" + lines[end.line].slice(0, end.column) + "'");
    return lines[start.line].slice(start.column) + lines.slice(start.line + 1, end.line).join('\n') + lines[end.line].slice(0, end.column);
  } else {
    console.log('clipping', lines[start.line], 'from', start.column + 1, 'to', end.column);
    return lines[start.line].slice(start.column, end.column);
  }
};

exports.getFontHeight = function(family, size) {
  var metrics;
  metrics = fontMetrics(family, size);
  return metrics.descent - metrics.prettytop;
};

exports.escapeXMLText = function(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};

exports.serializeShallowDict = function(dict) {
  var key, props, val;
  props = [];
  for (key in dict) {
    val = dict[key];
    props.push(key + ':' + val);
  }
  return props.join(';');
};

exports.deserializeShallowDict = function(str) {
  var dict, j, key, len, prop, props, ref, val;
  if (str == null) {
    return void 0;
  }
  dict = {};
  props = str.split(';');
  for (j = 0, len = props.length; j < len; j++) {
    prop = props[j];
    ref = prop.split(':'), key = ref[0], val = ref[1];
    dict[key] = val;
  }
  return dict;
};

exports.connect = function(a, b) {
  if (a != null) {
    a.next = b;
  }
  if (b != null) {
    b.prev = a;
  }
  return b;
};

exports.string = function(arr) {
  var el, i, j, last, len;
  last = arr[0];
  for (i = j = 0, len = arr.length; j < len; i = ++j) {
    el = arr[i];
    if (i > 0) {
      last = exports.connect(last, el);
    }
  }
  return last;
};

exports.deepCopy = deepCopy = function(a) {
  var key, newObject, val;
  if (a instanceof Object) {
    newObject = {};
    for (key in a) {
      val = a[key];
      newObject[key] = deepCopy(val);
    }
    return newObject;
  } else {
    return a;
  }
};

exports.deepEquals = deepEquals = function(a, b) {
  var key, val;
  if (a instanceof Object && b instanceof Object) {
    for (key in a) {
      if (!hasProp.call(a, key)) continue;
      val = a[key];
      if (!deepEquals(b[key], val)) {
        return false;
      }
    }
    for (key in b) {
      if (!hasProp.call(b, key)) continue;
      val = b[key];
      if (!key in a) {
        if (!deepEquals(a[key], val)) {
          return false;
        }
      }
    }
    return true;
  } else {
    return a === b;
  }
};


},{"sax":25}],29:[function(require,module,exports){
var CATEGORIES, CLASS_EXCEPTIONS, DEFAULT_INDENT_DEPTH, JavaScriptParser, KNOWN_FUNCTIONS, LOGICAL_OPERATORS, NEVER_PAREN, NODE_CATEGORIES, OPERATOR_PRECEDENCES, STATEMENT_NODE_TYPES, acorn, helper, isStandardForLoop, model, parser,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

helper = require('../helper.coffee');

model = require('../model.coffee');

parser = require('../parser.coffee');

acorn = require('../../vendor/acorn');

STATEMENT_NODE_TYPES = ['ExpressionStatement', 'ReturnStatement', 'BreakStatement', 'ThrowStatement'];

NEVER_PAREN = 100;

KNOWN_FUNCTIONS = {
  'alert': {},
  'prompt': {},
  'console.log': {},
  '*.toString': {
    value: true
  },
  'Math.abs': {
    value: true
  },
  'Math.acos': {
    value: true
  },
  'Math.asin': {
    value: true
  },
  'Math.atan': {
    value: true
  },
  'Math.atan2': {
    value: true
  },
  'Math.cos': {
    value: true
  },
  'Math.sin': {
    value: true
  },
  'Math.tan': {
    value: true
  },
  'Math.ceil': {
    value: true
  },
  'Math.floor': {
    value: true
  },
  'Math.round': {
    value: true
  },
  'Math.exp': {
    value: true
  },
  'Math.ln': {
    value: true
  },
  'Math.log10': {
    value: true
  },
  'Math.pow': {
    value: true
  },
  'Math.sqrt': {
    value: true
  },
  'Math.max': {
    value: true
  },
  'Math.min': {
    value: true
  },
  'Math.random': {
    value: true
  }
};

CATEGORIES = {
  functions: {
    color: 'purple'
  },
  returns: {
    color: 'yellow'
  },
  comments: {
    color: 'gray'
  },
  arithmetic: {
    color: 'green'
  },
  logic: {
    color: 'cyan'
  },
  containers: {
    color: 'teal'
  },
  assignments: {
    color: 'blue'
  },
  loops: {
    color: 'orange'
  },
  conditionals: {
    color: 'orange'
  },
  value: {
    color: 'green'
  },
  command: {
    color: 'blue'
  },
  errors: {
    color: '#f00'
  }
};

LOGICAL_OPERATORS = {
  '==': true,
  '!=': true,
  '===': true,
  '!==': true,
  '<': true,
  '<=': true,
  '>': true,
  '>=': true,
  'in': true,
  'instanceof': true,
  '||': true,
  '&&': true,
  '!': true
};

NODE_CATEGORIES = {
  'BinaryExpression': 'arithmetic',
  'UnaryExpression': 'arithmetic',
  'ConditionalExpression': 'arithmetic',
  'LogicalExpression': 'logic',
  'FunctionExpression': 'functions',
  'FunctionDeclaration': 'functions',
  'AssignmentExpression': 'assignments',
  'UpdateExpression': 'assignments',
  'VariableDeclaration': 'assignments',
  'ReturnStatement': 'returns',
  'IfStatement': 'conditionals',
  'SwitchStatement': 'conditionals',
  'ForStatement': 'loops',
  'ForInStatement': 'loops',
  'WhileStatement': 'loops',
  'DoWhileStatement': 'loops',
  'NewExpression': 'containers',
  'ObjectExpression': 'containers',
  'ArrayExpression': 'containers',
  'MemberExpression': 'containers',
  'BreakStatement': 'returns',
  'ThrowStatement': 'returns',
  'TryStatement': 'returns',
  'CallExpression': 'command',
  'SequenceExpression': 'command',
  'Identifier': 'value'
};

OPERATOR_PRECEDENCES = {
  '++': 3,
  '--': 3,
  '!': 4,
  '~': 4,
  '*': 5,
  '/': 5,
  '%': 5,
  '+': 6,
  '-': 6,
  '<<': 7,
  '>>': 7,
  '>>>': 7,
  '<': 8,
  '>': 8,
  '>=': 8,
  'in': 8,
  'instanceof': 8,
  '==': 9,
  '!=': 9,
  '===': 9,
  '!==': 9,
  '&': 10,
  '^': 11,
  '|': 12,
  '&&': 13,
  '||': 14
};

CLASS_EXCEPTIONS = {
  'ForStatement': ['ends-with-brace', 'block-only'],
  'FunctionDeclaration': ['ends-with-brace', 'block-only'],
  'IfStatement': ['ends-with-brace', 'block-only'],
  'WhileStatement': ['ends-with-brace', 'block-only'],
  'DoWhileStatement': ['ends-with-brace', 'block-only'],
  'SwitchStatement': ['ends-with-brace', 'block-only'],
  'AssignmentExpression': ['mostly-block']
};

DEFAULT_INDENT_DEPTH = '  ';

exports.JavaScriptParser = JavaScriptParser = (function(superClass) {
  extend(JavaScriptParser, superClass);

  function JavaScriptParser(text1, opts) {
    var base;
    this.text = text1;
    JavaScriptParser.__super__.constructor.apply(this, arguments);
    if ((base = this.opts).functions == null) {
      base.functions = KNOWN_FUNCTIONS;
    }
    this.opts.categories = helper.extend({}, CATEGORIES, this.opts.categories);
    this.lines = this.text.split('\n');
  }

  JavaScriptParser.prototype.markRoot = function() {
    var tree;
    tree = acorn.parse(this.text, {
      locations: true,
      line: 0,
      allowReturnOutsideFunction: true
    });
    return this.mark(0, tree, 0, null);
  };

  JavaScriptParser.prototype.fullNameArray = function(obj) {
    var props;
    props = [];
    while (obj.type === 'MemberExpression') {
      props.unshift(obj.property.name);
      obj = obj.object;
    }
    if (obj.type === 'Identifier') {
      props.unshift(obj.name);
    } else {
      props.unshift('*');
    }
    return props;
  };

  JavaScriptParser.prototype.lookupKnownName = function(node) {
    var fn, fname, full, identifier, last, wildcard;
    if (node.type === 'CallExpression' || node.type === 'NewExpression') {
      identifier = false;
    } else if (node.type === 'Identifier' || node.type === 'MemberExpression') {
      identifier = true;
    } else {
      throw new Error;
    }
    fname = this.fullNameArray(identifier ? node : node.callee);
    full = fname.join('.');
    fn = this.opts.functions[full];
    if (fn && ((identifier && fn.property) || (!identifier && !fn.property))) {
      return {
        name: full,
        anyobj: false,
        fn: this.opts.functions[full]
      };
    }
    last = fname[fname.length - 1];
    if (fname.length > 1 && !((wildcard = '*.' + last) in this.opts.functions)) {
      wildcard = null;
    }
    if (!wildcard && !((wildcard = '?.' + last) in this.opts.functions)) {
      wildcard = null;
    }
    if (wildcard !== null) {
      fn = this.opts.functions[wildcard];
      if (fn && ((identifier && fn.property) || (!identifier && !fn.property))) {
        return {
          name: last,
          anyobj: true,
          fn: this.opts.functions[wildcard]
        };
      }
    }
    return null;
  };

  JavaScriptParser.prototype.getAcceptsRule = function(node) {
    return {
      "default": helper.NORMAL
    };
  };

  JavaScriptParser.prototype.getClasses = function(node) {
    var known;
    if (node.type in CLASS_EXCEPTIONS) {
      return CLASS_EXCEPTIONS[node.type].concat([node.type]);
    } else {
      if (node.type === 'CallExpression' || node.type === 'NewExpression' || node.type === 'Identifier') {
        known = this.lookupKnownName(node);
        if (!known || (known.fn.value && known.fn.command)) {
          return [node.type, 'any-drop'];
        }
        if (known.fn.value) {
          return [node.type, 'mostly-value'];
        } else {
          return [node.type, 'mostly-block'];
        }
      }
      if (node.type.match(/Expression$/) != null) {
        return [node.type, 'mostly-value'];
      } else if (node.type.match(/Declaration$/) != null) {
        return [node.type, 'block-only'];
      } else if (node.type.match(/Statement$/) != null) {
        return [node.type, 'mostly-block'];
      } else {
        return [node.type, 'any-drop'];
      }
    }
  };

  JavaScriptParser.prototype.getPrecedence = function(node) {
    var ref, ref1;
    switch (node.type) {
      case 'BinaryExpression':
      case 'LogicalExpression':
        return OPERATOR_PRECEDENCES[node.operator];
      case 'AssignStatement':
        return 16;
      case 'UnaryExpression':
        if (node.prefix) {
          return (ref = OPERATOR_PRECEDENCES[node.operator]) != null ? ref : 4;
        } else {
          return (ref1 = OPERATOR_PRECEDENCES[node.operator]) != null ? ref1 : 3;
        }
        break;
      case 'CallExpression':
        return 2;
      case 'NewExpression':
        return 2;
      case 'MemberExpression':
        return 1;
      case 'ExpressionStatement':
        return this.getPrecedence(node.expression);
      default:
        return 0;
    }
  };

  JavaScriptParser.prototype.lookupCategory = function(node) {
    var category;
    switch (node.type) {
      case 'BinaryExpression':
      case 'UnaryExpression':
        if (LOGICAL_OPERATORS.hasOwnProperty(node.operator)) {
          category = 'logic';
        } else {
          category = 'arithmetic';
        }
        break;
      default:
        category = NODE_CATEGORIES[node.type];
    }
    return this.opts.categories[category];
  };

  JavaScriptParser.prototype.getColor = function(node) {
    var category, known;
    switch (node.type) {
      case 'ExpressionStatement':
        return this.getColor(node.expression);
      case 'CallExpression':
      case 'NewExpression':
      case 'MemberExpression':
      case 'Identifier':
        known = this.lookupKnownName(node);
        if (known) {
          if (known.fn.color) {
            return known.fn.color;
          } else if (known.fn.value && !known.fn.command) {
            return this.opts.categories.value.color;
          }
        }
    }
    category = this.lookupCategory(node);
    return (category != null ? category.color : void 0) || 'command';
  };

  JavaScriptParser.prototype.getSocketLevel = function(node) {
    return helper.ANY_DROP;
  };

  JavaScriptParser.prototype.getBounds = function(node) {
    var bounds, line, ref, ref1, semicolon, semicolonLength;
    if (node.type === 'BlockStatement') {
      bounds = {
        start: {
          line: node.loc.start.line,
          column: node.loc.start.column + 1
        },
        end: {
          line: node.loc.end.line,
          column: node.loc.end.column - 1
        }
      };
      bounds.start.column += ((ref = this.lines[bounds.start.line].slice(bounds.start.column).match(/^\s*/)) != null ? ref : [''])[0].length;
      if (this.lines[bounds.end.line].slice(0, bounds.end.column).trim().length === 0) {
        bounds.end.line -= 1;
        bounds.end.column = this.lines[bounds.end.line].length;
      }
      return bounds;
    } else if (ref1 = node.type, indexOf.call(STATEMENT_NODE_TYPES, ref1) >= 0) {
      line = this.lines[node.loc.end.line];
      semicolon = this.lines[node.loc.end.line].slice(node.loc.end.column - 1).indexOf(';');
      if (semicolon >= 0) {
        semicolonLength = this.lines[node.loc.end.line].slice(node.loc.end.column - 1).match(/;\s*/)[0].length;
        return {
          start: {
            line: node.loc.start.line,
            column: node.loc.start.column
          },
          end: {
            line: node.loc.end.line,
            column: node.loc.end.column + semicolon + semicolonLength - 1
          }
        };
      }
    }
    return {
      start: {
        line: node.loc.start.line,
        column: node.loc.start.column
      },
      end: {
        line: node.loc.end.line,
        column: node.loc.end.column
      }
    };
  };

  JavaScriptParser.prototype.getCaseIndentBounds = function(node) {
    var bounds;
    bounds = {
      start: this.getBounds(node.consequent[0]).start,
      end: this.getBounds(node.consequent[node.consequent.length - 1]).end
    };
    if (this.lines[bounds.start.line].slice(0, bounds.start.column).trim().length === 0) {
      bounds.start.line -= 1;
      bounds.start.column = this.lines[bounds.start.line].length;
    }
    if (this.lines[bounds.end.line].slice(0, bounds.end.column).trim().length === 0) {
      bounds.end.line -= 1;
      bounds.end.column = this.lines[bounds.end.line].length;
    }
    return bounds;
  };

  JavaScriptParser.prototype.getIndentPrefix = function(bounds, indentDepth) {
    var line;
    if (bounds.end.line - bounds.start.line < 1) {
      return DEFAULT_INDENT_DEPTH;
    } else {
      line = this.lines[bounds.start.line + 1];
      return line.slice(indentDepth, line.length - line.trimLeft().length);
    }
  };

  JavaScriptParser.prototype.isComment = function(text) {
    return text.match(/^\s*\/\/.*$/);
  };

  JavaScriptParser.prototype.mark = function(indentDepth, node, depth, bounds) {
    var argument, block, currentElif, declaration, element, endPosition, expression, i, j, k, known, l, len, len1, len2, len3, len4, len5, len6, len7, len8, m, match, n, nodeBoundsStart, o, p, position, prefix, property, q, r, ref, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results, results1, results2, results3, results4, results5, results6, results7, results8, space, statement, string, switchCase;
    switch (node.type) {
      case 'Program':
        ref = node.body;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          statement = ref[j];
          results.push(this.mark(indentDepth, statement, depth + 1, null));
        }
        return results;
        break;
      case 'Function':
        this.jsBlock(node, depth, bounds);
        return this.mark(indentDepth, node.body, depth + 1, null);
      case 'SequenceExpression':
        this.jsBlock(node, depth, bounds);
        ref1 = node.expressions;
        results1 = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          expression = ref1[k];
          results1.push(this.jsSocketAndMark(indentDepth, expression, depth + 1, null));
        }
        return results1;
        break;
      case 'FunctionDeclaration':
        this.jsBlock(node, depth, bounds);
        this.mark(indentDepth, node.body, depth + 1, null);
        this.jsSocketAndMark(indentDepth, node.id, depth + 1, null, null, ['no-drop']);
        if (node.params.length > 0) {
          return this.addSocket({
            bounds: {
              start: this.getBounds(node.params[0]).start,
              end: this.getBounds(node.params[node.params.length - 1]).end
            },
            depth: depth + 1,
            precedence: 0,
            dropdown: null,
            classes: ['no-drop'],
            empty: ''
          });
        } else if (!this.opts.lockZeroParamFunctions) {
          nodeBoundsStart = this.getBounds(node.id).end;
          match = this.lines[nodeBoundsStart.line].slice(nodeBoundsStart.column).match(/^(\s*\()(\s*)\)/);
          if (match != null) {
            return this.addSocket({
              bounds: {
                start: {
                  line: nodeBoundsStart.line,
                  column: nodeBoundsStart.column + match[1].length
                },
                end: {
                  line: nodeBoundsStart.line,
                  column: nodeBoundsStart.column + match[1].length + match[2].length
                }
              },
              depth: depth,
              precedence: 0,
              dropdown: null,
              classes: ['forbid-all', '__function_param__'],
              empty: ''
            });
          }
        }
        break;
      case 'FunctionExpression':
        this.jsBlock(node, depth, bounds);
        this.mark(indentDepth, node.body, depth + 1, null);
        if (node.id != null) {
          this.jsSocketAndMark(indentDepth, node.id, depth + 1, null, null, ['no-drop']);
        }
        if (node.params.length > 0) {
          return this.addSocket({
            bounds: {
              start: this.getBounds(node.params[0]).start,
              end: this.getBounds(node.params[node.params.length - 1]).end
            },
            depth: depth + 1,
            precedence: 0,
            dropdown: null,
            classes: ['no-drop'],
            empty: ''
          });
        } else if (!this.opts.lockZeroParamFunctions) {
          if (node.id != null) {
            nodeBoundsStart = this.getBounds(node.id).end;
            match = this.lines[nodeBoundsStart.line].slice(nodeBoundsStart.column).match(/^(\s*\()(\s*)\)/);
          } else {
            nodeBoundsStart = this.getBounds(node).start;
            match = this.lines[nodeBoundsStart.line].slice(nodeBoundsStart.column).match(/^(\s*function\s*\()(\s*)\)/);
          }
          if (match != null) {
            return position = this.addSocket({
              bounds: {
                start: {
                  line: nodeBoundsStart.line,
                  column: nodeBoundsStart.column + match[1].length
                },
                end: {
                  line: nodeBoundsStart.line,
                  column: nodeBoundsStart.column + match[1].length + match[2].length
                }
              },
              depth: depth,
              precedence: 0,
              dropdown: null,
              classes: ['forbid-all', '__function_param__'],
              empty: ''
            });
          }
        }
        break;
      case 'AssignmentExpression':
        this.jsBlock(node, depth, bounds);
        this.jsSocketAndMark(indentDepth, node.left, depth + 1, NEVER_PAREN);
        return this.jsSocketAndMark(indentDepth, node.right, depth + 1, NEVER_PAREN);
      case 'ReturnStatement':
        this.jsBlock(node, depth, bounds);
        if (node.argument != null) {
          return this.jsSocketAndMark(indentDepth, node.argument, depth + 1, null);
        }
        break;
      case 'IfStatement':
      case 'ConditionalExpression':
        this.jsBlock(node, depth, bounds, {
          addButton: true
        });
        this.jsSocketAndMark(indentDepth, node.test, depth + 1, NEVER_PAREN);
        this.jsSocketAndMark(indentDepth, node.consequent, depth + 1, null);
        currentElif = node.alternate;
        results2 = [];
        while (currentElif != null) {
          if (currentElif.type === 'IfStatement') {
            this.jsSocketAndMark(indentDepth, currentElif.test, depth + 1, null);
            this.jsSocketAndMark(indentDepth, currentElif.consequent, depth + 1, null);
            results2.push(currentElif = currentElif.alternate);
          } else {
            this.jsSocketAndMark(indentDepth, currentElif, depth + 1, 10);
            results2.push(currentElif = null);
          }
        }
        return results2;
        break;
      case 'ForInStatement':
        this.jsBlock(node, depth, bounds);
        if (node.left != null) {
          this.jsSocketAndMark(indentDepth, node.left, depth + 1, NEVER_PAREN, null, ['foreach-lhs']);
        }
        if (node.right != null) {
          this.jsSocketAndMark(indentDepth, node.right, depth + 1, 10);
        }
        return this.mark(indentDepth, node.body, depth + 1);
      case 'BreakStatement':
      case 'ContinueStatement':
        this.jsBlock(node, depth, bounds);
        if (node.label != null) {
          return this.jsSocketAndMark(indentDepth, node.label, depth + 1, null);
        }
        break;
      case 'ThrowStatement':
        this.jsBlock(node, depth, bounds);
        return this.jsSocketAndMark(indentDepth, node.argument, depth + 1, null);
      case 'ForStatement':
        this.jsBlock(node, depth, bounds);
        if (this.opts.categories.loops.beginner && isStandardForLoop(node)) {
          this.jsSocketAndMark(indentDepth, node.test.right);
        } else {
          if (node.init != null) {
            this.jsSocketAndMark(indentDepth, node.init, depth + 1, NEVER_PAREN, null, ['for-statement-init']);
          }
          if (node.test != null) {
            this.jsSocketAndMark(indentDepth, node.test, depth + 1, 10);
          }
          if (node.update != null) {
            this.jsSocketAndMark(indentDepth, node.update, depth + 1, 10, null, ['for-statement-update']);
          }
        }
        return this.mark(indentDepth, node.body, depth + 1);
      case 'BlockStatement':
        prefix = this.getIndentPrefix(this.getBounds(node), indentDepth);
        indentDepth += prefix.length;
        this.addIndent({
          bounds: this.getBounds(node),
          depth: depth,
          prefix: prefix
        });
        ref2 = node.body;
        results3 = [];
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          statement = ref2[l];
          results3.push(this.mark(indentDepth, statement, depth + 1, null));
        }
        return results3;
        break;
      case 'BinaryExpression':
        this.jsBlock(node, depth, bounds);
        this.jsSocketAndMark(indentDepth, node.left, depth + 1, OPERATOR_PRECEDENCES[node.operator]);
        return this.jsSocketAndMark(indentDepth, node.right, depth + 1, OPERATOR_PRECEDENCES[node.operator]);
      case 'UnaryExpression':
        if (!(((ref3 = node.operator) === '-' || ref3 === '+') && ((ref4 = node.argument.type) === 'Identifier' || ref4 === 'Literal'))) {
          this.jsBlock(node, depth, bounds);
          return this.jsSocketAndMark(indentDepth, node.argument, depth + 1, this.getPrecedence(node));
        }
        break;
      case 'ExpressionStatement':
        return this.mark(indentDepth, node.expression, depth + 1, this.getBounds(node));
      case 'Identifier':
        if (node.name === '__') {
          block = this.jsBlock(node, depth, bounds);
          return block.flagToRemove = true;
        } else if (this.lookupKnownName(node)) {
          return this.jsBlock(node, depth, bounds);
        }
        break;
      case 'CallExpression':
      case 'NewExpression':
        this.jsBlock(node, depth, bounds);
        known = this.lookupKnownName(node);
        if (!known) {
          this.jsSocketAndMark(indentDepth, node.callee, depth + 1, NEVER_PAREN);
        } else if (known.anyobj && node.callee.type === 'MemberExpression') {
          this.jsSocketAndMark(indentDepth, node.callee.object, depth + 1, NEVER_PAREN);
        }
        ref5 = node["arguments"];
        for (i = m = 0, len3 = ref5.length; m < len3; i = ++m) {
          argument = ref5[i];
          this.jsSocketAndMark(indentDepth, argument, depth + 1, NEVER_PAREN, null, null, known != null ? (ref6 = known.fn) != null ? (ref7 = ref6.dropdown) != null ? ref7[i] : void 0 : void 0 : void 0, (i === 0 && node["arguments"].length === 1 ? '' : void 0));
        }
        if (!known && node["arguments"].length === 0 && !this.opts.lockZeroParamFunctions) {
          position = {
            line: node.callee.loc.end.line,
            column: node.callee.loc.end.column
          };
          string = this.lines[position.line].slice(position.column).match(/^\s*\(/)[0];
          position.column += string.length;
          endPosition = {
            line: position.line,
            column: position.column
          };
          space = this.lines[position.line].slice(position.column).match(/^(\s*)\)/);
          if (space != null) {
            endPosition.column += space[1].length;
          }
          return this.addSocket({
            bounds: {
              start: position,
              end: endPosition
            },
            depth: depth + 1,
            precedence: NEVER_PAREN,
            dropdown: null,
            classes: ['mostly-value'],
            empty: ''
          });
        }
        break;
      case 'MemberExpression':
        this.jsBlock(node, depth, bounds);
        known = this.lookupKnownName(node);
        if (!known) {
          this.jsSocketAndMark(indentDepth, node.property, depth + 1);
        }
        if (!known || known.anyobj) {
          return this.jsSocketAndMark(indentDepth, node.object, depth + 1);
        }
        break;
      case 'UpdateExpression':
        this.jsBlock(node, depth, bounds);
        return this.jsSocketAndMark(indentDepth, node.argument, depth + 1);
      case 'VariableDeclaration':
        this.jsBlock(node, depth, bounds);
        ref8 = node.declarations;
        results4 = [];
        for (n = 0, len4 = ref8.length; n < len4; n++) {
          declaration = ref8[n];
          results4.push(this.mark(indentDepth, declaration, depth + 1));
        }
        return results4;
        break;
      case 'VariableDeclarator':
        this.jsSocketAndMark(indentDepth, node.id, depth);
        if (node.init != null) {
          return this.jsSocketAndMark(indentDepth, node.init, depth, NEVER_PAREN);
        }
        break;
      case 'LogicalExpression':
        this.jsBlock(node, depth, bounds);
        this.jsSocketAndMark(indentDepth, node.left, depth + 1, this.getPrecedence(node));
        return this.jsSocketAndMark(indentDepth, node.right, depth + 1, this.getPrecedence(node));
      case 'WhileStatement':
      case 'DoWhileStatement':
        this.jsBlock(node, depth, bounds);
        this.jsSocketAndMark(indentDepth, node.body, depth + 1);
        return this.jsSocketAndMark(indentDepth, node.test, depth + 1);
      case 'ObjectExpression':
        this.jsBlock(node, depth, bounds);
        ref9 = node.properties;
        results5 = [];
        for (o = 0, len5 = ref9.length; o < len5; o++) {
          property = ref9[o];
          this.jsSocketAndMark(indentDepth, property.key, depth + 1);
          results5.push(this.jsSocketAndMark(indentDepth, property.value, depth + 1));
        }
        return results5;
        break;
      case 'SwitchStatement':
        this.jsBlock(node, depth, bounds);
        this.jsSocketAndMark(indentDepth, node.discriminant, depth + 1);
        ref10 = node.cases;
        results6 = [];
        for (p = 0, len6 = ref10.length; p < len6; p++) {
          switchCase = ref10[p];
          results6.push(this.mark(indentDepth, switchCase, depth + 1, null));
        }
        return results6;
        break;
      case 'SwitchCase':
        if (node.test != null) {
          this.jsSocketAndMark(indentDepth, node.test, depth + 1);
        }
        if (node.consequent.length > 0) {
          bounds = this.getCaseIndentBounds(node);
          prefix = this.getIndentPrefix(this.getBounds(node), indentDepth);
          indentDepth += prefix.length;
          this.addIndent({
            bounds: bounds,
            depth: depth + 1,
            prefix: prefix
          });
          ref11 = node.consequent;
          results7 = [];
          for (q = 0, len7 = ref11.length; q < len7; q++) {
            statement = ref11[q];
            results7.push(this.mark(indentDepth, statement, depth + 2));
          }
          return results7;
        }
        break;
      case 'TryStatement':
        this.jsBlock(node, depth, bounds);
        this.jsSocketAndMark(indentDepth, node.block, depth + 1, null);
        if (node.handler != null) {
          if (node.handler.guard != null) {
            this.jsSocketAndMark(indentDepth, node.handler.guard, depth + 1, null);
          }
          if (node.handler.param != null) {
            this.jsSocketAndMark(indentDepth, node.handler.param, depth + 1, null);
          }
          this.jsSocketAndMark(indentDepth, node.handler.body, depth + 1, null);
        }
        if (node.finalizer != null) {
          return this.jsSocketAndMark(indentDepth, node.finalizer, depth + 1, null);
        }
        break;
      case 'ArrayExpression':
        this.jsBlock(node, depth, bounds);
        ref12 = node.elements;
        results8 = [];
        for (r = 0, len8 = ref12.length; r < len8; r++) {
          element = ref12[r];
          if (element != null) {
            results8.push(this.jsSocketAndMark(indentDepth, element, depth + 1, null));
          } else {
            results8.push(void 0);
          }
        }
        return results8;
        break;
      case 'Literal':
        return null;
      default:
        return console.log('Unrecognized', node);
    }
  };

  JavaScriptParser.prototype.jsBlock = function(node, depth, bounds, buttons) {
    return this.addBlock({
      bounds: bounds != null ? bounds : this.getBounds(node),
      depth: depth,
      precedence: this.getPrecedence(node),
      color: this.getColor(node),
      classes: this.getClasses(node),
      socketLevel: this.getSocketLevel(node),
      buttons: buttons
    });
  };

  JavaScriptParser.prototype.jsSocketAndMark = function(indentDepth, node, depth, precedence, bounds, classes, dropdown, empty) {
    if (node.type !== 'BlockStatement') {
      this.addSocket({
        bounds: bounds != null ? bounds : this.getBounds(node),
        depth: depth,
        precedence: precedence,
        classes: classes != null ? classes : [],
        dropdown: dropdown,
        empty: empty
      });
    }
    return this.mark(indentDepth, node, depth + 1, bounds);
  };

  return JavaScriptParser;

})(parser.Parser);

JavaScriptParser.parens = function(leading, trailing, node, context) {
  if (indexOf.call(node.classes, '__comment__') >= 0) {
    return;
  }
  if ((context != null ? context.type : void 0) === 'socket' || ((context == null) && indexOf.call(node.classes, 'mostly-value') >= 0 || indexOf.call(node.classes, 'value-only') >= 0) || indexOf.call(node.classes, 'ends-with-brace') >= 0 || node.type === 'document') {
    trailing(trailing().replace(/;?\s*$/, ''));
  } else {
    trailing(trailing().replace(/;?\s*$/, ';'));
  }
  while (true) {
    if ((leading().match(/^\s*\(/) != null) && (trailing().match(/\)\s*/) != null)) {
      leading(leading().replace(/^\s*\(\s*/, ''));
      trailing(trailing().replace(/\s*\)\s*$/, ''));
    } else {
      break;
    }
  }
  if (!(context === null || context.type !== 'socket' || context.precedence > node.precedence)) {
    leading('(' + leading());
    return trailing(trailing() + ')');
  }
};

JavaScriptParser.drop = function(block, context, pred) {
  var ref, ref1;
  if (context.type === 'socket') {
    if (indexOf.call(context.classes, 'lvalue') >= 0) {
      if (indexOf.call(block.classes, 'Value') >= 0 && ((ref = block.properties) != null ? ref.length : void 0) > 0) {
        return helper.ENCOURAGE;
      } else {
        return helper.FORBID;
      }
    } else if (indexOf.call(context.classes, 'no-drop') >= 0) {
      return helper.FORBID;
    } else if (indexOf.call(context.classes, 'property-access') >= 0) {
      if (indexOf.call(block.classes, 'works-as-method-call') >= 0) {
        return helper.ENCOURAGE;
      } else {
        return helper.FORBID;
      }
    } else if (indexOf.call(block.classes, 'value-only') >= 0 || indexOf.call(block.classes, 'mostly-value') >= 0 || indexOf.call(block.classes, 'any-drop') >= 0 || indexOf.call(context.classes, 'for-statement-init') >= 0 || (indexOf.call(block.classes, 'mostly-block') >= 0 && indexOf.call(context.classes, 'for-statement-update') >= 0)) {
      return helper.ENCOURAGE;
    } else if (indexOf.call(block.classes, 'mostly-block') >= 0) {
      return helper.DISCOURAGE;
    }
  } else if ((ref1 = context.type) === 'indent' || ref1 === 'document') {
    if (indexOf.call(block.classes, 'block-only') >= 0 || indexOf.call(block.classes, 'mostly-block') >= 0 || indexOf.call(block.classes, 'any-drop') >= 0 || block.type === 'document') {
      return helper.ENCOURAGE;
    } else if (indexOf.call(block.classes, 'mostly-value') >= 0) {
      return helper.DISCOURAGE;
    }
  }
  return helper.DISCOURAGE;
};

isStandardForLoop = function(node) {
  var ref, variableName;
  if (!((node.init != null) && (node.test != null) && (node.update != null))) {
    return false;
  }
  if (node.init.type === 'VariableDeclaration') {
    variableName = node.init.declarations[0].id.name;
  } else if (node.init.type === 'AssignmentExpression' && node.operator === '=' && node.left.type === 'Identifier') {
    variableName = node.left.name;
  } else {
    return false;
  }
  return node.test.type === 'BinaryExpression' && node.test.operator === '<' && node.test.left.type === 'Identifier' && node.test.left.name === variableName && ((ref = node.test.right.type) === 'Literal' || ref === 'Identifier') && node.update.type === 'UpdateExpression' && node.update.operator === '++' && node.update.argument.type === 'Identifier' && node.update.argument.name === variableName;
};

JavaScriptParser.empty = "__";

JavaScriptParser.emptyIndent = "";

JavaScriptParser.startComment = '/*';

JavaScriptParser.endComment = '*/';

JavaScriptParser.handleButton = function(text, button, oldBlock) {
  var currentElif, elseLocation, lines, node;
  if (button === 'add-button' && indexOf.call(oldBlock.classes, 'IfStatement') >= 0) {
    node = acorn.parse(text, {
      locations: true,
      line: 0,
      allowReturnOutsideFunction: true
    }).body[0];
    currentElif = node;
    elseLocation = null;
    while (true) {
      if (currentElif.type === 'IfStatement') {
        if (currentElif.alternate != null) {
          elseLocation = {
            line: currentElif.alternate.loc.start.line,
            column: currentElif.alternate.loc.start.column
          };
          currentElif = currentElif.alternate;
        } else {
          elseLocation = null;
          break;
        }
      } else {
        break;
      }
    }
    if (elseLocation != null) {
      lines = text.split('\n');
      elseLocation = lines.slice(0, elseLocation.line).join('\n').length + elseLocation.column + 1;
      return text.slice(0, elseLocation).trimRight() + ' if (__) ' + text.slice(elseLocation).trimLeft() + ' else {\n  __\n}';
    } else {
      return text + ' else {\n  __\n}';
    }
  }
};

JavaScriptParser.getDefaultSelectionRange = function(string) {
  var end, ref, start;
  start = 0;
  end = string.length;
  if (string[0] === string[string.length - 1] && ((ref = string[0]) === '"' || ref === '\'' || ref === '/')) {
    start += 1;
    end -= 1;
  }
  return {
    start: start,
    end: end
  };
};

module.exports = parser.wrapParser(JavaScriptParser);


},{"../../vendor/acorn":35,"../helper.coffee":28,"../model.coffee":31,"../parser.coffee":33}],30:[function(require,module,exports){
module.exports = {
  Editor: require('./controller.coffee').Editor
};


},{"./controller.coffee":26}],31:[function(require,module,exports){
var Block, BlockEndToken, BlockStartToken, Container, Document, DocumentEndToken, DocumentStartToken, EndToken, FORBID, Indent, IndentEndToken, IndentStartToken, List, Location, NO, NORMAL, NewlineToken, Operation, ReplaceOperation, Socket, SocketEndToken, SocketStartToken, StartToken, TextLocation, TextToken, Token, YES, _id, helper, isTreeValid, traverseOneLevel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

helper = require('./helper.coffee');

YES = function() {
  return true;
};

NO = function() {
  return false;
};

NORMAL = {
  "default": helper.NORMAL
};

FORBID = {
  "default": helper.FORBID
};

_id = 0;

Function.prototype.trigger = function(prop, get, set) {
  return Object.defineProperty(this.prototype, prop, {
    get: get,
    set: set
  });
};

exports.isTreeValid = isTreeValid = function(tree) {
  var hare, k, lastHare, ref, ref1, ref2, ref3, stack, tortise;
  tortise = hare = tree.start.next;
  stack = [];
  while (true) {
    tortise = tortise.next;
    lastHare = hare;
    hare = hare.next;
    if (hare == null) {
      window._droplet_debug_lastHare = lastHare;
      throw new Error('Ran off the end of the document before EOF');
    }
    if (lastHare !== hare.prev) {
      throw new Error('Linked list is not properly bidirectional');
    }
    if (hare === tree.end) {
      if (stack.length > 0) {
        throw new Error('Document ended before: ' + ((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = stack.length; j < len; j++) {
            k = stack[j];
            results.push(k.type);
          }
          return results;
        })()).join(','));
      }
      break;
    }
    if (hare instanceof StartToken) {
      stack.push(hare.container);
    } else if (hare instanceof EndToken) {
      if (stack[stack.length - 1] !== hare.container) {
        throw new Error("Stack does not align " + ((ref = stack[stack.length - 1]) != null ? ref.type : void 0) + " != " + ((ref1 = hare.container) != null ? ref1.type : void 0));
      } else {
        stack.pop();
      }
    }
    lastHare = hare;
    hare = hare.next;
    if (hare == null) {
      window._droplet_debug_lastHare = lastHare;
      throw new Error('Ran off the end of the document before EOF');
    }
    if (lastHare !== hare.prev) {
      throw new Error('Linked list is not properly bidirectional');
    }
    if (hare === tree.end) {
      if (stack.length > 0) {
        throw new Error('Document ended before: ' + ((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = stack.length; j < len; j++) {
            k = stack[j];
            results.push(k.type);
          }
          return results;
        })()).join(','));
      }
      break;
    }
    if (hare instanceof StartToken) {
      stack.push(hare.container);
    } else if (hare instanceof EndToken) {
      if (stack[stack.length - 1] !== hare.container) {
        throw new Error("Stack does not align " + ((ref2 = stack[stack.length - 1]) != null ? ref2.type : void 0) + " != " + ((ref3 = hare.container) != null ? ref3.type : void 0));
      } else {
        stack.pop();
      }
    }
    if (tortise === hare) {
      throw new Error('Linked list loops');
    }
  }
  return true;
};

Operation = (function() {
  function Operation(type, list) {
    this.type = type;
    this.location = null;
    this.list = list.clone();
    this.start = list.start.getLocation();
    this.end = list.end.getLocation();
  }

  Operation.prototype.toString = function() {
    return JSON.stringify({
      location: this.location.toString(),
      list: this.list.stringify(),
      start: this.start.toString(),
      end: this.end.toString(),
      type: this.type
    });
  };

  return Operation;

})();

ReplaceOperation = (function() {
  function ReplaceOperation(beforeStart1, before1, beforeEnd1, afterStart1, after1, afterEnd1) {
    this.beforeStart = beforeStart1;
    this.before = before1;
    this.beforeEnd = beforeEnd1;
    this.afterStart = afterStart1;
    this.after = after1;
    this.afterEnd = afterEnd1;
    this.type = 'replace';
  }

  ReplaceOperation.prototype.toString = function() {
    return JSON.stringify({
      beforeStart: this.beforeStart.toString(),
      before: this.before.stringify(),
      beforeEnd: this.beforeEnd.toString(),
      afterStart: this.afterStart.toString(),
      after: this.after.stringify(),
      afterEnd: this.afterEnd.toString(),
      type: this.type
    });
  };

  return ReplaceOperation;

})();

exports.List = List = (function() {
  function List(start1, end) {
    this.start = start1;
    this.end = end;
    this.id = ++_id;
  }

  List.prototype.contains = function(token) {
    var head;
    if (token instanceof Container) {
      token = token.start;
    }
    head = this.start;
    while (head !== this.end) {
      if (head === token) {
        return true;
      }
      head = head.next;
    }
    if (token === this.end) {
      return true;
    } else {
      return false;
    }
  };

  List.prototype.getDocument = function() {
    return this.start.getDocument();
  };

  List.prototype.insert = function(token, list, updates) {
    var after, first, head, last, location, operation, ref, updateTokens;
    if (updates == null) {
      updates = [];
    }
    ref = [list.start, list.end], first = ref[0], last = ref[1];
    updateTokens = updates.map((function(_this) {
      return function(x) {
        return _this.getFromLocation(x);
      };
    })(this));
    switch (token.type) {
      case 'indentStart':
        head = token.container.end.prev;
        if (head.type === 'newline') {
          token = token.next;
        } else {
          first = new NewlineToken();
          helper.connect(first, list.start);
        }
        break;
      case 'blockEnd':
        first = new NewlineToken();
        helper.connect(first, list.start);
        break;
      case 'documentStart':
        if (token.next !== token.container.end) {
          last = new NewlineToken();
          helper.connect(list.end, last);
        }
    }
    location = token.getLocation();
    list = new List(first, last);
    after = token.next;
    helper.connect(token, list.start);
    if (token instanceof StartToken) {
      list.setParent(token.container);
    } else {
      list.setParent(token.parent);
    }
    helper.connect(list.end, after);
    list.notifyChange();
    if (location != null) {
      operation = new Operation('insert', list);
      operation.location = location;
      updates.forEach(function(x, i) {
        return x.set(updateTokens[i].getLocation());
      });
    } else {
      operation = null;
    }
    return operation;
  };

  List.prototype.remove = function(list, updates) {
    var first, last, location, record, ref, ref1, ref2, ref3, updateTokens;
    if (updates == null) {
      updates = [];
    }
    first = list.start.prev;
    last = list.end.next;
    while ((first != null ? first.type : void 0) === 'newline' && ((ref = last != null ? last.type : void 0) === (void 0) || ref === 'newline' || ref === 'indentEnd' || ref === 'documentEnd') && !(((ref1 = first.prev) != null ? ref1.type : void 0) === 'indentStart' && first.prev.container.end === last)) {
      first = first.prev;
    }
    while ((last != null ? last.type : void 0) === 'newline' && ((last != null ? (ref2 = last.next) != null ? ref2.type : void 0 : void 0) === 'newline' || ((ref3 = first != null ? first.type : void 0) === (void 0) || ref3 === 'documentStart'))) {
      last = last.next;
    }
    first = first.next;
    last = last.prev;
    list = new List(first, last);
    list.notifyChange();
    updateTokens = updates.map((function(_this) {
      return function(x) {
        return _this.getFromLocation(x);
      };
    })(this)).map((function(_this) {
      return function(x) {
        if (list.contains(x)) {
          return list.start.prev;
        } else {
          return x;
        }
      };
    })(this));
    record = new Operation('remove', list);
    location = list.start.prev;
    helper.connect(list.start.prev, list.end.next);
    list.start.prev = list.end.next = null;
    list.setParent(null);
    record.location = location.getLocation();
    updates.forEach((function(_this) {
      return function(x, i) {
        return x.set(updateTokens[i].getLocation());
      };
    })(this));
    return record;
  };

  List.prototype.replace = function(before, after, updates) {
    var afterEnd, afterStart, beforeEnd, beforeLength, beforeStart, parent, updateTextLocations;
    if (updates == null) {
      updates = [];
    }
    updateTextLocations = updates.map((function(_this) {
      return function(x) {
        return _this.getFromLocation(x).getTextLocation();
      };
    })(this));
    beforeStart = before.start.getLocation();
    beforeEnd = before.end.getLocation();
    beforeLength = before.stringify().length;
    parent = before.start.parent;
    helper.connect(before.start.prev, after.start);
    helper.connect(after.end, before.end.next);
    before.setParent(null);
    after.setParent(parent);
    after.notifyChange();
    afterStart = after.start.getLocation();
    afterEnd = after.end.getLocation();
    updates.forEach((function(_this) {
      return function(x, i) {
        return x.set(_this.getFromTextLocation(updateTextLocations[i]).getLocation());
      };
    })(this));
    return new ReplaceOperation(beforeStart, before.clone(), beforeEnd, afterStart, after.clone(), afterEnd);
  };

  List.prototype.perform = function(operation, direction, updates) {
    var after, before, list, parent, updateTextLocations, updateTokens;
    if (updates == null) {
      updates = [];
    }
    if (operation instanceof Operation) {
      if ((operation.type === 'insert') !== (direction === 'forward')) {
        list = new List(this.getFromLocation(operation.start), this.getFromLocation(operation.end));
        list.notifyChange();
        updateTokens = updates.map((function(_this) {
          return function(x) {
            return _this.getFromLocation(x);
          };
        })(this)).map((function(_this) {
          return function(x) {
            if (list.contains(x)) {
              return list.start.prev;
            } else {
              return x;
            }
          };
        })(this));
        helper.connect(list.start.prev, list.end.next);
        updates.forEach(function(x, i) {
          return x.set(updateTokens[i].getLocation());
        });
        return operation;
      } else if ((operation.type === 'remove') !== (direction === 'forward')) {
        updateTokens = updates.map((function(_this) {
          return function(x) {
            return _this.getFromLocation(x);
          };
        })(this));
        list = operation.list.clone();
        before = this.getFromLocation(operation.location);
        after = before.next;
        helper.connect(before, list.start);
        helper.connect(list.end, after);
        if (before instanceof StartToken) {
          list.setParent(before.container);
        } else {
          list.setParent(before.parent);
        }
        list.notifyChange();
        updates.forEach(function(x, i) {
          return x.set(updateTokens[i].getLocation());
        });
        return operation;
      }
    } else if (operation.type === 'replace') {
      updateTextLocations = updates.map((function(_this) {
        return function(x) {
          return _this.getFromLocation(x).getTextLocation();
        };
      })(this));
      if (direction === 'forward') {
        before = new List(this.getFromLocation(operation.beforeStart), this.getFromLocation(operation.beforeEnd));
        after = operation.after.clone();
      } else {
        before = new List(this.getFromLocation(operation.afterStart), this.getFromLocation(operation.afterEnd));
        after = operation.before.clone();
      }
      parent = before.start.parent;
      helper.connect(before.start.prev, after.start);
      helper.connect(after.end, before.end.next);
      after.setParent(parent);
      before.setParent(null);
      after.notifyChange();
      updates.forEach((function(_this) {
        return function(x, i) {
          return x.set(_this.getFromTextLocation(updateTextLocations[i]).getLocation());
        };
      })(this));
      return null;
    }
  };

  List.prototype.notifyChange = function() {
    return this.traverseOneLevel(function(head) {
      return head.notifyChange();
    });
  };

  List.prototype.traverseOneLevel = function(fn) {
    return traverseOneLevel(this.start, fn, this.end);
  };

  List.prototype.isFirstOnLine = function() {
    var ref, ref1, ref2, ref3, ref4;
    return ((ref = this.start.prev) === ((ref1 = this.parent) != null ? ref1.start : void 0) || ref === ((ref2 = this.parent) != null ? (ref3 = ref2.parent) != null ? ref3.start : void 0 : void 0) || ref === null) || ((ref4 = this.start.prev) != null ? ref4.type : void 0) === 'newline';
  };

  List.prototype.isLastOnLine = function() {
    var ref, ref1, ref2, ref3, ref4, ref5;
    return ((ref = this.end.next) === ((ref1 = this.parent) != null ? ref1.end : void 0) || ref === ((ref2 = this.parent) != null ? (ref3 = ref2.parent) != null ? ref3.end : void 0 : void 0) || ref === null) || ((ref4 = (ref5 = this.end.next) != null ? ref5.type : void 0) === 'newline' || ref4 === 'indentStart' || ref4 === 'indentEnd');
  };

  List.prototype.getReader = function() {
    return {
      type: 'document',
      classes: []
    };
  };

  List.prototype.setParent = function(parent) {
    return traverseOneLevel(this.start, (function(head) {
      return head.setParent(parent);
    }), this.end);
  };

  List.prototype.clone = function() {
    var assembler, clone, head;
    assembler = head = {};
    this.traverseOneLevel((function(_this) {
      return function(head) {
        var clone;
        if (head instanceof Container) {
          clone = head.clone();
          helper.connect(assembler, clone.start);
          return assembler = clone.end;
        } else {
          return assembler = helper.connect(assembler, head.clone());
        }
      };
    })(this));
    head = head.next;
    head.prev = null;
    clone = new List(head, assembler);
    clone.correctParentTree();
    return clone;
  };

  List.prototype.correctParentTree = function() {
    return this.traverseOneLevel((function(_this) {
      return function(head) {
        head.parent = _this;
        if (head instanceof Container) {
          head.start.parent = head.end.parent = _this;
          return head.correctParentTree();
        }
      };
    })(this));
  };

  List.prototype.stringify = function() {
    var head, str;
    head = this.start;
    str = head.stringify();
    while (head !== this.end) {
      head = head.next;
      str += head.stringify();
    }
    return str;
  };

  List.prototype.stringifyInPlace = function() {
    var head, indent, ref, str;
    str = '';
    indent = [];
    head = this.start;
    while (true) {
      if (head instanceof IndentStartToken) {
        indent.push(head.container.prefix);
      } else if (head instanceof IndentEndToken) {
        indent.pop();
      }
      if (head instanceof NewlineToken) {
        str += '\n' + ((ref = head.specialIndent) != null ? ref : indent.join(''));
      } else {
        str += head.stringify();
      }
      if (head === this.end) {
        break;
      }
      head = head.next;
    }
    return str;
  };

  return List;

})();

exports.Container = Container = (function(superClass) {
  extend(Container, superClass);

  function Container() {
    if (!((this.start != null) || (this.end != null))) {
      this.start = new StartToken(this);
      this.end = new EndToken(this);
      this.type = 'container';
    }
    this.id = ++_id;
    this.parent = null;
    this.version = 0;
    helper.connect(this.start, this.end);
    this.ephemeral = false;
    this.lineMarkStyles = [];
  }

  Container.prototype.getLocation = function() {
    var location;
    location = this.start.getLocation();
    location.type = this.type;
    return location;
  };

  Container.prototype.getTextLocation = function() {
    var location;
    location = this.start.getTextLocation();
    location.type = this.type;
    return location;
  };

  Container.prototype._cloneEmpty = function() {
    return new Container();
  };

  Container.prototype._firstChild = function() {
    var head;
    head = this.start.next;
    while (head !== this.end) {
      if (head instanceof StartToken) {
        return head.container;
      }
      head = head.next;
    }
    return null;
  };

  Container.prototype.getReader = function() {
    return {
      id: this.id,
      type: this.type,
      precedence: this.precedence,
      classes: this.classes
    };
  };

  Container.prototype.setParent = function(parent) {
    return this.parent = this.start.parent = this.end.parent = parent;
  };

  Container.prototype.hasParent = function(parent) {
    var head;
    head = this;
    while (head !== parent && head !== null) {
      head = head.parent;
    }
    return head === parent;
  };

  Container.prototype.getLinesToParent = function() {
    var head, lines;
    head = this.start;
    lines = 0;
    while (head !== this.parent.start) {
      if (head.type === 'newline') {
        lines++;
      }
      head = head.prev;
    }
    return lines;
  };

  Container.prototype.clone = function() {
    var assembler, selfClone;
    selfClone = this._cloneEmpty();
    assembler = selfClone.start;
    this.traverseOneLevel((function(_this) {
      return function(head) {
        var clone;
        if (head instanceof Container) {
          clone = head.clone();
          helper.connect(assembler, clone.start);
          return assembler = clone.end;
        } else {
          return assembler = helper.connect(assembler, head.clone());
        }
      };
    })(this));
    helper.connect(assembler, selfClone.end);
    selfClone.correctParentTree();
    return selfClone;
  };

  Container.prototype.rawReplace = function(other) {
    if (other.start.prev != null) {
      helper.connect(other.start.prev, this.start);
    }
    if (other.end.next != null) {
      helper.connect(this.end, other.end.next);
    }
    this.start.parent = this.end.parent = this.parent = other.parent;
    other.parent = other.start.parent = other.end.parent = null;
    other.start.prev = other.end.next = null;
    return this.notifyChange();
  };

  Container.prototype.getNewlineBefore = function(n) {
    var head, lines;
    head = this.start;
    lines = 0;
    while (!(lines === n || head === this.end)) {
      head = head.next;
      if (head.type === 'newline') {
        lines++;
      }
    }
    return head;
  };

  Container.prototype.getNewlineAfter = function(n) {
    var head;
    head = this.getNewlineBefore(n).next;
    while (!(start.type === 'newline' || head === this.end)) {
      head = head.next;
    }
    return head;
  };

  Container.prototype.getLeadingText = function() {
    if (this.start.next.type === 'text') {
      return this.start.next.value;
    } else {
      return '';
    }
  };

  Container.prototype.getTrailingText = function() {
    if (this.end.prev.type === 'text') {
      return this.end.prev.value;
    } else {
      return '';
    }
  };

  Container.prototype.setLeadingText = function(value) {
    if (value != null) {
      if (this.start.next.type === 'text') {
        if (value.length === 0) {
          return this.start.next.remove();
        } else {
          return this.start.next.value = value;
        }
      } else if (value.length !== 0) {
        return this.start.insert(new TextToken(value));
      }
    }
  };

  Container.prototype.setTrailingText = function(value) {
    if (value != null) {
      if (this.end.prev.type === 'text') {
        if (value.length === 0) {
          return this.end.prev.remove();
        } else {
          return this.end.prev.value = value;
        }
      } else if (value.length !== 0) {
        return this.end.prev.insert(new TextToken(value));
      }
    }
  };

  Container.prototype.serialize = function() {
    var str;
    str = this._serialize_header();
    this.traverseOneLevel(function(child) {
      return str += child.serialize();
    });
    return str += this._serialize_footer();
  };

  Container.prototype._serialize_header = "<container>";

  Container.prototype._serialize_header = "</container>";

  Container.prototype.contents = function() {
    var clone;
    clone = this.clone();
    if (clone.start.next === clone.end) {
      return null;
    } else {
      clone.start.next.prev = null;
      clone.end.prev.next = null;
      return clone.start.next;
    }
  };

  Container.prototype.notifyChange = function() {
    var head, results;
    head = this;
    results = [];
    while (head != null) {
      head.version++;
      results.push(head = head.parent);
    }
    return results;
  };

  Container.prototype.getBlockOnLine = function(line) {
    var head, lineCount, stack;
    head = this.start;
    lineCount = 0;
    stack = [];
    while (!(lineCount === line || (head == null))) {
      switch (head.type) {
        case 'newline':
          lineCount++;
          break;
        case 'blockStart':
          stack.push(head.container);
          break;
        case 'blockEnd':
          stack.pop();
      }
      head = head.next;
    }
    while ((head != null ? head.type : void 0) === 'newline' || (head instanceof StartToken && head.type !== 'blockStart')) {
      head = head.next;
    }
    if ((head != null ? head.type : void 0) === 'blockStart') {
      stack.push(head.container);
    }
    return stack[stack.length - 1];
  };

  Container.prototype.traverseOneLevel = function(fn) {
    if (this.start.next !== this.end) {
      return traverseOneLevel(this.start.next, fn, this.end.prev);
    }
  };

  Container.prototype.addLineMark = function(mark) {
    return this.lineMarkStyles.push(mark);
  };

  Container.prototype.removeLineMark = function(tag) {
    var mark;
    return this.lineMarkStyles = (function() {
      var j, len, ref, results;
      ref = this.lineMarkStyles;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        mark = ref[j];
        if (mark.tag !== tag) {
          results.push(mark);
        }
      }
      return results;
    }).call(this);
  };

  Container.prototype.clearLineMarks = function() {
    return this.lineMarkStyles = [];
  };

  Container.prototype.getFromLocation = function(location) {
    var head, j, ref;
    head = this.start;
    for (j = 0, ref = location.count; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--) {
      head = head.next;
    }
    if (location.type === head.type) {
      return head;
    } else if (location.type === head.container.type) {
      return head.container;
    } else {
      throw new Error("Could not retrieve location " + location);
    }
  };

  Container.prototype.getFromTextLocation = function(location) {
    var best, col, head, ref, ref1, ref2, row;
    head = this.start.next;
    best = head;
    row = 0;
    while (!((head == null) || row === location.row)) {
      head = head.next;
      if (head instanceof NewlineToken) {
        row += 1;
      }
    }
    if (head == null) {
      return this.end;
    } else {
      best = head;
    }
    if (head instanceof NewlineToken) {
      col = head.stringify().length - 1;
      head = head.next;
    } else {
      col = head.stringify().length;
    }
    while (!(((head == null) || head instanceof NewlineToken) || col >= location.col)) {
      col += head.stringify().length;
      head = head.next;
    }
    if (col < location.col) {
      return head != null ? head : this.end;
    } else {
      best = head;
    }
    if (location.length != null) {
      while (!(((head == null) || head.stringify().length > 0) || (((ref = head.container) != null ? ref : head).stringify().length === location.length))) {
        head = head.next;
      }
      if ((head != null) && ((ref1 = head.container) != null ? ref1 : head).stringify().length === location.length) {
        best = head;
      } else {
        head = best;
      }
    }
    if (location.type != null) {
      while (!(((head == null) || head.stringify().length > 0) || head.type === location.type || head.container.type === location.type)) {
        head = head.next;
      }
      if ((head != null ? (ref2 = head.container) != null ? ref2.type : void 0 : void 0) === location.type) {
        head = head.container;
      }
      if ((head != null ? head.type : void 0) === location.type) {
        best = head;
      }
    }
    return best;
  };

  return Container;

})(List);

exports.Token = Token = (function() {
  function Token() {
    this.id = ++_id;
    this.prev = this.next = this.parent = null;
    this.version = 0;
  }

  Token.prototype.getLinesToParent = function() {
    var head, lines;
    head = this;
    lines = 0;
    while (head !== this.parent.start) {
      if (head.type === 'newline') {
        lines++;
      }
      head = head.prev;
    }
    return lines;
  };

  Token.prototype.setParent = function(parent1) {
    this.parent = parent1;
  };

  Token.prototype.hasParent = function(parent) {
    var head;
    head = this;
    while (head !== parent && head !== null) {
      head = head.parent;
    }
    return head === parent;
  };

  Token.prototype.insert = function(token) {
    token.next = this.next;
    token.prev = this;
    this.next.prev = token;
    this.next = token;
    if (this instanceof StartToken) {
      token.parent = this.container;
    } else {
      token.parent = parent;
    }
    return token;
  };

  Token.prototype.remove = function() {
    if (this.prev != null) {
      helper.connect(this.prev, this.next);
    } else if (this.next != null) {
      this.next.prev = null;
    }
    return this.prev = this.next = this.parent = null;
  };

  Token.prototype.notifyChange = function() {
    var head;
    head = this;
    while (head != null) {
      head.version++;
      head = head.parent;
    }
    return null;
  };

  Token.prototype.isFirstOnLine = function() {
    var ref, ref1;
    return this.prev === ((ref = this.parent) != null ? ref.start : void 0) || ((ref1 = this.prev) != null ? ref1.type : void 0) === 'newline';
  };

  Token.prototype.isLastOnLine = function() {
    var ref, ref1, ref2;
    return this.next === ((ref = this.parent) != null ? ref.end : void 0) || ((ref1 = (ref2 = this.next) != null ? ref2.type : void 0) === 'newline' || ref1 === 'indentEnd');
  };

  Token.prototype.clone = function() {
    return new Token();
  };

  Token.prototype.getSerializedLocation = function() {
    var count, head;
    head = this;
    count = 0;
    while (head !== null) {
      count++;
      head = head.prev;
    }
    return count;
  };

  Token.prototype.getIndent = function() {
    var head, prefix;
    head = this;
    prefix = '';
    while (head != null) {
      if (head.type === 'indent') {
        prefix = head.prefix + prefix;
      }
      head = head.parent;
    }
    return prefix;
  };

  Token.prototype.getTextLocation = function() {
    var head, location;
    location = new TextLocation();
    head = this.prev;
    location.type = this.type;
    if (this instanceof StartToken || this instanceof EndToken) {
      location.length = this.container.stringify().length;
    } else {
      location.length = this.stringify().length;
    }
    while (!((head == null) || head instanceof NewlineToken)) {
      location.col += head.stringify().length;
      head = head.prev;
    }
    if (head != null) {
      location.col += head.stringify().length - 1;
    }
    while (head != null) {
      if (head instanceof NewlineToken) {
        location.row += 1;
      }
      head = head.prev;
    }
    return location;
  };

  Token.prototype.getDocument = function() {
    var head, ref;
    head = (ref = this.container) != null ? ref : this;
    while (!((head == null) || head instanceof Document)) {
      head = head.parent;
    }
    return head;
  };

  Token.prototype.getLocation = function() {
    var count, dropletDocument, head;
    count = 0;
    head = this;
    dropletDocument = this.getDocument();
    if (dropletDocument == null) {
      return null;
    }
    while (head !== dropletDocument.start) {
      head = head.prev;
      count += 1;
    }
    return new Location(count, this.type);
  };

  Token.prototype.stringify = function() {
    return '';
  };

  Token.prototype.serialize = function() {
    return '';
  };

  return Token;

})();

exports.Location = Location = (function() {
  function Location(count1, type) {
    this.count = count1;
    this.type = type;
  }

  Location.prototype.toString = function() {
    return this.count + ", " + this.type;
  };

  Location.prototype.set = function(other) {
    this.count = other.count;
    return this.type = other.type;
  };

  Location.prototype.is = function(other) {
    if (!(other instanceof Location)) {
      other = other.getLocation();
    }
    return other.count === this.count && other.type === this.type;
  };

  Location.prototype.clone = function() {
    return new Location(this.count, this.type);
  };

  return Location;

})();

exports.TextLocation = TextLocation = (function() {
  function TextLocation(row1, col1, type, length) {
    this.row = row1 != null ? row1 : 0;
    this.col = col1 != null ? col1 : 0;
    this.type = type != null ? type : null;
    this.length = length != null ? length : null;
  }

  TextLocation.prototype.toString = function() {
    return "(" + this.row + ", " + this.col + ", " + this.type + ", " + this.length + ")";
  };

  TextLocation.prototype.set = function(other) {
    this.row = other.row;
    this.col = other.col;
    this.type = other.type;
    return this.length = other.length;
  };

  TextLocation.prototype.is = function(other) {
    var answer;
    if (!(other instanceof TextLocation)) {
      other = other.getLocation();
    }
    answer = other.row === this.row && other.col === this.col && ((this.type != null) && (other.type != null) ? answer = answer && this.type === other.type : void 0);
    if ((this.length != null) && (other.length != null)) {
      answer = answer && this.length === other.length;
    }
    return answer;
  };

  return TextLocation;

})();

exports.StartToken = StartToken = (function(superClass) {
  extend(StartToken, superClass);

  function StartToken(container) {
    this.container = container;
    StartToken.__super__.constructor.apply(this, arguments);
    this.markup = 'begin';
  }

  StartToken.prototype.insert = function(token) {
    if (token instanceof StartToken || token instanceof EndToken) {
      console.warn('"insert"-ing a container can cause problems');
    }
    token.next = this.next;
    token.prev = this;
    this.next.prev = token;
    this.next = token;
    token.parent = this.container;
    return token;
  };

  StartToken.prototype.serialize = function() {
    return '<container>';
  };

  return StartToken;

})(Token);

exports.EndToken = EndToken = (function(superClass) {
  extend(EndToken, superClass);

  function EndToken(container) {
    this.container = container;
    EndToken.__super__.constructor.apply(this, arguments);
    this.markup = 'end';
  }

  EndToken.prototype.insert = function(token) {
    if (token instanceof StartToken || token instanceof EndToken) {
      console.warn('"insert"-ing a container can cause problems');
    }
    token.next = this.next;
    token.prev = this;
    this.next.prev = token;
    this.next = token;
    token.parent = this.container.parent;
    return token;
  };

  EndToken.prototype.serialize = function() {
    return '</container>';
  };

  return EndToken;

})(Token);

exports.BlockStartToken = BlockStartToken = (function(superClass) {
  extend(BlockStartToken, superClass);

  function BlockStartToken(container) {
    this.container = container;
    BlockStartToken.__super__.constructor.apply(this, arguments);
    this.type = 'blockStart';
  }

  return BlockStartToken;

})(StartToken);

exports.BlockEndToken = BlockEndToken = (function(superClass) {
  extend(BlockEndToken, superClass);

  function BlockEndToken(container) {
    this.container = container;
    BlockEndToken.__super__.constructor.apply(this, arguments);
    this.type = 'blockEnd';
  }

  BlockEndToken.prototype.serialize = function() {
    return "</block>";
  };

  return BlockEndToken;

})(EndToken);

exports.Block = Block = (function(superClass) {
  extend(Block, superClass);

  function Block(precedence, color, socketLevel, classes, parseContext, buttons) {
    this.precedence = precedence != null ? precedence : 0;
    this.color = color != null ? color : 'blank';
    this.socketLevel = socketLevel != null ? socketLevel : helper.ANY_DROP;
    this.classes = classes != null ? classes : [];
    this.parseContext = parseContext;
    this.buttons = buttons != null ? buttons : {};
    this.start = new BlockStartToken(this);
    this.end = new BlockEndToken(this);
    this.type = 'block';
    Block.__super__.constructor.apply(this, arguments);
  }

  Block.prototype.nextSibling = function() {
    var head, parent;
    head = this.end.next;
    parent = head.parent;
    while (head && head.container !== parent) {
      if (head instanceof StartToken) {
        return head.container;
      }
      head = head.next;
    }
    return null;
  };

  Block.prototype._cloneEmpty = function() {
    var clone;
    clone = new Block(this.precedence, this.color, this.socketLevel, this.classes, this.parseContext, this.buttons);
    clone.currentlyParenWrapped = this.currentlyParenWrapped;
    return clone;
  };

  Block.prototype._serialize_header = function() {
    var ref, ref1;
    return "<block precedence=\"" + this.precedence + "\" color=\"" + this.color + "\" socketLevel=\"" + this.socketLevel + "\" classes=\"" + ((ref = (ref1 = this.classes) != null ? typeof ref1.join === "function" ? ref1.join(' ') : void 0 : void 0) != null ? ref : '') + "\" >";
  };

  Block.prototype._serialize_footer = function() {
    return "</block>";
  };

  return Block;

})(Container);

exports.SocketStartToken = SocketStartToken = (function(superClass) {
  extend(SocketStartToken, superClass);

  function SocketStartToken(container) {
    this.container = container;
    SocketStartToken.__super__.constructor.apply(this, arguments);
    this.type = 'socketStart';
  }

  return SocketStartToken;

})(StartToken);

exports.SocketEndToken = SocketEndToken = (function(superClass) {
  extend(SocketEndToken, superClass);

  function SocketEndToken(container) {
    this.container = container;
    SocketEndToken.__super__.constructor.apply(this, arguments);
    this.type = 'socketEnd';
  }

  SocketEndToken.prototype.stringify = function() {
    if (this.prev === this.container.start || this.prev.type === 'text' && this.prev.value === '') {
      return this.container.emptyString;
    } else {
      return '';
    }
  };

  return SocketEndToken;

})(EndToken);

exports.Socket = Socket = (function(superClass) {
  extend(Socket, superClass);

  function Socket(emptyString, precedence, handwritten, classes, dropdown) {
    this.emptyString = emptyString;
    this.precedence = precedence != null ? precedence : 0;
    this.handwritten = handwritten != null ? handwritten : false;
    this.classes = classes != null ? classes : [];
    this.dropdown = dropdown != null ? dropdown : null;
    this.start = new SocketStartToken(this);
    this.end = new SocketEndToken(this);
    this.type = 'socket';
    Socket.__super__.constructor.apply(this, arguments);
  }

  Socket.prototype.textContent = function() {
    var head, str;
    head = this.start.next;
    str = '';
    while (head !== this.end) {
      str += head.stringify();
      head = head.next;
    }
    return str;
  };

  Socket.prototype.hasDropdown = function() {
    return (this.dropdown != null) && this.isDroppable();
  };

  Socket.prototype.editable = function() {
    return (!((this.dropdown != null) && this.dropdown.dropdownOnly)) && this.isDroppable();
  };

  Socket.prototype.isDroppable = function() {
    return this.start.next === this.end || this.start.next.type === 'text';
  };

  Socket.prototype._cloneEmpty = function() {
    return new Socket(this.emptyString, this.precedence, this.handwritten, this.classes, this.dropdown);
  };

  Socket.prototype._serialize_header = function() {
    var ref, ref1, ref2, ref3;
    return "<socket precedence=\"" + this.precedence + "\" handwritten=\"" + this.handwritten + "\" classes=\"" + ((ref = (ref1 = this.classes) != null ? typeof ref1.join === "function" ? ref1.join(' ') : void 0 : void 0) != null ? ref : '') + "\"" + (this.dropdown != null ? " dropdown=\"" + ((ref2 = (ref3 = this.dropdown) != null ? typeof ref3.join === "function" ? ref3.join(' ') : void 0 : void 0) != null ? ref2 : '') + "\"" : '') + ">";
  };

  Socket.prototype._serialize_footer = function() {
    return "</socket>";
  };

  return Socket;

})(Container);

exports.IndentStartToken = IndentStartToken = (function(superClass) {
  extend(IndentStartToken, superClass);

  function IndentStartToken(container) {
    this.container = container;
    IndentStartToken.__super__.constructor.apply(this, arguments);
    this.type = 'indentStart';
  }

  return IndentStartToken;

})(StartToken);

exports.IndentEndToken = IndentEndToken = (function(superClass) {
  extend(IndentEndToken, superClass);

  function IndentEndToken(container) {
    this.container = container;
    IndentEndToken.__super__.constructor.apply(this, arguments);
    this.type = 'indentEnd';
  }

  IndentEndToken.prototype.stringify = function() {
    if (this.prev.prev === this.container.start) {
      return this.container.emptyString;
    } else {
      return '';
    }
  };

  IndentEndToken.prototype.serialize = function() {
    return "</indent>";
  };

  return IndentEndToken;

})(EndToken);

exports.Indent = Indent = (function(superClass) {
  extend(Indent, superClass);

  function Indent(emptyString, prefix1, classes) {
    this.emptyString = emptyString;
    this.prefix = prefix1 != null ? prefix1 : '';
    this.classes = classes != null ? classes : [];
    this.start = new IndentStartToken(this);
    this.end = new IndentEndToken(this);
    this.type = 'indent';
    this.depth = this.prefix.length;
    Indent.__super__.constructor.apply(this, arguments);
  }

  Indent.prototype._cloneEmpty = function() {
    return new Indent(this.emptyString, this.prefix, this.classes);
  };

  Indent.prototype.firstChild = function() {
    return this._firstChild();
  };

  Indent.prototype._serialize_header = function() {
    var ref, ref1;
    return "<indent prefix=\"" + this.prefix + "\" classes=\"" + ((ref = (ref1 = this.classes) != null ? typeof ref1.join === "function" ? ref1.join(' ') : void 0 : void 0) != null ? ref : '') + "\">";
  };

  Indent.prototype._serialize_footer = function() {
    return "</indent>";
  };

  return Indent;

})(Container);

exports.DocumentStartToken = DocumentStartToken = (function(superClass) {
  extend(DocumentStartToken, superClass);

  function DocumentStartToken(container) {
    this.container = container;
    DocumentStartToken.__super__.constructor.apply(this, arguments);
    this.type = 'documentStart';
  }

  DocumentStartToken.prototype.serialize = function() {
    return "<document>";
  };

  return DocumentStartToken;

})(StartToken);

exports.DocumentEndToken = DocumentEndToken = (function(superClass) {
  extend(DocumentEndToken, superClass);

  function DocumentEndToken(container) {
    this.container = container;
    DocumentEndToken.__super__.constructor.apply(this, arguments);
    this.type = 'documentEnd';
  }

  DocumentEndToken.prototype.serialize = function() {
    return "</document>";
  };

  return DocumentEndToken;

})(EndToken);

exports.Document = Document = (function(superClass) {
  extend(Document, superClass);

  function Document(opts) {
    this.opts = opts != null ? opts : {};
    this.start = new DocumentStartToken(this);
    this.end = new DocumentEndToken(this);
    this.classes = ['__document__'];
    this.type = 'document';
    Document.__super__.constructor.apply(this, arguments);
  }

  Document.prototype._cloneEmpty = function() {
    return new Document(this.opts);
  };

  Document.prototype.firstChild = function() {
    return this._firstChild();
  };

  Document.prototype._serialize_header = function() {
    return "<document>";
  };

  Document.prototype._serialize_footer = function() {
    return "</document>";
  };

  return Document;

})(Container);

exports.TextToken = TextToken = (function(superClass) {
  extend(TextToken, superClass);

  function TextToken(_value) {
    this._value = _value;
    TextToken.__super__.constructor.apply(this, arguments);
    this.type = 'text';
  }

  TextToken.trigger('value', (function() {
    return this._value;
  }), function(value) {
    this._value = value;
    return this.notifyChange();
  });

  TextToken.prototype.stringify = function() {
    return this._value;
  };

  TextToken.prototype.serialize = function() {
    return helper.escapeXMLText(this._value);
  };

  TextToken.prototype.clone = function() {
    return new TextToken(this._value);
  };

  return TextToken;

})(Token);

exports.NewlineToken = NewlineToken = (function(superClass) {
  extend(NewlineToken, superClass);

  function NewlineToken(specialIndent) {
    this.specialIndent = specialIndent;
    NewlineToken.__super__.constructor.apply(this, arguments);
    this.type = 'newline';
  }

  NewlineToken.prototype.stringify = function() {
    var ref;
    return '\n' + ((ref = this.specialIndent) != null ? ref : this.getIndent());
  };

  NewlineToken.prototype.serialize = function() {
    return '\n';
  };

  NewlineToken.prototype.clone = function() {
    return new NewlineToken(this.specialIndent);
  };

  return NewlineToken;

})(Token);

traverseOneLevel = function(head, fn, tail) {
  while (true) {
    if (head instanceof StartToken) {
      fn(head.container);
      head = head.container.end;
    } else {
      fn(head);
    }
    if (head === tail) {
      return;
    }
    head = head.next;
  }
};


},{"./helper.coffee":28}],32:[function(require,module,exports){
var c, coffee, html, java, javascript, python;

javascript = require('./languages/javascript.coffee');

coffee = require('./languages/coffee.coffee');

c = require('./languages/c.coffee');

java = require('./languages/java.coffee');

python = require('./languages/python.coffee');

html = require('./languages/html.coffee');

module.exports = {
  'javascript': javascript,
  'coffee': coffee,
  'coffeescript': coffee,
  'c': c,
  'java': java,
  'python': python,
  'html': html
};


},{"./languages/c.coffee":1,"./languages/coffee.coffee":1,"./languages/html.coffee":1,"./languages/java.coffee":1,"./languages/javascript.coffee":29,"./languages/python.coffee":1}],33:[function(require,module,exports){
var Parser, ParserFactory, YES, _extend, getDefaultSelectionRange, hasSomeTextAfter, helper, model, sax, stripFlaggedBlocks,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

helper = require('./helper.coffee');

model = require('./model.coffee');

sax = require('sax');

_extend = function(opts, defaults) {
  var key, val;
  if (opts == null) {
    return defaults;
  }
  for (key in defaults) {
    val = defaults[key];
    if (!(key in opts)) {
      opts[key] = val;
    }
  }
  return opts;
};

YES = function() {
  return true;
};

exports.ParserFactory = ParserFactory = (function() {
  function ParserFactory(opts1) {
    this.opts = opts1 != null ? opts1 : {};
  }

  ParserFactory.prototype.createParser = function(text) {
    return new Parser(text, this.opts);
  };

  return ParserFactory;

})();

exports.Parser = Parser = (function() {
  function Parser(text1, opts1) {
    this.text = text1;
    this.opts = opts1 != null ? opts1 : {};
    this.originalText = this.text;
    this.markup = [];
  }

  Parser.prototype._parse = function(opts) {
    var document;
    opts = _extend(opts, {
      wrapAtRoot: true
    });
    this.markRoot(opts.context);
    this.sortMarkup();
    document = this.applyMarkup(opts);
    this.detectParenWrap(document);
    document.correctParentTree();
    stripFlaggedBlocks(document);
    return document;
  };

  Parser.prototype.markRoot = function() {};

  Parser.prototype.isParenWrapped = function(block) {
    return block.start.next.type === 'text' && block.start.next.value[0] === '(' && block.end.prev.type === 'text' && block.end.prev.value[block.end.prev.value.length - 1] === ')';
  };

  Parser.prototype.detectParenWrap = function(document) {
    var head;
    head = document.start;
    while (head !== document.end) {
      head = head.next;
      if (head.type === 'blockStart' && this.isParenWrapped(head.container)) {
        head.container.currentlyParenWrapped = true;
      }
    }
    return document;
  };

  Parser.prototype.addBlock = function(opts) {
    var block;
    block = new model.Block(opts.precedence, opts.color, opts.socketLevel, opts.classes, opts.parseContext, opts.buttons);
    return this.addMarkup(block, opts.bounds, opts.depth);
  };

  Parser.prototype.addSocket = function(opts) {
    var ref, socket;
    socket = new model.Socket((ref = opts.empty) != null ? ref : this.empty, opts.precedence, false, opts.classes, opts.dropdown);
    return this.addMarkup(socket, opts.bounds, opts.depth);
  };

  Parser.prototype.addIndent = function(opts) {
    var indent;
    indent = new model.Indent(this.emptyIndent, opts.prefix, opts.classes);
    return this.addMarkup(indent, opts.bounds, opts.depth);
  };

  Parser.prototype.addMarkup = function(container, bounds, depth) {
    this.markup.push({
      token: container.start,
      location: bounds.start,
      depth: depth,
      start: true
    });
    this.markup.push({
      token: container.end,
      location: bounds.end,
      depth: depth,
      start: false
    });
    return container;
  };

  Parser.prototype.sortMarkup = function() {
    return this.markup.sort(function(a, b) {
      var isDifferent;
      if (a.location.line > b.location.line) {
        return 1;
      }
      if (b.location.line > a.location.line) {
        return -1;
      }
      if (a.location.column > b.location.column) {
        return 1;
      }
      if (b.location.column > a.location.column) {
        return -1;
      }
      isDifferent = 1;
      if (a.token.container === b.token.container) {
        isDifferent = -1;
      }
      if (a.start && !b.start) {
        return isDifferent;
      }
      if (b.start && !a.start) {
        return -isDifferent;
      }
      if (a.start && b.start) {
        if (a.depth > b.depth) {
          return 1;
        } else {
          return -1;
        }
      }
      if ((!a.start) && (!b.start)) {
        if (a.depth > b.depth) {
          return -1;
        } else {
          return 1;
        }
      }
    });
  };

  Parser.prototype.constructHandwrittenBlock = function(text) {
    var block, socket, textToken;
    block = new model.Block(0, 'blank', helper.ANY_DROP);
    socket = new model.Socket(this.empty, 0, true);
    textToken = new model.TextToken(text);
    helper.connect(block.start, socket.start);
    helper.connect(socket.start, textToken);
    helper.connect(textToken, socket.end);
    helper.connect(socket.end, block.end);
    if (this.isComment(text)) {
      block.socketLevel = helper.BLOCK_ONLY;
      block.classes = ['__comment__', 'block-only'];
    } else {
      block.classes = ['__handwritten__', 'block-only'];
    }
    return block;
  };

  Parser.prototype.applyMarkup = function(opts) {
    var block, document, head, i, indentDepth, j, k, l, lastIndex, len, len1, len2, line, lines, mark, markupOnLines, name, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, stack;
    markupOnLines = {};
    ref = this.markup;
    for (j = 0, len = ref.length; j < len; j++) {
      mark = ref[j];
      if (markupOnLines[name = mark.location.line] == null) {
        markupOnLines[name] = [];
      }
      markupOnLines[mark.location.line].push(mark);
    }
    lines = this.text.split('\n');
    indentDepth = 0;
    stack = [];
    document = new model.Document();
    head = document.start;
    for (i = k = 0, len1 = lines.length; k < len1; i = ++k) {
      line = lines[i];
      if (!(i in markupOnLines)) {
        if (indentDepth > line.length || line.slice(0, indentDepth).trim().length > 0) {
          head.specialIndent = ((function() {
            var l, ref1, results;
            results = [];
            for (l = 0, ref1 = line.length - line.trimLeft().length; 0 <= ref1 ? l < ref1 : l > ref1; 0 <= ref1 ? l++ : l--) {
              results.push(' ');
            }
            return results;
          })()).join('');
          line = line.trimLeft();
        } else {
          line = line.slice(indentDepth);
        }
        if (line.length > 0) {
          if ((opts.wrapAtRoot && stack.length === 0) || ((ref1 = stack[stack.length - 1]) != null ? ref1.type : void 0) === 'indent') {
            block = this.constructHandwrittenBlock(line);
            helper.connect(head, block.start);
            head = block.end;
          } else {
            head = helper.connect(head, new model.TextToken(line));
          }
        } else if (((ref2 = (ref3 = stack[stack.length - 1]) != null ? ref3.type : void 0) === 'indent' || ref2 === 'document' || ref2 === (void 0)) && hasSomeTextAfter(lines, i)) {
          block = new model.Block(0, this.opts.emptyLineColor, helper.BLOCK_ONLY);
          head = helper.connect(head, block.start);
          head = helper.connect(head, block.end);
        }
        head = helper.connect(head, new model.NewlineToken());
      } else {
        if (indentDepth > line.length || line.slice(0, indentDepth).trim().length > 0) {
          lastIndex = line.length - line.trimLeft().length;
          head.specialIndent = line.slice(0, lastIndex);
        } else {
          lastIndex = indentDepth;
        }
        ref4 = markupOnLines[i];
        for (l = 0, len2 = ref4.length; l < len2; l++) {
          mark = ref4[l];
          if (!(lastIndex >= mark.location.column || lastIndex >= line.length)) {
            if ((opts.wrapAtRoot && stack.length === 0) || ((ref5 = stack[stack.length - 1]) != null ? ref5.type : void 0) === 'indent') {
              block = this.constructHandwrittenBlock(line.slice(lastIndex, mark.location.column));
              helper.connect(head, block.start);
              head = block.end;
            } else {
              head = helper.connect(head, new model.TextToken(line.slice(lastIndex, mark.location.column)));
            }
          }
          switch (mark.token.type) {
            case 'indentStart':
              if ((stack != null ? (ref6 = stack[stack.length - 1]) != null ? ref6.type : void 0 : void 0) !== 'block') {
                throw new Error('Improper parser: indent must be inside block, but is inside ' + (stack != null ? (ref7 = stack[stack.length - 1]) != null ? ref7.type : void 0 : void 0));
              }
              indentDepth += mark.token.container.prefix.length;
              break;
            case 'blockStart':
              if (((ref8 = stack[stack.length - 1]) != null ? ref8.type : void 0) === 'block') {
                throw new Error('Improper parser: block cannot nest immediately inside another block.');
              }
              break;
            case 'socketStart':
              if (((ref9 = stack[stack.length - 1]) != null ? ref9.type : void 0) !== 'block') {
                throw new Error('Improper parser: socket must be immediately inside a block.');
              }
              break;
            case 'indentEnd':
              indentDepth -= mark.token.container.prefix.length;
          }
          if (mark.token instanceof model.StartToken) {
            stack.push(mark.token.container);
          } else if (mark.token instanceof model.EndToken) {
            if (mark.token.container !== stack[stack.length - 1]) {
              throw new Error("Improper parser: " + head.container.type + " ended too early.");
            }
            stack.pop();
          }
          head = helper.connect(head, mark.token);
          lastIndex = mark.location.column;
        }
        if (!(lastIndex >= line.length)) {
          if (stack.length === 0 || stack[stack.length - 1].type === 'indent') {
            block = this.constructHandwrittenBlock(line.slice(lastIndex, line.length));
            helper.connect(head, block.start);
            head = block.end;
          } else {
            head = helper.connect(head, new model.TextToken(line.slice(lastIndex, line.length)));
          }
        }
        head = helper.connect(head, new model.NewlineToken());
      }
    }
    head = head.prev;
    head.next.remove();
    head = helper.connect(head, document.end);
    return document;
  };

  return Parser;

})();

exports.parseXML = function(xml) {
  var head, parser, root, stack;
  root = new model.Document();
  head = root.start;
  stack = [];
  parser = sax.parser(true);
  parser.ontext = function(text) {
    var i, j, len, results, token, tokens;
    tokens = text.split('\n');
    results = [];
    for (i = j = 0, len = tokens.length; j < len; i = ++j) {
      token = tokens[i];
      if (token.length !== 0) {
        head = helper.connect(head, new model.TextToken(token));
      }
      if (i !== tokens.length - 1) {
        results.push(head = helper.connect(head, new model.NewlineToken()));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  parser.onopentag = function(node) {
    var attributes, container, ref, ref1, ref2;
    attributes = node.attributes;
    switch (node.name) {
      case 'block':
        container = new model.Block(attributes.precedence, attributes.color, attributes.socketLevel, (ref = attributes.classes) != null ? typeof ref.split === "function" ? ref.split(' ') : void 0 : void 0);
        break;
      case 'socket':
        container = new model.Socket('', attributes.precedence, attributes.handritten, (ref1 = attributes.classes) != null ? typeof ref1.split === "function" ? ref1.split(' ') : void 0 : void 0);
        break;
      case 'indent':
        container = new model.Indent('', attributes.prefix, (ref2 = attributes.classes) != null ? typeof ref2.split === "function" ? ref2.split(' ') : void 0 : void 0);
        break;
      case 'document':
        if (stack.length !== 0) {
          container = new model.Document();
        }
        break;
      case 'br':
        head = helper.connect(head, new model.NewlineToken());
        return null;
    }
    if (container != null) {
      stack.push({
        node: node,
        container: container
      });
      return head = helper.connect(head, container.start);
    }
  };
  parser.onclosetag = function(nodeName) {
    if (stack.length > 0 && nodeName === stack[stack.length - 1].node.name) {
      head = helper.connect(head, stack[stack.length - 1].container.end);
      return stack.pop();
    }
  };
  parser.onerror = function(e) {
    throw e;
  };
  parser.write(xml).close();
  head = helper.connect(head, root.end);
  root.correctParentTree();
  return root;
};

hasSomeTextAfter = function(lines, i) {
  while (i !== lines.length) {
    if (lines[i].length > 0) {
      return true;
    }
    i += 1;
  }
  return false;
};

stripFlaggedBlocks = function(document) {
  var container, head, ref, results, text;
  head = document.start;
  results = [];
  while (head !== document.end) {
    if (head instanceof model.StartToken && head.container.flagToRemove) {
      container = head.container;
      head = container.end.next;
      results.push(document.remove(container));
    } else if (head instanceof model.StartToken && head.container.flagToStrip) {
      if ((ref = head.container.parent) != null) {
        ref.color = 'error';
      }
      text = head.next;
      text.value = text.value.substring(head.container.flagToStrip.left, text.value.length - head.container.flagToStrip.right);
      results.push(head = text.next);
    } else {
      results.push(head = head.next);
    }
  }
  return results;
};

Parser.parens = function(leading, trailing, node, context) {
  var results;
  if (context === null || context.type !== 'socket' || (context != null ? context.precedence : void 0) < node.precedence) {
    results = [];
    while (true) {
      if ((leading().match(/^\s*\(/) != null) && (trailing().match(/\)\s*/) != null)) {
        leading(leading().replace(/^\s*\(\s*/, ''));
        results.push(trailing(trailing().replace(/^\s*\)\s*/, '')));
      } else {
        break;
      }
    }
    return results;
  } else {
    leading('(' + leading());
    return trailing(trailing() + ')');
  }
};

Parser.drop = function(block, context, pred, next) {
  if (block.type === 'document' && context.type === 'socket') {
    return helper.FORBID;
  } else {
    return helper.ENCOURAGE;
  }
};

Parser.handleButton = function(text, command, oldblock) {
  return text;
};

Parser.empty = '';

Parser.emptyIndent = '';

getDefaultSelectionRange = function(string) {
  return {
    start: 0,
    end: string.length
  };
};

exports.wrapParser = function(CustomParser) {
  var CustomParserFactory;
  return CustomParserFactory = (function(superClass) {
    extend(CustomParserFactory, superClass);

    function CustomParserFactory(opts1) {
      var ref, ref1, ref2;
      this.opts = opts1 != null ? opts1 : {};
      this.empty = CustomParser.empty;
      this.emptyIndent = CustomParser.emptyIndent;
      this.startComment = (ref = CustomParser.startComment) != null ? ref : '/*';
      this.endComment = (ref1 = CustomParser.endComment) != null ? ref1 : '*/';
      this.getDefaultSelectionRange = (ref2 = CustomParser.getDefaultSelectionRange) != null ? ref2 : getDefaultSelectionRange;
    }

    CustomParserFactory.prototype.createParser = function(text) {
      var parser;
      parser = new CustomParser(text, this.opts);
      parser.empty = this.empty;
      parser.emptyIndent = this.emptyIndent;
      return parser;
    };

    CustomParserFactory.prototype.parse = function(text, opts) {
      this.opts.parseOptions = opts;
      if (opts == null) {
        opts = {
          wrapAtRoot: true
        };
      }
      return this.createParser(text)._parse(opts);
    };

    CustomParserFactory.prototype.parens = function(leading, trailing, node, context) {
      var leadingFn, trailingFn;
      leadingFn = function(value) {
        if (value != null) {
          leading = value;
        }
        return leading;
      };
      if (trailing != null) {
        trailingFn = function(value) {
          if (value != null) {
            trailing = value;
          }
          return trailing;
        };
      } else {
        trailingFn = leadingFn;
      }
      CustomParser.parens(leadingFn, trailingFn, node, context);
      return [leading, trailing];
    };

    CustomParserFactory.prototype.drop = function(block, context, pred, next) {
      return CustomParser.drop(block, context, pred, next);
    };

    CustomParserFactory.prototype.handleButton = function(text, command, oldblock) {
      return CustomParser.handleButton(text, command, oldblock);
    };

    return CustomParserFactory;

  })(ParserFactory);
};


},{"./helper.coffee":28,"./model.coffee":31,"sax":25}],34:[function(require,module,exports){
var ANY_DROP, BLOCK_ONLY, CARRIAGE_ARROW_INDENT, CARRIAGE_ARROW_NONE, CARRIAGE_ARROW_SIDEALONG, CARRIAGE_GROW_DOWN, DEFAULT_OPTIONS, DROPDOWN_ARROW_HEIGHT, DROP_TRIANGLE_COLOR, MOSTLY_BLOCK, MOSTLY_VALUE, MULTILINE_END, MULTILINE_END_START, MULTILINE_MIDDLE, MULTILINE_START, NO, NO_MULTILINE, VALUE_ONLY, View, YES, arrayEq, avgColor, draw, helper, model, toHex, toRGB, twoDigitHex, zeroPad,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

helper = require('./helper.coffee');

draw = require('./draw.coffee');

model = require('./model.coffee');

NO_MULTILINE = 0;

MULTILINE_START = 1;

MULTILINE_MIDDLE = 2;

MULTILINE_END = 3;

MULTILINE_END_START = 4;

ANY_DROP = helper.ANY_DROP;

BLOCK_ONLY = helper.BLOCK_ONLY;

MOSTLY_BLOCK = helper.MOSTLY_BLOCK;

MOSTLY_VALUE = helper.MOSTLY_VALUE;

VALUE_ONLY = helper.VALUE_ONLY;

CARRIAGE_ARROW_SIDEALONG = 0;

CARRIAGE_ARROW_INDENT = 1;

CARRIAGE_ARROW_NONE = 2;

CARRIAGE_GROW_DOWN = 3;

DROPDOWN_ARROW_HEIGHT = 8;

DROP_TRIANGLE_COLOR = '#555';

DEFAULT_OPTIONS = {
  buttonWidth: 15,
  buttonHeight: 15,
  buttonPadding: 6,
  showDropdowns: true,
  padding: 5,
  indentWidth: 10,
  indentTongueHeight: 10,
  tabOffset: 10,
  tabWidth: 15,
  tabHeight: 5,
  tabSideWidth: 0.125,
  dropAreaHeight: 20,
  indentDropAreaMinWidth: 50,
  minSocketWidth: 10,
  invisibleSocketWidth: 5,
  textHeight: 15,
  textPadding: 1,
  emptyLineWidth: 50,
  highlightAreaHeight: 10,
  bevelClip: 3,
  shadowBlur: 5,
  ctx: document.createElement('canvas').getContext('2d'),
  colors: {
    error: '#ff0000',
    "return": '#fff59d',
    control: '#ffcc80',
    value: '#a5d6a7',
    command: '#90caf9',
    red: '#ef9a9a',
    pink: '#f48fb1',
    purple: '#ce93d8',
    deeppurple: '#b39ddb',
    indigo: '#9fa8da',
    blue: '#90caf9',
    lightblue: '#81d4fa',
    cyan: '#80deea',
    teal: '#80cbc4',
    green: '#a5d6a7',
    lightgreen: '#c5e1a5',
    lime: '#e6ee9c',
    yellow: '#fff59d',
    amber: '#ffe082',
    orange: '#ffcc80',
    deeporange: '#ffab91',
    brown: '#bcaaa4',
    grey: '#eeeeee',
    bluegrey: '#b0bec5'
  }
};

YES = function() {
  return true;
};

NO = function() {
  return false;
};

arrayEq = function(a, b) {
  var i, k;
  if (a.length !== b.length) {
    return false;
  }
  if ((function() {
    var j, len1, results;
    results = [];
    for (i = j = 0, len1 = a.length; j < len1; i = ++j) {
      k = a[i];
      results.push(k !== b[i]);
    }
    return results;
  })()) {
    return false;
  }
  return true;
};

exports.View = View = (function() {
  var BlockViewNode, ContainerViewNode, DocumentViewNode, GenericViewNode, IndentViewNode, ListViewNode, SocketViewNode, TextViewNode;

  function View(opts) {
    var option, ref;
    this.opts = opts != null ? opts : {};
    this.map = {};
    this.draw = (ref = this.opts.draw) != null ? ref : new draw.Draw();
    for (option in DEFAULT_OPTIONS) {
      if (!(option in this.opts)) {
        this.opts[option] = DEFAULT_OPTIONS[option];
      }
    }
    this.draw.setCtx(this.opts.ctx);
  }

  View.prototype.clearCache = function() {
    return this.map = {};
  };

  View.prototype.getViewNodeFor = function(model) {
    if (model.id in this.map) {
      return this.map[model.id];
    } else {
      return this.createView(model);
    }
  };

  View.prototype.hasViewNodeFor = function(model) {
    return (model != null) && model.id in this.map;
  };

  View.prototype.createView = function(entity) {
    if ((entity instanceof model.List) && !(entity instanceof model.Container)) {
      return new ListViewNode(entity, this);
    }
    switch (entity.type) {
      case 'text':
        return new TextViewNode(entity, this);
      case 'block':
        return new BlockViewNode(entity, this);
      case 'indent':
        return new IndentViewNode(entity, this);
      case 'socket':
        return new SocketViewNode(entity, this);
      case 'document':
        return new DocumentViewNode(entity, this);
    }
  };

  View.prototype.getColor = function(color) {
    var ref;
    if (color && '#' === color.charAt(0)) {
      return color;
    } else {
      return (ref = this.opts.colors[color]) != null ? ref : '#ffffff';
    }
  };

  GenericViewNode = (function() {
    function GenericViewNode(model1, view1) {
      this.model = model1;
      this.view = view1;
      this.view.map[this.model.id] = this;
      this.lastCoordinate = new this.view.draw.Point(0, 0);
      this.invalidate = false;
      this.lineLength = 0;
      this.children = [];
      this.lineChildren = [];
      this.multilineChildrenData = [];
      this.margins = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      };
      this.topLineSticksToBottom = false;
      this.bottomLineSticksToTop = false;
      this.minDimensions = [];
      this.minDistanceToBase = [];
      this.dimensions = [];
      this.distanceToBase = [];
      this.carriageArrow = CARRIAGE_ARROW_NONE;
      this.bevels = {
        top: false,
        bottom: false
      };
      this.bounds = [];
      this.changedBoundingBox = true;
      this.glue = {};
      this.path = new this.view.draw.Path();
      this.dropArea = this.highlightArea = null;
      this.computedVersion = -1;
    }

    GenericViewNode.prototype.serialize = function(line) {
      var child, i, j, l, len1, len2, len3, len4, len5, len6, m, o, p, prop, q, ref, ref1, ref2, ref3, ref4, ref5, ref6, result, s;
      result = [];
      ref = ['lineLength', 'margins', 'topLineSticksToBottom', 'bottomLineSticksToTop', 'changedBoundingBox', 'path', 'highlightArea', 'computedVersion', 'carriageArrow', 'bevels'];
      for (j = 0, len1 = ref.length; j < len1; j++) {
        prop = ref[j];
        result.push(prop + ': ' + JSON.stringify(this[prop]));
      }
      ref1 = this.children;
      for (i = l = 0, len2 = ref1.length; l < len2; i = ++l) {
        child = ref1[i];
        result.push(("child " + i + ": {startLine: " + child.startLine + ", ") + ("endLine: " + child.endLine + "}"));
      }
      if (line != null) {
        ref2 = ['multilineChildrenData', 'minDimensions', 'minDistanceToBase', 'dimensions', 'distanceToBase', 'bounds', 'glue'];
        for (m = 0, len3 = ref2.length; m < len3; m++) {
          prop = ref2[m];
          result.push(prop + " " + line + ": " + (JSON.stringify(this[prop][line])));
        }
        ref3 = this.lineChildren[line];
        for (i = o = 0, len4 = ref3.length; o < len4; i = ++o) {
          child = ref3[i];
          result.push(("line " + line + " child " + i + ": ") + ("{startLine: " + child.startLine + ", ") + ("endLine: " + child.endLine + "}}"));
        }
      } else {
        for (line = p = 0, ref4 = this.lineLength; 0 <= ref4 ? p < ref4 : p > ref4; line = 0 <= ref4 ? ++p : --p) {
          ref5 = ['multilineChildrenData', 'minDimensions', 'minDistanceToBase', 'dimensions', 'distanceToBase', 'bounds', 'glue'];
          for (q = 0, len5 = ref5.length; q < len5; q++) {
            prop = ref5[q];
            result.push(prop + " " + line + ": " + (JSON.stringify(this[prop][line])));
          }
          ref6 = this.lineChildren[line];
          for (i = s = 0, len6 = ref6.length; s < len6; i = ++s) {
            child = ref6[i];
            result.push(("line " + line + " child " + i + ": ") + ("{startLine: " + child.startLine + ", ") + ("endLine: " + child.endLine + "}}"));
          }
        }
      }
      return result.join('\n');
    };

    GenericViewNode.prototype.computeChildren = function() {
      return this.lineLength;
    };

    GenericViewNode.prototype.computeCarriageArrow = function() {
      var childObj, j, len1, ref;
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObj = ref[j];
        this.view.getViewNodeFor(childObj.child).computeCarriageArrow();
      }
      return this.carriageArrow;
    };

    GenericViewNode.prototype.computeMargins = function() {
      var childObj, j, left, len1, padding, parenttype, ref, ref1, right;
      if (this.computedVersion === this.model.version && ((this.model.parent == null) || this.model.parent.version === this.view.getViewNodeFor(this.model.parent).computedVersion)) {
        return this.margins;
      }
      parenttype = (ref = this.model.parent) != null ? ref.type : void 0;
      padding = this.view.opts.padding;
      left = this.model.isFirstOnLine() || this.lineLength > 1 ? padding : 0;
      right = this.model.isLastOnLine() || this.lineLength > 1 ? padding : 0;
      if (parenttype === 'block' && this.model.type === 'indent') {
        this.margins = {
          top: this.view.opts.padding,
          bottom: this.lineLength > 1 ? this.view.opts.indentTongueHeight : this.view.opts.padding,
          firstLeft: 0,
          midLeft: this.view.opts.indentWidth,
          lastLeft: this.view.opts.indentWidth,
          firstRight: 0,
          midRight: 0,
          lastRight: padding
        };
      } else if (this.model.type === 'text' && parenttype === 'socket') {
        this.margins = {
          top: this.view.opts.textPadding,
          bottom: this.view.opts.textPadding,
          firstLeft: this.view.opts.textPadding,
          midLeft: this.view.opts.textPadding,
          lastLeft: this.view.opts.textPadding,
          firstRight: this.view.opts.textPadding,
          midRight: this.view.opts.textPadding,
          lastRight: this.view.opts.textPadding
        };
      } else if (this.model.type === 'text' && parenttype === 'block') {
        this.margins = {
          top: padding,
          bottom: padding,
          firstLeft: left,
          midLeft: left,
          lastLeft: left,
          firstRight: right,
          midRight: right,
          lastRight: right
        };
      } else if (parenttype === 'block') {
        this.margins = {
          top: padding,
          bottom: padding,
          firstLeft: left,
          midLeft: padding,
          lastLeft: padding,
          firstRight: right,
          midRight: 0,
          lastRight: right
        };
      } else {
        this.margins = {
          firstLeft: 0,
          midLeft: 0,
          lastLeft: 0,
          firstRight: 0,
          midRight: 0,
          lastRight: 0,
          top: 0,
          bottom: 0
        };
      }
      this.firstMargins = {
        left: this.margins.firstLeft,
        right: this.margins.firstRight,
        top: this.margins.top,
        bottom: this.lineLength === 1 ? this.margins.bottom : 0
      };
      this.midMargins = {
        left: this.margins.midLeft,
        right: this.margins.midRight,
        top: 0,
        bottom: 0
      };
      this.lastMargins = {
        left: this.margins.lastLeft,
        right: this.margins.lastRight,
        top: this.lineLength === 1 ? this.margins.top : 0,
        bottom: this.margins.bottom
      };
      ref1 = this.children;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        childObj = ref1[j];
        this.view.getViewNodeFor(childObj.child).computeMargins();
      }
      return null;
    };

    GenericViewNode.prototype.getMargins = function(line) {
      if (line === 0) {
        return this.firstMargins;
      } else if (line === this.lineLength - 1) {
        return this.lastMargins;
      } else {
        return this.midMargins;
      }
    };

    GenericViewNode.prototype.computeBevels = function() {
      var childObj, j, len1, ref;
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObj = ref[j];
        this.view.getViewNodeFor(childObj.child).computeBevels();
      }
      return this.bevels;
    };

    GenericViewNode.prototype.computeMinDimensions = function() {
      var i, j, ref;
      if (this.minDimensions.length > this.lineLength) {
        this.minDimensions.length = this.minDistanceToBase.length = this.lineLength;
      } else {
        while (this.minDimensions.length !== this.lineLength) {
          this.minDimensions.push(new this.view.draw.Size(0, 0));
          this.minDistanceToBase.push({
            above: 0,
            below: 0
          });
        }
      }
      for (i = j = 0, ref = this.lineLength; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.minDimensions[i].width = this.minDimensions[i].height = 0;
        this.minDistanceToBase[i].above = this.minDistanceToBase[i].below = 0;
      }
      return null;
    };

    GenericViewNode.prototype.computeDimensions = function(force, root) {
      var changed, childObj, distance, i, j, l, len1, len2, line, lineCount, m, oldDimensions, oldDistanceToBase, parentNode, ref, ref1, ref2, size, startLine;
      if (root == null) {
        root = false;
      }
      if (this.computedVersion === this.model.version && !force && !this.invalidate) {
        return;
      }
      oldDimensions = this.dimensions;
      oldDistanceToBase = this.distanceToBase;
      this.dimensions = (function() {
        var j, ref, results;
        results = [];
        for (j = 0, ref = this.lineLength; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--) {
          results.push(new this.view.draw.Size(0, 0));
        }
        return results;
      }).call(this);
      this.distanceToBase = (function() {
        var j, ref, results;
        results = [];
        for (j = 0, ref = this.lineLength; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--) {
          results.push({
            above: 0,
            below: 0
          });
        }
        return results;
      }).call(this);
      ref = this.minDimensions;
      for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
        size = ref[i];
        this.dimensions[i].width = size.width;
        this.dimensions[i].height = size.height;
        this.distanceToBase[i].above = this.minDistanceToBase[i].above;
        this.distanceToBase[i].below = this.minDistanceToBase[i].below;
      }
      if ((this.model.parent != null) && !root && (this.topLineSticksToBottom || this.bottomLineSticksToTop || (this.lineLength > 1 && !this.model.isLastOnLine()))) {
        parentNode = this.view.getViewNodeFor(this.model.parent);
        startLine = this.model.getLinesToParent();
        if (this.topLineSticksToBottom) {
          distance = this.distanceToBase[0];
          distance.below = Math.max(distance.below, parentNode.distanceToBase[startLine].below);
          this.dimensions[0] = new this.view.draw.Size(this.dimensions[0].width, distance.below + distance.above);
        }
        if (this.bottomLineSticksToTop) {
          lineCount = this.distanceToBase.length;
          distance = this.distanceToBase[lineCount - 1];
          distance.above = Math.max(distance.above, parentNode.distanceToBase[startLine + lineCount - 1].above);
          this.dimensions[lineCount - 1] = new this.view.draw.Size(this.dimensions[lineCount - 1].width, distance.below + distance.above);
        }
        if (this.lineLength > 1 && !this.model.isLastOnLine() && this.model.type === 'block') {
          distance = this.distanceToBase[this.lineLength - 1];
          distance.below = parentNode.distanceToBase[startLine + this.lineLength - 1].below;
          this.dimensions[lineCount - 1] = new this.view.draw.Size(this.dimensions[lineCount - 1].width, distance.below + distance.above);
        }
      }
      changed = oldDimensions.length !== this.lineLength;
      if (!changed) {
        for (line = l = 0, ref1 = this.lineLength; 0 <= ref1 ? l < ref1 : l > ref1; line = 0 <= ref1 ? ++l : --l) {
          if (!oldDimensions[line].equals(this.dimensions[line]) || oldDistanceToBase[line].above !== this.distanceToBase[line].above || oldDistanceToBase[line].below !== this.distanceToBase[line].below) {
            changed = true;
            break;
          }
        }
      }
      this.changedBoundingBox || (this.changedBoundingBox = changed);
      ref2 = this.children;
      for (m = 0, len2 = ref2.length; m < len2; m++) {
        childObj = ref2[m];
        if (indexOf.call(this.lineChildren[0], childObj) >= 0 || indexOf.call(this.lineChildren[this.lineLength - 1], childObj) >= 0) {
          this.view.getViewNodeFor(childObj.child).computeDimensions(changed, !(this.model instanceof model.Container));
        } else {
          this.view.getViewNodeFor(childObj.child).computeDimensions(false, !(this.model instanceof model.Container));
        }
      }
      return null;
    };

    GenericViewNode.prototype.computeBoundingBoxX = function(left, line) {
      var ref, ref1, ref2;
      if (this.computedVersion === this.model.version && left === ((ref = this.bounds[line]) != null ? ref.x : void 0) && !this.changedBoundingBox || ((ref1 = this.bounds[line]) != null ? ref1.x : void 0) === left && ((ref2 = this.bounds[line]) != null ? ref2.width : void 0) === this.dimensions[line].width) {
        return this.bounds[line];
      }
      this.changedBoundingBox = true;
      if (this.bounds[line] != null) {
        this.bounds[line].x = left;
        this.bounds[line].width = this.dimensions[line].width;
      } else {
        this.bounds[line] = new this.view.draw.Rectangle(left, 0, this.dimensions[line].width, 0);
      }
      return this.bounds[line];
    };

    GenericViewNode.prototype.computeAllBoundingBoxX = function(left) {
      var j, len1, line, ref, size;
      if (left == null) {
        left = 0;
      }
      ref = this.dimensions;
      for (line = j = 0, len1 = ref.length; j < len1; line = ++j) {
        size = ref[line];
        this.computeBoundingBoxX(left, line);
      }
      return this.bounds;
    };

    GenericViewNode.prototype.computeGlue = function() {
      return this.glue = {};
    };

    GenericViewNode.prototype.computeBoundingBoxY = function(top, line) {
      var ref;
      if (this.computedVersion === this.model.version && top === ((ref = this.bounds[line]) != null ? ref.y : void 0) && !this.changedBoundingBox || this.bounds[line].y === top && this.bounds[line].height === this.dimensions[line].height) {
        return this.bounds[line];
      }
      this.changedBoundingBox = true;
      this.bounds[line].y = top;
      this.bounds[line].height = this.dimensions[line].height;
      return this.bounds[line];
    };

    GenericViewNode.prototype.computeAllBoundingBoxY = function(top) {
      var j, len1, line, ref, size;
      if (top == null) {
        top = 0;
      }
      ref = this.dimensions;
      for (line = j = 0, len1 = ref.length; j < len1; line = ++j) {
        size = ref[line];
        this.computeBoundingBoxY(top, line);
        top += size.height;
        if (line in this.glue) {
          top += this.glue[line].height;
        }
      }
      return this.bounds;
    };

    GenericViewNode.prototype.getBounds = function() {
      return this.totalBounds;
    };

    GenericViewNode.prototype.computeOwnPath = function() {
      return this.path = new this.view.draw.Path();
    };

    GenericViewNode.prototype.computePath = function() {
      var bound, child, childObj, j, l, len1, len2, len3, m, maxRight, ref, ref1, ref2;
      if (this.computedVersion === this.model.version && (this.model.isLastOnLine() === this.lastComputedLinePredicate) && !this.changedBoundingBox) {
        return null;
      }
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObj = ref[j];
        this.view.getViewNodeFor(childObj.child).computePath();
      }
      if (this.changedBoundingBox || (this.model.isLastOnLine() !== this.lastComputedLinePredicate)) {
        this.computeOwnPath();
        this.totalBounds = new this.view.draw.NoRectangle();
        if (this.bounds.length > 0) {
          this.totalBounds.unite(this.bounds[0]);
          this.totalBounds.unite(this.bounds[this.bounds.length - 1]);
        }
        if (this.bounds.length > this.children.length) {
          ref1 = this.children;
          for (l = 0, len2 = ref1.length; l < len2; l++) {
            child = ref1[l];
            this.totalBounds.unite(this.view.getViewNodeFor(child.child).totalBounds);
          }
        } else {
          maxRight = this.totalBounds.right();
          ref2 = this.bounds;
          for (m = 0, len3 = ref2.length; m < len3; m++) {
            bound = ref2[m];
            this.totalBounds.x = Math.min(this.totalBounds.x, bound.x);
            maxRight = Math.max(maxRight, bound.right());
          }
          this.totalBounds.width = maxRight - this.totalBounds.x;
        }
        this.totalBounds.unite(this.path.bounds());
      }
      this.lastComputedLinePredicate = this.model.isLastOnLine();
      return null;
    };

    GenericViewNode.prototype.computeOwnDropArea = function() {};

    GenericViewNode.prototype.computeDropAreas = function() {
      var childObj, j, len1, ref;
      if (this.computedVersion === this.model.version && !this.changedBoundingBox) {
        return null;
      }
      this.computeOwnDropArea();
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObj = ref[j];
        this.view.getViewNodeFor(childObj.child).computeDropAreas();
      }
      return null;
    };

    GenericViewNode.prototype.computeNewVersionNumber = function() {
      var childObj, j, len1, ref;
      if (this.computedVersion === this.model.version && !this.changedBoundingBox) {
        return null;
      }
      this.changedBoundingBox = false;
      this.invalidate = false;
      this.computedVersion = this.model.version;
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObj = ref[j];
        this.view.getViewNodeFor(childObj.child).computeNewVersionNumber();
      }
      return null;
    };

    GenericViewNode.prototype.drawSelf = function(ctx, style) {
      if (style == null) {
        style = {};
      }
    };

    GenericViewNode.prototype.draw = function(ctx, boundingRect, style) {
      var childObj, j, len1, ref;
      if (style == null) {
        style = {};
      }
      if (this.totalBounds.overlap(boundingRect)) {
        this.drawSelf(ctx, style);
        ref = this.children;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          childObj = ref[j];
          this.view.getViewNodeFor(childObj.child).draw(ctx, boundingRect, style);
        }
      }
      return null;
    };

    GenericViewNode.prototype.drawShadow = function(ctx) {};

    GenericViewNode.prototype.debugDimensions = function(x, y, line, ctx) {
      var childObj, childView, j, len1, ref, results;
      ctx.fillStyle = '#00F';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, this.dimensions[line].width, this.dimensions[line].height);
      ctx.strokeRect(x, y, this.dimensions[line].width, this.dimensions[line].height);
      ref = this.lineChildren[line];
      results = [];
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObj = ref[j];
        childView = this.view.getViewNodeFor(childObj.child);
        x += childView.getMargins(line).left;
        childView.debugDimensions(x, y, line - childObj.startLine, ctx);
        results.push(x += childView.dimensions[line - childObj.startLine].width + childView.getMargins(line).right);
      }
      return results;
    };

    GenericViewNode.prototype.debugAllDimensions = function(ctx) {
      var j, len1, line, ref, size, y;
      ctx.globalAlpha = 0.1;
      y = 0;
      ref = this.dimensions;
      for (line = j = 0, len1 = ref.length; j < len1; line = ++j) {
        size = ref[line];
        this.debugDimensions(0, y, line, ctx);
        y += size.height;
      }
      return ctx.globalAlpha = 1;
    };

    GenericViewNode.prototype.debugAllBoundingBoxes = function(ctx) {
      var bound, childObj, j, l, len1, len2, ref, ref1;
      ctx.globalAlpha = 0.1;
      ref = this.bounds;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        bound = ref[j];
        bound.fill(ctx, '#00F');
        bound.stroke(ctx, '#000');
      }
      ref1 = this.children;
      for (l = 0, len2 = ref1.length; l < len2; l++) {
        childObj = ref1[l];
        this.view.getViewNodeFor(childObj.child).debugAllBoundingBoxes(ctx);
      }
      return ctx.globalAlpha = 1;
    };

    return GenericViewNode;

  })();

  ListViewNode = (function(superClass) {
    extend(ListViewNode, superClass);

    function ListViewNode(model1, view1) {
      this.model = model1;
      this.view = view1;
      ListViewNode.__super__.constructor.apply(this, arguments);
    }

    ListViewNode.prototype.computeChildren = function() {
      var base, i, j, line, ref;
      if (this.computedVersion === this.model.version) {
        return this.lineLength;
      }
      this.lineLength = 0;
      this.lineChildren = [[]];
      this.children = [];
      this.multilineChildrenData = [];
      this.topLineSticksToBottom = false;
      this.bottomLineSticksToTop = false;
      line = 0;
      this.model.traverseOneLevel((function(_this) {
        return function(head) {
          var base, base1, childLength, childObject, i, j, l, ref, ref1, ref2, ref3, view;
          if (head.type === 'newline') {
            line += 1;
            return (base = _this.lineChildren)[line] != null ? base[line] : base[line] = [];
          } else {
            view = _this.view.getViewNodeFor(head);
            childLength = view.computeChildren();
            childObject = {
              child: head,
              startLine: line,
              endLine: line + childLength - 1
            };
            _this.children.push(childObject);
            for (i = j = ref = line, ref1 = line + childLength; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
              if ((base1 = _this.lineChildren)[i] == null) {
                base1[i] = [];
              }
              if (head.type !== 'cursor') {
                _this.lineChildren[i].push(childObject);
              }
            }
            if (view.lineLength > 1) {
              if (_this.multilineChildrenData[line] === MULTILINE_END) {
                _this.multilineChildrenData[line] = MULTILINE_END_START;
              } else {
                _this.multilineChildrenData[line] = MULTILINE_START;
              }
              for (i = l = ref2 = line + 1, ref3 = line + childLength - 1; ref2 <= ref3 ? l < ref3 : l > ref3; i = ref2 <= ref3 ? ++l : --l) {
                _this.multilineChildrenData[i] = MULTILINE_MIDDLE;
              }
              _this.multilineChildrenData[line + childLength - 1] = MULTILINE_END;
            }
            return line += childLength - 1;
          }
        };
      })(this));
      this.lineLength = line + 1;
      if (this.bounds.length !== this.lineLength) {
        this.changedBoundingBox = true;
        this.bounds = this.bounds.slice(0, this.lineLength);
      }
      for (i = j = 0, ref = this.lineLength; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if ((base = this.multilineChildrenData)[i] == null) {
          base[i] = NO_MULTILINE;
        }
      }
      if (this.lineLength > 1) {
        this.topLineSticksToBottom = true;
        this.bottomLineSticksToTop = true;
      }
      return this.lineLength;
    };

    ListViewNode.prototype.computeMinDimensions = function() {
      var bottomMargin, childNode, childObject, desiredLine, j, l, len1, len2, len3, len4, len5, len6, line, lineChild, lineChildView, linesToExtend, m, margins, minDimension, minDimensions, minDistanceToBase, o, p, preIndentLines, q, ref, ref1, ref2, ref3, ref4, size;
      if (this.computedVersion === this.model.version) {
        return null;
      }
      ListViewNode.__super__.computeMinDimensions.apply(this, arguments);
      linesToExtend = [];
      preIndentLines = [];
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObject = ref[j];
        childNode = this.view.getViewNodeFor(childObject.child);
        childNode.computeMinDimensions();
        minDimensions = childNode.minDimensions;
        minDistanceToBase = childNode.minDistanceToBase;
        for (line = l = 0, len2 = minDimensions.length; l < len2; line = ++l) {
          size = minDimensions[line];
          desiredLine = line + childObject.startLine;
          margins = childNode.getMargins(line);
          this.minDimensions[desiredLine].width += size.width + margins.left + margins.right;
          if (childObject.child.type === 'indent' && line === minDimensions.length - 1 && desiredLine < this.lineLength - 1) {
            bottomMargin = 0;
            linesToExtend.push(desiredLine + 1);
          } else if (childObject.child.type === 'indent' && line === 0) {
            preIndentLines.push(desiredLine);
            bottomMargin = margins.bottom;
          } else {
            bottomMargin = margins.bottom;
          }
          this.minDistanceToBase[desiredLine].above = Math.max(this.minDistanceToBase[desiredLine].above, minDistanceToBase[line].above + margins.top);
          this.minDistanceToBase[desiredLine].below = Math.max(this.minDistanceToBase[desiredLine].below, minDistanceToBase[line].below + Math.max(bottomMargin, ((((ref1 = this.model.buttons) != null ? ref1.addButton : void 0) || ((ref2 = this.model.buttons) != null ? ref2.subtractButton : void 0)) && desiredLine === this.lineLength - 1 && this.multilineChildrenData[line] === MULTILINE_END && this.lineChildren[line].length === 1 ? this.view.opts.buttonPadding + this.view.opts.buttonHeight : 0)));
        }
      }
      ref3 = this.minDimensions;
      for (line = m = 0, len3 = ref3.length; m < len3; line = ++m) {
        minDimension = ref3[line];
        if (this.lineChildren[line].length === 0) {
          if (this.model.type === 'socket') {
            this.minDistanceToBase[line].above = this.view.opts.textHeight * this.view.opts.textPadding;
            this.minDistanceToBase[line].above = this.view.opts.textPadding;
          } else {
            this.minDistanceToBase[line].above = this.view.opts.textHeight + this.view.opts.padding;
            this.minDistanceToBase[line].below = this.view.opts.padding;
          }
        }
        minDimension.height = this.minDistanceToBase[line].above + this.minDistanceToBase[line].below;
      }
      for (o = 0, len4 = linesToExtend.length; o < len4; o++) {
        line = linesToExtend[o];
        this.minDimensions[line].width = Math.max(this.minDimensions[line].width, this.minDimensions[line - 1].width);
      }
      for (p = 0, len5 = preIndentLines.length; p < len5; p++) {
        line = preIndentLines[p];
        this.minDimensions[line].width = Math.max(this.minDimensions[line].width, this.view.opts.indentWidth + this.view.opts.tabWidth + this.view.opts.tabOffset + this.view.opts.bevelClip);
      }
      ref4 = this.lineChildren[this.lineLength - 1];
      for (q = 0, len6 = ref4.length; q < len6; q++) {
        lineChild = ref4[q];
        lineChildView = this.view.getViewNodeFor(lineChild.child);
        if (lineChildView.carriageArrow !== CARRIAGE_ARROW_NONE) {
          this.minDistanceToBase[this.lineLength - 1].below += this.view.opts.padding;
          this.minDimensions[this.lineLength - 1].height = this.minDistanceToBase[this.lineLength - 1].above + this.minDistanceToBase[this.lineLength - 1].below;
          break;
        }
      }
      return null;
    };

    ListViewNode.prototype.computeBoundingBoxX = function(left, line, offset) {
      var childLeft, childLine, childMargins, childView, i, j, len1, lineChild, ref, ref1, ref2, ref3;
      if (offset == null) {
        offset = 0;
      }
      if (this.computedVersion === this.model.version && left === ((ref = this.bounds[line]) != null ? ref.x : void 0) && !this.changedBoundingBox) {
        return this.bounds[line];
      }
      if (!(((ref1 = this.bounds[line]) != null ? ref1.x : void 0) === left && ((ref2 = this.bounds[line]) != null ? ref2.width : void 0) === this.dimensions[line].width)) {
        if (this.bounds[line] != null) {
          this.bounds[line].x = left;
          this.bounds[line].width = this.dimensions[line].width;
        } else {
          this.bounds[line] = new this.view.draw.Rectangle(left, 0, this.dimensions[line].width, 0);
        }
        this.changedBoundingBox = true;
      }
      childLeft = left + offset;
      ref3 = this.lineChildren[line];
      for (i = j = 0, len1 = ref3.length; j < len1; i = ++j) {
        lineChild = ref3[i];
        childView = this.view.getViewNodeFor(lineChild.child);
        childLine = line - lineChild.startLine;
        childMargins = childView.getMargins(childLine);
        childLeft += childMargins.left;
        childView.computeBoundingBoxX(childLeft, childLine);
        childLeft += childView.dimensions[childLine].width + childMargins.right;
      }
      return this.bounds[line];
    };

    ListViewNode.prototype.computeBoundingBoxY = function(top, line) {
      var above, childAbove, childLine, childView, i, j, len1, lineChild, ref, ref1, ref2, ref3;
      if (this.computedVersion === this.model.version && top === ((ref = this.bounds[line]) != null ? ref.y : void 0) && !this.changedBoundingBox) {
        return this.bounds[line];
      }
      if (!(((ref1 = this.bounds[line]) != null ? ref1.y : void 0) === top && ((ref2 = this.bounds[line]) != null ? ref2.height : void 0) === this.dimensions[line].height)) {
        this.bounds[line].y = top;
        this.bounds[line].height = this.dimensions[line].height;
        this.changedBoundingBox = true;
      }
      above = this.distanceToBase[line].above;
      ref3 = this.lineChildren[line];
      for (i = j = 0, len1 = ref3.length; j < len1; i = ++j) {
        lineChild = ref3[i];
        childView = this.view.getViewNodeFor(lineChild.child);
        childLine = line - lineChild.startLine;
        childAbove = childView.distanceToBase[childLine].above;
        childView.computeBoundingBoxY(top + above - childAbove, childLine);
      }
      return this.bounds[line];
    };

    ListViewNode.prototype.layout = function(left, top) {
      var changedBoundingBox;
      if (left == null) {
        left = this.lastCoordinate.x;
      }
      if (top == null) {
        top = this.lastCoordinate.y;
      }
      this.lastCoordinate = new this.view.draw.Point(left, top);
      this.computeChildren();
      this.computeCarriageArrow(true);
      this.computeMargins();
      this.computeBevels();
      this.computeMinDimensions();
      this.computeDimensions(0, true);
      this.computeAllBoundingBoxX(left);
      this.computeGlue();
      this.computeAllBoundingBoxY(top);
      this.computePath();
      this.computeDropAreas();
      changedBoundingBox = this.changedBoundingBox;
      this.computeNewVersionNumber();
      return changedBoundingBox;
    };

    ListViewNode.prototype.absorbCache = function() {
      var child, childView, j, l, left, len1, len2, line, ref, ref1, size, top;
      this.computeChildren();
      this.computeCarriageArrow(true);
      this.computeMargins();
      this.computeBevels();
      this.computeMinDimensions();
      this.computeDimensions(0, true);
      ref = this.dimensions;
      for (line = j = 0, len1 = ref.length; j < len1; line = ++j) {
        size = ref[line];
        child = this.lineChildren[line][0];
        childView = this.view.getViewNodeFor(child.child);
        left = childView.bounds[line - child.startLine].x;
        this.computeBoundingBoxX(left, line);
      }
      this.computeGlue();
      ref1 = this.dimensions;
      for (line = l = 0, len2 = ref1.length; l < len2; line = ++l) {
        size = ref1[line];
        child = this.lineChildren[line][0];
        childView = this.view.getViewNodeFor(child.child);
        top = childView.bounds[line - child.startLine].y;
        this.computeBoundingBoxY(top, line);
      }
      this.computePath();
      this.computeDropAreas();
      return true;
    };

    ListViewNode.prototype.computeGlue = function() {
      var box, childLine, childObj, childView, j, l, len1, len2, len3, line, lineChild, m, ref, ref1, ref2;
      if (this.computedVersion === this.model.version && !this.changedBoundingBox) {
        return this.glue;
      }
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObj = ref[j];
        this.view.getViewNodeFor(childObj.child).computeGlue();
      }
      this.glue = {};
      ref1 = this.bounds;
      for (line = l = 0, len2 = ref1.length; l < len2; line = ++l) {
        box = ref1[line];
        if (!(line < this.bounds.length - 1)) {
          continue;
        }
        this.glue[line] = {
          type: 'normal',
          height: 0,
          draw: false
        };
        ref2 = this.lineChildren[line];
        for (m = 0, len3 = ref2.length; m < len3; m++) {
          lineChild = ref2[m];
          childView = this.view.getViewNodeFor(lineChild.child);
          childLine = line - lineChild.startLine;
          if (childLine in childView.glue) {
            this.glue[line].height = Math.max(this.glue[line].height, childView.glue[childLine].height);
          }
          if (childView.carriageArrow !== CARRIAGE_ARROW_NONE) {
            this.glue[line].height = Math.max(this.glue[line].height, this.view.opts.padding);
          }
        }
      }
      return this.glue;
    };

    ListViewNode.prototype.drawShadow = function(ctx, x, y) {
      var childObj, j, len1, ref;
      this.path.drawShadow(ctx, x, y, this.view.opts.shadowBlur);
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        childObj = ref[j];
        this.view.getViewNodeFor(childObj.child).drawShadow(ctx, x, y);
      }
      return null;
    };

    return ListViewNode;

  })(GenericViewNode);

  ContainerViewNode = (function(superClass) {
    extend(ContainerViewNode, superClass);

    function ContainerViewNode(model1, view1) {
      this.model = model1;
      this.view = view1;
      ContainerViewNode.__super__.constructor.apply(this, arguments);
    }

    ContainerViewNode.prototype.computeCarriageArrow = function(root) {
      var head, oldCarriageArrow, parent;
      if (root == null) {
        root = false;
      }
      oldCarriageArrow = this.carriageArrow;
      this.carriageArrow = CARRIAGE_ARROW_NONE;
      parent = this.model.parent;
      if ((!root) && (parent != null ? parent.type : void 0) === 'indent' && this.view.getViewNodeFor(parent).lineLength > 1 && this.lineLength === 1) {
        head = this.model.start;
        while (!(head === parent.start || head.type === 'newline')) {
          head = head.prev;
        }
        if (head === parent.start) {
          if (this.model.isLastOnLine()) {
            this.carriageArrow = CARRIAGE_ARROW_INDENT;
          } else {
            this.carriageArrow = CARRIAGE_GROW_DOWN;
          }
        } else if (!this.model.isFirstOnLine()) {
          this.carriageArrow = CARRIAGE_ARROW_SIDEALONG;
        }
      }
      if (this.carriageArrow !== oldCarriageArrow) {
        this.changedBoundingBox = true;
      }
      if (this.computedVersion === this.model.version && ((this.model.parent == null) || this.model.parent.version === this.view.getViewNodeFor(this.model.parent).computedVersion)) {
        return null;
      }
      return ContainerViewNode.__super__.computeCarriageArrow.apply(this, arguments);
    };

    ContainerViewNode.prototype.computeGlue = function() {
      var box, j, len1, line, overlap, ref, ref1;
      if (this.computedVersion === this.model.version && !this.changedBoundingBox) {
        return this.glue;
      }
      ContainerViewNode.__super__.computeGlue.apply(this, arguments);
      ref = this.bounds;
      for (line = j = 0, len1 = ref.length; j < len1; line = ++j) {
        box = ref[line];
        if (line < this.bounds.length - 1) {
          if (this.multilineChildrenData[line] !== MULTILINE_MIDDLE) {
            overlap = Math.min(this.bounds[line].right() - this.bounds[line + 1].x, this.bounds[line + 1].right() - this.bounds[line].x);
            if ((ref1 = this.multilineChildrenData[line]) === MULTILINE_START || ref1 === MULTILINE_END_START) {
              overlap = Math.min(overlap, this.bounds[line + 1].x + this.view.opts.indentWidth - this.bounds[line].x);
            }
            if (overlap < this.view.opts.padding && this.model.type !== 'indent') {
              this.glue[line].height += this.view.opts.padding;
              this.glue[line].draw = true;
            }
          }
        }
      }
      return this.glue;
    };

    ContainerViewNode.prototype.computeBevels = function() {
      var oldBevels, ref, ref1, ref2, ref3, ref4, ref5, ref6;
      oldBevels = this.bevels;
      this.bevels = {
        top: true,
        bottom: true
      };
      if (((ref = (ref1 = this.model.parent) != null ? ref1.type : void 0) === 'indent' || ref === 'document') && ((ref2 = this.model.start.prev) != null ? ref2.type : void 0) === 'newline' && ((ref3 = this.model.start.prev) != null ? ref3.prev : void 0) !== this.model.parent.start) {
        this.bevels.top = false;
      }
      if (((ref4 = (ref5 = this.model.parent) != null ? ref5.type : void 0) === 'indent' || ref4 === 'document') && ((ref6 = this.model.end.next) != null ? ref6.type : void 0) === 'newline') {
        this.bevels.bottom = false;
      }
      if (!(oldBevels.top === this.bevels.top && oldBevels.bottom === this.bevels.bottom)) {
        this.changedBoundingBox = true;
      }
      if (this.computedVersion === this.model.version) {
        return null;
      }
      return ContainerViewNode.__super__.computeBevels.apply(this, arguments);
    };

    ContainerViewNode.prototype.computeOwnPath = function() {
      var bounds, destinationBounds, el, glueTop, i, innerLeft, innerRight, j, l, left, leftmost, len1, len2, len3, line, m, multilineBounds, multilineChild, multilineNode, multilineView, newPath, next, parentViewNode, path, point, prev, ref, ref1, ref2, ref3, ref4, ref5, ref6, right, rightmost;
      left = [];
      right = [];
      if (this.shouldAddTab() && this.model.isFirstOnLine() && this.carriageArrow !== CARRIAGE_ARROW_SIDEALONG) {
        this.addTabReverse(right, new this.view.draw.Point(this.bounds[0].x + this.view.opts.tabOffset, this.bounds[0].y));
      }
      ref = this.bounds;
      for (line = j = 0, len1 = ref.length; j < len1; line = ++j) {
        bounds = ref[line];
        if (this.multilineChildrenData[line] === NO_MULTILINE) {
          left.push(new this.view.draw.Point(bounds.x, bounds.y));
          left.push(new this.view.draw.Point(bounds.x, bounds.bottom()));
          right.push(new this.view.draw.Point(bounds.right(), bounds.y));
          right.push(new this.view.draw.Point(bounds.right(), bounds.bottom()));
        }
        if (this.multilineChildrenData[line] === MULTILINE_START) {
          left.push(new this.view.draw.Point(bounds.x, bounds.y));
          left.push(new this.view.draw.Point(bounds.x, bounds.bottom()));
          multilineChild = this.lineChildren[line][this.lineChildren[line].length - 1];
          multilineView = this.view.getViewNodeFor(multilineChild.child);
          multilineBounds = multilineView.bounds[line - multilineChild.startLine];
          if (multilineBounds.width === 0) {
            right.push(new this.view.draw.Point(bounds.right(), bounds.y));
          } else {
            right.push(new this.view.draw.Point(bounds.right(), bounds.y));
            right.push(new this.view.draw.Point(bounds.right(), multilineBounds.y));
            if (multilineChild.child.type === 'indent') {
              this.addTab(right, new this.view.draw.Point(multilineBounds.x + this.view.opts.tabOffset, multilineBounds.y));
            }
            right.push(new this.view.draw.Point(multilineBounds.x, multilineBounds.y));
            right.push(new this.view.draw.Point(multilineBounds.x, multilineBounds.bottom()));
          }
        }
        if (this.multilineChildrenData[line] === MULTILINE_MIDDLE) {
          multilineChild = this.lineChildren[line][0];
          multilineBounds = this.view.getViewNodeFor(multilineChild.child).bounds[line - multilineChild.startLine];
          left.push(new this.view.draw.Point(bounds.x, bounds.y));
          left.push(new this.view.draw.Point(bounds.x, bounds.bottom()));
          if (!(((ref1 = this.multilineChildrenData[line - 1]) === MULTILINE_START || ref1 === MULTILINE_END_START) && multilineChild.child.type === 'indent')) {
            right.push(new this.view.draw.Point(multilineBounds.x, bounds.y));
          }
          right.push(new this.view.draw.Point(multilineBounds.x, bounds.bottom()));
        }
        if ((ref2 = this.multilineChildrenData[line]) === MULTILINE_END || ref2 === MULTILINE_END_START) {
          left.push(new this.view.draw.Point(bounds.x, bounds.y));
          left.push(new this.view.draw.Point(bounds.x, bounds.bottom()));
          multilineChild = this.lineChildren[line][0];
          multilineBounds = this.view.getViewNodeFor(multilineChild.child).bounds[line - multilineChild.startLine];
          if (!(((ref3 = this.multilineChildrenData[line - 1]) === MULTILINE_START || ref3 === MULTILINE_END_START) && multilineChild.child.type === 'indent')) {
            right.push(new this.view.draw.Point(multilineBounds.x, multilineBounds.y));
          }
          right.push(new this.view.draw.Point(multilineBounds.x, multilineBounds.bottom()));
          if (multilineChild.child.type === 'indent') {
            this.addTabReverse(right, new this.view.draw.Point(multilineBounds.x + this.view.opts.tabOffset, multilineBounds.bottom()));
          }
          right.push(new this.view.draw.Point(multilineBounds.right(), multilineBounds.bottom()));
          if (this.lineChildren[line].length > 1) {
            right.push(new this.view.draw.Point(multilineBounds.right(), multilineBounds.y));
            if (this.multilineChildrenData[line] === MULTILINE_END) {
              right.push(new this.view.draw.Point(bounds.right(), bounds.y));
              right.push(new this.view.draw.Point(bounds.right(), bounds.bottom()));
            } else {
              multilineChild = this.lineChildren[line][this.lineChildren[line].length - 1];
              multilineView = this.view.getViewNodeFor(multilineChild.child);
              multilineBounds = multilineView.bounds[line - multilineChild.startLine];
              right.push(new this.view.draw.Point(bounds.right(), bounds.y));
              if (multilineBounds.width === 0) {
                right.push(new this.view.draw.Point(bounds.right(), bounds.y));
                right.push(new this.view.draw.Point(bounds.right(), bounds.bottom()));
              } else {
                right.push(new this.view.draw.Point(bounds.right(), multilineBounds.y));
                right.push(new this.view.draw.Point(multilineBounds.x, multilineBounds.y));
                right.push(new this.view.draw.Point(multilineBounds.x, multilineBounds.bottom()));
              }
            }
          } else {
            right.push(new this.view.draw.Point(bounds.right(), multilineBounds.bottom()));
            right.push(new this.view.draw.Point(bounds.right(), bounds.bottom()));
          }
        }
        if (line < this.lineLength - 1 && line in this.glue && this.glue[line].draw) {
          glueTop = this.bounds[line + 1].y - this.glue[line].height;
          leftmost = Math.min(this.bounds[line + 1].x, this.bounds[line].x);
          rightmost = Math.max(this.bounds[line + 1].right(), this.bounds[line].right());
          left.push(new this.view.draw.Point(this.bounds[line].x, glueTop));
          left.push(new this.view.draw.Point(leftmost, glueTop));
          left.push(new this.view.draw.Point(leftmost, glueTop + this.view.opts.padding));
          if (this.multilineChildrenData[line] !== MULTILINE_START) {
            right.push(new this.view.draw.Point(this.bounds[line].right(), glueTop));
            right.push(new this.view.draw.Point(rightmost, glueTop));
            right.push(new this.view.draw.Point(rightmost, glueTop + this.view.opts.padding));
          }
        } else if ((this.bounds[line + 1] != null) && this.multilineChildrenData[line] !== MULTILINE_MIDDLE) {
          innerLeft = Math.max(this.bounds[line + 1].x, this.bounds[line].x);
          innerRight = Math.min(this.bounds[line + 1].right(), this.bounds[line].right());
          left.push(new this.view.draw.Point(innerLeft, this.bounds[line].bottom()));
          left.push(new this.view.draw.Point(innerLeft, this.bounds[line + 1].y));
          if ((ref4 = this.multilineChildrenData[line]) !== MULTILINE_START && ref4 !== MULTILINE_END_START) {
            right.push(new this.view.draw.Point(innerRight, this.bounds[line].bottom()));
            right.push(new this.view.draw.Point(innerRight, this.bounds[line + 1].y));
          }
        } else if (this.carriageArrow === CARRIAGE_GROW_DOWN) {
          parentViewNode = this.view.getViewNodeFor(this.model.parent);
          destinationBounds = parentViewNode.bounds[1];
          right.push(new this.view.draw.Point(this.bounds[line].right(), destinationBounds.y - this.view.opts.padding));
          left.push(new this.view.draw.Point(this.bounds[line].x, destinationBounds.y - this.view.opts.padding));
        } else if (this.carriageArrow === CARRIAGE_ARROW_INDENT) {
          parentViewNode = this.view.getViewNodeFor(this.model.parent);
          destinationBounds = parentViewNode.bounds[1];
          right.push(new this.view.draw.Point(this.bounds[line].right(), destinationBounds.y));
          right.push(new this.view.draw.Point(destinationBounds.x + this.view.opts.tabOffset + this.view.opts.tabWidth, destinationBounds.y));
          left.push(new this.view.draw.Point(this.bounds[line].x, destinationBounds.y - this.view.opts.padding));
          left.push(new this.view.draw.Point(destinationBounds.x, destinationBounds.y - this.view.opts.padding));
          left.push(new this.view.draw.Point(destinationBounds.x, destinationBounds.y));
          this.addTab(right, new this.view.draw.Point(destinationBounds.x + this.view.opts.tabOffset, destinationBounds.y));
        } else if (this.carriageArrow === CARRIAGE_ARROW_SIDEALONG && this.model.isLastOnLine()) {
          parentViewNode = this.view.getViewNodeFor(this.model.parent);
          destinationBounds = parentViewNode.bounds[this.model.getLinesToParent()];
          right.push(new this.view.draw.Point(this.bounds[line].right(), destinationBounds.bottom() + this.view.opts.padding));
          right.push(new this.view.draw.Point(destinationBounds.x + this.view.opts.tabOffset + this.view.opts.tabWidth, destinationBounds.bottom() + this.view.opts.padding));
          left.push(new this.view.draw.Point(this.bounds[line].x, destinationBounds.bottom()));
          left.push(new this.view.draw.Point(destinationBounds.x, destinationBounds.bottom()));
          left.push(new this.view.draw.Point(destinationBounds.x, destinationBounds.bottom() + this.view.opts.padding));
          this.addTab(right, new this.view.draw.Point(destinationBounds.x + this.view.opts.tabOffset, destinationBounds.bottom() + this.view.opts.padding));
        }
        if ((ref5 = this.multilineChildrenData[line]) === MULTILINE_START || ref5 === MULTILINE_END_START) {
          multilineChild = this.lineChildren[line][this.lineChildren[line].length - 1];
          multilineNode = this.view.getViewNodeFor(multilineChild.child);
          multilineBounds = multilineNode.bounds[line - multilineChild.startLine];
          if ((ref6 = this.glue[line]) != null ? ref6.draw : void 0) {
            glueTop = this.bounds[line + 1].y - this.glue[line].height + this.view.opts.padding;
          } else {
            glueTop = this.bounds[line].bottom();
          }
          if (multilineChild.child.type === 'indent' && multilineChild.child.start.next.type === 'newline') {
            right.push(new this.view.draw.Point(this.bounds[line].right(), glueTop));
            this.addTab(right, new this.view.draw.Point(this.bounds[line + 1].x + this.view.opts.indentWidth + this.view.opts.tabOffset, glueTop), true);
          } else {
            right.push(new this.view.draw.Point(multilineBounds.x, glueTop));
          }
          if (glueTop !== this.bounds[line + 1].y) {
            right.push(new this.view.draw.Point(multilineNode.bounds[line - multilineChild.startLine + 1].x, glueTop));
          }
          right.push(new this.view.draw.Point(multilineNode.bounds[line - multilineChild.startLine + 1].x, this.bounds[line + 1].y));
        }
      }
      if (this.shouldAddTab() && this.model.isLastOnLine() && this.carriageArrow === CARRIAGE_ARROW_NONE) {
        this.addTab(right, new this.view.draw.Point(this.bounds[this.lineLength - 1].x + this.view.opts.tabOffset, this.bounds[this.lineLength - 1].bottom()));
      }
      path = left.reverse().concat(right);
      newPath = [];
      for (i = l = 0, len2 = path.length; l < len2; i = ++l) {
        point = path[i];
        if (i === 0 && !this.bevels.bottom) {
          newPath.push(point);
          continue;
        }
        if (i === (left.length - 1) && !this.bevels.top) {
          newPath.push(point);
          continue;
        }
        next = path[modulo(i + 1, path.length)];
        prev = path[modulo(i - 1, path.length)];
        if ((point.x === next.x) !== (point.y === next.y) && (point.x === prev.x) !== (point.y === prev.y)) {
          newPath.push(point.plus(point.from(prev).toMagnitude(-this.view.opts.bevelClip)));
          newPath.push(point.plus(point.from(next).toMagnitude(-this.view.opts.bevelClip)));
        } else {
          newPath.push(point);
        }
      }
      this.path = new this.view.draw.Path();
      for (m = 0, len3 = newPath.length; m < len3; m++) {
        el = newPath[m];
        this.path.push(el);
      }
      return this.path;
    };

    ContainerViewNode.prototype.addTab = function(array, point) {
      array.push(new this.view.draw.Point(point.x + this.view.opts.tabWidth, point.y));
      array.push(new this.view.draw.Point(point.x + this.view.opts.tabWidth * (1 - this.view.opts.tabSideWidth), point.y + this.view.opts.tabHeight));
      array.push(new this.view.draw.Point(point.x + this.view.opts.tabWidth * this.view.opts.tabSideWidth, point.y + this.view.opts.tabHeight));
      array.push(new this.view.draw.Point(point.x, point.y));
      return array.push(point);
    };

    ContainerViewNode.prototype.addTabReverse = function(array, point) {
      array.push(point);
      array.push(new this.view.draw.Point(point.x, point.y));
      array.push(new this.view.draw.Point(point.x + this.view.opts.tabWidth * this.view.opts.tabSideWidth, point.y + this.view.opts.tabHeight));
      array.push(new this.view.draw.Point(point.x + this.view.opts.tabWidth * (1 - this.view.opts.tabSideWidth), point.y + this.view.opts.tabHeight));
      return array.push(new this.view.draw.Point(point.x + this.view.opts.tabWidth, point.y));
    };

    ContainerViewNode.prototype.computeOwnDropArea = function() {
      return this.dropArea = this.highlightArea = null;
    };

    ContainerViewNode.prototype.shouldAddTab = NO;

    ContainerViewNode.prototype.drawSelf = function(ctx, style) {
      var oldFill, oldStroke;
      if (style == null) {
        style = {};
      }
      oldFill = this.path.style.fillColor;
      oldStroke = this.path.style.strokeColor;
      if (style.grayscale) {
        this.path.style.fillColor = avgColor(this.path.style.fillColor, 0.5, '#888');
        this.path.style.strokeColor = avgColor(this.path.style.strokeColor, 0.5, '#888');
      }
      if (style.selected) {
        this.path.style.fillColor = avgColor(this.path.style.fillColor, 0.7, '#00F');
        this.path.style.strokeColor = avgColor(this.path.style.strokeColor, 0.7, '#00F');
      }
      this.path.draw(ctx);
      this.path.style.fillColor = oldFill;
      this.path.style.strokeColor = oldStroke;
      return null;
    };

    return ContainerViewNode;

  })(ListViewNode);

  BlockViewNode = (function(superClass) {
    extend(BlockViewNode, superClass);

    function BlockViewNode() {
      BlockViewNode.__super__.constructor.apply(this, arguments);
    }

    BlockViewNode.prototype.computeMinDimensions = function() {
      var i, j, len1, ref, size;
      if (this.computedVersion === this.model.version) {
        return null;
      }
      BlockViewNode.__super__.computeMinDimensions.apply(this, arguments);
      this.extraWidth = 0;
      if (this.model.buttons.addButton) {
        this.extraWidth += this.view.opts.buttonWidth + this.view.opts.buttonPadding;
      }
      if (this.model.buttons.subtractButton) {
        this.extraWidth += this.view.opts.buttonWidth + this.view.opts.buttonPadding;
      }
      ref = this.minDimensions;
      for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
        size = ref[i];
        size.width = Math.max(size.width, this.view.opts.tabWidth + this.view.opts.tabOffset);
      }
      this.minDimensions[this.minDimensions.length - 1].width += this.extraWidth;
      return null;
    };

    BlockViewNode.prototype.drawSelf = function(ctx, style) {
      var drawButton;
      BlockViewNode.__super__.drawSelf.apply(this, arguments);
      drawButton = (function(_this) {
        return function(text, rect, ctx) {
          var dx, dy, path, textElement;
          path = rect.toPath().reverse();
          path.style.fillColor = _this.path.style.fillColor;
          if (style.grayscale) {
            path.style.fillColor = avgColor(_this.path.style.fillColor, 0.5, '#888');
          }
          if (style.selected) {
            path.style.fillColor = avgColor(_this.path.style.fillColor, 0.7, '#00F');
          }
          path.bevel = true;
          path.draw(ctx);
          textElement = new _this.view.draw.Text(new _this.view.draw.Point(0, 0), text);
          dx = rect.width - textElement.bounds().width;
          dy = rect.height - _this.view.opts.textHeight;
          textElement.translate({
            x: rect.x + Math.ceil(dx / 2),
            y: rect.y + Math.ceil(dy)
          });
          return textElement.draw(ctx);
        };
      })(this);
      if (this.model.buttons.addButton) {
        drawButton('+', this.addButtonRect, ctx);
      }
      if (this.model.buttons.subtractButton) {
        return drawButton('-', this.subtractButtonRect, ctx);
      }
    };

    BlockViewNode.prototype.shouldAddTab = function() {
      var ref;
      if ((this.model.parent != null) && this.view.hasViewNodeFor(this.model.parent) && !(this.model.parent.type === 'document' && this.model.parent.opts.roundedSingletons && this.model.start.prev === this.model.parent.start && this.model.end.next === this.model.parent.end)) {
        return ((ref = this.model.parent) != null ? ref.type : void 0) !== 'socket';
      } else {
        return !(indexOf.call(this.model.classes, 'mostly-value') >= 0 || indexOf.call(this.model.classes, 'value-only') >= 0);
      }
    };

    BlockViewNode.prototype.computePath = function() {
      var height, lastLine, lastRect, multilineBounds, multilineChild, start, top;
      BlockViewNode.__super__.computePath.apply(this, arguments);
      lastLine = this.bounds.length - 1;
      lastRect = this.bounds[lastLine];
      start = lastRect.x + lastRect.width - this.extraWidth;
      top = lastRect.y + lastRect.height / 2 - this.view.opts.buttonHeight / 2;
      if (this.multilineChildrenData[lastLine] === MULTILINE_END) {
        multilineChild = this.lineChildren[lastLine][0];
        multilineBounds = this.view.getViewNodeFor(multilineChild.child).bounds[lastLine - multilineChild.startLine];
        if (this.lineChildren[lastLine].length > 1) {
          height = multilineBounds.bottom() - lastRect.y;
          top = lastRect.y + height / 2 - this.view.opts.buttonHeight / 2;
        } else {
          height = lastRect.bottom() - multilineBounds.bottom();
          top = multilineBounds.bottom() + height / 2 - this.view.opts.buttonHeight / 2;
        }
      }
      if (this.model.buttons.addButton) {
        this.addButtonRect = new this.view.draw.Rectangle(start, top, this.view.opts.buttonWidth, this.view.opts.buttonHeight);
        start += this.view.opts.buttonWidth + this.view.opts.buttonPadding;
      }
      if (this.model.buttons.subtractButton) {
        return this.subtractButtonRect = new this.view.draw.Rectangle(start, top, this.view.opts.buttonWidth, this.view.opts.buttonHeight);
      }
    };

    BlockViewNode.prototype.computeOwnPath = function() {
      BlockViewNode.__super__.computeOwnPath.apply(this, arguments);
      this.path.style.fillColor = this.view.getColor(this.model.color);
      this.path.style.strokeColor = '#888';
      this.path.bevel = true;
      return this.path;
    };

    BlockViewNode.prototype.computeOwnDropArea = function() {
      var destinationBounds, highlightAreaPoints, j, lastBoundsLeft, lastBoundsRight, len1, parentViewNode, point;
      if (this.carriageArrow === CARRIAGE_ARROW_INDENT) {
        parentViewNode = this.view.getViewNodeFor(this.model.parent);
        destinationBounds = parentViewNode.bounds[1];
        this.dropPoint = new this.view.draw.Point(destinationBounds.x, destinationBounds.y);
        lastBoundsLeft = destinationBounds.x;
        lastBoundsRight = destinationBounds.right();
      } else if (this.carriageArrow === CARRIAGE_ARROW_SIDEALONG) {
        parentViewNode = this.view.getViewNodeFor(this.model.parent);
        destinationBounds = parentViewNode.bounds[1];
        this.dropPoint = new this.view.draw.Point(destinationBounds.x, this.bounds[this.lineLength - 1].bottom() + this.view.opts.padding);
        lastBoundsLeft = destinationBounds.x;
        lastBoundsRight = this.bounds[this.lineLength - 1].right();
      } else {
        this.dropPoint = new this.view.draw.Point(this.bounds[this.lineLength - 1].x, this.bounds[this.lineLength - 1].bottom());
        lastBoundsLeft = this.bounds[this.lineLength - 1].x;
        lastBoundsRight = this.bounds[this.lineLength - 1].right();
      }
      this.highlightArea = new this.view.draw.Path();
      highlightAreaPoints = [];
      highlightAreaPoints.push(new this.view.draw.Point(lastBoundsLeft, this.dropPoint.y - this.view.opts.highlightAreaHeight / 2 + this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBoundsLeft + this.view.opts.bevelClip, this.dropPoint.y - this.view.opts.highlightAreaHeight / 2));
      this.addTabReverse(highlightAreaPoints, new this.view.draw.Point(lastBoundsLeft + this.view.opts.tabOffset, this.dropPoint.y - this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBoundsRight - this.view.opts.bevelClip, this.dropPoint.y - this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBoundsRight, this.dropPoint.y - this.view.opts.highlightAreaHeight / 2 + this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBoundsRight, this.dropPoint.y + this.view.opts.highlightAreaHeight / 2 - this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBoundsRight - this.view.opts.bevelClip, this.dropPoint.y + this.view.opts.highlightAreaHeight / 2));
      this.addTab(highlightAreaPoints, new this.view.draw.Point(lastBoundsLeft + this.view.opts.tabOffset, this.dropPoint.y + this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBoundsLeft + this.view.opts.bevelClip, this.dropPoint.y + this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBoundsLeft, this.dropPoint.y + this.view.opts.highlightAreaHeight / 2 - this.view.opts.bevelClip));
      for (j = 0, len1 = highlightAreaPoints.length; j < len1; j++) {
        point = highlightAreaPoints[j];
        this.highlightArea.push(point);
      }
      this.highlightArea.style.lineWidth = 1;
      this.highlightArea.style.strokeColor = '#ff0';
      return this.highlightArea.style.fillColor = '#ff0';
    };

    return BlockViewNode;

  })(ContainerViewNode);

  SocketViewNode = (function(superClass) {
    extend(SocketViewNode, superClass);

    function SocketViewNode() {
      SocketViewNode.__super__.constructor.apply(this, arguments);
    }

    SocketViewNode.prototype.shouldAddTab = NO;

    SocketViewNode.prototype.isInvisibleSocket = function() {
      var ref;
      return '' === this.model.emptyString && ((ref = this.model.start) != null ? ref.next : void 0) === this.model.end;
    };

    SocketViewNode.prototype.computeMinDimensions = function() {
      var dimension, j, len1, ref;
      if (this.computedVersion === this.model.version) {
        return null;
      }
      SocketViewNode.__super__.computeMinDimensions.apply(this, arguments);
      this.minDistanceToBase[0].above = Math.max(this.minDistanceToBase[0].above, this.view.opts.textHeight + this.view.opts.textPadding);
      this.minDistanceToBase[0].below = Math.max(this.minDistanceToBase[0].below, this.view.opts.textPadding);
      this.minDimensions[0].height = this.minDistanceToBase[0].above + this.minDistanceToBase[0].below;
      ref = this.minDimensions;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        dimension = ref[j];
        dimension.width = Math.max(dimension.width, this.isInvisibleSocket() ? this.view.opts.invisibleSocketWidth : this.view.opts.minSocketWidth);
        if (this.model.hasDropdown() && this.view.opts.showDropdowns) {
          dimension.width += helper.DROPDOWN_ARROW_WIDTH;
        }
      }
      return null;
    };

    SocketViewNode.prototype.computeBoundingBoxX = function(left, line) {
      return SocketViewNode.__super__.computeBoundingBoxX.call(this, left, line, (this.model.hasDropdown() && this.view.opts.showDropdowns ? helper.DROPDOWN_ARROW_WIDTH : 0));
    };

    SocketViewNode.prototype.computeGlue = function() {
      var view;
      if (this.computedVersion === this.model.version && !this.changedBoundingBox) {
        return this.glue;
      }
      if (this.model.start.next.type === 'blockStart') {
        view = this.view.getViewNodeFor(this.model.start.next.container);
        return this.glue = view.computeGlue();
      } else {
        return SocketViewNode.__super__.computeGlue.apply(this, arguments);
      }
    };

    SocketViewNode.prototype.computeOwnPath = function() {
      var ref, view;
      if (this.computedVersion === this.model.version && !this.changedBoundingBox) {
        return this.path;
      }
      if (this.model.start.next.type === 'blockStart') {
        view = this.view.getViewNodeFor(this.model.start.next.container);
        this.path = view.computeOwnPath().clone();
      } else {
        SocketViewNode.__super__.computeOwnPath.apply(this, arguments);
      }
      if ('' === this.model.emptyString && ((ref = this.model.start) != null ? ref.next : void 0) === this.model.end) {
        this.path.style.fillColor = this.path.style.strokeColor = 'rgba(0,0,0,0)';
      } else {
        this.path.style.fillColor = this.path.style.strokeColor = '#FFF';
      }
      return this.path;
    };

    SocketViewNode.prototype.drawSelf = function(ctx) {
      SocketViewNode.__super__.drawSelf.apply(this, arguments);
      if (this.model.hasDropdown() && this.view.opts.showDropdowns) {
        ctx.beginPath();
        ctx.fillStyle = DROP_TRIANGLE_COLOR;
        ctx.moveTo(this.bounds[0].x + helper.DROPDOWN_ARROW_PADDING, this.bounds[0].y + (this.bounds[0].height - DROPDOWN_ARROW_HEIGHT) / 2);
        ctx.lineTo(this.bounds[0].x + helper.DROPDOWN_ARROW_WIDTH - helper.DROPDOWN_ARROW_PADDING, this.bounds[0].y + (this.bounds[0].height - DROPDOWN_ARROW_HEIGHT) / 2);
        ctx.lineTo(this.bounds[0].x + helper.DROPDOWN_ARROW_WIDTH / 2, this.bounds[0].y + (this.bounds[0].height + DROPDOWN_ARROW_HEIGHT) / 2);
        return ctx.fill();
      }
    };

    SocketViewNode.prototype.computeOwnDropArea = function() {
      if (this.model.start.next.type === 'blockStart') {
        return this.dropArea = this.highlightArea = null;
      } else {
        this.dropPoint = this.bounds[0].upperLeftCorner();
        this.highlightArea = this.path.clone();
        this.highlightArea.noclip = true;
        this.highlightArea.style.strokeColor = '#FF0';
        return this.highlightArea.style.lineWidth = this.view.opts.padding;
      }
    };

    return SocketViewNode;

  })(ContainerViewNode);

  IndentViewNode = (function(superClass) {
    extend(IndentViewNode, superClass);

    function IndentViewNode() {
      IndentViewNode.__super__.constructor.apply(this, arguments);
      this.lastFirstChildren = [];
      this.lastLastChildren = [];
    }

    IndentViewNode.prototype.computeOwnPath = function() {
      return this.path = new this.view.draw.Path();
    };

    IndentViewNode.prototype.computeChildren = function() {
      var childObj, childRef, childView, j, l, len1, len2, len3, m, ref, ref1, ref2;
      IndentViewNode.__super__.computeChildren.apply(this, arguments);
      if (!(arrayEq(this.lineChildren[0], this.lastFirstChildren) && arrayEq(this.lineChildren[this.lineLength - 1], this.lastLastChildren))) {
        ref = this.children;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          childObj = ref[j];
          childView = this.view.getViewNodeFor(childObj.child);
          if (childView.topLineSticksToBottom || childView.bottomLineSticksToTop) {
            childView.invalidate = true;
          }
          if (childView.lineLength === 1) {
            childView.topLineSticksToBottom = childView.bottomLineSticksToTop = false;
          }
        }
      }
      ref1 = this.lineChildren[0];
      for (l = 0, len2 = ref1.length; l < len2; l++) {
        childRef = ref1[l];
        childView = this.view.getViewNodeFor(childRef.child);
        if (!childView.topLineSticksToBottom) {
          childView.invalidate = true;
        }
        childView.topLineSticksToBottom = true;
      }
      ref2 = this.lineChildren[this.lineChildren.length - 1];
      for (m = 0, len3 = ref2.length; m < len3; m++) {
        childRef = ref2[m];
        childView = this.view.getViewNodeFor(childRef.child);
        if (!childView.bottomLineSticksToTop) {
          childView.invalidate = true;
        }
        childView.bottomLineSticksToTop = true;
      }
      return this.lineLength;
    };

    IndentViewNode.prototype.computeMinDimensions = function() {
      var j, len1, line, ref, results, size;
      IndentViewNode.__super__.computeMinDimensions.apply(this, arguments);
      ref = this.minDimensions.slice(1);
      results = [];
      for (line = j = 0, len1 = ref.length; j < len1; line = ++j) {
        size = ref[line];
        if (size.width === 0) {
          results.push(size.width = this.view.opts.emptyLineWidth);
        }
      }
      return results;
    };

    IndentViewNode.prototype.drawSelf = function() {
      return null;
    };

    IndentViewNode.prototype.computeOwnDropArea = function() {
      var highlightAreaPoints, j, lastBounds, len1, point;
      lastBounds = new this.view.draw.NoRectangle();
      if (this.model.start.next.type === 'newline') {
        this.dropPoint = this.bounds[1].upperLeftCorner();
        lastBounds.copy(this.bounds[1]);
      } else {
        this.dropPoint = this.bounds[0].upperLeftCorner();
        lastBounds.copy(this.bounds[0]);
      }
      lastBounds.width = Math.max(lastBounds.width, this.view.opts.indentDropAreaMinWidth);
      this.highlightArea = new this.view.draw.Path();
      highlightAreaPoints = [];
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.x, lastBounds.y - this.view.opts.highlightAreaHeight / 2 + this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.x + this.view.opts.bevelClip, lastBounds.y - this.view.opts.highlightAreaHeight / 2));
      this.addTabReverse(highlightAreaPoints, new this.view.draw.Point(lastBounds.x + this.view.opts.tabOffset, lastBounds.y - this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.right() - this.view.opts.bevelClip, lastBounds.y - this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.right(), lastBounds.y - this.view.opts.highlightAreaHeight / 2 + this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.right(), lastBounds.y + this.view.opts.highlightAreaHeight / 2 - this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.right() - this.view.opts.bevelClip, lastBounds.y + this.view.opts.highlightAreaHeight / 2));
      this.addTab(highlightAreaPoints, new this.view.draw.Point(lastBounds.x + this.view.opts.tabOffset, lastBounds.y + this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.x + this.view.opts.bevelClip, lastBounds.y + this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.x, lastBounds.y + this.view.opts.highlightAreaHeight / 2 - this.view.opts.bevelClip));
      for (j = 0, len1 = highlightAreaPoints.length; j < len1; j++) {
        point = highlightAreaPoints[j];
        this.highlightArea.push(point);
      }
      this.highlightArea.style.lineWidth = 1;
      this.highlightArea.style.strokeColor = '#ff0';
      return this.highlightArea.style.fillColor = '#ff0';
    };

    return IndentViewNode;

  })(ContainerViewNode);

  DocumentViewNode = (function(superClass) {
    extend(DocumentViewNode, superClass);

    function DocumentViewNode() {
      DocumentViewNode.__super__.constructor.apply(this, arguments);
    }

    DocumentViewNode.prototype.computeOwnPath = function() {
      return this.path = new this.view.draw.Path();
    };

    DocumentViewNode.prototype.computeOwnDropArea = function() {
      var highlightAreaPoints, j, lastBounds, len1, point;
      this.dropPoint = this.bounds[0].upperLeftCorner();
      this.highlightArea = new this.view.draw.Path();
      highlightAreaPoints = [];
      lastBounds = new this.view.draw.NoRectangle();
      lastBounds.copy(this.bounds[0]);
      lastBounds.width = Math.max(lastBounds.width, this.view.opts.indentDropAreaMinWidth);
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.x, lastBounds.y - this.view.opts.highlightAreaHeight / 2 + this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.x + this.view.opts.bevelClip, lastBounds.y - this.view.opts.highlightAreaHeight / 2));
      this.addTabReverse(highlightAreaPoints, new this.view.draw.Point(lastBounds.x + this.view.opts.tabOffset, lastBounds.y - this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.right() - this.view.opts.bevelClip, lastBounds.y - this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.right(), lastBounds.y - this.view.opts.highlightAreaHeight / 2 + this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.right(), lastBounds.y + this.view.opts.highlightAreaHeight / 2 - this.view.opts.bevelClip));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.right() - this.view.opts.bevelClip, lastBounds.y + this.view.opts.highlightAreaHeight / 2));
      this.addTab(highlightAreaPoints, new this.view.draw.Point(lastBounds.x + this.view.opts.tabOffset, lastBounds.y + this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.x + this.view.opts.bevelClip, lastBounds.y + this.view.opts.highlightAreaHeight / 2));
      highlightAreaPoints.push(new this.view.draw.Point(lastBounds.x, lastBounds.y + this.view.opts.highlightAreaHeight / 2 - this.view.opts.bevelClip));
      for (j = 0, len1 = highlightAreaPoints.length; j < len1; j++) {
        point = highlightAreaPoints[j];
        this.highlightArea.push(point);
      }
      this.highlightArea.style.fillColor = '#ff0';
      this.highlightArea.style.strokeColor = '#ff0';
      return null;
    };

    return DocumentViewNode;

  })(ContainerViewNode);

  TextViewNode = (function(superClass) {
    extend(TextViewNode, superClass);

    function TextViewNode(model1, view1) {
      this.model = model1;
      this.view = view1;
      TextViewNode.__super__.constructor.apply(this, arguments);
    }

    TextViewNode.prototype.computeChildren = function() {
      this.multilineChildrenData = [NO_MULTILINE];
      return this.lineLength = 1;
    };

    TextViewNode.prototype.computeMinDimensions = function() {
      var height;
      if (this.computedVersion === this.model.version) {
        return null;
      }
      this.textElement = new this.view.draw.Text(new this.view.draw.Point(0, 0), this.model.value);
      height = this.view.opts.textHeight;
      this.minDimensions[0] = new this.view.draw.Size(this.textElement.bounds().width, height);
      this.minDistanceToBase[0] = {
        above: height,
        below: 0
      };
      return null;
    };

    TextViewNode.prototype.computeBoundingBoxX = function(left, line) {
      this.textElement.point.x = left;
      return TextViewNode.__super__.computeBoundingBoxX.apply(this, arguments);
    };

    TextViewNode.prototype.computeBoundingBoxY = function(top, line) {
      this.textElement.point.y = top;
      return TextViewNode.__super__.computeBoundingBoxY.apply(this, arguments);
    };

    TextViewNode.prototype.drawSelf = function(ctx, style) {
      if (style == null) {
        style = {};
      }
      if (!style.noText) {
        this.textElement.draw(ctx);
      }
      return null;
    };

    TextViewNode.prototype.debugDimensions = function(x, y, line, ctx) {
      var oldPoint;
      ctx.globalAlpha = 1;
      oldPoint = this.textElement.point;
      this.textElement.point = new this.view.draw.Point(x, y);
      this.textElement.draw(ctx);
      this.textElement.point = oldPoint;
      return ctx.globalAlpha = 0.1;
    };

    TextViewNode.prototype.debugAllBoundingBoxes = function(ctx) {
      ctx.globalAlpha = 1;
      this.computeOwnPath();
      this.textElement.draw(ctx);
      return ctx.globalAlpha = 0.1;
    };

    return TextViewNode;

  })(GenericViewNode);

  return View;

})();

toRGB = function(hex) {
  var b, c, g, r;
  if (hex.length === 4) {
    hex = ((function() {
      var j, len1, results;
      results = [];
      for (j = 0, len1 = hex.length; j < len1; j++) {
        c = hex[j];
        results.push(c + c);
      }
      return results;
    })()).join('').slice(1);
  }
  r = parseInt(hex.slice(1, 3), 16);
  g = parseInt(hex.slice(3, 5), 16);
  b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

zeroPad = function(str, len) {
  if (str.length < len) {
    return ((function() {
      var j, ref, ref1, results;
      results = [];
      for (j = ref = str.length, ref1 = len; ref <= ref1 ? j < ref1 : j > ref1; ref <= ref1 ? j++ : j--) {
        results.push('0');
      }
      return results;
    })()).join('') + str;
  } else {
    return str;
  }
};

twoDigitHex = function(n) {
  return zeroPad(Math.round(n).toString(16), 2);
};

toHex = function(rgb) {
  var k;
  return '#' + ((function() {
    var j, len1, results;
    results = [];
    for (j = 0, len1 = rgb.length; j < len1; j++) {
      k = rgb[j];
      results.push(twoDigitHex(k));
    }
    return results;
  })()).join('');
};

avgColor = function(a, factor, b) {
  var i, k, newRGB;
  a = toRGB(a);
  b = toRGB(b);
  newRGB = (function() {
    var j, len1, results;
    results = [];
    for (i = j = 0, len1 = a.length; j < len1; i = ++j) {
      k = a[i];
      results.push(a[i] * factor + b[i] * (1 - factor));
    }
    return results;
  })();
  return toHex(newRGB);
};


},{"./draw.coffee":27,"./helper.coffee":28,"./model.coffee":31}],35:[function(require,module,exports){
// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke and various contributors and
// released under an MIT license. The Unicode regexps (for identifiers
// and whitespace) were taken from [Esprima](http://esprima.org) by
// Ariya Hidayat.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/marijnh/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object") return mod(exports); // CommonJS
  if (typeof define == "function" && define.amd) return define(["exports"], mod); // AMD
  mod(root.acorn || (root.acorn = {})); // Plain browser env
})(this, function(exports) {
  "use strict";

  exports.version = "0.7.1";

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api], with the caveat that inline XML is not recognized.
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  var options, input, inputLen, sourceFile;

  exports.parse = function(inpt, opts) {
    input = String(inpt); inputLen = input.length;
    setOptions(opts);
    initTokenState();
    return parseTopLevel(options.program);
  };

  // A second optional argument can be given to further configure
  // the parser process. These options are recognized:

  var defaultOptions = exports.defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must
    // be either 3, or 5, or 6. This influences support for strict
    // mode, the set of reserved words, support for getters and
    // setters and other features.
    ecmaVersion: 5,
    // Turn on `strictSemicolons` to prevent the parser from doing
    // automatic semicolon insertion.
    strictSemicolons: false,
    // When `allowTrailingCommas` is false, the parser will not allow
    // trailing commas in array and object literals.
    allowTrailingCommas: true,
    // By default, reserved words are not enforced. Enable
    // `forbidReserved` to enforce them. When this option has the
    // value "everywhere", reserved words and keywords can also not be
    // used as property names.
    forbidReserved: false,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokenize() returns. Note that you are not
    // allowed to call the parser from the callback—that will
    // corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // By default, source location line numbers are one-based.
    // This can be configured with this option.
    line: 1
  };

  function setOptions(opts) {
    options = opts || {};
    for (var opt in defaultOptions) if (!has(options, opt))
      options[opt] = defaultOptions[opt];
    sourceFile = options.sourceFile || null;

    isKeyword = options.ecmaVersion >= 6 ? isEcma6Keyword : isEcma5AndLessKeyword;
  }

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  var getLineInfo = exports.getLineInfo = function(input, offset) {
    for (var line = options.line, cur = 0;;) {
      lineBreak.lastIndex = cur;
      var match = lineBreak.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else break;
    }
    return {line: line, column: offset - cur};
  };

  var getCurrentToken = function () {
    var token = {
      type: tokType,
      value: tokVal,
      start: tokStart,
      end: tokEnd
    };
    if (options.locations) {
      token.startLoc = tokStartLoc;
      token.endLoc = tokEndLoc;
    }
    return token;
  };

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenize` export provides an interface to the tokenizer.
  // Because the tokenizer is optimized for being efficiently used by
  // the Acorn parser itself, this interface is somewhat crude and not
  // very modular. Performing another parse or call to `tokenize` will
  // reset the internal state, and invalidate existing tokenizers.

  exports.tokenize = function(inpt, opts) {
    input = String(inpt); inputLen = input.length;
    setOptions(opts);
    initTokenState();

    function getToken(forceRegexp) {
      lastEnd = tokEnd;
      readToken(forceRegexp);
      return getCurrentToken();
    }
    getToken.jumpTo = function(pos, reAllowed) {
      tokPos = pos;
      if (options.locations) {
        tokCurLine = options.line;
        tokLineStart = lineBreak.lastIndex = 0;
        var match;
        while ((match = lineBreak.exec(input)) && match.index < pos) {
          ++tokCurLine;
          tokLineStart = match.index + match[0].length;
        }
      }
      tokRegexpAllowed = reAllowed;
      skipSpace();
    };
    return getToken;
  };

  // State is kept in (closure-)global variables. We already saw the
  // `options`, `input`, and `inputLen` variables above.

  // The current position of the tokenizer in the input.

  var tokPos;

  // The start and end offsets of the current token.

  var tokStart, tokEnd;

  // When `options.locations` is true, these hold objects
  // containing the tokens start and end line/column pairs.

  var tokStartLoc, tokEndLoc;

  // The type and value of the current token. Token types are objects,
  // named by variables against which they can be compared, and
  // holding properties that describe them (indicating, for example,
  // the precedence of an infix operator, and the original name of a
  // keyword token). The kind of value that's held in `tokVal` depends
  // on the type of the token. For literals, it is the literal value,
  // for operators, the operator name, and so on.

  var tokType, tokVal;

  // Internal state for the tokenizer. To distinguish between division
  // operators and regular expressions, it remembers whether the last
  // token was one that is allowed to be followed by an expression.
  // (If it is, a slash is probably a regexp, if it isn't it's a
  // division operator. See the `parseStatement` function for a
  // caveat.)

  var tokRegexpAllowed;

  // When `options.locations` is true, these are used to keep
  // track of the current line, and know when a new line has been
  // entered.

  var tokCurLine, tokLineStart;

  // These store the position of the previous token, which is useful
  // when finishing a node and assigning its `end` position.

  var lastStart, lastEnd, lastEndLoc;

  // This is the parser's state. `inFunction` is used to reject
  // `return` statements outside of functions, `inGenerator` to
  // reject `yield`s outside of generators, `labels` to verify
  // that `break` and `continue` have somewhere to jump to, and
  // `strict` indicates whether strict mode is on.

  var inFunction, inGenerator, labels, strict;

  // This counter is used for checking that arrow expressions did
  // not contain nested parentheses in argument list.

  var metParenL;

  // This is used by parser for detecting if it's inside ES6
  // Template String. If it is, it should treat '$' as prefix before
  // '{expression}' and everything else as string literals.

  var inTemplate;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  function raise(pos, message) {
    var loc = getLineInfo(input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = tokPos;
    throw err;
  }

  // Reused empty array added for node fields that are always empty.

  var empty = [];

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // These are the general types. The `type` property is only used to
  // make them recognizeable when debugging.

  var _num = {type: "num"}, _regexp = {type: "regexp"}, _string = {type: "string"};
  var _name = {type: "name"}, _eof = {type: "eof"};

  // Keyword tokens. The `keyword` property (also used in keyword-like
  // operators) indicates that the token originated from an
  // identifier-like word, which is used when parsing property names.
  //
  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var _break = {keyword: "break"}, _case = {keyword: "case", beforeExpr: true}, _catch = {keyword: "catch"};
  var _continue = {keyword: "continue"}, _debugger = {keyword: "debugger"}, _default = {keyword: "default"};
  var _do = {keyword: "do", isLoop: true}, _else = {keyword: "else", beforeExpr: true};
  var _finally = {keyword: "finally"}, _for = {keyword: "for", isLoop: true}, _function = {keyword: "function"};
  var _if = {keyword: "if"}, _return = {keyword: "return", beforeExpr: true}, _switch = {keyword: "switch"};
  var _throw = {keyword: "throw", beforeExpr: true}, _try = {keyword: "try"}, _var = {keyword: "var"};
  var _let = {keyword: "let"}, _const = {keyword: "const"};
  var _while = {keyword: "while", isLoop: true}, _with = {keyword: "with"}, _new = {keyword: "new", beforeExpr: true};
  var _this = {keyword: "this"};
  var _class = {keyword: "class"}, _extends = {keyword: "extends", beforeExpr: true};
  var _export = {keyword: "export"}, _import = {keyword: "import"};
  var _yield = {keyword: "yield", beforeExpr: true};

  // The keywords that denote values.

  var _null = {keyword: "null", atomValue: null}, _true = {keyword: "true", atomValue: true};
  var _false = {keyword: "false", atomValue: false};

  // Some keywords are treated as regular operators. `in` sometimes
  // (when parsing `for`) needs to be tested against specifically, so
  // we assign a variable name to it for quick comparing.

  var _in = {keyword: "in", binop: 7, beforeExpr: true};

  // Map keyword names to token types.

  var keywordTypes = {"break": _break, "case": _case, "catch": _catch,
                      "continue": _continue, "debugger": _debugger, "default": _default,
                      "do": _do, "else": _else, "finally": _finally, "for": _for,
                      "function": _function, "if": _if, "return": _return, "switch": _switch,
                      "throw": _throw, "try": _try, "var": _var, "let": _let, "const": _const,
                      "while": _while, "with": _with,
                      "null": _null, "true": _true, "false": _false, "new": _new, "in": _in,
                      "instanceof": {keyword: "instanceof", binop: 7, beforeExpr: true}, "this": _this,
                      "typeof": {keyword: "typeof", prefix: true, beforeExpr: true},
                      "void": {keyword: "void", prefix: true, beforeExpr: true},
                      "delete": {keyword: "delete", prefix: true, beforeExpr: true},
                      "class": _class, "extends": _extends,
                      "export": _export, "import": _import, "yield": _yield};

  // Punctuation token types. Again, the `type` property is purely for debugging.

  var _bracketL = {type: "[", beforeExpr: true}, _bracketR = {type: "]"}, _braceL = {type: "{", beforeExpr: true};
  var _braceR = {type: "}"}, _parenL = {type: "(", beforeExpr: true}, _parenR = {type: ")"};
  var _comma = {type: ",", beforeExpr: true}, _semi = {type: ";", beforeExpr: true};
  var _colon = {type: ":", beforeExpr: true}, _dot = {type: "."}, _ellipsis = {type: "..."}, _question = {type: "?", beforeExpr: true};
  var _arrow = {type: "=>", beforeExpr: true}, _bquote = {type: "`"}, _dollarBraceL = {type: "${", beforeExpr: true};

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator. `isUpdate` specifies that the node produced by
  // the operator should be of type UpdateExpression rather than
  // simply UnaryExpression (`++` and `--`).
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  var _slash = {binop: 10, beforeExpr: true}, _eq = {isAssign: true, beforeExpr: true};
  var _assign = {isAssign: true, beforeExpr: true};
  var _incDec = {postfix: true, prefix: true, isUpdate: true}, _prefix = {prefix: true, beforeExpr: true};
  var _logicalOR = {binop: 1, beforeExpr: true};
  var _logicalAND = {binop: 2, beforeExpr: true};
  var _bitwiseOR = {binop: 3, beforeExpr: true};
  var _bitwiseXOR = {binop: 4, beforeExpr: true};
  var _bitwiseAND = {binop: 5, beforeExpr: true};
  var _equality = {binop: 6, beforeExpr: true};
  var _relational = {binop: 7, beforeExpr: true};
  var _bitShift = {binop: 8, beforeExpr: true};
  var _plusMin = {binop: 9, prefix: true, beforeExpr: true};
  var _modulo = {binop: 10, beforeExpr: true};

  // '*' may be multiply or have special meaning in ES6
  var _star = {binop: 10, beforeExpr: true};

  // Provide access to the token types for external users of the
  // tokenizer.

  exports.tokTypes = {bracketL: _bracketL, bracketR: _bracketR, braceL: _braceL, braceR: _braceR,
                      parenL: _parenL, parenR: _parenR, comma: _comma, semi: _semi, colon: _colon,
                      dot: _dot, ellipsis: _ellipsis, question: _question, slash: _slash, eq: _eq,
                      name: _name, eof: _eof, num: _num, regexp: _regexp, string: _string,
                      arrow: _arrow, bquote: _bquote, dollarBraceL: _dollarBraceL};
  for (var kw in keywordTypes) exports.tokTypes["_" + kw] = keywordTypes[kw];

  // This is a trick taken from Esprima. It turns out that, on
  // non-Chrome browsers, to check whether a string is in a set, a
  // predicate containing a big ugly `switch` statement is faster than
  // a regular expression, and on Chrome the two are about on par.
  // This function uses `eval` (non-lexical) to produce such a
  // predicate from a space-separated string of words.
  //
  // It starts by sorting the words by length.

  function makePredicate(words) {
    words = words.split(" ");
    var f = "", cats = [];
    out: for (var i = 0; i < words.length; ++i) {
      for (var j = 0; j < cats.length; ++j)
        if (cats[j][0].length == words[i].length) {
          cats[j].push(words[i]);
          continue out;
        }
      cats.push([words[i]]);
    }
    function compareTo(arr) {
      if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
      f += "switch(str){";
      for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
      f += "return true}return false;";
    }

    // When there are more than three length categories, an outer
    // switch first dispatches on the lengths, to save on comparisons.

    if (cats.length > 3) {
      cats.sort(function(a, b) {return b.length - a.length;});
      f += "switch(str.length){";
      for (var i = 0; i < cats.length; ++i) {
        var cat = cats[i];
        f += "case " + cat[0].length + ":";
        compareTo(cat);
      }
      f += "}";

    // Otherwise, simply generate a flat `switch` statement.

    } else {
      compareTo(words);
    }
    return new Function("str", f);
  }

  // The ECMAScript 3 reserved word list.

  var isReservedWord3 = makePredicate("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile");

  // ECMAScript 5 reserved words.

  var isReservedWord5 = makePredicate("class enum extends super const export import");

  // The additional reserved words in strict mode.

  var isStrictReservedWord = makePredicate("implements interface let package private protected public static yield");

  // The forbidden variable names in strict mode.

  var isStrictBadIdWord = makePredicate("eval arguments");

  // And the keywords.

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var isEcma5AndLessKeyword = makePredicate(ecma5AndLessKeywords);

  var isEcma6Keyword = makePredicate(ecma5AndLessKeywords + " let const class extends export import yield");

  var isKeyword = isEcma5AndLessKeyword;

  // ## Character categories

  // Big ugly regular expressions that match characters in the
  // whitespace, identifier, and identifier-start categories. These
  // are only applied when a character is found to actually have a
  // code point above 128.
  // Generated by `tools/generate-identifier-regex.js`.

  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
  var nonASCIIidentifierChars = "\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19B0-\u19C0\u19C8\u19C9\u19D0-\u19D9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA620-\uA629\uA66F\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F1\uA900-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F";
  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // Whether a single character denotes a newline.

  var newline = /[\n\r\u2028\u2029]/;

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;

  // Test whether a given character code starts an identifier.

  var isIdentifierStart = exports.isIdentifierStart = function(code) {
    if (code < 65) return code === 36;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123)return true;
    return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  };

  // Test whether a given character is part of an identifier.

  var isIdentifierChar = exports.isIdentifierChar = function(code) {
    if (code < 48) return code === 36;
    if (code < 58) return true;
    if (code < 65) return false;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123)return true;
    return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  };

  // ## Tokenizer

  // These are used when `options.locations` is on, for the
  // `tokStartLoc` and `tokEndLoc` properties.

  function Position() {
    this.line = tokCurLine;
    this.column = tokPos - tokLineStart;
  }

  // Reset the token state. Used at the start of a parse.

  function initTokenState() {
    tokCurLine = options.line;
    tokPos = tokLineStart = 0;
    tokRegexpAllowed = true;
    metParenL = 0;
    inTemplate = false;
    skipSpace();
  }

  // Called at the end of every token. Sets `tokEnd`, `tokVal`, and
  // `tokRegexpAllowed`, and skips the space after the token, so that
  // the next one's `tokStart` will point at the right position.

  function finishToken(type, val, shouldSkipSpace) {
    tokEnd = tokPos;
    if (options.locations) tokEndLoc = new Position;
    tokType = type;
    if (shouldSkipSpace !== false) skipSpace();
    tokVal = val;
    tokRegexpAllowed = type.beforeExpr;
    if (options.onToken) {
      options.onToken(getCurrentToken());
    }
  }

  function skipBlockComment() {
    var startLoc = options.onComment && options.locations && new Position;
    var start = tokPos, end = input.indexOf("*/", tokPos += 2);
    if (end === -1) raise(tokPos - 2, "Unterminated comment");
    tokPos = end + 2;
    if (options.locations) {
      lineBreak.lastIndex = start;
      var match;
      while ((match = lineBreak.exec(input)) && match.index < tokPos) {
        ++tokCurLine;
        tokLineStart = match.index + match[0].length;
      }
    }
    if (options.onComment)
      options.onComment(true, input.slice(start + 2, end), start, tokPos,
                        startLoc, options.locations && new Position);
  }

  function skipLineComment() {
    var start = tokPos;
    var startLoc = options.onComment && options.locations && new Position;
    var ch = input.charCodeAt(tokPos+=2);
    while (tokPos < inputLen && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
      ++tokPos;
      ch = input.charCodeAt(tokPos);
    }
    if (options.onComment)
      options.onComment(false, input.slice(start + 2, tokPos), start, tokPos,
                        startLoc, options.locations && new Position);
  }

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  function skipSpace() {
    while (tokPos < inputLen) {
      var ch = input.charCodeAt(tokPos);
      if (ch === 32) { // ' '
        ++tokPos;
      } else if (ch === 13) {
        ++tokPos;
        var next = input.charCodeAt(tokPos);
        if (next === 10) {
          ++tokPos;
        }
        if (options.locations) {
          ++tokCurLine;
          tokLineStart = tokPos;
        }
      } else if (ch === 10 || ch === 8232 || ch === 8233) {
        ++tokPos;
        if (options.locations) {
          ++tokCurLine;
          tokLineStart = tokPos;
        }
      } else if (ch > 8 && ch < 14) {
        ++tokPos;
      } else if (ch === 47) { // '/'
        var next = input.charCodeAt(tokPos + 1);
        if (next === 42) { // '*'
          skipBlockComment();
        } else if (next === 47) { // '/'
          skipLineComment();
        } else break;
      } else if (ch === 160) { // '\xa0'
        ++tokPos;
      } else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++tokPos;
      } else {
        break;
      }
    }
  }

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  // The `forceRegexp` parameter is used in the one case where the
  // `tokRegexpAllowed` trick does not work. See `parseStatement`.

  function readToken_dot() {
    var next = input.charCodeAt(tokPos + 1);
    if (next >= 48 && next <= 57) return readNumber(true);
    var next2 = input.charCodeAt(tokPos + 2);
    if (options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      tokPos += 3;
      return finishToken(_ellipsis);
    } else {
      ++tokPos;
      return finishToken(_dot);
    }
  }

  function readToken_slash() { // '/'
    var next = input.charCodeAt(tokPos + 1);
    if (tokRegexpAllowed) {++tokPos; return readRegexp();}
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_slash, 1);
  }

  function readToken_mult_modulo(code) { // '%*'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(code === 42 ? _star : _modulo, 1);
  }

  function readToken_pipe_amp(code) { // '|&'
    var next = input.charCodeAt(tokPos + 1);
    if (next === code) return finishOp(code === 124 ? _logicalOR : _logicalAND, 2);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(code === 124 ? _bitwiseOR : _bitwiseAND, 1);
  }

  function readToken_caret() { // '^'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_bitwiseXOR, 1);
  }

  function readToken_plus_min(code) { // '+-'
    var next = input.charCodeAt(tokPos + 1);
    if (next === code) {
      if (next == 45 && input.charCodeAt(tokPos + 2) == 62 &&
          newline.test(input.slice(lastEnd, tokPos))) {
        // A `-->` line comment
        tokPos += 3;
        skipLineComment();
        skipSpace();
        return readToken();
      }
      return finishOp(_incDec, 2);
    }
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_plusMin, 1);
  }

  function readToken_lt_gt(code) { // '<>'
    var next = input.charCodeAt(tokPos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && input.charCodeAt(tokPos + 2) === 62 ? 3 : 2;
      if (input.charCodeAt(tokPos + size) === 61) return finishOp(_assign, size + 1);
      return finishOp(_bitShift, size);
    }
    if (next == 33 && code == 60 && input.charCodeAt(tokPos + 2) == 45 &&
        input.charCodeAt(tokPos + 3) == 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      tokPos += 4;
      skipLineComment();
      skipSpace();
      return readToken();
    }
    if (next === 61)
      size = input.charCodeAt(tokPos + 2) === 61 ? 3 : 2;
    return finishOp(_relational, size);
  }

  function readToken_eq_excl(code) { // '=!', '=>'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_equality, input.charCodeAt(tokPos + 2) === 61 ? 3 : 2);
    if (code === 61 && next === 62 && options.ecmaVersion >= 6) { // '=>'
      tokPos += 2;
      return finishToken(_arrow);
    }
    return finishOp(code === 61 ? _eq : _prefix, 1);
  }

  // Get token inside ES6 template (special rules work there).

  function getTemplateToken(code) {
    // '`' and '${' have special meanings, but they should follow
    // string (can be empty)
    if (tokType === _string) {
      if (code === 96) { // '`'
        ++tokPos;
        return finishToken(_bquote);
      } else
      if (code === 36 && input.charCodeAt(tokPos + 1) === 123) { // '${'
        tokPos += 2;
        return finishToken(_dollarBraceL);
      }
    }

    if (code === 125) { // '}'
      ++tokPos;
      return finishToken(_braceR, undefined, false);
    }

    // anything else is considered string literal
    return readTmplString();
  }

  function getTokenFromCode(code) {
    switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return readToken_dot();

    // Punctuation tokens.
    case 40: ++tokPos; return finishToken(_parenL);
    case 41: ++tokPos; return finishToken(_parenR);
    case 59: ++tokPos; return finishToken(_semi);
    case 44: ++tokPos; return finishToken(_comma);
    case 91: ++tokPos; return finishToken(_bracketL);
    case 93: ++tokPos; return finishToken(_bracketR);
    case 123: ++tokPos; return finishToken(_braceL);
    case 125: ++tokPos; return finishToken(_braceR);
    case 58: ++tokPos; return finishToken(_colon);
    case 63: ++tokPos; return finishToken(_question);

    case 96: // '`'
      if (options.ecmaVersion >= 6) {
        ++tokPos;
        return finishToken(_bquote, undefined, false);
      }

    case 48: // '0'
      var next = input.charCodeAt(tokPos + 1);
      if (next === 120 || next === 88) return readRadixNumber(16); // '0x', '0X' - hex number
      if (options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) return readRadixNumber(8); // '0o', '0O' - octal number
        if (next === 98 || next === 66) return readRadixNumber(2); // '0b', '0B' - binary number
      }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return readNumber(false);

    // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return readString(code);

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47: // '/'
      return readToken_slash();

    case 37: case 42: // '%*'
      return readToken_mult_modulo(code);

    case 124: case 38: // '|&'
      return readToken_pipe_amp(code);

    case 94: // '^'
      return readToken_caret();

    case 43: case 45: // '+-'
      return readToken_plus_min(code);

    case 60: case 62: // '<>'
      return readToken_lt_gt(code);

    case 61: case 33: // '=!'
      return readToken_eq_excl(code);

    case 126: // '~'
      return finishOp(_prefix, 1);
    }

    return false;
  }

  function readToken(forceRegexp) {
    if (!forceRegexp) tokStart = tokPos;
    else tokPos = tokStart + 1;
    if (options.locations) tokStartLoc = new Position;
    if (forceRegexp) return readRegexp();
    if (tokPos >= inputLen) return finishToken(_eof);

    var code = input.charCodeAt(tokPos);

    if (inTemplate) return getTemplateToken(code);

    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code) || code === 92 /* '\' */) return readWord();

    var tok = getTokenFromCode(code);

    if (tok === false) {
      // If we are here, we either found a non-ASCII identifier
      // character, or something that's entirely disallowed.
      var ch = String.fromCharCode(code);
      if (ch === "\\" || nonASCIIidentifierStart.test(ch)) return readWord();
      raise(tokPos, "Unexpected character '" + ch + "'");
    }
    return tok;
  }

  function finishOp(type, size) {
    var str = input.slice(tokPos, tokPos + size);
    tokPos += size;
    finishToken(type, str);
  }

  // Parse a regular expression. Some context-awareness is necessary,
  // since a '/' inside a '[]' set does not end the expression.

  function readRegexp() {
    var content = "", escaped, inClass, start = tokPos;
    for (;;) {
      if (tokPos >= inputLen) raise(start, "Unterminated regular expression");
      var ch = input.charAt(tokPos);
      if (newline.test(ch)) raise(start, "Unterminated regular expression");
      if (!escaped) {
        if (ch === "[") inClass = true;
        else if (ch === "]" && inClass) inClass = false;
        else if (ch === "/" && !inClass) break;
        escaped = ch === "\\";
      } else escaped = false;
      ++tokPos;
    }
    var content = input.slice(start, tokPos);
    ++tokPos;
    // Need to use `readWord1` because '\uXXXX' sequences are allowed
    // here (don't ask).
    var mods = readWord1();
    if (mods && !/^[gmsiy]*$/.test(mods)) raise(start, "Invalid regular expression flag");
    try {
      var value = new RegExp(content, mods);
    } catch (e) {
      if (e instanceof SyntaxError) raise(start, "Error parsing regular expression: " + e.message);
      raise(e);
    }
    return finishToken(_regexp, value);
  }

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  function readInt(radix, len) {
    var start = tokPos, total = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      var code = input.charCodeAt(tokPos), val;
      if (code >= 97) val = code - 97 + 10; // a
      else if (code >= 65) val = code - 65 + 10; // A
      else if (code >= 48 && code <= 57) val = code - 48; // 0-9
      else val = Infinity;
      if (val >= radix) break;
      ++tokPos;
      total = total * radix + val;
    }
    if (tokPos === start || len != null && tokPos - start !== len) return null;

    return total;
  }

  function readRadixNumber(radix) {
    tokPos += 2; // 0x
    var val = readInt(radix);
    if (val == null) raise(tokStart + 2, "Expected number in radix " + radix);
    if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");
    return finishToken(_num, val);
  }

  // Read an integer, octal integer, or floating-point number.

  function readNumber(startsWithDot) {
    var start = tokPos, isFloat = false, octal = input.charCodeAt(tokPos) === 48;
    if (!startsWithDot && readInt(10) === null) raise(start, "Invalid number");
    if (input.charCodeAt(tokPos) === 46) {
      ++tokPos;
      readInt(10);
      isFloat = true;
    }
    var next = input.charCodeAt(tokPos);
    if (next === 69 || next === 101) { // 'eE'
      next = input.charCodeAt(++tokPos);
      if (next === 43 || next === 45) ++tokPos; // '+-'
      if (readInt(10) === null) raise(start, "Invalid number");
      isFloat = true;
    }
    if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");

    var str = input.slice(start, tokPos), val;
    if (isFloat) val = parseFloat(str);
    else if (!octal || str.length === 1) val = parseInt(str, 10);
    else if (/[89]/.test(str) || strict) raise(start, "Invalid number");
    else val = parseInt(str, 8);
    return finishToken(_num, val);
  }

  // Read a string value, interpreting backslash-escapes.

  function readCodePoint() {
    var ch = input.charCodeAt(tokPos), code;

    if (ch === 123) {
      if (options.ecmaVersion < 6) unexpected();
      ++tokPos;
      code = readHexChar(input.indexOf('}', tokPos) - tokPos);
      ++tokPos;
      if (code > 0x10FFFF) unexpected();
    } else {
      code = readHexChar(4);
    }

    // UTF-16 Encoding
    if (code <= 0xFFFF) {
      return String.fromCharCode(code);
    }
    var cu1 = ((code - 0x10000) >> 10) + 0xD800;
    var cu2 = ((code - 0x10000) & 1023) + 0xDC00;
    return String.fromCharCode(cu1, cu2);
  }

  function readString(quote) {
    ++tokPos;
    var out = "";
    for (;;) {
      if (tokPos >= inputLen) raise(tokStart, "Unterminated string constant");
      var ch = input.charCodeAt(tokPos);
      if (ch === quote) {
        ++tokPos;
        return finishToken(_string, out);
      }
      if (ch === 92) { // '\'
        out += readEscapedChar();
      } else {
        ++tokPos;
        if (newline.test(String.fromCharCode(ch))) {
          raise(tokStart, "Unterminated string constant");
        }
        out += String.fromCharCode(ch); // '\'
      }
    }
  }

  function readTmplString() {
    var out = "";
    for (;;) {
      if (tokPos >= inputLen) raise(tokStart, "Unterminated string constant");
      var ch = input.charCodeAt(tokPos);
      if (ch === 96 || ch === 36 && input.charCodeAt(tokPos + 1) === 123) // '`', '${'
        return finishToken(_string, out);
      if (ch === 92) { // '\'
        out += readEscapedChar();
      } else {
        ++tokPos;
        if (newline.test(String.fromCharCode(ch))) {
          if (ch === 13 && input.charCodeAt(tokPos) === 10) {
            ++tokPos;
            ch = 10;
          }
          if (options.locations) {
            ++tokCurLine;
            tokLineStart = tokPos;
          }
        }
        out += String.fromCharCode(ch); // '\'
      }
    }
  }

  // Used to read escaped characters

  function readEscapedChar() {
    var ch = input.charCodeAt(++tokPos);
    var octal = /^[0-7]+/.exec(input.slice(tokPos, tokPos + 3));
    if (octal) octal = octal[0];
    while (octal && parseInt(octal, 8) > 255) octal = octal.slice(0, -1);
    if (octal === "0") octal = null;
    ++tokPos;
    if (octal) {
      if (strict) raise(tokPos - 2, "Octal literal in strict mode");
      tokPos += octal.length - 1;
      return String.fromCharCode(parseInt(octal, 8));
    } else {
      switch (ch) {
        case 110: return "\n"; // 'n' -> '\n'
        case 114: return "\r"; // 'r' -> '\r'
        case 120: return String.fromCharCode(readHexChar(2)); // 'x'
        case 117: return readCodePoint(); // 'u'
        case 85: return String.fromCharCode(readHexChar(8)); // 'U'
        case 116: return "\t"; // 't' -> '\t'
        case 98: return "\b"; // 'b' -> '\b'
        case 118: return "\u000b"; // 'v' -> '\u000b'
        case 102: return "\f"; // 'f' -> '\f'
        case 48: return "\0"; // 0 -> '\0'
        case 13: if (input.charCodeAt(tokPos) === 10) ++tokPos; // '\r\n'
        case 10: // ' \n'
          if (options.locations) { tokLineStart = tokPos; ++tokCurLine; }
          return "";
        default: return String.fromCharCode(ch);
      }
    }
  }

  // Used to read character escape sequences ('\x', '\u', '\U').

  function readHexChar(len) {
    var n = readInt(16, len);
    if (n === null) raise(tokStart, "Bad character escape sequence");
    return n;
  }

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.

  var containsEsc;

  // Read an identifier, and return it as a string. Sets `containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Only builds up the word character-by-character when it actually
  // containeds an escape, as a micro-optimization.

  function readWord1() {
    containsEsc = false;
    var word, first = true, start = tokPos;
    for (;;) {
      var ch = input.charCodeAt(tokPos);
      if (isIdentifierChar(ch)) {
        if (containsEsc) word += input.charAt(tokPos);
        ++tokPos;
      } else if (ch === 92) { // "\"
        if (!containsEsc) word = input.slice(start, tokPos);
        containsEsc = true;
        if (input.charCodeAt(++tokPos) != 117) // "u"
          raise(tokPos, "Expecting Unicode escape sequence \\uXXXX");
        ++tokPos;
        var esc = readHexChar(4);
        var escStr = String.fromCharCode(esc);
        if (!escStr) raise(tokPos - 1, "Invalid Unicode escape");
        if (!(first ? isIdentifierStart(esc) : isIdentifierChar(esc)))
          raise(tokPos - 4, "Invalid Unicode escape");
        word += escStr;
      } else {
        break;
      }
      first = false;
    }
    return containsEsc ? word : input.slice(start, tokPos);
  }

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  function readWord() {
    var word = readWord1();
    var type = _name;
    if (!containsEsc && isKeyword(word))
      type = keywordTypes[word];
    return finishToken(type, word);
  }

  // ## Parser

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

  // ### Parser utilities

  // Continue to the next token.

  function next() {
    lastStart = tokStart;
    lastEnd = tokEnd;
    lastEndLoc = tokEndLoc;
    readToken();
  }

  // Enter strict mode. Re-reads the next token to please pedantic
  // tests ("use strict"; 010; -- should fail).

  function setStrict(strct) {
    strict = strct;
    tokPos = tokStart;
    if (options.locations) {
      while (tokPos < tokLineStart) {
        tokLineStart = input.lastIndexOf("\n", tokLineStart - 2) + 1;
        --tokCurLine;
      }
    }
    skipSpace();
    readToken();
  }

  // Start an AST node, attaching a start offset.

  function Node() {
    this.type = null;
    this.start = tokStart;
    this.end = null;
  }

  exports.Node = Node;

  function SourceLocation() {
    this.start = tokStartLoc;
    this.end = null;
    if (sourceFile !== null) this.source = sourceFile;
  }

  function startNode() {
    var node = new Node();
    if (options.locations)
      node.loc = new SourceLocation();
    if (options.directSourceFile)
      node.sourceFile = options.directSourceFile;
    if (options.ranges)
      node.range = [tokStart, 0];
    return node;
  }

  // Start a node whose start offset information should be based on
  // the start of another node. For example, a binary operator node is
  // only started after its left-hand side has already been parsed.

  function startNodeFrom(other) {
    var node = new Node();
    node.start = other.start;
    if (options.locations) {
      node.loc = new SourceLocation();
      node.loc.start = other.loc.start;
    }
    if (options.ranges)
      node.range = [other.range[0], 0];

    return node;
  }

  // Finish an AST node, adding `type` and `end` properties.

  function finishNode(node, type) {
    node.type = type;
    node.end = lastEnd;
    if (options.locations)
      node.loc.end = lastEndLoc;
    if (options.ranges)
      node.range[1] = lastEnd;
    return node;
  }

  // Test whether a statement node is the string literal `"use strict"`.

  function isUseStrict(stmt) {
    return options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" &&
      stmt.expression.type === "Literal" && stmt.expression.value === "use " + "strict";
  }

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  function eat(type) {
    if (tokType === type) {
      next();
      return true;
    } else {
      return false;
    }
  }

  // Test whether a semicolon can be inserted at the current position.

  function canInsertSemicolon() {
    return !options.strictSemicolons &&
      (tokType === _eof || tokType === _braceR || newline.test(input.slice(lastEnd, tokStart)));
  }

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  function semicolon() {
    if (!eat(_semi) && !canInsertSemicolon()) unexpected();
  }

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  function expect(type) {
    eat(type) || unexpected();
  }

  // Raise an unexpected token error.

  function unexpected(pos) {
    raise(pos != null ? pos : tokStart, "Unexpected token");
  }

  // Checks if hash object has a property.

  function has(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
  }
  // Convert existing expression atom to assignable pattern
  // if possible.

  function toAssignable(node, allowSpread, checkType) {
    if (options.ecmaVersion >= 6 && node) {
      switch (node.type) {
        case "Identifier":
        case "MemberExpression":
          break;

        case "ObjectExpression":
          node.type = "ObjectPattern";
          for (var i = 0; i < node.properties.length; i++) {
            var prop = node.properties[i];
            if (prop.kind !== "init") unexpected(prop.key.start);
            toAssignable(prop.value, false, checkType);
          }
          break;

        case "ArrayExpression":
          node.type = "ArrayPattern";
          for (var i = 0, lastI = node.elements.length - 1; i <= lastI; i++) {
            toAssignable(node.elements[i], i === lastI, checkType);
          }
          break;

        case "SpreadElement":
          if (allowSpread) {
            toAssignable(node.argument, false, checkType);
            checkSpreadAssign(node.argument);
          } else {
            unexpected(node.start);
          }
          break;

        default:
          if (checkType) unexpected(node.start);
      }
    }
    return node;
  }

  // Checks if node can be assignable spread argument.

  function checkSpreadAssign(node) {
    if (node.type !== "Identifier" && node.type !== "ArrayPattern")
      unexpected(node.start);
  }

  // Verify that argument names are not repeated, and it does not
  // try to bind the words `eval` or `arguments`.

  function checkFunctionParam(param, nameHash) {
    switch (param.type) {
      case "Identifier":
        if (isStrictReservedWord(param.name) || isStrictBadIdWord(param.name))
          raise(param.start, "Defining '" + param.name + "' in strict mode");
        if (has(nameHash, param.name))
          raise(param.start, "Argument name clash in strict mode");
        nameHash[param.name] = true;
        break;

      case "ObjectPattern":
        for (var i = 0; i < param.properties.length; i++)
          checkFunctionParam(param.properties[i].value, nameHash);
        break;

      case "ArrayPattern":
        for (var i = 0; i < param.elements.length; i++)
          checkFunctionParam(param.elements[i], nameHash);
        break;
    }
  }

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  function checkPropClash(prop, propHash) {
    if (prop.computed) return;
    var key = prop.key, name;
    switch (key.type) {
      case "Identifier": name = key.name; break;
      case "Literal": name = String(key.value); break;
      default: return;
    }
    var kind = prop.kind || "init", other;
    if (has(propHash, name)) {
      other = propHash[name];
      var isGetSet = kind !== "init";
      if ((strict || isGetSet) && other[kind] || !(isGetSet ^ other.init))
        raise(key.start, "Redefinition of property");
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  }

  // Verify that a node is an lval — something that can be assigned
  // to.

  function checkLVal(expr, isBinding) {
    switch (expr.type) {
      case "Identifier":
        if (strict && (isStrictBadIdWord(expr.name) || isStrictReservedWord(expr.name)))
          raise(expr.start, isBinding
            ? "Binding " + expr.name + " in strict mode"
            : "Assigning to " + expr.name + " in strict mode"
          );
        break;

      case "MemberExpression":
        if (!isBinding) break;

      case "ObjectPattern":
        for (var i = 0; i < expr.properties.length; i++)
          checkLVal(expr.properties[i].value, isBinding);
        break;

      case "ArrayPattern":
        for (var i = 0; i < expr.elements.length; i++) {
          var elem = expr.elements[i];
          if (elem) checkLVal(elem, isBinding);
        }
        break;

      case "SpreadElement":
        break;

      default:
        raise(expr.start, "Assigning to rvalue");
    }
  }

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  function parseTopLevel(program) {
    lastStart = lastEnd = tokPos;
    if (options.locations) lastEndLoc = new Position;
    inFunction = inGenerator = strict = null;
    labels = [];
    readToken();

    var node = program || startNode(), first = true;
    if (!program) node.body = [];
    while (tokType !== _eof) {
      var stmt = parseStatement();
      node.body.push(stmt);
      if (first && isUseStrict(stmt)) setStrict(true);
      first = false;
    }
    return finishNode(node, "Program");
  }

  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo);`, where looking at the previous token
  // does not help.

  function parseStatement() {
    if (tokType === _slash || tokType === _assign && tokVal == "/=")
      readToken(true);

    var starttype = tokType, node = startNode();

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case _break: case _continue: return parseBreakContinueStatement(node, starttype.keyword);
    case _debugger: return parseDebuggerStatement(node);
    case _do: return parseDoStatement(node);
    case _for: return parseForStatement(node);
    case _function: return parseFunctionStatement(node);
    case _class: return parseClass(node, true);
    case _if: return parseIfStatement(node);
    case _return: return parseReturnStatement(node);
    case _switch: return parseSwitchStatement(node);
    case _throw: return parseThrowStatement(node);
    case _try: return parseTryStatement(node);
    case _var: case _let: case _const: return parseVarStatement(node, starttype.keyword);
    case _while: return parseWhileStatement(node);
    case _with: return parseWithStatement(node);
    case _braceL: return parseBlock(); // no point creating a function for this
    case _semi: return parseEmptyStatement(node);
    case _export: return parseExport(node);
    case _import: return parseImport(node);

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
    default:
      var maybeName = tokVal, expr = parseExpression();
      if (starttype === _name && expr.type === "Identifier" && eat(_colon))
        return parseLabeledStatement(node, maybeName, expr);
      else return parseExpressionStatement(node, expr);
    }
  }

  function parseBreakContinueStatement(node, keyword) {
    var isBreak = keyword == "break";
    next();
    if (eat(_semi) || canInsertSemicolon()) node.label = null;
    else if (tokType !== _name) unexpected();
    else {
      node.label = parseIdent();
      semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    for (var i = 0; i < labels.length; ++i) {
      var lab = labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
        if (node.label && isBreak) break;
      }
    }
    if (i === labels.length) raise(node.start, "Unsyntactic " + keyword);
    return finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
  }

  function parseDebuggerStatement(node) {
    next();
    semicolon();
    return finishNode(node, "DebuggerStatement");
  }

  function parseDoStatement(node) {
    next();
    labels.push(loopLabel);
    node.body = parseStatement();
    labels.pop();
    expect(_while);
    node.test = parseParenExpression();
    semicolon();
    return finishNode(node, "DoWhileStatement");
  }

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  function parseForStatement(node) {
    next();
    labels.push(loopLabel);
    expect(_parenL);
    if (tokType === _semi) return parseFor(node, null);
    if (tokType === _var || tokType === _let) {
      var init = startNode(), varKind = tokType.keyword, isLet = tokType === _let;
      next();
      parseVar(init, true, varKind);
      finishNode(init, "VariableDeclaration");
      if ((tokType === _in || (tokType === _name && tokVal === "of")) && init.declarations.length === 1 &&
          !(isLet && init.declarations[0].init))
        return parseForIn(node, init);
      return parseFor(node, init);
    }
    var init = parseExpression(false, true);
    if (tokType === _in || (tokType === _name && tokVal === "of")) {
      checkLVal(init);
      return parseForIn(node, init);
    }
    return parseFor(node, init);
  }

  function parseFunctionStatement(node) {
    next();
    return parseFunction(node, true);
  }

  function parseIfStatement(node) {
    next();
    node.test = parseParenExpression();
    node.consequent = parseStatement();
    node.alternate = eat(_else) ? parseStatement() : null;
    return finishNode(node, "IfStatement");
  }

  function parseReturnStatement(node) {
    if (!inFunction && !options.allowReturnOutsideFunction)
      raise(tokStart, "'return' outside of function");
    next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (eat(_semi) || canInsertSemicolon()) node.argument = null;
    else { node.argument = parseExpression(); semicolon(); }
    return finishNode(node, "ReturnStatement");
  }

  function parseSwitchStatement(node) {
    next();
    node.discriminant = parseParenExpression();
    node.cases = [];
    expect(_braceL);
    labels.push(switchLabel);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    for (var cur, sawDefault; tokType != _braceR;) {
      if (tokType === _case || tokType === _default) {
        var isCase = tokType === _case;
        if (cur) finishNode(cur, "SwitchCase");
        node.cases.push(cur = startNode());
        cur.consequent = [];
        next();
        if (isCase) cur.test = parseExpression();
        else {
          if (sawDefault) raise(lastStart, "Multiple default clauses"); sawDefault = true;
          cur.test = null;
        }
        expect(_colon);
      } else {
        if (!cur) unexpected();
        cur.consequent.push(parseStatement());
      }
    }
    if (cur) finishNode(cur, "SwitchCase");
    next(); // Closing brace
    labels.pop();
    return finishNode(node, "SwitchStatement");
  }

  function parseThrowStatement(node) {
    next();
    if (newline.test(input.slice(lastEnd, tokStart)))
      raise(lastEnd, "Illegal newline after throw");
    node.argument = parseExpression();
    semicolon();
    return finishNode(node, "ThrowStatement");
  }

  function parseTryStatement(node) {
    next();
    node.block = parseBlock();
    node.handler = null;
    if (tokType === _catch) {
      var clause = startNode();
      next();
      expect(_parenL);
      clause.param = parseIdent();
      if (strict && isStrictBadIdWord(clause.param.name))
        raise(clause.param.start, "Binding " + clause.param.name + " in strict mode");
      expect(_parenR);
      clause.guard = null;
      clause.body = parseBlock();
      node.handler = finishNode(clause, "CatchClause");
    }
    node.guardedHandlers = empty;
    node.finalizer = eat(_finally) ? parseBlock() : null;
    if (!node.handler && !node.finalizer)
      raise(node.start, "Missing catch or finally clause");
    return finishNode(node, "TryStatement");
  }

  function parseVarStatement(node, kind) {
    next();
    parseVar(node, false, kind);
    semicolon();
    return finishNode(node, "VariableDeclaration");
  }

  function parseWhileStatement(node) {
    next();
    node.test = parseParenExpression();
    labels.push(loopLabel);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, "WhileStatement");
  }

  function parseWithStatement(node) {
    if (strict) raise(tokStart, "'with' in strict mode");
    next();
    node.object = parseParenExpression();
    node.body = parseStatement();
    return finishNode(node, "WithStatement");
  }

  function parseEmptyStatement(node) {
    next();
    return finishNode(node, "EmptyStatement");
  }

  function parseLabeledStatement(node, maybeName, expr) {
    for (var i = 0; i < labels.length; ++i)
      if (labels[i].name === maybeName) raise(expr.start, "Label '" + maybeName + "' is already declared");
    var kind = tokType.isLoop ? "loop" : tokType === _switch ? "switch" : null;
    labels.push({name: maybeName, kind: kind});
    node.body = parseStatement();
    labels.pop();
    node.label = expr;
    return finishNode(node, "LabeledStatement");
  }

  function parseExpressionStatement(node, expr) {
    node.expression = expr;
    semicolon();
    return finishNode(node, "ExpressionStatement");
  }

  // Used for constructs like `switch` and `if` that insist on
  // parentheses around their expression.

  function parseParenExpression() {
    expect(_parenL);
    var val = parseExpression();
    expect(_parenR);
    return val;
  }

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  function parseBlock(allowStrict) {
    var node = startNode(), first = true, strict = false, oldStrict;
    node.body = [];
    expect(_braceL);
    while (!eat(_braceR)) {
      var stmt = parseStatement();
      node.body.push(stmt);
      if (first && allowStrict && isUseStrict(stmt)) {
        oldStrict = strict;
        setStrict(strict = true);
      }
      first = false;
    }
    if (strict && !oldStrict) setStrict(false);
    return finishNode(node, "BlockStatement");
  }

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  function parseFor(node, init) {
    node.init = init;
    expect(_semi);
    node.test = tokType === _semi ? null : parseExpression();
    expect(_semi);
    node.update = tokType === _parenR ? null : parseExpression();
    expect(_parenR);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, "ForStatement");
  }

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  function parseForIn(node, init) {
    var type = tokType === _in ? "ForInStatement" : "ForOfStatement";
    next();
    node.left = init;
    node.right = parseExpression();
    expect(_parenR);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, type);
  }

  // Parse a list of variable declarations.

  function parseVar(node, noIn, kind) {
    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = startNode();
      decl.id = options.ecmaVersion >= 6 ? toAssignable(parseExprAtom()) : parseIdent();
      checkLVal(decl.id, true);
      decl.init = eat(_eq) ? parseExpression(true, noIn) : (kind === _const.keyword ? unexpected() : null);
      node.declarations.push(finishNode(decl, "VariableDeclarator"));
      if (!eat(_comma)) break;
    }
    return node;
  }

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The arguments are used to forbid comma
  // sequences (in argument lists, array literals, or object literals)
  // or the `in` operator (in for loops initalization expressions).

  function parseExpression(noComma, noIn) {
    var expr = parseMaybeAssign(noIn);
    if (!noComma && tokType === _comma) {
      var node = startNodeFrom(expr);
      node.expressions = [expr];
      while (eat(_comma)) node.expressions.push(parseMaybeAssign(noIn));
      return finishNode(node, "SequenceExpression");
    }
    return expr;
  }

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  function parseMaybeAssign(noIn) {
    var left = parseMaybeConditional(noIn);
    if (tokType.isAssign) {
      var node = startNodeFrom(left);
      node.operator = tokVal;
      node.left = tokType === _eq ? toAssignable(left) : left;
      checkLVal(left);
      next();
      node.right = parseMaybeAssign(noIn);
      return finishNode(node, "AssignmentExpression");
    }
    return left;
  }

  // Parse a ternary conditional (`?:`) operator.

  function parseMaybeConditional(noIn) {
    var expr = parseExprOps(noIn);
    if (eat(_question)) {
      var node = startNodeFrom(expr);
      node.test = expr;
      node.consequent = parseExpression(true);
      expect(_colon);
      node.alternate = parseExpression(true, noIn);
      return finishNode(node, "ConditionalExpression");
    }
    return expr;
  }

  // Start the precedence parser.

  function parseExprOps(noIn) {
    return parseExprOp(parseMaybeUnary(), -1, noIn);
  }

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  function parseExprOp(left, minPrec, noIn) {
    var prec = tokType.binop;
    if (prec != null && (!noIn || tokType !== _in)) {
      if (prec > minPrec) {
        var node = startNodeFrom(left);
        node.left = left;
        node.operator = tokVal;
        var op = tokType;
        next();
        node.right = parseExprOp(parseMaybeUnary(), prec, noIn);
        var exprNode = finishNode(node, (op === _logicalOR || op === _logicalAND) ? "LogicalExpression" : "BinaryExpression");
        return parseExprOp(exprNode, minPrec, noIn);
      }
    }
    return left;
  }

  // Parse unary operators, both prefix and postfix.

  function parseMaybeUnary() {
    if (tokType.prefix) {
      var node = startNode(), update = tokType.isUpdate;
      node.operator = tokVal;
      node.prefix = true;
      tokRegexpAllowed = true;
      next();
      node.argument = parseMaybeUnary();
      if (update) checkLVal(node.argument);
      else if (strict && node.operator === "delete" &&
               node.argument.type === "Identifier")
        raise(node.start, "Deleting local variable in strict mode");
      return finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    }
    var expr = parseExprSubscripts();
    while (tokType.postfix && !canInsertSemicolon()) {
      var node = startNodeFrom(expr);
      node.operator = tokVal;
      node.prefix = false;
      node.argument = expr;
      checkLVal(expr);
      next();
      expr = finishNode(node, "UpdateExpression");
    }
    return expr;
  }

  // Parse call, dot, and `[]`-subscript expressions.

  function parseExprSubscripts() {
    return parseSubscripts(parseExprAtom());
  }

  function parseSubscripts(base, noCalls) {
    if (eat(_dot)) {
      var node = startNodeFrom(base);
      node.object = base;
      node.property = parseIdent(true);
      node.computed = false;
      return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
    } else if (eat(_bracketL)) {
      var node = startNodeFrom(base);
      node.object = base;
      node.property = parseExpression();
      node.computed = true;
      expect(_bracketR);
      return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
    } else if (!noCalls && eat(_parenL)) {
      var node = startNodeFrom(base);
      node.callee = base;
      node.arguments = parseExprList(_parenR, false);
      return parseSubscripts(finishNode(node, "CallExpression"), noCalls);
    } else if (tokType === _bquote) {
      var node = startNodeFrom(base);
      node.tag = base;
      node.quasi = parseTemplate();
      return parseSubscripts(finishNode(node, "TaggedTemplateExpression"), noCalls);
    } return base;
  }

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  function parseExprAtom() {
    switch (tokType) {
    case _this:
      var node = startNode();
      next();
      return finishNode(node, "ThisExpression");

    case _yield:
      if (inGenerator) return parseYield();

    case _name:
      var id = parseIdent(tokType !== _name);
      if (eat(_arrow)) {
        return parseArrowExpression(startNodeFrom(id), [id]);
      }
      return id;

    case _num: case _string: case _regexp:
      var node = startNode();
      node.value = tokVal;
      node.raw = input.slice(tokStart, tokEnd);
      next();
      return finishNode(node, "Literal");

    case _null: case _true: case _false:
      var node = startNode();
      node.value = tokType.atomValue;
      node.raw = tokType.keyword;
      next();
      return finishNode(node, "Literal");

    case _parenL:
      var tokStartLoc1 = tokStartLoc, tokStart1 = tokStart, val, exprList;
      next();
      // check whether this is generator comprehension or regular expression
      if (options.ecmaVersion >= 6 && tokType === _for) {
        val = parseComprehension(startNode(), true);
      } else {
        var oldParenL = ++metParenL;
        if (tokType !== _parenR) {
          val = parseExpression();
          exprList = val.type === "SequenceExpression" ? val.expressions : [val];
        } else {
          exprList = [];
        }
        expect(_parenR);
        // if '=>' follows '(...)', convert contents to arguments
        if (metParenL === oldParenL && eat(_arrow)) {
          val = parseArrowExpression(startNode(), exprList);
        } else {
          // forbid '()' before everything but '=>'
          if (!val) unexpected(lastStart);
          // forbid '...' in sequence expressions
          if (options.ecmaVersion >= 6) {
            for (var i = 0; i < exprList.length; i++) {
              if (exprList[i].type === "SpreadElement") unexpected();
            }
          }
        }
      }
      val.start = tokStart1;
      val.end = lastEnd;
      if (options.locations) {
        val.loc.start = tokStartLoc1;
        val.loc.end = lastEndLoc;
      }
      if (options.ranges) {
        val.range = [tokStart1, lastEnd];
      }
      return val;

    case _bracketL:
      var node = startNode();
      next();
      // check whether this is array comprehension or regular array
      if (options.ecmaVersion >= 6 && tokType === _for) {
        return parseComprehension(node, false);
      }
      node.elements = parseExprList(_bracketR, true, true);
      return finishNode(node, "ArrayExpression");

    case _braceL:
      return parseObj();

    case _function:
      var node = startNode();
      next();
      return parseFunction(node, false);

    case _class:
      return parseClass(startNode(), false);

    case _new:
      return parseNew();

    case _ellipsis:
      return parseSpread();

    case _bquote:
      return parseTemplate();

    default:
      unexpected();
    }
  }

  // New's precedence is slightly tricky. It must allow its argument
  // to be a `[]` or dot subscript expression, but not a call — at
  // least, not without wrapping it in parentheses. Thus, it uses the

  function parseNew() {
    var node = startNode();
    next();
    node.callee = parseSubscripts(parseExprAtom(), true);
    if (eat(_parenL)) node.arguments = parseExprList(_parenR, false);
    else node.arguments = empty;
    return finishNode(node, "NewExpression");
  }

  // Parse spread element '...expr'

  function parseSpread() {
    var node = startNode();
    next();
    node.argument = parseExpression(true);
    return finishNode(node, "SpreadElement");
  }

  // Parse template expression.

  function parseTemplate() {
    var node = startNode();
    node.expressions = [];
    node.quasis = [];
    inTemplate = true;
    next();
    for (;;) {
      var elem = startNode();
      elem.value = {cooked: tokVal, raw: input.slice(tokStart, tokEnd)};
      elem.tail = false;
      next();
      node.quasis.push(finishNode(elem, "TemplateElement"));
      if (eat(_bquote)) { // '`', end of template
        elem.tail = true;
        break;
      }
      inTemplate = false;
      expect(_dollarBraceL);
      node.expressions.push(parseExpression());
      inTemplate = true;
      expect(_braceR);
    }
    inTemplate = false;
    return finishNode(node, "TemplateLiteral");
  }

  // Parse an object literal.

  function parseObj() {
    var node = startNode(), first = true, propHash = {};
    node.properties = [];
    next();
    while (!eat(_braceR)) {
      if (!first) {
        expect(_comma);
        if (options.allowTrailingCommas && eat(_braceR)) break;
      } else first = false;

      var prop = startNode(), isGenerator;
      if (options.ecmaVersion >= 6) {
        prop.method = false;
        prop.shorthand = false;
        isGenerator = eat(_star);
      }
      parsePropertyName(prop);
      if (eat(_colon)) {
        prop.value = parseExpression(true);
        prop.kind = "init";
      } else if (options.ecmaVersion >= 6 && tokType === _parenL) {
        prop.kind = "init";
        prop.method = true;
        prop.value = parseMethod(isGenerator);
      } else if (options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
                 (prop.key.name === "get" || prop.key.name === "set")) {
        if (isGenerator) unexpected();
        prop.kind = prop.key.name;
        parsePropertyName(prop);
        prop.value = parseMethod(false);
      } else if (options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
        prop.kind = "init";
        prop.value = prop.key;
        prop.shorthand = true;
      } else unexpected();

      checkPropClash(prop, propHash);
      node.properties.push(finishNode(prop, "Property"));
    }
    return finishNode(node, "ObjectExpression");
  }

  function parsePropertyName(prop) {
    if (options.ecmaVersion >= 6) {
      if (eat(_bracketL)) {
        prop.computed = true;
        prop.key = parseExpression();
        expect(_bracketR);
        return;
      } else {
        prop.computed = false;
      }
    }
    prop.key = (tokType === _num || tokType === _string) ? parseExprAtom() : parseIdent(true);
  }

  // Initialize empty function node.

  function initFunction(node) {
    node.id = null;
    node.params = [];
    if (options.ecmaVersion >= 6) {
      node.defaults = [];
      node.rest = null;
      node.generator = false;
    }
  }

  // Parse a function declaration or literal (depending on the
  // `isStatement` parameter).

  function parseFunction(node, isStatement, allowExpressionBody) {
    initFunction(node);
    if (options.ecmaVersion >= 6) {
      node.generator = eat(_star);
    }
    if (isStatement || tokType === _name) {
      node.id = parseIdent();
    }
    parseFunctionParams(node);
    parseFunctionBody(node, allowExpressionBody);
    return finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
  }

  // Parse object or class method.

  function parseMethod(isGenerator) {
    var node = startNode();
    initFunction(node);
    parseFunctionParams(node);
    var allowExpressionBody;
    if (options.ecmaVersion >= 6) {
      node.generator = isGenerator;
      allowExpressionBody = true;
    } else {
      allowExpressionBody = false;
    }
    parseFunctionBody(node, allowExpressionBody);
    return finishNode(node, "FunctionExpression");
  }

  // Parse arrow function expression with given parameters.

  function parseArrowExpression(node, params) {
    initFunction(node);

    var defaults = node.defaults, hasDefaults = false;

    for (var i = 0, lastI = params.length - 1; i <= lastI; i++) {
      var param = params[i];

      if (param.type === "AssignmentExpression" && param.operator === "=") {
        hasDefaults = true;
        params[i] = param.left;
        defaults.push(param.right);
      } else {
        toAssignable(param, i === lastI, true);
        defaults.push(null);
        if (param.type === "SpreadElement") {
          params.length--;
          node.rest = param.argument;
          break;
        }
      }
    }

    node.params = params;
    if (!hasDefaults) node.defaults = [];

    parseFunctionBody(node, true);
    return finishNode(node, "ArrowFunctionExpression");
  }

  // Parse function parameters.

  function parseFunctionParams(node) {
    var defaults = [], hasDefaults = false;

    expect(_parenL);
    for (;;) {
      if (eat(_parenR)) {
        break;
      } else if (options.ecmaVersion >= 6 && eat(_ellipsis)) {
        node.rest = toAssignable(parseExprAtom(), false, true);
        checkSpreadAssign(node.rest);
        expect(_parenR);
        break;
      } else {
        node.params.push(options.ecmaVersion >= 6 ? toAssignable(parseExprAtom(), false, true) : parseIdent());
        if (options.ecmaVersion >= 6 && tokType === _eq) {
          next();
          hasDefaults = true;
          defaults.push(parseExpression(true));
        }
        if (!eat(_comma)) {
          expect(_parenR);
          break;
        }
      }
    }

    if (hasDefaults) node.defaults = defaults;
  }

  // Parse function body and check parameters.

  function parseFunctionBody(node, allowExpression) {
    var isExpression = allowExpression && tokType !== _braceL;

    if (isExpression) {
      node.body = parseExpression(true);
      node.expression = true;
    } else {
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldInFunc = inFunction, oldInGen = inGenerator, oldLabels = labels;
      inFunction = true; inGenerator = node.generator; labels = [];
      node.body = parseBlock(true);
      node.expression = false;
      inFunction = oldInFunc; inGenerator = oldInGen; labels = oldLabels;
    }

    // If this is a strict mode function, verify that argument names
    // are not repeated, and it does not try to bind the words `eval`
    // or `arguments`.
    if (strict || !isExpression && node.body.body.length && isUseStrict(node.body.body[0])) {
      var nameHash = {};
      if (node.id)
        checkFunctionParam(node.id, nameHash);
      for (var i = 0; i < node.params.length; i++)
        checkFunctionParam(node.params[i], nameHash);
      if (node.rest)
        checkFunctionParam(node.rest, nameHash);
    }
  }

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  function parseClass(node, isStatement) {
    next();
    node.id = tokType === _name ? parseIdent() : isStatement ? unexpected() : null;
    node.superClass = eat(_extends) ? parseExpression() : null;
    var classBody = startNode(), methodHash = {}, staticMethodHash = {};
    classBody.body = [];
    expect(_braceL);
    while (!eat(_braceR)) {
      var method = startNode();
      if (tokType === _name && tokVal === "static") {
        next();
        method['static'] = true;
      } else {
        method['static'] = false;
      }
      var isGenerator = eat(_star);
      parsePropertyName(method);
      if (tokType === _name && !method.computed && method.key.type === "Identifier" &&
          (method.key.name === "get" || method.key.name === "set")) {
        if (isGenerator) unexpected();
        method.kind = method.key.name;
        parsePropertyName(method);
      } else {
        method.kind = "";
      }
      method.value = parseMethod(isGenerator);
      checkPropClash(method, method['static'] ? staticMethodHash : methodHash);
      classBody.body.push(finishNode(method, "MethodDefinition"));
      eat(_semi);
    }
    node.body = finishNode(classBody, "ClassBody");
    return finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
  }

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  function parseExprList(close, allowTrailingComma, allowEmpty) {
    var elts = [], first = true;
    while (!eat(close)) {
      if (!first) {
        expect(_comma);
        if (allowTrailingComma && options.allowTrailingCommas && eat(close)) break;
      } else first = false;

      if (allowEmpty && tokType === _comma) elts.push(null);
      else elts.push(parseExpression(true));
    }
    return elts;
  }

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  function parseIdent(liberal) {
    var node = startNode();
    if (liberal && options.forbidReserved == "everywhere") liberal = false;
    if (tokType === _name) {
      if (!liberal &&
          (options.forbidReserved &&
           (options.ecmaVersion === 3 ? isReservedWord3 : isReservedWord5)(tokVal) ||
           strict && isStrictReservedWord(tokVal)) &&
          input.slice(tokStart, tokEnd).indexOf("\\") == -1)
        raise(tokStart, "The keyword '" + tokVal + "' is reserved");
      node.name = tokVal;
    } else if (liberal && tokType.keyword) {
      node.name = tokType.keyword;
    } else {
      unexpected();
    }
    tokRegexpAllowed = false;
    next();
    return finishNode(node, "Identifier");
  }

  // Parses module export declaration.

  function parseExport(node) {
    next();
    // export var|const|let|function|class ...;
    if (tokType === _var || tokType === _const || tokType === _let || tokType === _function || tokType === _class) {
      node.declaration = parseStatement();
      node['default'] = false;
      node.specifiers = null;
      node.source = null;
    } else
    // export default ...;
    if (eat(_default)) {
      node.declaration = parseExpression(true);
      node['default'] = true;
      node.specifiers = null;
      node.source = null;
      semicolon();
    } else {
      // export * from '...'
      // export { x, y as z } [from '...']
      var isBatch = tokType === _star;
      node.declaration = null;
      node['default'] = false;
      node.specifiers = parseExportSpecifiers();
      if (tokType === _name && tokVal === "from") {
        next();
        node.source = tokType === _string ? parseExprAtom() : unexpected();
      } else {
        if (isBatch) unexpected();
        node.source = null;
      }
    }
    return finishNode(node, "ExportDeclaration");
  }

  // Parses a comma-separated list of module exports.

  function parseExportSpecifiers() {
    var nodes = [], first = true;
    if (tokType === _star) {
      // export * from '...'
      var node = startNode();
      next();
      nodes.push(finishNode(node, "ExportBatchSpecifier"));
    } else {
      // export { x, y as z } [from '...']
      expect(_braceL);
      while (!eat(_braceR)) {
        if (!first) {
          expect(_comma);
          if (options.allowTrailingCommas && eat(_braceR)) break;
        } else first = false;

        var node = startNode();
        node.id = parseIdent();
        if (tokType === _name && tokVal === "as") {
          next();
          node.name = parseIdent(true);
        } else {
          node.name = null;
        }
        nodes.push(finishNode(node, "ExportSpecifier"));
      }
    }
    return nodes;
  }

  // Parses import declaration.

  function parseImport(node) {
    next();
    // import '...';
    if (tokType === _string) {
      node.specifiers = [];
      node.source = parseExprAtom();
      node.kind = "";
    } else {
      node.specifiers = parseImportSpecifiers();
      if (tokType !== _name || tokVal !== "from") unexpected();
      next();
      node.source = tokType === _string ? parseExprAtom() : unexpected();
      // only for backward compatibility with Esprima's AST
      // (it doesn't support mixed default + named yet)
      node.kind = node.specifiers[0]['default'] ? "default" : "named";
    }
    return finishNode(node, "ImportDeclaration");
  }

  // Parses a comma-separated list of module imports.

  function parseImportSpecifiers() {
    var nodes = [], first = true;
    if (tokType === _star) {
      var node = startNode();
      next();
      if (tokType !== _name || tokVal !== "as") unexpected();
      next();
      node.name = parseIdent();
      checkLVal(node.name, true);
      nodes.push(finishNode(node, "ImportBatchSpecifier"));
      return nodes;
    }
    if (tokType === _name) {
      // import defaultObj, { x, y as z } from '...'
      var node = startNode();
      node.id = parseIdent();
      checkLVal(node.id, true);
      node.name = null;
      node['default'] = true;
      nodes.push(finishNode(node, "ImportSpecifier"));
      if (!eat(_comma)) return nodes;
    }
    expect(_braceL);
    while (!eat(_braceR)) {
      if (!first) {
        expect(_comma);
        if (options.allowTrailingCommas && eat(_braceR)) break;
      } else first = false;

      var node = startNode();
      node.id = parseIdent(true);
      if (tokType === _name && tokVal === "as") {
        next();
        node.name = parseIdent();
      } else {
        node.name = null;
      }
      checkLVal(node.name || node.id, true);
      node['default'] = false;
      nodes.push(finishNode(node, "ImportSpecifier"));
    }
    return nodes;
  }

  // Parses yield expression inside generator.

  function parseYield() {
    var node = startNode();
    next();
    if (eat(_semi) || canInsertSemicolon()) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = eat(_star);
      node.argument = parseExpression(true);
    }
    return finishNode(node, "YieldExpression");
  }

  // Parses array and generator comprehensions.

  function parseComprehension(node, isGenerator) {
    node.blocks = [];
    while (tokType === _for) {
      var block = startNode();
      next();
      expect(_parenL);
      block.left = toAssignable(parseExprAtom());
      checkLVal(block.left, true);
      if (tokType !== _name || tokVal !== "of") unexpected();
      next();
      // `of` property is here for compatibility with Esprima's AST
      // which also supports deprecated [for (... in ...) expr]
      block.of = true;
      block.right = parseExpression();
      expect(_parenR);
      node.blocks.push(finishNode(block, "ComprehensionBlock"));
    }
    node.filter = eat(_if) ? parseParenExpression() : null;
    node.body = parseExpression();
    expect(isGenerator ? _parenR : _bracketR);
    node.generator = isGenerator;
    return finishNode(node, "ComprehensionExpression");
  }

});

},{}],36:[function(require,module,exports){
(function (global){
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/*
 * QuadTree Implementation in JavaScript
 * @author: silflow <https://github.com/silflow>
 *
 * Usage:
 * To create a new empty Quadtree, do this:
 * var tree = QUAD.init(args)
 *
 * args = {
 *    // mandatory fields
 *    x : x coordinate
 *    y : y coordinate
 *    w : width
 *    h : height
 *
 *    // optional fields
 *    maxChildren : max children per node
 *    maxDepth : max depth of the tree
 *}
 *
 * API:
 * tree.insert() accepts arrays or single items
 * every item must have a .x, .y, .w, and .h property. if they don't, the tree will break.
 *
 * tree.retrieve(selector, callback) calls the callback for all objects that are in
 * the same region or overlapping.
 *
 * tree.clear() removes all items from the quadtree.
 */

var QUAD = {}; // global var for the quadtree

QUAD.init = function (args) {

    var node;
    var TOP_LEFT     = 0;
    var TOP_RIGHT    = 1;
    var BOTTOM_LEFT  = 2;
    var BOTTOM_RIGHT = 3;
    var PARENT       = 4;

    // assign default values
    args.maxChildren = args.maxChildren || 2;
    args.maxDepth = args.maxDepth || 4;

    /**
     * Node creator. You should never create a node manually. the algorithm takes
     * care of that for you.
     */
    node = function (x, y, w, h, depth, maxChildren, maxDepth) {

        var items = [], // holds all items
            nodes = []; // holds all child nodes

        // returns a fresh node object
        return {

            x : x, // top left point
            y : y, // top right point
            w : w, // width
            h : h, // height
            depth : depth, // depth level of the node

            /**
             * iterates all items that match the selector and invokes the supplied callback on them.
             */
            retrieve: function(item, callback, instance) {
                for (var i = 0; i < items.length; ++i) {
                   (instance) ? callback.call(instance, items[i]) : callback(items[i]); 
                }
                // check if node has subnodes
                if (nodes.length) {
                    // call retrieve on all matching subnodes
                    this.findOverlappingNodes(item, function(dir) {
                        nodes[dir].retrieve(item, callback, instance);
                    });
                }
            },

            /**
             * Adds a new Item to the node.
             *
             * If the node already has subnodes, the item gets pushed down one level.
             * If the item does not fit into the subnodes, it gets saved in the
             * "children"-array.
             *
             * If the maxChildren limit is exceeded after inserting the item,
             * the node gets divided and all items inside the "children"-array get
             * pushed down to the new subnodes.
             */
            insert : function (item) {

                var i;

                if (nodes.length) {
                    // get the node in which the item fits best
                    i = this.findInsertNode(item);
                    if (i === PARENT) {
                        // if the item does not fit, push it into the
                        // children array
                        items.push(item);
                    } else {
                        nodes[i].insert(item);
                    }
                } else {
                    items.push(item);
                    //divide the node if maxChildren is exceeded and maxDepth is not reached
                    if (items.length > maxChildren && this.depth < maxDepth) {
                        this.divide();
                    }
                }
            },

            /**
             * Find a node the item should be inserted in.
             */
            findInsertNode : function (item) {
                // left
                if (item.x + item.w < x + (w / 2)) {
                    if (item.y + item.h < y + (h / 2)) {
						return TOP_LEFT;
					}
                    if (item.y >= y + (h / 2)) {
						return BOTTOM_LEFT;
					}
                    return PARENT;
                }

                // right
                if (item.x >= x + (w / 2)) {
                    if (item.y + item.h < y + (h / 2)) {
						return TOP_RIGHT;
					}
                    if (item.y >= y + (h / 2)) {
						return BOTTOM_RIGHT;
					}
                    return PARENT;
                }

                return PARENT;
            },

            /**
             * Finds the regions the item overlaps with. See constants defined
             * above. The callback is called for every region the item overlaps.
             */
            findOverlappingNodes : function (item, callback) {
                // left
                if (item.x < x + (w / 2)) {
                    if (item.y < y + (h / 2)) {
						callback(TOP_LEFT);
					}
                    if (item.y + item.h >= y + h / 2) {
						callback(BOTTOM_LEFT);
					}
                }
                // right
                if (item.x + item.w >= x + (w / 2)) {
                    if (item.y < y + (h / 2)) {
						callback(TOP_RIGHT);
					}
                    if (item.y + item.h >= y + h / 2) {
						callback(BOTTOM_RIGHT);
					}
                }
            },

            /**
             * Divides the current node into four subnodes and adds them
             * to the nodes array of the current node. Then reinserts all
             * children.
             */
            divide : function () {
                var width, height, i, oldChildren;
                var childrenDepth = this.depth + 1;
                // set dimensions of the new nodes
                width = (w / 2);
                height = (h / 2);
                // create top left node
                nodes.push(node(this.x, this.y, width, height, childrenDepth, maxChildren, maxDepth));
                // create top right node
                nodes.push(node(this.x + width, this.y, width, height, childrenDepth, maxChildren, maxDepth));
                // create bottom left node
                nodes.push(node(this.x, this.y + height, width, height, childrenDepth, maxChildren, maxDepth));
                // create bottom right node
                nodes.push(node(this.x + width, this.y + height, width, height, childrenDepth, maxChildren, maxDepth));

                oldChildren = items;
                items = [];
                for (i = 0; i < oldChildren.length; i++) {
                    this.insert(oldChildren[i]);
                }
            },

            /**
             * Clears the node and all its subnodes.
             */
            clear : function () {
				var i;
                for (i = 0; i < nodes.length; i++) {
					nodes[i].clear();
				}
                items.length = 0;
                nodes.length = 0;
            },

            /*
             * convenience method: is not used in the core algorithm.
             * ---------------------------------------------------------
             * returns this nodes subnodes. this is usful if we want to do stuff
             * with the nodes, i.e. accessing the bounds of the nodes to draw them
             * on a canvas for debugging etc...
             */
            getNodes : function () {
                return nodes.length ? nodes : false;
            }
        };
    };

    return {

        root : (function () {
            return node(args.x, args.y, args.w, args.h, 0, args.maxChildren, args.maxDepth);
        }()),

        insert : function (item) {

            var len, i;

            if (item instanceof Array) {
                len = item.length;
                for (i = 0; i < len; i++) {
                    this.root.insert(item[i]);
                }

            } else {
                this.root.insert(item);
            }
        },

        retrieve : function (selector, callback, instance) {
            return this.root.retrieve(selector, callback, instance);
        },

        clear : function () {
            this.root.clear();
        }
    };
};

; browserify_shim__define__module__export__(typeof QUAD != "undefined" ? QUAD : window.QUAD);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[30])(30)
});