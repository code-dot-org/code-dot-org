/**
 * This maintains the plugin registry for our plugin extensions.
 *
 * This will interact with the Blockly registry and, when necessary, maintain our
 * own bookkeeping for plugins which are defined by our own interfaces.
 */

import * as Blockly from 'blockly/core';

import {defineMutator} from './mutators/defineMutator';
import {PluginType} from './plugins';
import type {
  Plugin,
  FieldPlugin,
  GlobalPlugin,
  InputPlugin,
  InjectPlugin,
} from './plugins';
import ThrasosRenderer from './renderers/thrasos';
import DefaultTheme from './themes/default';
import type {
  Environment,
  BlockSvg,
  BlockArgDefinition,
  BlockDefinition,
  BlockFlatArgDefinition,
  Renderer,
  Theme,
  Extension,
  Mixin,
  Mutator,
  OldBlockDefinition,
} from './types';

class Registry<T extends Environment = Environment> {
  /** The current Theme. */
  private theme: Theme;
  /** The current Renderer */
  private renderer: Renderer;
  /** The registered plugins. */
  private registered: Plugin[] = [];
  /** Registered block extensions */
  private extensions: Extension[] = [];
  /** Registered block mixins */
  private mixins: Mixin[] = [];
  /** Registered block mutators */
  private mutators: Mutator[] = [];
  /** Registered input plugins */
  private inputs: InputPlugin[] = [];
  /** The Blockly environment data */
  private environment?: T;

  /**
   * Creates a registry given some environmental properties of Blockly.
   */
  constructor(environment?: T, theme?: Theme, renderer?: Renderer) {
    // Retain the theme
    this.theme = theme || DefaultTheme;
    this.registered = [];
    this.extensions = [];
    this.environment = environment;
    this.renderer = renderer || ThrasosRenderer;

    if (!renderer?.name) {
      throw new Error(
        "Renderer needs to have a string for a 'name' field that uniquely identifies the renderer",
      );
    }

    // Register the renderer
    Blockly.registry.register(
      Blockly.registry.Type.RENDERER,
      this.renderer.name,
      this.renderer.class([]),
      true,
    );
  }

  /**
   * Registers the given plugin.
   */
  register(
    plugin: Plugin,
    inline: boolean = false,
    workspace?: Blockly.WorkspaceSvg,
  ) {
    // Register it depending on the plugin type
    if (plugin.type === PluginType.Field) {
      this.registerField(plugin);
    } else if (plugin.type === PluginType.Inject) {
      // We only perform injection plugins when the workspace is known
      if (workspace !== undefined) {
        this.registerInject(plugin, workspace, inline);
      }
    } else if (plugin.type === PluginType.Global) {
      this.registerGlobal(plugin);
    } else if (plugin.type === PluginType.Input) {
      this.registerInput(plugin);
    }
  }

  /**
   * Registers any unknown plugins referenced within block definitions and
   * returns a list of those plugins. The block definition is modified to
   * remove the references to the plugins and instead refer to the name of the
   * extension or field instead.
   */
  registerFromBlockDefinition(
    definition: BlockDefinition,
  ): (typeof Blockly.Blocks)[string] {
    const block: (typeof Blockly.Blocks)[string] = {
      ...definition,
    };
    const plugins: Plugin[] = [];

    // Ignore old-style block initializers, typically supplied via Blockly itself
    if (typeof (block as OldBlockDefinition).init !== 'undefined') {
      return block;
    }

    const blockDefinition: BlockDefinition = block as BlockDefinition;

    // Register input plugin if we have never seen it before
    if (blockDefinition.output && typeof blockDefinition.output !== 'string') {
      const inputPlugin: InputPlugin = blockDefinition.output;
      this.register(inputPlugin);
      plugins.push(inputPlugin);
      blockDefinition.output = inputPlugin.check;
    }

    // Register fields if we have never seen it before
    (['args0', 'args1', 'args2', 'args3'] as (keyof BlockDefinition)[]).forEach(
      key => {
        if (key in blockDefinition) {
          (
            blockDefinition as unknown as {
              [key: string]: BlockFlatArgDefinition[];
            }
          )[key] = (blockDefinition[key] as BlockArgDefinition[]).map(arg => {
            if (
              typeof arg.type !== 'string' &&
              (arg.type as FieldPlugin).type === PluginType.Field
            ) {
              const fieldPlugin = arg.type as FieldPlugin;
              const formedArg: BlockFlatArgDefinition = {
                ...arg,
                type: fieldPlugin.name,
              };
              this.register(fieldPlugin);
              plugins.push(fieldPlugin);
              return formedArg;
            }
            return arg as BlockFlatArgDefinition;
          });
        }
      },
    );

    // Register mutator if we have never seen it before and it exists
    if (blockDefinition.mutator) {
      if (typeof blockDefinition.mutator !== 'string') {
        const name = blockDefinition.mutator.name;
        this.registerMutator(blockDefinition.mutator);
        block.mutator = name;
      }
    } else {
      // Ensure it gets the environment mutator
      const blankMutator = defineMutator('blank', {});
      this.registerMutator(blankMutator);
      block.mutator = 'blank';
    }

    // Register extensions if we have never seen it before and it exists
    blockDefinition.extensions = [
      ...(blockDefinition.extensions || []),
      ...(blockDefinition.mixins || []),
    ].map(extension => {
      if (typeof extension !== 'string' && 'extension' in extension) {
        this.registerExtension(extension as Extension);
        return extension.name;
      }

      if (typeof extension !== 'string' && 'mixin' in extension) {
        this.registerMixin(extension as Mixin);
        return extension.name;
      }

      return extension;
    });

    return block;
  }

  /**
   * Registers an input plugin which draws notches in the renderer for different
   * types.
   */
  private registerInput(inputPlugin: InputPlugin) {
    // Append this input
    this.inputs.push(inputPlugin);

    // Re-Register the renderer
    Blockly.registry.register(
      Blockly.registry.Type.RENDERER,
      this.renderer.name,
      this.renderer.class(this.inputs),
      true,
    );
  }

  /**
   * Registers a block field implementation.
   */
  private registerField(fieldPlugin: FieldPlugin) {
    if (!Blockly.Extensions.isRegistered(fieldPlugin.name)) {
      if (fieldPlugin.field) {
        Blockly.fieldRegistry.register(fieldPlugin.name, fieldPlugin.field);
      } else {
        fieldPlugin.initialize?.();
      }
      this.registered.push(fieldPlugin);
    }
  }

  /**
   * Registers a block mutator.
   */
  private registerMutator(mutator: Mutator) {
    const name = mutator.name;
    if (!Blockly.Extensions.isRegistered(name)) {
      // Maintain the old mutator data and copy it so we don't
      // corrupt it in the future.
      const oldMutator: Mutator['mutator'] = mutator.mutator;
      const environment: Environment =
        this.environment || ({} as unknown as Environment);
      const newMutator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      } = {
        ...mutator.mutator,
      };

      // Add the 'environment' to the mutator so the mutators that
      // use this feature can access workspace data.
      newMutator.loadExtraState = function (this: BlockSvg, state: object) {
        this.environment = environment || ({} as unknown as Environment);
        oldMutator.loadExtraState?.bind(this as BlockSvg & Mutator<object>)(
          state,
        );
      };
      newMutator.saveExtraState ||= function () {};
      newMutator.getEnvironment = function (this: BlockSvg) {
        return environment;
      };
      newMutator.isWithinInlineWorkspace = function (this: BlockSvg) {
        return this.isWithinMainWorkspace() && environment.inline;
      };
      newMutator.isWithinEmbeddedWorkspace = function (this: BlockSvg) {
        return this.isWithinMainWorkspace() && environment.embedded;
      };
      newMutator.isWithinHiddenWorkspace = function (this: BlockSvg) {
        return environment.hiddenWorkspace === this.workspace;
      };
      newMutator.isWithinMainWorkspace = function (this: BlockSvg) {
        return environment.mainWorkspace === this.workspace;
      };

      Blockly.Extensions.registerMutator(name, newMutator);
    }
  }

  /**
   * Registers a block extension.
   */
  private registerExtension(extension: Extension) {
    const name = extension.name;
    const environment = this.environment || ({} as unknown as Environment);
    if (!Blockly.Extensions.isRegistered(name)) {
      Blockly.Extensions.register(name, function (this: BlockSvg) {
        const bound = extension.extension.bind(this, environment);
        bound();
      });
      this.extensions.push(extension);
    }
  }

  /**
   * Registers a block mixin.
   */
  private registerMixin(mixin: Mixin) {
    const name = mixin.name;
    if (!Blockly.Extensions.isRegistered(name)) {
      Blockly.Extensions.registerMixin(name, mixin.mixin);
      this.mixins.push(mixin);
    }
  }

  /**
   * Registers a global plugin which affects all future Blockly workspaces within
   * the current session.
   */
  private registerGlobal(globalPlugin: GlobalPlugin) {
    globalPlugin.initialize();
  }

  /**
   * Registers a plugin that occurs right after the 'injection' of Blockly.
   */
  private registerInject(
    injectPlugin: InjectPlugin,
    workspace: Blockly.WorkspaceSvg,
    inline: boolean,
  ) {
    if (injectPlugin.useWithInline || !inline) {
      new injectPlugin.plugin(workspace, this.theme);
    }
  }

  /**
   * Registers all plugins that can be registered from the given array.
   *
   * Some plugins require an instantiated workspace to modify. Only when that is given
   * will those plugins fully register.
   */
  registerAll(
    plugins: Plugin[],
    inline: boolean = false,
    workspace?: Blockly.WorkspaceSvg,
  ) {
    plugins.forEach(plugin => this.register(plugin, inline, workspace));
  }

  /**
   * Unregisters the given plugin if it was registered by this class.
   */
  unregister(plugin: Plugin) {
    const index = this.registered.indexOf(plugin);

    if (index === -1) {
      return;
    }

    // Remove it from the list
    this.registered.splice(index, 1);

    // Delist it, depending on the plugin type
    if (plugin.type === PluginType.Field) {
      this.unregisterField(plugin as FieldPlugin);
    } else if (plugin.type === PluginType.Global) {
      this.unregisterGlobal(plugin as GlobalPlugin);
    }
  }

  /**
   * Unregisters a previously registered field plugin.
   */
  private unregisterField(fieldPlugin: FieldPlugin) {
    // De-construct field plugins
    if (Blockly.Extensions.isRegistered(fieldPlugin.name)) {
      if (fieldPlugin.field) {
        Blockly.fieldRegistry.unregister(fieldPlugin.name);
      }
      fieldPlugin.uninitialize?.();
    }
  }

  /**
   * Unregisters a previously registered block mutator.
   */
  private unregisterMutator(mutator: Mutator) {
    if (Blockly.Extensions.isRegistered(mutator.name)) {
      Blockly.Extensions.unregister(mutator.name);
    }
  }

  /**
   * Unregisters a previously registered block extension.
   */
  private unregisterExtension(extension: Extension) {
    if (Blockly.Extensions.isRegistered(extension.name)) {
      Blockly.Extensions.unregister(extension.name);
    }
  }

  /**
   * Unregisters a previously registered block mixin.
   */
  private unregisterMixin(mixin: Mixin) {
    if (Blockly.Extensions.isRegistered(mixin.name)) {
      Blockly.Extensions.unregister(mixin.name);
    }
  }

  /**
   * Unregisters a previously registered global plugin.
   */
  private unregisterGlobal(globalPlugin: GlobalPlugin) {
    globalPlugin.uninitialize?.();
  }

  /**
   * Unregisters any plugins that were registered by the class.
   */
  unregisterAll() {
    // Unregister generic plugins
    this.registered.forEach(plugin => this.unregister(plugin));
    this.registered = [];

    // Unregister block extensions
    this.extensions.forEach(extension => this.unregisterExtension(extension));
    this.extensions = [];

    // Unregister block mixins
    this.mixins.forEach(mixin => this.unregisterMixin(mixin));
    this.mixins = [];

    // Unregister block mutators
    this.mutators.forEach(mutator => this.unregisterMutator(mutator));
    this.mutators = [];

    // Input plugins do not have to be registered... the renderer is the only
    // object that is registered in this case.
    this.inputs = [];
  }
}

export default Registry;
