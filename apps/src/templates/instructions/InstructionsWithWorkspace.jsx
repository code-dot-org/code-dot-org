import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import CodeWorkspaceContainer from '../CodeWorkspaceContainer';
import TopInstructions, {MIN_HEIGHT} from './TopInstructions';
import {
  setInstructionsMaxHeightAvailable,
  setInstructionsRenderedHeight
} from '../../redux/instructions';
import HeightResizer from './HeightResizer';
import clamp from 'lodash/clamp';

/**
 * A component representing the right side of the screen in our app. In particular
 * it has instructions in the top pane (unless disabled), a resizer, and then
 * our code workspace component.
 * Owns maxHeightAvailable for instructions, updating as appropriate on window
 * resize events
 */
export class UnwrappedInstructionsWithWorkspace extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    // props provided via connect
    instructionsHeight: PropTypes.number.isRequired,
    instructionsMaxHeight: PropTypes.number.isRequired,
    isEmbedView: PropTypes.bool.isRequired,
    setInstructionsMaxHeightAvailable: PropTypes.func.isRequired,
    setInstructionsRenderedHeight: PropTypes.func.isRequired
  };

  // only used so that we can rerender when resized
  state = {
    windowWidth: undefined,
    windowHeight: undefined
  };

  setCodeWorkspaceContainerRef = element => {
    this.codeWorkspaceContainer = element;
  };

  /**
   * Called when the window resizes. Look to see if width/height changed, then
   * call adjustTopPaneHeight as our maxHeight may need adjusting.
   */
  onResize = () => {
    // We have to have a reference to this component to do anything on resize anyway.
    // Guard here because our tests aren't cleaning up nicely :(
    if (!this.codeWorkspaceContainer) {
      return;
    }

    // TODO (brad)
    // See if we can achieve this effect with memoization instead of state
    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
    const {
      windowWidth: lastWindowWidth,
      windowHeight: lastWindowHeight
    } = this.state;
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();

    // We fire window resize events when the grippy is dragged so that non-React
    // controlled components are able to rerender the editor. If width/height
    // didn't change, we don't need to do anything else here
    if (windowWidth === lastWindowWidth && windowHeight === lastWindowHeight) {
      return;
    }

    this.setState({windowWidth, windowHeight});

    // Determine what the maximum size of our instructions is based off of the
    // size of the code workspace.

    // Have a preference for showing at least 150px of editor and 120px of
    // debugger. Shrink instructions to make room. If that doesn't provide
    // enough space, start also shrinking workspace
    // CSF doesn't have a debugger, but reserving 270 pixels for the workspace
    // there still seems reasonable.
    const EDITOR_RESERVE = 150;
    const DEBUGGER_RESERVE = 120;
    const INSTRUCTIONS_RESERVE = 150;

    const {instructionsHeight, setInstructionsMaxHeightAvailable} = this.props;
    const codeWorkspaceHeight = this.codeWorkspaceContainer
      .getWrappedInstance()
      .getRenderedHeight();
    if (codeWorkspaceHeight === 0) {
      // We haven't initialized the codeWorkspace yet. No need to change the
      // max height of instructions
      return;
    }

    const totalHeight = instructionsHeight + codeWorkspaceHeight;
    let maxInstructionsHeight = totalHeight - DEBUGGER_RESERVE - EDITOR_RESERVE;

    if (maxInstructionsHeight < INSTRUCTIONS_RESERVE) {
      // We couldn't meet all of our reserves. Just give 1/3 of whatever space
      // we have to instructions, and the other 2/3 to the workspace
      maxInstructionsHeight = Math.round(totalHeight / 3);
    }
    setInstructionsMaxHeightAvailable(maxInstructionsHeight);
  };

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  /**
   * Given a prospective delta, determines how much we can actually change the
   * height (accounting for min/max) and changes height by that much.
   * @param {number} delta
   * @returns {number} How much we actually changed
   */
  handleHeightResize = delta => {
    const {
      instructionsHeight: oldHeight,
      instructionsMaxHeight: maxHeight,
      setInstructionsRenderedHeight: setHeight
    } = this.props;

    const newHeight = clamp(oldHeight + delta, MIN_HEIGHT, maxHeight);
    setHeight(newHeight);

    return newHeight - oldHeight;
  };

  render() {
    return (
      <span>
        <TopInstructions />
        {!this.props.isEmbedView && (
          <HeightResizer
            position={this.props.instructionsHeight}
            onResize={this.handleHeightResize}
          />
        )}
        <CodeWorkspaceContainer
          ref={this.setCodeWorkspaceContainerRef}
          topMargin={this.props.instructionsHeight}
        >
          {this.props.children}
        </CodeWorkspaceContainer>
      </span>
    );
  }
}

export default connect(
  function propsFromStore(state) {
    return {
      instructionsHeight: state.instructions.renderedHeight,
      instructionsMaxHeight: Math.min(
        state.instructions.maxAvailableHeight,
        state.instructions.maxNeededHeight
      ),
      isEmbedView: state.pageConstants.isEmbedView
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      setInstructionsMaxHeightAvailable(maxHeight) {
        dispatch(setInstructionsMaxHeightAvailable(maxHeight));
      },
      setInstructionsRenderedHeight(height) {
        dispatch(setInstructionsRenderedHeight(height));
      }
    };
  }
)(UnwrappedInstructionsWithWorkspace);
