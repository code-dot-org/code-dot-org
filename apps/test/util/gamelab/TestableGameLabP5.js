/** @file Helper to load a configured GameLabP5 object for tests */
import "script!@cdo/apps/../lib/p5play/p5";
import "script!@cdo/apps/../lib/p5play/p5.play";
import GameLabP5 from '@cdo/apps/gamelab/GameLabP5';
import {injectJSInterpreter as injectJSInterpreterToSprite} from '@cdo/apps/gamelab/GameLabSprite';
import {injectJSInterpreter as injectJSInterpreterToGroup} from '@cdo/apps/gamelab/GameLabGroup';

/**
 * Builds a GameLabP5 object ready to use in a test and then be thrown away.
 * @returns {GameLabP5}
 */
export default function createGameLabP5() {
  let gameLabP5 = new GameLabP5();
  gameLabP5.init({
    onExecutionStarting: function () {},
    onPreload: function () {},
    onSetup: function () {},
    onDraw: function () {}
  });
  gameLabP5.startExecution();

  let interpreter = {getCurrentState: function () {return {};}};
  injectJSInterpreterToSprite(interpreter);
  injectJSInterpreterToGroup(interpreter);
  return gameLabP5;
}
