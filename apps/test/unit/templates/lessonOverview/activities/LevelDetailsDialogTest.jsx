import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import LevelDetailsDialog from '@cdo/apps/templates/lessonOverview/activities/LevelDetailsDialog';

describe('LevelDetailsDialogTest', () => {
  let handleCloseSpy, defaultProps;

  beforeEach(() => {
    handleCloseSpy = sinon.spy();
    defaultProps = {
      handleClose: handleCloseSpy,
      scriptLevel: {
        url: 'level.url',
        level: {
          type: 'External',
          markdown: 'Some markdown'
        }
      }
    };
  });

  it('calls handleClose when dismiss is clicked', () => {
    const wrapper = shallow(<LevelDetailsDialog {...defaultProps} />);
    const dismissButton = wrapper.find('Button').at(0);
    dismissButton.simulate('click');
    expect(handleCloseSpy.calledOnce).to.be.true;
  });

  it('links to level url', () => {
    const wrapper = shallow(<LevelDetailsDialog {...defaultProps} />);
    const levelLink = wrapper.find('Button').at(1);
    expect(levelLink.props().href).to.equal('level.url');
  });

  it('can display an external markdown level', () => {
    const wrapper = mount(
      <LevelDetailsDialog
        handleClose={handleCloseSpy}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'External', markdown: 'This is some text.'}
        }}
      />
    );
    expect(wrapper.contains('This is some text.')).to.be.true;
  });

  it('can display a LevelGroup', () => {
    const wrapper = mount(
      <LevelDetailsDialog
        handleClose={handleCloseSpy}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'LevelGroup'}
        }}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          {
            'This level is an assessment or survey with multiple questions. To view this level click "See Full Level".'
          }
        </div>
      )
    ).to.be.true;
  });

  it('tries to load a video on a standalone video level', () => {
    const loadVideoSpy = sinon.stub(LevelDetailsDialog.prototype, 'loadVideo');
    const wrapper = mount(
      <LevelDetailsDialog
        handleClose={handleCloseSpy}
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
        handleClose={handleCloseSpy}
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
      <LevelDetailsDialog
        handleClose={handleCloseSpy}
        scriptLevel={bubbleChoiceLevel}
      />
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
});
