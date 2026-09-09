import {
  DEFAULT_IMAGE_MODEL_ID,
  getImageModel,
  getImageModelSpec,
  IMAGE_MODEL_IDS,
  IMAGE_MODEL_SPECS,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {AiImageModelIds} from '@cdo/generated-scripts/sharedConstants';

describe('image model registry', () => {
  // shared_constants.rb decides which ids exist and the worker's allowlist
  // decides which it will serve; this registry decides what the dialog does
  // with them. The first two live in other repos or other languages, so the
  // only drift a test here can catch is between this file and the constants.
  it('has a spec for every image model the constants declare', () => {
    for (const id of AiImageModelIds) {
      expect(IMAGE_MODEL_SPECS[id]).toBeDefined();
      expect(IMAGE_MODEL_SPECS[id].transport).toBe('generateImage');
    }
  });

  it('declares no image-transport model the constants do not know', () => {
    const known = new Set<string>(AiImageModelIds);
    const offered = Object.values(IMAGE_MODEL_SPECS)
      .filter(spec => spec.transport === 'generateImage')
      .map(spec => spec.id);
    expect(offered.filter(id => !known.has(id))).toEqual([]);
  });

  it('can describe everything it offers, default included', () => {
    for (const id of [...IMAGE_MODEL_IDS, DEFAULT_IMAGE_MODEL_ID]) {
      expect(IMAGE_MODEL_SPECS[id]?.id).toBe(id);
    }
  });

  it('falls back to the default for an id no longer offered', () => {
    // An old project can name a model we have since dropped.
    expect(getImageModelSpec('gpt-image-0').id).toBe(DEFAULT_IMAGE_MODEL_ID);
    expect(getImageModelSpec(undefined).id).toBe(DEFAULT_IMAGE_MODEL_ID);
  });

  // The gateway takes a bare id for the image route, which is what keeps the
  // OpenAI provider package out of the apps bundle entirely; only the worker
  // constructs one. A regression here would pull it back in.
  it('hands the image route a bare id and the text route a model object', () => {
    for (const id of AiImageModelIds) {
      expect(getImageModel(id)).toBe(id);
    }
    const geminiId = DEFAULT_IMAGE_MODEL_ID;
    expect(typeof getImageModel(geminiId)).not.toBe('string');
  });
});
