import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {UnconnectedTopInstructions as TopInstructions} from '@cdo/apps/templates/instructions/TopInstructions';

export default class LevelDetailsDialog extends Component {
  static propTypes = {
    level: PropTypes.object
  };

  render() {
    console.log(this.props.level);
    return (
      <BaseDialog isOpen={true} handleClose={() => {}}>
        <TopInstructions
          isEmbedView={false}
          hasContainedLevels={false}
          height={100}
          expandedHeight={0}
          maxHeight={200}
          collapsed={false}
          noVisualization={false}
          toggleInstructionsCollapsed={() => {}}
          setInstructionsRenderedHeight={() => {}}
          setInstructionsMaxHeightNeeded={() => {}}
          noInstructionsWhenCollapsed={true}
          hidden={false}
          isMinecraft={false}
          isRtl={false}
          longInstructions={
            'Use **2** movement blocks to get the Scrat to the acorn.'
          }
        />
      </BaseDialog>
    );
  }
}
