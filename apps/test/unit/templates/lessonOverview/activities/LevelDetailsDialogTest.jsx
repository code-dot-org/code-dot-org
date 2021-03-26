import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {UnconnectedLevelDetailsDialog as LevelDetailsDialog} from '@cdo/apps/templates/lessonOverview/activities/LevelDetailsDialog';

describe('LevelDetailsDialogTest', () => {
  let handleCloseSpy, defaultProps;

  beforeEach(() => {
    handleCloseSpy = sinon.spy();
    defaultProps = {
      handleClose: handleCloseSpy,
      viewAs: ViewType.Teacher,
      isRtl: false
    };
  });

  it('calls handleClose when dismiss is clicked', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {
            type: 'External',
            markdown: 'Some markdown'
          }
        }}
      />
    );
    const dismissButton = wrapper.find('Button').at(0);
    dismissButton.simulate('click');
    expect(handleCloseSpy.calledOnce).to.be.true;
  });

  it('links to level url', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {
            type: 'External',
            markdown: 'Some markdown'
          }
        }}
      />
    );
    const levelLink = wrapper.find('Button').at(1);
    expect(levelLink.props().href).to.equal('level.url');
  });

  it('can display an external markdown level', () => {
    const wrapper = mount(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'External', markdown: 'This is some text.'}
        }}
      />
    );
    expect(wrapper.contains('This is some text.')).to.be.true;
  });

  it('can display a LevelGroup', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'LevelGroup'}
        }}
      />
    );
    const safeMarkdown = wrapper.find('SafeMarkdown').first();
    expect(safeMarkdown.props().markdown).to.equal(
      'This level is an assessment or survey with multiple questions. To view this level click "See Full Level".'
    );
  });

  it('can gracefully handle no preview', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'Jigsaw'}
        }}
      />
    );
    const safeMarkdown = wrapper.find('SafeMarkdown').first();
    expect(safeMarkdown.props().markdown).to.equal(
      'No preview is available for this level. To view this level click "See Full Level".'
    );
  });

  it('tries to load a video on a standalone video level', () => {
    const loadVideoSpy = sinon.stub(LevelDetailsDialog.prototype, 'loadVideo');
    const wrapper = mount(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {
            type: 'StandaloneVideo',
            longInstructions: 'Some things to think about.'
          }
        }}
      />
    );
    expect(loadVideoSpy.calledOnce).to.be.true;
    expect(wrapper.contains('Some things to think about.')).to.be.true;
  });

  it('can display a bubble choice level', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          id: 'scriptlevel',
          url: 'level.url',
          status: 'not_tried',
          level: {type: 'BubbleChoice', id: 'level'},
          sublevels: [
            {
              id: '1',
              status: 'not_tried',
              name: 'sublevel1'
            },
            {
              id: '2',
              status: 'not_tried',
              name: 'sublevel2'
            },
            {
              id: '3',
              status: 'not_tried',
              name: 'sublevel3'
            }
          ]
        }}
      />
    );
    expect(wrapper.find('SublevelCard').length).to.equal(3);
  });

  it('can display a bubble choice sublevel on switch', () => {
    const bubbleChoiceLevel = {
      id: 'scriptlevel',
      url: 'level.url',
      status: 'not_tried',
      level: {type: 'BubbleChoice', id: 'level'},
      sublevels: [
        {
          id: '1',
          status: 'not_tried',
          name: 'sublevel1',
          type: 'External',
          markdown: 'Markdown1'
        },
        {
          id: '2',
          status: 'not_tried',
          name: 'sublevel2',
          type: 'External',
          markdown: 'Markdown1'
        }
      ]
    };
    const wrapper = shallow(
      <LevelDetailsDialog {...defaultProps} scriptLevel={bubbleChoiceLevel} />
    );
    wrapper
      .instance()
      .handleBubbleChoiceBubbleClick(bubbleChoiceLevel.sublevels[0]);
    expect(wrapper.find('SublevelCard').length).to.equal(0);
    expect(
      wrapper
        .find('SafeMarkdown')
        .first()
        .props().markdown
    ).to.equal('Markdown1');
  });

  it('can display a CSD/CSP puzzle level', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          id: 'scriptlevel',
          url: 'level.url',
          status: 'not_tried',
          level: {
            type: 'Weblab',
            id: 'level',
            longInstructions: 'long instructions'
          }
        }}
      />
    );
    expect(wrapper.find('TopInstructions').length).to.equal(1);
  });

  it('can display a contained level', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          id: 'scriptlevel',
          url: 'level.url',
          status: 'not_tried',
          level: {
            type: 'Weblab',
            id: 'level',
            containedLevels: [
              {
                name: 'contained-level',
                type: 'FreeResponse',
                longInstructions: 'long instructions'
              }
            ]
          }
        }}
      />
    );
    expect(wrapper.find('TopInstructions').length).to.equal(1);
  });

  it('can display a multiple choice level'),
    () => {
      const wrapper = shallow(
        <LevelDetailsDialog
          {...defaultProps}
          scriptLevel={{
            id: 'scriptlevel',
            url: 'level.url',
            status: 'not_tried',
            level: {
              type: 'Multi',
              id: 'level',
              question:
                'Look at the code below and predict how the headings will be displayed.',
              questionText: 'Eggs, Bacon, Waffles'
            }
          }}
        />
      );
      expect(wrapper.find('SafeMarkdown').length).to.equal(2);
      expect(
        wrapper
          .find('SafeMarkdown')
          .at(0)
          .props().markdown
      ).equal(
        'Look at the code below and predict how the headings will be displayed.'
      );
      expect(
        wrapper
          .find('SafeMarkdown')
          .at(1)
          .props().markdown
      ).equal('Eggs, Bacon, Waffles');
    };
});
