import type CoreLibrary from '../CoreLibrary';

/** Types `this` in each command as the library the host applies it to. */
export function defineCommands<T extends object>(
  commands: T & ThisType<CoreLibrary>,
): T {
  return commands;
}
