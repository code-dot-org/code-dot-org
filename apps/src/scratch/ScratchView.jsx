import React from 'react';

import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import InstructionsWithWorkspace from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';
import ScratchVisualizationColumn from './ScratchVisualizationColumn';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import CodeWorkspace from '@cdo/apps/templates/CodeWorkspace';

export default class ScratchView extends React.Component {
  static propTypes = {
    onMount: React.PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.onMount();
  }

  render() {
    return (
      <StudioAppWrapper>
        <div>
          <div
            id="visualizationColumn"
            style={{width: 480}}
          >
            <ScratchVisualizationColumn />
          </div>
          <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v"
          />
          <InstructionsWithWorkspace>
            <CodeWorkspace />
          </InstructionsWithWorkspace>
        </div>
      </StudioAppWrapper>
    );
  }
}
