/** @file Test BoardSetupCheck component */
import React from 'react';
import sinon from 'sinon';
import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
import BoardSetupCheck from '@cdo/apps/lib/kits/maker/ui/BoardSetupCheck';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';

describe('BoardSetupCheck', () => {
  beforeEach(() => {
    sinon.stub(window.console, 'error');
  });

  afterEach(() => {
    window.console.error.restore();
  });

  it('renders', done => {
    const checker = new StubSetupChecker();
    const spy = sinon.spy();
    const wrapper = mount(<BoardSetupCheck setupChecker={checker}/>);
    expect(wrapper).not.to.be.null;
    setTimeout(() => {
      expect(wrapper).not.to.be.null;
      expect(spy).not.to.have.been.called;
      expect(window.console.error).not.to.have.been.called;
      done();
    }, 1500);
  });

  it('fails if chrome version is wrong', done => {
    const checker = new StubSetupChecker();
    checker.detectChromeVersion.rejects(new Error('test error'));
    const wrapper = mount(<BoardSetupCheck setupChecker={checker}/>);
    expect(wrapper).not.to.be.null;
    setTimeout(() => {
      expect(wrapper.find('.fa-times-circle')).to.have.length(1);
      expect(wrapper.find('.fa-clock-o')).to.have.length(4);
      expect(wrapper.text()).to.include('Your current browser is not supported at this time.');
      done();
    }, 1500);
  });
});

/**
 * SetupChecker with all methods stubbed and by default everything succeeds.
 * Since methods are sinon stubs, individual tests can modify stub behavior
 * as needed.
 * @see http://sinonjs.org/releases/v2.1.0/stubs/#defining-stub-behavior-on-consecutive-calls
 */
class StubSetupChecker extends SetupChecker {
  constructor() {
    super();
    sinon.stub(this, 'detectChromeVersion').resolves();
    sinon.stub(this, 'detectChromeAppInstalled').resolves();
    sinon.stub(this, 'detectBoardPluggedIn').resolves();
    sinon.stub(this, 'detectCorrectFirmware').resolves();
    sinon.stub(this, 'detectComponentsInitialize').resolves();
    sinon.stub(this, 'celebrate').resolves();
    sinon.stub(this, 'teardown');
  }
}
