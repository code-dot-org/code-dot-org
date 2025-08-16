/*
 * A small improvement to JavaScript/TypeScript's builtin `WeakMap` that adds support
 * for `undefined` as a key.  `WeakMap` does not support primitive keys other than
 * Symbol (and this only in later specs).
 **/
export class WeakMapPlus extends WeakMap {
  /*
   * WeakMap compatible key to swap for `undefined`.  Currently uses an object
   * but could use a symbol if our minimum supported browsers implement the spec
   * or if our transpilers (babel/tsc) can add a polyfill implementation .
   * See: https://github.com/tc39/ecma262/pull/2777
   **/
  static _undefinedKey = {};
  /*
   * Get a key that works with the native WeakMap implementation.  I.e. if
   * key is undefined, we'll use `_undefinedKey` as the key
   * which is an object (non-primative) and thus allowed as WeakMap key.
   **/
  getNativeKey(key) {
    return key ? key : WeakMapPlus._undefinedKey;
  }
  get(key) {
    return super.get(this.getNativeKey(key));
  }
  delete(key) {
    return super.delete(this.getNativeKey(key));
  }
  has(key) {
    return super.has(this.getNativeKey(key));
  }
  set(key, value) {
    return super.set(this.getNativeKey(key), value);
  }
}
