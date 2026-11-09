/**
 * The V3 generateText response carries the worker's moderation outcome in
 * finishReason, rawFinishReason and providerMetadata.aiGateway. One case per
 * row of the Outcomes table in the "AI Gateway safety checks" design doc.
 */

import {
  GatewayGenerateTextResponseV2Schema,
  GatewayGenerateTextResponseV3Schema,
} from '@cdo/apps/aiGateway/contract/gatewaySchemas';

const response = {
  id: 'r1',
  timestamp: '2026-10-28T00:00:00.000Z',
  modelId: 'm',
};

const outcomes = {
  passed: {
    text: 'Hello!',
    finishReason: 'stop',
    rawFinishReason: 'STOP',
    providerMetadata: {
      aiGateway: {
        moderation: {
          input_text: 'ok',
          output_text: 'ok',
          output_image: {
            azure_moderation: {
              verdict: 'ok',
              categories: {Hate: 0, SelfHarm: 0, Sexual: 0, Violence: 2},
            },
            llm_judge: 'ok',
          },
        },
      },
      google: {usageMetadata: {thoughtsTokenCount: 12}},
    },
    response,
  },
  inputFlagged: {
    finishReason: 'content-filter',
    rawFinishReason: 'input_filter',
    providerMetadata: {aiGateway: {moderation: {input_text: 'flagged'}}},
  },
  outputTextFlagged: {
    finishReason: 'content-filter',
    rawFinishReason: 'output_filter',
    providerMetadata: {
      aiGateway: {moderation: {input_text: 'ok', output_text: 'flagged'}},
    },
  },
  imageFlagged: {
    finishReason: 'content-filter',
    rawFinishReason: 'image_filter',
    providerMetadata: {
      aiGateway: {
        moderation: {
          input_text: 'ok',
          output_text: 'ok',
          output_image: {
            azure_moderation: {
              verdict: 'flagged',
              categories: {Hate: 0, SelfHarm: 0, Sexual: 4, Violence: 6},
            },
            llm_judge: 'ok',
          },
        },
      },
    },
  },
  providerBlocked: {
    finishReason: 'content-filter',
    rawFinishReason: 'provider_filter',
    providerMetadata: {
      aiGateway: {
        providerReason: 'PROHIBITED_CONTENT',
        providerMessage: 'The response was blocked.',
      },
    },
  },
  inputCheckErrored: {
    finishReason: 'error',
    rawFinishReason: 'input_filter_error',
    providerMetadata: {aiGateway: {moderation: {input_text: 'error'}}},
  },
  outputCheckErrored: {
    finishReason: 'error',
    rawFinishReason: 'output_filter_error',
    providerMetadata: {
      aiGateway: {
        moderation: {
          input_text: 'ok',
          output_text: 'ok',
          output_image: {azure_moderation: {verdict: 'error'}, llm_judge: 'ok'},
        },
      },
    },
  },
};

describe('GatewayGenerateTextResponseV3Schema', () => {
  Object.entries(outcomes).forEach(([name, body]) => {
    it(`parses the ${name} outcome unchanged`, () => {
      expect(GatewayGenerateTextResponseV3Schema.parse(body)).toEqual(body);
    });
  });

  it('parses a V2 response, which carries none of the new fields', () => {
    const v2 = GatewayGenerateTextResponseV2Schema.parse({
      text: 'Hello!',
      finishReason: 'stop',
      usage: {inputTokens: 3, outputTokens: 2, totalTokens: 5},
      response,
      responseSignature: 'a.b.c',
    });
    expect(GatewayGenerateTextResponseV3Schema.parse(v2)).toEqual(v2);
  });

  it('parses a V1 content-filter response with text withheld', () => {
    const v1 = {finishReason: 'content-filter', response};
    expect(GatewayGenerateTextResponseV3Schema.parse(v1)).toEqual(v1);
  });

  it('rejects an unknown verdict', () => {
    const result = GatewayGenerateTextResponseV3Schema.safeParse({
      finishReason: 'content-filter',
      rawFinishReason: 'input_filter',
      providerMetadata: {aiGateway: {moderation: {input_text: 'unsafe'}}},
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown image verdict', () => {
    const result = GatewayGenerateTextResponseV3Schema.safeParse({
      finishReason: 'content-filter',
      providerMetadata: {
        aiGateway: {
          moderation: {output_image: {azure_moderation: {verdict: 'safe'}}},
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a severity Azure does not report', () => {
    const result = GatewayGenerateTextResponseV3Schema.safeParse({
      finishReason: 'content-filter',
      rawFinishReason: 'image_filter',
      providerMetadata: {
        aiGateway: {
          moderation: {
            output_image: {
              azure_moderation: {verdict: 'flagged', categories: {Sexual: 3}},
            },
          },
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an azure_moderation entry with no verdict', () => {
    const result = GatewayGenerateTextResponseV3Schema.safeParse({
      finishReason: 'stop',
      providerMetadata: {
        aiGateway: {
          moderation: {output_image: {azure_moderation: {categories: {}}}},
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
