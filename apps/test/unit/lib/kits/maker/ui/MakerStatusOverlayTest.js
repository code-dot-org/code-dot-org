/** @file Test maker overlay */
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import applabI18n from '@cdo/applab/locale';
import {UnconnectedMakerStatusOverlay} from '@cdo/apps/lib/kits/maker/ui/MakerStatusOverlay';



describe('MakerStatusOverlay', () => {
  beforeEach(() => {
    // Stub i18n function before translation tests.
    const i18n = {
      makerCheckPluggedIn: 'i18n-check-plugged-in',
      makerSupportedBrowsers: 'i18n-supported-browsers',
      makerLevelRequires: 'i18n-level-requires',
      makerRunWithoutBoard: 'i18n-run-without-board',
      makerSetupInstructions: 'i18n-setup-instructions',
      makerTryAgain: 'i18n-try-again',
      makerWaitingForConnect: 'i18n-waiting-for-connect',
    };

    for (const key in i18n) {
      sinon.stub(applabI18n, key).returns(i18n[key]);
    }
  });

  afterEach(() => {
    sinon.restore();
  });
  const testProps = {
    width: 10,
    height: 15,
    isConnecting: false,
    isWrongBrowser: false,
    hasConnectionError: false,
    handleTryAgain: () => {},
    handleDisableMaker: () => {},
    handleOpenSetupPage: () => {},
    useVirtualBoardOnNextRun: () => {},
  };

  it('renders nothing by default', () => {
    const wrapper = mount(<UnconnectedMakerStatusOverlay {...testProps} />);
    expect(wrapper.html()).toBeNull();
  });

  describe('size properties', () => {
    it('control the overlay size', () => {
      const wrapper = mount(
        <UnconnectedMakerStatusOverlay
          {...testProps}
          isConnecting
          width={22}
          height={42}
        />
      );
      expect(wrapper).to.have.style('width', '22px');
      expect(wrapper).to.have.style('height', '42px');
    });

    it('on the error overlay too', () => {
      const wrapper = mount(
        <UnconnectedMakerStatusOverlay
          {...testProps}
          hasConnectionError
          width={22}
          height={42}
        />
      );
      expect(wrapper).to.have.style('width', '22px');
      expect(wrapper).to.have.style('height', '42px');
    });
  });

  describe('scale property', () => {
    it('sets scale transform if scale property is provided', () => {
      const wrapper = mount(
        <UnconnectedMakerStatusOverlay
          {...testProps}
          isConnecting
          scale={0.65}
        />
      );
      expect(wrapper).to.have.style('transform', 'scale(0.65)');
      expect(wrapper).to.have.style('msTransform', 'scale(0.65)');
      expect(wrapper).to.have.style('WebkitTransform', 'scale(0.65)');
    });

    it('sets no transform if scale property is absent', () => {
      const wrapper = mount(
        <UnconnectedMakerStatusOverlay {...testProps} isConnecting />
      );
      expect(wrapper).to.not.have.style('transform');
      expect(wrapper).to.not.have.style('msTransform');
      expect(wrapper).to.not.have.style('WebkitTransform');
    });
  });

  describe('when connecting', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <UnconnectedMakerStatusOverlay {...testProps} isConnecting />
      );
    });

    it('renders an overlay', () => {
      expect(wrapper.find('div').length).toBeGreaterThan(0);
    });

    it('with a spinning gear', () => {
      expect(wrapper.find('i.fa-cog.fa-spin').length).toBeGreaterThan(0);
    });

    it('and waiting text', () => {
      expect(wrapper.text()).toContain('i18n-waiting-for-connect');
    });

    it('and no button', () => {
      expect(wrapper.find('button')).toHaveLength(0);
    });
  });

  describe('on unsupported browser', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <UnconnectedMakerStatusOverlay {...testProps} isWrongBrowser />
      );
    });

    it('renders an overlay', () => {
      expect(wrapper.find('div').length).toBeGreaterThan(0);
    });

    it('with a warning sign', () => {
      expect(wrapper.find('i.fa-exclamation-triangle').length).toBeGreaterThan(0);
    });

    it('and error text', () => {
      expect(wrapper.text()).toContain('i18n-level-requires');
      expect(wrapper.text()).toContain('i18n-supported-browsers');
    });
  });

  describe('on error', () => {
    let wrapper, handleTryAgain, useVirtualBoardOnNextRun, handleOpenSetupPage;

    beforeEach(() => {
      handleTryAgain = sinon.spy();
      useVirtualBoardOnNextRun = sinon.spy();
      handleOpenSetupPage = sinon.spy();
      wrapper = mount(
        <UnconnectedMakerStatusOverlay
          {...testProps}
          hasConnectionError
          handleTryAgain={handleTryAgain}
          useVirtualBoardOnNextRun={useVirtualBoardOnNextRun}
          handleOpenSetupPage={handleOpenSetupPage}
        />
      );
    });

    it('renders an overlay', () => {
      expect(wrapper.find('div').length).toBeGreaterThan(0);
    });

    it('with a warning sign', () => {
      expect(wrapper.find('i.fa-exclamation-triangle').length).toBeGreaterThan(0);
    });

    it('and error text', () => {
      expect(wrapper.text()).toContain('i18n-check-plugged-in');
    });

    it('and a "Try Again" button', () => {
      const selector = 'button.try-again';
      expect(wrapper.find(selector).length).toBeGreaterThan(0);
      expect(wrapper.find(selector).text()).toContain('i18n-try-again');
    });

    it('that calls the provided try again handler', () => {
      const selector = 'button.try-again';
      expect(handleTryAgain).not.toHaveBeenCalled();
      wrapper.find(selector).simulate('click');
      expect(handleTryAgain).toHaveBeenCalledTimes(1);
    });

    it('and a "Run Without Board" button', () => {
      const selector = 'button.run-without-board';
      expect(wrapper.find(selector).length).toBeGreaterThan(0);
      expect(wrapper.find(selector).text()).toContain('i18n-run-without-board');
    });

    it('that calls the try again handler and useVirtualBoardOnNextRun handler', () => {
      const selector = 'button.run-without-board';
      expect(handleTryAgain).not.toHaveBeenCalled();
      expect(useVirtualBoardOnNextRun).not.toHaveBeenCalled();
      wrapper.find(selector).simulate('click');
      expect(handleTryAgain).toHaveBeenCalledTimes(1);
      expect(useVirtualBoardOnNextRun).toHaveBeenCalledTimes(1);
    });

    it('and a "Setup Instructions" button', () => {
      const selector = 'button.setup-instructions';
      expect(wrapper.find(selector).length).toBeGreaterThan(0);
      expect(wrapper.find(selector).text()).toContain('i18n-setup-instructions');
    });

    it('that navigates to the Maker Setup page', () => {
      const selector = 'button.setup-instructions';
      expect(handleOpenSetupPage).not.toHaveBeenCalled();
      wrapper.find(selector).simulate('click');
      expect(handleOpenSetupPage).toHaveBeenCalledTimes(1);
    });
  });
});
