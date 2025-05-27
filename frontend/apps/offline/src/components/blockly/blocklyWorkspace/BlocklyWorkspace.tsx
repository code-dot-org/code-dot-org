import useResizeObserver from '@react-hook/resize-observer';
import * as libraryBlocks from 'blockly/blocks';
import * as Blockly from 'blockly/core';
import {javascriptGenerator, JavascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import classnames from 'classnames';
import React, {createElement, useEffect, useRef, useContext} from 'react';

import BlocklyContext from '@/contexts/BlocklyContext';

import {disableOrphans, grayOutUndeletableBlocks} from '../events';
import FunctionBlockMixin from '../mixins/functionBlockMixin';
import {PluginType} from '../plugins';
import type {Plugin, GlobalPlugin, InjectPlugin} from '../plugins';
import {
  forciblyInsertTopBlock,
  positionBlocksOnWorkspace,
} from '../serialization';
import DefaultTheme from '../themes/default';
import type {
  BlockDefinition,
  Theme,
  Renderer,
  SimpleBlockDefinition,
  ComplexBlockDefinition,
} from '../types';

import moduleStyles from './blockly.module.scss';

export interface BlocklyOptions extends Blockly.BlocklyOptions {
  /** When specified, this ensures that the given block exists and is the top block. */
  forceInsertTopBlock?: string;
  /** When specified, undeletable blocks are grayed out. */
  grayOutUndeletableBlocks?: boolean;
}

export interface BlocklyWorkspaceProps {
  /** A set of custom blocks to load within the Blockly instance. */
  customBlocks?: BlockDefinition[];
  /** A set of specialized options that is passed to block creators. */
  data?: object;
  /** Some options that will alter the typical Blockly behavior. */
  options?: BlocklyOptions;
  /** A set of blocks to load as the starting point for the workspace */
  startBlocks?: string;
  /** A set of blocks to put into a single, simple toolbox within the workspace */
  toolboxBlocks?: string;
  /** The blockly renderer to use. */
  renderer?: Renderer;
  /** The blockly theme to use. */
  theme?: Theme;
  /** Whether or not to render this workspace as inline, useful for documentation */
  inline?: boolean;
  /** Whether or not this is a hidden workspace. */
  hidden?: boolean;
  /** A callback when the Blockly environment is loaded into the container */
  onInject?: () => void;
  /** A set of plugins to install to this workspace */
  plugins?: Plugin[];
}

// Ensure these are still compiled into module initialization.
const _ = libraryBlocks;
const __ = En;

/**
 * Represents a Blockly workspace.
 */
const BlocklyWorkspace: React.FunctionComponent<BlocklyWorkspaceProps> = ({
  customBlocks,
  data,
  options,
  startBlocks,
  toolboxBlocks,
  renderer,
  theme,
  inline,
  hidden,
  onInject,
  plugins,
}) => {
  const anchor = useRef<HTMLDivElement | HTMLSpanElement | null>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  // Pull from the provider, if it exists there and we haven't specified it
  // ourselves.
  const {
    customBlocks: storedCustomBlocks,
    renderer: storedRenderer,
    plugins: storedPlugins,
    theme: storedTheme,
  } = useContext(BlocklyContext);
  customBlocks ||= storedCustomBlocks;
  renderer ||= storedRenderer;
  plugins ||= storedPlugins;
  theme ||= storedTheme || DefaultTheme;
  console.log('BLOCKLY_INIT', customBlocks, startBlocks, renderer, theme);

  // Register renderer, if needed
  useEffect(() => {
    if (renderer) {
      if (!renderer.name) {
        throw new Error(
          "Renderer needs to have a string for a 'name' field that uniquely identifies the renderer",
        );
      } else {
        // Add input plugins
        const inputPlugins = (plugins || []).filter(
          plugin => plugin.type === PluginType.Input,
        );

        console.log('REGISTER RENDERER', inputPlugins);
        Blockly.registry.register(
          Blockly.registry.Type.RENDERER,
          renderer.name,
          renderer.class(inputPlugins),
          true,
        );
      }
    }
  }, [renderer, plugins]);

  // Register any new custom blocks
  useEffect(() => {
    Blockly.setLocale(En as unknown as {[key: string]: string});

    // Make sure we have the default blocks
    (customBlocks || []).forEach(blockDefinition => {
      if ((blockDefinition as ComplexBlockDefinition).message0) {
        const complexBlockDefinition = {
          ...blockDefinition,
        } as ComplexBlockDefinition;

        // Register mutator if we have never seen it before and it exists
        if (complexBlockDefinition.mutator) {
          const name = blockDefinition.mutator.name;
          if (!Blockly.Extensions.isRegistered(name)) {
            Blockly.Extensions.registerMutator(name, blockDefinition.mutator);
          }
          complexBlockDefinition.mutator = name;
        }

        // Register extensions if we have never seen it before and it exists
        complexBlockDefinition.extensions = [
          ...(complexBlockDefinition.extensions || []),
        ].map(extension => {
          if (extension?.name && extension?.extension) {
            const name = extension.name;
            if (!Blockly.Extensions.isRegistered(name)) {
              Blockly.Extensions.register(name, extension.extension);
            }
            return name;
          }

          if (extension?.name && extension?.mixin) {
            const name = extension.name;
            if (!Blockly.Extensions.isRegistered(name)) {
              Blockly.Extensions.registerMixin(name, extension.mixin);
            }
            return name;
          }

          return extension;
        });

        Blockly.common.defineBlocksWithJsonArray([complexBlockDefinition]);

        javascriptGenerator.forBlock[complexBlockDefinition.type] = function (
          _block: Blockly.Block,
          _generator: JavascriptGenerator,
        ) {
          if (complexBlockDefinition.generator) {
            return complexBlockDefinition.generator(
              _block,
              javascriptGenerator,
              {},
            );
          }

          return '';
        };
      } else {
        const simpleBlockDefinition = blockDefinition as SimpleBlockDefinition;
        Blockly.Blocks[blockDefinition.type] ||= {
          helpUrl: simpleBlockDefinition.helpUrl,
          init: function () {
            this.setStyle(simpleBlockDefinition.style || 'default');
            if (simpleBlockDefinition.title) {
              const input = this.appendEndRowInput();
              input.appendField(simpleBlockDefinition.title);
            } else if (simpleBlockDefinition.titleImage) {
              const input = this.appendEndRowInput();
              input.appendField(
                new Blockly.FieldImage(
                  simpleBlockDefinition.titleImage,
                  32,
                  32,
                ),
              );
            }
            if (simpleBlockDefinition.previousStatement) {
              this.setPreviousStatement(
                simpleBlockDefinition.previousStatement,
              );
            }
            if (simpleBlockDefinition.nextStatement) {
              this.setNextStatement(simpleBlockDefinition.nextStatement);
            }
            this.setTooltip(simpleBlockDefinition.tooltip);
            if (simpleBlockDefinition.init) {
              simpleBlockDefinition.init(this, data);
            }
          },
        };

        javascriptGenerator.forBlock[simpleBlockDefinition.type] = function (
          _block: Blockly.Block,
          _generator: JavascriptGenerator,
        ) {
          return `${simpleBlockDefinition.functionName}('block_id_${this.id}');\n`;
        };
      }
    });
  }, [customBlocks]);

  useEffect(() => {
    // Determine the location of the workspace
    // For inline workspaces (like those within markdown instructions) create
    // the container to build it offscreen before copying it to its final
    // location.
    const container = inline ? document.createElement('div') : anchor.current;

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

    const mixinPlugins = (plugins || []).filter(
      plugin => plugin.type === PluginType.Mixin,
    );

    // Add block mixins
    for (const plugin of mixinPlugins) {
      const mixinPlugin = plugin as unknown as MixinPlugin;
      try {
        Blockly.Extensions.registerMixin(mixinPlugin.name, mixinPlugin.mixin);
      } catch (err) {
        if (err instanceof Error) {
          if (!err.toString().includes('already registered')) {
            throw err;
          }
        }
      }

      console.log('MIXIN', Blockly.Blocks);
      for (const definition of Object.values(Blockly.Blocks)) {
        for (const [key, prop] of Object.entries(mixinPlugin.mixin)) {
          definition[key] ||= prop;
        }
      }
    }

    const globalPlugins = (plugins || []).filter(
      plugin => plugin.type === PluginType.Global,
    );

    // Add global plugins
    for (const plugin of globalPlugins) {
      const globalPlugin = plugin as unknown as GlobalPlugin;
      if (globalPlugin.useWithInline || !inline) {
        globalPlugin.initialize();
      }
    }

    console.log('BLOCKS', Blockly, Blockly.Blocks);
    const originalAppend = Blockly.serialization.blocks.append;
    console.log('block serializing switching out', originalAppend);
    /*
    Blockly.serialization.blocks.append = function (json, workspace) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extra = (json as any).extraState;
      console.log('ok. block serializing...', json, JSON.stringify(extra));
      const block = originalAppend.call(this, json, workspace);

      console.log('ok. block serializing', block, json, extra);
      if (block?.data?.uservisible === false) {
        block.setVisible?.(false);
      }

      return block;
    };
    const originalSave = Blockly.serialization.blocks.save;
    Blockly.serialization.blocks.save = function (
      block,
      state,
      doFullSerialization,
    ) {
      originalSave(block, state, doFullSerialization);
      state.extraState = {
        ...(state.extraState || {}),
        ...(block.data || {}),
      };
    };
    */

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

    // Add injection plugins
    for (const plugin of (plugins || []).filter(
      plugin => plugin.type === PluginType.Inject,
    )) {
      const injectPlugin = plugin as InjectPlugin;
      if (injectPlugin.useWithInline || !inline) {
        injectPlugin.instantiate(workspace.current, theme);
      }
    }

    // Apply the custom styles to our custom elements
    console.log('THEME', theme, Blockly.Theme);

    // Massage start blocks to at least a valid empty document
    if (
      startBlocks === undefined ||
      (typeof startBlocks === 'string' && startBlocks.trim() === '')
    ) {
      startBlocks = '<xml></xml>';
    }

    if (options?.grayOutUndeletableBlocks) {
      workspace.current.addChangeListener(grayOutUndeletableBlocks);
    }

    // For strings, these are XML starting blocks
    if (typeof startBlocks === 'string') {
      const parser = new DOMParser();
      const xmlDoc = parser
        .parseFromString(startBlocks, 'text/xml')
        ?.querySelector(':root');

      if (xmlDoc) {
        if (options?.forceInsertTopBlock) {
          forciblyInsertTopBlock(xmlDoc, options.forceInsertTopBlock);
        }

        Blockly.Xml.clearWorkspaceAndLoadFromXml(xmlDoc, workspace.current);
        const blockJson = Blockly.serialization.workspaces.save(
          workspace.current,
        );
        Blockly.serialization.workspaces.load(blockJson, workspace.current);
      }
    } else if (typeof startBlocks === 'object') {
      // JSON serialization
      console.log('serialization', startBlocks);
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
          console.log(blocklyClassName);
          anchor.current.classList.add(blocklyClassName);
        }
      }
    }

    // Add custom events
    // Add the orphan disabler which disables blocks that aren't connected to top
    // blocks or procedures, etc.
    workspace.current.addChangeListener(disableOrphans);

    // Level implementation callback for custom behaviors per-level type
    if (onInject) {
      onInject();
    }

    // Deconstruct the blockly instance when the component is unmounted
    return () => {
      // De-construct global plugins
      for (const plugin of globalPlugins) {
        const globalPlugin = plugin as unknown as GlobalPlugin;
        if (globalPlugin.useWithInline || !inline) {
          globalPlugin.uninitialize?.();
        }
      }

      // De-register block mixins
      for (const plugin of mixinPlugins) {
        const mixinPlugin = plugin as unknown as MixinPlugin;
        Blockly.Extensions.unregister(mixinPlugin.name);

        // Remove the extension from any block definitions since it no longer exists
      }

      // Un-rewire the json serialization append routine
      if (originalAppend) {
        Blockly.serialization.blocks.append = originalAppend;
      }

      // Dispose of the workspace
      workspace.current?.dispose();
    };
  }, [anchor.current, renderer]);

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
    className: classnames([
      moduleStyles.blocklyWorkspace,
      ...(hidden ? [moduleStyles.hiddenWorkspace] : []),
    ]),
  });
};

export default BlocklyWorkspace;
