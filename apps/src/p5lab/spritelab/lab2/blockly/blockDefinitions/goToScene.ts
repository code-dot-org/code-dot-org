import * as BlocklyCore from 'blockly/core';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';
import {getStore} from '@cdo/apps/redux';

export const GO_TO_SCENE_BLOCK_TYPE = 'spritelab2_goToScene';
export const FIELD_SCENE_DROPDOWN_TYPE = 'field_spritelab2_scene';

// Dropdown options: [friendly name, scene id]. The id is the saved value.
// Reads the redux mirror so the menu stays current as scenes are added.
function sceneMenuOptions(): [string, string][] {
  const scenes = getStore().getState().spriteLab2?.scenes || [];
  if (scenes.length === 0) {
    return [['no scenes', '']];
  }
  return scenes.map((s: {id: string; name: string}) => [s.name, s.id]);
}

// Scene id → the picture the scene picker shows for it, when it has one.
function sceneThumbnails(): Map<string, string> {
  const scenes = getStore().getState().spriteLab2?.scenes || [];
  return new Map(
    scenes
      .filter((s: {thumbnail?: string}) => s.thumbnail)
      .map((s: {id: string; thumbnail?: string}) => [s.id, s.thumbnail!])
  );
}

// Thumbnail sizes: on the block face, and in the open menu.
const FACE_THUMB_PX = 20;
const FACE_THUMB_GAP_PX = 4;
const MENU_THUMB_PX = 28;
// The checkmark's slot, matching Blockly's own glyph width and the negative
// margin its stylesheet gives the selected item's glyph.
const MENU_CHECK_PX = 16;
const MENU_CHECK_INSET_PX = -24;

/**
 * Registered field type (see setup.ts) so the JSON definition gets a dropdown
 * with dynamic options. Shows each scene's picture beside its name: on the
 * block, an image slotted in ahead of the text (the text and arrow shift
 * right); in the menu, an image prepended to each item. Blockly's dropdown
 * options are text or image, never both, hence the post-render work.
 */
export class SceneDropdown extends BlocklyCore.FieldDropdown {
  private thumbElement: SVGImageElement | null = null;

  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new SceneDropdown(sceneMenuOptions);
  }

  override initView() {
    super.initView();
    if (this.fieldGroup_) {
      this.thumbElement = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.IMAGE,
        {
          width: FACE_THUMB_PX,
          height: FACE_THUMB_PX,
          preserveAspectRatio: 'xMidYMid slice',
        },
        this.fieldGroup_
      );
    }
  }

  protected override render_() {
    super.render_();
    const thumb = this.thumbElement;
    const group = this.fieldGroup_;
    if (!thumb || !group) {
      return;
    }
    const url = sceneThumbnails().get(this.getValue() ?? '');
    const dx = url ? FACE_THUMB_PX + FACE_THUMB_GAP_PX : 0;
    thumb.style.display = url ? '' : 'none';
    if (url) {
      thumb.setAttributeNS(BlocklyCore.utils.dom.XLINK_NS, 'xlink:href', url);
      thumb.setAttribute('href', url);
      thumb.setAttribute(
        'x',
        String(this.getConstants()?.FIELD_BORDER_RECT_X_PADDING ?? 5)
      );
      thumb.setAttribute('y', String((this.size_.height - FACE_THUMB_PX) / 2));
    }
    // The text and the arrow (everything but the border and the picture)
    // make room for the picture. Set, not accumulated: render_ runs often.
    Array.from(group.children).forEach(child => {
      if (child !== this.borderRect_ && child !== thumb) {
        child.setAttribute('transform', `translate(${dx}, 0)`);
      }
    });
    this.size_.width += dx;
    this.positionBorderRect_();
  }

  protected override showEditor_(e?: MouseEvent) {
    super.showEditor_(e);
    const thumbnails = sceneThumbnails();
    const options = this.getOptions();
    // Blockly exposes no menu item API; items render in option order.
    const items =
      BlocklyCore.DropDownDiv.getContentDiv().querySelectorAll(
        '.blocklyMenuItem'
      );
    let decorated = false;
    items.forEach((item, index) => {
      const url = thumbnails.get(options[index]?.[1] as string);
      const content = item.querySelector<HTMLElement>(
        '.blocklyMenuItemContent'
      );
      if (!url || !content) {
        return;
      }
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.style.width = `${MENU_THUMB_PX}px`;
      img.style.height = `${MENU_THUMB_PX}px`;
      img.style.objectFit = 'cover';
      img.style.borderRadius = '2px';
      img.style.marginRight = '8px';
      content.style.display = 'inline-flex';
      content.style.alignItems = 'center';
      content.style.whiteSpace = 'nowrap';
      // After the checkmark. Blockly lays the glyph out inline, pulled into
      // the item's left padding by a negative margin on the selected item
      // only; giving every item the same box keeps the pictures in a
      // column whether or not they are checked.
      const checkmark = content.querySelector<HTMLElement>(
        '.blocklyMenuItemCheckbox'
      );
      if (checkmark) {
        checkmark.style.display = 'inline-block';
        checkmark.style.flex = `0 0 ${MENU_CHECK_PX}px`;
        checkmark.style.width = `${MENU_CHECK_PX}px`;
        checkmark.style.marginLeft = `${MENU_CHECK_INSET_PX}px`;
        checkmark.style.marginRight = '4px';
      }
      content.insertBefore(img, checkmark?.nextSibling ?? content.firstChild);
      decorated = true;
    });
    // The panel was sized before the pictures went in: Blockly pins the
    // content div to the menu's measured height, so re-measure and reposition.
    if (decorated) {
      const content = BlocklyCore.DropDownDiv.getContentDiv();
      const menu = content.querySelector<HTMLElement>('.blocklyMenu');
      if (menu) {
        content.style.height = `${menu.scrollHeight}px`;
      }
      BlocklyCore.DropDownDiv.repositionForWindowResize();
    }
  }
}

/** Re-render every scene dropdown, on the workspace and in the flyout, so
    a picture that landed after a block rendered shows up. */
export function refreshSceneDropdowns(): void {
  const workspace =
    BlocklyCore.getMainWorkspace() as BlocklyCore.WorkspaceSvg | null;
  if (!workspace) {
    return;
  }
  const flyouts = [workspace.getFlyout(), workspace.getToolbox()?.getFlyout()];
  [workspace, ...flyouts.map(flyout => flyout?.getWorkspace())].forEach(ws =>
    ws?.getAllBlocks(false).forEach(block =>
      block.inputList.forEach(input =>
        input.fieldRow.forEach(field => {
          if (field instanceof SceneDropdown) {
            field.forceRerender();
          }
        })
      )
    )
  );
}

const definition: BlockJson = {
  type: GO_TO_SCENE_BLOCK_TYPE,
  message0: 'go to scene %1',
  args0: [{type: FIELD_SCENE_DROPDOWN_TYPE, name: 'SCENE'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Stop this scene and start the chosen one. Its "when run" code runs ' +
    'after a quick fade from black.',
};

const generator: GeneratorFunction = block =>
  `goToScene(${JSON.stringify(block.getFieldValue('SCENE'))});\n`;

export default {definition, generator};
