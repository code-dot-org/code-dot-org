import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { expect } from '../../../util/configuredChai';

import { UnconnectedDownloadReplayVideoButton as DownloadReplayVideoButton } from '@cdo/apps/code-studio/components/DownloadReplayVideoButton';

describe('DownloadReplayVideoButton', () => {
  let wrapper;

  let checkVideoSpy;
  let checkVideoUntilSuccessSpy;
  let fetchSpy;
  let tryDownloadVideoSpy;

  let originalAppOptions;

  before(function () {
    originalAppOptions = window.appOptions;
    window.appOptions = {
      signedReplayLogUrl: "some-url.com"
    };
  });

  after(function () {
    window.appOptions = originalAppOptions;
  });

  beforeEach(function () {
    wrapper = shallow(
      <DownloadReplayVideoButton
        channelId="test"
        appType="dance"
      />
    );

    checkVideoSpy = sinon.spy(wrapper.instance(), 'checkVideo');
    checkVideoUntilSuccessSpy = sinon.spy(wrapper.instance(), 'checkVideoUntilSuccess');
    fetchSpy = sinon.spy(window, 'fetch');
    tryDownloadVideoSpy = sinon.spy(wrapper.instance(), 'tryDownloadVideo');
  });

  afterEach(function () {
    checkVideoSpy.restore();
    checkVideoUntilSuccessSpy.restore();
    fetchSpy.restore();
    tryDownloadVideoSpy.restore();
  });

  it('initially renders as enabled', () => {
    expect(wrapper.instance().buttonEnabled()).to.equal(true);
    expect(wrapper.find('button').props()).to.have.property('disabled', false);
    expect(wrapper.find('i').hasClass('fa-download')).to.equal(true);
  });

  it('renders as disabled if the download has been initiated before the video has been found', () => {
    wrapper.setState({
      videoExists: false,
      downloadInitiated: true
    });

    expect(wrapper.instance().buttonEnabled()).to.equal(false);
    expect(wrapper.find('button').props()).to.have.property('disabled', true);
    expect(wrapper.find('i').hasClass('fa-spinner')).to.equal(true);
  });

  it('renders as enabled if the download has been initiated after the video has been found', () => {
    wrapper.setState({
      videoExists: true,
      downloadInitiated: true
    });

    expect(wrapper.instance().buttonEnabled()).to.equal(true);
    expect(wrapper.find('button').props()).to.have.property('disabled', false);
    expect(wrapper.find('i').hasClass('fa-download')).to.equal(true);
  });

  it('begins checking for video immediately', () => {
    expect(checkVideoSpy.callCount).to.equal(0);
    expect(checkVideoUntilSuccessSpy.callCount).to.equal(0);
    expect(fetchSpy.callCount).to.equal(0);

    wrapper.instance().componentDidMount();

    expect(checkVideoSpy.callCount).to.equal(1);
    expect(checkVideoUntilSuccessSpy.callCount).to.equal(1);
    expect(fetchSpy.callCount).to.equal(1);
  });

  it('downloads video directly if it exists', () => {
    expect(tryDownloadVideoSpy.callCount).to.equal(0);
    expect(fetchSpy.callCount).to.equal(0);

    wrapper.setState({ videoExists: true });
    wrapper.find('button').simulate('click');

    expect(tryDownloadVideoSpy.callCount).to.equal(1);
    expect(fetchSpy.callCount).to.equal(1);
    expect(fetchSpy.calledWith(wrapper.instance().getVideoUrl(), {
      method: 'GET'
    })).to.equal(true);
  });

  it('disables button until video exists if it does not', () => {
    expect(tryDownloadVideoSpy.callCount).to.equal(0);
    expect(fetchSpy.callCount).to.equal(0);

    wrapper.setState({ videoExists: false });
    wrapper.find('button').simulate('click');

    expect(tryDownloadVideoSpy.callCount).to.equal(1);
    expect(fetchSpy.callCount).to.equal(1);
    expect(fetchSpy.calledWith(wrapper.instance().getVideoUrl(), {
      method: 'HEAD'
    })).to.equal(true);
  });
});
