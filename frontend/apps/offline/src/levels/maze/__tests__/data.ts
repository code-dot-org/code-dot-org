import {MazeData} from '../MazeController';
import type {Skin} from '../skin';

export const baseLevel = {
  skinId: 'birds',
  honeyGoal: 1,
  map: [[0]],
  flowerType: 'redWithNectar',
  startDirection: 1,
  initialDirt: [[0]],
} as MazeData;

export const mockSkin: Skin = {} as Skin;
