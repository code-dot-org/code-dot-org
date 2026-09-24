import {getExportStyleProperties} from '@cdo/apps/sketchlab/reactFlow/utils/getExportStyleProperties';

describe('getExportStyleProperties', () => {
  it('keeps standard properties and drops custom ones', () => {
    jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue([
        'color',
        '--brand-orange-50',
        'font-size',
        '--mui-shadows-10',
      ] as unknown as CSSStyleDeclaration);

    expect(getExportStyleProperties()).toEqual(['color', 'font-size']);
  });

  // html-to-image memoizes the first list it is handed, so ours has to be stable.
  it('returns the same list every time', () => {
    expect(getExportStyleProperties()).toBe(getExportStyleProperties());
  });
});
