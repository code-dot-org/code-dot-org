import $ from 'jquery';
import React from 'react';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import instructionsReducer from '@cdo/apps/redux/instructions';
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
    });

    afterEach(() => {
      restoreRedux();
    });

    it('can deep-render component', () => {
      mount(
        <Provider store={getStore()}>
          <InstructionsWithWorkspace />
        </Provider>
      );
    });
  });
});
