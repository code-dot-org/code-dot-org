import {
  parseJsonObject,
  serializeJsonObject,
  setJsonObjectValue,
} from '@cdo/apps/lab2/levelEditors/jsonUtils';

describe('jsonUtils', () => {
  describe('parseJsonObject', () => {
    it('treats a blank string as empty', () => {
      expect(parseJsonObject(null)).toEqual({});
      expect(parseJsonObject(undefined)).toEqual({});
      expect(parseJsonObject('  \n')).toEqual({});
    });

    it('parses a JSON object', () => {
      expect(parseJsonObject('{"hideSave": true}')).toEqual({hideSave: true});
    });

    it('returns null for invalid JSON or a non-object', () => {
      expect(parseJsonObject("{'datasets': ['zoo']}")).toBeNull();
      expect(parseJsonObject('["zoo"]')).toBeNull();
      expect(parseJsonObject('"zoo"')).toBeNull();
      expect(parseJsonObject('null')).toBeNull();
    });
  });

  describe('serializeJsonObject', () => {
    it('writes an empty object as an empty string', () => {
      expect(serializeJsonObject({})).toBe('');
    });

    it('pretty-prints with two spaces', () => {
      expect(serializeJsonObject({hideSave: true})).toBe(
        '{\n  "hideSave": true\n}'
      );
    });
  });

  describe('setJsonObjectValue', () => {
    it('keeps the position of a replaced key', () => {
      const object = setJsonObjectValue(
        {a: 1, trainer: 'knn', b: 2},
        'trainer',
        'x'
      );
      expect(Object.keys(object)).toEqual(['a', 'trainer', 'b']);
    });

    it('removes a key set to undefined', () => {
      expect(
        setJsonObjectValue({hideSave: true, a: 1}, 'hideSave', undefined)
      ).toEqual({a: 1});
    });

    it('does not change the original object', () => {
      const original = {a: 1};
      setJsonObjectValue(original, 'b', 2);
      expect(original).toEqual({a: 1});
    });
  });
});
