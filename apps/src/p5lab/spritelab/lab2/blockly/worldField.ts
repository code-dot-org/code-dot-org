import * as BlocklyCore from 'blockly/core';

import {drawWorldThumbnail, WORLD_THUMBNAIL_PX} from '../worldThumbnail';

export const FIELD_WORLD_TYPE = 'field_spritelab2_world';

/** Set by the view while ?world-block=true is on: draws the open scene's
    world small and opens the world editor. */
interface WorldFieldHost {
  thumbnail: () => string;
  openEditor: () => void;
}

let host: WorldFieldHost | null = null;

export function setWorldFieldHost(next: WorldFieldHost | null): void {
  host = next;
}

/**
 * The set world block's picture of the open scene's world. Clicking it opens
 * the world editor. The world is the scene's, not the block's, so the field
 * saves nothing.
 */
export class WorldField extends BlocklyCore.FieldImage {
  constructor() {
    super(
      host?.thumbnail() || drawWorldThumbnail(undefined, () => {}),
      WORLD_THUMBNAIL_PX,
      WORLD_THUMBNAIL_PX,
      'World'
    );
    this.setOnClickHandler(() => host?.openEditor());
  }

  static fromJson(): WorldField {
    return new WorldField();
  }

  /** Draw the world again, after it or its pictures change. */
  refresh(): void {
    const src = host?.thumbnail();
    if (!src) {
      return;
    }
    BlocklyCore.Events.disable();
    try {
      this.setValue(src);
    } finally {
      BlocklyCore.Events.enable();
    }
  }
}

/** Redraw the picture on every set world block in `workspace` and in its
    open toolbox flyout. */
export function refreshWorldFields(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined
): void {
  const flyout = workspace?.getFlyout()?.getWorkspace();
  [workspace, flyout].forEach(each => refreshIn(each));
}

function refreshIn(workspace: BlocklyCore.WorkspaceSvg | null | undefined) {
  workspace?.getAllBlocks(false).forEach(block =>
    block.inputList.forEach(input =>
      input.fieldRow.forEach(field => {
        if (field instanceof WorldField) {
          field.refresh();
        }
      })
    )
  );
}
