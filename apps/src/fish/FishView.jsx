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
      windowWidth: $('#codeApp').width(),
      windowHeight: $('#codeApp').height()
    };
  }

  componentDidMount() {
    this.props.onMount();
    window.addEventListener('resize', _.debounce(this.onResize, 100));
    this.setState({
      windowWidth: $('#codeApp').width(),
      windowHeight: $('#codeApp').height()
    });
  }

  onResize = () => {
    const windowWidth = $('#codeApp').width();
    const windowHeight = $('#codeApp').height();

    this.setState({windowWidth, windowHeight});
  };

  render() {
    let containerWidth, containerHeight;

    const maxContainerWidth = Math.min(this.state.windowWidth, 1280);
    const maxContainerHeight = this.state.windowHeight - 27;

    if (maxContainerWidth / maxContainerHeight > 16 / 9) {
      // Constrain by height.
      containerWidth = maxContainerHeight * (16 / 9);
      containerHeight = maxContainerHeight;
    } else if (maxContainerWidth / maxContainerWidth < 16 / 9) {
      // Constrain by width.
      containerWidth = maxContainerWidth;
      containerHeight = maxContainerWidth * (9 / 16);
    }

    const fontSize = (18 * containerWidth) / 930;

    return (
      <StudioAppWrapper rotateContainerWidth={this.props.mobilePortraitWidth}>
        <CodeWorkspaceContainer topMargin={0}>
          <div
            id="container"
            style={{
              ...styles.container,
              width: containerWidth,
              height: containerHeight
            }}
            dir="ltr"
          >
            <div
              id="container-react"
              style={{...styles.containerReact, fontSize}}
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
