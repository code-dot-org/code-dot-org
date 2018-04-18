
import $ from 'jquery';
import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import {connect} from 'react-redux';
import processMarkdown from 'marked';
import renderer from "../../util/StylelessRenderer";
import TeacherOnlyMarkdown from './TeacherOnlyMarkdown';
import InlineAudio from './InlineAudio';
import ContainedLevel from '../ContainedLevel';
import PaneHeader, { PaneButton } from '../../templates/PaneHeader';
import experiments from '@cdo/apps/util/experiments';
import InstructionsTab from './InstructionsTab';
import HelpTabContents from './HelpTabContents';
import instructions from '../../redux/instructions';
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import commonStyles from '../../commonStyles';
import Instructions from './Instructions';
import CollapserIcon from './CollapserIcon';
import HeightResizer from './HeightResizer';
import msg from '@cdo/locale';

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const MIN_HEIGHT = RESIZER_HEIGHT + 60;

const styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0,
    // left handled by media queries for .editor-column
  },
  noViz: {
    left: 0,
    right: 0,
    marginRight: 0,
    marginLeft: 0
  },
  body: {
    backgroundColor: 'white',
    overflowY: 'scroll',
    paddingLeft: 10,
    paddingRight: 10,
    position: 'absolute',
    top: HEADER_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0
  },
  embedView: {
    height: undefined,
    bottom: 0
  },
  paneHeaderOverride: {
    color: color.default_text,
  },
  title: {
    textAlign: 'center',
    height: HEADER_HEIGHT,
    lineHeight: HEADER_HEIGHT + 'px'
  },
  helpTabs: {
    float: 'left',
    paddingTop: 6,
    paddingLeft: 30,
  },
  highlighted: {
    borderBottom: "2px solid " + color.default_text,
    color: color.default_text,
  },
};

const audioStyle = {
  wrapper: {
    float: 'right',
  },
  button: {
    height: 24,
    marginTop: '3px',
    marginBottom: '3px',
  },
  buttonImg: {
    lineHeight: '24px',
    fontSize: 15,
    paddingLeft: 12,
  }
};

class TopInstructions extends Component {
  static propTypes = {
    isEmbedView: PropTypes.bool.isRequired,
    hasContainedLevels: PropTypes.bool,
    puzzleNumber: PropTypes.number.isRequired,
    stageTotal: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    expandedHeight: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
    markdown: PropTypes.string,
    collapsed: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
    toggleInstructionsCollapsed: PropTypes.func.isRequired,
    setInstructionsHeight: PropTypes.func.isRequired,
    setInstructionsRenderedHeight: PropTypes.func.isRequired,
    setInstructionsMaxHeightNeeded: PropTypes.func.isRequired,
    documentationUrl: PropTypes.string,
    ttsMarkdownInstructionsUrl:  PropTypes.string,
    levelVideos: PropTypes.array,
    mapReference: PropTypes.string,
    referenceLinks: PropTypes.array
  };

  state = {
    helpTabSelected: false,
  };

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    window.addEventListener('resize', this.adjustMaxNeededHeight);

    const maxNeededHeight = this.adjustMaxNeededHeight();

    // Initially set to 300. This might be adjusted when InstructionsWithWorkspace
    // adjusts max height.
    this.props.setInstructionsRenderedHeight(Math.min(maxNeededHeight, 300));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustMaxNeededHeight);
  }

  /**
   * Height can get below min height iff we resize the window to be super small.
   * If we then resize it to be larger again, we want to increase height.
   */
  componentWillReceiveProps(nextProps) {
    if (!nextProps.collapsed && nextProps.height < MIN_HEIGHT &&
        nextProps.height < nextProps.maxHeight) {
      this.props.setInstructionsRenderedHeight(Math.min(nextProps.maxHeight, MIN_HEIGHT));
    }
  }

  /**
   * Given a prospective delta, determines how much we can actually change the
   * height (accounting for min/max) and changes height by that much.
   * @param {number} delta
   * @returns {number} How much we actually changed
   */
  handleHeightResize = (delta) => {
    const currentHeight = this.props.height;

    let newHeight = Math.max(MIN_HEIGHT, currentHeight + delta);
    newHeight = Math.min(newHeight, this.props.maxHeight);

    this.props.setInstructionsRenderedHeight(newHeight);
    return newHeight - currentHeight;
  };

  /**
   * Calculate how much height it would take to show top instructions with our
   * entire instructions visible and update store with this value.
   * @returns {number}
   */
  adjustMaxNeededHeight = () => {
    const maxNeededHeight = $(ReactDOM.findDOMNode(this.refs.instructions)).outerHeight(true) +
      HEADER_HEIGHT + RESIZER_HEIGHT;

    this.props.setInstructionsMaxHeightNeeded(maxNeededHeight);
    return maxNeededHeight;
  };

  /**
   * Handle a click of our collapser button by changing our collapse state, and
   * updating our rendered height.
   */
  handleClickCollapser = () => {
    const collapsed = !this.props.collapsed;
    this.props.toggleInstructionsCollapsed();

    // adjust rendered height based on next collapsed state
    if (collapsed) {
      this.props.setInstructionsRenderedHeight(HEADER_HEIGHT);
    } else {
      this.props.setInstructionsRenderedHeight(this.props.expandedHeight);
    }
  };

  /**
   * Handle a click on the Documentation PaneButton.
   */
  handleDocumentationClick = () => {
    const win = window.open(this.props.documentationUrl, '_blank');
    win.focus();
  };

  handleHelpTabClick = () => {
    this.setState({helpTabSelected: true});
  };

  handleInstructionTabClick = () => {
    this.setState({helpTabSelected: false});
  };

  render() {
    const mainStyle = [
      styles.main,
      {
        height: this.props.height - RESIZER_HEIGHT
      },
      this.props.noVisualization && styles.noViz,
      this.props.isEmbedView && styles.embedView,
    ];
    const ttsUrl = this.props.ttsMarkdownInstructionsUrl;
    const videoData = this.props.levelVideos ? this.props.levelVideos[0] : [];

    // If we are in the additional resources experiment, only display the help tab
    // when there are one or more videos or additional resource links.
    // Otherwise, display the help tab when there are level videos to display.
    const videosAvailable = this.props.levelVideos && this.props.levelVideos.length > 0;
    const levelResourcesAvailable = this.props.mapReference !== null ||
      (this.props.referenceLinks && this.props.referenceLinks.length > 0);

    const additionalResourcesDisplayTab = experiments.isEnabled('additionalResources') && levelResourcesAvailable;
    const displayHelpTab = videosAvailable || additionalResourcesDisplayTab;
    return (
      <div style={mainStyle} className="editor-column">
        <PaneHeader hasFocus={false}>
          <div style={styles.paneHeaderOverride}>
            {!this.state.helpTabSelected && ttsUrl &&
              <InlineAudio src={ttsUrl} style={audioStyle}/>
            }
            {this.props.documentationUrl &&
              <PaneButton
                iconClass="fa fa-book"
                label={msg.documentation()}
                isRtl={false}
                headerHasFocus={false}
                onClick={this.handleDocumentationClick}
              />}
            <div style={styles.helpTabs}>
              <InstructionsTab
                className="uitest-instructionsTab"
                onClick={this.handleInstructionTabClick}
                style={this.state.helpTabSelected ? null : styles.highlighted}
                text={msg.instructions()}
              />
              {displayHelpTab &&
                <InstructionsTab
                  className="uitest-helpTab"
                  onClick={this.handleHelpTabClick}
                  style={this.state.helpTabSelected ? styles.highlighted : null}
                  text={msg.helpTips()}
                />
              }
            </div>
            {!this.props.isEmbedView &&
              <CollapserIcon
                collapsed={this.props.collapsed}
                onClick={this.handleClickCollapser}
              />}
          </div>
        </PaneHeader>
        <div style={[this.props.collapsed && commonStyles.hidden]}>
          <div style={styles.body}>
            {this.props.hasContainedLevels && <ContainedLevel ref="instructions"/>}
            {!this.props.hasContainedLevels &&
              <div ref="instructions">
                {!this.state.helpTabSelected &&
                  <div>
                    <Instructions
                      ref="instructions"
                      renderedMarkdown={processMarkdown(this.props.markdown,
                        { renderer })}
                      onResize={this.adjustMaxNeededHeight}
                      inTopPane
                    />
                    <TeacherOnlyMarkdown/>
                  </div>
                }
                {this.state.helpTabSelected &&
                  <HelpTabContents
                    videoData={videoData}
                    mapReference={this.props.mapReference}
                    referenceLinks={this.props.referenceLinks}
                  />
                }
              </div>
            }
          </div>
          {!this.props.isEmbedView &&
            <HeightResizer
              position={this.props.height}
              onResize={this.handleHeightResize}
            />}
        </div>
      </div>
    );
  }
}
module.exports = connect(function propsFromStore(state) {
  return {
    isEmbedView: state.pageConstants.isEmbedView,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    puzzleNumber: state.pageConstants.puzzleNumber,
    stageTotal: state.pageConstants.stageTotal,
    height: state.instructions.renderedHeight,
    expandedHeight: state.instructions.expandedHeight,
    maxHeight: Math.min(state.instructions.maxAvailableHeight,
      state.instructions.maxNeededHeight),
    markdown: state.instructions.longInstructions,
    noVisualization: state.pageConstants.noVisualization,
    collapsed: state.instructions.collapsed,
    documentationUrl: state.pageConstants.documentationUrl,
    ttsMarkdownInstructionsUrl: state.pageConstants.ttsMarkdownInstructionsUrl,
    levelVideos: state.instructions.levelVideos,
    mapReference: state.instructions.mapReference,
    referenceLinks: state.instructions.referenceLinks
  };
}, function propsFromDispatch(dispatch) {
  return {
    toggleInstructionsCollapsed() {
      dispatch(instructions.toggleInstructionsCollapsed());
    },
    setInstructionsHeight(height) {
      dispatch(instructions.setInstructionsHeight(height));
    },
    setInstructionsRenderedHeight(height) {
      dispatch(instructions.setInstructionsRenderedHeight(height));
    },
    setInstructionsMaxHeightNeeded(height) {
      dispatch(instructions.setInstructionsMaxHeightNeeded(height));
    }
  };
}, null, { withRef: true }
)(Radium(TopInstructions));
