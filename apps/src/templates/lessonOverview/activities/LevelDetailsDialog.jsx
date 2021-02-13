import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import TopInstructionsActualComponent from '@cdo/apps/templates/instructions/TopInstructionsActualComponent';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {createVideoWithFallback} from '@cdo/apps/code-studio/videos';

export default class LevelDetailsDialog extends Component {
  static propTypes = {
    scriptLevel: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired
  };

  getContentComponent = level => {
    if (level.type === 'External') {
      return <SafeMarkdown markdown={level.markdown} />;
    } else if (level.type === 'StandaloneVideo') {
      console.log('hi!');
      return (
        <div>
          {level.long_instructions && (
            <SafeMarkdown markdown={level.long_instructions} />
          )}
          <div
            id={'level-details-dialog-video'}
            ref={ref => (this.video = ref)}
          />
        </div>
      );
    } else {
      return (
        <TopInstructionsActualComponent
          hasContainedLevels={false}
          noVisualization={false}
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
      );
    }
  };

  componentDidMount() {
    if (this.video) {
      const {scriptLevel} = this.props;
      const level = scriptLevel.level;
      createVideoWithFallback(
        $(ReactDOM.findDOMNode(this.video)),
        level.videoOptions,
        853,
        480,
        false,
        false
      );
    }
  }

  render() {
    console.log(this.props.scriptLevel);
    const {scriptLevel} = this.props;
    const level = scriptLevel.level;
    const preview = this.getContentComponent(level);
    return (
      <BaseDialog
        isOpen={true}
        handleClose={this.props.handleClose}
        style={{width: '70%', left: '15%', marginLeft: 0}}
      >
        {preview}

        <DialogFooter rightAlign>
          <a href={scriptLevel.url}>See level</a>
        </DialogFooter>
      </BaseDialog>
    );
  }
}
