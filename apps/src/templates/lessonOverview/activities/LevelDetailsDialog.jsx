import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import TopInstructionsActualComponent from '@cdo/apps/templates/instructions/TopInstructionsActualComponent';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {createVideoWithFallback} from '@cdo/apps/code-studio/videos';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';
import SublevelCard from '@cdo/apps/code-studio/components/SublevelCard';

export default class LevelDetailsDialog extends Component {
  static propTypes = {
    scriptLevel: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedLevel: props.scriptLevel.level
    };
  }

  getContentComponent = level => {
    console.log(level);
    if (level.type === 'External') {
      return <SafeMarkdown markdown={level.markdown} />;
    } else if (level.type === 'StandaloneVideo') {
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
    } else if (level.containedLevels && level.containedLevels.length > 0) {
      return (
        <div>
          {level.containedLevels.map(l => (
            <div key={l.name}>{this.getContentComponent(l)}</div>
          ))}
        </div>
      );
    } else if (level.type === 'BubbleChoice') {
      return (
        <div>
          {this.props.scriptLevel.sublevels.map(sublevel => (
            <SublevelCard
              isLessonExtra={false}
              sublevel={sublevel}
              key={sublevel.id}
            />
          ))}
        </div>
      );
    } else {
      return (
        <TopInstructionsActualComponent
          hasContainedLevels={false}
          noVisualization={false}
          isMinecraft={false}
          isRtl={false}
          longInstructions={level.longInstructions || level.long_instructions}
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
    const {scriptLevel} = this.props;
    const level = this.state.selectedLevel;
    const preview = this.getContentComponent(level);
    const style =
      level.type === 'StandaloneVideo'
        ? {width: 'auto'}
        : {width: '70%', left: '15%', marginLeft: 0};
    return (
      <BaseDialog
        isOpen={true}
        handleClose={this.props.handleClose}
        style={style}
      >
        {scriptLevel.level.type === 'BubbleChoice' && (
          <ProgressBubbleSet
            levels={[this.props.scriptLevel]}
            disabled={false}
            onBubbleClick={level => {
              if (level.level) {
                this.setState({selectedLevel: level.level});
              } else {
                this.setState({selectedLevel: level});
              }
            }}
            showSublevels={true}
          />
        )}

        {preview}

        <DialogFooter rightAlign>
          <a href={scriptLevel.url}>See level</a>
        </DialogFooter>
      </BaseDialog>
    );
  }
}
