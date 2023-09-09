/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */
import {singleton as studioApp} from '../StudioApp';

import {BEHAVIOR_STOP} from './constants';

export default class Collidable {
  /**
   * Collidable constructor opts
   *
   * @param {Object} opts
   * @param {String} opts.image - image url
   * @param {Number} opts.width - width in pixels
   * @param {Number} opts.height - height in pixels
   * @param {Number} opts.x
   * @param {Number} opts.y
   * @param {Number} opts.dir
   * @param {Number} opts.speed
   * @param {Number} opts.frames
   */
  constructor(opts) {
    this.gridX = undefined;
    this.gridY = undefined;

    this.activity = BEHAVIOR_STOP;

    for (var prop in opts) {
      this[prop] = opts[prop];
    }
    this.visible = this.visible || true;
    this.flags = 0;
    // hash table of other sprites we're currently colliding with
    this.collidingWith_ = {};

    // default num frames is 1
    this.frames = this.frames || 1;

    /** @private {SpriteAction[]} */
    this.actions_ = [];
  }

  /**
   * Clear all current collisions
   */
  clearCollisions() {
    this.collidingWith_ = {};
  }

  /**
   * Mark that we're colliding with object represented by key
   * @param key A unique key representing the object we're colliding with
   * @returns {boolean} True if collision is started, false if we're already colliding
   */
  startCollision(key) {
    if (this.isCollidingWith(key)) {
      return false;
    }

    this.collidingWith_[key] = true;
    return true;
  }

  /**
   * Mark that we're no longer colliding with object represented by key
   * @param key A unique key representing the object we're querying
   */
  endCollision(key) {
    this.collidingWith_[key] = false;
  }

  /**
   * Are we colliding with the object represented by key?
   * @param key A unique key representing the object we're querying
   */
  isCollidingWith(key) {
    return this.collidingWith_[key] === true;
  }

  /**
   * Assumes x/y are center coords (true for projectiles and items)
   * outOfBounds() returns true if the object is entirely "off screen"
   */
  outOfBounds() {
    return (
      this.x < -(this.width / 2) ||
      this.x > studioApp().MAZE_WIDTH + this.width / 2 ||
      this.y < -(this.height / 2) ||
      this.y > studioApp().MAZE_HEIGHT + this.height / 2
    );
  }

  /**
   * Add an action (probably an animation) for this sprite to run.
   * Note: This is a 'sprouted' new system for updating sprites, separate from
   *       how older playlab stuff works.  For now it's driving the discrete
   *       movement hoc2015 levels.
   * @param {SpriteAction} action
   */
  addAction(action) {
    this.actions_.push(action);
  }

  /**
   * @returns {boolean} whether this sprite is currently running any actions.
   */
  hasActions() {
    return this.actions_.length > 0;
  }

  /**
   * Causes this sprite to update all actions it's currently running, and then
   * remove any that are complete.
   */
  updateActions() {
    this.actions_.forEach(function (action) {
      action.update(this);
    }, this);

    // Splice completed actions out of the current action list, iterating
    // backwards so we don't skip anything.
    for (var i = this.actions_.length - 1; i >= 0; i--) {
      if (this.actions_[i].isDone()) {
        this.actions_.splice(i, 1);
      }
    }
  }
}
