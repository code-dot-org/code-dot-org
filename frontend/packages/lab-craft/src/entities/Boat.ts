import type Phaser from 'phaser';

import BaseEntity from '../BaseEntity';
import {Direction} from '../FacingDirection';
import type {LevelRunnerScene} from '../GameController';

class Boat extends BaseEntity {
  constructor(
    scene: LevelRunnerScene,
    type: string,
    identifier: string | number,
    x: number,
    y: number,
    facing: Direction,
  ) {
    super(scene, type, identifier, x, y, facing);

    this.entityName = 'boat';
    this.offset = [-20, -28];
    this.prepareSprite();
    this.sprite?.setDepth(this.position.y);
  }

  getFrameForDirection(): string {
    switch (this.facing) {
      case Direction.North:
        return 'Boat_05';
      case Direction.South:
        return 'Boat_01';
      case Direction.East:
        return 'Boat_07';
      case Direction.West:
      default:
        return 'Boat_03';
    }

    return 'Boat_03';
  }

  prepareSprite() {
    const actionGroup = this.scene.levelView.actionGroup;
    const frame = this.getFrameForDirection();

    // Determine sprite sheet
    const atlas = this.scene.textures.exists('playerSteveAquatic')
      ? 'playerSteveAquatic'
      : 'playerAlexAquatic';

    this.sprite = this.scene.add.sprite(0, 0, atlas, frame);
    actionGroup.add(this.sprite);

    // Initialize.
    this.sprite.x = this.offset[0] + 40 * this.position.x;
    this.sprite.y = this.offset[1] + 40 * this.position.y;

    Boat.addBobTween(this.scene, this.sprite);
  }

  /**
   * Apply a "bob up and down in the water" animation to the sprite,
   * which runs forever.
   */
  static addBobTween(
    scene: LevelRunnerScene,
    sprite: Phaser.GameObjects.Sprite,
  ): Phaser.Tweens.Tween {
    const tween = scene.tweens.add({
      targets: sprite,
      y: sprite.y + 3,
      duration: 1000,
      repeat: -1,
      yoyo: true,
      delay: 0,
      ease: 'Cubic.easeInOut',
    });

    return tween;
  }
}

export default Boat;
