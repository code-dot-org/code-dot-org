import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import color from "@cdo/apps/util/color";
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

describe('ProgressBubble', () => {
  it('renders an anchor tag when we have a url', () => {
    const wrapper = shallow(
      <ProgressBubble
        number={1}
        status={LevelStatus.perfect}
        url="/foo/bar"
        disabled={false}
      />
    );

    assert(wrapper.is('a'));
  });

  it('does not render an anchor tag when we have no url', () => {
    const wrapper = shallow(
      <ProgressBubble
        number={1}
        status={LevelStatus.perfect}
        disabled={false}
      />
    );

    assert(wrapper.is('div'));
  });

  it('does not render an anchor tag if we are disabled', () => {
    const wrapper = shallow(
      <ProgressBubble
        number={1}
        status={LevelStatus.perfect}
        url="/foo/bar"
        disabled={true}
      />
    );

    assert(wrapper.is('div'));
  });

  it('has a green background when we have perfect status', () => {
    const wrapper = shallow(
      <ProgressBubble
        number={1}
        status={LevelStatus.perfect}
        url="/foo/bar"
        disabled={false}
      />
    );

    assert.equal(wrapper.find('div').props().style.backgroundColor, color.level_perfect);
  });

  it('has a white background when we are disabled', () => {
    const wrapper = shallow(
      <ProgressBubble
        number={1}
        status={LevelStatus.perfect}
        url="/foo/bar"
        disabled={true}
      />
    );

    assert.equal(wrapper.find('div').props().style.backgroundColor, color.level_not_tried);
  });
});
