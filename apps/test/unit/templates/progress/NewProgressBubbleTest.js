import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import NewProgressBubble from '@cdo/apps/templates/progress/NewProgressBubble';
import color from "@cdo/apps/util/color";
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

describe('NewProgressBubble', () => {
  it('renders an anchor tag when we have a url', () => {
    const wrapper = shallow(
      <NewProgressBubble
        level={{
          levelNumber: 1,
          status: LevelStatus.perfect,
          url: "/foo/bar"
        }}
        disabled={false}
      />
    );

    assert(wrapper.is('a'));
  });

  it('does not render an anchor tag when we have no url', () => {
    const wrapper = shallow(
      <NewProgressBubble
        level={{
          levelNumber: 1,
          status: LevelStatus.perfect
        }}
        disabled={false}
      />
    );

    assert(wrapper.is('div'));
  });

  it('does not render an anchor tag if we are disabled', () => {
    const wrapper = shallow(
      <NewProgressBubble
        level={{
          levelNumber: 1,
          status: LevelStatus.perfect,
          url: "/foo/bar"
        }}
        disabled={true}
      />
    );

    assert(wrapper.is('div'));
  });

  it('has a green background when we have perfect status', () => {
    const wrapper = shallow(
      <NewProgressBubble
        level={{
          levelNumber: 1,
          status: LevelStatus.perfect,
          url: "/foo/bar"
        }}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('div').at(0).props().style.backgroundColor, color.level_perfect);
  });

  it('has a white background when we are disabled', () => {
    const wrapper = shallow(
      <NewProgressBubble
        level={{
          levelNumber: 1,
          status: LevelStatus.perfect,
          url: "/foo/bar"
        }}
        disabled={true}
      />
    );

    assert.equal(wrapper.find('div').at(0).props().style.backgroundColor, color.level_not_tried);
  });

  it('uses name when specified', () => {
    const wrapper = shallow(
      <NewProgressBubble
        level={{
          levelNumber: 1,
          status: LevelStatus.perfect,
          url: '/foo/bar',
          name: 'level_name',
          progression: 'progression_name'
        }}
        disabled={false}
      />
    );
    assert.equal(wrapper.find('ReactTooltip div').text(), '<FontAwesome />1. level_name');
  });

  it('uses progression name when no name is specified', () => {
    const wrapper = shallow(
      <NewProgressBubble
        level={{
          levelNumber: 1,
          status: LevelStatus.perfect,
          url: '/foo/bar',
          name: '',
          progression: 'progression_name'
        }}
        disabled={false}
      />
    );
    assert.equal(wrapper.find('ReactTooltip div').text(), '<FontAwesome />1. progression_name');
  });

  it('renders a small bubble if smallBubble is true', () => {
    // TODO
  });
});
