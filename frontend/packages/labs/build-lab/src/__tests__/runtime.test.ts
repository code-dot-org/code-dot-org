import {describe, expect, it} from 'vitest';

import {executeBlockChain, moveWithArrowKeys} from '../runtime';

const screens = [
  {id: 'screen1', name: 'Screen 1'},
  {id: 'screen2', name: 'Screen 2'},
];

describe('Build Lab Blockly runtime', () => {
  it('executes text, screen, and sprite blocks in order', () => {
    const result = executeBlockChain(
      {
        fields: {ELEMENT: 'label1', TEXT: 'Ready'},
        id: 'set-text',
        next: {
          block: {
            fields: {SCREEN: 'screen2'},
            id: 'show-screen',
            next: {
              block: {
                fields: {ASSET: 'wave', X: 203, Y: 198},
                id: 'create-wave',
                type: 'buildlab_create_sprite',
              },
            },
            type: 'buildlab_show_screen',
          },
        },
        type: 'buildlab_set_text',
      },
      {
        elements: [
          {
            id: 'label1',
            kind: 'label',
            label: 'Waiting',
            screenId: 'screen1',
            x: 0,
            y: 0,
          },
        ],
        screenId: 'screen1',
      },
      screens,
      'orbit',
    );

    expect(result.screenId).toBe('screen2');
    expect(result.elements[0].label).toBe('Ready');
    expect(result.elements[1]).toMatchObject({
      assetId: 'wave',
      screenId: 'screen2',
      x: 205,
      y: 200,
    });
  });

  it('falls back to the runtime costume when a sprite block has no asset', () => {
    const result = executeBlockChain(
      {
        fields: {X: 200, Y: 200},
        id: 'create-default',
        type: 'buildlab_create_sprite',
      },
      {elements: [], screenId: 'screen1'},
      screens,
      'orbit',
    );

    expect(result.elements[0].assetId).toBe('orbit');
  });

  it('moves and hides an element', () => {
    const result = executeBlockChain(
      {
        fields: {ELEMENT: 'sprite1', X: 203, Y: 198},
        id: 'move-sprite',
        next: {
          block: {
            fields: {ELEMENT: 'sprite1', VISIBLE: 'false'},
            id: 'hide-sprite',
            type: 'buildlab_set_visible',
          },
        },
        type: 'buildlab_set_position',
      },
      {
        elements: [
          {
            assetId: 'orbit',
            id: 'sprite1',
            kind: 'sprite',
            label: 'Orbit',
            screenId: 'screen1',
            x: 0,
            y: 0,
          },
        ],
        screenId: 'screen1',
      },
      screens,
    );

    expect(result.elements[0]).toMatchObject({
      visible: false,
      x: 205,
      y: 200,
    });
  });

  it('registers arrow movement and moves only the targeted sprite', () => {
    const setup = executeBlockChain(
      {
        fields: {SPRITE: 'sprite1', SPEED: 7},
        id: 'arrow-movement',
        type: 'buildlab_move_with_arrow_keys',
      },
      {
        elements: [
          {
            assetId: 'bear',
            id: 'sprite1',
            kind: 'sprite',
            label: 'Bear',
            screenId: 'screen1',
            x: 20,
            y: 20,
          },
          {
            id: 'label1',
            kind: 'label',
            label: 'Score',
            screenId: 'screen1',
            x: 0,
            y: 0,
          },
        ],
        screenId: 'screen1',
      },
      screens,
    );

    const result = moveWithArrowKeys(setup, new Set(['ArrowUp', 'ArrowRight']));

    expect(result.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: 'sprite1', x: 27, y: 13}),
        expect.objectContaining({id: 'label1', x: 0, y: 0}),
      ]),
    );
  });

  it('clamps arrow movement to the stage bounds', () => {
    const result = moveWithArrowKeys(
      {
        elements: [
          {
            id: 'sprite1',
            kind: 'sprite',
            label: 'Bear',
            screenId: 'screen1',
            x: 0,
            y: 0,
          },
        ],
        keyboardMovements: [{elementId: 'sprite1', speed: 8}],
        screenId: 'screen1',
      },
      new Set(['ArrowLeft', 'ArrowUp']),
    );

    expect(result.elements[0]).toMatchObject({x: 0, y: 0});
  });

  it('queues a model prediction for the runtime event handler', () => {
    const result = executeBlockChain(
      {
        fields: {MODEL: 'model-1', RESULT: 'prediction-label'},
        id: 'predict-model',
        type: 'buildlab_predict_model',
      },
      {elements: [], screenId: 'screen1'},
      screens,
    );

    expect(result.pendingPrediction).toEqual({
      modelId: 'model-1',
      resultElementId: 'prediction-label',
    });
  });

  it('queues a generative AI request for the runtime event handler', () => {
    const result = executeBlockChain(
      {
        fields: {
          PROMPT: 'Write a short welcome message',
          RESULT: 'welcome-label',
        },
        id: 'generate-text',
        type: 'buildlab_generate_text',
      },
      {elements: [], screenId: 'screen1'},
      screens,
    );

    expect(result.pendingGeneration).toEqual({
      prompt: 'Write a short welcome message',
      resultElementId: 'welcome-label',
    });
  });
});
