import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {UnconnectedTopInstructions} from '@cdo/apps/templates/instructions/TopInstructions';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {createVideoWithFallback} from '@cdo/apps/code-studio/videos';
import $ from 'jquery';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';
import SublevelCard from '@cdo/apps/code-studio/components/SublevelCard';
import TeacherOnlyMarkdown from '@cdo/apps/templates/instructions/TeacherOnlyMarkdown';
import _ from 'lodash';
import styleConstants from '@cdo/apps/styleConstants';
import {connect} from 'react-redux';

const VIDEO_WIDTH = 670;
const VIDEO_HEIGHT = 375;
const VIDEO_MODAL_WIDTH = 700;
const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const MAX_LEVEL_HEIGHT = 550;

const styles = {
  sublevelCards: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  scrollContainer: {
    maxHeight: '60vh',
    overflow: 'auto'
  }
};

class LevelDetailsDialog extends Component {
  static propTypes = {
    scriptLevel: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    const scriptLevel = _.cloneDeep(props.scriptLevel);
    const selectedLevel = scriptLevel.level;
    scriptLevel.highlighted = true;
    this.state = {
      selectedLevel,
      scriptLevel,
      height: MAX_LEVEL_HEIGHT,
      maxHeight: MAX_LEVEL_HEIGHT
    };
  }

  getTeacherOnlyMarkdownComponent = level => {
    if (level.teacherMarkdown) {
      return <TeacherOnlyMarkdown content={level.teacherMarkdown} />;
    } else {
      return null;
    }
  };

  getComponentContent = level => {
    if (level.type === 'External') {
      return (
        <div style={styles.scrollContainer}>
          <SafeMarkdown markdown={level.markdown} />
          {level.videoOptions && (
            <div
              id={'level-details-dialog-video'}
              ref={ref => (this.video = ref)}
            />
          )}
          {this.getTeacherOnlyMarkdownComponent(level)}
        </div>
      );
    } else if (level.type === 'StandaloneVideo') {
      return (
        <div style={styles.scrollContainer}>
          {level.longInstructions && (
            <SafeMarkdown markdown={level.longInstructions} />
          )}
          <div
            id={'level-details-dialog-video'}
            ref={ref => (this.video = ref)}
          />
          {this.getTeacherOnlyMarkdownComponent(level)}
        </div>
      );
    } else if (level.type === 'LevelGroup') {
      return (
        <SafeMarkdown
          markdown={i18n.levelGroupDetailsDialogText({
            buttonText: i18n.seeFullLevel()
          })}
        />
      );
    } else if (level.containedLevels && level.containedLevels.length > 0) {
      return (
        <div>
          {level.containedLevels.map(l => (
            <div key={l.name}>{this.getComponentContent(l)}</div>
          ))}
        </div>
      );
    } else if (level.type === 'Match' || level.type === 'Multi') {
      return (
        <div style={styles.scrollContainer}>
          {level.question && <SafeMarkdown markdown={level.question} />}
          {level.questionText && <SafeMarkdown markdown={level.questionText} />}
          {this.getTeacherOnlyMarkdownComponent(level)}
        </div>
      );
    } else if (level.type === 'BubbleChoice') {
      return (
        <div style={{...styles.scrollContainer, ...styles.sublevelCards}}>
          {this.props.scriptLevel.sublevels.map(sublevel => (
            <SublevelCard
              isLessonExtra={false}
              sublevel={sublevel}
              key={sublevel.id}
            />
          ))}
        </div>
      );
    } else if (
      level.longInstructions ||
      level.long_instructions ||
      level.shortInstructions
    ) {
      // TODO: calculate more of these parameters based on the level and pages
      return (
        <UnconnectedTopInstructions
          hasContainedLevels={false}
          noVisualization={true}
          isMinecraft={false}
          isBlockly={false}
          isRtl={this.props.isRtl}
          longInstructions={
            level.longInstructions ||
            level.long_instructions ||
            level.shortInstructions
          }
          shortInstructions={level.shortInstructions}
          noInstructionsWhenCollapsed={true}
          levelVideos={level.videos}
          mapReference={level.mapReference}
          referenceLinks={level.referenceLinks}
          teacherMarkdown={level.teacherMarkdown}
          viewAs={this.props.viewAs}
          height={this.state.height}
          maxHeight={Math.min(this.state.maxHeight, MAX_LEVEL_HEIGHT)}
          expandedHeight={this.state.height}
          isCollapsed={false}
          hidden={false}
          isEmbedView={false}
          mainStyle={{paddingBottom: 5}}
          containerStyle={{
            overflowY: 'auto',
            height: this.state.height - HEADER_HEIGHT
          }}
          setInstructionsRenderedHeight={height =>
            this.setState({height: Math.min(height, MAX_LEVEL_HEIGHT)})
          }
          setInstructionsMaxHeightNeeded={maxHeight =>
            this.setState({maxHeight})
          }
          collapsible={false}
          resizable={false}
        />
      );
    } else {
      return (
        <SafeMarkdown
          markdown={i18n.noLevelPreviewAvailable({
            buttonText: i18n.seeFullLevel()
          })}
          openExternalLinksInNewTab
        />
      );
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
    const hasVideo =
      level.type === 'StandaloneVideo' ||
      (level.type === 'External' && !!level.videoOptions);
    const levelSpecificStyling = hasVideo
      ? {width: VIDEO_MODAL_WIDTH, marginLeft: -VIDEO_MODAL_WIDTH / 2}
      : {};
    return (
      <BaseDialog
        isOpen={true}
        handleClose={this.props.handleClose}
        fullWidth={!hasVideo}
        style={{...levelSpecificStyling}}
      >
        <h1>{i18n.levelPreview()}</h1>
        {this.renderBubbleChoiceBubbles()}
        <div className="level-details">{preview}</div>
        <DialogFooter rightAlign>
          <Button
            onClick={this.props.handleClose}
            text={i18n.dismiss()}
            color={'gray'}
            style={{margin: 5}}
          />
          <Button
            href={level.url || scriptLevel.url}
            target={'_blank'}
            text={i18n.seeFullLevel()}
            color={'orange'}
            __useDeprecatedTag
            style={{margin: 5}}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

export const UnconnectedLevelDetailsDialog = LevelDetailsDialog;

export default connect(state => ({
  viewAs: state.viewAs,
  isRtl: state.isRtl
}))(LevelDetailsDialog);
