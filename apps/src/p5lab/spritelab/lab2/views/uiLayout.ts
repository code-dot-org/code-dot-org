import {queryParams} from '@cdo/apps/code-studio/utils';

import {Editor} from './components/EditorSwitch';

/**
 * The lab's layout. The default puts the instructions in the resource
 * panel, the editors in the middle and the preview in its own column at
 * the right; `?ui=classic` brings back the earlier layout whole.
 */
export interface UiLayout {
  classic: boolean;
  /** The preview column's side. */
  previewSide: 'left' | 'right';
  /** The instructions ride in a guide under the preview, not the panel. */
  guideUnderPreview: boolean;
  /** The editor switch at the workspace strip's start, undo and redo at
      its end; else the other way about. */
  switchAtStart: boolean;
  /** The switch's editors, in order. */
  editors: Editor[];
}

/** A query parameter's value, by name. */
export type ParamReader = (name: string) => unknown;

export function readUiLayout(param: ParamReader = queryParams): UiLayout {
  if (param('ui') === 'classic') {
    return {
      classic: true,
      previewSide: 'left',
      guideUnderPreview: true,
      switchAtStart: false,
      editors: ['Code', 'World', 'Images'],
    };
  }
  return {
    classic: false,
    previewSide: 'right',
    guideUnderPreview: false,
    switchAtStart: true,
    editors: ['Images', 'World', 'Code'],
  };
}
