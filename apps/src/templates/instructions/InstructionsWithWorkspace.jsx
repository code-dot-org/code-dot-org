import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import CodeWorkspaceContainer from '../CodeWorkspaceContainer';
import TopInstructions from './TopInstructions';
import {setInstructionsMaxHeightAvailable} from '../../redux/instructions';

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
    setInstructionsMaxHeightAvailable: PropTypes.func.isRequired
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

    // Continue here even if the workspace height is measured at zero. Workspace
    // height at zero is a somewhat common case after rotating the screen on
    // mobile. Especially when using an Android device in blockly labs where
    // there is a dismissable message in the instructions.

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

  render() {
    return (
      <span>
        <TopInstructions />
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
      instructionsHeight: state.instructions.renderedHeight
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      setInstructionsMaxHeightAvailable(maxHeight) {
        dispatch(setInstructionsMaxHeightAvailable(maxHeight));
      }
    };
  }
)(UnwrappedInstructionsWithWorkspace);
