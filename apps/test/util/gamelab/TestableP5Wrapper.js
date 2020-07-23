/** @file Helper to load a configured P5Wrapper object for tests */
import 'script-loader!@code-dot-org/p5.play/examples/lib/p5';
import 'script-loader!@code-dot-org/p5.play/lib/p5.play';
import {expect} from '../deprecatedChai';
import P5Wrapper from '@cdo/apps/p5lab/P5Wrapper';
import {injectJSInterpreter as injectJSInterpreterToSprite} from '@cdo/apps/p5lab/P5SpriteWrapper';
import {injectJSInterpreter as injectJSInterpreterToGroup} from '@cdo/apps/p5lab/P5GroupWrapper';

/**
 * Builds a P5Wrapper object ready to use in a test and then be thrown away.
 * @returns {P5Wrapper}
 */
export default function createP5Wrapper() {
  return createP5WrapperWithInterpreter(createStatelessInterpreter());
}

function createP5WrapperWithInterpreter(interpreter) {
  let p5Wrapper = new P5Wrapper();
  p5Wrapper.init({
    onExecutionStarting: function() {},
    onPreload: function() {},
    onSetup: function() {},
    onDraw: function() {}
  });
  p5Wrapper.startExecution();

  injectJSInterpreterToSprite(interpreter);
  injectJSInterpreterToGroup(interpreter);
  return p5Wrapper;
}

/**
 * Builds a P5Wrapper object ready to use in a test and then be thrown away.
 * Uses a fake JSInterpreter with a persistent state which allows testing of
 * stateful methods (like Group.isTouching)
 * @returns {P5Wrapper}
 */
export function createStatefulP5Wrapper() {
  return createP5WrapperWithInterpreter(createStatefulInterpreter());
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
