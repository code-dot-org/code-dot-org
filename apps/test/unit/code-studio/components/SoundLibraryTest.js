import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';

import SoundLibrary from '@cdo/apps/code-studio/components/SoundLibrary';
jest.mock(
  '@cdo/static/json/code-studio/soundLibrary.json',
  () => 'http://localhost/soundLibrary.json'
);

describe('SoundListEntry', () => {
  it('stops playing sound when user chooses a sound', async () => {
    const wrapper = mount(<SoundLibrary assetChosen={() => true} />);
    await act(async () => {
      wrapper.setState({
        category: 'Animals',
        search: 'b',
        selectedSound: {},
      });
    });
    wrapper.update();
    let sounds = wrapper.instance().sounds;
    jest.spyOn(sounds, 'stopAllAudio').mockClear().mockImplementation();
    await act(async () => {
      wrapper.find('.primary').simulate('click');
    });
    expect(sounds.stopAllAudio).toHaveBeenCalledTimes(1);
    sounds.stopAllAudio.mockRestore();
    wrapper.unmount();
  });
});
