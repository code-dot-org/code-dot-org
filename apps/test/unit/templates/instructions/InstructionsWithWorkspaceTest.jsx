import $ from 'jquery';
import React from 'react';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {shallow, mount} from 'enzyme';
import {assert, expect} from '../../../util/reconfiguredChai';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import instructionsReducer, {
  setInstructionsConstants
} from '@cdo/apps/redux/instructions';
import pageConstantsReducer, {
  setPageConstants
} from '@cdo/apps/redux/pageConstants';
import isRtlReducer, {setRtl} from '@cdo/apps/code-studio/isRtlRedux';
import InstructionsWithWorkspace, {
  UnwrappedInstructionsWithWorkspace
} from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';

describe('InstructionsWithWorkspace', () => {
  it('renders instructions and code workspace', () => {
    const wrapper = shallow(
      <UnwrappedInstructionsWithWorkspace
        instructionsHeight={400}
        setInstructionsMaxHeightAvailable={() => {}}
      />
    );

    expect(wrapper.find('Connect(TopInstructions)')).to.have.lengthOf(1);
    expect(wrapper.find('Connect(CodeWorkspaceContainer)')).to.have.lengthOf(1);
  });

  it('initially does not know window width or height', () => {
    const wrapper = shallow(
      <UnwrappedInstructionsWithWorkspace
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
    let setInstructionsMaxHeightAvailable;

    beforeEach(() => {
      setInstructionsMaxHeightAvailable = sinon.spy();

      sinon.stub($.fn, 'width').returns(1024);
      sinon.stub($.fn, 'height').returns(768);
    });

    afterEach(() => {
      $.fn.width.restore();
      $.fn.height.restore();
    });

    function setupComponent({
      instructionsHeight = 400,
      codeWorkspaceHeight = 100
    } = {}) {
      const wrapper = shallow(
        <UnwrappedInstructionsWithWorkspace
          instructionsHeight={instructionsHeight}
          setInstructionsMaxHeightAvailable={setInstructionsMaxHeightAvailable}
        />
      );

      // Fake ref to inner object, since we're shallow rendering.
      wrapper.instance().codeWorkspaceContainer = {
        getWrappedInstance: () => ({
          getRenderedHeight: () => codeWorkspaceHeight
        })
      };

      return wrapper;
    }

    it('does nothing if window size has not changed', () => {
      const wrapper = setupComponent();

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
      const wrapper = setupComponent();
      wrapper.instance().onResize();
      expect(
        setInstructionsMaxHeightAvailable
      ).to.have.been.calledOnce.and.calledWith(230);
    });

    it('breakpoint in behavior at total height of 420 (meets all reserves)', () => {
      let wrapper;

      wrapper = setupComponent({
        instructionsHeight: 18,
        codeWorkspaceHeight: 400
      });
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).to.have.been.calledWith(139);

      setInstructionsMaxHeightAvailable.resetHistory();

      wrapper = setupComponent({
        instructionsHeight: 19,
        codeWorkspaceHeight: 400
      });
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).to.have.been.calledWith(140);

      setInstructionsMaxHeightAvailable.resetHistory();

      wrapper = setupComponent({
        instructionsHeight: 20,
        codeWorkspaceHeight: 400
      });
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).to.have.been.calledWith(150);

      setInstructionsMaxHeightAvailable.resetHistory();

      wrapper = setupComponent({
        instructionsHeight: 21,
        codeWorkspaceHeight: 400
      });
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).to.have.been.calledWith(151);
    });

    it('skips callback if codeWorkspaceContainer is not initialized', () => {
      const wrapper = setupComponent({codeWorkspaceHeight: 0});
      wrapper.instance().onResize();
      expect(setInstructionsMaxHeightAvailable).not.to.have.been.called;
    });
  });

  // This is a set of integration tests over the draggable resize grippy's behavior,
  // which lives between the instructions area and the code workspace.
  // As a result, these tests use much heavier setup than the rest of the file.
  describe('resize bar behavior', () => {
    beforeEach(() => {
      stubRedux();

      // Setup minimum redux config for these integration tests
      registerReducers({
        instructions: instructionsReducer,
        isRtl: isRtlReducer,
        pageConstants: pageConstantsReducer
      });
      const store = getStore();
      store.dispatch(setRtl(false));
      store.dispatch(
        setPageConstants({
          hideSource: false,
          isEmbedView: false,
          isShareView: false,
          noVisualization: false
        })
      );
      store.dispatch(
        setInstructionsConstants({
          longInstructions: `Fake instructions`,
          noInstructionsWhenCollapsed: true
        })
      );

      // Stub $().outerHeight, which is used to find the height of the instructions content
      // in the DOM but doesn't return anything in tests, to always give 500px as the height
      // of the instructions content since it gives us something to resize.
      sinon.stub($.fn, 'outerHeight').returns(500);
    });

    afterEach(() => {
      $.fn.outerHeight.restore();
      restoreRedux();
    });

    it('can resize instructions by dragging the resize bar', () => {
      const store = getStore();
      const wrapper = mount(
        <Provider store={store}>
          <InstructionsWithWorkspace>
            <div style={{height: 400}}>
              Fake workspace to give the workspace container a height.
            </div>
          </InstructionsWithWorkspace>
        </Provider>
      );
      // utils.fireResizeEvent();

      const resizer = () => wrapper.find('HeightResizer');
      const instructionsHeight = () =>
        wrapper
          .find('TopInstructions')
          .find('.editor-column')
          .prop('style').height;

      // Initial state
      // Instructions content height is stubbed to 500.
      // Initial render height is 300.
      // Real 'height' style on relevant element is 287 due to 13px resize bar adjustment.

      assert.equal(287, instructionsHeight());
      assert.include(store.getState().instructions, {
        renderedHeight: 300,
        expandedHeight: 300,
        maxNeededHeight: 543,
        maxAvailableHeight: Infinity
      });

      // Drag the resize bar to make the instructions bigger by 100px

      resizer().simulate('mousedown', {button: 0, pageY: 0});
      resizer().simulate('mousemove', {pageY: 100});
      resizer().simulate('mouseup', {});

      // Check updated instructions size

      assert.equal(387, instructionsHeight());
      assert.include(store.getState().instructions, {
        renderedHeight: 400,
        expandedHeight: 400,
        maxNeededHeight: 543,
        maxAvailableHeight: Infinity
      });

      // Drag the resize bar to make the instructions smaller by 100px

      resizer().simulate('mousedown', {button: 0, pageY: 100});
      resizer().simulate('mousemove', {pageY: 0});
      resizer().simulate('mouseup', {});

      // Check updated instructions size

      assert.equal(287, instructionsHeight());
      assert.include(store.getState().instructions, {
        renderedHeight: 300,
        expandedHeight: 300,
        maxNeededHeight: 543,
        maxAvailableHeight: Infinity
      });

      // Drag the resize bar to make the instructions as large as possible

      resizer().simulate('mousedown', {button: 0, pageY: 0});
      resizer().simulate('mousemove', {pageY: 1000});
      resizer().simulate('mouseup', {});

      // Check the instructions stopped at their max needed height

      assert.equal(530, instructionsHeight());
      assert.include(store.getState().instructions, {
        renderedHeight: 543,
        expandedHeight: 543,
        maxNeededHeight: 543,
        maxAvailableHeight: Infinity
      });

      // Drag the resize bar to make the instructions as small as possible

      resizer().simulate('mousedown', {button: 0, pageY: 1000});
      resizer().simulate('mousemove', {pageY: 0});
      resizer().simulate('mouseup', {});

      // Check the instructions stopped at their minimum height

      assert.equal(60, instructionsHeight());
      assert.include(store.getState().instructions, {
        renderedHeight: 73,
        expandedHeight: 73,
        maxNeededHeight: 543,
        maxAvailableHeight: Infinity
      });
    });
  });
});
