import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import $ from 'jquery';

import { ProgressDot, BubbleInterior } from '@cdo/apps/code-studio/components/progress/progress_dot';
import color from '@cdo/apps/util/color';

// If we set a color as something like #fff, the browser converts it to rgb(255, 255, 255)
// This is a semi-hacky helper function that allows us to get the rgb string for a color
function colorToRgb(color) {
  return $("<div>").css("background-color", color)[0].style.backgroundColor;
}

describe('ProgressDot component tests', () => {
  let renderer, attemptedLevel;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
    attemptedLevel = {
      ids: [123],
      uid: '123',
      title: 1,
      name: 'Test Level',
      status: 'attempted',
      kind: 'puzzle',
      url: '/test-url'
    };
  });

  it('adds an onClick handler when saveAnswersBeforeNavigation is true', () => {
    renderer.render(
      <ProgressDot level={attemptedLevel} saveAnswersBeforeNavigation={true} showProgress={true}/>
    );

    const result = renderer.getRenderOutput();
    expect(result.type).to.equal('a');
    expect(result.props.onClick).to.be.a('function');
  });

  it('highlights the current level on the course overview page', () => {
    renderer.render(
      <ProgressDot level={attemptedLevel} saveAnswersBeforeNavigation={false} currentLevelId="123" courseOverviewPage={true} showProgress={true}/>
    );

    const result = renderer.getRenderOutput();
    expect(result.props.onClick).to.not.be.a('function');
    expect(result.props.children[0].props.style.borderColor).to.equal(color.level_current);
  });

  it('does not highlight the current level in single-stage view', () => {
    renderer.render(
      <ProgressDot level={attemptedLevel} saveAnswersBeforeNavigation={false} currentLevelId="123" showProgress={true}/>
    );

    const result = renderer.getRenderOutput();
    expect(result.props.children[0].props.style.borderColor).to.equal(color.lighter_gray);
  });

  it('bubble interior renders title if not showing level name nor level icon', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior title={attemptedLevel.title} showingIcon={false} showingLevelName={false} />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('1');
  });

  it('bubble interior renders nothing for named levels with icons', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior title={attemptedLevel.title} showingIcon={true} showingLevelName={true} />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('');
  });

  it('bubble interior renders &nbsp for named levels without icons', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior title={attemptedLevel.title} showingIcon={false} showingLevelName={true} />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('&nbsp;');
  });

  it('provides a lock icon for a lockable assessment', () => {
    const component = (
      <ProgressDot
        courseOverviewPage={true}
        showProgress={true}
        saveAnswersBeforeNavigation={false}
        level={{
          icon: null,
          ids: [5275],
          kind: 'assessment',
          next: [2, 1],
          position: 1,
          previous: false,
          status: 'locked',
          title: 1,
          uid: '5275_0',
          url: '/test-url'
        }}
      />
    );

    const result = ReactTestUtils.renderIntoDocument(component);
    const node = ReactDOM.findDOMNode(result);
    expect(node.children[0].getAttribute('class')).to.match(/fa-lock/);
  });

  it('stays white if showProgress is false', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <ProgressDot
        level={attemptedLevel}
        saveAnswersBeforeNavigation={false}
        showProgress={false}
      />
    );

    const dom = ReactDOM.findDOMNode(result);
    expect(dom.childNodes[0].style.backgroundColor).to.equal(colorToRgb(color.level_not_tried));
  });

  it('turns gray if grayProgress is true', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <ProgressDot
        level={attemptedLevel}
        saveAnswersBeforeNavigation={false}
        showProgress={true}
        grayProgress={true}
      />
    );

    const dom = ReactDOM.findDOMNode(result);
    expect(dom.childNodes[0].style.backgroundColor).to.equal(colorToRgb(color.lightest_gray));
  });
});
