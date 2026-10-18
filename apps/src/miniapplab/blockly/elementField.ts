import * as BlocklyCore from 'blockly/core';

import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';

import {AppDesign, ElementType} from '../types';

export const ELEMENT_FIELD_TYPE = 'field_miniapp_element';

/** Which elements a dropdown offers: buttons, or the elements that show text. */
export type ElementKind = 'button' | 'text';

const textTypes: ElementType[] = ['label', 'input', 'output'];

// The design the dropdowns read.  The view keeps it current; the menus are
// generated when they open, so they always list the latest elements.
let currentDesign: AppDesign = [];

export function setDesignForBlocks(design: AppDesign) {
  currentDesign = design;
}

function menuOptions(kind: ElementKind): [string, string][] {
  const elements = currentDesign.filter(element =>
    kind === 'button'
      ? element.type === 'button'
      : textTypes.includes(element.type)
  );
  if (elements.length === 0) {
    return [[kind === 'button' ? 'no buttons yet' : 'no fields yet', '']];
  }
  return elements.map(element => [element.id, element.id]);
}

export default class ElementField extends CdoFieldDropdown {
  static fromJson(options: BlocklyCore.FieldDropdownFromJsonConfig) {
    const kind = (options as {kind?: ElementKind}).kind || 'text';
    return new ElementField(kind);
  }

  constructor(kind: ElementKind) {
    super(() => menuOptions(kind));
  }

  /** Any element id is a valid value, even one not in the menu: a renamed or
      deleted element should not blank the block. */
  doClassValidation_(newValue?: string) {
    return newValue ?? null;
  }

  /** Regenerate the menu and the shown text after the design changed. */
  refresh() {
    this.getOptions(false);
    this.doValueUpdate_(this.getValue() ?? '');
    this.forceRerender();
  }
}

function forEachElementField(
  workspace: BlocklyCore.Workspace,
  callback: (field: ElementField) => void
) {
  workspace.getAllBlocks(false).forEach(block => {
    block.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        if (field instanceof ElementField) {
          callback(field);
        }
      });
    });
  });
}

/** Bring every element dropdown in the workspace up to date with the design. */
export function refreshElementFields(workspace: BlocklyCore.Workspace) {
  forEachElementField(workspace, field => field.refresh());
}

/** After an element is renamed, point every block at the new id. */
export function renameElementInWorkspace(
  workspace: BlocklyCore.Workspace,
  oldId: string,
  newId: string
) {
  forEachElementField(workspace, field => {
    if (field.getValue() === oldId) {
      field.setValue(newId);
    }
  });
}
