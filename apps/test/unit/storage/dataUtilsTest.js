import {expect} from '../../util/deprecatedChai';
import {
  isBlank,
  ignoreMissingValues,
  castValue,
  displayableValue,
  editableValue,
  isNumber,
  isBoolean,
  toBoolean
} from '@cdo/apps/storage/dataBrowser/dataUtils';

describe('isBlank', () => {
  it('counts null, undefined, and empty string as blank', () => {
    expect(isBlank(null)).to.be.true;
    expect(isBlank(undefined)).to.be.true;
    expect(isBlank('')).to.be.true;
  });

  it('counts other falsy values as not blank', () => {
    expect(isBlank(0)).to.be.false;
    expect(isBlank(false)).to.be.false;
    expect(isBlank(-1)).to.be.false;
    expect(isBlank(' ')).to.be.false;
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
    {category1: '', category2: null, category3: undefined}
  ];
  it('returns [] if there are no records', () => {
    expect(ignoreMissingValues([], [])).to.deep.equal([]);
    expect(ignoreMissingValues(undefined, undefined)).to.deep.equal([]);
  });
  it('returns all records if there are no columns to filter by', () => {
    expect(ignoreMissingValues(records, [])).to.deep.equal(records);
    expect(ignoreMissingValues(records, undefined)).to.deep.equal(records);
  });
  it('filters out records missing value for one column', () => {
    expect(ignoreMissingValues(records, ['category1'])).to.deep.equal([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: 'red', category2: null, category3: 10},
      {category1: 'blue', category2: 1, category3: null}
    ]);

    expect(ignoreMissingValues(records, ['category2'])).to.deep.equal([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: undefined, category2: 4, category3: 10},
      {category1: 'blue', category2: 1, category3: null},
      {category1: '', category2: 3, category3: 10}
    ]);

    expect(ignoreMissingValues(records, ['category3'])).to.deep.equal([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: undefined, category2: 4, category3: 10},
      {category1: 'red', category2: null, category3: 10},
      {category1: '', category2: 3, category3: 10}
    ]);
  });

  it('filters out records missing a value for any provided column', () => {
    expect(
      ignoreMissingValues(records, ['category1', 'category2'])
    ).to.deep.equal([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: 'blue', category2: 1, category3: null}
    ]);
    expect(
      ignoreMissingValues(records, ['category2', 'category3'])
    ).to.deep.equal([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10},
      {category1: undefined, category2: 4, category3: 10},
      {category1: '', category2: 3, category3: 10}
    ]);

    expect(
      ignoreMissingValues(records, ['category1', 'category2', 'category3'])
    ).to.deep.equal([
      {category1: 'red', category2: 1, category3: 10},
      {category1: 'blue', category2: 1, category3: 20},
      {category1: 'red', category2: 3, category3: 10}
    ]);
  });
});

describe('isNumber', () => {
  it('detects valid numerical values', () => {
    expect(isNumber(1)).to.be.true;
    expect(isNumber('2')).to.be.true;
    expect(isNumber(0.3)).to.be.true;
    expect(isNumber('0.4')).to.be.true;
    expect(isNumber(1e5)).to.be.true;
    expect(isNumber('1e6')).to.be.true;
  });
  it('detects invalid numerical values', () => {
    expect(isNumber('123abc')).to.be.false;
    expect(isNumber('foo')).to.be.false;
    expect(isNumber(null)).to.be.false;
    expect(isNumber(false)).to.be.false;
    expect(isNumber(undefined)).to.be.false;
    expect(isNumber(NaN)).to.be.false;
    expect(isNumber('NaN')).to.be.false;
  });
});

describe('isBoolean', () => {
  it('detects valid boolean values', () => {
    expect(isBoolean(false)).to.be.true;
    expect(isBoolean(true)).to.be.true;
    expect(isBoolean('false')).to.be.true;
    expect(isBoolean('true')).to.be.true;
  });
  it('detects invalid boolean values', () => {
    expect(isBoolean(0)).to.be.false;
    expect(isBoolean(null)).to.be.false;
    expect(isBoolean('')).to.be.false;
    expect(isBoolean('foo')).to.be.false;
  });
});

describe('toBoolean', () => {
  it('recognizes valid boolean values', () => {
    expect(toBoolean(false)).to.be.false;
    expect(toBoolean(true)).to.be.true;
    expect(toBoolean('false')).to.be.false;
    expect(toBoolean('true')).to.be.true;
  });
  it('throws on invalid boolean values', done => {
    try {
      toBoolean('foo');
    } catch (e) {
      expect(e.message).to.contain('Unable to convert to boolean');
      done();
    }
  });
});

describe('castValue', () => {
  it('converts boolean strings to booleans', () => {
    expect('true').to.not.equal(true);
    expect(castValue('true')).to.equal(true);
    expect(castValue('false')).to.equal(false);
  });

  it('converts numerical strings to numbers', () => {
    expect('1').to.not.equal(1);
    expect(castValue('1')).to.equal(1);
    expect(castValue('0.2')).to.equal(0.2);
    expect(castValue('1.2345e3')).to.equal(1234.5);
  });

  it("converts 'null' to null", () => {
    expect(castValue('null')).to.equal(null);
  });

  it('treats quoted strings as strings', () => {
    expect(castValue('"foo"')).to.equal('foo');
    expect(castValue('"1"')).to.equal('1');
    expect(castValue('"true"')).to.equal('true');
  });

  it('does not allow objects or arrays', () => {
    expect(() => castValue('[1, 2, 3]')).to.throw(/Invalid entry type: object/);
    expect(() => castValue('{"a": 1, "b": 2, "c": 3}')).to.throw(
      /Invalid entry type: object/
    );
  });

  it('converts "undefined" to undefined', () => {
    expect(castValue('undefined')).to.equal(undefined);
  });

  it('only allows unquoted strings if allowUnquotedStrings is true', () => {
    expect(castValue('abc', /* allowUnquotedStrings */ true)).to.equal('abc');
    expect(() => castValue('abc', /* allowUnquotedStrings */ false)).to.throw(
      //      PhantomJS|Chrome
      /JSON Parse error|Unexpected token/
    );
  });
});

describe('editableValue', () => {
  it('doesnt put quotes around numbers', () => {
    expect(editableValue(1)).to.equal('1');
  });

  it('puts quotes around numerical strings', () => {
    expect(editableValue('1')).to.equal('"1"');
  });

  it('puts quotes around boolean strings', () => {
    expect(editableValue('true')).to.equal('"true"');
  });

  it('doesnt puts quotes around other strings', () => {
    expect(editableValue('foo')).to.equal('"foo"');
  });

  it('shows undefined', () => {
    expect(editableValue(undefined)).to.equal('undefined');
  });
});

describe('what happens if you edit and then immediately save a value', () => {
  it('preserves numbers', () => {
    expect(castValue(editableValue(1))).to.equal(1);
  });

  it('preserves booleans', () => {
    expect(castValue(editableValue(false))).to.equal(false);
    expect(castValue(editableValue(true))).to.equal(true);
  });

  it('preserves numerical strings', () => {
    expect(castValue(editableValue('2'))).to.equal('2');
  });

  it('preserves boolean strings', () => {
    expect(castValue(editableValue('false'))).to.equal('false');
    expect(castValue(editableValue('true'))).to.equal('true');
  });

  it('preserves other strings', () => {
    expect(castValue(editableValue('foo'))).to.equal('foo');
  });

  it('preserves null', () => {
    expect(castValue(editableValue(null))).to.equal(null);
  });
});

describe('what we show based on what the user enters', () => {
  describe('when the user enters values without quotes', () => {
    it('shows numbers and booleans without quotes', () => {
      expect(displayableValue(castValue('1'))).to.equal('1');
      expect(displayableValue(castValue('true'))).to.equal('true');
    });
  });

  describe('when the user enters values with matching quotes', () => {
    it('shows quotes around numbers and booleans', () => {
      expect(displayableValue(castValue('"1"'))).to.equal('"1"');
      expect(displayableValue(castValue('"true"'))).to.equal('"true"');
    });
    it('shows quotes around other string values', () => {
      expect(displayableValue(castValue('"foo"'))).to.equal('"foo"');
    });
    it('preserves properly quoted and escaped quotes', () => {
      expect(displayableValue(castValue('"\\"foo"'))).to.equal('"\\"foo"');
      expect(displayableValue(castValue('"\\"foo\\""'))).to.equal(
        '"\\"foo\\""'
      );
    });
  });
});
