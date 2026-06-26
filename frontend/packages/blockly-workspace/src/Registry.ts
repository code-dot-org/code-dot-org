/**
 * This maintains the plugin registry for our plugin extensions.
 *
 * This will interact with the Blockly registry and, when necessary, maintain our
 * own bookkeeping for plugins which are defined by our own interfaces.
 */

import * as Blockly from 'blockly/core';
import {
  blocks as procedureBlocks,
  unregisterProcedureBlocks /*, registerProcedureSerializer*/,
} from '@blockly/block-shareable-procedures';

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
import type {Toolbox} from './toolbox';
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

/** Block-definition keys that may hold positional argument arrays. */
const ARG_KEYS = ['args0', 'args1', 'args2', 'args3'] as const;

/**
 * Produces a copy of a block definition that the registry can freely rewrite —
 * replacing inline plugin, field, extension and mutator references with their
 * registered string names — without ever mutating the caller's definition.
 *
 * The copy is deep enough to cover every property the registry reassigns: the
 * top-level object, the positional argument arrays and their entries, and the
 * extensions/mixins arrays. References to members that must not be cloned
 * (generator functions, field/plugin classes, mutator and extension objects)
 * are deliberately shared.
 */
function cloneBlockDefinition<D extends BlockDefinition | OldBlockDefinition>(
  definition: D,
): D {
  const source = definition as unknown as Record<string, unknown>;
  const clone: Record<string, unknown> = {...source};

  for (const key of ARG_KEYS) {
    const args = source[key];
    if (Array.isArray(args)) {
      clone[key] = args.map(arg => ({...(arg as object)}));
    }
  }

  const {extensions, mixins} = definition as Partial<BlockDefinition>;
  if (extensions) {
    clone.extensions = [...extensions];
  }
  if (mixins) {
    clone.mixins = [...mixins];
  }

  return clone as unknown as D;
}

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
  /**
   * Live inject-plugin instances, grouped by the workspace they were created
   * for, so they can be disposed when that workspace is torn down.
   */
  private injectInstances: Map<
    Blockly.WorkspaceSvg,
    Array<{dispose?: () => void}>
  > = new Map();
  /** The Blockly environment data */
  private environment?: T;
  /** Whether or not the procedure extensions were registered. */
  private proceduresRegistered: boolean = false;

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

    if (!this.renderer?.name) {
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
   * Registers the procedure extensions.
   */
  registerProcedures() {
    if (!this.proceduresRegistered) {
      this.proceduresRegistered = true;
      unregisterProcedureBlocks();

      // Register the procedure blocks
      Blockly.common.defineBlocks(procedureBlocks);
    }
  }

  registerToolbox(toolbox: Toolbox, workspace: Blockly.WorkspaceSvg) {
    // Only dynamic categories exist in Category list toolboxes
    // That is, ones that are defined as an array
    if (Array.isArray(toolbox)) {
      toolbox.forEach(({blocks, onLoad, key}) => {
        if (onLoad && key) {
          const staticBlocks = (blocks || []).map(
            (type: string | Blockly.utils.toolbox.FlyoutItemInfo) => ({
              ...(typeof type === 'string' ? {kind: 'block', type} : type),
            }),
          );

          workspace.registerToolboxCategoryCallback(
            key,
            (workspace: Blockly.WorkspaceSvg) => [
              ...staticBlocks,
              ...onLoad(workspace),
            ],
          );
        }
      });
    }
  }

  /**
   * Registers any unknown plugins referenced within a block definition and
   * returns a rewritten copy of that definition in which the plugin, field,
   * extension and mutator references have been replaced by their registered
   * string names (the form Blockly itself expects). The caller's definition is
   * left untouched.
   */
  registerFromBlockDefinition(
    definition: BlockDefinition | OldBlockDefinition,
  ): (typeof Blockly.Blocks)[string] {
    // Work entirely on our own copy: the routine below rewrites plugin, field,
    // extension and mutator references to their registered names, and the
    // caller's definition (which Driver retains and re-registers) must not see
    // any of that.
    const block: (typeof Blockly.Blocks)[string] =
      cloneBlockDefinition(definition);
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
    (ARG_KEYS as readonly (keyof BlockDefinition)[]).forEach(key => {
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
    });

    // Register mutator if we have never seen it before and it exists
    if (blockDefinition.mutator) {
      if (typeof blockDefinition.mutator !== 'string') {
        const name = blockDefinition.mutator.name;
        // If the mutator did not define itself as not wanting to be
        // registered (wrapping an existing stock mutator)
        if (!blockDefinition.mutator.noRegister) {
          this.registerMutator(blockDefinition.mutator);
        }
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
    // Fields live in the FIELD registry, whether registered via a field class
    // or by an initialize() that registers one itself; that — not the unrelated
    // Extensions registry — is what tells us whether it is already present.
    if (
      !Blockly.registry.hasItem(Blockly.registry.Type.FIELD, fieldPlugin.name)
    ) {
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
      this.mutators.push(mutator);
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
    // Track it so unregister()/unregisterAll() can run its uninitialize().
    this.registered.push(globalPlugin);
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
      // Retain the instance so its dispose() (if any) can run at teardown.
      const instance = new injectPlugin.plugin(workspace, this.theme) as {
        dispose?: () => void;
      };
      const instances = this.injectInstances.get(workspace) ?? [];
      instances.push(instance);
      this.injectInstances.set(workspace, instances);
    }
  }

  /**
   * Disposes the inject-plugin instances created for the given workspace,
   * invoking each instance's dispose() if it has one. Called as the workspace
   * is torn down, before Blockly disposes it, so plugins clean up against a
   * still-live workspace.
   */
  disposeInject(workspace: Blockly.WorkspaceSvg) {
    const instances = this.injectInstances.get(workspace);
    if (!instances) {
      return;
    }
    this.injectInstances.delete(workspace);
    instances.forEach(instance => instance.dispose?.());
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
    // De-construct field plugins (mirror the FIELD-registry guard used to register).
    if (
      Blockly.registry.hasItem(Blockly.registry.Type.FIELD, fieldPlugin.name)
    ) {
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
    // Unregister generic plugins. Iterate a copy: unregister() splices
    // this.registered, which would skip entries if we walked it directly.
    [...this.registered].forEach(plugin => this.unregister(plugin));
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

    // Dispose any inject-plugin instances still tracked (workspaces that were
    // not individually torn down via disposeInject).
    this.injectInstances.forEach(instances =>
      instances.forEach(instance => instance.dispose?.()),
    );
    this.injectInstances.clear();
  }
}

export default Registry;
