import {WeakMapPlus} from '@cdo/apps/util/dataStructures/WeakMapPlus';

import {assert} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    assert(emptyMap instanceof WeakMapPlus);
  });

  it('is derived from WeakMap', function () {
    assert(emptyMap instanceof WeakMap);
  });

  it('does not contain value for object key if never added', function () {
    assert(!emptyMap.has({}));
    assert(!populatedMap.has({}));
    assert(emptyMap.get({}) === undefined);
    assert(populatedMap.get({}) === undefined);
  });

  it('does allow setting of value for object key', function () {
    const newObject = {};
    emptyMap.set(newObject, objectValue);
    populatedMap.set(newObject, objectValue);
    assert(emptyMap.has(newObject));
    assert(populatedMap.has(newObject));
    assert(emptyMap.get(newObject) === objectValue);
    assert(populatedMap.get(newObject) === objectValue);
  });

  it('does allow setting of value for undefined key', function () {
    emptyMap.set(undefined, undefinedValue);
    assert(emptyMap.has(undefined));
    assert(emptyMap.get(undefined) === undefinedValue);
  });

  it('does contain value for object key if previously added', function () {
    assert(populatedMap.has(object));
    assert(populatedMap.get(object) === objectValue);
  });

  it('does allow deleting of value for previously defined object key', function () {
    populatedMap.delete(object);
    assert(!populatedMap.has(object));
    assert(populatedMap.get(object) === undefined);
  });

  it('does contain value for undefined key if previously added', function () {
    assert(populatedMap.has(undefined));
    assert(populatedMap.get(undefined) === undefinedValue);
  });

  it('does allow deleting of value for previously defined object key', function () {
    populatedMap.delete(undefined);
    assert(!populatedMap.has(undefined));
    assert(populatedMap.get(undefined) === undefined);
  });

  it('does not contain value for undefined key if not previously added', function () {
    assert(!emptyMap.has(undefined));
    assert(emptyMap.get(undefined) === undefined);
  });
});
