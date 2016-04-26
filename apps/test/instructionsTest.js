var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();
var ReactTestUtils = require('react-addons-test-utils');

var MarkdownInstructions = require('@cdo/apps/templates/instructions/MarkdownInstructions');
var NonMarkdownInstructions = require('@cdo/apps/templates/instructions/NonMarkdownInstructions');
var instructions = require('@cdo/apps/redux/instructions');

function shallowRender(element) {
  var renderer = ReactTestUtils.createRenderer();
  renderer.render(element);
  return renderer.getRenderOutput();
}

describe('MarkdownInstructions', function () {
  it('standard case had top padding and no left margin', function () {
    var dom = ReactTestUtils.renderIntoDocument(
      <div>
        <MarkdownInstructions
          renderedMarkdown="md"
          markdownClassicMargins={false}
          inTopPane={false}/>
      </div>
    );
    var element = dom.children[0];
    assert.equal(element.style.paddingTop, '19px');
    assert.equal(element.style.marginLeft, '');
    assert.equal(element.textContent, 'md');
  });

  it('inTopPane has no top padding', function () {
    var dom = ReactTestUtils.renderIntoDocument(
      <div>
        <MarkdownInstructions
          renderedMarkdown="md"
          markdownClassicMargins={false}
          inTopPane={true}/>
      </div>
    );
    var element = dom.children[0];
    assert.equal(element.style.paddingTop, '0px');
  });

  it('markdownClassicMargins has no top padding and big left margin', function () {
    var dom = ReactTestUtils.renderIntoDocument(
      <div>
        <MarkdownInstructions
          renderedMarkdown="md"
          markdownClassicMargins={true}
          inTopPane={false}/>
      </div>
    );
    var element = dom.children[0];
    assert.equal(element.style.paddingTop, '0px');
    assert.equal(element.style.marginLeft, '90px');
  });
});

describe('NonMarkdownInstructions', function () {
  it('can have just instructions', function () {
    var dom = ReactTestUtils.renderIntoDocument(
      <div>
        <NonMarkdownInstructions
          puzzleTitle="title"
          instructions="instructions"/>
      </div>
    );
    var element = dom.children[0];
    assert.equal(element.children.length, 2);
    assert.equal(element.children[0].textContent, "title");
    assert.equal(element.children[1].textContent, "instructions");

  });

  it('can have both instructions and instructions2', function () {
    var dom = ReactTestUtils.renderIntoDocument(
      <div>
        <NonMarkdownInstructions
          puzzleTitle="title"
          instructions="instructions"
          instructions2="instructions2"/>
      </div>
    );
    var element = dom.children[0];
    assert.equal(element.children.length, 3);
    assert.equal(element.children[0].textContent, "title");
    assert.equal(element.children[1].textContent, "instructions");
    assert.equal(element.children[2].textContent, "instructions2");
  });
});

describe('instructions reducer', function () {
  var reducer = instructions.default;

  it('starts out uncollapsed', function () {
    var state = reducer(null, {});
    assert.deepEqual(state, {
      collapsed: false,
      height: 300,
      maxHeight: 0
    });
  });

  it('toggles collapsed', function () {
    var initialState, newState;

    // start collapsed
    initialState = {
      collapsed: false,
      height: 300,
      maxHeight: 0
    };
    newState = reducer(initialState, instructions.toggleInstructionsCollapsed());
    assert.deepEqual(newState, {
      collapsed: true,
      height: 300,
      maxHeight: 0
    });

    // start uncollapsed
    initialState = {
      collapsed: true,
      height: 300,
      maxHeight: 0
    };
    newState = reducer(initialState, instructions.toggleInstructionsCollapsed());
    assert.deepEqual(newState, {
      collapsed: false,
      height: 300,
      maxHeight: 0
    });
  });

  it('modifies height', function () {
    var initialState, newState;
    initialState = {
      collapsed: false,
      height: 300,
      maxHeight: 0
    };
    newState = reducer(initialState, instructions.setInstructionsHeight(200));
    assert.deepEqual(newState, {
      collapsed: false,
      height: 200,
      maxHeight: 0
    });
  });

  it('modifies maxHeight', function () {
    var initialState, newState;
    initialState = {
      collapsed: false,
      height: 300,
      maxHeight: 0
    };
    newState = reducer(initialState, instructions.setInstructionsMaxHeight(400));
    assert.deepEqual(newState, {
      collapsed: false,
      height: 300,
      maxHeight: 400
    });
  });
});
