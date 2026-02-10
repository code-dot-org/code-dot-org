import * as Blockly from 'blockly/core';
import EventEmitter from 'events';
import type TypedEmitter from 'typed-emitter';
import type {EventMap} from 'typed-emitter';

import type Driver from './Driver';
import {positionBlocksOnWorkspace} from './serialization';
import type {Toolbox} from './toolbox';
import {buildToolbox} from './toolbox';
import type {Environment, BlocklySerialization} from './types';

export const AgentEvent = {
  /** The workspace was injected into the environment */
  Injected: 'injected',
  /** A callback for when anything in the workspace updates */
  BlocklyEvent: 'blockly-event',
} as const;

interface AgentEvents extends EventMap {
  [AgentEvent.Injected]: (workspace: Blockly.WorkspaceSvg) => void;
  [AgentEvent.BlocklyEvent]: (event: Blockly.Events.Abstract) => void;
}

class Agent<
  T extends Environment = Environment,
> extends (EventEmitter as unknown as new () => TypedEmitter<AgentEvents>) {
  // An instance of our overall driver
  protected _driver: Driver<T>;
  // The Blockly options to use when injecting the workspace
  protected _options: Blockly.BlocklyOptions;
  // Whether or not the workspace is intended to be inlined on the page or not
  protected _inline: boolean;
  // Whether or not the workspace is intended to be embedded (readonly) on the page or not
  protected _embedded: boolean;
  // Whether or not the workspace is hidden from view
  protected _hidden: boolean;
  // A reference to the Blockly Workspace
  protected _workspace?: Blockly.WorkspaceSvg;
  // A reference to the document element that contains the injected Workspace
  protected _container?: HTMLDivElement | HTMLSpanElement;
  // Holds the blocks/categories in the toolbox
  protected _toolbox?: Toolbox;

  /**
   * Constructs a driver to power a Blockly Workspace in the given container.
   */
  constructor(
    driver: Driver<T>,
    options: Blockly.BlocklyOptions,
    inline: boolean,
    hidden: boolean,
    embedded: boolean,
    container?: HTMLDivElement | HTMLSpanElement,
  ) {
    super();

    this._driver = driver;
    this._options = options;
    this._inline = inline;
    this._hidden = hidden;
    this._embedded = embedded;
    this._container = container;

    this.driver.initialize(this);
  }

  get driver(): Driver<T> {
    return this._driver;
  }

  /**
   * Whether or not the current Workspace is meant to be hidden from view.
   */
  get hidden(): boolean {
    return this._hidden;
  }

  /**
   * Whether or not the current Workspace is meant to be embedded within the view.
   */
  get embedded(): boolean {
    return this._embedded;
  }

  /**
   * Whether or not the current Workspace is meant to be inlined.
   */
  get inline(): boolean {
    return this._inline;
  }

  /**
   * Retrieve a potential reference to the Blockly Workspace.
   */
  get workspace(): Blockly.WorkspaceSvg | undefined {
    return this._workspace;
  }

  /**
   * Retrieve a reference to the current container element.
   */
  get container(): HTMLDivElement | HTMLSpanElement | undefined {
    return this._container;
  }

  set container(newContainer: HTMLDivElement | HTMLSpanElement) {
    const oldContainer = this._container;

    // Retain the reference to the container
    this._container = newContainer;

    if (oldContainer) {
      // Move the workspace to the new container
      this.move();
    } else {
      // Inject the workspace into the container
      this.inject();
    }
  }

  setContainer(newContainer: HTMLDivElement | HTMLSpanElement) {
    this.container = newContainer;
  }

  getToolbox(): Toolbox | undefined {
    return this._toolbox;
  }

  setToolbox(toolbox: Toolbox | undefined) {
    this._toolbox = toolbox;
  }

  /**
   * Injects a new Blockly Workspace into the current container.
   */
  protected inject() {
    if (!this._container) {
      throw new Error(
        'Blockly inject attempted to be called before establishing a container',
      );
    }

    if (this._workspace) {
      throw new Error('Blockly inject attempted a second time');
    }

    const container = this._inline
      ? document.createElement('div')
      : this._container;

    // Inject!
    this._workspace = Blockly.inject(container, {
      ...this._options,
      renderer: this.driver.renderer.name,
      theme: this.driver.theme.instance,
      toolbox: this._toolbox ? buildToolbox(this._toolbox) : undefined,
    });

    Blockly.svgResize(this._workspace);
    this.driver.onInject(this);
    this.emit(AgentEvent.Injected, this._workspace);

    // Attach the event listener as an upcall for our own event
    this._workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      this.emit(AgentEvent.BlocklyEvent, event);
    });
  }

  /**
   * Moves the current Workspace to be inside a different containing element.
   *
   * This generally means re-injecting the Blockly Workspace.
   */
  protected move() {}

  load(blocks: BlocklySerialization) {
    if (!this._workspace) {
      throw new Error(
        'Attempted to serialize blocks before workspace was injected',
      );
    }

    Blockly.serialization.workspaces.load(blocks, this._workspace);

    // Reposition blocks if this is a full workspace
    if (!this._inline) {
      positionBlocksOnWorkspace(this._workspace);
    }

    // If this is an inline workspace, fit it to the container
    if (this._inline) {
      // Move top block to corner (hopefully there is only one)
      for (const block of this._workspace.getTopBlocks()) {
        block.moveTo(new Blockly.utils.Coordinate(0, 0));
      }

      const container = this._workspace.getInjectionDiv();
      if (!container) {
        return;
      }

      // Copy over SVG rendered blocks to the span in our anchor
      document.body.appendChild(container);
      if (this._workspace) {
        Blockly.svgResize(this._workspace);
      }

      const svg = container.querySelector('svg')?.cloneNode(true) as SVGElement;
      if (svg && this._container) {
        svg.style.background = 'none';
        svg.style.position = 'relative';
        svg.style.display = 'inline-block';
        svg.style.border = 'none';
        svg.querySelector('.blocklyMainBackground')?.remove();
        this._container.innerHTML = '';
        this._container.appendChild(svg);

        // Fix width and height (after it renders)
        window.requestAnimationFrame(() => {
          const size = (svg
            .querySelector('.blocklyWorkspace')
            ?.getClientRects() || [])[0] || {
            width: 30,
            height: 30,
          };
          svg.style.width = size.width + 'px';
          svg.style.height = size.height + 'px';
        });

        // Copy classes over
        for (const blocklyClassName of Array.from(
          (container?.querySelector('svg')?.parentNode as HTMLElement | null)
            ?.classList || [],
        )) {
          this._container.classList.add(blocklyClassName);
        }
      }
    } else {
      if (this._workspace) {
        Blockly.svgResize(this._workspace);
      }
    }
  }

  /**
   * Removes the workspace.
   */
  deconstruct() {
    // Remove from the Driver's awareness
    this.driver.uninitialize(this);

    // Deconstruct the workspace
    this._workspace?.dispose();
    this._workspace = undefined;
  }
}

export default Agent;
