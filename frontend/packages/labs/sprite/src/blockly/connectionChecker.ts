import * as BlocklyCore from 'blockly/core';

// Checks only a block of the same custom type may meet.
const CUSTOM_TYPES = ['Sprite', 'Behavior', 'Location'];

/**
 * Apps' CdoConnectionChecker: a connection whose check names a custom
 * type (Sprite, Behavior, Location) meets only another that does, so a
 * sprite socket refuses an untyped variable. Apps also kept function
 * parameters from being displaced; functions are not ported.
 */
export class SpriteLabConnectionChecker extends BlocklyCore.ConnectionChecker {
  override doTypeChecks(
    a: BlocklyCore.Connection,
    b: BlocklyCore.Connection,
  ): boolean {
    const custom = (connection: BlocklyCore.Connection) =>
      !!connection.getCheck()?.some(check => CUSTOM_TYPES.includes(check));
    if (custom(a) !== custom(b)) {
      return false;
    }
    return super.doTypeChecks(a, b);
  }
}
