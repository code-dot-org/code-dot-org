import {getEmptyProject} from '@codebridge/utils/getEmptyProject';

describe('getEmptyProject', () => {
  it('should return an empty project object', () => {
    const project = getEmptyProject();
    expect(project).toEqual({files: {}, folders: {}});
    expect(project.files).toBeInstanceOf(Object);
    expect(project.folders).toBeInstanceOf(Object);
    expect(Object.keys(project.files).length).toBe(0);
    expect(Object.keys(project.folders).length).toBe(0);
  });
});
