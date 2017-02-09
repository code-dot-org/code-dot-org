import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import saveAnswers from '@cdo/apps/code-studio//levels/saveAnswers';
import $ from 'jquery';

import { ProgressDot, BubbleInterior } from '@cdo/apps/code-studio/components/progress/progress_dot';
import { LevelStatus } from '@cdo/apps/code-studio/activityUtils';
import color from '@cdo/apps/util/color';

// If we set a color as something like #fff, the browser converts it to rgb(255, 255, 255)
// This is a semi-hacky helper function that allows us to get the rgb string for a color
function colorToRgb(color) {
  return $("<div>").css("background-color", color)[0].style.backgroundColor;
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
      kind: 'puzzle',
      url: '/test-url'
    };

    sinon.stub(saveAnswers, 'saveAnswersAndNavigate');
  });

  afterEach(() => {
    saveAnswers.saveAnswersAndNavigate.restore();
  });

  it('calls saveAnswersAndNavigate onClick when saveAnswersBeforeNavigation is true', () => {
    const dot = (
      <ProgressDot
        level={level}
        status={LevelStatus.attempted}
        saveAnswersBeforeNavigation={true}
        showProgress={true}
      />
    );
    renderer.render(dot);

    const result = renderer.getRenderOutput();
    expect(result.type).to.equal('a');
    expect(result.props.onClick).to.be.a('function');

    const element = ReactTestUtils.renderIntoDocument(dot);
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(element));

    expect(saveAnswers.saveAnswersAndNavigate.called).to.equal(true);
  });

  it('does not calls saveAnswersAndNavigate onClick when saveAnswersBeforeNavigation is false', () => {
    const dot = (
      <ProgressDot
        level={level}
        status={LevelStatus.attempted}
        saveAnswersBeforeNavigation={false}
        showProgress={true}
      />
    );
    renderer.render(dot);

    const result = renderer.getRenderOutput();
    expect(result.type).to.equal('a');
    expect(result.props.href).to.be.a('string');
    expect(result.props.onClick).to.be.a('function');

    const element = ReactTestUtils.renderIntoDocument(dot);
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(element));

    expect(saveAnswers.saveAnswersAndNavigate.called).to.equal(false);
  });

  it('has no href for locked levels', () => {
    const dot = (
      <ProgressDot
        level={level}
        status={LevelStatus.locked}
        saveAnswersBeforeNavigation={false}
        showProgress={true}
      />
    );
    renderer.render(dot);

    const result = renderer.getRenderOutput();
    expect(result.type).to.equal('a');
    expect(result.props.href).to.equal(undefined);
    expect(result.props.onClick).to.be.a('function');

    const element = ReactTestUtils.renderIntoDocument(dot);
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(element));

    expect(saveAnswers.saveAnswersAndNavigate.called).to.equal(false);
  });

  it('highlights the current level on the course overview page', () => {
    renderer.render(
      <ProgressDot
        level={level}
        status={LevelStatus.attempted}
        saveAnswersBeforeNavigation={false}
        currentLevelId="123"
        courseOverviewPage={true}
        showProgress={true}
      />
    );

    const result = renderer.getRenderOutput();
    expect(result.props.children[0].props.style.borderColor).to.equal(color.level_current);
  });

  it('does not highlight the current level in single-stage view', () => {
    renderer.render(
      <ProgressDot
        level={level}
        status={LevelStatus.attempted}
        saveAnswersBeforeNavigation={false}
        currentLevelId="123"
        showProgress={true}
      />
    );

    const result = renderer.getRenderOutput();
    expect(result.props.children[0].props.style.borderColor).to.equal(color.lighter_gray);
  });

  it('bubble interior renders title if not showing level name nor level icon', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior
        title={level.title}
        status={LevelStatus.attempted}
        showingIcon={false}
        showingLevelName={false}
      />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('1');
  });

  it('bubble interior renders nothing for named levels with icons', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior
        title={level.title}
        showingIcon={true}
        showingLevelName={true}
      />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('');
  });

  it('bubble interior renders &nbsp for named levels without icons', () => {
    const result = ReactTestUtils.renderIntoDocument(
      <BubbleInterior
        title={level.title}
        showingIcon={false}
        showingLevelName={true}
      />
    );

    expect(ReactDOM.findDOMNode(result).innerHTML).to.equal('&nbsp;');
  });
});
