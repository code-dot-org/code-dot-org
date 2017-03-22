/** @file Test BoardSetupCheck component */
import React from 'react';
import sinon from 'sinon';
import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
import BoardSetupCheck from '@cdo/apps/lib/kits/maker/ui/BoardSetupCheck';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';

describe('BoardSetupCheck', () => {
  it('renders', done => {
    const checker = new StubSetupChecker();
    const wrapper = mount(<BoardSetupCheck setupChecker={checker}/>);
    expect(wrapper).not.to.be.null;
    setTimeout(() => {
      expect(wrapper).not.to.be.null;
      done();
    }, 3000);
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
    sinon.stub(this, 'detectChromeVersion').returns(Promise.resolve());
    sinon.stub(this, 'detectChromeAppInstalled').returns(Promise.resolve());
    sinon.stub(this, 'detectBoardPluggedIn').returns(Promise.resolve());
    sinon.stub(this, 'detectCorrectFirmware').returns(Promise.resolve());
    sinon.stub(this, 'detectComponentsInitialize').returns(Promise.resolve());
    sinon.stub(this, 'celebrate').returns(Promise.resolve());
    sinon.stub(this, 'teardown');
  }
}
