import msg from '@cdo/gamelab/locale';
import P5Lab from '../P5Lab';
import {P5LabType} from '../constants';
import project from '@cdo/apps/code-studio/initApp/project';
import {showLevelBuilderSaveButton} from '../../code-studio/header';
import color from '@cdo/apps/util/color';

export default class GameLab extends P5Lab {
  getAvatarUrl(levelInstructor) {
    return null;
  }

  getMsg() {
    return msg;
  }

  getLabType() {
    return P5LabType.GAMELAB;
  }

  init(config) {
    if (!this.studioApp_) {
      throw new Error('GameLab requires a StudioApp');
    }
    if (config.level.editBlocks) {
      config.level.lastAttempt = '';
      showLevelBuilderSaveButton(() => ({
        start_blocks: this.studioApp_.getCode(),
        start_libraries: JSON.stringify(project.getProjectLibraries())
      }));
    }

    return super.init(config);
  }

  resetHandler(ignore) {
    if (!this.studioApp_.config.readonlyWorkspace) {
      $('.droplet-main-canvas').css('background-color', color.white);
      $('.droplet-transition-container').css('background-color', color.white);
      $('.ace_scroller').css('background-color', color.white);
    }
    super.resetHandler(ignore);
  }

  runButtonClick() {
    if (!this.studioApp_.config.readonlyWorkspace) {
      $('.droplet-main-canvas').css(
        'background-color',
        color.workspace_running_background
      );
      $('.droplet-transition-container').css(
        'background-color',
        color.workspace_running_background
      );
      $('.ace_scroller').css(
        'background-color',
        color.workspace_running_background
      );
    }
    super.runButtonClick();
  }
}
