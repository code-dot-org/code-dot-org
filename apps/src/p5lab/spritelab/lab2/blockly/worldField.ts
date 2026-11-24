import * as BlocklyCore from 'blockly/core';

import {createEmptyWorld, World} from '../world';
import {drawWorldThumbnail, WORLD_THUMBNAIL_PX} from '../worldThumbnail';

export const FIELD_WORLD_TYPE = 'field_spritelab2_world';

interface WorldFieldHost {
  /** Cells per side for a block whose world is still empty. */
  sceneSize: () => number;
  openEditor: (field: WorldField) => void;
}

let host: WorldFieldHost | null = null;

export function setWorldFieldHost(next: WorldFieldHost | null): void {
  host = next;
}

/** The world a set world block's field value holds: its grid as JSON, or ''
    for a block nothing has been drawn on. */
export function worldFromFieldValue(value: unknown): World | undefined {
  if (typeof value !== 'string' || !value) {
    return undefined;
  }
  try {
    const world = JSON.parse(value) as World;
    return Array.isArray(world?.grid) ? world : undefined;
  } catch {
    return undefined;
  }
}

/** The set world block's own world, shown as a small picture of its grid. */
export class WorldField extends BlocklyCore.FieldImage {
  override SERIALIZABLE = true;

  constructor(value = '') {
    super(value, WORLD_THUMBNAIL_PX, WORLD_THUMBNAIL_PX, 'World');
    this.setOnClickHandler(field => {
      // The toolbox's copy has no world of its own to edit.
      if (!field.getSourceBlock()?.isInFlyout) {
        host?.openEditor(field as WorldField);
      }
    });
  }

  static fromJson(): WorldField {
    return new WorldField();
  }

  getWorld(): World | undefined {
    return worldFromFieldValue(this.getValue());
  }

  setWorld(world: World): void {
    this.setValue(JSON.stringify(world));
  }

  override initView(): void {
    super.initView();
    this.redraw();
  }

  // The value is the world, not an image source: draw the picture from it.
  protected override doValueUpdate_(newValue: string): void {
    this.value_ = newValue;
    this.redraw();
  }

  redraw(): void {
    if (!this.imageElement) {
      return;
    }
    const world = this.getWorld() ?? createEmptyWorld(host?.sceneSize());
    this.imageElement.setAttributeNS(
      BlocklyCore.utils.dom.XLINK_NS,
      'xlink:href',
      drawWorldThumbnail(world, () => this.redraw())
    );
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
          field.redraw();
        }
      })
    )
  );
}
