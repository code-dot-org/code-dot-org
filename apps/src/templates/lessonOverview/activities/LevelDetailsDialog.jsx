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
    console.log(level);
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
    } else {
      return <div>Not implemented yet</div>;
    }
  };

  componentDidMount() {
    if (this.video) {
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
        {preview}
        <DialogFooter rightAlign>
          <Button href={scriptLevel.url} text={i18n.dismiss()} color={'gray'} />
          <Button
            onClick={this.props.handleClose}
            text={i18n.seeFullLevel()}
            color={'orange'}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
