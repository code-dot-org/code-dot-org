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
  return createGameLabP5WithInterpreter(createStatelessInterpreter());
}

function createGameLabP5WithInterpreter(interpreter) {
  let gameLabP5 = new GameLabP5();
  gameLabP5.init({
    onExecutionStarting: function () {},
    onPreload: function () {},
    onSetup: function () {},
    onDraw: function () {}
  });
  gameLabP5.startExecution();

  injectJSInterpreterToSprite(interpreter);
  injectJSInterpreterToGroup(interpreter);
  return gameLabP5;
}

/**
 * Builds a GameLabP5 object ready to use in a test and then be thrown away.
 * Uses a fake JSInterpreter with a persistent state which allows testing of
 * stateful methods (like Group.isTouching)
 * @returns {GameLabP5}
 */
export function createStatefulGameLabP5() {
  return createGameLabP5WithInterpreter(createStatefulInterpreter());
}

function createStatelessInterpreter() {
  return {getCurrentState: () => ({})};
}

function createStatefulInterpreter() {
  let state = {};
  return {getCurrentState: () => state};
}
