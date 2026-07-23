import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import styleConstants from '../../styleConstants';

import CollapserButton from './CollapserButton';
import ScrollButtons from './ScrollButtons';
import {getOuterHeight} from './utils';

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

class InstructionsCsfRightCol extends React.Component {
  static propTypes = {
    shouldDisplayHintPrompt: PropTypes.func.isRequired,
    promptForHint: PropTypes.bool.isRequired,
    displayScrollButtons: PropTypes.bool.isRequired,
    getScrollTarget: PropTypes.func.isRequired,
    handleClickCollapser: PropTypes.func.isRequired,
    setColWidth: PropTypes.func.isRequired,
    setColHeight: PropTypes.func.isRequired,
    hasShortAndLongInstructions: PropTypes.bool.isRequired,
    collapseIcon: PropTypes.node,
    expandIcon: PropTypes.node,
    upIcon: PropTypes.node,
    downIcon: PropTypes.node,

    // from redux
    collapsed: PropTypes.bool.isRequired,
    hints: PropTypes.arrayOf(
      PropTypes.shape({
        hintId: PropTypes.string.isRequired,
        markdown: PropTypes.string.isRequired,
        block: PropTypes.object, // XML
        video: PropTypes.string,
      })
    ).isRequired,
    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool,
    }),
    height: PropTypes.number.isRequired,
    isMinecraft: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this.updateDimensions();
  }

  componentDidUpdate(prevProps) {
    const {height, collapsed} = this.props;
    if (prevProps.height !== height || prevProps.collapsed !== collapsed) {
      this.updateDimensions();
    }
  }

  updateDimensions() {
    this.props.setColWidth(this.getColumnWidth());
    this.props.setColHeight(this.getColumnHeight());
  }

  shouldDisplayCollapserButton() {
    // if we have "extra" (non-instruction) content, we should always
    // give the option of collapsing it
    const hasExtraContent =
      this.props.hints.length ||
      this.props.shouldDisplayHintPrompt() ||
      this.props.feedback;

    // Otherwise, only show the button if we have two versions of
    // instruction we want to toggle between
    return hasExtraContent || this.props.hasShortAndLongInstructions;
  }

  getColumnWidth() {
    const collapserWidth = this.shouldDisplayCollapserButton()
      ? $(ReactDOM.findDOMNode(this.collapser)).outerWidth(true)
      : this.props.collapsed
      ? 10
      : this.props.isMinecraft
      ? 100
      : 80;
    return collapserWidth;
  }

  getColumnHeight() {
    if (this.collapser) {
      // Include 20 pixels for any scroll buttons that need to be shown.
      return getOuterHeight(this.collapser, true) + 20;
    } else {
      return 0;
    }
  }

  render() {
    const displayCollapserButton = this.shouldDisplayCollapserButton();

    const scrollButtonsHeight =
      this.props.height - HEADER_HEIGHT - RESIZER_HEIGHT - 10;

    return (
      <div
        style={{
          padding: '5px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          maxHeight: '100%',
          overflow: 'hidden',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {displayCollapserButton && (
          <CollapserButton
            ref={c => {
              this.collapser = c;
            }}
            collapseIcon={this.props.collapseIcon}
            expandIcon={this.props.expandIcon}
            collapsed={this.props.collapsed}
            onClick={this.props.handleClickCollapser}
            isMinecraft={this.props.isMinecraft}
            isRtl={this.props.isRtl}
          />
        )}
        {this.props.displayScrollButtons && (
          <ScrollButtons
            style={{
              ...styles.scrollButtons,
            }}
            ref={c => {
              this.scrollButtons = c;
            }}
            upIcon={this.props.upIcon}
            downIcon={this.props.downIcon}
            getScrollTarget={this.props.getScrollTarget}
            visible={true}
            height={scrollButtonsHeight}
            isMinecraft={this.props.isMinecraft}
          />
        )}
      </div>
    );
  }
}

const styles = {
  scrollButtons: {
    minWidth: 40,
  },
};

export const UnconnectedInstructionsCsfRightCol = InstructionsCsfRightCol;

export default connect(
  function propsFromStore(state) {
    return {
      collapsed: state.instructions.isCollapsed,
      hints: state.authoredHints.seenHints,
      feedback: state.instructions.feedback,
      height: state.instructions.renderedHeight,
      isMinecraft: !!state.pageConstants.isMinecraft,
      isRtl: state.isRtl,
    };
  },
  null,
  null,
  {forwardRef: true}
)(InstructionsCsfRightCol);
