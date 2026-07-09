import * as BlocklyCore from 'blockly/core';

import {getStore} from '@cdo/apps/redux';

export const FIELD_EXTERNAL_SCENE_DROPDOWN_TYPE =
  'field_spritelab2_external_scene';

// The view registers a handler that re-fetches section scenes into redux, so
// the dropdown can show classmates' scenes added while the lab is open.
let externalSceneRefreshHandler: (() => Promise<void>) | null = null;
export function setExternalSceneRefreshHandler(
  handler: (() => Promise<void>) | null
): void {
  externalSceneRefreshHandler = handler;
}

// Options: [label, "<channel>:<sceneId>"]. Populated from the section-scenes
// API into redux before blocks load, and refreshed on every open.
function externalSceneMenuOptions(): [string, string][] {
  const options = getStore().getState().spriteLab2?.externalScenes || [];
  if (options.length === 0) {
    return [['no scenes shared with you', '']];
  }
  return options.map((o: {key: string; label: string}) => [o.label, o.key]);
}

// A dropdown whose options come from other students' live projects: refresh
// the list from the server on every open. The menu render is deferred briefly
// (capped, so a slow API degrades to the last-known list instead of blocking
// the click).
export class ExternalSceneDropdown extends BlocklyCore.FieldDropdown {
  private refreshPending_ = false;

  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new ExternalSceneDropdown(externalSceneMenuOptions);
  }

  protected showEditor_(e?: MouseEvent) {
    if (!externalSceneRefreshHandler) {
      super.showEditor_(e);
      return;
    }
    // Deferring the open creates races a synchronous editor never sees:
    // a second click while the refresh is pending, or another widget taking
    // ephemeral focus in the window. Dedupe, and when the moment comes,
    // yield rather than fight over focus.
    if (this.refreshPending_) {
      return;
    }
    this.refreshPending_ = true;
    const open = () => {
      this.refreshPending_ = false;
      if (BlocklyCore.DropDownDiv.isVisible()) {
        // Something else (possibly our own earlier open) owns the stage.
        return;
      }
      try {
        super.showEditor_(e);
      } catch (err) {
        console.warn('external scene dropdown could not open', err);
      }
    };
    const timeout = new Promise<void>(resolve => setTimeout(resolve, 1200));
    Promise.race([externalSceneRefreshHandler().catch(() => {}), timeout]).then(
      open,
      open
    );
  }
}
