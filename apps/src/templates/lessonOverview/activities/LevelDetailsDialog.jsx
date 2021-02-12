import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import TopInstructionsActualComponent from '@cdo/apps/templates/instructions/TopInstructionsActualComponent';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

export default class LevelDetailsDialog extends Component {
  static propTypes = {
    scriptLevel: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired
  };

  render() {
    console.log(this.props.scriptLevel);
    const {scriptLevel} = this.props;
    const level = scriptLevel.level;
    return (
      <BaseDialog
        isOpen={true}
        handleClose={this.props.handleClose}
        style={{width: 700, height: 500}}
      >
        <TopInstructionsActualComponent
          hasContainedLevels={false}
          height={400}
          expandedHeight={0}
          maxHeight={500}
          collapsed={false}
          noVisualization={false}
          toggleInstructionsCollapsed={() => {}}
          setInstructionsRenderedHeight={() => {}}
          setInstructionsMaxHeightNeeded={() => {}}
          noInstructionsWhenCollapsed={true}
          hidden={false}
          isMinecraft={false}
          isRtl={false}
          longInstructions={level.longInstructions}
          shortInstructions={level.shortInstructions}
          isCSF={false}
          levelVideos={level.videos}
          mapReference={level.mapReference}
          referenceLinks={level.referenceLinks}
          teacherMarkdown={level.teacherMarkdown}
          viewAs={ViewType.Teacher}
        />
      </BaseDialog>
    );
  }
}
