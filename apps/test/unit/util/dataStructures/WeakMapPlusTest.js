import {WeakMapPlus} from '@cdo/apps/util/dataStructures/WeakMapPlus';

describe('WeakMapPlus', function () {
  let populatedMap, emptyMap;
  const object = {};
  const undefinedValue = {value: 'UNDEFINED'};
  const objectValue = {value: 'OBJECT'};

  beforeEach(function () {
    emptyMap = new WeakMapPlus();
    populatedMap = new WeakMapPlus();
    populatedMap.set(undefined, undefinedValue);
    populatedMap.set(object, objectValue);
  });

  it('can be instantiated', function () {
    expect(emptyMap instanceof WeakMapPlus).toBeTruthy();
  });

  it('is derived from WeakMap', function () {
    expect(emptyMap instanceof WeakMap).toBeTruthy();
  });

  it('does not contain value for object key if never added', function () {
    expect(emptyMap.has({})).toBeFalsy();
    expect(populatedMap.has({})).toBeFalsy();
    expect(emptyMap.get({})).toBe(undefined);
    expect(populatedMap.get({})).toBe(undefined);
  });

  it('does allow setting of value for object key', function () {
    const newObject = {};
    emptyMap.set(newObject, objectValue);
    populatedMap.set(newObject, objectValue);
    expect(emptyMap.has(newObject)).toBeTruthy();
    expect(populatedMap.has(newObject)).toBeTruthy();
    expect(emptyMap.get(newObject)).toBe(objectValue);
    expect(populatedMap.get(newObject)).toBe(objectValue);
  });

  it('does allow setting of value for undefined key', function () {
    emptyMap.set(undefined, undefinedValue);
    expect(emptyMap.has(undefined)).toBeTruthy();
    expect(emptyMap.get(undefined)).toBe(undefinedValue);
  });

  it('does contain value for object key if previously added', function () {
    expect(populatedMap.has(object)).toBeTruthy();
    expect(populatedMap.get(object)).toBe(objectValue);
  });

  it('does allow deleting of value for previously defined object key', function () {
    populatedMap.delete(object);
    expect(populatedMap.has(object)).toBeFalsy();
    expect(populatedMap.get(object)).toBe(undefined);
  });

  it('does contain value for undefined key if previously added', function () {
    expect(populatedMap.has(undefined)).toBeTruthy();
    expect(populatedMap.get(undefined)).toBe(undefinedValue);
  });

  it('does allow deleting of value for previously defined object key', function () {
    populatedMap.delete(undefined);
    expect(populatedMap.has(undefined)).toBeFalsy();
    expect(populatedMap.get(undefined)).toBe(undefined);
  });

  it('does not contain value for undefined key if not previously added', function () {
    expect(emptyMap.has(undefined)).toBeFalsy();
    expect(emptyMap.get(undefined)).toBe(undefined);
  });
});
