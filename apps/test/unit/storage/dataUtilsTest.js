import {
  isBlank,
  ignoreMissingValues,
  castValue,
  displayableValue,
  editableValue,
  isNumber,
  isBoolean,
  toBoolean,
} from '@cdo/apps/storage/dataBrowser/dataUtils';

describe('isBlank', () => {
  it('counts null, undefined, and empty string as blank', () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank('')).toBe(true);
  });

  it('counts other falsy values as not blank', () => {
    expect(isBlank(0)).toBe(false);
    expect(isBlank(false)).toBe(false);
    expect(isBlank(-1)).toBe(false);
    expect(isBlank(' ')).toBe(false);
  });
});

describe('ignoreMissingValues', () => {
  const records = [
    {category1: 'red', category2: 1, category3: 10},
    {category1: 'blue', category2: 1, category3: 20},
    {category1: 'red', category2: 3, category3: 10},
    {category1: undefined, category2: 4, category3: 10},
    {category1: 'red', category2: null, category3: 10},
    {category1: 'blue', category2: 1, category3: null},
    {category1: '', category2: 3, category3: 10},
    {category1: '', category2: null, category3: undefined},
  ];
  it('returns [] if there are no records', () => {
    expect(ignoreMissingValues([], [])).toEqual([]);
    expect(ignoreMissingValues(undefined, undefined)).toEqual([]);
  });
  it('returns all records if there are no columns to filter by', () => {
    expect(ignoreMissingValues(records, [])).toEqual(records);
    expect(ignoreMissingValues(records, undefined)).toEqual(records);
  });
  it('filters out records missing value for one column', () => {
    expect(ignoreMissingValues(records, ['category1'])).toEqual([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: 'red', category2: null, category3: 10},
      {category1: 'blue', category2: 1, category3: null},
    ]);

    expect(ignoreMissingValues(records, ['category2'])).toEqual([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: undefined, category2: 4, category3: 10},
      {category1: 'blue', category2: 1, category3: null},
      {category1: '', category2: 3, category3: 10},
    ]);

    expect(ignoreMissingValues(records, ['category3'])).toEqual([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: undefined, category2: 4, category3: 10},
      {category1: 'red', category2: null, category3: 10},
      {category1: '', category2: 3, category3: 10},
    ]);
  });

  it('filters out records missing a value for any provided column', () => {
    expect(ignoreMissingValues(records, ['category1', 'category2'])).toEqual([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: 'blue', category2: 1, category3: null},
    ]);
    expect(ignoreMissingValues(records, ['category2', 'category3'])).toEqual([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: undefined, category2: 4, category3: 10},
      {category1: '', category2: 3, category3: 10},
    ]);

    expect(
      ignoreMissingValues(records, ['category1', 'category2', 'category3'])
    ).toEqual([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
    ]);
  });
});

describe('isNumber', () => {
  it('detects valid numerical values', () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber('2')).toBe(true);
    expect(isNumber(0.3)).toBe(true);
    expect(isNumber('0.4')).toBe(true);
    expect(isNumber(1e5)).toBe(true);
    expect(isNumber('1e6')).toBe(true);
  });
  it('detects invalid numerical values', () => {
    expect(isNumber('123abc')).toBe(false);
    expect(isNumber('foo')).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(false)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber('NaN')).toBe(false);
  });
});

describe('isBoolean', () => {
  it('detects valid boolean values', () => {
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean('false')).toBe(true);
    expect(isBoolean('true')).toBe(true);
  });
  it('detects invalid boolean values', () => {
    expect(isBoolean(0)).toBe(false);
    expect(isBoolean(null)).toBe(false);
    expect(isBoolean('')).toBe(false);
    expect(isBoolean('foo')).toBe(false);
  });
});

describe('toBoolean', () => {
  it('recognizes valid boolean values', () => {
    expect(toBoolean(false)).toBe(false);
    expect(toBoolean(true)).toBe(true);
    expect(toBoolean('false')).toBe(false);
    expect(toBoolean('true')).toBe(true);
  });
  it('throws on invalid boolean values', done => {
    try {
      toBoolean('foo');
    } catch (e) {
      expect(e.message).toContain('Unable to convert to boolean');
      done();
    }
  });
});

describe('castValue', () => {
  it('converts boolean strings to booleans', () => {
    expect('true').not.toBe(true);
    expect(castValue('true')).toBe(true);
    expect(castValue('false')).toBe(false);
  });

  it('converts numerical strings to numbers', () => {
    expect('1').not.toBe(1);
    expect(castValue('1')).toBe(1);
    expect(castValue('0.2')).toBe(0.2);
    expect(castValue('1.2345e3')).toBe(1234.5);
  });

  it("converts 'null' to null", () => {
    expect(castValue('null')).toBeNull();
  });

  it('treats quoted strings as strings', () => {
    expect(castValue('"foo"')).toBe('foo');
    expect(castValue('"1"')).toBe('1');
    expect(castValue('"true"')).toBe('true');
  });

  it('does not allow objects or arrays', () => {
    expect(() => castValue('[1, 2, 3]')).toThrow(/Invalid entry type: object/);
    expect(() => castValue('{"a": 1, "b": 2, "c": 3}')).toThrow(
      /Invalid entry type: object/
    );
  });

  it('converts "undefined" to undefined', () => {
    expect(castValue('undefined')).toBeUndefined();
  });

  it('only allows unquoted strings if allowUnquotedStrings is true', () => {
    expect(castValue('abc', /* allowUnquotedStrings */ true)).toBe('abc');
    expect(() => castValue('abc', /* allowUnquotedStrings */ false)).toThrow(
      //      PhantomJS|Chrome
      /JSON Parse error|Unexpected token/
    );
  });
});

describe('editableValue', () => {
  it('doesnt put quotes around numbers', () => {
    expect(editableValue(1)).toBe('1');
  });

  it('puts quotes around numerical strings', () => {
    expect(editableValue('1')).toBe('"1"');
  });

  it('puts quotes around boolean strings', () => {
    expect(editableValue('true')).toBe('"true"');
  });

  it('doesnt puts quotes around other strings', () => {
    expect(editableValue('foo')).toBe('"foo"');
  });

  it('shows undefined', () => {
    expect(editableValue(undefined)).toBe('undefined');
  });
});

describe('what happens if you edit and then immediately save a value', () => {
  it('preserves numbers', () => {
    expect(castValue(editableValue(1))).toBe(1);
  });

  it('preserves booleans', () => {
    expect(castValue(editableValue(false))).toBe(false);
    expect(castValue(editableValue(true))).toBe(true);
  });

  it('preserves numerical strings', () => {
    expect(castValue(editableValue('2'))).toBe('2');
  });

  it('preserves boolean strings', () => {
    expect(castValue(editableValue('false'))).toBe('false');
    expect(castValue(editableValue('true'))).toBe('true');
  });

  it('preserves other strings', () => {
    expect(castValue(editableValue('foo'))).toBe('foo');
  });

  it('preserves null', () => {
    expect(castValue(editableValue(null))).toBeNull();
  });
});

describe('what we show based on what the user enters', () => {
  describe('when the user enters values without quotes', () => {
    it('shows numbers and booleans without quotes', () => {
      expect(displayableValue(castValue('1'))).toBe('1');
      expect(displayableValue(castValue('true'))).toBe('true');
    });
  });

  describe('when the user enters values with matching quotes', () => {
    it('shows quotes around numbers and booleans', () => {
      expect(displayableValue(castValue('"1"'))).toBe('"1"');
      expect(displayableValue(castValue('"true"'))).toBe('"true"');
    });
    it('shows quotes around other string values', () => {
      expect(displayableValue(castValue('"foo"'))).toBe('"foo"');
    });
    it('preserves properly quoted and escaped quotes', () => {
      expect(displayableValue(castValue('"\\"foo"'))).toBe('"\\"foo"');
      expect(displayableValue(castValue('"\\"foo\\""'))).toBe('"\\"foo\\""');
    });
  });
});
