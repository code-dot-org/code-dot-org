import React, {PropTypes} from 'react';

import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import InstructionsWithWorkspace from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';
import ScratchVisualizationColumn from './ScratchVisualizationColumn';
import CodeWorkspace from '@cdo/apps/templates/CodeWorkspace';
import VisualizationResizeBar from "../lib/ui/VisualizationResizeBar";

export default class ScratchView extends React.Component {
  static propTypes = {
    onMount: PropTypes.func.isRequired,
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
          <VisualizationResizeBar/>
          <InstructionsWithWorkspace>
            <CodeWorkspace />
          </InstructionsWithWorkspace>
        </div>
      </StudioAppWrapper>
    );
  }
}
