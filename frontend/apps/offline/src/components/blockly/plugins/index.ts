import * as Blockly from 'blockly/core';

import type {Theme} from '../types';

/**
 * Determines the plugin type.
 */
export const PluginType = {
  Registry: 0,
  Inject: 1,
};

/**
 * This is a normal Blockly plugin when it fits the Blockly way of doing things.
 *
 * This gets passed into the Blockly.registry.register function before
 * injection.
 */
export interface RegistryPlugin {
  type: typeof PluginType.Registry;
  slot: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface: new (...p: any[]) => any;
}

/**
 * Registers an injected plugin which just gets constructed with the new
 * workspace as an argument.
 */
export interface InjectPlugin {
  type: typeof PluginType.Inject;
  instantiate: (workspace: Blockly.WorkspaceSvg, theme: Theme) => void;
}

/**
 * Represents a generic plugin for Blockly.
 *
 * This is our own interface for extending Blockly. The registry system is
 * represented by PluginType.Registry.
 */
export type Plugin = RegistryPlugin | InjectPlugin;

export function WrapPlugin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definition: new (workspace: Blockly.WorkspaceSvg, theme: Theme) => any,
) {
  return (workspace: Blockly.WorkspaceSvg, theme: Theme) => {
    new definition(workspace, theme);
  };
}
