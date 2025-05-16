import * as Blockly from 'blockly/core';

import type {Theme} from '../types';

/**
 * Determines the plugin type.
 */
export const PluginType = {
  /** This is a registry plugin. */
  Registry: 0,
  /** This plugin is instantiated after injection. */
  Inject: 1,
  /** This plugin is instantiated before injection. */
  Global: 2,
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
 * Registers a global plugin which instantiates once before Blockly is injected.
 */
export interface GlobalPlugin {
  type: typeof PluginType.Global;
  initialize: () => void;
}

/**
 * Represents a generic plugin for Blockly.
 *
 * This is our own interface for extending Blockly. The registry system is
 * represented by PluginType.Registry.
 */
export type Plugin = RegistryPlugin | InjectPlugin | GlobalPlugin;

export function WrapPlugin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definition: new (workspace: Blockly.WorkspaceSvg, theme: Theme) => any,
) {
  return (workspace: Blockly.WorkspaceSvg, theme: Theme) => {
    new definition(workspace, theme);
  };
}
