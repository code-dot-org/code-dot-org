import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import saveAnswers from '@cdo/apps/code-studio//levels/saveAnswers';

import { ProgressDot, BubbleInterior } from '@cdo/apps/code-studio/components/progress/ProgressDot';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';
import color from '@cdo/apps/util/color';

describe('ProgressDot component tests', () => {
  let renderer, level;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
    level = {
      ids: [123],
      uid: '123',
      title: 1,
      name: 'Test Level',
      kind: LevelKind.puzzle,
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

  describe('ProgressDot icons', () => {
    describe('peer reviews', () => {
      // Worth noting that peer review pages don't show any progress in the
      // header, so we'll never have courseOverviewPage={false}

      it('shows a locked icon for a locked peer review', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: 'fa-lock',
              kind: LevelKind.peer_review
            }}
            status={LevelStatus.locked}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('fa fa-lock');
      });

      it('shows no icon for uncompleted peer review', () => {
        renderer.render(
          <ProgressDot
            level={{
              // Current behavior is that we still have an icon in our level
              // object here
              icon: 'fa-lock',
              kind: LevelKind.peer_review
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('');
      });

      it('shows a checked icon for completed peer review', () => {
        renderer.render(
          <ProgressDot
            level={{
              // Current behavior is that we still have an icon in our level
              // object here
              icon: 'fa-lock',
              kind: LevelKind.peer_review
            }}
            status={LevelStatus.perfect}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('fa fa-check');
      });

      it('shows a checked icon for accepted peer review', () => {
        renderer.render(
          <ProgressDot
            level={{
              // Current behavior is that we still have an icon in our level
              // object here
              icon: 'fa-lock',
              kind: LevelKind.peer_review
            }}
            status={LevelStatus.review_accepted}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('fa fa-check');
      });

      it('shows an exclamation icon for rejected peer review', () => {
        renderer.render(
          <ProgressDot
            level={{
              // Current behavior is that we still have an icon in our level
              // object here
              icon: 'fa-lock',
              kind: LevelKind.peer_review
            }}
            status={LevelStatus.review_rejected}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('fa fa-exclamation');
      });
    });

    describe('named levels', () => {
      it('shows an icon on course overview when one is provided', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: 'fa-video-camera',
              name: 'I have a name',
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.children[0].props.className).to.equal('fa fa-video-camera');
      });

      it('shows no icon on course overview when none is provided', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: undefined,
              name: 'I have a name',
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('');
      });

      it('shows an icon in header when one is provided', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: 'fa-video-camera',
              name: 'I have a name',
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={/* false implies this is header progress */false}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.children[0].props.className).to.equal('fa fa-video-camera');
      });
    });

    describe('unplugged level', () => {
      it('has no icon on course overview', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: undefined,
              name: 'I have a name',
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('');
      });

      it('has no icon in header', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: undefined,
              name: 'I have a name',
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={/* false implies this is header progress */false}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('');
      });
    });

    describe('puzzle levels', () => {
      it('has a file icon on external levels in course overview', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: 'fa-file-text',
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.children[0].props.className).to.equal('fa fa-file-text');
      });

      it('has a file icon on external levels in header', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: 'fa-file-text',
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={/* false implies this is header progress */false}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.children[0].props.className).to.equal('fa fa-file-text');
      });

      it('has a link icon on external link levels in course overview', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: 'fa-external-link-square',
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.children[0].props.className).to.equal('fa fa-external-link-square');
      });

      it('shows a locked icon on course overivew when locked', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: undefined,
              kind: LevelKind.puzzle
            }}
            status={LevelStatus.locked}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('fa fa-lock');
      });
    });

    describe('assessment levels', () => {
      it('has no icon in course overview', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: 'fa-list-ol',
              kind: LevelKind.assessment
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={true}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].type).to.equal('div');
        expect(result.props.children[0].props.className).to.equal(undefined);
      });

      it('has no icon in header', () => {
        renderer.render(
          <ProgressDot
            level={{
              icon: undefined,
              kind: LevelKind.assessment
            }}
            status={LevelStatus.not_tried}
            courseOverviewPage={/* false implies this is header progress */false}
            saveAnswersBeforeNavigation={true}
          />
        );

        const result = renderer.getRenderOutput();
        expect(result.props.children[0].props.className).to.equal('');
      });
    });
  });
});
