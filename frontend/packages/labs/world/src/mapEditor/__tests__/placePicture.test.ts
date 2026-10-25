// A Screen's or Map's picture, kept beside it (specs/SHELL_FINISH_PLAN.md,
// step 1).

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {projectFiles} from '../../runtime/projectFiles';
import {followPlaces, placePicture, withPlacePicture} from '../placePicture';

const project = (): MultiFileSource =>
  ({
    folders: {m: {id: 'm', name: 'maps', parentId: '0'}},
    files: {
      '1': {
        id: '1',
        name: 'main.map',
        language: 'map',
        contents: '{}',
        folderId: 'm',
      },
    },
    openFiles: [],
  }) as never;

const PICTURE = 'data:image/png;base64,AAAA';

describe('a place’s picture', () => {
  it('is written beside it, and read back', () => {
    const pictured = withPlacePicture(project(), '1', PICTURE);
    expect(placePicture(pictured, '1')).toBe(PICTURE);
    const file = Object.values(pictured.files).find(
      one => one.name === 'main.picture',
    );
    expect(file?.folderId).toBe('m');
  });

  it('is the same project when the picture has not changed', () => {
    const pictured = withPlacePicture(project(), '1', PICTURE);
    expect(withPlacePicture(pictured, '1', PICTURE)).toBe(pictured);
  });

  it('is no part of the program, so drawing one does not recompile', () => {
    const pictured = withPlacePicture(project(), '1', PICTURE);
    expect(Object.keys(projectFiles(pictured))).toEqual(['maps/main.map']);
  });

  it('goes where its place goes, and with it', () => {
    const pictured = withPlacePicture(project(), '1', PICTURE);
    const renamed = followPlaces(
      {
        ...pictured,
        files: {
          ...pictured.files,
          '1': {...pictured.files['1'], name: 'cave.map'},
        },
      },
      pictured,
    );
    expect(placePicture(renamed, '1')).toBe(PICTURE);
    expect(
      Object.values(renamed.files)
        .map(file => file.name)
        .sort(),
    ).toEqual(['cave.map', 'cave.picture']);

    const rest = {...pictured.files};
    delete rest['1'];
    const deleted = followPlaces({...pictured, files: rest}, pictured);
    expect(Object.keys(deleted.files)).toEqual([]);
  });
});
