var testUtils = require('./util/testUtils');
var xml = require('@cdo/apps/xml');

testUtils.setupLocales();

var utils = require('@cdo/apps/utils');
var requiredBlockUtils = require('@cdo/apps/required_block_utils');
var blockUtils = require('@cdo/apps/block_utils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;
var _ = require('lodash');
var mazeUtils = require('@cdo/apps/maze/mazeUtils');

describe("String.prototype.repeat", function () {
  it ("returns a string that is n copies of the original string", function () {
    assertEqual('aaa', 'a'.repeat(3));
    assertEqual('abcabc', 'abc'.repeat(2));
  });

  it ("uses floor of count for non-integer counts", function () {
    assertEqual('aaa', 'a'.repeat(3.1));
    assertEqual('aaa', 'a'.repeat(3.9));
  });

  it ("returns empty string when given a zero count", function () {
    assertEqual('', 'a'.repeat(0));
  });

  it ("returns empty string when repeating an empty string", function () {
    assertEqual('', ''.repeat(20));
  });

  it ("throws RangeError when given a negative count", function () {
    assertThrows(RangeError, function () {
      'a'.repeat(-1);
    });
  });

  it ("throws RangeError when given an infinity count", function () {
    assertThrows(RangeError, function () {
      'a'.repeat(Infinity);
    });
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

describe("utils", function() {
  it("can debounce a repeated function call", function() {
    var counter = 0;
    var incrementCounter = function () { counter++; };
    var debounced = _.debounce(incrementCounter, 2000, true);
    debounced();
    debounced();
    debounced();
    debounced();
    assert(counter === 1);
    incrementCounter();
    assert(counter === 2);
  });
  it("can remove quotes from a string", function() {
    assert(utils.stripQuotes("t'e's't'") === "test");
    assert(utils.stripQuotes('t"e"s"t"') === "test");
    assert(utils.stripQuotes('test') === "test");
    assert(utils.stripQuotes('') === '');
  });

  it("will allow ??? in number validators after being wrapped", function () {
    // Blockly hasn't actually been loaded at this point, but we can simulate it.
    // First stash the current blockly in case things change and we do have it
    // loaded.
    var oldBlockly = global.Blockly;
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
    utils.wrapNumberValidatorsForLevelBuilder();
    assert.equal(Blockly.FieldTextInput.nonnegativeIntegerValidator('123'), 123);
    assert.equal(Blockly.FieldTextInput.numberValidator('123'), 123);
    assert.equal(Blockly.FieldTextInput.nonnegativeIntegerValidator('???'), '???');
    assert.equal(Blockly.FieldTextInput.numberValidator('???'), '???');

    global.Blockly = oldBlockly;
  });
});

describe("blockUtils", function () {
  beforeEach(function () {
    testUtils.setupTestBlockly();
  });

  it("can create a block from XML", function () {
    var blockXMLString = '<block type="math_number"><title name="NUM">10</title></block>';
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
    var newBlock = blockUtils.domStringToBlock(blockXMLString);
    assert(Blockly.mainBlockSpace.getBlockCount() === 1);
    assert(newBlock.getTitleValue('NUM') === '10');
    assert(newBlock.getTitles().length === 1);
  });

  it("can create a block from XML and remove it from the workspace", function () {
    var blockXMLString = '<block type="math_number"><title name="NUM">10</title></block>';
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
    var newBlock = blockUtils.domStringToBlock(blockXMLString);
    assert(Blockly.mainBlockSpace.getBlockCount() === 1);
    newBlock.dispose();
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
  });
});

describe("requiredBlockUtils", function () {
  beforeEach(function () {
    testUtils.setupTestBlockly();
  });

  it("can recognize matching titles in blocks", function () {
    var blockUserString = '<block type="math_number"><title name="NUM">10</title></block>';
    var blockUser = blockUtils.domStringToBlock(blockUserString);
    var blockRequiredString = '<block type="math_number"><title name="NUM">10</title></block>';
    var blockRequired = blockUtils.domStringToBlock(blockRequiredString);
    assert(blockUser.getTitles().length === 1);
    assert(blockRequired.getTitles().length === 1);
    assert(requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
  });

  it("can recognize non-matching titles in blocks", function () {
    var blockUser = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">10</title></block>');
    var blockRequired = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">11</title></block>');
    assert(!requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
    assert(!requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it("can recognize matching entire blocks", function () {
    var blockUser = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">10</title></block>');
    var blockRequired = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">10</title></block>');
    assert(requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it("can recognize mismatching block types", function () {
    var blockUser = blockUtils.domStringToBlock('<block type="logic_boolean"></block>');
    var blockRequired = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">10</title></block>');
    assert(!requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it("can recognize matching titles in blocks with multiple titles", function () {
    var blockUser = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">1</title><title name="B">2</title><title name="C">3</title></block>');
    var blockRequired = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="C">3</title><title name="B">2</title><title name="A">1</title></block>');
    assert(requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
  });

  it("can recognize mis-matching titles in blocks with differing Aber of titles", function () {
    var blockUser = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">1</title></block>');
    var blockRequired = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">1</title><title name="B">2</title><title name="C">3</title></block>');
    assert(!requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
    assert(!requiredBlockUtils.blockTitlesMatch(blockRequired, blockUser));
  });

  it("can recognize mis-matching titles in with multiple titles", function () {
    var blockUser = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">1</title><title name="B">2</title></block>');
    var blockRequired = blockUtils.domStringToBlock('<block type="block_with_3_titles"><title name="A">2</title><title name="B">1</title></block>');
    assert(!requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
  });
});

describe("mazeUtils", function () {
  var cellId = mazeUtils.cellId;

  it("can generate the correct cellIds", function () {
    assert.equal(cellId('dirt', 0, 0), 'dirt_0_0');
    assert.equal(cellId('dirt', 2, 4), 'dirt_2_4');
    assert.equal(cellId('dirt', 1, 5), 'dirt_1_5');
    assert.equal(cellId('dirt', 3, 1), 'dirt_3_1');
  });
});

describe('forceInsertTopBlock', function () {
  it("no blocks", function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"/></xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"/></xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);
  });

  it ("single block", function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="foo"/>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"><next>' +
      withoutXml + '</next></block></xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"><next>' +
      withoutXml + '</next></block></xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

  });

  it ("two unattached blocks", function () {
    var withXml, withoutXml, result, expected, msg;
    var block1 = '<block type="foo"/>';
    var block2 = '<block type="foo2"/>';
    withoutXml = block1 + block2;
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"><next>' + block1 +
      '</next></block>' + block2 + '</xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"><next>' + block1 +
      '</next></block>' + block2 + '</xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);
  });

  it("two attached blocks", function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="foo"><next><block type="foo2"/></next></block>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"><next>' +
        withoutXml + '</next></block></xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"><next>' +
        withoutXml + '</next></block></xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);
  });

  it("two function blocks", function () {
    var withXml, withoutXml, result, expected, msg;
    var block1 = '<block type="procedures_defnoreturn"/>';
    var block2 = '<block type="procedures_defnoreturn"/>';
    withoutXml = block1 + block2;
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"/>' + block1 +
      block2 + '</xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected = '<xml><block type="when_run" movable="false" deletable="false"/>' + block1 +
        block2 + '</xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);
  });

  it("already has a when_run", function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="when_run" movable="false" deletable="false"><next><block type="foo"/></next></block>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected = withoutXml;
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected = withXml;
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);
  });

  it ("insert functional_compute", function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="foo"/>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'functional_compute');
    expected = '<xml><block type="functional_compute" movable="false" deletable="false">' +
      '<functional_input name="ARG1">' + withoutXml + '</functional_input></block></xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'functional_compute');
    expected = '<xml><block type="functional_compute" movable="false" deletable="false">' +
        '<functional_input name="ARG1">' + withoutXml + '</functional_input></block></xml>';
    msg = "\n" +
      "result: " + result + "\n" +
      "expect: " + expected + "\n";
    assert(result === expected, msg);

  });

});
