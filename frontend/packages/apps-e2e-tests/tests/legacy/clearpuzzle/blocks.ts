/**
 * Workspace fixture for the clear-puzzle "adding blocks then clearing" scenario.
 * Loads startBlock, moveForward, and turnRight on top of the HOC level's
 * original when_run block. After clearPuzzle(), moveForward and turnRight
 * should be absent from the DOM.
 */
export const HOC_BLOCKS_TO_CLEAR =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"when_run","x":16,"y":16,"next":{"block":{"type":"maze_moveForward","id":"startBlock","next":{"block":{"type":"maze_moveForward","id":"moveForward","next":{"block":{"type":"maze_turn","id":"turnRight","fields":{"DIR":"<field name=\\"DIR\\">turnRight</field>"}}}}}}}}]}}';
