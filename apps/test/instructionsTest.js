var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();
var ReactTestUtils = require('react-addons-test-utils');

var MarkdownInstructions = require('@cdo/apps/templates/instructions/MarkdownInstructions.jsx');

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
