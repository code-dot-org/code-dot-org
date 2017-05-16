/** @file Test maker overlay */
import React from 'react';
import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {UnconnectedMakerStatusOverlay} from '@cdo/apps/lib/kits/maker/ui/MakerStatusOverlay';

describe('MakerStatusOverlay', () => {
  it('renders nothing by default', () => {
    const wrapper = mount(
      <UnconnectedMakerStatusOverlay
        width={10}
        height={15}
        isConnecting={false}
        hasConnectionError={false}
        handleTryAgain={() => {}}
        handleDisableMaker={() => {}}
      />
    );
    expect(wrapper.html()).to.be.null;
  });

  describe('scale property', () => {
    it('sets scale transform if scale property is provided', () => {
      const wrapper = mount(
        <UnconnectedMakerStatusOverlay
          width={10}
          height={10}
          scale={0.65}
          isConnecting={true}
          hasConnectionError={false}
          handleTryAgain={() => {}}
          handleDisableMaker={() => {}}
        />
      );
      expect(wrapper).to.have.style('transform', 'scale(0.65)');
      expect(wrapper).to.have.style('msTransform', 'scale(0.65)');
      expect(wrapper).to.have.style('WebkitTransform', 'scale(0.65)');
    });

    it('sets no transform if scale property is absent', () => {
      const wrapper = mount(
        <UnconnectedMakerStatusOverlay
          width={10}
          height={10}
          isConnecting={true}
          hasConnectionError={false}
          handleTryAgain={() => {}}
          handleDisableMaker={() => {}}
        />
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
        <UnconnectedMakerStatusOverlay
          width={10}
          height={15}
          isConnecting={true}
          hasConnectionError={false}
          handleTryAgain={() => {}}
          handleDisableMaker={() => {}}
        />
      );
    });

    it('renders an overlay', () => {
      expect(wrapper).to.have.descendants('div');
    });

    it('of given size', () => {
      expect(wrapper).to.have.style('width', '10px');
      expect(wrapper).to.have.style('height', '15px');
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

  describe('on error', () => {
    let wrapper, handleTryAgain, handleDisableMaker, useFakeBoardOnNextRun;

    beforeEach(() => {
      handleTryAgain = sinon.spy();
      handleDisableMaker = sinon.spy();
      useFakeBoardOnNextRun = sinon.spy();
      wrapper = mount(
        <UnconnectedMakerStatusOverlay
          width={11}
          height={16}
          isConnecting={false}
          hasConnectionError={true}
          handleTryAgain={handleTryAgain}
          handleDisableMaker={handleDisableMaker}
          useFakeBoardOnNextRun={useFakeBoardOnNextRun}
        />
      );
    });

    it('renders an overlay', () => {
      expect(wrapper).to.have.descendants('div');
    });

    it('of given size', () => {
      expect(wrapper).to.have.style('width', '11px');
      expect(wrapper).to.have.style('height', '16px');
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

    it('and a "Get Help" link', () => {
      expect(wrapper).to.have.descendants('a[children="Get Help"]');
    });

    it('that opens the maker setup page in a new tab', () => {
      const link = wrapper.find('a[children="Get Help"]');
      expect(link).to.have.prop('href', '/maker/setup');
      expect(link).to.have.prop('target', '_blank');
    });

    it('and a "Disable Maker Toolkit" link', () => {
      expect(wrapper).to.have.descendants('a[children="Disable Maker Toolkit"]');
    });

    it('that calls the provided disable handler', () => {
      expect(handleDisableMaker).not.to.have.been.called;
      wrapper.find('a[children="Disable Maker Toolkit"]').simulate('click');
      expect(handleDisableMaker).to.have.been.calledOnce;
    });
  });
});
