'use client';

import useResizeObserver from '@react-hook/resize-observer';
import * as libraryBlocks from 'blockly/blocks';
import * as Blockly from 'blockly/core';
import {javascriptGenerator, JavascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import classNames from 'classnames';
import {createElement, useEffect, useRef} from 'react';
import type {ReactElement, MutableRefObject} from 'react';

import {
  disableOrphans,
  grayOutUndeletableBlocks,
} from '@blockly-workspace/events';
import FunctionBlockMixin from '@blockly-workspace/mixins/functionBlockMixin';
import {PluginType} from '@blockly-workspace/plugins';
import type {Plugin} from '@blockly-workspace/plugins';
import Registry from '@blockly-workspace/Registry';
import {positionBlocksOnWorkspace} from '@blockly-workspace/serialization';
import DefaultTheme from '@blockly-workspace/themes/default';
import type {
  BlockSvg,
  BlocklySerialization,
  BlockDefinition,
  Theme,
  Renderer,
  Environment,
} from '@blockly-workspace/types';

import moduleStyles from './blocklyWorkspace.module.scss';

export interface BlocklyOptions extends Blockly.BlocklyOptions {
  /** When specified, undeletable blocks are grayed out. */
  grayOutUndeletableBlocks?: boolean;
}

export interface BlocklyWorkspaceProps<T extends Environment & object> {
  /** A set of custom blocks to load within the Blockly instance. */
  blocks?: BlockDefinition[];
  /** Some options that will alter the typical Blockly behavior. */
  options?: BlocklyOptions;
  /** A set of blocks to load as the starting point for the workspace */
  startBlocks?: BlocklySerialization;
  /** A set of blocks to put into a single, simple toolbox within the workspace */
  toolboxBlocks?: Blockly.utils.toolbox.ToolboxInfo;
  /** The blockly renderer to use. */
  renderer?: Renderer;
  /** The blockly theme to use. */
  theme?: Theme;
  /** Whether or not to render this workspace as inline, useful for documentation */
  inline?: boolean;
  /**
   * Whether or not the workspace is considered embedded.
   *
   * An embedded workspace is one that is not meant to be modified, but rather
   * shown as an example or preview.
   */
  embedded?: boolean;
  /** Whether or not this is a hidden workspace. */
  hidden?: boolean;
  /** A callback when the Blockly environment is loaded into the container */
  onInject?: () => void;
  /** A callback for when anything in the workspace updates */
  onChange?: (event: Blockly.Events.Abstract) => void;
  /** A set of plugins to install to this workspace */
  plugins?: Plugin[];
  /** The info to pass along to extensions */
  environment?: T;
  /**
   * A MutableRef that can hold a reference to the workspace itself.
   *
   * This will be certainly set when onInject is called.
   */
  workspaceRef?: MutableRefObject<Blockly.Workspace | null>;
}

// Ensure these are still compiled into module initialization.
const _ = libraryBlocks;
const __ = En;

/**
 * Represents a Blockly workspace.
 */
function BlocklyWorkspace<T extends Environment & object = Environment>({
  blocks,
  options,
  startBlocks,
  toolboxBlocks,
  renderer,
  theme,
  inline,
  embedded,
  hidden,
  onInject,
  onChange,
  plugins,
  environment,
  workspaceRef,
}: BlocklyWorkspaceProps<T>): ReactElement {
  const anchor = useRef<HTMLDivElement | HTMLSpanElement | null>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  theme ||= DefaultTheme;

  // Create a new plugin registry to keep track of the current blockly
  // registered plugins for this session.
  const registry = useRef<Registry<T>>(
    new Registry<T>(environment, theme, renderer),
  );

  // Register any new custom blocks
  useEffect(() => {
    console.log(
      'BLOCKLY_INIT environment via renderer',
      blocks,
      startBlocks,
      renderer,
      theme,
      environment,
      toolboxBlocks,
    );
    Blockly.setLocale(En as unknown as {[key: string]: string});

    // Make sure we have the default blocks
    (blocks || []).forEach(blockDefinition => {
      // Register (and modify the block definition to just reference mixins
      // and extensions by name) any block fields, extensions, etc.
      const formedBlockDefinition =
        registry.current.registerFromBlockDefinition(blockDefinition);

      Blockly.common.defineBlocksWithJsonArray([formedBlockDefinition]);

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
  }, [blocks]);

  useEffect(() => {
    console.log(
      'BLOCKLY_INIT environment via anchor',
      blocks,
      startBlocks,
      renderer,
      theme,
      environment,
    );

    // Determine the location of the workspace
    // For inline workspaces (like those within markdown instructions) create
    // the container to build it offscreen before copying it to its final
    // location.
    const container = inline ? document.createElement('div') : anchor.current;

    console.log(container, workspace.current);
    if (!container) {
      return;
    }

    // Add mixins
    try {
      Blockly.Extensions.registerMixin(
        'function_block_mixin',
        FunctionBlockMixin,
      );
    } catch (err) {
      if (err instanceof Error) {
        if (!err.toString().includes('already registered')) {
          throw err;
        }
      }
    }

    // Add plugins
    registry.current.registerAll(plugins || []);

    // Create the workspace within the container
    workspace.current = Blockly.inject(container, {
      renderer: renderer?.name || 'geras',
      theme: theme?.instance || 'classic',
      toolbox: toolboxBlocks,
      trashcan: false,
      media: '/blockly/media/',
      ...options,
      ...(inline || hidden
        ? {
            readOnly: true,
            scrollbars: false,
            media: '', // Don't need media assets
          }
        : {}),
    });

    if (workspaceRef) {
      workspaceRef.current = workspace.current;
    }

    // Add injection plugins
    registry.current.registerAll(
      (plugins || []).filter(plugin => plugin.type === PluginType.Inject),
      inline,
      workspace.current,
    );

    // Retain the main workspace in the environment, if it exists
    if (!inline && environment) {
      if (hidden) {
        environment.hiddenWorkspace = workspace.current || undefined;
      } else {
        environment.mainWorkspace = workspace.current || undefined;
        environment.embedded = !!embedded;
      }
    } else if (inline && environment && !hidden) {
      environment.inline = true;
    }

    // Level implementation callback for custom behaviors per-level type
    if (onInject) {
      onInject();
    }

    // Apply the custom styles to our custom elements
    if (options?.grayOutUndeletableBlocks) {
      workspace.current.addChangeListener(grayOutUndeletableBlocks);
    }

    // JSON serialization
    if (startBlocks) {
      Blockly.serialization.workspaces.load(startBlocks, workspace.current);
      for (const block of workspace.current.getTopBlocks()) {
        console.log('JSON SERIAL', block);
      }
    }

    // Reposition blocks if this is a full workspace
    if (!inline) {
      positionBlocksOnWorkspace(workspace.current);
    }

    if (inline) {
      // Move top block to corner (hopefully there is only one)
      for (const block of workspace.current.getTopBlocks()) {
        block.moveTo(new Blockly.utils.Coordinate(0, 0));
      }

      // Copy over SVG rendered blocks to the span in our anchor
      document.body.appendChild(container);
      if (workspace.current) {
        Blockly.svgResize(workspace.current);
      }

      const svg = container.querySelector('svg')?.cloneNode(true) as SVGElement;
      if (svg && anchor.current) {
        svg.style.background = 'none';
        svg.style.position = 'relative';
        svg.style.display = 'inline-block';
        svg.style.border = 'none';
        svg.querySelector('.blocklyMainBackground')?.remove();
        anchor.current.innerHTML = '';
        anchor.current.appendChild(svg);

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
          anchor.current.classList.add(blocklyClassName);
        }
      }
    }

    // Add custom events
    // Add the orphan disabler which disables blocks that aren't connected to top
    // blocks or procedures, etc.
    workspace.current.addChangeListener(disableOrphans);

    // Add main change listener
    if (onChange) {
      workspace.current.addChangeListener(onChange);
    }

    // Deconstruct the blockly instance when the component is unmounted
    return () => {
      registry.current.unregisterAll();

      // Dispose of the workspace
      workspace.current?.dispose();
    };
  }, []);

  // Resize the Blockly workspace when the container changes size
  if (!inline) {
    useResizeObserver(anchor, () => {
      if (workspace.current) {
        Blockly.svgResize(workspace.current);
      }
    });
  }

  return createElement(inline ? 'span' : 'div', {
    ref: anchor,
    className: classNames([
      moduleStyles.blocklyWorkspace,
      ...(hidden ? [moduleStyles.hiddenWorkspace] : []),
    ]),
  });
}

export default BlocklyWorkspace;
