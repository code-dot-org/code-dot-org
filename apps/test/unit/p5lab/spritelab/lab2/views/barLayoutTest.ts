import {readBarLayout} from '@cdo/apps/p5lab/spritelab/lab2/views/barLayout';

const layout = (params: Record<string, string> = {}) =>
  readBarLayout(name => params[name]);

describe('readBarLayout', () => {
  it('defaults to the scene dropdown in a workspace bar, the Preview bar, and the resource panel', () => {
    expect(layout()).toEqual({
      previewSide: 'left',
      barAtBottom: true,
      barInWorkspace: true,
      scenesInStrip: false,
      scenesInPreviewBar: false,
      scenesInAStrip: false,
      resourcesInBar: false,
      previewBarShown: true,
      jumboSide: 'right',
      editorsAtStart: false,
    });
  });

  it('brings back the earlier layout on request', () => {
    expect(layout({bar: 'top', 'preview-bar': 'false'})).toMatchObject({
      barAtBottom: false,
      previewBarShown: false,
    });
  });

  it('moves the resource buttons into a bar on request', () => {
    expect(layout({resources: 'bar'})).toMatchObject({resourcesInBar: true});
  });

  it('brings back the scene row under or above the workspace on request', () => {
    expect(layout({bar: 'bottom'})).toMatchObject({
      barInWorkspace: false,
      barAtBottom: true,
    });
    expect(layout({bar: 'top'})).toMatchObject({
      barInWorkspace: false,
      barAtBottom: false,
    });
  });

  it('puts the dropdown in the workspace strip on request', () => {
    expect(layout({bar: 'workspace-top'})).toMatchObject({
      scenesInStrip: true,
      scenesInAStrip: true,
      resourcesInBar: false,
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
