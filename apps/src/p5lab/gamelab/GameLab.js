import msg from '@cdo/gamelab/locale';
import {getStore} from '@cdo/apps/redux';
import P5Lab from '../P5Lab';
import {P5LabType} from '../constants';
import project from '@cdo/apps/code-studio/initApp/project';
import header from '../../code-studio/header';
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
      header.showLevelBuilderSaveButton(() => ({
        start_blocks: this.studioApp_.getCode(),
        start_libraries: JSON.stringify(project.getProjectLibraries()),
      }));
    }

    return super.init(config);
  }

  /**
   * Wait for animations to be loaded into memory and ready to use, then pass
   * those animations to P5 to be loaded into the engine as animations.
   * @param {Boolean} pauseAnimationsByDefault whether animations should be paused
   * @returns {Promise} which resolves once animations are in memory in the redux
   *          store and we've started loading them into P5.
   *          Loading to P5 is also an async process but it has its own internal
   *          effect on the P5 preloadCount, so we don't need to track it here.
   * @private
   */
  async preloadAnimations_(pauseAnimationsByDefault) {
    await this.whenAnimationsAreReady();
    // Animations are ready - send them to p5 to be loaded into the engine.
    return this.p5Wrapper.preloadAnimations(
      getStore().getState().animationList,
      pauseAnimationsByDefault
    );
  }

  preloadLabAssets() {
    return Promise.all([
      this.preloadAnimations_(this.level.pauseAnimationsByDefault),
    ]);
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
