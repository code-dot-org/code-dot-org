import {
  cloneBuildLabProject,
  DEFAULT_PROJECT,
  normalizeBuildLabProject,
  parseBuildLabProject,
  serializeBuildLabProject,
} from '@cdo/apps/buildlab/project';

describe('Build Lab project sprite data', () => {
  it('persists sprite data in project sources', () => {
    const project = cloneBuildLabProject(DEFAULT_PROJECT);
    project.elements.push({
      data: {color: 'purple', height: '12'},
      id: 'flower',
      kind: 'sprite',
      label: 'Flower',
      screenId: 'screen1',
      x: 10,
      y: 10,
    });

    const parsedProject = parseBuildLabProject(
      serializeBuildLabProject(project)
    );

    expect(parsedProject.elements[0].data).toEqual({
      color: 'purple',
      height: '12',
    });
  });

  it('drops malformed sprite data during normalization', () => {
    const project = cloneBuildLabProject(DEFAULT_PROJECT);
    project.elements.push({
      data: {
        color: 'purple',
        constructor: 'ignored',
        height: 12,
        ' petal count ': '6',
        '': 'ignored',
      },
      id: 'flower',
      kind: 'sprite',
      label: 'Flower',
      screenId: 'screen1',
      x: 10,
      y: 10,
    });

    expect(normalizeBuildLabProject(project).elements[0].data).toEqual({
      color: 'purple',
      'petal count': '6',
    });
  });
});
