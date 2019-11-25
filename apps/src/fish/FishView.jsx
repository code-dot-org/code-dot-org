/** @file Top-level view for Fish */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';
import CodeWorkspaceContainer from '../templates/CodeWorkspaceContainer';

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    minWidth: '770px',
    margin: '0 auto',
    userSelect: 'none'
  },
  containerReact: {
    position: 'absolute',
    width: '100%',
    minWidth: '770px',
    margin: '0 auto',
    userSelect: 'none',
    fontFamily: '"Gotham 4r", arial, sans-serif',
    color: 'rgb(30,30,30)',
    lineHeight: 1.3
    // Note that fontSize has been removed from here and is set using CSS
    // (in fish/style.scss) instead.  That way, CSS-based media queries in the
    // same file can successfully override the font-size throughout the
    // inheritance chain.
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
    onMount: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.onMount();
  }

  render() {
    return (
      <StudioAppWrapper>
        <CodeWorkspaceContainer topMargin={0}>
          <ProtectedStatefulDiv id="container" style={styles.container}>
            <div id="container-react" style={styles.containerReact} />
            <canvas id="background-canvas" style={styles.backgroundCanvas} />
            <canvas id="activity-canvas" style={styles.activityCanvas} />
          </ProtectedStatefulDiv>
        </CodeWorkspaceContainer>
      </StudioAppWrapper>
    );
  }
}

export default connect(state => ({
  isProjectLevel: state.pageConstants.isProjectLevel,
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
}))(FishView);
