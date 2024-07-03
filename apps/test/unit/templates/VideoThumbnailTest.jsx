import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import VideoThumbnail from '@cdo/apps/templates/VideoThumbnail';

describe('VideoThumbnail', () => {
  it('renders a link on the video thumbnail', () => {
    const wrapper = shallow(
      <VideoThumbnail
        video={{
          name: 'name',
          src: 'video.url',
          key: 'key',
          thumbnail: 'video.url/thumbnail',
        }}
      />
    );
    expect(wrapper.find('a').length).toBe(1);
    expect(wrapper.find('img').length).toBe(1);
    expect(wrapper.find('img').props().src).toBe('video.url/thumbnail');
  });

  it('opens video in new tab if openInNewTab is set', () => {
    const wrapper = shallow(
      <VideoThumbnail
        video={{
          name: 'name',
          src: 'video.url',
          key: 'key',
          thumbnail: 'video.url/thumbnail',
        }}
        openInNewTab
      />
    );
    const windowOpenStub = jest
      .spyOn(window, 'open')
      .mockClear()
      .mockImplementation();
    wrapper.instance().onThumbnailClick();
    expect(windowOpenStub).toHaveBeenCalledTimes(1);
    windowOpenStub.mockRestore();
  });
});
