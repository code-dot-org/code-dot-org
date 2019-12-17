import {assert} from '../util/deprecatedChai';

var Eval = require('@cdo/apps/eval/eval');
var EvalText = require('@cdo/apps/eval/evalText');
var EvalMulti = require('@cdo/apps/eval/evalMulti');
var EvalTriangle = require('@cdo/apps/eval/evalTriangle');

function withSvgInDom() {
  let svg;

  beforeEach(() => {
    assert.isNull(document.getElementById('svg'));
    svg = document.createElement('svg');
    svg.id = 'svg';
    document.body.appendChild(svg);
  });

  afterEach(() => {
    document.body.removeChild(svg);
    assert.isNull(document.getElementById('svg'));
  });
}

describe('getTextStringsFromObject_', function() {
  withSvgInDom();

  it('from simple text object', function() {
    var evalObject = new EvalText('mytext', 14, 'red');
    assert.deepEqual(Eval.getTextStringsFromObject_(evalObject), ['mytext']);
  });

  it('single string in a multi object', function() {
    var triangle = new EvalTriangle(50, 'solid', 'red');
    var text = new EvalText('math is FUN', 18, 'blue');
    var multi = new EvalMulti(triangle, text);
    assert.deepEqual(Eval.getTextStringsFromObject_(multi), ['math is FUN']);
  });

  it('multiple strings in a multi object', function() {
    var text1 = new EvalText('i like math', 18, 'blue');
    var text2 = new EvalText('i like math more', 18, 'blue');
    var multi = new EvalMulti(text1, text2);
    assert.deepEqual(Eval.getTextStringsFromObject_(multi), [
      'i like math',
      'i like math more'
    ]);
  });

  it('from nested multis', function() {
    var child1 = new EvalMulti(
      new EvalText('one', 12, 'red'),
      new EvalText('two', 12, 'red')
    );
    var child2 = new EvalMulti(
      new EvalText('three', 12, 'red'),
      new EvalText('four', 12, 'red')
    );
    var multi = new EvalMulti(child1, child2);
    assert.deepEqual(Eval.getTextStringsFromObject_(multi), [
      'one',
      'two',
      'three',
      'four'
    ]);
  });
});

describe('haveCaseMismatch_', function() {
  withSvgInDom();

  it('reports false for different text', function() {
    var text1 = new EvalText('one', 12, 'red');
    var text2 = new EvalText('two', 12, 'red');

    assert.equal(Eval.haveCaseMismatch_(text1, text2), false);
  });

  it('reports false for identical text', function() {
    var text1 = new EvalText('one', 12, 'red');
    var text2 = new EvalText('one', 12, 'red');

    assert.equal(Eval.haveCaseMismatch_(text1, text2), false);
  });

  it('reports true for case mismatched text', function() {
    var text1 = new EvalText('one', 12, 'red');
    var text2 = new EvalText('ONE', 12, 'red');

    assert.equal(Eval.haveCaseMismatch_(text1, text2), true);
  });

  it('reports false when different number of strings', function() {
    var obj1 = new EvalMulti(
      new EvalText('one', 12, 'red'),
      new EvalText('two', 12, 'red')
    );
    var obj2 = new EvalText('ONE', 12, 'red');
    assert.equal(Eval.haveCaseMismatch_(obj1, obj2), false);
  });

  it('reports false when we have a mismatch and a wrong string', function() {
    var obj1 = new EvalMulti(
      new EvalText('one', 12, 'red'),
      new EvalText('two', 12, 'red')
    );
    var obj2 = new EvalMulti(
      new EvalText('ONE', 12, 'red'),
      new EvalText('not two', 12, 'red')
    );

    assert.equal(Eval.haveCaseMismatch_(obj1, obj2), false);
  });
});

describe('haveBooleanMismatch_', function() {
  withSvgInDom();

  it('reports false if both bools are true', function() {
    var text1 = new EvalText('true', 12, 'red');
    var text2 = new EvalText('true', 12, 'red');

    assert.equal(Eval.haveBooleanMismatch_(text1, text2), false);
  });

  it('reports false if both bools are false', function() {
    var text1 = new EvalText('false', 12, 'red');
    var text2 = new EvalText('false', 12, 'red');

    assert.equal(Eval.haveBooleanMismatch_(text1, text2), false);
  });

  it('reports true if first is true, second is false', function() {
    var text1 = new EvalText('true', 12, 'red');
    var text2 = new EvalText('false', 12, 'red');

    assert.equal(Eval.haveBooleanMismatch_(text1, text2), true);
  });

  it('reports true if first is false, second is true', function() {
    var text1 = new EvalText('true', 12, 'red');
    var text2 = new EvalText('false', 12, 'red');

    assert.equal(Eval.haveBooleanMismatch_(text1, text2), true);
  });
});
