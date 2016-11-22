import { expect } from '../../util/configuredChai';
import { castValue, displayableValue, editableValue, isNumber, isBoolean, toBoolean } from '@cdo/apps/storage/dataBrowser/dataUtils';

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
    expect(castValue('123abc')).to.equal('123abc');
    expect(castValue('NaN')).to.equal('NaN');
  });

  it('converts "null" to null', () => {
    expect(castValue('null')).to.equal(null);
  });

  it('treats quoted strings as strings', () => {
    expect(castValue('"foo"')).to.equal('foo');
    expect(castValue('"1"')).to.equal('1');
    expect(castValue('"true"')).to.equal('true');
  });

  it('parses arrays', () => {
    expect(castValue('[1,2,3]')).to.deep.equal([1,2,3]);
  });

  it('parses objects', () => {
    expect(castValue('{"a":1}')).to.deep.equal({a:1});
  });

  it('parses nested arrays and objects', () => {
    expect(castValue('{"a":[2,"3",{"d":"true"}],"x":{"y":false}}')).to.deep.equal({
      a: [2, "3", {d: "true"}],
      x: {y: false}
    });
  });

  it('leaves other strings unchanged', () => {
    expect(castValue('foo')).to.equal('foo');
    expect(castValue('undefined')).to.equal('undefined');
    expect(castValue('"foo')).to.equal('"foo');
    expect(castValue('""foo""')).to.equal('""foo""');

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
    expect(editableValue('foo')).to.equal('foo');
  });
  it('stringifies objects and arrays', () => {
    expect(editableValue({a:1})).to.equal('{"a":1}');
    expect(editableValue([1,2])).to.equal('[1,2]');
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
  it('converts null to the empty string', () => {
    expect(castValue(editableValue(null))).to.equal('');
  });
});

describe('what we show based on what the user enters', () => {
  describe('when the user enters values without quotes', () => {
    it('shows numbers and booleans without quotes', () => {
      expect(displayableValue(castValue('1'))).to.equal('1');
      expect(displayableValue(castValue('true'))).to.equal('true');
    });
    it ('shows quotes around other string values', () => {
      expect(displayableValue(castValue('foo'))).to.equal('"foo"');
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
      expect(displayableValue(castValue('"\\"foo\\""'))).to.equal('"\\"foo\\""');
    });
  });

  describe('when the user enters unmatching quotes', () => {
    it ('adds quotes around and escapes mismatched quotes', () => {
      // double-backslashes here will appear as single backslashes in the ui
      expect(displayableValue(castValue('"foo'))).to.equal('"\\"foo"');
      expect(displayableValue(castValue('"1'))).to.equal('"\\"1"');
    });
    it ('adds quotes around and escapes multiple sets of quotes', () => {
      // double-backslashes here will appear as single backslashes in the ui
      expect(displayableValue(castValue('""foo""'))).to.equal('"\\"\\"foo\\"\\""');
    });
  });

  describe('when the user enters JSON', () => {
    it('recognizes well-formed objects and arrays', () => {
      expect(displayableValue(castValue('{"a":1}'))).to.equal('{"a":1}');
      expect(displayableValue(castValue('[1,2]'))).to.equal('[1,2]');
    });
    it('treats malformed objects and arrays as strings', () => {
      expect(displayableValue(castValue('{a:1}'))).to.equal('"{a:1}"');
      expect(displayableValue(castValue('[1,2'))).to.equal('"[1,2"');
    });
  });
});
