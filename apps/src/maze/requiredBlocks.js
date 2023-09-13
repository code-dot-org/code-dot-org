import {simpleBlock, repeatSimpleBlock} from '../required_block_utils';

export const MOVE_FORWARD = {test: 'moveForward', type: 'maze_moveForward'};
export const TURN_LEFT = {
  test: 'turnLeft',
  type: 'maze_turn',
  titles: {DIR: 'turnLeft'},
};
export const TURN_RIGHT = {
  test: 'turnRight',
  type: 'maze_turn',
  titles: {DIR: 'turnRight'},
};
export const WHILE_LOOP = {test: 'while', type: 'maze_forever'};
export const IS_PATH_LEFT = {
  test: 'isPathLeft',
  type: 'maze_if',
  titles: {DIR: 'isPathLeft'},
};
export const IS_PATH_RIGHT = {
  test: 'isPathRight',
  type: 'maze_if',
  titles: {DIR: 'isPathRight'},
};
export const IS_PATH_FORWARD = {
  test: 'isPathForward',
  type: 'maze_ifElse',
  titles: {DIR: 'isPathForward'},
};
export const FOR_LOOP = {
  test: 'for',
  type: 'controls_repeat',
  titles: {TIMES: '???'},
};

export const moveNorth = simpleBlock('maze_moveNorth');
export const moveSouth = simpleBlock('maze_moveSouth');
export const moveEast = simpleBlock('maze_moveEast');
export const moveWest = simpleBlock('maze_moveWest');
export const controls_repeat_simplified = repeatSimpleBlock('???');
