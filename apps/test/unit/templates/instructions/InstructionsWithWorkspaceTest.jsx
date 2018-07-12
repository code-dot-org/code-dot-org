import $ from 'jquery';
import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {
  UnwrappedInstructionsWithWorkspace as InstructionsWithWorkspace
} from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';

describe('InstructionsWithWorkspace', () => {
  it('renders instructions and code workspace', () => {
    const wrapper = shallow(
      <InstructionsWithWorkspace
        instructionsHeight={400}
        setInstructionsMaxHeightAvailable={() => {}}
      />
    );
    expect(wrapper).to.have.descendants('Connect(TopInstructions)');
    expect(wrapper).to.have.descendants('Connect(CodeWorkspaceContainer)');
  });

  it('initially does not know window width or height', () => {
    const wrapper = shallow(
      <InstructionsWithWorkspace
        instructionsHeight={400}
        setInstructionsMaxHeightAvailable={() => {}}
      />
    );
    expect(wrapper.state()).to.deep.equal({
      windowWidth: undefined,
      windowHeight: undefined
    });
  });

  describe('onResize', () => {
    beforeEach(() => {
      sinon.stub($.fn, 'width').returns(1024);
      sinon.stub($.fn, 'height').returns(768);
    });

    afterEach(() => {
      $.fn.width.restore();
      $.fn.height.restore();
    });

    it('does nothing if window size has not changed', () => {
      const setInstructionsMaxHeightAvailable = sinon.spy();
      const wrapper = shallow(
        <InstructionsWithWorkspace
          instructionsHeight={400}
          setInstructionsMaxHeightAvailable={setInstructionsMaxHeightAvailable}
        />
      );

      wrapper.setState({
        windowWidth: 640,
        windowHeight: 480
      });
      $.fn.width.returns(640);
      $.fn.height.returns(480);
      sinon.spy(wrapper.instance(), 'setState');

      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).not.to.have.been.called;
      expect(wrapper.instance().setState).not.to.have.been.called;
    });

    it('handles resize', () => {
      const setInstructionsMaxHeightAvailable = sinon.spy();
      const wrapper = shallow(
        <InstructionsWithWorkspace
          instructionsHeight={400}
          setInstructionsMaxHeightAvailable={setInstructionsMaxHeightAvailable}
        />
      );

      // Fake ref to inner object, since we're shallow rendering.
      wrapper.instance().codeWorkspaceContainer = {
        getWrappedInstance: () => ({
          getRenderedHeight: () => 100
        })
      };

      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).to.have.been.calledOnce
        .and.calledWith(230);
    });
  });
});
