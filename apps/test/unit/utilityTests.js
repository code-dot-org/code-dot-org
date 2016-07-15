import {assert} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
var xml = require('@cdo/apps/xml');

testUtils.setupLocales();

var utils = require('@cdo/apps/utils');
var _ = require('lodash');
var mazeUtils = require('@cdo/apps/maze/mazeUtils');

describe("mazeUtils", function () {
  var cellId = mazeUtils.cellId;

  it("can generate the correct cellIds", function () {
    assert.equal(cellId('dirt', 0, 0), 'dirt_0_0');
    assert.equal(cellId('dirt', 2, 4), 'dirt_2_4');
    assert.equal(cellId('dirt', 1, 5), 'dirt_1_5');
    assert.equal(cellId('dirt', 3, 1), 'dirt_3_1');
  });
});




describe('utils.unescapeText', function () {
  var unescapeText = utils.unescapeText;

  it('no-op on empty string', function () {
    assert.equal('', unescapeText(''));
  });

  it('no-op on alphanumeric string', function () {
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var digits = '0123456789';
    var testString = alphabet + alphabet.toUpperCase() + digits;
    assert.equal(testString, unescapeText(testString));
  });

  it('replaces all &amp; with &', function () {
    assert.equal('&', unescapeText('&amp;'));
    assert.equal('&&', unescapeText('&amp;&amp;'));
    assert.equal('&nbsp;', unescapeText('&amp;nbsp;'));
  });

  it('replaces all &lt; with <', function () {
    assert.equal('<', unescapeText('&lt;'));
    assert.equal('<<', unescapeText('&lt;&lt;'));
    assert.equal('<div', unescapeText('&lt;div'));
  });

  it('replaces all &gt; with >', function () {
    assert.equal('>', unescapeText('&gt;'));
    assert.equal('>>', unescapeText('&gt;&gt;'));
    assert.equal('/>', unescapeText('/&gt;'));
  });

  it('replaces all &nbsp; with spaces', function () {
    assert.equal(' ', unescapeText(' '));
    assert.equal(' ', unescapeText('&nbsp;'));
    assert.equal('  ', unescapeText(' &nbsp;'));
    assert.equal('  ', unescapeText('&nbsp;&nbsp;'));
    assert.equal('   ', unescapeText(' &nbsp; '));
    assert.equal('    ', unescapeText(' &nbsp; &nbsp;'));
  });

  it('Unescapes pre-escaped content correctly', function () {
    assert.equal('&amp; &nbsp; &gt; &lt;',
        unescapeText('&amp;amp; &amp;nbsp; &amp;gt; &amp;lt;'));
  });

  it('Unwraps <div>-wrapped lines, adding line breaks', function () {
    var input = 'Line 1<div>Line 2</div><div>Line 3</div>';
    var expected = [
      'Line 1',
      'Line 2',
      'Line 3'
    ].join('\n');
    assert.equal(expected, unescapeText(input));
  });

  it('Adds line break for divs with attributes', function () {
    var input, expected;

    input = 'Line 1<div style="line-height: 10.8px;">Line 2</div>';
    expected = [
      'Line 1',
      'Line 2'
    ].join('\n');
    assert.equal(expected, unescapeText(input), 'div with attribute');
  });

  it('Does not add leading newline for span-wrapped leading line', function () {
    var input, expected;

    input = '<span>Line1</span><div>Line2</div>';
    expected = [
      'Line1',
      'Line2'
    ].join('\n');
    assert.equal(expected, unescapeText(input), 'first line span');
  });

  it('If input starts with <div> treats that as the first line', function () {
    var input = '<div>Line 1</div><div>Line 2</div>';
    var expected = [
      'Line 1',
      'Line 2'
    ].join('\n');
    assert.equal(expected, unescapeText(input));
  });

  it('Converts <div><br></div> to a blank line', function () {
    var input, expected;

    input = '<div><br></div><div>Line 2</div><div>Line 3</div>';
    expected = [
      '',
      'Line 2',
      'Line 3'
    ].join('\n');
    assert.equal(expected, unescapeText(input), 'first line blank');

    input = 'Line 1<div><br></div><div>Line 3</div>';
    expected = [
      'Line 1',
      '',
      'Line 3'
    ].join('\n');
    assert.equal(expected, unescapeText(input), 'second line blank');

    input = 'Line 1<div>Line 2</div><div><br></div>';
    expected = [
      'Line 1',
      'Line 2',
      ''
    ].join('\n');
    assert.equal(expected, unescapeText(input), 'third line blank');

    input = '<div><br></div><div><br></div><div><br></div>';
    expected = [
      '',
      '',
      ''
    ].join('\n');
    assert.equal(expected, unescapeText(input), 'all lines blank');
  });

  describe('is the inverse of escapeText', function () {
    var escapeText = utils.escapeText;
    var assertRoundTrip = function assertRoundTrip(testString) {
      var intermediateForm = escapeText(testString);
      assert.equal(testString, unescapeText(intermediateForm),
          'Failed with intermediate form ' + intermediateForm);
    };

    it('With newline', function () {
      assertRoundTrip('Line1\nLine2');
    });

    it('With leading newline', function () {
      assertRoundTrip('\nLine1\nLine2');
    });

    it('With multiple leading newlines', function () {
      assertRoundTrip('\n\n \nLine1\nLine2');
    });

    describe('fuzz tests (randomized)', function () {
      var stringPool = [
        '<div>',
        '</div>',
        '<br>',
        '<a>',
        '&',
        '<',
        '>',
        ' ',
        '&amp;',
        '&lt;',
        '&gt;',
        '&nbsp;',
        '\n'
      ];

      var randomTestString = function randomTestString() {
        var s = '';
        for (var i = 0; i < 10; i++) {
          s += _.sample(stringPool);
        }
        return s;
      };

      // Generate some random test strings and test them all.
      var fuzzTests = [];
      for (var i = 0; i < 10; i++) {
        fuzzTests.push(randomTestString());
      }

      fuzzTests.forEach(function (testString) {
        it(testString.replace(/\n/g, '\\n'), function () {
          assertRoundTrip(testString);
        });
      });
    });
  });
});

describe('utils.makeEnum', function () {
  var makeEnum = utils.makeEnum;
  it('builds a key:"key" enum object from its arguments', function () {
    var Seasons = makeEnum('SPRING', 'SUMMER', 'FALL', 'WINTER');
    assert.deepEqual(Seasons, {
      SPRING: 'SPRING',
      SUMMER: 'SUMMER',
      FALL: 'FALL',
      WINTER: 'WINTER'
    });
  });

  it('returns an empty object when given no arguments', function () {
    var TheVoid = makeEnum();
    assert.deepEqual(TheVoid, {});
  });

  it('attempts to coerce arguments to string', function () {
    var Coerced = makeEnum(undefined, null, 3.14, {});
    assert.deepEqual(Coerced, {
      'undefined': 'undefined',
      'null': 'null',
      '3.14': '3.14',
      '[object Object]': '[object Object]'
    });
  });

  it('throws if a duplicate key occurs', function () {
    assert.throws(function () {
      makeEnum('twins', 'twins');
    });
  });

  it('freezes returned object if Object.freeze is available', function () {
    var ColdThings = makeEnum('snow', 'ice', 'vacuum');
    if (Object.freeze) {
      assert.throws(function () {
        ColdThings['sorbet'] = 'sorbet';
      });
    }
  });
});

describe("ellipsify", function () {
  const ellipsify = utils.ellipsify;
  it("ellipsifies id strings that exceed max length", function () {
    assert.equal("abcdefghi", ellipsify("abcdefghi", 12));
    assert.equal("abcdefghijkl", ellipsify("abcdefghijkl", 12));
    assert.equal("abcdefghi...", ellipsify("abcdefghijklm", 12));
  });
});

describe("deepMergeConcatArrays", () => {
  it("merges arrays within objects", () => {
    const base = { items: [1, 2, 3] };
    const overrides = { items: [4, 5, 6]};
    const allItems = [1, 2, 3, 4, 5, 6];
    const expected = { items: allItems };

    const actual = utils.deepMergeConcatArrays(base, overrides);

    assert.deepEqual(allItems, actual.items, 'concats arrays');
    assert.deepEqual(expected, actual, 'constructs expected object');
  });

  it("overrides object properties", () => {
    const base = {
      untouchedProperty: 'originalA',
      untouchedNestedProperty: {property: 'value'},
      overriddenProperty: 'originalC',
      overriddenNestedProperty: {property: 'originalD'}
    };

    const overriddenValue = 'newB';
    const overrides = {
      overriddenProperty: overriddenValue,
      newProperty: 'newValue',
      overriddenNestedProperty: {property: 'newD'}
    };

    const expected = {
      untouchedProperty: 'originalA',
      untouchedNestedProperty: {property: 'value'},
      overriddenProperty: overriddenValue,
      overriddenNestedProperty: {property: 'newD'},
      newProperty: 'newValue'
    };

    const actual = utils.deepMergeConcatArrays(base, overrides);

    assert.deepEqual(overriddenValue, actual.overriddenProperty,
        'overrides object values');
    assert.deepEqual(expected, actual, 'merges all values');
  });

  it("returns deep clone, does not mutate original object", () => {
    const base = {
      untouchedProperty: 'originalA',
      untouchedNestedProperty: {property: 'value'},
      overriddenProperty: 'originalC',
      overriddenNestedProperty: {property: 'originalD'},
      items: [1, 2, 3]
    };
    const baseClone = _.cloneDeep(base);

    const overrides = {
      overriddenProperty: 'newB',
      newProperty: 'newValue',
      overriddenNestedProperty: {property: 'newD'},
      items: [4, 5, 6]
    };

    const actual = utils.deepMergeConcatArrays(base, overrides);

    assert.deepEqual(baseClone, base, 'does not mutate base object');

    actual.items.push(7);
    assert.deepEqual(baseClone, base, 'clones array properties');

    actual.untouchedProperty = 'Some other value';
    assert.deepEqual(baseClone.untouchedProperty, base.untouchedProperty,
        'cannot override base properties via returned object');

    actual.untouchedNestedProperty.property = 'Some other value';
    assert.deepEqual(baseClone.untouchedNestedProperty, base.untouchedNestedProperty,
        'cannot override base nested properties via returned object');
  });

  it("retains order of original properties", () => {
    const base = {
      first: 1,
      second: 2,
      third: 3
    };

    const overrides = {
      third: '3',
      first: '1',
      second: '2'
    };

    const expected = {
      first: '1',
      second: '2',
      third: '3'
    };
    const actual = utils.deepMergeConcatArrays(base, overrides);
    assert.deepEqual(expected, actual, 'overrides expected values');
    assert.deepEqual(Object.keys(expected), Object.keys(actual),
        'merges in original order');
  });
});
