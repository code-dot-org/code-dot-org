import {beforeEach, describe, expect, it, vi} from 'vitest';

import {DashboardApiClient} from '@code-dot-org/core/api';

import {
  checkGeneratedImageSafety,
  getImageModerationStatus,
  isImageSafe,
  isTextSafe,
} from '../safety';

vi.mock('@code-dot-org/core/api', async importOriginal => ({
  ...(await importOriginal<object>()),
  DashboardApiClient: {
    aiGateway: {generateText: vi.fn()},
    images: {moderate: vi.fn()},
  },
}));
const generateText = vi.mocked(DashboardApiClient.aiGateway.generateText);
const moderate = vi.mocked(DashboardApiClient.images.moderate);

const judged = (classification: unknown) =>
  ({
    text: '',
    finishReason: 'stop',
    files: [],
    output: {classification},
  }) as Awaited<ReturnType<typeof generateText>>;
const moderated = (severity: number) => ({
  categoriesAnalysis: [{category: 'Violence' as const, severity}],
});
const image = {
  base64: 'AQID',
  mediaType: 'image/png',
  uint8Array: new Uint8Array([1, 2, 3]),
};

beforeEach(() => {
  generateText.mockReset();
  moderate.mockReset();
});

describe('isTextSafe', () => {
  it('asks the judge for a classification of the text', async () => {
    generateText.mockResolvedValue(judged('OK'));
    expect(await isTextSafe('a happy dog', 'input_filter')).toBe(true);
    const [options, extra] = generateText.mock.calls[0];
    expect(options.model).toBe('gemini-2.5-flash');
    expect(options.prompt).toMatch(
      /Here is the text to classify: a happy dog$/,
    );
    expect(options.output?.schema).toMatchObject({
      properties: {classification: {enum: ['OK', 'INAPPROPRIATE']}},
    });
    expect(extra).toEqual({phase: 'input_filter'});
  });

  it('fails text judged inappropriate, and throws on anything else', async () => {
    generateText.mockResolvedValue(judged('INAPPROPRIATE'));
    expect(await isTextSafe('x')).toBe(false);
    generateText.mockResolvedValue(judged('maybe'));
    await expect(isTextSafe('x')).rejects.toThrow(/classification/);
  });
});

describe('isImageSafe', () => {
  it('shows the judge the image', async () => {
    generateText.mockResolvedValue(judged('OK'));
    expect(await isImageSafe(image)).toBe(true);
    const [options, extra] = generateText.mock.calls[0];
    expect(options.messages?.[0].content).toContainEqual({
      type: 'file',
      data: 'AQID',
      mediaType: 'image/png',
    });
    expect(extra).toEqual({phase: 'llm_safety_judge'});
  });
});

describe('getImageModerationStatus', () => {
  it('blocks violence from severity 2', async () => {
    moderate.mockResolvedValue(moderated(0));
    expect(await getImageModerationStatus(image)).toBe('safe');
    moderate.mockResolvedValue(moderated(2));
    expect(await getImageModerationStatus(image)).toBe('flagged');
  });

  it('cannot say for an unsupported type or a failed call', async () => {
    expect(
      await getImageModerationStatus({...image, mediaType: 'image/tiff'}),
    ).toBe('error');
    expect(moderate).not.toHaveBeenCalled();
    moderate.mockRejectedValue(new Error('500'));
    expect(await getImageModerationStatus(image)).toBe('error');
  });
});

describe('checkGeneratedImageSafety', () => {
  it('runs the judge only when asked', async () => {
    moderate.mockResolvedValue(moderated(0));
    generateText.mockResolvedValue(judged('INAPPROPRIATE'));
    expect(
      await checkGeneratedImageSafety(image, {runLlmJudge: false}),
    ).toEqual({
      moderation: 'safe',
      judge: 'skipped',
    });
    expect(await checkGeneratedImageSafety(image, {runLlmJudge: true})).toEqual(
      {
        moderation: 'safe',
        judge: 'flagged',
      },
    );
  });

  it('reports a judge that fails as an error', async () => {
    moderate.mockResolvedValue(moderated(0));
    generateText.mockRejectedValue(new Error('gateway down'));
    expect(await checkGeneratedImageSafety(image, {runLlmJudge: true})).toEqual(
      {
        moderation: 'safe',
        judge: 'error',
      },
    );
  });
});
