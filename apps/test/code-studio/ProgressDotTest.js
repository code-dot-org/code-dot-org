import 'babel-polyfill';

import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';

import { ProgressDot, BubbleInterior } from '@cdo/apps/code-studio/components/progress/progress_dot';
import color from '@cdo/apps/color';

/**
 * Combine the given styles array like Radium.
 */
function radiumHelper(styles) {
  return Object.assign({}, ...styles);
}

describe('ProgressDot component tests', () => {
  let renderer, level;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
    level = {
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
      <ProgressDot level={level} saveAnswersBeforeNavigation={true} />
    );

    const result = renderer.getRenderOutput();
    expect(result.type).to.equal('a');
    expect(result.props.onClick).to.be.a('function');
  });

  it('highlights the current level on the course overview page', () => {
    renderer.render(
      <ProgressDot level={level} saveAnswersBeforeNavigation={false} currentLevelId="123" courseOverviewPage={true} />
    );

    const result = renderer.getRenderOutput();
    expect(result.props.onClick).to.not.be.a('function');
    expect(radiumHelper(result.props.children[0].props.style).borderColor).to.equal(color.level_current);
  });

  it('does not highlight the current level in single-stage view', () => {
    renderer.render(
      <ProgressDot level={level} saveAnswersBeforeNavigation={false} currentLevelId="123" />
    );

    const result = renderer.getRenderOutput();
    expect(radiumHelper(result.props.children[0].props.style).borderColor).to.equal(color.lighter_gray);
  });

  it('bubble interior renders level title if not on overview page and not showing an icon', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior title={level.title} courseOverviewPage={false} showingIcon={false} showingLevelName={true} />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('1');
  });

  it('bubble interior renders title if not showing level name nor level icon', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior title={level.title} courseOverviewPage={true} showingIcon={false} showingLevelName={false} />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('1');
  });

  it('bubble interior renders nothing for named levels with icons', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior title={level.title} courseOverviewPage={true} showingIcon={true} showingLevelName={true} />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('');
  });

  it('bubble interior renders &nbsp for named levels without icons', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior title={level.title} courseOverviewPage={true} showingIcon={false} showingLevelName={true} />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('&nbsp;');
  });
});
