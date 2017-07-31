import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import NewProgressBubble from '@cdo/apps/templates/progress/NewProgressBubble';
import color from "@cdo/apps/util/color";
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';

const defaultProps = {
  level: {
    levelNumber: 1,
    status: LevelStatus.perfect,
    url: '/foo/bar',
    name: 'level_name',
    progression: 'progression_name'
  },
  disabled: false
};

describe('NewProgressBubble', () => {
  it('renders an anchor tag when we have a url', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
      />
    );

    assert(wrapper.is('a'));
  });

  it('does not render an anchor tag when we have no url', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          url: ''
        }}
      />
    );

    assert(wrapper.is('div'));
  });

  it('does not render an anchor tag if we are disabled', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        disabled={true}
      />
    );

    assert(wrapper.is('div'));
  });

  it('has a green background when we have perfect status', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
      />
    );

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_perfect);
  });

  it('has a white background when we are disabled', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        disabled={true}
      />
    );

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_not_tried);
  });

  it('has green border and white background for in progress level', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          status: LevelStatus.attempted
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_not_tried);
    assert.equal(div.props().style.borderColor, color.level_perfect);
  });

  it('has a green border and light green background for too many blocks level', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          status: LevelStatus.passed
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_passed);
    assert.equal(div.props().style.borderColor, color.level_perfect);
  });

  it('has a purple background for submitted level', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment,
          status: LevelStatus.perfect
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_submitted);
    assert.equal(div.props().style.borderColor, color.level_submitted);
    assert.equal(div.props().style.color, color.white);
  });

  it('has a red background for review_rejected', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.peer_review,
          status: LevelStatus.review_rejected
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_review_rejected);
    assert.equal(div.props().style.borderColor, color.level_review_rejected);
    assert.equal(div.props().style.color, color.white);
  });

  it('has a green background for review_accepted', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.peer_review,
          status: LevelStatus.review_accepted
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_perfect);
    assert.equal(div.props().style.borderColor, color.level_perfect);
    assert.equal(div.props().style.color, color.white);
  });

  it('renders a diamond for concept levels', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          isConceptLevel: true
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.transform, 'rotate(45deg)');
  });

  it('uses name when specified', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('TooltipWithIcon').props().text, '1. level_name');
  });

  it('uses progression name when no name is specified', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          name: ''
        }}
      />
    );
    assert.equal(wrapper.find('TooltipWithIcon').props().text, '1. progression_name');
  });

  it('renders a small bubble if smallBubble is true', () => {
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        smallBubble={true}
      />
    );

    assert.equal(wrapper.find('div').at(1).props().style.width, 9);
  });

  it('renders a progress pill for unplugged lessons', () => {
    const unpluggedLevel = {
      status: LevelStatus.perfect,
      kind: LevelKind.unplugged,
      url: '/foo/bar',
      isUnplugged: true
    };
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={unpluggedLevel}
        smallBubble={false}
      />
    );
    assert.equal(wrapper.find('ProgressPill').length, 1);
    assert(!!wrapper.find('ProgressPill').props().tooltip);
  });

  it('does not render a progress pill for unplugged when small', () => {
    const unpluggedLevel = {
      status: LevelStatus.perfect,
      kind: LevelKind.unplugged,
      url: '/foo/bar',
      isUnplugged: true
    };
    const wrapper = shallow(
      <NewProgressBubble
        {...defaultProps}
        level={unpluggedLevel}
        smallBubble={true}
      />
    );
    assert.equal(wrapper.find('ProgressPill').length, 0);
  });
});
