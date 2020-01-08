import _ from 'lodash';
import {stub} from 'sinon';
import {assert, expect} from '../util/deprecatedChai';
import * as utils from '@cdo/apps/utils';
const {
  isSubsequence,
  shallowCopy,
  cloneWithoutFunctions,
  stripQuotes,
  wrapNumberValidatorsForLevelBuilder,
  escapeHtml,
  escapeText,
  unescapeText,
  makeEnum,
  ellipsify,
  deepMergeConcatArrays,
  createUuid,
  normalize,
  stringifyQueryParams,
  getTabId
} = utils;

describe('utils modules', () => {
  describe('the isSubsequence function', () => {
    it('returns false when the subsequence is not a subsequence', () => {
      expect(isSubsequence([1, 2, 3], [5])).to.be.false;
      expect(isSubsequence([1, 2, 3], [1, 2, 3, 5])).to.be.false;
      expect(isSubsequence([1, 2, 3], [1, 2, 2])).to.be.false;
      expect(isSubsequence([1, 2, 3], [3, 2])).to.be.false;
    });

    it('returns true when the subsequence is a subsequence', () => {
      expect(isSubsequence([1, 2, 3], [])).to.be.true;
      expect(isSubsequence([1, 2, 3], [1])).to.be.true;
      expect(isSubsequence([1, 2, 3], [2])).to.be.true;
      expect(isSubsequence([1, 2, 3], [3])).to.be.true;
      expect(isSubsequence([1, 2, 3], [1, 2])).to.be.true;
      expect(isSubsequence([1, 2, 3], [2, 3])).to.be.true;
      expect(isSubsequence([1, 2, 3], [1, 3])).to.be.true;
      expect(isSubsequence([1, 2, 3], [1, 2, 3])).to.be.true;
    });
  });

  describe('the normalize funtion', () => {
    it('leaves unit vectors unchanged', () => {
      expect(normalize({x: 1, y: 0})).to.eql({x: 1, y: 0});
      expect(normalize({x: 0, y: 1})).to.eql({x: 0, y: 1});
      expect(normalize({x: -1, y: 0})).to.eql({x: -1, y: 0});
      expect(normalize({x: 0, y: -1})).to.eql({x: 0, y: -1});
    });
    it('leaves zero vector unchanged', () => {
      expect(normalize({x: 0, y: 0})).to.eql({x: 0, y: 0});
    });
    it('normalizes non-unit vectors', () => {
      expect(normalize({x: 3, y: 0})).to.eql({x: 1, y: 0});
      expect(normalize({x: 0, y: -3})).to.eql({x: 0, y: -1});
      expect(normalize({x: 1, y: 1})).to.eql({
        x: 1 / Math.sqrt(2),
        y: 1 / Math.sqrt(2)
      });
      expect(normalize({x: 1, y: -2})).to.eql({
        x: 1 / Math.sqrt(5),
        y: -2 / Math.sqrt(5)
      });
    });
  });

  describe('shallowCopy', function() {
    it('makes a shallow copy of an object', function() {
      const originalObject = {
        num: 2,
        obj: {}
      };
      const newObject = shallowCopy(originalObject);
      expect(newObject).not.to.equal(originalObject);
      expect(newObject).to.deep.equal(originalObject);
      expect(newObject.obj).to.equal(originalObject.obj);
    });
  });

  describe('cloneWithoutFunctions', function() {
    it('strips functions from an object', function() {
      const originalObject = {
        num: 2,
        func: function() {}
      };
      const newObject = cloneWithoutFunctions(originalObject);
      expect(newObject).not.to.equal(originalObject);
      expect(newObject.num).to.equal(originalObject.num);
      expect(newObject.func).to.be.undefined;
    });
  });

  describe('String.prototype.repeat', function() {
    it('returns a string that is n copies of the original string', function() {
      assert.equal('aaa', 'a'.repeat(3));
      assert.equal('abcabc', 'abc'.repeat(2));
    });

    it('uses floor of count for non-integer counts', function() {
      assert.equal('aaa', 'a'.repeat(3.1));
      assert.equal('aaa', 'a'.repeat(3.9));
    });

    it('returns empty string when given a zero count', function() {
      assert.equal('', 'a'.repeat(0));
    });

    it('returns empty string when repeating an empty string', function() {
      assert.equal('', ''.repeat(20));
    });

    it('throws RangeError when given a negative count', function() {
      assert.throws(function() {
        'a'.repeat(-1);
      }, RangeError);
    });

    it('throws RangeError when given an infinity count', function() {
      assert.throws(function() {
        'a'.repeat(Infinity);
      }, RangeError);
    });

    // Note: Was going to text maximum output string length, but implementation
    //       does not appear to be consistent across browsers.  Our polyfill
    //       limits output of this method to 1 << 28 characters.
  });

  describe('Function.prototype.inherits', function() {
    var A, B, C;

    beforeEach(function() {
      A = function() {
        this.usedConstructorA = true;
      };

      B = function() {
        this.usedConstructorB = true;
        this.onConstructB();
      };
      B.inherits(A);
      B.prototype.onConstructB = function() {};

      C = function() {
        this.usedConstructorC = true;
        this.onConstructC();
      };
      C.inherits(B);
      C.prototype.onConstructC = function() {};
    });

    it('establishes a correct prototype chain', function() {
      var a = new A();
      assert(a instanceof A, 'a instanceof A');
      assert(!(a instanceof B), '!(a instanceof B)');
      assert(!(a instanceof C), '!(a instanceof C)');

      var b = new B();
      assert(b instanceof A, 'b instanceof A');
      assert(b instanceof B, 'b instanceof B');
      assert(!(b instanceof C), '!(b instanceof C)');

      var c = new C();
      assert(c instanceof A, 'c instanceof A');
      assert(c instanceof B, 'c instanceof B');
      assert(c instanceof C, 'c instanceof C');
    });

    it("sets the object's constructor property correctly", function() {
      // Object's constructor property should always end up set to the
      // function that constructed it.
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/
      //       Reference/Global_Objects/Object/constructor
      var a = new A();
      assert(a.constructor === A, 'a.constructor === A');

      var b = new B();
      assert(b.constructor === B, 'b.constructor === B');

      var c = new C();
      assert(c.constructor === C, 'c.constructor === C');
    });

    it('calls only the current constructor by default', function() {
      var a = new A();
      assert(a.usedConstructorA === true, 'a.usedConstructorA === true');

      var b = new B();
      assert(b.usedConstructorA !== true, 'b.usedConstructorA !== true');
      assert(b.usedConstructorB === true, 'b.usedConstructorB === true');

      var c = new C();
      assert(c.usedConstructorA !== true, 'c.usedConstructorA !== true');
      assert(c.usedConstructorB !== true, 'c.usedConstructorB !== true');
      assert(c.usedConstructorC === true, 'c.usedConstructorC === true');
    });

    it('can chain constructor calls', function() {
      B.prototype.onConstructB = function() {
        A.call(this);
      };

      C.prototype.onConstructC = function() {
        B.call(this);
      };

      var b = new B();
      assert(b.usedConstructorA === true, 'b.usedConstructorA === true');
      assert(b.usedConstructorB === true, 'b.usedConstructorB === true');

      var c = new C();
      assert(c.usedConstructorA === true, 'c.usedConstructorA === true');
      assert(c.usedConstructorB === true, 'c.usedConstructorB === true');
      assert(c.usedConstructorC === true, 'c.usedConstructorC === true');
    });

    it('exposes superPrototype for chaining methods', function() {
      A.prototype.noise = function() {
        return 'fizz';
      };

      B.prototype.noise = function() {
        return B.superPrototype.noise.call(this) + 'bang';
      };

      C.prototype.noise = function() {
        return C.superPrototype.noise.call(this) + 'pop';
      };

      var a = new A();
      assert(a.noise() === 'fizz', "a.noise() === 'fizz'");

      var b = new B();
      assert(b.noise() === 'fizzbang', "b.noise() === 'fizzbang'");

      var c = new C();
      assert(c.noise() === 'fizzbangpop', "c.noise() === 'fizzbangpop'");
    });
  });

  describe('stripQuotes', function() {
    it('can remove quotes from a string', function() {
      assert(stripQuotes("t'e's't'") === 'test');
      assert(stripQuotes('t"e"s"t"') === 'test');
      assert(stripQuotes('test') === 'test');
      assert(stripQuotes('') === '');
    });
  });

  describe('wrapNumberValidatorsForLevelBuilder', function() {
    let oldBlockly;

    beforeEach(function() {
      // Blockly hasn't actually been loaded at this point, but we can simulate it.
      // First stash the current blockly in case things change and we do have it
      // loaded.
      oldBlockly = global.Blockly;
    });

    afterEach(function() {
      global.Blockly = oldBlockly;
    });

    it('will allow ??? in number validators after being wrapped', function() {
      global.Blockly = {
        FieldTextInput: {
          // fake our validators
          nonnegativeIntegerValidator: function(text) {
            return isNaN(text) ? null : text;
          },
          numberValidator: function(text) {
            return isNaN(text) ? null : text;
          }
        }
      };

      assert.equal(
        Blockly.FieldTextInput.nonnegativeIntegerValidator('123'),
        123
      );
      assert.equal(Blockly.FieldTextInput.numberValidator('123'), 123);
      assert.equal(
        Blockly.FieldTextInput.nonnegativeIntegerValidator('???'),
        null
      );
      assert.equal(Blockly.FieldTextInput.numberValidator('???'), null);
      wrapNumberValidatorsForLevelBuilder();
      assert.equal(
        Blockly.FieldTextInput.nonnegativeIntegerValidator('123'),
        123
      );
      assert.equal(Blockly.FieldTextInput.numberValidator('123'), 123);
      assert.equal(
        Blockly.FieldTextInput.nonnegativeIntegerValidator('???'),
        '???'
      );
      assert.equal(Blockly.FieldTextInput.numberValidator('???'), '???');
    });
  });

  describe('escapeHtml', function() {
    const unescaped = '&<>"\'/';
    const escaped = '&amp;&lt;&gt;&quot;&#39;&#47;';

    it('should handle null input', function() {
      assert.strictEqual(escapeHtml(null), '');
    });

    it('should handle undefined input', function() {
      assert.strictEqual(escapeHtml(undefined), '');
    });

    it('should escape special characters', function() {
      assert.strictEqual(escapeHtml(unescaped), escaped);
    });

    it('should not escape regular characters', function() {
      assert.strictEqual(escapeHtml('abc123'), 'abc123');
    });
  });

  describe('escapeText', function() {
    it('no-op on empty string', function() {
      assert.equal('', escapeText(''));
    });

    it('no-op on alphanumeric string', function() {
      var alphabet = 'abcdefghijklmnopqrstuvwxyz';
      var digits = '0123456789';
      var testString = alphabet + alphabet.toUpperCase() + digits;
      assert.equal(testString, escapeText(testString));
    });

    it('replaces all & with &amp;', function() {
      assert.equal('&amp;', escapeText('&'));
      assert.equal('&amp;&amp;', escapeText('&&'));
      assert.equal('&amp;nbsp;', escapeText('&nbsp;'));
    });

    it('replaces all < with &lt;', function() {
      assert.equal('&lt;', escapeText('<'));
      assert.equal('&lt;&lt;', escapeText('<<'));
      assert.equal('&lt;div', escapeText('<div'));
    });

    it('replaces all > with &gt;', function() {
      assert.equal('&gt;', escapeText('>'));
      assert.equal('&gt;&gt;', escapeText('>>'));
      assert.equal('/&gt;', escapeText('/>'));
    });

    it('breaks up all doubled spaces with &nbsp;', function() {
      assert.equal(' ', escapeText(' '));
      assert.equal(' &nbsp;', escapeText('  '));
      assert.equal(' &nbsp; ', escapeText('   '));
      assert.equal(' &nbsp; &nbsp;', escapeText('    '));
    });

    it('Escapes already-escaped content', function() {
      assert.equal(
        '&amp;amp; &amp;nbsp; &amp;gt; &amp;lt;',
        escapeText('&amp; &nbsp; &gt; &lt;')
      );
    });

    it('Wraps second and subsequent lines in <div>, removing line breaks', function() {
      var input = ['Line 1', 'Line 2', 'Line 3'].join('\n');
      var expected = 'Line 1<div>Line 2</div><div>Line 3</div>';
      assert.equal(expected, escapeText(input));
    });

    it('Uses <br> for blank first line when handling multiple lines', function() {
      var input = ['', 'Line 2', 'Line 3'].join('\n');
      var expected = '<br><div>Line 2</div><div>Line 3</div>';
      assert.equal(expected, escapeText(input));
    });

    it('Adds <br> to every other blank line', function() {
      var input, expected;

      input = ['Line 1', '', 'Line 3'].join('\n');
      expected = 'Line 1<div><br></div><div>Line 3</div>';
      assert.equal(expected, escapeText(input));

      input = ['Line 1', 'Line 2', ''].join('\n');
      expected = 'Line 1<div>Line 2</div><div><br></div>';
      assert.equal(expected, escapeText(input));

      input = ['', '', ''].join('\n');
      expected = '<br><div><br></div><div><br></div>';
      assert.equal(expected, escapeText(input));
    });
  });

  describe('unescapeText', function() {
    it('no-op on empty string', function() {
      assert.equal('', unescapeText(''));
    });

    it('no-op on alphanumeric string', function() {
      var alphabet = 'abcdefghijklmnopqrstuvwxyz';
      var digits = '0123456789';
      var testString = alphabet + alphabet.toUpperCase() + digits;
      assert.equal(testString, unescapeText(testString));
    });

    it('replaces all &amp; with &', function() {
      assert.equal('&', unescapeText('&amp;'));
      assert.equal('&&', unescapeText('&amp;&amp;'));
      assert.equal('&nbsp;', unescapeText('&amp;nbsp;'));
    });

    it('replaces all &lt; with <', function() {
      assert.equal('<', unescapeText('&lt;'));
      assert.equal('<<', unescapeText('&lt;&lt;'));
      assert.equal('<div', unescapeText('&lt;div'));
    });

    it('replaces all &gt; with >', function() {
      assert.equal('>', unescapeText('&gt;'));
      assert.equal('>>', unescapeText('&gt;&gt;'));
      assert.equal('/>', unescapeText('/&gt;'));
    });

    it('replaces all &nbsp; with spaces', function() {
      assert.equal(' ', unescapeText(' '));
      assert.equal(' ', unescapeText('&nbsp;'));
      assert.equal('  ', unescapeText(' &nbsp;'));
      assert.equal('  ', unescapeText('&nbsp;&nbsp;'));
      assert.equal('   ', unescapeText(' &nbsp; '));
      assert.equal('    ', unescapeText(' &nbsp; &nbsp;'));
    });

    it('Unescapes pre-escaped content correctly', function() {
      assert.equal(
        '&amp; &nbsp; &gt; &lt;',
        unescapeText('&amp;amp; &amp;nbsp; &amp;gt; &amp;lt;')
      );
    });

    it('Unwraps <div>-wrapped lines, adding line breaks', function() {
      var input = 'Line 1<div>Line 2</div><div>Line 3</div>';
      var expected = ['Line 1', 'Line 2', 'Line 3'].join('\n');
      assert.equal(expected, unescapeText(input));
    });

    it('Adds line break for divs with attributes', function() {
      var input, expected;

      input = 'Line 1<div style="line-height: 10.8px;">Line 2</div>';
      expected = ['Line 1', 'Line 2'].join('\n');
      assert.equal(expected, unescapeText(input), 'div with attribute');
    });

    it('Does not add leading newline for span-wrapped leading line', function() {
      var input, expected;

      input = '<span>Line1</span><div>Line2</div>';
      expected = ['Line1', 'Line2'].join('\n');
      assert.equal(expected, unescapeText(input), 'first line span');
    });

    it('If input starts with <div> treats that as the first line', function() {
      var input = '<div>Line 1</div><div>Line 2</div>';
      var expected = ['Line 1', 'Line 2'].join('\n');
      assert.equal(expected, unescapeText(input));
    });

    it('Converts <div><br></div> to a blank line', function() {
      var input, expected;

      input = '<div><br></div><div>Line 2</div><div>Line 3</div>';
      expected = ['', 'Line 2', 'Line 3'].join('\n');
      assert.equal(expected, unescapeText(input), 'first line blank');

      input = 'Line 1<div><br></div><div>Line 3</div>';
      expected = ['Line 1', '', 'Line 3'].join('\n');
      assert.equal(expected, unescapeText(input), 'second line blank');

      input = 'Line 1<div>Line 2</div><div><br></div>';
      expected = ['Line 1', 'Line 2', ''].join('\n');
      assert.equal(expected, unescapeText(input), 'third line blank');

      input = '<div><br></div><div><br></div><div><br></div>';
      expected = ['', '', ''].join('\n');
      assert.equal(expected, unescapeText(input), 'all lines blank');
    });

    describe('is the inverse of escapeText', function() {
      var assertRoundTrip = function assertRoundTrip(testString) {
        var intermediateForm = escapeText(testString);
        assert.equal(
          testString,
          unescapeText(intermediateForm),
          'Failed with intermediate form ' + intermediateForm
        );
      };

      it('With newline', function() {
        assertRoundTrip('Line1\nLine2');
      });

      it('With leading newline', function() {
        assertRoundTrip('\nLine1\nLine2');
      });

      it('With multiple leading newlines', function() {
        assertRoundTrip('\n\n \nLine1\nLine2');
      });

      describe('fuzz tests (randomized)', function() {
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

        fuzzTests.forEach(function(testString) {
          it(testString.replace(/\n/g, '\\n'), function() {
            assertRoundTrip(testString);
          });
        });
      });
    });
  });

  describe('makeEnum', function() {
    it('builds a key:"key" enum object from its arguments', function() {
      var Seasons = makeEnum('SPRING', 'SUMMER', 'FALL', 'WINTER');
      assert.deepEqual(Seasons, {
        SPRING: 'SPRING',
        SUMMER: 'SUMMER',
        FALL: 'FALL',
        WINTER: 'WINTER'
      });
    });

    it('returns an empty object when given no arguments', function() {
      var TheVoid = makeEnum();
      assert.deepEqual(TheVoid, {});
    });

    it('attempts to coerce arguments to string', function() {
      var Coerced = makeEnum(undefined, null, 3.14, {});
      assert.deepEqual(Coerced, {
        undefined: 'undefined',
        null: 'null',
        '3.14': '3.14',
        '[object Object]': '[object Object]'
      });
    });

    it('throws if a duplicate key occurs', function() {
      assert.throws(function() {
        makeEnum('twins', 'twins');
      });
    });

    it('freezes returned object if Object.freeze is available', function() {
      var ColdThings = makeEnum('snow', 'ice', 'vacuum');
      if (Object.freeze) {
        assert.throws(function() {
          ColdThings['sorbet'] = 'sorbet';
        });
      }
    });
  });

  describe('ellipsify', function() {
    it('ellipsifies id strings that exceed max length', function() {
      assert.equal('abcdefghi', ellipsify('abcdefghi', 12));
      assert.equal('abcdefghijkl', ellipsify('abcdefghijkl', 12));
      assert.equal('abcdefghi...', ellipsify('abcdefghijklm', 12));
    });
  });

  describe('deepMergeConcatArrays', () => {
    it('merges arrays within objects', () => {
      const base = {items: [1, 2, 3]};
      const overrides = {items: [4, 5, 6]};
      const allItems = [1, 2, 3, 4, 5, 6];
      const expected = {items: allItems};

      const actual = deepMergeConcatArrays(base, overrides);

      assert.deepEqual(allItems, actual.items, 'concats arrays');
      assert.deepEqual(expected, actual, 'constructs expected object');
    });

    it('overrides object properties', () => {
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

      const actual = deepMergeConcatArrays(base, overrides);

      assert.deepEqual(
        overriddenValue,
        actual.overriddenProperty,
        'overrides object values'
      );
      assert.deepEqual(expected, actual, 'merges all values');
    });

    it('returns deep clone, does not mutate original object', () => {
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

      const actual = deepMergeConcatArrays(base, overrides);

      assert.deepEqual(baseClone, base, 'does not mutate base object');

      actual.items.push(7);
      assert.deepEqual(baseClone, base, 'clones array properties');

      actual.untouchedProperty = 'Some other value';
      assert.deepEqual(
        baseClone.untouchedProperty,
        base.untouchedProperty,
        'cannot override base properties via returned object'
      );

      actual.untouchedNestedProperty.property = 'Some other value';
      assert.deepEqual(
        baseClone.untouchedNestedProperty,
        base.untouchedNestedProperty,
        'cannot override base nested properties via returned object'
      );
    });

    it('retains order of original properties', () => {
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
      const actual = deepMergeConcatArrays(base, overrides);
      assert.deepEqual(expected, actual, 'overrides expected values');
      assert.deepEqual(
        Object.keys(expected),
        Object.keys(actual),
        'merges in original order'
      );
    });
  });

  describe('createUuid', function() {
    it('returns a random uuid', function() {
      // Check layout
      expect(createUuid()).to.match(/^........-....-4...-....-............$/);
      // Check allowed characters
      expect(createUuid()).to.match(/^[0-9a-f\-]+$/);
    });
  });

  describe('reload', () => {
    beforeEach(() => stub(utils, 'reload'));
    afterEach(() => utils.reload.restore());

    it('can be stubbed', () => {
      utils.reload();
      expect(utils.reload).to.have.been.calledOnce;
    });
  });

  describe('stringifyQueryParams', () => {
    it('returns the empty string when given a falsy input', () => {
      expect('').to.equal(stringifyQueryParams(undefined));
      expect('').to.equal(stringifyQueryParams(null));
    });

    it('returns the empty string when given no key-value pairs', () => {
      expect('').to.equal(stringifyQueryParams({}));
    });

    it('stringifies objects containing one key-value pair', () => {
      expect('?a=1').to.equal(stringifyQueryParams({a: 1}));
    });

    it('stringifies objects containing two key-value pairs', () => {
      expect('?a=1&b=c').to.equal(stringifyQueryParams({a: 1, b: 'c'}));
    });
  });

  describe('getTabId', () => {
    it('keeps returning the same result', () => {
      const id1 = getTabId();
      const id2 = getTabId();
      const id3 = getTabId();

      expect(id1).to.equal(id2);
      expect(id2).to.equal(id3);
    });

    it('changes only after session storage is cleared', () => {
      const id1 = getTabId();
      const id2 = getTabId();
      sessionStorage.removeItem('tabId');
      const id3 = getTabId();
      const id4 = getTabId();

      expect(id1).to.equal(id2);
      expect(id2).to.not.equal(id3);
      expect(id3).to.equal(id4);
    });
  });
});
