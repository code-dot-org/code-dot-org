import {describe, expect, it} from 'vitest';

import {CurrentGatewayGenerateTextResponseSchema} from '../../contract/gatewaySchemas';
import {gatewayResponse, geminiRequest} from '../gemini';

describe('geminiRequest', () => {
  it('turns messages, a system prompt and images into Gemini contents', () => {
    expect(
      geminiRequest({
        model: 'gemini-x',
        token: 'dropped',
        system: 'Be brief.',
        messages: [
          {role: 'system', content: 'Be kind.'},
          {
            role: 'user',
            content: [
              {type: 'image', image: 'data:image/jpeg;base64,AAAA'},
              {type: 'text', text: 'Draw this.'},
            ],
          },
          {role: 'assistant', content: 'OK.'},
        ],
        temperature: 0.5,
        seed: 7,
      }),
    ).toEqual({
      contents: [
        {
          role: 'user',
          parts: [
            {inlineData: {mimeType: 'image/jpeg', data: 'AAAA'}},
            {text: 'Draw this.'},
          ],
        },
        {role: 'model', parts: [{text: 'OK.'}]},
      ],
      systemInstruction: {parts: [{text: 'Be brief.\n\nBe kind.'}]},
      generationConfig: {temperature: 0.5, seed: 7},
    });
  });

  it('asks for an image when the image config says so', () => {
    const imageConfig = {aspectRatio: '1:1', imageSize: '1K'};
    expect(
      geminiRequest({
        model: 'gemini-image',
        prompt: 'a bear',
        providerOptions: {google: {imageConfig}},
      }),
    ).toMatchObject({
      contents: [{role: 'user', parts: [{text: 'a bear'}]}],
      generationConfig: {imageConfig, responseModalities: ['TEXT', 'IMAGE']},
    });
  });

  it('asks for JSON in the requested shape', () => {
    const schema = {type: 'object', properties: {ok: {type: 'boolean'}}};
    expect(
      geminiRequest({
        model: 'gemini-x',
        prompt: 'ok?',
        output: {type: 'object', schema},
      }),
    ).toMatchObject({
      generationConfig: {
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
      },
    });
  });
});

describe('gatewayResponse', () => {
  const reply = {
    candidates: [
      {
        content: {
          parts: [
            {text: 'thinking…', thought: true},
            {text: '{"ok":'},
            {text: 'true}'},
            {inlineData: {mimeType: 'image/png', data: 'AQID'}},
          ],
        },
        finishReason: 'STOP',
      },
    ],
    usageMetadata: {
      promptTokenCount: 3,
      candidatesTokenCount: 4,
      totalTokenCount: 7,
    },
    responseId: 'r1',
    modelVersion: 'gemini-x-001',
  };

  it("answers in the gateway's shape, without the model's thoughts", () => {
    const response = gatewayResponse(
      {model: 'gemini-x', output: {type: 'object'}},
      reply,
    );
    expect(
      CurrentGatewayGenerateTextResponseSchema.parse(response),
    ).toMatchObject({
      text: '{"ok":true}',
      finishReason: 'stop',
      output: {ok: true},
      files: [{mediaType: 'image/png', base64: 'AQID'}],
      usage: {inputTokens: 3, outputTokens: 4, totalTokens: 7},
      response: {id: 'r1', modelId: 'gemini-x-001'},
    });
  });

  it('names a blocked reply as the AI SDK does', () => {
    expect(
      gatewayResponse(
        {model: 'gemini-x'},
        {candidates: [{finishReason: 'IMAGE_SAFETY'}]},
      ),
    ).toMatchObject({text: '', finishReason: 'content-filter'});
  });
});
