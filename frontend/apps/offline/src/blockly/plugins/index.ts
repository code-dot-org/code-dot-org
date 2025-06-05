import * as Blockly from 'blockly/core';

import type {Theme} from '../types';

/**
 * Determines the plugin type.
 */
export const PluginType: {
  Registry: 'registry';
  Inject: 'inject';
  Global: 'global';
  Input: 'input';
  Mixin: 'mixin';
} = {
  /** This is a registry plugin. */
  Registry: 'registry',
  /** This plugin is instantiated after injection. */
  Inject: 'inject',
  /** This plugin is instantiated before injection. */
  Global: 'global',
  /** This plugin is instantiated alongside the renderer for notch types. */
  Input: 'input',
  /** This is a block mixin. */
  Mixin: 'mixin',
};

export interface PluginBase {
  type: string;
  useWithInline?: boolean;
}

/**
 * This is a normal Blockly plugin when it fits the Blockly way of doing things.
 *
 * This gets passed into the Blockly.registry.register function before
 * injection.
 */
export interface RegistryPlugin extends PluginBase {
  type: typeof PluginType.Registry;
  slot: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface: new (...p: any[]) => any;
}

/**
 * Registers an injected plugin which just gets constructed with the new
 * workspace as an argument.
 */
export interface InjectPlugin extends PluginBase {
  type: 'inject';
  instantiate: (workspace: Blockly.WorkspaceSvg, theme: Theme) => void;
}

/**
 * Registers a global plugin which instantiates once before Blockly is injected.
 */
export interface GlobalPlugin extends PluginBase {
  type: 'global';
  initialize: () => void;
  uninitialize?: () => void;
}

/**
 * Registers an input plugin that adds an input type to a renderer.
 */
export interface InputPlugin extends PluginBase {
  type: typeof PluginType.Input;
  /** The type to associate with this notch type. */
  check: string;
  /** The name for the shape. */
  shape: string;
  /** The function that generates the path for the notch. */
  makePath: (
    this: Blockly.blockRendering.ConstantProvider,
    shapeIndex: number,
  ) => Blockly.blockRendering.PuzzleTab;
}

/**
 * Registers a block mixin.
 */
export interface MixinPlugin extends PluginBase {
  type: 'mixin';
  /** The name of the mixin which should be unique to all extensions. */
  name: string;
  /** A set of properties to add to the Block class. */
  mixin: object;
  /** Whether or not the mixin should be applied to all blocks, past and future. */
  global?: boolean;
}

/**
 * Represents a generic plugin for Blockly.
 *
 * This is our own interface for extending Blockly. The registry system is
 * represented by PluginType.Registry.
 */
export type Plugin =
  | RegistryPlugin
  | InjectPlugin
  | GlobalPlugin
  | InputPlugin
  | MixinPlugin;

export function WrapPlugin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definition: new (workspace: Blockly.WorkspaceSvg, theme: Theme) => any,
) {
  return (workspace: Blockly.WorkspaceSvg, theme: Theme) => {
    new definition(workspace, theme);
  };
}
