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

export type ToolboxCategory = ToolboxDynamicCategory | ToolboxStaticCategory;

export type Toolbox =
  // Classic Blockly toolbox definition
  | Blockly.utils.toolbox.ToolboxInfo
  // Our simplified categories
  | ToolboxCategory[]
  // Flyout is just a single category
  | (ToolboxStaticCategory & {
      cssconfig?: never;
    });
