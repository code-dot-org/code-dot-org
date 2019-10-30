import P5Lab from '../P5Lab';
import project from '@cdo/apps/code-studio/initApp/project';
import {showLevelBuilderSaveButton} from '../../code-studio/header';

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

module.exports = GameLab;
