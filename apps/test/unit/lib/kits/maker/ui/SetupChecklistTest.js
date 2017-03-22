/** @file Test SetupChecklist component */
import React from 'react';
import sinon from 'sinon';
import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
import SetupChecklist from '@cdo/apps/lib/kits/maker/ui/SetupChecklist';
import SetupChecker from '@cdo/apps/lib/kits/maker/util/SetupChecker';

describe('SetupChecklist', () => {
  const STEP_DELAY = 15;
  let checker;

  beforeEach(() => {
    sinon.stub(window.console, 'error');
    sinon.stub(window.location, 'reload');
    checker = new StubSetupChecker();
  });

  afterEach(() => {
    window.location.reload.restore();
    window.console.error.restore();
  });

  it('renders success', done => {
    const wrapper = mount(
      <SetupChecklist
        setupChecker={checker}
        stepDelay={STEP_DELAY}
      />
    );
    expect(wrapper.find('.fa-clock-o')).to.have.length(5);
    setTimeout(() => {
      expect(wrapper.find('.fa-check-circle')).to.have.length(5);
      expect(window.console.error).not.to.have.been.called;
      done();
    }, STEP_DELAY * 10);
  });

  it('fails if chrome version is wrong', done => {
    const error = new Error('test error');
    checker.detectChromeVersion.rejects(error);
    const wrapper = mount(
      <SetupChecklist
        setupChecker={checker}
        stepDelay={STEP_DELAY}
      />
    );
    expect(wrapper.find('.fa-clock-o')).to.have.length(5);
    setTimeout(() => {
      expect(wrapper.find('.fa-times-circle')).to.have.length(1);
      expect(wrapper.find('.fa-clock-o')).to.have.length(4);
      expect(wrapper.text()).to.include('Your current browser is not supported at this time.');
      expect(window.console.error).to.have.been.calledWith(error);
      done();
    }, STEP_DELAY * 10);
  });

  it('does not reload the page on re-detect if successful', done => {
    const wrapper = mount(
      <SetupChecklist
        setupChecker={checker}
        stepDelay={STEP_DELAY}
      />
    );
    setTimeout(() => {
      expect(wrapper.find('.fa-check-circle')).to.have.length(5);
      wrapper.find('input[value="re-detect"]').simulate('click');
      expect(wrapper.find('.fa-clock-o')).to.have.length(5);
      setTimeout(() => {
        expect(wrapper.find('.fa-check-circle')).to.have.length(5);
        expect(window.location.reload).not.to.have.been.called;
        done();
      }, STEP_DELAY * 10);
    }, STEP_DELAY * 10);
  });

  it('reloads the page on re-detect if plugin not installed', done => {
    checker.detectChromeAppInstalled.rejects(new Error('not installed'));
    const wrapper = mount(
      <SetupChecklist
        setupChecker={checker}
        stepDelay={STEP_DELAY}
      />
    );
    setTimeout(() => {
      expect(wrapper.find('.fa-check-circle')).to.have.length(1);
      expect(wrapper.find('.fa-times-circle')).to.have.length(1);
      expect(wrapper.find('.fa-clock-o')).to.have.length(3);
      wrapper.find('input[value="re-detect"]').simulate('click');
      expect(window.location.reload).to.have.been.called;
      done();
    }, STEP_DELAY * 10);
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
