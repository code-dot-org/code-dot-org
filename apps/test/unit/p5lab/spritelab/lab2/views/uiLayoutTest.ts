import {readUiLayout} from '@cdo/apps/p5lab/spritelab/lab2/views/uiLayout';

const layout = (params: Record<string, string> = {}) =>
  readUiLayout(name => params[name]);

describe('readUiLayout', () => {
  it('defaults to the panel, the editors and the preview at the right', () => {
    expect(layout()).toEqual({
      classic: false,
      previewSide: 'right',
      guideUnderPreview: false,
      switchAtStart: true,
      editors: ['Images', 'World', 'Code'],
    });
  });

  it('brings back the earlier layout whole on request', () => {
    expect(layout({ui: 'classic'})).toEqual({
      classic: true,
      previewSide: 'left',
      guideUnderPreview: true,
      switchAtStart: false,
      editors: ['Code', 'World', 'Images'],
    });
  });

  it('ignores the retired switches', () => {
    expect(layout({bar: 'top', preview: 'right', resources: 'bar'})).toEqual(
      layout()
    );
  });
});
