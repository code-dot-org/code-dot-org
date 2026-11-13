import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {
  deleteFilesOnceUnused,
  uploadedFileUrls,
} from '@cdo/apps/p5lab/spritelab/lab2/startOverFiles';
import {
  RuntimeAnimationList,
  Scene,
} from '@cdo/apps/p5lab/spritelab/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';

const CHANNEL = 'abc';
const HERO = `/v3/assets/${CHANNEL}/hero.png`;
const SCENE_PICTURE = `/v3/assets/${CHANNEL}/scene-thumb-1.png`;

const animations = (urls: (string | undefined)[]): RuntimeAnimationList =>
  ({
    orderedKeys: urls.map((_, i) => `k${i}`),
    propsByKey: Object.fromEntries(
      urls.map((sourceUrl, i) => [`k${i}`, {name: `image${i}`, sourceUrl}])
    ),
  } as unknown as RuntimeAnimationList);

describe('uploadedFileUrls', () => {
  it("lists the project's own image files and scene pictures, once each", () => {
    const scenes: Scene[] = [
      {
        id: '1',
        name: 'Scene 1',
        thumbnail: {url: SCENE_PICTURE, fingerprint: 'f'},
      },
      {id: '2', name: 'Scene 2'},
    ];
    expect(
      uploadedFileUrls(CHANNEL, animations([HERO, HERO, undefined]), scenes)
    ).toEqual([HERO, SCENE_PICTURE]);
  });

  it("leaves out library images, starter images and another project's files", () => {
    const list = animations([
      'https://studio.code.org/api/v1/animation-library/spritelab/cat.png',
      '/level_starter_assets/some-level/uuid/x.png',
      '/v3/assets/other/hero.png',
    ]);
    expect(uploadedFileUrls(CHANNEL, list, [])).toEqual([]);
  });

  it('lists nothing where there is no project', () => {
    expect(uploadedFileUrls(undefined, animations([HERO]), [])).toEqual([]);
  });
});

describe('deleteFilesOnceUnused', () => {
  let deleted: string[];
  let saved: unknown;
  let listeners: (() => void)[];
  let projectManager: ProjectManager;
  const saveSucceeds = () => listeners.forEach(listener => listener());

  beforeEach(() => {
    deleted = [];
    listeners = [];
    saved = {source: {animations: {a: {sourceUrl: HERO}}}};
    jest.spyOn(HttpClient, 'delete').mockImplementation(async url => {
      deleted.push(String(url));
      return new Response();
    });
    projectManager = {
      addSaveSuccessListener: (listener: () => void) =>
        listeners.push(listener),
      getLastSource: () => saved,
    } as unknown as ProjectManager;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes a file once a save lands that no longer names it', () => {
    deleteFilesOnceUnused(projectManager, CHANNEL, [HERO, SCENE_PICTURE]);
    expect(deleted).toEqual([]);

    // A save from before the reset: the project still names the hero.
    saveSucceeds();
    expect(deleted).toEqual([SCENE_PICTURE]);

    saved = {source: {}};
    saveSucceeds();
    expect(deleted).toEqual([SCENE_PICTURE, HERO]);
  });

  it('deletes each file once', () => {
    saved = {source: {}};
    deleteFilesOnceUnused(projectManager, CHANNEL, [HERO]);
    saveSucceeds();
    saveSucceeds();
    expect(deleted).toEqual([HERO]);
  });

  it('deletes nothing when no save succeeds', () => {
    saved = {source: {}};
    deleteFilesOnceUnused(projectManager, CHANNEL, [HERO]);
    expect(deleted).toEqual([]);
  });

  it('does nothing without a project', () => {
    deleteFilesOnceUnused(undefined, CHANNEL, [HERO]);
    deleteFilesOnceUnused(projectManager, undefined, [HERO]);
    expect(listeners).toEqual([]);
  });
});
