import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {UnconnectedLevelDetailsDialog as LevelDetailsDialog} from '@cdo/apps/templates/lessonOverview/activities/LevelDetailsDialog';
import * as utils from '@cdo/apps/utils';



describe('LevelDetailsDialogTest', () => {
  let handleCloseSpy, loadVideoSpy, defaultProps;

  beforeEach(() => {
    handleCloseSpy = jest.fn();
    defaultProps = {
      handleClose: handleCloseSpy,
      viewAs: ViewType.Instructor,
      isRtl: false,
    };
    loadVideoSpy = jest.spyOn(LevelDetailsDialog.prototype, 'loadVideo').mockClear().mockImplementation();
  });

  afterEach(() => {
    loadVideoSpy.mockRestore();
  });

  it('calls handleClose when dismiss is clicked', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {
            type: 'External',
            markdown: 'Some markdown',
          },
        }}
      />
    );
    const dismissButton = wrapper.find('Button').at(0);
    dismissButton.simulate('click');
    expect(handleCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('links to level url', () => {
    jest.spyOn(firehoseClient, 'putRecord').mockClear().mockImplementation();
    jest.spyOn(utils, 'windowOpen').mockClear().mockImplementation();

    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {
            type: 'External',
            markdown: 'Some markdown',
          },
        }}
      />
    );
    const levelLink = wrapper.find('Button').at(1);
    levelLink.simulate('click', {preventDefault: () => {}});
    expect(firehoseClient.putRecord).toHaveBeenCalledTimes(1);
    firehoseClient.putRecord.yieldTo('callback');
    expect(utils.windowOpen).toHaveBeenCalledWith('level.url?no_redirect=1');

    utils.windowOpen.mockRestore();
    firehoseClient.putRecord.mockRestore();
  });

  it('can display an external markdown level', () => {
    const wrapper = mount(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'External', markdown: 'This is some text.'},
          name: 'External Markdown Level',
        }}
      />
    );
    expect(wrapper.contains('This is some text.')).toBe(true);
    expect(wrapper.find('h1').contains('External Markdown Level')).toBe(true);
  });

  it('can display the video and teacher markdown for an external markdown level', () => {
    const wrapper = mount(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {
            type: 'External',
            markdown: 'This is some text.',
            teacherMarkdown: 'This is some teacher only text.',
            videoOptions: {url: 'video.url'},
          },
        }}
      />
    );
    expect(loadVideoSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.contains('This is some text.')).toBe(true);
    expect(wrapper.find('TeacherOnlyMarkdown').length).toBe(1);
    expect(
      wrapper.find('TeacherOnlyMarkdown').first().props().content
    ).toBe('This is some teacher only text.');
  });

  it('can display a LevelGroup', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'LevelGroup'},
        }}
      />
    );
    const safeMarkdown = wrapper.find('SafeMarkdown').first();
    expect(safeMarkdown.props().markdown).toBe(
      'This level is an assessment or survey with multiple questions. To view this level click "See Full Level".'
    );
  });

  it('can gracefully handle no preview', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'Jigsaw'},
        }}
      />
    );
    const safeMarkdown = wrapper.find('SafeMarkdown').first();
    expect(safeMarkdown.props().markdown).toBe(
      'No preview is available for this level. To view this level click "See Full Level".'
    );
  });

  it('tries to load a video on a standalone video level', () => {
    const wrapper = mount(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {
            type: 'StandaloneVideo',
            longInstructions: 'Some things to think about.',
          },
        }}
      />
    );
    expect(loadVideoSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.contains('Some things to think about.')).toBe(true);
  });

  it('can display teacher markdown on a standalone video level', () => {
    const wrapper = mount(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          url: 'level.url',
          level: {
            type: 'StandaloneVideo',
            longInstructions: 'Some things to think about.',
            teacherMarkdown: 'Some things to teach about.',
          },
        }}
      />
    );
    expect(loadVideoSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.contains('Some things to think about.')).toBe(true);
    expect(wrapper.find('TeacherOnlyMarkdown').length).toBe(1);
    expect(
      wrapper.find('TeacherOnlyMarkdown').first().props().content
    ).toBe('Some things to teach about.');
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
              name: 'sublevel1',
            },
            {
              id: '2',
              status: 'not_tried',
              name: 'sublevel2',
            },
            {
              id: '3',
              status: 'not_tried',
              name: 'sublevel3',
            },
          ],
        }}
      />
    );
    expect(wrapper.find('SublevelCard').length).toBe(3);
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
          markdown: 'Markdown1',
          display_name: 'Choice 1',
        },
        {
          id: '2',
          status: 'not_tried',
          name: 'sublevel2',
          type: 'External',
          markdown: 'Markdown1',
          display_name: 'Choice 2',
        },
      ],
    };
    const wrapper = shallow(
      <LevelDetailsDialog {...defaultProps} scriptLevel={bubbleChoiceLevel} />
    );
    wrapper
      .instance()
      .handleBubbleChoiceBubbleClick(bubbleChoiceLevel.sublevels[0]);
    expect(wrapper.find('SublevelCard').length).toBe(0);
    expect(wrapper.find('SafeMarkdown').first().props().markdown).toBe('Markdown1');
    expect(wrapper.find('h1').contains('Choice 1')).toBe(true);
  });

  it('can display a bubble choice sublevel with example solutions', () => {
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
          type: 'Weblab',
          longInstructions: 'long instructions',
          display_name: 'Choice 1',
          exampleSolutions: ['link/1'],
        },
        {
          id: '2',
          status: 'not_tried',
          name: 'sublevel2',
          type: 'External',
          markdown: 'Markdown1',
          display_name: 'Choice 2',
        },
      ],
    };
    const wrapper = shallow(
      <LevelDetailsDialog {...defaultProps} scriptLevel={bubbleChoiceLevel} />
    );
    wrapper
      .instance()
      .handleBubbleChoiceBubbleClick(bubbleChoiceLevel.sublevels[0]);
    expect(wrapper.find('SublevelCard').length).toBe(0);
    expect(wrapper.find('h1').contains('Choice 1')).toBe(true);
    expect(wrapper.find('TopInstructions').length).toBe(1);
    expect(
      wrapper.find('TopInstructions').props().exampleSolutions[0]
    ).toBe('link/1');
  });

  it('can display a CSD/CSP puzzle level', () => {
    const wrapper = shallow(
      <LevelDetailsDialog
        {...defaultProps}
        scriptLevel={{
          id: 'scriptlevel',
          url: 'level.url',
          status: 'not_tried',
          exampleSolutions: ['link/1'],
          level: {
            type: 'Weblab',
            id: 'level',
            longInstructions: 'long instructions',
          },
        }}
      />
    );
    expect(wrapper.find('TopInstructions').length).toBe(1);
    expect(
      wrapper.find('TopInstructions').props().exampleSolutions[0]
    ).toBe('link/1');
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
                longInstructions: 'long instructions',
              },
            ],
          },
        }}
      />
    );
    expect(wrapper.find('TopInstructions').length).toBe(1);
  });

  it('can display a multiple choice level', () => {
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
            content: [
              'Look at the code below and predict how the headings will be displayed.',
            ],
            questionText: 'Eggs, Bacon, Waffles',
            teacherMarkdown: 'This is a multiple choice level.',
          },
        }}
      />
    );
    expect(wrapper.find('SafeMarkdown').length).toBe(2);
    expect(wrapper.find('SafeMarkdown').at(0).props().markdown).toBe('Look at the code below and predict how the headings will be displayed.');
    expect(wrapper.find('SafeMarkdown').at(1).props().markdown).toBe('Eggs, Bacon, Waffles');
    expect(wrapper.find('TeacherOnlyMarkdown').length).toBe(1);
    expect(
      wrapper.find('TeacherOnlyMarkdown').first().props().content
    ).toBe('This is a multiple choice level.');
  });
});
