// The lab's blocks and toolbox in the student's language. The lab's own JSON
// blocks translate as they are made (setup.ts); the level's blockText blocks
// and the init() blocks are retranslated here.

import * as BlocklyCore from 'blockly/core';

import * as blockUtils from '@cdo/apps/block_utils';
import {ExtendedWorkspaceSvg} from '@cdo/apps/blockly/types';
import {
  getBlockDefinitionsForUpdatedLocale,
  localizeInitBlocks,
} from '@cdo/apps/blockly/utils';
import {refreshWorkspace} from '@cdo/apps/blockly/utils/workspace/refresh';
import localization from '@cdo/apps/localization';
import {
  isEnglishLocale,
  translateFilled,
} from '@cdo/apps/localization/templates';

import {localizeLevelText} from './localizeLevelText';

const CATEGORY_LABELS = ['blockly-block', 'blockly-category'];

/** Retranslates the level's blockText blocks and every init() block. */
export function localizeBlockDefinitions(): void {
  blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: getBlockDefinitionsForUpdatedLocale(localization.rtl),
    customInputTypes: Blockly.SourceCustomInputTypes,
  });
  localizeInitBlocks();
}

type ToolboxItem = {name?: string; contents?: ToolboxItem[]};

function localizedToolboxItem(item: ToolboxItem): ToolboxItem {
  return {
    ...item,
    ...(item.name && {
      name: translateFilled(item.name, {}, CATEGORY_LABELS),
    }),
    ...(item.contents && {contents: item.contents.map(localizedToolboxItem)}),
  };
}

/**
 * The toolbox as shown: a copy with its category names, and the words in
 * its blocks, in the current language. The toolbox given stays in English.
 */
export function shownToolbox(
  toolbox: BlocklyCore.utils.toolbox.ToolboxDefinition
): BlocklyCore.utils.toolbox.ToolboxDefinition {
  if (isEnglishLocale() || typeof toolbox === 'string') {
    return toolbox;
  }
  return localizeLevelText(
    localizedToolboxItem(toolbox as ToolboxItem)
  ) as BlocklyCore.utils.toolbox.ToolboxDefinition;
}

/**
 * Redraws a workspace in the current language. `beforeReload` runs just
 * before its blocks are reloaded, so the owner can count the reload as a
 * load rather than an edit.
 */
export function relocalizeWorkspace(
  workspace: BlocklyCore.WorkspaceSvg,
  toolbox: BlocklyCore.utils.toolbox.ToolboxDefinition | undefined,
  beforeReload: () => void
): void {
  localizeBlockDefinitions();
  if (toolbox && workspace.rendered) {
    workspace.updateToolbox(shownToolbox(toolbox));
  }
  beforeReload();
  refreshWorkspace(workspace as ExtendedWorkspaceSvg);
}

/** The student is mid-gesture or has an editor open. */
export function isWorkspaceBusy(workspace: BlocklyCore.WorkspaceSvg): boolean {
  return (
    workspace.isDragging() ||
    BlocklyCore.Gesture.inProgress() ||
    BlocklyCore.WidgetDiv.isVisible() ||
    BlocklyCore.DropDownDiv.isVisible()
  );
}

// How long to wait before retrying a redraw that found the student busy.
export const RELOCALIZE_RETRY_MS = 250;

interface LocaleChangeOptions {
  getWorkspace: () => BlocklyCore.WorkspaceSvg | null;
  getToolbox: () => BlocklyCore.utils.toolbox.ToolboxDefinition | undefined;
  /** Runs just before the workspace's blocks are reloaded. */
  beforeReload: () => void;
}

/**
 * A handler for localization 'change' that redraws the workspace in the new
 * language. Reloading disposes every block, including one being dragged, so
 * the redraw waits until the student is idle. English to English redraws
 * nothing: no translation applies.
 */
export function createLocaleChangeHandler({
  getWorkspace,
  getToolbox,
  beforeReload,
}: LocaleChangeOptions): {handle: () => void; dispose: () => void} {
  let shownLocale = localization.locale;
  let retry: number | undefined;
  const handle = () => {
    window.clearTimeout(retry);
    retry = undefined;
    const workspace = getWorkspace();
    const locale = localization.locale;
    if (
      !workspace ||
      (isEnglishLocale(locale) && isEnglishLocale(shownLocale))
    ) {
      return;
    }
    if (isWorkspaceBusy(workspace)) {
      retry = window.setTimeout(handle, RELOCALIZE_RETRY_MS);
      return;
    }
    shownLocale = locale;
    relocalizeWorkspace(workspace, getToolbox(), beforeReload);
  };
  return {handle, dispose: () => window.clearTimeout(retry)};
}
