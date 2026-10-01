// The mock gateway, driven through the real transport and client.
import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest';

import {createAiGatewayApi} from '../../aiGateway';
import {createImagesApi, imageModerationVerdict} from '../../dashboard/images';
import {createKyTransport} from '../../transports/kyTransport';
import {
  AI_GATEWAY_MOCK_PATH,
  CANNED_IMAGE_PNG_BASE64,
  CANNED_TEXT,
  clearActiveScenario,
  cannedImageFor,
  clearMockFixtures,
  registerLabFixtures,
  registerMockFixture,
  setActiveScenario,
} from '../index';
import {mockServer} from '../server';

beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => {
  mockServer.resetHandlers();
  clearMockFixtures();
  clearActiveScenario();
});
afterAll(() => mockServer.close());

const gateway = () =>
  createAiGatewayApi(createKyTransport({baseUrl: 'https://studio.code.org'}));

describe('the mock AI gateway', () => {
  it('answers text with a canned sentence', async () => {
    const result = await gateway().generateText({
      model: 'gemini-2.5-flash',
      prompt: 'hello',
    });
    expect(result.text).toBe(CANNED_TEXT);
  });

  it('answers structured output with the first value the schema admits', async () => {
    const result = await gateway().generateText(
      {
        model: 'gemini-2.5-flash',
        prompt: 'is this ok?',
        output: {
          type: 'object',
          schema: {
            type: 'object',
            properties: {
              classification: {type: 'string', enum: ['OK', 'INAPPROPRIATE']},
            },
          },
        },
      },
      {phase: 'input_filter'},
    );
    expect(result.output).toEqual({classification: 'OK'});
  });

  it('answers an image request with the prepared image', async () => {
    const result = await gateway().generateText({
      model: 'gemini-3.1-flash-image',
      prompt: 'a bear',
      providerOptions: {google: {imageConfig: {aspectRatio: '1:1'}}},
    });
    expect(result.files).toHaveLength(1);
    expect(result.files[0].base64).toBe(CANNED_IMAGE_PNG_BASE64);
    // The PNG signature.
    expect(Array.from(result.files[0].uint8Array.slice(1, 4))).toEqual([
      0x50, 0x4e, 0x47,
    ]);
  });

  it("serves a scenario's own response ahead of the canned one", async () => {
    registerMockFixture({labKey: 'demo', tag: 'a'}, [
      {
        method: 'post',
        path: AI_GATEWAY_MOCK_PATH,
        respond: {text: 'from the scenario', finishReason: 'stop'},
      },
    ]);
    setActiveScenario({labKey: 'demo', tag: 'a'});
    const result = await gateway().generateText({model: 'm', prompt: 'x'});
    expect(result.text).toBe('from the scenario');
  });

  it("draws the active fixture's first matching image", async () => {
    registerLabFixtures('demo', {
      a: {
        aiImages: [
          {match: /castle/, image: 'data:image/png;base64,Q0FTVExF'},
          {match: /scenery/, image: 'data:image/png;base64,U0NFTkVSWQ=='},
        ],
      },
    });
    setActiveScenario({labKey: 'demo', tag: 'a'});
    const draw = async (prompt: string) =>
      (
        await gateway().generateText({
          model: 'gemini-3.1-flash-image',
          messages: [{role: 'user', content: prompt}],
          providerOptions: {google: {imageConfig: {aspectRatio: '1:1'}}},
        })
      ).files[0].base64;
    expect(await draw('a castle. scenery only')).toBe('Q0FTVExF');
    expect(await draw('a meadow. scenery only')).toBe('U0NFTkVSWQ==');
    expect(await draw('a bear')).toBe(CANNED_IMAGE_PNG_BASE64);
  });
});

describe('cannedImageFor', () => {
  const edit = {
    messages: [
      {
        role: 'user',
        content: [
          {type: 'image', image: 'data:image/jpeg;base64,QkFTRQ=='},
          {type: 'text', text: 'Modify the provided image: wave'},
        ],
      },
    ],
  };

  it('answers an edit with the image it edits', () => {
    expect(cannedImageFor(edit)).toEqual({
      mediaType: 'image/jpeg',
      base64: 'QkFTRQ==',
    });
  });

  it('lets a rule answer an edit, testing every text part', () => {
    const rules = [
      {
        match: (prompt: string) => prompt.startsWith('Modify'),
        image: 'data:image/png;base64,V0FWRQ==',
      },
    ];
    expect(cannedImageFor(edit, rules).base64).toBe('V0FWRQ==');
  });

  it('skips a rule whose image is not a data URL', () => {
    const rules = [{match: /bear/, image: '/bear.png'}];
    expect(cannedImageFor({prompt: 'a bear'}, rules).base64).toBe(
      CANNED_IMAGE_PNG_BASE64,
    );
  });
});

describe('the mock moderation endpoint', () => {
  it('passes every image through moderation', async () => {
    const images = createImagesApi(
      createKyTransport({baseUrl: 'https://studio.code.org'}),
    );
    const result = await images.moderate({
      image: new Blob(['png'], {type: 'image/png'}),
    });
    expect(imageModerationVerdict(result)).toBe('safe');
  });
});
