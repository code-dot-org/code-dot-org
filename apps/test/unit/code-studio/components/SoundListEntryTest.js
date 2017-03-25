import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import SoundListEntry from '@cdo/apps/code-studio/components/SoundListEntry';
import Sounds from '@cdo/apps/Sounds';
import color from "@cdo/apps/util/color";

describe('SoundListEntry', () => {
  const sounds = new Sounds();
  const defaultProps = {
    assetChosen: () => true,
    soundMetadata: {
      name: 'click1',
      time: 1,
      sourceUrl: '/api/v1/sound-library/KyZOBksdJiQSlvoiOzFGpryJiMexdfks/category_ui/click1.mp3'
    },
    isSelected: true,
    soundsRegistry: sounds
  };

  it('renders with purple background when selected', () => {
    const wrapper = shallow(
      <SoundListEntry
        {...defaultProps}
      />
    );
    assert.equal(wrapper.props().style.backgroundColor, color.lighter_purple);
  });

  it('renders with no background when not selected', () => {
    const wrapper = shallow(
      <SoundListEntry
        {...defaultProps}
        isSelected={false}
      />
    );
    assert.equal(wrapper.props().style.backgroundColor, color.white);
  });

  it('renders a play button when not playing', () => {
    const wrapper = shallow(
      <SoundListEntry
        {...defaultProps}
        isSelected={false}
      />
    );
    // First child is a icon control for pause and play
    assert.equal(wrapper.props().children[0].props.children.props.className, 'fa fa-play-circle fa-2x');
  });

  it('renders a pause button when playing', () => {
    const wrapper = shallow(
      <SoundListEntry
        {...defaultProps}
        isSelected={false}
      />
    );
    wrapper.setState({ isPlaying: true });
    // First child is a icon control for pause and play
    assert.equal(wrapper.props().children[0].props.children.props.className, 'fa fa-pause-circle fa-2x');
  });
});
