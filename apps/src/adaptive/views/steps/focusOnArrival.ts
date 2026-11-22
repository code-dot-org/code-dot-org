import {isLevelConfigPreview} from '@cdo/apps/lab2/levelEditors/levelConfig/levelPreview';

/** Moves focus to a step's heading when the step appears, so a screen
    reader announces it. Not in the level edit page's preview, which starts
    over on every edit and would take focus from the field being typed in. */
export function focusOnArrival(element: HTMLElement | null): void {
  if (element && !isLevelConfigPreview()) {
    element.focus();
  }
}
