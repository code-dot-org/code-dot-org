import {isLevelConfigPreview} from '@cdo/apps/lab2/levelEditors/levelConfig/levelPreview';

/** Focuses the element, so a screen reader announces it, except in the
    level edit page's preview, which starts over on every edit and would
    take focus from the field being typed in. */
export function focusOnArrival(element: HTMLElement | null): void {
  if (element && !isLevelConfigPreview()) {
    element.focus();
  }
}
