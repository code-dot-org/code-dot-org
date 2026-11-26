import {ProjectSources} from '@cdo/apps/lab2/types';
import {
  hasNewerPixels,
  holdPixels,
  makeSourcesPreparer,
  resetHeldPixels,
  uploadsWithSave,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/pendingUploads';

const image = (props: Record<string, unknown>) => ({
  name: 'Sprite 1',
  frameSize: {x: 8, y: 8},
  frameCount: 1,
  looping: true,
  frameDelay: 2,
  ...props,
});

const sourcesWith = (propsByKey: Record<string, Record<string, unknown>>) =>
  ({
    source: 'code',
    animations: {orderedKeys: Object.keys(propsByKey), propsByKey},
  } as unknown as ProjectSources);

const saved = (sources: ProjectSources, key: string) =>
  (
    sources as unknown as {
      animations: {propsByKey: Record<string, Record<string, unknown>>};
    }
  ).animations.propsByKey[key];

describe('pendingUploads', () => {
  let now = 1795593000000;
  beforeEach(() => {
    resetHeldPixels();
    jest.spyOn(Date, 'now').mockImplementation(() => (now += 1));
  });
  afterEach(() => jest.restoreAllMocks());

  const setup = (
    upload = jest.fn(async (name: string) => `/v3/assets/chan/${name}`)
  ) => {
    const onUploaded = jest.fn();
    const prepare = makeSourcesPreparer({
      channelId: 'chan',
      upload,
      onUploaded,
    });
    return {prepare, upload, onUploaded};
  };

  it('has a project upload drawings with its saves once it has a preparer', () => {
    expect(uploadsWithSave('chan')).toBe(false);
    setup();
    expect(uploadsWithSave('chan')).toBe(true);
    expect(uploadsWithSave('other')).toBe(false);
    expect(uploadsWithSave(undefined)).toBe(false);
  });

  it('returns sources with no marked image as they are', async () => {
    const {prepare, upload} = setup();
    const sources = sourcesWith({
      k1: image({sourceUrl: '/v3/assets/chan/a.png'}),
    });
    expect(await prepare(sources)).toBe(sources);
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads a marked image's held pixels to a new file on its first drawing", async () => {
    const {prepare, upload, onUploaded} = setup();
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    const previous = '/v3/assets/chan/generated-1.png';
    const result = await prepare(
      sourcesWith({
        k1: image({sourceUrl: previous, edited: true, pendingUpload: true}),
        k2: image({name: 'Other', sourceUrl: '/v3/assets/chan/b.png'}),
      })
    );
    expect(upload).toHaveBeenCalledTimes(1);
    const name = upload.mock.calls[0][0];
    expect(name).toMatch(/^sprite_1_\d{13}\.png$/);
    const url = saved(result, 'k1').sourceUrl as string;
    expect(url).toMatch(new RegExp(`^/v3/assets/chan/${name}\\?t=\\d+$`));
    expect(saved(result, 'k1')).not.toHaveProperty('pendingUpload');
    expect(saved(result, 'k2').sourceUrl).toBe('/v3/assets/chan/b.png');
    expect(onUploaded).toHaveBeenCalledWith(
      'k1',
      url,
      expect.any(Number),
      previous
    );
    // The pixels are uploaded; nothing is held for the next save.
    expect(await prepare(result)).toBe(result);
  });

  it("overwrites a drawing's own file", async () => {
    const {prepare, upload} = setup();
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    await prepare(
      sourcesWith({
        k1: image({
          sourceUrl: '/v3/assets/chan/sprite_1_1795593000001.png?t=5',
          edited: true,
          pendingUpload: true,
        }),
      })
    );
    expect(upload.mock.calls[0][0]).toBe('sprite_1_1795593000001.png');
  });

  it('keeps the field order of the image list, so equal sources compare equal', async () => {
    const {prepare} = setup();
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    const result = await prepare(
      sourcesWith({k1: image({edited: true, pendingUpload: true})})
    );
    expect(Object.keys(saved(result, 'k1'))[1]).toBe('sourceUrl');
  });

  it('fails on a failed upload and keeps the pixels for the next save', async () => {
    const upload = jest
      .fn()
      .mockRejectedValueOnce(new Error('upload failed'))
      .mockImplementation(async (name: string) => `/v3/assets/chan/${name}`);
    const {prepare, onUploaded} = setup(upload);
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    const sources = sourcesWith({
      k1: image({
        sourceUrl: '/v3/assets/chan/a.png',
        edited: true,
        pendingUpload: true,
      }),
    });
    await expect(prepare(sources)).rejects.toThrow('upload failed');
    expect(onUploaded).not.toHaveBeenCalled();
    await prepare(sources);
    expect(upload).toHaveBeenCalledTimes(2);
    expect(onUploaded).toHaveBeenCalledTimes(1);
  });

  it('keeps pixels drawn while the upload ran for the next save', async () => {
    let finish: (url: string) => void = () => undefined;
    const upload = jest.fn(
      (name: string) => new Promise<string>(resolve => (finish = resolve))
    );
    const {prepare, onUploaded} = setup(upload);
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    const done = prepare(
      sourcesWith({k1: image({edited: true, pendingUpload: true})})
    );
    holdPixels('chan', 'k1', 'data:image/png;base64,BB');
    finish('/v3/assets/chan/sprite_1_1.png');
    await done;
    const revision = onUploaded.mock.calls[0][2] as number;
    expect(hasNewerPixels('chan', 'k1', revision)).toBe(true);
  });

  it('drops the mark on an image with no held pixels', async () => {
    const {prepare, upload} = setup();
    const result = await prepare(
      sourcesWith({
        k1: image({sourceUrl: '/v3/assets/chan/a.png', pendingUpload: true}),
      })
    );
    expect(upload).not.toHaveBeenCalled();
    expect(saved(result, 'k1')).toEqual(
      image({sourceUrl: '/v3/assets/chan/a.png'})
    );
  });
});
