import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SoundListEntry from '@cdo/apps/code-studio/components/SoundListEntry';
import Sounds from '@cdo/apps/Sounds';
import color from '@cdo/apps/util/color';

describe('SoundListEntry', () => {
  const sounds = new Sounds();
  const sourceURL =
    'studio.code.org/api/v1/sound-library/KyZOBksdJiQSlvoiOzFGpryJiMexdfks/category_ui/click1.mp3';
  const defaultProps = {
    assetChosen: () => true,
    soundMetadata: {
      name: 'click1',
      time: 1,
      sourceUrl: sourceURL,
    },
    isSelected: true,
    soundsRegistry: sounds,
  };

  it('renders with purple background when selected', () => {
    const wrapper = shallow(<SoundListEntry {...defaultProps} />);
    expect(wrapper.props().style.backgroundColor).toEqual(color.lighter_purple);
  });

  it('renders with no background when not selected', () => {
    const wrapper = shallow(
      <SoundListEntry {...defaultProps} isSelected={false} />
    );
    expect(wrapper.props().style.backgroundColor).toEqual(color.white);
  });

  it('renders a play button when not playing', () => {
    const wrapper = shallow(
      <SoundListEntry {...defaultProps} isSelected={false} />
    );
    // First child is a icon control for pause and play
    expect(wrapper.props().children[0].props.children.props.className).toEqual(
      'fa fa-play-circle fa-2x'
    );
  });

  it('renders a pause button when playing', () => {
    const wrapper = shallow(
      <SoundListEntry {...defaultProps} isSelected={false} />
    );
    wrapper.setState({isPlaying: true});
    // First child is a icon control for pause and play
    expect(wrapper.props().children[0].props.children.props.className).toEqual(
      'fa fa-pause-circle fa-2x'
    );
  });

  it('stops playing the sound when deselected', () => {
    const wrapper = shallow(<SoundListEntry {...defaultProps} />);
    jest.spyOn(sounds, 'stopPlayingURL').mockClear().mockImplementation();
    wrapper.setProps({isSelected: false});

    expect(sounds.isPlaying(sourceURL)).toEqual(false);
    expect(sounds.stopPlayingURL).toHaveBeenCalledTimes(1);

    sounds.stopPlayingURL.mockRestore();
  });
});
