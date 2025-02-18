import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedDownloadReplayVideoButton as DownloadReplayVideoButton} from '@cdo/apps/code-studio/components/DownloadReplayVideoButton';

// temporarily skipped because this button is disabled. Re-enable the test if we re-enable the button.
describe.skip('DownloadReplayVideoButton', () => {
  let wrapper;

  let checkVideoSpy;
  let checkVideoUntilSuccessSpy;
  let fetchSpy;
  let tryDownloadVideoSpy;

  let originalAppOptions;

  beforeAll(function () {
    originalAppOptions = window.appOptions;
    window.appOptions = {
      signedReplayLogUrl: 'some-url.com',
    };
  });

  afterAll(function () {
    window.appOptions = originalAppOptions;
  });

  beforeEach(function () {
    wrapper = mount(
      <DownloadReplayVideoButton channelId="test" appType="dance" />
    );

    checkVideoSpy = jest.spyOn(wrapper.instance(), 'checkVideo').mockClear();
    checkVideoUntilSuccessSpy = jest
      .spyOn(wrapper.instance(), 'checkVideoUntilSuccess')
      .mockClear();
    fetchSpy = jest.spyOn(window, 'fetch').mockClear();
    tryDownloadVideoSpy = jest
      .spyOn(wrapper.instance(), 'tryDownloadVideo')
      .mockClear();
  });

  afterEach(function () {
    wrapper.unmount();
    checkVideoSpy.mockRestore();
    checkVideoUntilSuccessSpy.mockRestore();
    fetchSpy.mockRestore();
    tryDownloadVideoSpy.mockRestore();
  });

  it('initially renders as enabled', () => {
    expect(wrapper.instance().buttonEnabled()).toBe(true);
    expect(wrapper.find('button').props()).toHaveProperty('disabled', false);
    expect(wrapper.find('i').hasClass('fa-download')).toBe(true);
  });

  it('renders as disabled if the download has been initiated before the video has been found', () => {
    wrapper.setState({
      videoExists: false,
      downloadInitiated: true,
    });

    expect(wrapper.instance().buttonEnabled()).toBe(false);
    expect(wrapper.find('button').props()).toHaveProperty('disabled', true);
    expect(wrapper.find('i').hasClass('fa-spinner')).toBe(true);
  });

  it('renders as enabled if the download has been initiated after the video has been found', () => {
    wrapper.setState({
      videoExists: true,
      downloadInitiated: true,
    });

    expect(wrapper.instance().buttonEnabled()).toBe(true);
    expect(wrapper.find('button').props()).toHaveProperty('disabled', false);
    expect(wrapper.find('i').hasClass('fa-spinner')).toBe(true);
  });

  it('begins checking for video immediately', () => {
    expect(checkVideoSpy).toHaveBeenCalledTimes(0);
    expect(checkVideoUntilSuccessSpy).toHaveBeenCalledTimes(0);
    expect(fetchSpy).toHaveBeenCalledTimes(0);

    wrapper.instance().componentDidMount();

    expect(checkVideoSpy).toHaveBeenCalledTimes(1);
    expect(checkVideoUntilSuccessSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('downloads video directly if it exists', () => {
    expect(tryDownloadVideoSpy).toHaveBeenCalledTimes(0);
    expect(fetchSpy).toHaveBeenCalledTimes(0);

    wrapper.setState({videoExists: true});
    wrapper.find('button').simulate('click');

    expect(tryDownloadVideoSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(wrapper.instance().getVideoUrl(), {
      method: 'GET',
    });
  });

  it('disables button until video exists if it does not', () => {
    expect(tryDownloadVideoSpy).toHaveBeenCalledTimes(0);
    expect(fetchSpy).toHaveBeenCalledTimes(0);

    wrapper.setState({videoExists: false});
    wrapper.find('button').simulate('click');

    expect(tryDownloadVideoSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(wrapper.instance().getVideoUrl(), {
      method: 'HEAD',
    });
  });
});
