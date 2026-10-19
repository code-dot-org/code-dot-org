import {readBarLayout} from '@cdo/apps/p5lab/spritelab/lab2/views/barLayout';

const layout = (params: Record<string, string> = {}) =>
  readBarLayout(name => params[name]);

describe('readBarLayout', () => {
  it('defaults to the scene row under the workspace, with the Preview bar and the resource buttons in the row', () => {
    expect(layout()).toEqual({
      previewSide: 'left',
      barAtBottom: true,
      barInWorkspace: false,
      scenesInStrip: false,
      scenesInPreviewBar: false,
      scenesInAStrip: false,
      resourcesInBar: true,
      previewBarShown: true,
      jumboSide: 'right',
      editorsAtStart: false,
    });
  });

  it('brings back the earlier layout on request', () => {
    expect(
      layout({bar: 'top', 'preview-bar': 'false', resources: 'panel'})
    ).toMatchObject({
      barAtBottom: false,
      resourcesInBar: false,
      previewBarShown: false,
    });
  });

  it('puts the scene dropdown in a workspace bar', () => {
    expect(layout({bar: 'workspace'})).toMatchObject({
      barInWorkspace: true,
      scenesInAStrip: false,
      resourcesInBar: true,
    });
  });

  it('keeps the resource panel when the dropdown stands in a strip, unless asked for the bar', () => {
    expect(layout({bar: 'workspace-top'})).toMatchObject({
      scenesInStrip: true,
      scenesInAStrip: true,
      resourcesInBar: false,
    });
    expect(layout({bar: 'workspace-top', resources: 'bar'})).toMatchObject({
      resourcesInBar: true,
    });
  });

  it('shows the Preview bar whenever the dropdown stands in it', () => {
    expect(layout({bar: 'preview-top', 'preview-bar': 'false'})).toMatchObject({
      scenesInPreviewBar: true,
      previewBarShown: true,
    });
  });

  it('reads the sides', () => {
    expect(
      layout({preview: 'right', jumbo: 'left', editors: 'stripleft'})
    ).toMatchObject({
      previewSide: 'right',
      jumboSide: 'left',
      editorsAtStart: true,
    });
  });
});
