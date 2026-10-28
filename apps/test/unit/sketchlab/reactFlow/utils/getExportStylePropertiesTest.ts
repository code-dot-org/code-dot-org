import {getExportStyleProperties} from '@cdo/apps/sketchlab/reactFlow/utils/getExportStyleProperties';

const documentProperties = (...names: string[]) =>
  jest
    .spyOn(window, 'getComputedStyle')
    .mockReturnValue(names as unknown as CSSStyleDeclaration);

describe('getExportStyleProperties', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps standard properties and drops custom ones', () => {
    documentProperties(
      'color',
      '--brand-orange-50',
      'font-size',
      '--mui-shadows-10'
    );

    expect(getExportStyleProperties()).toEqual(['color', 'font-size']);
  });
});
