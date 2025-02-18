/** @file Top-level view for Ailab */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';

import CodeWorkspaceContainer from '../templates/CodeWorkspaceContainer';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import Overlay from '../templates/Overlay';
import StudioAppWrapper from '../templates/StudioAppWrapper';

/**
 * Top-level React wrapper for Ailab
 */
class AilabView extends React.Component {
  static propTypes = {
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    onMount: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.codeAppRef = document.getElementById('codeApp');
  }

  componentDidMount() {
    this.props.onMount();
  }

  render() {
    return (
      <StudioAppWrapper>
        <Overlay />
        <InstructionsWithWorkspace>
          <CodeWorkspaceContainer>
            <div style={styles.container}>
              <div id="root" style={styles.containerReact} />
            </div>
          </CodeWorkspaceContainer>
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
}

const styles = {
  container: {
    position: 'relative',
    margin: '0 auto',
    userSelect: 'none',
    overflow: 'scroll',
    width: '100%',
    height: 'calc(100% - 35px)',
  },
  containerReact: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    margin: '0 auto',
    userSelect: 'none',
    ...fontConstants['main-font-regular'],
    color: 'rgb(30,30,30)',
    lineHeight: 1.3,
  },
};

export default connect(state => ({
  isProjectLevel: state.pageConstants.isProjectLevel,
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
}))(AilabView);
