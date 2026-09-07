import * as Blockly from 'blockly/core';

export interface ToolboxBaseCategory {
  /**
   * The name of the category.
   *
   * If used as the flyout, then it is potentially the header or label for
   * the flyout.
   */
  name: string;
  /** Styles */
  cssconfig?: {
    container: string;
    row: string;
    label: string;
  };
}

export interface ToolboxDynamicCategory extends ToolboxBaseCategory {
  /**
   * Unique string identifying this type of dynamic category.
   */
  key: string;
  /**
   * Supply dynamic blocks when the flyout is opened
   */
  onLoad?: (
    workspace: Blockly.WorkspaceSvg,
  ) => Blockly.utils.toolbox.FlyoutItemInfoArray;
  /** Optionally, a set of blocks that always exist in the flyout. */
  blocks?: (string | Blockly.utils.toolbox.FlyoutItemInfo)[];
}

export interface ToolboxStaticCategory extends ToolboxBaseCategory {
  /** The static blocks inside the flyout. */
  blocks: (string | Blockly.utils.toolbox.FlyoutItemInfo)[];
  key?: never;
  onLoad?: never;
}

/**
 * A row in the toolbox that is not a category — a separator, or anything else
 * Blockly's toolbox-item registry knows how to draw.
 *
 * Passed through to Blockly untouched, `kind` and all, where a category is
 * assembled from its parts. That is the distinction: a category is described
 * here and built there, and this is already a Blockly item and only needs to
 * be let through. Anything registered under `registry.Type.TOOLBOX_ITEM` is
 * therefore usable without this file being taught about it.
 */
export interface ToolboxItem {
  kind: string;
  name?: never;
  blocks?: never;
  [key: string]: unknown;
}

export type ToolboxCategory = ToolboxDynamicCategory | ToolboxStaticCategory;

export type ToolboxFlyout = ToolboxStaticCategory & {
  cssconfig?: never;
};

export type Toolbox =
  // Classic Blockly toolbox definition
  | Blockly.utils.toolbox.ToolboxInfo
  // Our simplified categories, and whatever else divides them
  | (ToolboxCategory | ToolboxItem)[]
  // Flyout is just a single category
  | ToolboxFlyout;

/**
 * A level-defined toolbox: category name -> the block types that category
 * contains. The names may match existing categories or be bespoke; the blocks
 * are drawn from the shared block pool. See {@link toolboxFromCategoryBlocks}.
 */
export type CategoryBlocks = {
  [categoryName: string]: readonly string[] | undefined;
};
