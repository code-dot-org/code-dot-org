import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import TextConsole from '@cdo/apps/p5lab/spritelab/TextConsole';
import {mount} from 'enzyme';
import sinon from 'sinon';

describe('Sprite Lab Text Console', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<TextConsole consoleMessages={[]} />);
  });

  it('is initially closed', () => {
    expect(wrapper.state().open).to.be.false;
  });

  it('and the button is hidden', () => {
    expect(wrapper.instance().getButtonStyle().display).to.equal('none');
  });

  describe('after a line is added', () => {
    let clock;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
      wrapper.setProps({consoleMessages: ['hello world2']});
    });

    afterEach(() => {
      clock.restore();
    });

    it('opens', () => {
      expect(wrapper.state().open).to.be.true;
    });

    it('the button remains hidden', () => {
      expect(wrapper.instance().getButtonStyle().display).to.equal('none');
    });

    it('closes after 4000 ms', () => {
      clock.tick(4000);
      expect(wrapper.state().open).to.be.false;
    });

    describe('and the console is toggled', () => {
      beforeEach(() => {
        wrapper.instance().toggleConsole();
      });

      it('closes', () => {
        expect(wrapper.state().open).to.be.false;
      });

      it('the button becomes visible', () => {
        expect(wrapper.instance().getButtonStyle().display).to.not.equal(
          'none'
        );
      });

      it('opens when toggled again', () => {
        wrapper.instance().toggleConsole();
        expect(wrapper.state().open).to.be.true;
      });

      it('opens when the button is clicked', () => {
        wrapper.instance().openThenClose();
        expect(wrapper.state().open).to.be.true;
      });
    });
  });
});
