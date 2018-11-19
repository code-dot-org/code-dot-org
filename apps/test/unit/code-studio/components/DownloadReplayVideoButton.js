import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { expect } from '../../../util/configuredChai';

import DownloadReplayVideoButton from '@cdo/apps/code-studio/components/DownloadReplayVideoButton';

describe('DownloadReplayVideoButton', () => {
  let wrapper;

  beforeEach(function () {
    wrapper = shallow(<DownloadReplayVideoButton channelId="test" />);
  });

  it('initially renders as enabled', () => {
    expect(wrapper.instance().buttonEnabled()).to.equal(true);
    expect(wrapper.find('a').props()).to.have.property('disabled', false);
    expect(wrapper.find('i').hasClass('fa-download')).to.equal(true);
  });

  it('renders as disabled if the download has been initiated before the video has been found', () => {
    wrapper.setState({
      videoExists: false,
      downloadInitiated: true
    });

    expect(wrapper.instance().buttonEnabled()).to.equal(false);
    expect(wrapper.find('a').props()).to.have.property('disabled', true);
    expect(wrapper.find('i').hasClass('fa-spinner')).to.equal(true);
  });

  it('renders as enabled if the download has been initiated after the video has been found', () => {
    wrapper.setState({
      videoExists: true,
      downloadInitiated: true
    });

    expect(wrapper.instance().buttonEnabled()).to.equal(true);
    expect(wrapper.find('a').props()).to.have.property('disabled', false);
    expect(wrapper.find('i').hasClass('fa-download')).to.equal(true);
  });

  it('begins checking for video immediately', () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves({ ok: false });
    const checkVideoSpy = sinon.spy(wrapper.instance(), 'checkVideo');
    const checkVideoUntilSuccessSpy = sinon.spy(wrapper.instance(), 'checkVideoUntilSuccess');

    expect(checkVideoSpy.callCount).to.equal(0);
    expect(checkVideoUntilSuccessSpy.callCount).to.equal(0);
    expect(fetchStub.callCount).to.equal(0);

    wrapper.instance().componentDidMount();

    expect(checkVideoSpy.callCount).to.equal(1);
    expect(checkVideoUntilSuccessSpy.callCount).to.equal(1);
    expect(fetchStub.callCount).to.equal(1);

    fetchStub.restore();
    checkVideoSpy.restore();
    checkVideoUntilSuccessSpy.restore();
  });

  it('downloads video directly if it exists', () => {
    const tryDownloadVideoSpy = sinon.spy(wrapper.instance(), 'tryDownloadVideo');
    const fetchSpy = sinon.spy(window, 'fetch');

    expect(tryDownloadVideoSpy.callCount).to.equal(0);
    expect(fetchSpy.callCount).to.equal(0);

    wrapper.setState({ videoExists: true });
    wrapper.find('a').simulate('click');

    expect(tryDownloadVideoSpy.callCount).to.equal(1);
    expect(fetchSpy.callCount).to.equal(1);
    expect(fetchSpy.calledWith(wrapper.instance().getVideoUrl(), {
      method: 'GET'
    })).to.equal(true);

    tryDownloadVideoSpy.restore();
    fetchSpy.restore();
  });

  it('disables button until video exists if it does not', () => {
    const tryDownloadVideoSpy = sinon.spy(wrapper.instance(), 'tryDownloadVideo');
    const fetchSpy = sinon.spy(window, 'fetch');

    expect(tryDownloadVideoSpy.callCount).to.equal(0);
    expect(fetchSpy.callCount).to.equal(0);

    wrapper.setState({ videoExists: false });
    wrapper.find('a').simulate('click');

    expect(tryDownloadVideoSpy.callCount).to.equal(1);
    expect(fetchSpy.callCount).to.equal(1);
    expect(fetchSpy.calledWith(wrapper.instance().getVideoUrl(), {
      method: 'HEAD'
    })).to.equal(true);

    tryDownloadVideoSpy.restore();
    fetchSpy.restore();
  });
});
