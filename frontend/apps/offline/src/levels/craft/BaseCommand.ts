import type Phaser from 'phaser';

import type BaseEntity from './BaseEntity';
import CommandState from './CommandState';
import type GameController from './GameController';

export type FinishCallback = () => void;
export type HighlightCallback = () => void;

/**
 * The base class for all game commands.
 */
class BaseCommand {
  protected onFinish: FinishCallback;
  protected HighlightCallback: HighlightCallback;
  protected GameController: GameController;
  protected state: CommandState;
  protected Game: Phaser.Game;
  protected target: BaseEntity;
  repeat: boolean;

  constructor(
    gameController: GameController,
    highlightCallback: HighlightCallback,
    targetEntity: BaseEntity,
    onFinish: FinishCallback,
  ) {
    this.GameController = gameController;
    this.Game = this.GameController.game;
    this.onFinish = onFinish;
    this.target = targetEntity;
    this.HighlightCallback = highlightCallback;
    this.state = CommandState.NOT_STARTED;
    this.repeat = false;
  }

  tick() {}

  begin() {}

  isStarted(): boolean {
    return this.state !== CommandState.NOT_STARTED;
  }

  isFinished(): boolean {
    return this.isSucceeded() || this.isFailed();
  }

  isSucceeded(): boolean {
    return this.state === CommandState.SUCCESS;
  }

  isFailed(): boolean {
    return this.state === CommandState.FAILURE;
  }

  succeeded() {
    this.state = CommandState.SUCCESS;
  }

  failed() {
    this.state = CommandState.FAILURE;
  }

  finish() {
    this.onFinish?.();
  }
}

export default BaseCommand;
