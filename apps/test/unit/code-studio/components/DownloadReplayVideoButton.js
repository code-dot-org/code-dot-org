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
    expect(wrapper.find('a').is('disabled')).to.equal(false);
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
});
