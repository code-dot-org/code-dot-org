import * as BlocklyCore from 'blockly/core';

import {AngleHelperOptions} from '../types';

const KEY = 'angleHelperOptions' as const;

export type AngleHelperConnection = BlocklyCore.Connection & {
  [KEY]?: AngleHelperOptions;
};

export function setAngleHelperOptions(
  connection: BlocklyCore.Connection | null,
  options: AngleHelperOptions
): void {
  if (!connection) return;
  (connection as AngleHelperConnection)[KEY] = options;
}

export function getAngleHelperOptions(
  connection: BlocklyCore.Connection | null
): AngleHelperOptions | undefined {
  if (!connection) return undefined;
  console.log('Getting angle helper options for connection', connection);
  return (connection as AngleHelperConnection)[KEY];
}
