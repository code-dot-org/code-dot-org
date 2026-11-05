import {
  hidesPreviewHeader,
  hidesViewModeToggle,
  startingViewMode,
} from '@cdo/apps/weblab2/showcase';
import {ViewMode, Weblab2LevelProperties} from '@cdo/apps/weblab2/types';

const level = (extra: Partial<Weblab2LevelProperties> = {}) =>
  ({
    id: 1,
    name: 'web',
    appName: 'weblab2',
    ...extra,
  } as Weblab2LevelProperties);

describe('showcase', () => {
  it('hides the preview header for a widget2 or showcase level', () => {
    expect(hidesPreviewHeader(level())).toBe(false);
    expect(hidesPreviewHeader(level({widget2: {id: 'w'}}))).toBe(true);
    expect(hidesPreviewHeader(level({showcase: true}))).toBe(true);
  });

  it('opens a showcase in preview mode, any other level in its own mode or split', () => {
    expect(startingViewMode(level())).toBe(ViewMode.SPLIT);
    expect(startingViewMode(level({initialViewMode: ViewMode.CODE}))).toBe(
      ViewMode.CODE
    );
    expect(
      startingViewMode(level({showcase: true, initialViewMode: ViewMode.CODE}))
    ).toBe(ViewMode.PREVIEW);
  });

  it('leaves the view mode toggle out of a showcase', () => {
    expect(hidesViewModeToggle(level())).toBe(false);
    expect(hidesViewModeToggle(level({showcase: true}))).toBe(true);
  });
});
