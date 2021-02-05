import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import TextConsole, {
  AUTO_CLOSE_TIME
} from '@cdo/apps/p5lab/spritelab/TextConsole';
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

  it('and the button text is +', () => {
    const button = wrapper.findWhere(node => {
      return node.type() === 'button' && node.text() === '+';
    });
    expect(button).to.have.lengthOf(1);
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

    it('the button text is -', () => {
      const button = wrapper.findWhere(node => {
        return node.type() === 'button' && node.text() === '-';
      });
      expect(button).to.have.lengthOf(1);
    });

    it('closes after AUTO_CLOSE_TIME ms', () => {
      clock.tick(AUTO_CLOSE_TIME);
      expect(wrapper.state().open).to.be.false;

      const button = wrapper.findWhere(node => {
        return node.type() === 'button' && node.text() === '+';
      });
      expect(button).to.have.lengthOf(1);
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
        wrapper.instance().toggleConsole(AUTO_CLOSE_TIME);
        expect(wrapper.state().open).to.be.true;
      });

      it('opens and stays open when the button is clicked', () => {
        wrapper.instance().toggleConsole();
        expect(wrapper.state().open).to.be.true;
        clock.tick(AUTO_CLOSE_TIME * 2);
        expect(wrapper.state().open).to.be.true;
      });
    });
  });
});
