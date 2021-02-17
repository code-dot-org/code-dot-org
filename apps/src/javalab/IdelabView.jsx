import React from 'react';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import Ide from './Ide';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

class IdelabView extends React.Component {
  static propTypes = {
    onMount: PropTypes.func.isRequired,

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired
  };

  render() {
    return (
      <StudioAppWrapper>
        <InstructionsWithWorkspace>
          <Ide />
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
}

export default connect(state => ({
  isProjectLevel: state.pageConstants.isProjectLevel,
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
}))(IdelabView);
