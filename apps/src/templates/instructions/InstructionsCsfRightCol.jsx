import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import CollapserButton from './CollapserButton';
import ScrollButtons from './ScrollButtons';
import styleConstants from '../../styleConstants';
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

    // from redux
    collapsed: PropTypes.bool.isRequired,
    hints: PropTypes.arrayOf(
      PropTypes.shape({
        hintId: PropTypes.string.isRequired,
        markdown: PropTypes.string.isRequired,
        block: PropTypes.object, // XML
        video: PropTypes.string
      })
    ).isRequired,
    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool
    }),
    height: PropTypes.number.isRequired,
    isMinecraft: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  componentDidMount() {
    this.updateDimensions();
  }

  componentDidUpdate() {
    this.updateDimensions();
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
      : 0;
    const scrollButtonWidth = this.props.displayScrollButtons
      ? $(ReactDOM.findDOMNode(this.scrollButtons)).outerWidth(true)
      : 0;
    return Math.max(collapserWidth, scrollButtonWidth);
  }

  getColumnHeight() {
    const collapseButtonHeight = getOuterHeight(this.collapser, true);
    const scrollButtonsHeight = this.scrollButtons
      ? this.scrollButtons.getMinHeight()
      : 0;
    return collapseButtonHeight + scrollButtonsHeight;
  }

  render() {
    const displayCollapserButton = this.shouldDisplayCollapserButton();

    const scrollButtonsHeight =
      this.props.height -
      HEADER_HEIGHT -
      RESIZER_HEIGHT -
      (displayCollapserButton ? styles.scrollButtonsBelowCollapser.top : 0);

    return (
      <div style={styles.column}>
        {displayCollapserButton && (
          <CollapserButton
            ref={c => {
              this.collapser = c;
            }}
            style={[
              styles.collapserButton,
              this.props.isMinecraft && styles.craftStyles.collapserButton
            ]}
            collapsed={this.props.collapsed}
            onClick={this.props.handleClickCollapser}
            isMinecraft={this.props.isMinecraft}
            isRtl={this.props.isRtl}
          />
        )}
        {this.props.displayScrollButtons && (
          <ScrollButtons
            style={[
              styles.scrollButtons,
              this.props.isMinecraft &&
                (this.props.isRtl
                  ? styles.craftStyles.scrollButtonsRtl
                  : styles.craftStyles.scrollButtons),
              displayCollapserButton && styles.scrollButtonsBelowCollapser
            ]}
            ref={c => {
              this.scrollButtons = c;
            }}
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
  column: {
    display: 'flex',
    justifyContent: 'center'
  },
  collapserButton: {
    position: 'absolute',
    right: 0,
    marginTop: 5,
    marginRight: 5
  },
  scrollButtons: {
    margin: '0px 5px',
    minWidth: '40px'
  },
  scrollButtonsBelowCollapser: {
    position: 'relative',
    top: 50,
    margin: '0px'
  },
  craftStyles: {
    collapserButton: {
      padding: 5,
      marginBottom: 0
    },
    scrollButtons: {
      left: 38
    },
    scrollButtonsRtl: {
      right: 38
    }
  }
};

export const UnconnectedInstructionsCsfRightCol = Radium(
  InstructionsCsfRightCol
);

export default connect(
  function propsFromStore(state) {
    return {
      collapsed: state.instructions.isCollapsed,
      hints: state.authoredHints.seenHints,
      feedback: state.instructions.feedback,
      height: state.instructions.renderedHeight,
      isMinecraft: !!state.pageConstants.isMinecraft,
      isRtl: state.isRtl
    };
  },
  null,
  null,
  {withRef: true}
)(Radium(InstructionsCsfRightCol));
