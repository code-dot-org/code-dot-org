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
export type InjectSetupFunction<T = never> = (
  workspace: Blockly.WorkspaceSvg,
  theme: Theme,
) => [T] extends [never] ? void : T;

export type InjectChangeFunction<T = never> = [T] extends [never]
  ? (event: Blockly.Events.Abstract) => void
  : (event: Blockly.Events.Abstract, data: T) => void;

/**
 * A setup function run once after the workspace is injected and laid out. No
 * change event fires on inject, so a plugin that paints initial state uses this
 * rather than waiting for the first onChange. Receives the state from onInit.
 */
export type InjectReadyFunction<T = never> = [T] extends [never]
  ? (workspace: Blockly.WorkspaceSvg, theme: Theme) => void
  : (workspace: Blockly.WorkspaceSvg, theme: Theme, data: T) => void;

/**
 * A teardown function run as the workspace is disposed, before Blockly tears it
 * down (so the workspace is still usable). The cleanup mirror of onReady:
 * release anything onInit/onReady acquired. Receives the state from onInit.
 */
export type InjectDisposeFunction<T = never> = [T] extends [never]
  ? (workspace: Blockly.WorkspaceSvg, theme: Theme) => void
  : (workspace: Blockly.WorkspaceSvg, theme: Theme, data: T) => void;

export interface CreateInjectPluginOptionsBase<T = never> {
  useWithInline?: boolean;
  /**
   * Run once after injection, deferred until the flyout and blocks are laid
   * out. Use it to draw initial state that no change event would trigger.
   */
  onReady?: InjectReadyFunction<T>;
  /** Run when the workspace is torn down; the cleanup mirror of onReady. */
  onDispose?: InjectDisposeFunction<T>;
}

export interface CreateInjectPluginOptionsWithInitAndChange<T = never>
  extends CreateInjectPluginOptionsBase<T> {
  onInit?: InjectSetupFunction<T>;
  onChange?: InjectChangeFunction<T>;
}

export interface CreateInjectPluginOptionsWithInit<T = never>
  extends CreateInjectPluginOptionsBase<T> {
  onInit?: InjectSetupFunction<T>;
  onChange?: never;
}

export interface CreateInjectPluginOptionsWithChange<T = never>
  extends CreateInjectPluginOptionsBase<T> {
  onInit?: never;
  onChange?: InjectChangeFunction<T>;
}

export type CreateInjectPluginOptions<T = never> =
  | CreateInjectPluginOptionsWithInitAndChange<T>
  | CreateInjectPluginOptionsWithChange<T>
  | CreateInjectPluginOptionsWithInit<T>;

/**
 * Creates an inject plugin from a simple setup function.
 *
 * Use this helper when your plugin just needs to set up event listeners,
 * create DOM elements, or perform other initialization that doesn't require
 * extending Blockly classes.
 *
 * The plugin must have either an onInit or an onChange or both, and may add an
 * onReady (initial paint after layout) and/or onDispose (cleanup). The state
 * onInit returns is threaded to every other callback.
 *
 * Lifecycle: onInit (sync, at inject) → onReady (deferred, once the flyout and
 * blocks are laid out) → onChange (per event) → onDispose (at teardown). The
 * change listener is attached and detached for you; onReady is canceled if the
 * workspace is torn down before it runs.
 *
 * @example
 * ```typescript
 * export const plugin = createInjectPlugin({
 *   onInit: (workspace, theme) => new Foo(workspace, theme),
 *   onReady: (workspace, theme, foo) => foo.draw(),
 *   onChange: (event, foo) => foo.onChange(event),
 *   onDispose: (workspace, theme, foo) => foo.dispose(),
 * });
 * ```
 */
export function createInjectPlugin<T = never>(
  options: CreateInjectPluginOptions<T>,
): InjectPlugin {
  return {
    type: PluginType.Inject,
    useWithInline: options?.useWithInline,
    plugin: class {
      private readonly workspace: Blockly.WorkspaceSvg;
      private readonly theme: Theme;
      private readonly state: T;
      private changeListener?: (event: Blockly.Events.Abstract) => void;
      private readyTimer?: ReturnType<typeof setTimeout>;
      private disposed = false;

      constructor(workspace: Blockly.WorkspaceSvg, theme: Theme) {
        this.workspace = workspace;
        this.theme = theme;
        this.state = options.onInit?.(workspace, theme) as T;

        if (options.onChange) {
          this.changeListener = (event: Blockly.Events.Abstract) => {
            options.onChange?.(event, this.state);
          };
          workspace.addChangeListener(this.changeListener);
        }

        if (options.onReady) {
          // No event fires on inject, so a plugin that paints initial state
          // would otherwise wait for the first change. Defer past this inject
          // call stack so the flyout and blocks are laid out, then paint once.
          this.readyTimer = setTimeout(() => {
            this.readyTimer = undefined;
            if (this.disposed) {
              return;
            }
            options.onReady?.(this.workspace, this.theme, this.state);
          }, 0);
        }
      }

      // Called by the framework as the workspace is torn down (see
      // Registry.disposeInject), while the workspace is still usable.
      dispose() {
        if (this.disposed) {
          return;
        }
        this.disposed = true;

        if (this.readyTimer !== undefined) {
          clearTimeout(this.readyTimer);
          this.readyTimer = undefined;
        }
        if (this.changeListener) {
          this.workspace.removeChangeListener(this.changeListener);
          this.changeListener = undefined;
        }

        options.onDispose?.(this.workspace, this.theme, this.state);
      }
    },
  };
}
