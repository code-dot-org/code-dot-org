import * as Blockly from 'blockly/core';
import {javascriptGenerator, JavascriptGenerator} from 'blockly/javascript';
import EventEmitter from 'events';
import type TypedEmitter from 'typed-emitter';
import type {EventMap} from 'typed-emitter';

import type {Plugin} from './plugins';
import {PluginType} from './plugins';
import Registry from './Registry';
import DefaultTheme from './themes/default';
import type {
  BlockDefinition,
  BlockSvg,
  Environment,
  Renderer,
  Theme,
} from './types';
import type Agent from './Agent';

export const DriverEvent = {
  /** The workspace was injected into the container */
  Injected: 'injected',
  /** A workspace was removed from the environment */
  Removed: 'removed',
  /** A callback for when anything in the workspace updates */
  BlocklyEvent: 'blockly-event',
} as const;

interface DriverEvents extends EventMap {
  [DriverEvent.Injected]: (workspace: Blockly.WorkspaceSvg) => void;
  [DriverEvent.Removed]: (workspace: Blockly.WorkspaceSvg) => void;
  [DriverEvent.BlocklyEvent]: (event: Blockly.Events.Abstract) => void;
}

class Driver<
  T extends Environment = Environment,
> extends (EventEmitter as unknown as new () => TypedEmitter<DriverEvents>) {
  // An instance of our Blockly registry
  protected _registry: Registry<T>;
  // Reference to the set of plugins that require injection before they can be initialized
  protected _injectPlugins: Plugin[];
  // All of the current blocks that are defined and available
  protected _blocks: BlockDefinition[];
  // A reference to the Blockly environment for this instance of the workspace
  protected _environment: T;
  // All workspaces inside our environment
  protected _agents: Agent<T>[];
  // All 'main' workspaces
  protected _mainAgents: Agent<T>[];
  // All hidden workspace agents
  protected _hiddenAgents: Agent<T>[];
  // All inline (embedded) workspace agents
  protected _inlineAgents: Agent<T>[];
  // The renderer to use
  protected _renderer: Renderer;
  // The theme to use
  protected _theme: Theme;

  /**
   * Constructs a driver to power a Blockly Workspace in the given container.
   */
  constructor(
    environment: T,
    renderer: Renderer,
    theme: Theme,
    plugins?: Plugin[],
  ) {
    super();

    this._renderer = renderer;
    this._theme = theme;
    this._registry = new Registry<T>(environment, theme, renderer);
    this._injectPlugins = [];
    this._blocks = [];
    this._environment = environment;
    this._agents = [];
    this._mainAgents = [];
    this._hiddenAgents = [];
    this._inlineAgents = [];

    this.register(plugins || []);
  }

  register(plugins: Plugin[]) {
    this._injectPlugins = plugins.filter(
      plugin => plugin.type === PluginType.Inject,
    );
    this._registry.registerAll(plugins);
  }

  protected registerBlocks() {
    this._blocks.forEach(blockDefinition => {
      // Register (and modify the block definition to just reference mixins
      // and extensions by name) any block fields, extensions, etc.
      const formedBlockDefinition =
        this._registry.registerFromBlockDefinition(blockDefinition);

      if (Blockly.Blocks[blockDefinition.type]) {
        delete Blockly.Blocks[blockDefinition.type];
      }
      Blockly.common.defineBlocksWithJsonArray([formedBlockDefinition]);

      const environment = this._environment;

      // Bind the given block definition's generator to the overall generator
      javascriptGenerator.forBlock[blockDefinition.type] = function (
        block: Blockly.Block,
        _generator: JavascriptGenerator,
      ) {
        return (
          blockDefinition.generator?.javascript?.(
            block as BlockSvg,
            javascriptGenerator,
            environment,
          ) || ''
        );
      };
    });
  }

  /**
   * Retrieves a reference to the currently used Renderer.
   */
  get renderer(): Renderer {
    return this._renderer;
  }

  /**
   * Retrieves a reference to the currently used Theme.
   */
  get theme(): Theme {
    return this._theme;
  }

  /**
   * Updates the theme.
   */
  set theme(theme: Theme | undefined) {
    this._theme = theme || DefaultTheme;
  }

  /**
   * Updates the theme.
   */
  setTheme(theme: Theme | undefined) {
    this._theme = theme || DefaultTheme;
  }

  /**
   * Registers the given set of blocks.
   *
   * If you give this method another list, it will replace the list of blocks currently in use.
   */
  set blocks(blocks: BlockDefinition[]) {
    console.log('setting blocks to', blocks, 'from', this._blocks);
    this._blocks = blocks;
    this.registerBlocks();
  }

  setBlocks(blocks: BlockDefinition[]) {
    this.blocks = blocks;
  }

  /**
   * Returns a reference to the list of blocks currently registered.
   */
  get blocks() {
    return this._blocks;
  }

  /**
   * Registers a particular workspace Agent.
   */
  initialize(agent: Agent<T>) {
    this._agents.push(agent);

    if (agent.inline) {
      this._inlineAgents.push(agent);
    }

    if (agent.hidden) {
      this._hiddenAgents.push(agent);
    }

    if (!agent.inline && !agent.hidden) {
      this._mainAgents.push(agent);
    }
  }

  /**
   * Unloads a workspace agent.
   */
  uninitialize(agent: Agent<T>) {
    let index = this._agents.indexOf(agent);
    if (index > -1) {
      this._agents.splice(index, 1);
    }

    index = this._mainAgents.indexOf(agent);
    if (index > -1) {
      this._mainAgents.splice(index, 1);
    }

    index = this._hiddenAgents.indexOf(agent);
    if (index > -1) {
      this._hiddenAgents.splice(index, 1);
    }

    index = this._inlineAgents.indexOf(agent);
    if (index > -1) {
      this._inlineAgents.splice(index, 1);
    }

    if (agent.workspace) {
      this.emit(DriverEvent.Removed, agent.workspace);
    }
  }

  /**
   * An upcall when an Agent is injected.
   */
  onInject(agent: Agent<T>) {
    if (agent.workspace) {
      if (this._mainAgents[0] === agent) {
        // The main workspace
        this._environment.mainWorkspace = agent.workspace;

        // Register inject plugins
        this._registry.registerAll(
          this._injectPlugins,
          agent.inline,
          agent.workspace,
        );
      } else if (agent.hidden) {
        this._environment.hiddenWorkspaces.push(agent.workspace);
      } else if (agent.inline) {
        this._environment.embeddedWorkspaces.push(agent.workspace);
      }

      // Emit general event
      this.emit(DriverEvent.Injected, agent.workspace);
    }
  }

  /**
   * Removes the workspace and deregisters the different plugins and blocks.
   */
  deconstruct() {
    this.blocks = [];
    this._injectPlugins = [];
    this._registry.unregisterAll();
  }
}

export default Driver;
