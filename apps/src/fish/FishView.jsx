/** @file Top-level view for Fish */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import CodeWorkspaceContainer from '../templates/CodeWorkspaceContainer';
import _ from 'lodash';
import $ from 'jquery';

const styles = {
  container: {
    position: 'relative',
    margin: '0 auto',
    userSelect: 'none'
  },
  containerReact: {
    position: 'absolute',
    width: '100%',
    margin: '0 auto',
    userSelect: 'none',
    fontFamily: '"Gotham 4r", arial, sans-serif',
    color: 'rgb(30,30,30)',
    lineHeight: 1.3
  },
  backgroundCanvas: {
    position: 'absolute',
    left: 0,
    width: '100%',
    zIndex: -1,
    borderRadius: '10px'
  },
  activityCanvas: {
    width: '100%',
    borderRadius: '10px',
    border: 'none'
  }
};

/**
 * Top-level React wrapper for Fish
 */
class FishView extends React.Component {
  static propTypes = {
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    onMount: PropTypes.func.isRequired,
    mobilePortraitWidth: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      windowWidth: $(window).width(),
      windowHeight: $(window).height(),
      appWidth: $('#codeApp').width(),
      appHeight: $('#codeApp').height()
    };
  }

  componentDidMount() {
    this.props.onMount();

    window.addEventListener('resize', _.debounce(this.onResize, 100));
  }

  onResize = () => {
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();

    // Check that the window dimensions have actually changed to avoid
    // unnecessary event-proessing on iOS Safari.
    if (
      this.state.windowWidth !== windowWidth ||
      this.state.windowHeight !== windowHeight
    ) {
      const appWidth = $('#codeApp').width();
      const appHeight = $('#codeApp').height();

      this.setState({windowWidth, windowHeight, appWidth, appHeight});
    }
  };

  render() {
    // The tutorial has a width:height ratio of 16:9.
    const aspectRatio = 16 / 9;

    let containerWidth, containerHeight;

    // Constrain tutorial to 1280px maximum width.
    const maxContainerWidth = Math.min(this.state.appWidth, 1280);

    // Reducing by 27px leaves appropriate space above the small footer.
    const maxContainerHeight =
      Math.min(this.state.appHeight, window.innerHeight) - 27;

    if (maxContainerWidth / maxContainerHeight > aspectRatio) {
      // Constrain by height.
      containerWidth = maxContainerHeight * aspectRatio;
    } else if (maxContainerWidth / maxContainerWidth < aspectRatio) {
      // Constrain by width.
      containerWidth = maxContainerWidth;
    }

    // Constrain tutorial to 320px minimum width;
    if (containerWidth < 320) {
      containerWidth = 320;
    }

    // Calculate the height.
    containerHeight = containerWidth / aspectRatio;

    // The tutorial shows 18px fonts when 930px wide.
    const baseFontSize = (18 * containerWidth) / 930;

    return (
      <StudioAppWrapper rotateContainerWidth={this.props.mobilePortraitWidth}>
        <CodeWorkspaceContainer topMargin={0}>
          <div
            id="container"
            style={{
              ...styles.container,
              width: Math.round(containerWidth),
              height: Math.round(containerHeight)
            }}
            dir="ltr"
          >
            <div
              id="container-react"
              style={{...styles.containerReact, fontSize: baseFontSize}}
            />
            <canvas id="background-canvas" style={styles.backgroundCanvas} />
            <canvas id="activity-canvas" style={styles.activityCanvas} />
          </div>
        </CodeWorkspaceContainer>
      </StudioAppWrapper>
    );
  }
}

export default connect(state => ({
  isProjectLevel: state.pageConstants.isProjectLevel,
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
}))(FishView);
