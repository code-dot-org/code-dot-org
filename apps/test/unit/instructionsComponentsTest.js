import {assert} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
testUtils.setExternalGlobals();
import React from 'react';
var ReactTestUtils = require('react-addons-test-utils');

import { StatelessMarkdownInstructions } from '@cdo/apps/templates/instructions/MarkdownInstructions';
import NonMarkdownInstructions from '@cdo/apps/templates/instructions/NonMarkdownInstructions';

function shallowRender(element) {
  var renderer = ReactTestUtils.createRenderer();
  renderer.render(element);
  return renderer.getRenderOutput();
}

describe('MarkdownInstructions', function () {
  testUtils.throwOnConsoleErrors();

  it('standard case had top padding and no left margin', function () {
    var dom = ReactTestUtils.renderIntoDocument(
      <div>
        <StatelessMarkdownInstructions
          renderedMarkdown="md"
          markdownClassicMargins={false}
          inTopPane={false}
          noInstructionsWhenCollapsed={true}
        />
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
        <StatelessMarkdownInstructions
          renderedMarkdown="md"
          inTopPane={true}
          noInstructionsWhenCollapsed={true}
        />
      </div>
    );
    var element = dom.children[0];
    assert.equal(element.style.paddingTop, '0px');
  });
});

describe('NonMarkdownInstructions', function () {
  it('can have just instructions', function () {
    var dom = ReactTestUtils.renderIntoDocument(
      <div>
        <NonMarkdownInstructions
          puzzleTitle="title"
          instructions="instructions"
        />
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
          instructions2="instructions2"
        />
      </div>
    );
    var element = dom.children[0];
    assert.equal(element.children.length, 3);
    assert.equal(element.children[0].textContent, "title");
    assert.equal(element.children[1].textContent, "instructions");
    assert.equal(element.children[2].textContent, "instructions2");
  });
});
