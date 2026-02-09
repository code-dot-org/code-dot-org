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
  Field: 'field';
} = {
  /** This is a registry plugin. */
  Registry: 'registry',
  /** This plugin is instantiated after injection. */
  Inject: 'inject',
  /** This plugin is instantiated before injection. */
  Global: 'global',
  /** This plugin is instantiated alongside the renderer for notch types. */
  Input: 'input',
  /** This is a field plugin. */
  Field: 'field',
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
  type: 'registry';
  slot: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface: new (...p: any[]) => any;
}

/**
 * Registers an injected plugin which gets constructed with the new
 * workspace as an argument after injection.
 */
export interface InjectPlugin extends PluginBase {
  type: 'inject';
  /** The plugin class to instantiate with (workspace, theme) */
  plugin: new (workspace: Blockly.WorkspaceSvg, theme: Theme) => unknown;
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

export interface FieldPlugin extends PluginBase {
  type: 'field';
  /** The name of the field. */
  name: string;
  /** The field class to register */
  field?: Blockly.fieldRegistry.RegistrableField;
  /**
   * If the field class is not specified, it uses an initialize/uninitialize function instead
   */
  initialize?: () => void;
  uninitialize?: () => void;
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
  | FieldPlugin;

/**
 * A setup function that is called after workspace injection.
 * Use this for plugins that just need to initialize behavior without
 * needing to implement Blockly interfaces.
 */
export type InjectSetupFunction = (
  workspace: Blockly.WorkspaceSvg,
  theme: Theme,
) => void;

/**
 * Creates an inject plugin from a simple setup function.
 *
 * Use this helper when your plugin just needs to set up event listeners,
 * create DOM elements, or perform other initialization that doesn't require
 * extending Blockly classes.
 *
 * @example
 * ```typescript
 * export const plugin = createInjectPlugin((workspace, theme) => {
 *   workspace.addChangeListener((event) => {
 *     // Handle workspace changes
 *   });
 * });
 * ```
 */
export function createInjectPlugin(
  setup: InjectSetupFunction,
  options?: {useWithInline?: boolean},
): InjectPlugin {
  return {
    type: PluginType.Inject,
    useWithInline: options?.useWithInline,
    plugin: class {
      constructor(workspace: Blockly.WorkspaceSvg, theme: Theme) {
        setup(workspace, theme);
      }
    },
  };
}
