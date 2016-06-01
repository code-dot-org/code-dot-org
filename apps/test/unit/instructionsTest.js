import {assert} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();
import React from 'react';
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

describe('instructions reducer', () => {
  var reducer = instructions.default;

  it('starts out uncollapsed', () => {
    var state = reducer(undefined, {});
    assert.strictEqual(state.collapsed, false);
  });

  it('toggles collapsed', () => {
    var initialState, newState;

    // start collapsed
    initialState = {
      collapsed: false,
      longInstructions: 'foo'
    };
    newState = reducer(initialState, instructions.toggleInstructionsCollapsed());
    assert.strictEqual(newState.collapsed, true);

    // start uncollapsed
    initialState = {
      collapsed: true,
      longInstructions: 'foo'
    };
    newState = reducer(initialState, instructions.toggleInstructionsCollapsed());
    assert.strictEqual(newState.collapsed, false);
  });

  it('fails to collapse if no long instructions', () => {
    var initialState, newState;

    // start collapsed
    initialState = {
      collapsed: false,
      shortInstructions: 'short',
      longInstructions: undefined
    };
    assert.throws(() => {
      newState = reducer(initialState, instructions.toggleInstructionsCollapsed());
    });
  });

  it('setInstructionsRenderedHeight updates rendered and expanded height if not collapsed', () => {
    var initialState, newState;
    initialState = {
      collapsed: false,
      renderedHeight: 0,
      expandedHeight: 0
    };
    newState = reducer(initialState, instructions.setInstructionsRenderedHeight(200));
    assert.deepEqual(newState, {
      collapsed: false,
      renderedHeight: 200,
      expandedHeight: 200
    });
  });

  it('setInstructionsRenderedHeight updates only rendered height if collapsed', () => {
    var initialState, newState;
    initialState = {
      collapsed: true,
      renderedHeight: 0,
      expandedHeight: 0
    };
    newState = reducer(initialState, instructions.setInstructionsRenderedHeight(200));
    assert.deepEqual(newState, {
      collapsed: true,
      renderedHeight: 200,
      expandedHeight: 0
    });
  });


  it('setInstructionsMaxHeightNeeded sets maxNeededHeight', () => {
    var initialState, newState;
    initialState = {
      maxNeededHeight: 0
    };
    newState = reducer(initialState, instructions.setInstructionsMaxHeightNeeded(200));
    assert.deepEqual(newState, {
      maxNeededHeight: 200,
    });
  });

  it('setInstructionsMaxHeightAvailable updates maxAvailableHeight', () => {
    var initialState, newState;
    initialState = {
      maxAvailableHeight: Infinity,
      renderedHeight: 0,
      expandedHeight: 0
    };
    newState = reducer(initialState, instructions.setInstructionsMaxHeightAvailable(300));
    assert.deepEqual(newState, {
      maxAvailableHeight: 300,
      renderedHeight: 0,
      expandedHeight: 0
    });
  });

  it('setInstructionsMaxHeightAvailable adjusts rendered/expanded height if necessary', () => {
    var initialState, newState;
    initialState = {
      maxAvailableHeight: Infinity,
      renderedHeight: 400,
      expandedHeight: 400
    };
    newState = reducer(initialState, instructions.setInstructionsMaxHeightAvailable(300));
    assert.deepEqual(newState, {
      maxAvailableHeight: 300,
      renderedHeight: 300,
      expandedHeight: 300
    });
  });
});
