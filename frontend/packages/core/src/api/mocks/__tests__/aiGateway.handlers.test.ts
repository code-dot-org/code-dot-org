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
  clearMockFixtures,
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
