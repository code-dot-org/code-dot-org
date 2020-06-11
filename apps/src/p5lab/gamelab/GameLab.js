import P5Lab from '../P5Lab';
import project from '@cdo/apps/code-studio/initApp/project';
import {showLevelBuilderSaveButton} from '../../code-studio/header';
import {code_running, white} from '@cdo/apps/util/color';

var GameLab = function() {
  P5Lab.call(this);
};

GameLab.prototype = Object.create(P5Lab.prototype);

GameLab.prototype.init = function(config) {
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

  return P5Lab.prototype.init.call(this, config);
};

GameLab.prototype.resetHandler = function(ignore) {
  if (!this.studioApp_.config.readonlyWorkspace) {
    $('.droplet-main-canvas').css('background-color', white);
    $('.droplet-transition-container').css('background-color', white);
    $('.ace_scroller').css('background-color', white);
  }
  P5Lab.prototype.resetHandler.call(this, ignore);
};

GameLab.prototype.runButtonClick = function() {
  if (!this.studioApp_.config.readonlyWorkspace) {
    $('.droplet-main-canvas').css('background-color', code_running);
    $('.droplet-transition-container').css('background-color', code_running);
    $('.ace_scroller').css('background-color', code_running);
  }
  P5Lab.prototype.runButtonClick.call(this);
};

module.exports = GameLab;
