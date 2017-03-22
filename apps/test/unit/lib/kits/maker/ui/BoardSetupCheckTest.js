/** @file Test BoardSetupCheck component */
import React from 'react';
import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
import BoardSetupCheck from '@cdo/apps/lib/kits/maker/ui/BoardSetupCheck';

describe('BoardSetupCheck', () => {
  it('renders', done => {
    const stubChecker = new StubSetupChecker();
    const wrapper = mount(<BoardSetupCheck setupChecker={stubChecker}/>);
    expect(wrapper).not.to.be.null;
    setTimeout(() => {
      expect(wrapper).not.to.be.null;
      done();
    }, 3000);
  });
});

class StubSetupChecker {
  detectChromeVersion() {
    return Promise.resolve();
  }

  detectChromeAppInstalled() {
    return Promise.resolve();
  }

  detectBoardPluggedIn() {
    return Promise.resolve();
  }

  detectCorrectFirmware() {
    return Promise.resolve();
  }

  detectComponentsInitialize() {
    return Promise.resolve();
  }

  celebrate() {
    return Promise.resolve();
  }

  teardown() {}
}
