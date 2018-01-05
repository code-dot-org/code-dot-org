/** @file Helper to load a configured GameLabP5 object for tests */
import "script-loader!@code-dot-org/p5.play/examples/lib/p5";
import "script-loader!@code-dot-org/p5.play/lib/p5.play";
import {expect} from '../configuredChai';
import GameLabP5 from '@cdo/apps/gamelab/GameLabP5';
import {
  injectJSInterpreter as injectJSInterpreterToSprite,
  injectLevel as injectLevelToSprite
} from '@cdo/apps/gamelab/GameLabSprite';
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
  injectLevelToSprite({});
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

export function expectAnimationsAreClones(anim1, anim2) {
  // Not identical
  expect(anim1).not.to.equal(anim2);
  // But spritesheet is a clone
  expectSpriteSheetsAreClones(anim1.spriteSheet, anim2.spriteSheet);
  // And image array is deep equal
  expect(anim1.images).to.deep.equal(anim2.images);
  // And other props are exactly equal
  expect(anim1.offX).to.equal(anim2.offX);
  expect(anim1.offY).to.equal(anim2.offY);
  expect(anim1.frameDelay).to.equal(anim2.frameDelay);
  expect(anim1.playing).to.equal(anim2.playing);
  expect(anim1.looping).to.equal(anim2.looping);
}

export function expectSpriteSheetsAreClones(sheet1, sheet2) {
  // Not identical
  expect(sheet1).not.to.equal(sheet2);
  // But frame array is same size
  // Note: Would check deep equal but cloning frames adds 'name' property in
  //       some cases
  expect(sheet1.frames.length).to.equal(sheet2.frames.length);
  // And other props exactly equal
  expect(sheet1.image).to.equal(sheet2.image);
  expect(sheet1.frame_width).to.equal(sheet2.frame_width);
  expect(sheet1.frame_height).to.equal(sheet2.frame_height);
  expect(sheet1.num_frames).to.equal(sheet2.num_frames);
}
