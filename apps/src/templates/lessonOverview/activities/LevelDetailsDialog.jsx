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
import _ from 'lodash';

const VIDEO_WIDTH = 670;
const VIDEO_HEIGHT = 375;
const VIDEO_MODAL_WIDTH = 700;

const styles = {
  sublevelCards: {
    display: 'flex',
    flexWrap: 'wrap'
  }
};

export default class LevelDetailsDialog extends Component {
  static propTypes = {
    scriptLevel: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    const scriptLevel = _.cloneDeep(props.scriptLevel);
    const selectedLevel = scriptLevel.level;
    scriptLevel.highlighted = true;
    this.state = {
      selectedLevel,
      scriptLevel
    };
  }

  getComponentContent = level => {
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
    } else if (level.type === 'BubbleChoice') {
      return (
        <div style={styles.sublevelCards}>
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

  handleBubbleChoiceBubbleClick = clickedObject => {
    const previousSelected = this.state.selectedLevel;
    const clonedScriptLevel = _.cloneDeep(this.state.scriptLevel);

    // Reset highlighting
    if (previousSelected.name === clonedScriptLevel.level.name) {
      // The script level was selected so reset highlighted on the script level
      clonedScriptLevel.highlighted = false;
    } else {
      // A sublevel was selected - find the sublevel and reset highlighted on it
      const clonedPreviousSelected = clonedScriptLevel.sublevels.find(
        sublevel => sublevel.name === previousSelected.name
      );
      clonedPreviousSelected.highlighted = false;
    }

    if (clickedObject.level) {
      // A script level was clicked on so we set highlighted on the cloned script level
      clonedScriptLevel.highlighted = true;
      this.setState({
        selectedLevel: clickedObject.level,
        scriptLevel: clonedScriptLevel
      });
    } else {
      // A sublevel was clicked so find the cloned version of the sublevel and set highlighted to true
      const clonedNewSelected = clonedScriptLevel.sublevels.find(
        sublevel => sublevel.name === clickedObject.name
      );
      clonedNewSelected.highlighted = true;
      this.setState({
        selectedLevel: clonedNewSelected,
        scriptLevel: clonedScriptLevel
      });
    }
  };

  renderBubbleChoiceBubbles = () => {
    const {scriptLevel} = this.state;
    if (scriptLevel.level.type !== 'BubbleChoice') {
      return null;
    }
    return (
      <ProgressBubbleSet
        levels={[scriptLevel]}
        disabled={false}
        onBubbleClick={this.handleBubbleChoiceBubbleClick}
        showSublevels={true}
      />
    );
  };

  render() {
    const {scriptLevel} = this.props;
    const level = this.state.selectedLevel;
    const preview = this.getComponentContent(level);
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
        <h1>{i18n.levelPreview()}</h1>
        {this.renderBubbleChoiceBubbles()}
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
