import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';

import {UnwrappedInstructionsWithWorkspace as InstructionsWithWorkspace} from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';

describe('InstructionsWithWorkspace', () => {
  it('renders instructions and code workspace', () => {
    const wrapper = shallow(
      <InstructionsWithWorkspace
        instructionsHeight={400}
        setInstructionsMaxHeightAvailable={() => {}}
      />
    );

    expect(wrapper.find('Connect(TopInstructions)')).toHaveLength(1);
    expect(wrapper.find('Connect(CodeWorkspaceContainer)')).toHaveLength(1);
  });

  it('initially does not know window width or height', () => {
    const wrapper = shallow(
      <InstructionsWithWorkspace
        instructionsHeight={400}
        setInstructionsMaxHeightAvailable={() => {}}
      />
    );
    expect(wrapper.state()).toEqual({
      windowWidth: undefined,
      windowHeight: undefined,
    });
  });

  describe('onResize', () => {
    let setInstructionsMaxHeightAvailable;

    beforeEach(() => {
      setInstructionsMaxHeightAvailable = jest.fn();

      jest.spyOn($.fn, 'width').mockClear().mockReturnValue(1024);
      jest.spyOn($.fn, 'height').mockClear().mockReturnValue(768);
    });

    afterEach(() => {
      $.fn.width.mockRestore();
      $.fn.height.mockRestore();
    });

    function setupComponent({
      instructionsHeight = 400,
      codeWorkspaceHeight = 100,
    } = {}) {
      const wrapper = shallow(
        <InstructionsWithWorkspace
          instructionsHeight={instructionsHeight}
          setInstructionsMaxHeightAvailable={setInstructionsMaxHeightAvailable}
        />
      );

      // Fake ref to inner object, since we're shallow rendering.
      wrapper.instance().codeWorkspaceContainer = {
        getRenderedHeight: () => codeWorkspaceHeight,
      };

      return wrapper;
    }

    it('does nothing if window size has not changed', () => {
      const wrapper = setupComponent();

      wrapper.setState({
        windowWidth: 640,
        windowHeight: 480,
      });
      $.fn.width.mockReturnValue(640);
      $.fn.height.mockReturnValue(480);
      jest.spyOn(wrapper.instance(), 'setState').mockClear();

      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).not.toHaveBeenCalled();
      expect(wrapper.instance().setState).not.toHaveBeenCalled();
    });

    it('handles resize', () => {
      const wrapper = setupComponent();
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).toHaveBeenCalledWith(230);
    });

    it('breakpoint in behavior at total height of 420 (meets all reserves)', () => {
      let wrapper;

      wrapper = setupComponent({
        instructionsHeight: 18,
        codeWorkspaceHeight: 400,
      });
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).toHaveBeenCalledWith(139);

      setInstructionsMaxHeightAvailable.mockReset();

      wrapper = setupComponent({
        instructionsHeight: 19,
        codeWorkspaceHeight: 400,
      });
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).toHaveBeenCalledWith(140);

      setInstructionsMaxHeightAvailable.mockReset();

      wrapper = setupComponent({
        instructionsHeight: 20,
        codeWorkspaceHeight: 400,
      });
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).toHaveBeenCalledWith(150);

      setInstructionsMaxHeightAvailable.mockReset();

      wrapper = setupComponent({
        instructionsHeight: 21,
        codeWorkspaceHeight: 400,
      });
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).toHaveBeenCalledWith(151);
    });
  });
});
