import {assert, expect} from '../util/configuredChai';
import {
    isSubsequence,
    shallowCopy,
    cloneWithoutFunctions,
    stripQuotes,
    wrapNumberValidatorsForLevelBuilder,
    escapeText
} from '@cdo/apps/utils';

describe('utils modules', () => {
  describe('the isSubsequence function', () => {
    it("returns false when the subsequence is not a subsequence", () => {
      expect(isSubsequence([1,2,3], [5])).to.be.false;
      expect(isSubsequence([1,2,3], [1,2,3,5])).to.be.false;
      expect(isSubsequence([1,2,3], [1,2,2])).to.be.false;
      expect(isSubsequence([1,2,3], [3, 2])).to.be.false;
    });

    it("returns true when the subsequence is a subsequence", () => {
      expect(isSubsequence([1,2,3], [])).to.be.true;
      expect(isSubsequence([1,2,3], [1])).to.be.true;
      expect(isSubsequence([1,2,3], [2])).to.be.true;
      expect(isSubsequence([1,2,3], [3])).to.be.true;
      expect(isSubsequence([1,2,3], [1,2])).to.be.true;
      expect(isSubsequence([1,2,3], [2,3])).to.be.true;
      expect(isSubsequence([1,2,3], [1,3])).to.be.true;
      expect(isSubsequence([1,2,3], [1,2,3])).to.be.true;
    });
  });

  describe('shallowCopy', function () {
    it("makes a shallow copy of an object", function () {
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

  describe('cloneWithoutFunctions', function () {
    it('strips functions from an object', function () {
      const originalObject = {
        num: 2,
        func: function () {}
      };
      const newObject = cloneWithoutFunctions(originalObject);
      expect(newObject).not.to.equal(originalObject);
      expect(newObject.num).to.equal(originalObject.num);
      expect(newObject.func).to.be.undefined;
    });
  });

  describe("String.prototype.repeat", function () {
    it ("returns a string that is n copies of the original string", function () {
      assert.equal('aaa', 'a'.repeat(3));
      assert.equal('abcabc', 'abc'.repeat(2));
    });

    it ("uses floor of count for non-integer counts", function () {
      assert.equal('aaa', 'a'.repeat(3.1));
      assert.equal('aaa', 'a'.repeat(3.9));
    });

    it ("returns empty string when given a zero count", function () {
      assert.equal('', 'a'.repeat(0));
    });

    it ("returns empty string when repeating an empty string", function () {
      assert.equal('', ''.repeat(20));
    });

    it ("throws RangeError when given a negative count", function () {
      assert.throws(function () {
        'a'.repeat(-1);
      }, RangeError);
    });

    it ("throws RangeError when given an infinity count", function () {
      assert.throws(function () {
        'a'.repeat(Infinity);
      }, RangeError);
    });

    // Note: Was going to text maximum output string length, but implementation
    //       does not appear to be consistent across browsers.  Our polyfill
    //       limits output of this method to 1 << 28 characters.
  });

  describe("Function.prototype.inherits", function () {
    var A, B, C;

    beforeEach(function () {
      A = function () {
        this.usedConstructorA = true;
      };

      B = function () {
        this.usedConstructorB = true;
        this.onConstructB();
      };
      B.inherits(A);
      B.prototype.onConstructB = function () {};

      C = function () {
        this.usedConstructorC = true;
        this.onConstructC();
      };
      C.inherits(B);
      C.prototype.onConstructC = function () {};
    });

    it ("establishes a correct prototype chain", function () {
      var a = new A();
      assert(a instanceof A, "a instanceof A");
      assert(!(a instanceof B), "!(a instanceof B)");
      assert(!(a instanceof C), "!(a instanceof C)");

      var b = new B();
      assert(b instanceof A, "b instanceof A");
      assert(b instanceof B, "b instanceof B");
      assert(!(b instanceof C), "!(b instanceof C)");

      var c = new C();
      assert(c instanceof A, "c instanceof A");
      assert(c instanceof B, "c instanceof B");
      assert(c instanceof C, "c instanceof C");
    });

    it ("sets the object's constructor property correctly", function () {
      // Object's constructor property should always end up set to the
      // function that constructed it.
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/
      //       Reference/Global_Objects/Object/constructor
      var a = new A();
      assert(a.constructor === A, "a.constructor === A");

      var b = new B();
      assert(b.constructor === B, "b.constructor === B");

      var c = new C();
      assert(c.constructor === C, "c.constructor === C");
    });

    it ("calls only the current constructor by default", function () {
      var a = new A();
      assert(a.usedConstructorA === true, "a.usedConstructorA === true");

      var b = new B();
      assert(b.usedConstructorA !== true, "b.usedConstructorA !== true");
      assert(b.usedConstructorB === true, "b.usedConstructorB === true");

      var c = new C();
      assert(c.usedConstructorA !== true, "c.usedConstructorA !== true");
      assert(c.usedConstructorB !== true, "c.usedConstructorB !== true");
      assert(c.usedConstructorC === true, "c.usedConstructorC === true");
    });

    it ("can chain constructor calls", function () {
      B.prototype.onConstructB = function () {
        A.call(this);
      };

      C.prototype.onConstructC = function () {
        B.call(this);
      };

      var b = new B();
      assert(b.usedConstructorA === true, "b.usedConstructorA === true");
      assert(b.usedConstructorB === true, "b.usedConstructorB === true");

      var c = new C();
      assert(c.usedConstructorA === true, "c.usedConstructorA === true");
      assert(c.usedConstructorB === true, "c.usedConstructorB === true");
      assert(c.usedConstructorC === true, "c.usedConstructorC === true");
    });

    it ("exposes superPrototype for chaining methods", function () {
      A.prototype.noise = function () {
        return "fizz";
      };

      B.prototype.noise = function () {
        return B.superPrototype.noise.call(this) + "bang";
      };

      C.prototype.noise = function () {
        return C.superPrototype.noise.call(this) + "pop";
      };

      var a = new A();
      assert(a.noise() === "fizz", "a.noise() === 'fizz'");

      var b = new B();
      assert(b.noise() === "fizzbang", "b.noise() === 'fizzbang'");

      var c = new C();
      assert(c.noise() === "fizzbangpop", "c.noise() === 'fizzbangpop'");
    });
  });

  describe('stripQuotes', function () {
    it("can remove quotes from a string", function () {
      assert(stripQuotes("t'e's't'") === "test");
      assert(stripQuotes('t"e"s"t"') === "test");
      assert(stripQuotes('test') === "test");
      assert(stripQuotes('') === '');
    });
  });

  describe('wrapNumberValidatorsForLevelBuilder', function () {
    let oldBlockly;

    beforeEach(function () {
      // Blockly hasn't actually been loaded at this point, but we can simulate it.
      // First stash the current blockly in case things change and we do have it
      // loaded.
      oldBlockly = global.Blockly;
    });

    afterEach(function () {
      global.Blockly = oldBlockly;
    });

    it("will allow ??? in number validators after being wrapped", function () {
      global.Blockly = {
        FieldTextInput: {
          // fake our validators
          nonnegativeIntegerValidator: function (text) {
            return isNaN(text) ? null : text;
          },
          numberValidator: function (text) {
            return isNaN(text) ? null : text;
          }
        }
      };

      assert.equal(Blockly.FieldTextInput.nonnegativeIntegerValidator('123'), 123);
      assert.equal(Blockly.FieldTextInput.numberValidator('123'), 123);
      assert.equal(Blockly.FieldTextInput.nonnegativeIntegerValidator('???'), null);
      assert.equal(Blockly.FieldTextInput.numberValidator('???'), null);
      wrapNumberValidatorsForLevelBuilder();
      assert.equal(Blockly.FieldTextInput.nonnegativeIntegerValidator('123'), 123);
      assert.equal(Blockly.FieldTextInput.numberValidator('123'), 123);
      assert.equal(Blockly.FieldTextInput.nonnegativeIntegerValidator('???'), '???');
      assert.equal(Blockly.FieldTextInput.numberValidator('???'), '???');
    });
  });

  describe('escapeText', function () {
    it('no-op on empty string', function () {
      assert.equal('', escapeText(''));
    });

    it('no-op on alphanumeric string', function () {
      var alphabet = 'abcdefghijklmnopqrstuvwxyz';
      var digits = '0123456789';
      var testString = alphabet + alphabet.toUpperCase() + digits;
      assert.equal(testString, escapeText(testString));
    });

    it('replaces all & with &amp;', function () {
      assert.equal('&amp;', escapeText('&'));
      assert.equal('&amp;&amp;', escapeText('&&'));
      assert.equal('&amp;nbsp;', escapeText('&nbsp;'));
    });

    it('replaces all < with &lt;', function () {
      assert.equal('&lt;', escapeText('<'));
      assert.equal('&lt;&lt;', escapeText('<<'));
      assert.equal('&lt;div', escapeText('<div'));
    });

    it('replaces all > with &gt;', function () {
      assert.equal('&gt;', escapeText('>'));
      assert.equal('&gt;&gt;', escapeText('>>'));
      assert.equal('/&gt;', escapeText('/>'));
    });

    it('breaks up all doubled spaces with &nbsp;', function () {
      assert.equal(' ', escapeText(' '));
      assert.equal(' &nbsp;', escapeText('  '));
      assert.equal(' &nbsp; ', escapeText('   '));
      assert.equal(' &nbsp; &nbsp;', escapeText('    '));
    });

    it('Escapes already-escaped content', function () {
      assert.equal('&amp;amp; &amp;nbsp; &amp;gt; &amp;lt;',
          escapeText('&amp; &nbsp; &gt; &lt;'));
    });

    it('Wraps second and subsequent lines in <div>, removing line breaks', function () {
      var input = [
        'Line 1',
        'Line 2',
        'Line 3'
      ].join('\n');
      var expected = 'Line 1<div>Line 2</div><div>Line 3</div>';
      assert.equal(expected, escapeText(input));
    });

    it('Uses <br> for blank first line when handling multiple lines', function () {
      var input = [
        '',
        'Line 2',
        'Line 3'
      ].join('\n');
      var expected = '<br><div>Line 2</div><div>Line 3</div>';
      assert.equal(expected, escapeText(input));
    });

    it('Adds <br> to every other blank line', function () {
      var input, expected;

      input = [
        'Line 1',
        '',
        'Line 3'
      ].join('\n');
      expected = 'Line 1<div><br></div><div>Line 3</div>';
      assert.equal(expected, escapeText(input));

      input = [
        'Line 1',
        'Line 2',
        ''
      ].join('\n');
      expected = 'Line 1<div>Line 2</div><div><br></div>';
      assert.equal(expected, escapeText(input));

      input = [
        '',
        '',
        ''
      ].join('\n');
      expected = '<br><div><br></div><div><br></div>';
      assert.equal(expected, escapeText(input));
    });
  });
});
