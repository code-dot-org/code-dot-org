import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SoundLibrary from '@cdo/apps/code-studio/components/SoundLibrary';

describe('SoundListEntry', () => {
  it('stops playing sound when user chooses a sound', () => {
    const wrapper = mount(<SoundLibrary assetChosen={() => true} />);
    wrapper.setState({
      category: 'Animals',
      search: 'b',
      selectedSound: {},
    });
    let sounds = wrapper.instance().sounds;
    jest.spyOn(sounds, 'stopAllAudio').mockClear().mockImplementation();
    wrapper.find('.primary').simulate('click');
    expect(sounds.stopAllAudio).toHaveBeenCalledTimes(1);
    sounds.stopAllAudio.mockRestore();
    wrapper.unmount();
  });
});
