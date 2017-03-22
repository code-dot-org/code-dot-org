/** @file Test maker overlay */
import React from 'react';
import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {UnconnectedMakerStatusOverlay} from '@cdo/apps/lib/kits/maker/ui/MakerStatusOverlay';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

describe('MakerStatusOverlay', () => {
  it('renders nothing by default', () => {
    const wrapper = mount(
      <UnconnectedMakerStatusOverlay
        width={10}
        height={15}
        isConnecting={false}
        hasConnectionError={false}
      />
    );
    expect(wrapper.html()).to.be.null;
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
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <UnconnectedMakerStatusOverlay
          width={11}
          height={16}
          isConnecting={false}
          hasConnectionError={true}
        />
      );
      sinon.stub(studioApp, 'resetButtonClick');
      sinon.stub(studioApp, 'runButtonClick');
    });

    afterEach(() => {
      studioApp.resetButtonClick.restore();
      studioApp.runButtonClick.restore();
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

    it('and waiting text', () => {
      expect(wrapper.text()).to.include('Make sure your board is plugged in.');
    });

    it('and a "Try Again" button', () => {
      expect(wrapper).to.have.descendants('button');
      expect(wrapper.find('button').text()).to.include('Try Again');
    });

    it('that triggers a reset and run when clicked', () => {
      expect(studioApp.resetButtonClick).not.to.have.been.called;
      expect(studioApp.runButtonClick).not.to.have.been.called;
      wrapper.find('button').simulate('click');
      expect(studioApp.resetButtonClick).to.have.been.calledOnce;
      expect(studioApp.runButtonClick).to.have.been.calledOnce;
    });
  });
});
