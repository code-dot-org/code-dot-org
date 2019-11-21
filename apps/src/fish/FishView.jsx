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
    fontSize: '18px',
    color: 'rgb(30,30,30)'
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
