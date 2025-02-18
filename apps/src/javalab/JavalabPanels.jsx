// JavalabPanels.  This React class manages and renders the four panels of a typical
// Javalab level.  It is used by JavalabView.
// Long term, it would be great if this could be generalized to work for many labs.

import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';
import color from '@cdo/apps/util/color';

import globalStyleConstants from '../styleConstants';

import {CsaViewMode} from './constants';
import {DisplayTheme} from './DisplayTheme';
import {resizeCrosshairOverlay} from './JavalabCrosshairOverlay';
import {
  setLeftWidth,
  setRightWidth,
  setInstructionsHeight,
  setInstructionsFullHeight,
  setConsoleHeight,
  setEditorColumnHeight,
} from './redux/viewRedux';

import styleConstants from './constants.module.scss';

// The top Y coordinate of the JavaLab panels.  Above them is just the common site
// header and then a bit of empty space.
const PANELS_TOP_COORDINATE = 60;

class JavalabPanels extends React.Component {
  static propTypes = {
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)).isRequired,
    viewMode: PropTypes.string.isRequired,
    visualization: PropTypes.object,
    isLeftSideVisible: PropTypes.bool,
    setLeftWidth: PropTypes.func,
    setRightWidth: PropTypes.func,
    setInstructionsHeight: PropTypes.func,
    setInstructionsFullHeight: PropTypes.func,
    setConsoleHeight: PropTypes.func,
    setEditorColumnHeight: PropTypes.func,
    leftWidth: PropTypes.number,
    rightWidth: PropTypes.number,
    instructionsHeight: PropTypes.number,
    instructionsFullHeight: PropTypes.number,
    instructionsRenderedHeight: PropTypes.number.isRequired,
    consoleHeight: PropTypes.number,
    editorColumnHeight: PropTypes.number,
    isVisualizationCollapsed: PropTypes.bool,
    isInstructionsCollapsed: PropTypes.bool,
    topLeftPanel: PropTypes.func,
    bottomLeftPanel: PropTypes.func,
    topRightPanel: PropTypes.func,
    bottomRightPanel: PropTypes.func,
  };

  componentDidMount() {
    this.updateLayout(this.props.leftWidth);
    window.addEventListener('resize', () =>
      this.updateLayoutThrottled(this.props.leftWidth)
    );
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () =>
        this.updateLayoutThrottled(this.props.leftWidth)
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.isInstructionsCollapsed !==
        this.props.isInstructionsCollapsed ||
      prevProps.isVisualizationCollapsed !== this.props.isVisualizationCollapsed
    ) {
      this.updateLayoutThrottled(this.props.leftWidth);
    }
  }

  handleWidthResize = desiredWidth => {
    const leftWidthMin = 200;
    const leftWidthMax = 600;
    let newWidth = Math.max(leftWidthMin, Math.min(desiredWidth, leftWidthMax));
    this.props.setLeftWidth(newWidth);

    this.updateLayoutThrottled(newWidth);
  };

  handleInstructionsHeightResize = desiredHeight => {
    // The max height of the instructions isn't too important to get right, because
    // we don't allow the instructions to exceed available space in getInstructionsHeight.
    const instructionsHeightMin = 100;
    const instructionsHeightMax = window.innerHeight - 100;

    let newHeight = Math.max(
      instructionsHeightMin,
      Math.min(desiredHeight, instructionsHeightMax)
    );
    this.props.setInstructionsHeight(newHeight);

    this.updateLayoutThrottled(this.props.leftWidth);
  };

  handleEditorHeightResize = desiredHeight => {
    // While the horizontal resizer thinks it's resizing the content above it, which
    // is the editor panel, we are actually storing the size of the console below it.
    // That way, if the window resizes, the console stays the same height while the editor
    // changes in height.

    const consoleDesiredHeight = this.props.editorColumnHeight - desiredHeight;

    // Minimum height fits 3 lines of text
    const consoleHeightMin = 140;
    const consoleHeightMax = window.innerHeight - 200;

    let newHeight = Math.max(
      consoleHeightMin,
      Math.min(consoleDesiredHeight, consoleHeightMax)
    );

    this.props.setConsoleHeight(newHeight);
  };

  getInstructionsHeight = () => {
    if (this.props.isInstructionsCollapsed) {
      return 30;
    } else if (
      this.props.isVisualizationCollapsed ||
      !this.props.visualization
    ) {
      return this.props.instructionsFullHeight;
    } else {
      return Math.min(
        this.props.instructionsHeight,
        this.props.instructionsFullHeight
      );
    }
  };

  getEditorHeight = () => {
    // Determine the editor height, but do it based on the console height.
    return this.props.editorColumnHeight - this.props.consoleHeight;
  };

  shouldShowInstructionsHeightResizer = () => {
    return (
      !this.props.isInstructionsCollapsed &&
      !this.props.isVisualizationCollapsed &&
      this.props.visualization
    );
  };

  updateLayout = availableWidth => {
    // We scale the visualization to take up as much space as it can, both
    // vertically and horizontally.  Its width is constrained by the width
    // of the left side, which the user can adjust by dragging a resizer, and
    // which is passed into this function as availableWidth.
    // Its height is constrained by how much of the window is available.  We
    // start with the entire height of the window, subtract the space used by
    // the instructions (which includes their header and horizontal resizer),
    // subtract the space used by misc existing elements (which includes the
    // page header, gaps between areas, the "preview" header, and the small
    // footer at the bottom), and subtract the space used by the speed slider
    // if it's shown.
    // The visualization is a square, so the width it's rendered at will be
    // constrained by both the available width and height.
    const miscExistingElementsHeight = 150;
    const sliderHeight = 60;

    // The original visualization is rendered at 800x800.
    const originalVisualizationWidth = 800;

    // Determine the available height.
    let availableHeight =
      window.innerHeight -
      this.getInstructionsHeight() -
      miscExistingElementsHeight;
    if (this.props.viewMode === CsaViewMode.NEIGHBORHOOD) {
      availableHeight -= sliderHeight;
    }

    // Use the biggest available size.
    let newVisualizationWidth = Math.min(availableHeight, availableWidth);

    // Scale the visualization.
    let scale = newVisualizationWidth / originalVisualizationWidth;
    if (scale < 0) {
      // Avoid inverting.
      scale = 0;
    }
    const scaleCss = `scale(${scale})`;
    switch (this.props.viewMode) {
      case CsaViewMode.NEIGHBORHOOD:
        $('#svgMaze').css('transform', scaleCss);
        break;
      case CsaViewMode.THEATER:
        $('#theater-container').css('transform', scaleCss);
        break;
    }

    // Only theater uses the <JavalabCrosshairOverlay> right now, so this will
    // currently no-op in other viewModes.
    // The visualization and its overlay have different default sizes and are thus scaled
    // differently. See ./constants.module.scss for details.
    const overlayScaleCss = `scale(${
      scale * parseInt(styleConstants.visualizationOverlayScale)
    })`;
    $('#visualizationOverlay').css('transform', overlayScaleCss);
    resizeCrosshairOverlay();

    // Size the visualization div (which will actually set the rendered
    // width of the left side of the screen, since this div determines its
    // size) and center the visualization inside of it.
    $('#visualization').css({
      'max-width': availableWidth,
      'max-height': newVisualizationWidth,
      height: newVisualizationWidth,
      'margin-left': (availableWidth - newVisualizationWidth) / 2,
    });

    // Also adjust the width of the small footer at the bottom.
    $('#page-small-footer .small-footer-base').css(
      'max-width',
      availableWidth - globalStyleConstants['resize-bar-width']
    );

    this.props.setInstructionsFullHeight(
      window.innerHeight - miscExistingElementsHeight
    );

    this.props.setEditorColumnHeight(
      window.innerHeight - PANELS_TOP_COORDINATE
    );

    // The right width can also change at this point, since it takes up the
    // remaining space.
    const actualLeftWidth = this.props.isLeftSideVisible
      ? this.props.leftWidth + globalStyleConstants['resize-bar-width']
      : 0;
    const newRightWidth = window.innerWidth - actualLeftWidth - 20;
    this.props.setRightWidth(newRightWidth);
  };

  updateLayoutThrottled = _.throttle(this.updateLayout, 33);

  render() {
    const {
      displayTheme,
      isLeftSideVisible,
      topLeftPanel,
      bottomLeftPanel,
      topRightPanel,
      bottomRightPanel,
      leftWidth,
      rightWidth,
      editorColumnHeight,
    } = this.props;

    return (
      <div>
        <div style={styles.editorAndVisualization}>
          <div
            id="visualizationColumn"
            className="responsive"
            style={{...styles.instructionsAndPreview, maxWidth: leftWidth}}
          >
            {topLeftPanel(this.getInstructionsHeight())}
            {this.shouldShowInstructionsHeightResizer() && (
              <HeightResizer
                resizeItemTop={() => PANELS_TOP_COORDINATE}
                position={
                  this.getInstructionsHeight() +
                  globalStyleConstants['resize-bar-width']
                }
                onResize={desiredHeight =>
                  this.handleInstructionsHeightResize(
                    desiredHeight - globalStyleConstants['resize-bar-width']
                  )
                }
              />
            )}
            {isLeftSideVisible && bottomLeftPanel(leftWidth)}
          </div>
          {isLeftSideVisible && (
            <HeightResizer
              vertical={true}
              resizeItemTop={() => 10}
              position={leftWidth + globalStyleConstants['resize-bar-width']}
              onResize={desiredWidth =>
                this.handleWidthResize(
                  desiredWidth - globalStyleConstants['resize-bar-width']
                )
              }
            />
          )}
          <div
            style={{
              ...(isLeftSideVisible
                ? styles.editorAndConsole
                : styles.editorAndConsoleOnly),
              color:
                displayTheme === DisplayTheme.DARK ? color.white : color.black,
              height: editorColumnHeight,
              width: rightWidth,
            }}
            className="editor-column"
          >
            {topRightPanel(this.getEditorHeight())}
            <HeightResizer
              resizeItemTop={() => PANELS_TOP_COORDINATE}
              position={this.getEditorHeight()}
              onResize={this.handleEditorHeightResize}
              style={styles.rightResizer}
            />
            {bottomRightPanel()}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  editorAndVisualization: {
    display: 'flex',
    flexGrow: '1',
    height: '100%',
  },
  instructionsAndPreview: {
    color: color.black,
  },
  editorAndConsole: {
    right: '15px',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: globalStyleConstants['resize-bar-width'],
  },
  editorAndConsoleOnly: {
    right: '15px',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  rightResizer: {
    position: 'static',
  },
};

export default connect(
  state => ({
    displayTheme: state.javalabView.displayTheme,
    editorColumnHeight: state.javalabView.editorColumnHeight,
    leftWidth: state.javalabView.leftWidth,
    rightWidth: state.javalabView.rightWidth,
    instructionsHeight: state.javalabView.instructionsHeight,
    instructionsFullHeight: state.javalabView.instructionsFullHeight,
    instructionsRenderedHeight: state.instructions.renderedHeight,
    consoleHeight: state.javalabView.consoleHeight,
    editorColumnFullHeight: state.javalabView.editorColumnFullHeight,
    isVisualizationCollapsed: state.javalabView.isVisualizationCollapsed,
    isInstructionsCollapsed: state.instructions.isCollapsed,
  }),
  dispatch => ({
    setLeftWidth: width => dispatch(setLeftWidth(width)),
    setRightWidth: width => dispatch(setRightWidth(width)),
    setInstructionsHeight: height => dispatch(setInstructionsHeight(height)),
    setInstructionsFullHeight: height =>
      dispatch(setInstructionsFullHeight(height)),
    setConsoleHeight: height => dispatch(setConsoleHeight(height)),
    setEditorColumnHeight: height => dispatch(setEditorColumnHeight(height)),
  })
)(JavalabPanels);
