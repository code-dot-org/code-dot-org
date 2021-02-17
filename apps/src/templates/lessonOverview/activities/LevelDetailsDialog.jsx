import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {createVideoWithFallback} from '@cdo/apps/code-studio/videos';
import $ from 'jquery';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';
import SublevelCard from '@cdo/apps/code-studio/components/SublevelCard';

const VIDEO_WIDTH = 670;
const VIDEO_HEIGHT = 375;
const VIDEO_MODAL_WIDTH = 700;

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
    if (level.type === 'External') {
      return <SafeMarkdown markdown={level.markdown} />;
    } else if (level.type === 'StandaloneVideo') {
      return (
        <div>
          {level.longInstructions && (
            <SafeMarkdown markdown={level.longInstructions} />
          )}
          <div
            id={'level-details-dialog-video'}
            ref={ref => (this.video = ref)}
          />
        </div>
      );
    } else if (level.type === 'LevelGroup') {
      return (
        <div>
          {i18n.levelGroupDetailsDialogText({buttonText: i18n.seeFullLevel()})}
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
      return <div>Not implemented yet</div>;
    }
  };

  loadVideo() {
    const {scriptLevel} = this.props;
    const level = scriptLevel.level;
    createVideoWithFallback(
      $(ReactDOM.findDOMNode(this.video)),
      level.videoOptions,
      VIDEO_WIDTH,
      VIDEO_HEIGHT,
      false,
      false
    );
  }

  componentDidMount() {
    if (this.video) {
      this.loadVideo();
    }
  }

  render() {
    const {scriptLevel} = this.props;
    const level = this.state.selectedLevel;
    const preview = this.getContentComponent(level);
    return (
      <BaseDialog
        isOpen={true}
        handleClose={this.props.handleClose}
        fullWidth={level.type !== 'StandaloneVideo'}
        style={
          level.type === 'StandaloneVideo'
            ? {width: VIDEO_MODAL_WIDTH, marginLeft: -VIDEO_MODAL_WIDTH / 2}
            : {}
        }
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
          <Button
            onClick={this.props.handleClose}
            text={i18n.dismiss()}
            color={'gray'}
          />
          <Button
            href={scriptLevel.url}
            text={i18n.seeFullLevel()}
            color={'orange'}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
