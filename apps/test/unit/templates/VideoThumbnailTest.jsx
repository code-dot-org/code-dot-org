import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import sinon from 'sinon';
import VideoThumbnail from '@cdo/apps/templates/VideoThumbnail';

describe('VideoThumbnail', () => {
  it('renders a link on the video thumbnail', () => {
    const wrapper = shallow(
      <VideoThumbnail
        video={{
          name: 'name',
          src: 'video.url',
          key: 'key',
          thumbnail: 'video.url/thumbnail'
        }}
      />
    );
    expect(wrapper.find('a').length).equals(1);
    expect(wrapper.find('img').length).equals(1);
    expect(wrapper.find('img').props().src).equals('video.url/thumbnail');
  });

  it('opens video in new tab if openInNewTab is set', () => {
    const wrapper = shallow(
      <VideoThumbnail
        video={{
          name: 'name',
          src: 'video.url',
          key: 'key',
          thumbnail: 'video.url/thumbnail'
        }}
        openInNewTab
      />
    );
    const windowOpenStub = sinon.stub(window, 'open');
    wrapper.instance().onThumbnailClick();
    expect(windowOpenStub.callCount).to.equal(1);
    windowOpenStub.restore();
  });
});
