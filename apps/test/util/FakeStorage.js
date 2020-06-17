/**
 * Fake implementation of the storage interface, usable in place
 * of window.localStorage or window.sessionStorage during tests.
 */
export default class FakeStorage {
  getItem() {}
  setItem() {}
}
