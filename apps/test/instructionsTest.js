var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();
var ReactTestUtils = require('react-addons-test-utils');

var MarkdownInstructions = require('@cdo/apps/templates/instructions/MarkdownInstructions.jsx');
var NonMarkdownInstructions = require('@cdo/apps/templates/instructions/NonMarkdownInstructions.jsx');

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
