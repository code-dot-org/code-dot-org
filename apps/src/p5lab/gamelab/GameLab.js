import P5Lab from '../P5Lab';
import project from '@cdo/apps/code-studio/initApp/project';
import {showLevelBuilderSaveButton} from '../../code-studio/header';
import {postContainedLevelAttempt} from '@cdo/apps/containedLevels';

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
  $('.droplet-main-canvas').css('background-color', '#FFF');
  $('.droplet-transition-container').css('background-color', '#FFF');
  $('.ace_scroller').css('background-color', '#FFF');
  this.reset();
};

GameLab.prototype.runButtonClick = function() {
  $('.droplet-main-canvas').css('background-color', '#E5E5E5');
  $('.droplet-transition-container').css('background-color', '#E5E5E5');
  $('.ace_scroller').css('background-color', '#E5E5E5');
  this.studioApp_.toggleRunReset('reset');
  // document.getElementById('spinner').style.visibility = 'visible';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  this.studioApp_.attempts++;
  this.execute();

  // Enable the Finish button if is present:
  var shareCell = document.getElementById('share-cell');
  if (shareCell && !this.level.validationCode) {
    shareCell.className = 'share-cell-enabled';

    // Adding completion button changes layout.  Force a resize.
    this.studioApp_.onResize();
  }

  postContainedLevelAttempt(this.studioApp_);
};

module.exports = GameLab;
