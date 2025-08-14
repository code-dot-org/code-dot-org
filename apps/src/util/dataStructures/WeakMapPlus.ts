/*
 * A small improvement to JavaScript/TypeScript's builtin `WeakMap` that adds support
 * for `undefined` as a key.  `WeakMap` does not support primitive keys other than
 * Symbol (and this only in later specs).
 **/

export class WeakMapPlus<K extends WeakKey, V> extends WeakMap<K, V> {
  /*
   * WeakMap compatiple key to swap for `undefined`.  Currently uses an object
   * but could use a symbol if our minimum supported browsers implement the spec
   * or if our transpilers (babel/tsc) can add a polyfill implementation .
   * See: https://github.com/tc39/ecma262/pull/2777
   **/
  private static _undefinedKey = {};

  /*
   * Get a key that works with the native WeakMap implementation.  I.e. if
   * key is undefined, we'll use `_undefinedKey` as the key
   * which is an object (non-primative) and thus allowed as WeakMap key.
   **/

  private getNativeKey(key: K | undefined) {
    return key ? key : (WeakMapPlus._undefinedKey as K);
  }

  override get(key: K | undefined): V | undefined {
    return super.get(this.getNativeKey(key));
  }

  override delete(key: K | undefined): boolean {
    return super.delete(this.getNativeKey(key));
  }

  override has(key: K | undefined): boolean {
    return super.has(this.getNativeKey(key));
  }

  override set(key: K | undefined, value: V): this {
    return super.set(this.getNativeKey(key), value);
  }
}
