/** @file Test maker overlay */
import React from 'react';
import {expect} from '../../../../../util/deprecatedChai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {UnconnectedMakerStatusOverlay} from '@cdo/apps/lib/kits/maker/ui/MakerStatusOverlay';

describe('MakerStatusOverlay', () => {
  const testProps = {
    width: 10,
    height: 15,
    isConnecting: false,
    isWrongBrowser: false,
    hasConnectionError: false,
    handleTryAgain: () => {},
    handleDisableMaker: () => {},
    handleOpenSetupPage: () => {},
    useFakeBoardOnNextRun: () => {}
  };

  it('renders nothing by default', () => {
    const wrapper = mount(<UnconnectedMakerStatusOverlay {...testProps} />);
    expect(wrapper.html()).to.be.null;
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
      expect(wrapper).not.to.have.style('transform');
      expect(wrapper).not.to.have.style('msTransform');
      expect(wrapper).not.to.have.style('WebkitTransform');
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
      expect(wrapper).to.have.descendants('div');
    });

    it('with a spinning gear', () => {
      expect(wrapper).to.have.descendants('i.fa-cog.fa-spin');
    });

    it('and waiting text', () => {
      expect(wrapper.text()).to.include('Waiting for board to connect...');
    });

    it('and no button', () => {
      expect(wrapper).not.to.have.descendants('button');
    });
  });

  describe('on unsupported browser', () => {
    let wrapper, handleDisableMaker, handleOpenSetupPage;

    beforeEach(() => {
      handleDisableMaker = sinon.spy();
      handleOpenSetupPage = sinon.spy();
      wrapper = mount(
        <UnconnectedMakerStatusOverlay
          {...testProps}
          isWrongBrowser
          handleDisableMaker={handleDisableMaker}
          handleOpenSetupPage={handleOpenSetupPage}
        />
      );
    });

    it('renders an overlay', () => {
      expect(wrapper).to.have.descendants('div');
    });

    it('with a warning sign', () => {
      expect(wrapper).to.have.descendants('i.fa-exclamation-triangle');
    });

    it('and error text', () => {
      expect(wrapper.text()).to.include('This level requires the');
      expect(wrapper.text()).to.include('Code.org Maker App');
    });

    it('and a "Setup Instructions" button', () => {
      const selector = 'button.setup-instructions';
      expect(wrapper).to.have.descendants(selector);
      expect(wrapper.find(selector).text()).to.include(
        'Get Code.org Maker App'
      );
    });

    it('that navigates to the Maker Setup page', () => {
      const selector = 'button.setup-instructions';
      expect(handleOpenSetupPage).not.to.have.been.called;
      wrapper.find(selector).simulate('click');
      expect(handleOpenSetupPage).to.have.been.calledOnce;
    });

    it('and a "Disable Maker Toolkit" button', () => {
      const selector = 'button.disable-maker-toolkit';
      expect(wrapper).to.have.descendants(selector);
      expect(wrapper.find(selector).text()).to.include('Disable Maker Toolkit');
    });

    it('that calls the disableMaker handler', () => {
      const selector = 'button.disable-maker-toolkit';
      expect(handleDisableMaker).not.to.have.been.called;
      wrapper.find(selector).simulate('click');
      expect(handleDisableMaker).to.have.been.calledOnce;
    });
  });

  describe('on error', () => {
    let wrapper, handleTryAgain, useFakeBoardOnNextRun, handleOpenSetupPage;

    beforeEach(() => {
      handleTryAgain = sinon.spy();
      useFakeBoardOnNextRun = sinon.spy();
      handleOpenSetupPage = sinon.spy();
      wrapper = mount(
        <UnconnectedMakerStatusOverlay
          {...testProps}
          hasConnectionError
          handleTryAgain={handleTryAgain}
          useFakeBoardOnNextRun={useFakeBoardOnNextRun}
          handleOpenSetupPage={handleOpenSetupPage}
        />
      );
    });

    it('renders an overlay', () => {
      expect(wrapper).to.have.descendants('div');
    });

    it('with a warning sign', () => {
      expect(wrapper).to.have.descendants('i.fa-exclamation-triangle');
    });

    it('and error text', () => {
      expect(wrapper.text()).to.include('Make sure your board is plugged in.');
    });

    it('and a "Try Again" button', () => {
      const selector = 'button.try-again';
      expect(wrapper).to.have.descendants(selector);
      expect(wrapper.find(selector).text()).to.include('Try Again');
    });

    it('that calls the provided try again handler', () => {
      const selector = 'button.try-again';
      expect(handleTryAgain).not.to.have.been.called;
      wrapper.find(selector).simulate('click');
      expect(handleTryAgain).to.have.been.calledOnce;
    });

    it('and a "Run Without Board" button', () => {
      const selector = 'button.run-without-board';
      expect(wrapper).to.have.descendants(selector);
      expect(wrapper.find(selector).text()).to.include('Run Without Board');
    });

    it('that calls the try again handler and useFakeBoardOnNextRun handler', () => {
      const selector = 'button.run-without-board';
      expect(handleTryAgain).not.to.have.been.called;
      expect(useFakeBoardOnNextRun).not.to.have.been.called;
      wrapper.find(selector).simulate('click');
      expect(handleTryAgain).to.have.been.calledOnce;
      expect(useFakeBoardOnNextRun).to.have.been.calledOnce;
    });

    it('and a "Setup Instructions" button', () => {
      const selector = 'button.setup-instructions';
      expect(wrapper).to.have.descendants(selector);
      expect(wrapper.find(selector).text()).to.include('Setup Instructions');
    });

    it('that navigates to the Maker Setup page', () => {
      const selector = 'button.setup-instructions';
      expect(handleOpenSetupPage).not.to.have.been.called;
      wrapper.find(selector).simulate('click');
      expect(handleOpenSetupPage).to.have.been.calledOnce;
    });
  });
});
